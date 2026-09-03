const { setGlobalOptions } = require("firebase-functions");
const { onRequest, onCall, HttpsError } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const cors = require("cors")({ origin: true });

if (!admin.apps.length) {
    admin.initializeApp();
}

const db = admin.firestore();

setGlobalOptions({ maxInstances: 10 });

/**
 * 1. Cloud Function HTTPS Endpoint: claimInvitation (Paso 1.3)
 * Soporta solicitudes HTTP POST con CORS para ser invocada vía fetch desde el frontend.
 */
exports.claimInvitation = onRequest(async (request, response) => {
    cors(request, response, async () => {
        try {
            if (request.method !== 'POST') {
                response.status(405).json({ error: 'Method not allowed' });
                return;
            }

            const { code, userId } = request.body;

            if (!code || !userId) {
                response.status(400).json({ error: 'Faltan campos: code y userId son requeridos' });
                return;
            }

            const cleanCode = code.trim().toUpperCase();

            // 1. Buscar el código de invitación activo
            const codesSnapshot = await db.collection('invitation_codes')
                .where('code', '==', cleanCode)
                .where('isActive', '==', true)
                .limit(1)
                .get();

            if (codesSnapshot.empty) {
                response.status(404).json({ error: 'Código de invitación no válido o expirado' });
                return;
            }

            const codeDoc = codesSnapshot.docs[0];
            const codeData = codeDoc.data();

            // 2. Verificar que no se haya excedido el límite de usos
            if (codeData.maxUses && codeData.usedCount >= codeData.maxUses) {
                response.status(400).json({ error: 'Código de invitación agotado' });
                return;
            }

            // 3. Actualizar el perfil del usuario con Admin SDK (se salta restricciones de cliente)
            const userRef = db.collection('users').doc(userId);
            const userDoc = await userRef.get();

            if (!userDoc.exists) {
                response.status(404).json({ error: 'Usuario no encontrado en la base de datos' });
                return;
            }

            await userRef.update({
                role: codeData.role || 'teacher',
                schoolId: codeData.schoolId,
                schoolName: codeData.schoolName || '',
                redeemedCode: cleanCode,
                updatedAt: new Date().toISOString()
            });

            // 4. Incrementar el contador de usos del código
            await codeDoc.ref.update({
                usedCount: (codeData.usedCount || 0) + 1
            });

            response.status(200).json({
                success: true,
                message: `Bienvenido a ${codeData.schoolName || 'tu institución'}`,
                role: codeData.role || 'teacher',
                schoolId: codeData.schoolId
            });

        } catch (error) {
            console.error('Error en claimInvitation:', error);
            response.status(500).json({ error: 'Error interno del servidor' });
        }
    });
});

/**
 * 2. Cloud Function Callable: redeemInvitationCode
 * Alternativa nativa para invocar con httpsCallable desde el SDK de Firebase.
 */
exports.redeemInvitationCode = onCall(async (request) => {
    if (!request.auth) {
        throw new HttpsError(
            "unauthenticated",
            "Debes iniciar sesión para canjear un código de invitación."
        );
    }

    const uid = request.auth.uid;
    const { code } = request.data;

    if (!code || typeof code !== "string" || !code.trim()) {
        throw new HttpsError(
            "invalid-argument",
            "Por favor ingresa un código de invitación válido."
        );
    }

    const cleanCode = code.trim().toUpperCase();

    const codesQuery = await db
        .collection("invitation_codes")
        .where("code", "==", cleanCode)
        .where("isActive", "==", true)
        .limit(1)
        .get();

    if (codesQuery.empty) {
        throw new HttpsError(
            "not-found",
            "El código de invitación no existe o ha sido desactivado."
        );
    }

    const codeDoc = codesQuery.docs[0];
    const codeData = codeDoc.data();

    if (codeData.maxUses && codeData.usedCount >= codeData.maxUses) {
        throw new HttpsError(
            "resource-exhausted",
            "Este código de invitación ha alcanzado su límite máximo de usos."
        );
    }

    const userRef = db.collection("users").doc(uid);

    await db.runTransaction(async (transaction) => {
        transaction.update(codeDoc.ref, {
            usedCount: (codeData.usedCount || 0) + 1
        });

        transaction.set(
            userRef,
            {
                role: codeData.role || "teacher",
                schoolId: codeData.schoolId,
                schoolName: codeData.schoolName || "",
                redeemedCode: cleanCode,
                updatedAt: new Date().toISOString()
            },
            { merge: true }
        );
    });

    return {
        success: true,
        role: codeData.role || "teacher",
        schoolId: codeData.schoolId,
        schoolName: codeData.schoolName || ""
    };
});
