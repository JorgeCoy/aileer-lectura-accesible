import { describe, it, beforeAll, beforeEach, afterAll } from 'vitest';
import {
    initializeTestEnvironment,
    assertSucceeds,
    assertFails
} from '@firebase/rules-unit-testing';
import fs from 'fs';
import path from 'path';

let testEnv;

describe('Firestore Security Rules Unit Tests', () => {
    beforeAll(async () => {
        const rulesPath = path.resolve(__dirname, '../../firestore.rules');
        const rules = fs.readFileSync(rulesPath, 'utf8');

        // Configuración con fallback a localhost:8080 si no se detecta la variable de entorno
        const host = process.env.FIRESTORE_EMULATOR_HOST ? process.env.FIRESTORE_EMULATOR_HOST.split(':')[0] : '127.0.0.1';
        const port = process.env.FIRESTORE_EMULATOR_HOST ? parseInt(process.env.FIRESTORE_EMULATOR_HOST.split(':')[1]) : 8080;

        try {
            testEnv = await initializeTestEnvironment({
                projectId: 'aleer-security-test',
                firestore: {
                    host,
                    port,
                    rules
                }
            });
        } catch (err) {
            console.error("Para ejecutar las pruebas de reglas, asegúrate de tener el Emulador de Firestore activo.");
            console.error("Comando: npx firebase emulators:start --only firestore");
            throw err;
        }
    });

    beforeEach(async () => {
        if (testEnv) {
            await testEnv.clearFirestore();
        }
    });

    afterAll(async () => {
        if (testEnv) {
            await testEnv.cleanup();
        }
    });

    // 1. REGISTRO DE USUARIOS Y ELEVACIÓN DE PRIVILEGIOS
    it('Estudiante puede registrar su propio perfil público con rol student', async () => {
        const studentCtx = testEnv.authenticatedContext('student_1');
        const db = studentCtx.firestore();

        await assertSucceeds(
            db.collection('users').doc('student_1').set({
                role: 'student',
                name: 'Juan Perez'
            })
        );
    });

    it('PROHIBIDO: Estudiante NO puede auto-asignarse rol teacher en su registro', async () => {
        const attackerCtx = testEnv.authenticatedContext('attacker_1');
        const db = attackerCtx.firestore();

        await assertFails(
            db.collection('users').doc('attacker_1').set({
                role: 'teacher',
                name: 'Atacante'
            })
        );
    });

    it('PROHIBIDO: Estudiante NO puede auto-asignarse un schoolId en el registro público', async () => {
        const attackerCtx = testEnv.authenticatedContext('attacker_2');
        const db = attackerCtx.firestore();

        await assertFails(
            db.collection('users').doc('attacker_2').set({
                role: 'student',
                schoolId: 'colegio_privado_123'
            })
        );
    });

    // 2. AISLAMIENTO MULTI-TENANT EN PROGRESO LECTOR
    it('Estudiante solo puede leer SU propio progreso y NO el de otro compañero', async () => {
        await testEnv.withSecurityRulesDisabled(async (context) => {
            const db = context.firestore();
            await db.collection('progress').doc('prog_1').set({
                studentId: 'student_1',
                schoolId: 'school_a',
                wpm: 150
            });
        });

        const student1Db = testEnv.authenticatedContext('student_1').firestore();
        const student2Db = testEnv.authenticatedContext('student_2').firestore();

        // Estudiante 1 lee su propio progreso -> ÉXITO
        await assertSucceeds(student1Db.collection('progress').doc('prog_1').get());

        // Estudiante 2 intenta leer el progreso de Estudiante 1 -> FALLA
        await assertFails(student2Db.collection('progress').doc('prog_1').get());
    });

    it('Docente del Colegio A puede leer progreso del Colegio A, pero NO del Colegio B', async () => {
        await testEnv.withSecurityRulesDisabled(async (context) => {
            const db = context.firestore();
            await db.collection('users').doc('teacher_a').set({ role: 'teacher', schoolId: 'school_a' });
            await db.collection('users').doc('teacher_b').set({ role: 'teacher', schoolId: 'school_b' });

            await db.collection('progress').doc('prog_school_a').set({ studentId: 'stu_a', schoolId: 'school_a', wpm: 140 });
            await db.collection('progress').doc('prog_school_b').set({ studentId: 'stu_b', schoolId: 'school_b', wpm: 180 });
        });

        const teacherADb = testEnv.authenticatedContext('teacher_a').firestore();

        // Docente A lee progreso de su propio colegio -> ÉXITO
        await assertSucceeds(teacherADb.collection('progress').doc('prog_school_a').get());

        // Docente A intenta leer progreso del Colegio B -> FALLA
        await assertFails(teacherADb.collection('progress').doc('prog_school_b').get());
    });

    // 3. INYECCIÓN DE CLASES ENTRE COLEGIOS
    it('PROHIBIDO: Docente NO puede crear una clase con schoolId de otro colegio', async () => {
        await testEnv.withSecurityRulesDisabled(async (context) => {
            const db = context.firestore();
            await db.collection('users').doc('teacher_a').set({ role: 'teacher', schoolId: 'school_a' });
        });

        const teacherADb = testEnv.authenticatedContext('teacher_a').firestore();

        // Intenta inyectar una clase con school_b -> FALLA
        await assertFails(
            teacherADb.collection('classes').doc('fake_class').set({
                teacherId: 'teacher_a',
                schoolId: 'school_b',
                name: 'Clase Falsa'
            })
        );
    });

    // 4. DIAGNÓSTICO POR PIN (SUBCOLECCIÓN Y PRIVACIDAD DE PINS)
    it('PROHIBIDO: Usuario no docente NO puede hacer listado masivo (query) de PINs activos', async () => {
        const studentDb = testEnv.authenticatedContext('student_anon').firestore();

        // Intenta listar todas las sesiones activas -> FALLA
        await assertFails(
            studentDb.collection('diagnostic_sessions').where('status', '==', 'active').get()
        );
    });

    it('Estudiante que conoce el PIN puede consultar directamente getDoc() de una sesión activa', async () => {
        await testEnv.withSecurityRulesDisabled(async (context) => {
            const db = context.firestore();
            await db.collection('diagnostic_sessions').doc('583921').set({
                pin: '583921',
                teacherId: 'teacher_a',
                status: 'active'
            });
        });

        const studentDb = testEnv.authenticatedContext('student_anon').firestore();

        // Consulta puntual por ID exacto de PIN activo -> ÉXITO
        await assertSucceeds(
            studentDb.collection('diagnostic_sessions').doc('583921').get()
        );
    });

    it('PROHIBIDO: Estudiante NO puede enviar respuestas a una sesión diagnóstica CERRADA (closed)', async () => {
        await testEnv.withSecurityRulesDisabled(async (context) => {
            const db = context.firestore();
            await db.collection('diagnostic_sessions').doc('999888').set({
                pin: '999888',
                teacherId: 'teacher_a',
                status: 'closed'
            });
        });

        const studentDb = testEnv.authenticatedContext('student_late').firestore();

        // Intento de envío a sesión cerrada -> FALLA
        await assertFails(
            studentDb.collection('diagnostic_sessions').doc('999888').collection('submissions').doc('sub_1').set({
                studentUid: 'student_late',
                wpm: 120
            })
        );
    });
});
