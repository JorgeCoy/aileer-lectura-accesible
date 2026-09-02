import { collection, doc, setDoc, getDoc, getDocs, query, where, updateDoc, arrayUnion, addDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

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
            const progressRef = collection(db, 'progress');
            await addDoc(progressRef, {
                studentId,
                assignmentId,
                classId: classId || progressData?.classId || null,
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
    }
};

export default FirebaseBackendService;
