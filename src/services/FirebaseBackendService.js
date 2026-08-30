import { collection, doc, setDoc, getDoc, getDocs, query, where, updateDoc, arrayUnion, addDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';
import MockBackendService from './MockBackendService';

const FirebaseBackendService = {
    // --- CLASSES (AULAS VIRTUALES) ---
    createClass: async (schoolId, teacherId, classData) => {
        const localClass = MockBackendService.createClass({ ...classData, schoolId, teacherId });
        try {
            const docRef = await addDoc(collection(db, 'classes'), {
                ...classData,
                schoolId,
                teacherId,
                createdAt: new Date().toISOString()
            });
            return { id: docRef.id, ...classData };
        } catch (error) {
            console.warn("Firestore notice (using local fallback for createClass):", error);
            return localClass;
        }
    },

    getTeacherClasses: async (teacherId) => {
        try {
            const q = query(collection(db, 'classes'), where('teacherId', '==', teacherId));
            const querySnapshot = await getDocs(q);
            const fbClasses = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            if (fbClasses.length > 0) return fbClasses;
            return MockBackendService.getClasses();
        } catch (error) {
            console.warn("Firestore notice (using local fallback for getTeacherClasses):", error);
            return MockBackendService.getClasses();
        }
    },

    deleteClass: async (classId) => {
        MockBackendService.deleteClass(classId);
        try {
            await deleteDoc(doc(db, 'classes', classId));
            return true;
        } catch (error) {
            console.warn("Firestore notice (deleted class locally):", error);
            return true;
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
    saveProgress: async (studentId, assignmentId, progressData) => {
        try {
            const progressRef = collection(db, 'progress');
            // Simplificación: crear un nuevo documento cada vez que completan. 
            // En un caso real se buscaría si ya existe para actualizarlo.
            await addDoc(progressRef, {
                studentId,
                assignmentId,
                ...progressData,
                status: 'completed',
                completedAt: new Date().toISOString()
            });
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
        // Obtenemos los assignments de la clase primero
        try {
            const assignmentsQ = query(collection(db, 'assignments'), where('classId', '==', classId));
            const assignmentsSnap = await getDocs(assignmentsQ);
            const assignments = assignmentsSnap.docs.map(doc => doc.id);
            
            if (assignments.length === 0) {
                return { totalAssignments: 0, completedCount: 0, avgWpm: 0 };
            }

            // Para cada assignment buscamos su progreso (en Firestore v9 "in" soporta hasta 10, simplificamos aquí con consultas)
            // Esto es ineficiente en producción real a escala, pero funciona para el demo
            let allProgress = [];
            for (let aId of assignments) {
                const progQ = query(collection(db, 'progress'), where('assignmentId', '==', aId));
                const progSnap = await getDocs(progQ);
                allProgress = [...allProgress, ...progSnap.docs.map(doc => doc.data())];
            }

            const completedCount = allProgress.filter(p => p.status === 'completed').length;
            const totalWpm = allProgress.reduce((sum, p) => sum + (p.wpmAchieved || p.wpm || 0), 0);
            const avgWpm = allProgress.length > 0 ? Math.round(totalWpm / allProgress.length) : 0;

            return {
                totalAssignments: assignments.length,
                completedCount,
                avgWpm
            };
        } catch (error) {
            console.error("Error fetching class progress stats:", error);
            return { totalAssignments: 0, completedCount: 0, avgWpm: 0 };
        }
    }
};

export default FirebaseBackendService;
