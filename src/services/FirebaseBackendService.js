import { collection, doc, setDoc, getDoc, getDocs, query, where, updateDoc, arrayUnion, addDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { signInAnonymously } from 'firebase/auth';
import { httpsCallable } from 'firebase/functions';
import { db, auth, functions } from './firebase';

const FirebaseBackendService = {
    // --- CLASSES (AULAS VIRTUALES) ---
    createClass: async (schoolId, teacherId, classData) => {
        try {
            const docRef = await addDoc(collection(db, 'classes'), {
                ...classData,
                schoolId,
                teacherId,
                createdAt: new Date().toISOString()
            });
            return { id: docRef.id, ...classData };
        } catch (error) {
            console.error("Error creating class in Firestore:", error);
            throw error;
        }
    },

    getTeacherClasses: async (teacherId) => {
        try {
            const q = query(collection(db, 'classes'), where('teacherId', '==', teacherId));
            const querySnapshot = await getDocs(q);
            return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            console.error("Error fetching teacher classes from Firestore:", error);
            return [];
        }
    },

    deleteClass: async (classId) => {
        try {
            await deleteDoc(doc(db, 'classes', classId));
            return true;
        } catch (error) {
            console.error("Error deleting class from Firestore:", error);
            throw error;
        }
    },

    // --- ASSIGNMENTS (TAREAS) ---
    createAssignment: async (classId, teacherId, assignmentData) => {
        try {
            const docRef = await addDoc(collection(db, "assignments"), {
                classId,
                teacherId,
                textId: assignmentData.textId,
                textTitle: assignmentData.textTitle,
                textAuthor: assignmentData.textAuthor,
                dueDate: assignmentData.dueDate || null,
                type: assignmentData.type, // 'practice' o 'evaluation'
                config: assignmentData.config || {},
                evaluation: assignmentData.evaluation,
                status: 'active',
                createdAt: serverTimestamp()
            });
            return { id: docRef.id, ...assignmentData };
        } catch (error) {
            console.error("Error creating assignment:", error);
            throw error;
        }
    },

    getClassAssignments: async (classId) => {
        try {
            const q = query(collection(db, 'assignments'), where('classId', '==', classId));
            const querySnapshot = await getDocs(q);
            return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            console.error("Error fetching class assignments:", error);
            return [];
        }
    },

    getTeacherAssignments: async (teacherId) => {
        try {
            const q = query(collection(db, 'assignments'), where('teacherId', '==', teacherId));
            const querySnapshot = await getDocs(q);
            return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            console.error("Error fetching teacher assignments:", error);
            return [];
        }
    },

    async updateAssignmentConfig(assignmentId, newConfig, newDueDate, newType = 'practice', newEvaluation = { enabled: false, showResultsToStudent: false, questions: [] }) {
        try {
            const assignmentRef = doc(db, "assignments", assignmentId);
            await updateDoc(assignmentRef, {
                config: newConfig,
                dueDate: newDueDate || null,
                type: newType,
                evaluation: newEvaluation,
                updatedAt: serverTimestamp()
            });
            return true;
        } catch (error) {
            console.error("Error updating assignment config:", error);
            return false;
        }
    },

    deleteAssignment: async (assignmentId) => {
        try {
            await deleteDoc(doc(db, 'assignments', assignmentId));
            return true;
        } catch (error) {
            console.error("Error deleting assignment:", error);
            return false;
        }
    },

    // --- PROGRESS (PROGRESO DEL ESTUDIANTE) ---
    saveProgress: async (studentId, assignmentId, progressData, classId = null) => {
        try {
            const progressId = `${studentId}_${assignmentId}`;
            const progressRef = doc(db, 'progress', progressId);
            await setDoc(progressRef, {
                studentId,
                assignmentId,
                classId: classId || progressData?.classId || null,
                ...progressData,
                status: 'completed',
                updatedAt: new Date().toISOString()
            }, { merge: true });
            return true;
        } catch (error) {
            console.error("Error saving progress:", error);
            throw error;
        }
    },

    getAssignmentProgress: async (assignmentId) => {
        try {
            const q = query(collection(db, 'progress'), where('assignmentId', '==', assignmentId));
            const querySnapshot = await getDocs(q);
            return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            console.error("Error fetching progress:", error);
            return [];
        }
    },

    getClassProgress: async (classId) => {
        try {
            // 1. Obtener conteo de asignaciones de la clase
            const assignmentsQ = query(collection(db, 'assignments'), where('classId', '==', classId));
            const assignmentsSnap = await getDocs(assignmentsQ);
            const totalAssignments = assignmentsSnap.size;

            if (totalAssignments === 0) {
                return { totalAssignments: 0, completedCount: 0, avgWpm: 0 };
            }

            // 2. Consulta optimizada O(1): Obtener todo el progreso de la clase en una sola llamada
            const progQ = query(collection(db, 'progress'), where('classId', '==', classId));
            const progSnap = await getDocs(progQ);
            const allProgress = progSnap.docs.map(doc => doc.data());

            const completedCount = allProgress.filter(p => p.status === 'completed').length;
            const totalWpm = allProgress.reduce((sum, p) => sum + (p.wpmAchieved || p.wpm || 0), 0);
            const avgWpm = allProgress.length > 0 ? Math.round(totalWpm / allProgress.length) : 0;

            return {
                totalAssignments,
                completedCount,
                avgWpm
            };
        } catch (error) {
            console.error("Error fetching class progress stats:", error);
            return { totalAssignments: 0, completedCount: 0, avgWpm: 0 };
        }
    },

    // --- B2B CORE: DIAGNÓSTICO POR PIN EXPRÉS DE 3 MINUTOS ---
    createDiagnosticSession: async (teacherId, classId, sessionTitle = 'Diagnóstico Inicial') => {
        try {
            const pin = Math.floor(100000 + Math.random() * 900000).toString();
            // El PIN de 6 dígitos es el ID del documento: permite getDoc() directo O(1) con la regla 'allow get'
            await setDoc(doc(db, 'diagnostic_sessions', pin), {
                pin,
                teacherId,
                classId: classId || 'express',
                sessionTitle,
                status: 'active',
                createdAt: new Date().toISOString()
            });
            return { id: pin, pin, sessionTitle };
        } catch (error) {
            console.error("Error creating diagnostic PIN session:", error);
            throw error;
        }
    },

    getDiagnosticSessionByPin: async (pin) => {
        try {
            // Autenticación Anónima si el usuario no tiene sesión iniciada
            if (!auth.currentUser) {
                await signInAnonymously(auth);
            }

            // Consulta por ID exacto getDoc (Obedece allow get: if status == 'active' sin requerir permiso list)
            const sessionDoc = await getDoc(doc(db, 'diagnostic_sessions', pin.toString()));
            if (!sessionDoc.exists() || sessionDoc.data().status !== 'active') return null;
            return { id: sessionDoc.id, ...sessionDoc.data() };
        } catch (error) {
            console.error("Error fetching diagnostic session by PIN:", error);
            return null;
        }
    },

    submitDiagnosticResult: async (pin, studentName, resultData) => {
        try {
            // Autenticación Anónima garantizada
            if (!auth.currentUser) {
                await signInAnonymously(auth);
            }

            const session = await FirebaseBackendService.getDiagnosticSessionByPin(pin);
            if (!session) throw new Error("Sesión de diagnóstico no encontrada o expirada.");

            // Subcolección independiente por estudiante (Evita condiciones de carrera y colisión entre 300+ alumnos)
            const submissionsRef = collection(db, 'diagnostic_sessions', session.id, 'submissions');
            await addDoc(submissionsRef, {
                studentName,
                studentUid: auth.currentUser ? auth.currentUser.uid : 'anon',
                submittedAt: new Date().toISOString(),
                ...resultData
            });
            return true;
        } catch (error) {
            console.error("Error submitting diagnostic result:", error);
            throw error;
        }
    },

    closeDiagnosticSession: async (sessionId) => {
        try {
            const sessionRef = doc(db, 'diagnostic_sessions', sessionId);
            await updateDoc(sessionRef, {
                status: 'closed',
                closedAt: new Date().toISOString()
            });
            return true;
        } catch (error) {
            console.error("Error closing diagnostic session:", error);
            throw error;
        }
    },

    // --- B2B CORE: RECONCILIACIÓN FREEMIUM A TENANT INSTITUCIONAL ---
    claimSchoolTenant: async (teacherId, schoolId) => {
        try {
            const classesQ = query(collection(db, 'classes'), where('teacherId', '==', teacherId));
            const snap = await getDocs(classesQ);
            const updates = snap.docs.map(docSnap => updateDoc(doc(db, 'classes', docSnap.id), { schoolId }));
            await Promise.all(updates);
            return true;
        } catch (error) {
            console.error("Error claiming school tenant for teacher:", error);
            throw error;
        }
    },

    // --- B2B CORE: CARGA MASIVA DE ESTUDIANTES CSV ---
    batchAddStudentsToClass: async (classId, newStudents) => {
        try {
            const classRef = doc(db, 'classes', classId);
            const classSnap = await getDoc(classRef);
            if (!classSnap.exists()) throw new Error("La clase no existe.");

            const currentStudents = classSnap.data().students || [];
            const updatedStudents = [...currentStudents, ...newStudents];

            await updateDoc(classRef, { students: updatedStudents });
            return updatedStudents;
        } catch (error) {
            console.error("Error batch adding students:", error);
            throw error;
        }
    },

    // --- B2B CORE: CANJE SEGURO DE CÓDIGO DE INVITACIÓN (CLOUD FUNCTION) ---
    redeemInvitationCode: async (code) => {
        try {
            const redeemFn = httpsCallable(functions, 'redeemInvitationCode');
            const result = await redeemFn({ code });
            return result.data;
        } catch (error) {
            console.error("Error al canjear código de invitación:", error);
            throw error;
        }
    }
};

export default FirebaseBackendService;
