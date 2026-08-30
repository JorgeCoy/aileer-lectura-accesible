/**
 * MockBackendService
 * Simulates a cloud database using localStorage for the prototype.
 * Allows sharing data between "Teacher" and "Student" views in the same browser.
 */

const DB_KEYS = {
    CLASSES: 'aleer_db_classes',
    ASSIGNMENTS: 'aleer_db_assignments',
    STUDENTS: 'aleer_db_students',
    ENROLLMENTS: 'aleer_db_enrollments',
    PROGRESS: 'aleer_db_progress',
    LIBRARY: 'aleer_db_library'
};

const MockBackendService = {
    getClasses: () => {
        return JSON.parse(localStorage.getItem(DB_KEYS.CLASSES) || '[]');
    },
    getAssignments: () => {
        return JSON.parse(localStorage.getItem(DB_KEYS.ASSIGNMENTS) || '[]');
    },
    getClassHealth: (classId) => {
        return {
            id: classId,
            name: 'Clase',
            healthScore: 85,
            status: 'good'
        };
    },
    getClassHistory: (classId) => {
        return [];
    },

    // --- PROGRESS ---
    saveProgress: (assignmentId, progressData) => {
        const progressList = JSON.parse(localStorage.getItem(DB_KEYS.PROGRESS) || '[]');

        // Check if entry exists for this assignment (for this user/session)
        // In a real app we'd check studentId too. For now we assume single user session.
        const existingIndex = progressList.findIndex(p => p.assignmentId === assignmentId);

        const newEntry = {
            id: crypto.randomUUID(),
            assignmentId,
            completedAt: new Date().toISOString(),
            status: 'completed',
            wpm: progressData.wpm || 0,
            ...progressData
        };

        if (existingIndex >= 0) {
            progressList[existingIndex] = { ...progressList[existingIndex], ...newEntry };
        } else {
            progressList.push(newEntry);
        }

        localStorage.setItem(DB_KEYS.PROGRESS, JSON.stringify(progressList));
        return true;
    },

    getStudentProgress: (assignmentId) => {
        const progressList = JSON.parse(localStorage.getItem(DB_KEYS.PROGRESS) || '[]');
        return progressList.find(p => p.assignmentId === assignmentId);
    },

    getClassProgress: (classId) => {
        // Get all assignments for this class
        const assignments = MockBackendService.getAssignments().filter(a => a.classId === classId);
        const assignmentIds = assignments.map(a => a.id);

        // Get all progress entries for these assignments
        const progressList = JSON.parse(localStorage.getItem(DB_KEYS.PROGRESS) || '[]');
        const classProgress = progressList.filter(p => assignmentIds.includes(p.assignmentId));

        // Calculate stats
        const totalAssignments = assignments.length;
        const completedCount = classProgress.filter(p => p.status === 'completed').length;

        // Average WPM
        const totalWpm = classProgress.reduce((sum, p) => sum + (p.wpm || 0), 0);
        const avgWpm = classProgress.length > 0 ? Math.round(totalWpm / classProgress.length) : 0;

        return {
            totalAssignments,
            completedCount,
            avgWpm
        };
    },

    // --- DASHBOARD STATS ---
    getStudentGamification: (studentName) => {
        return {
            streak: 0,
            badges: [],
            points: 0,
            level: 1,
            history: []
        };
    },
    getStudentFeedback: (studentName) => {
        return [];
    },
    markFeedbackAsRead: (id) => {
        return true;
    },
    getStudentAssignments: () => {
        return MockBackendService.getAssignments();
    },

    getRecentActivity: (limit = 5) => {
        const progressList = JSON.parse(localStorage.getItem(DB_KEYS.PROGRESS) || '[]');
        const assignments = MockBackendService.getAssignments();
        const classes = MockBackendService.getClasses();

        // Sort by date desc
        const sortedProgress = progressList.sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt));
        const recent = sortedProgress.slice(0, limit);

        return recent.map(p => {
            const assignment = assignments.find(a => a.id === p.assignmentId);
            const cls = assignment ? classes.find(c => c.id === assignment.classId) : null;
            return {
                id: p.id,
                studentName: p.studentName || 'Estudiante',
                action: 'completed',
                target: assignment ? assignment.textTitle : 'Lectura',
                className: cls ? cls.name : 'Clase',
                wpm: p.wpm,
                timestamp: p.completedAt
            };
        });
    },

    getDashboardStats: () => {
        const classes = MockBackendService.getClasses();
        const assignments = MockBackendService.getAssignments();
        const progressList = JSON.parse(localStorage.getItem(DB_KEYS.PROGRESS) || '[]');

        // Active Students (Unique count from enrollments)
        const enrollments = JSON.parse(localStorage.getItem(DB_KEYS.ENROLLMENTS) || '[]');
        const uniqueStudents = new Set(enrollments.map(e => e.studentName)).size;

        // Active Assignments
        const activeAssignments = assignments.filter(a => a.status === 'active').length;

        // Global Avg WPM
        const totalWpm = progressList.reduce((sum, p) => sum + (p.wpm || 0), 0);
        const avgWpm = progressList.length > 0 ? Math.round(totalWpm / progressList.length) : 0;

        return {
            students: uniqueStudents,
            assignments: activeAssignments,
            avgWpm: avgWpm
        };
    },

    // --- INSIGHTS ENGINE (v2) ---
    getInsights: () => {
        const insights = [];
        const progressList = JSON.parse(localStorage.getItem(DB_KEYS.PROGRESS) || '[]');
        const classes = MockBackendService.getClasses();
        const assignments = MockBackendService.getAssignments();

        // 1. Risk Analysis: Students inactive or low performance
        // For mock, we check if completion rate is low for any student in any class
        classes.forEach(cls => {
            if (!cls.students) return;
            const classAssignments = assignments.filter(a => a.classId === cls.id);
            if (classAssignments.length === 0) return;

            cls.students.forEach(student => {
                const studentProgress = progressList.filter(p =>
                    p.studentName === student.name &&
                    classAssignments.some(a => a.id === p.assignmentId)
                );
                const completionRate = (studentProgress.length / classAssignments.length) * 100;

                if (completionRate < 50 && classAssignments.length > 0) {
                    insights.push({
                        id: crypto.randomUUID(),
                        type: 'risk',
                        severity: 'high',
                        message: `${student.name} tiene un progreso bajo (${Math.round(completionRate)}%) en ${cls.name}.`,
                        action: 'Enviar recordatorio'
                    });
                }
            });
        });

        // 2. Trend Analysis: Class WPM
        classes.forEach(cls => {
            const classAssignments = assignments.filter(a => a.classId === cls.id);
            const assignmentIds = classAssignments.map(a => a.id);
            const classProgress = progressList.filter(p => assignmentIds.includes(p.assignmentId));

            if (classProgress.length > 5) {
                const avgWpm = classProgress.reduce((sum, p) => sum + (p.wpm || 0), 0) / classProgress.length;
                if (avgWpm < 150) {
                    insights.push({
                        id: crypto.randomUUID(),
                        type: 'trend',
                        severity: 'medium',
                        message: `La velocidad promedio de ${cls.name} es baja (${Math.round(avgWpm)} WPM).`,
                        action: 'Sugerir técnica Bionic'
                    });
                }
            }
        });

        // 3. Positive Reinforcement
        if (insights.length === 0) {
            insights.push({
                id: crypto.randomUUID(),
                type: 'success',
                severity: 'low',
                message: '¡Todo marcha sobre ruedas! Tus clases tienen buen ritmo.',
                action: 'Ver detalles'
            });
        }

        return insights.slice(0, 3); // Return top 3
    },

    getClassHealth: (classId) => {
        const assignments = MockBackendService.getAssignments().filter(a => a.classId === classId);
        const assignmentIds = assignments.map(a => a.id);
        const progressList = JSON.parse(localStorage.getItem(DB_KEYS.PROGRESS) || '[]');
        const classProgress = progressList.filter(p => assignmentIds.includes(p.assignmentId));

        const totalAssignments = assignments.length;
        // Total expected completions = students * assignments
        // For mock, we simplify to just raw counts or we need student count
        const classes = MockBackendService.getClasses();
        const cls = classes.find(c => c.id === classId);
        const studentCount = cls?.students?.length || 0;

        const totalExpected = studentCount * totalAssignments;
        const completedCount = classProgress.filter(p => p.status === 'completed').length;

        const completionRate = totalExpected > 0 ? Math.round((completedCount / totalExpected) * 100) : 0;

        const totalWpm = classProgress.reduce((sum, p) => sum + (p.wpm || 0), 0);
        const avgWpm = classProgress.length > 0 ? Math.round(totalWpm / classProgress.length) : 0;

        return {
            id: classId,
            name: cls?.name || 'Clase',
            completionRate,
            avgWpm,
            totalAssignments,
            completedCount
        };
    },

    getClassHistory: (classId) => {
        // Mock data generator for trends if no real data exists
        // In a real app, this would aggregate daily averages
        const assignments = MockBackendService.getAssignments().filter(a => a.classId === classId);
        const assignmentIds = assignments.map(a => a.id);
        const progressList = JSON.parse(localStorage.getItem(DB_KEYS.PROGRESS) || '[]');
        const classProgress = progressList
            .filter(p => assignmentIds.includes(p.assignmentId))
            .sort((a, b) => new Date(a.completedAt) - new Date(b.completedAt));

        if (classProgress.length < 3) {
            // Return mock trend for demo purposes if not enough data
            return [
                { date: 'Lun', wpm: 120 },
                { date: 'Mar', wpm: 135 },
                { date: 'Mie', wpm: 125 },
                { date: 'Jue', wpm: 140 },
                { date: 'Vie', wpm: 155 }
            ];
        }

        // Aggregate by day
        const history = {};
        classProgress.forEach(p => {
            const date = new Date(p.completedAt).toLocaleDateString(undefined, { weekday: 'short' });
            if (!history[date]) history[date] = [];
            history[date].push(p.wpm);
        });

        return Object.keys(history).map(date => ({
            date,
            wpm: Math.round(history[date].reduce((a, b) => a + b, 0) / history[date].length)
        }));
    },

    // --- Feedback System (Sprint C) ---

    // --- Feedback System (Sprint C) ---

    sendFeedback: (studentName, type, message) => {
        const feedback = JSON.parse(localStorage.getItem('aleer_db_feedback') || '[]');
        const newFeedback = {
            id: crypto.randomUUID(),
            studentName,
            type, // 'kudos' | 'alert'
            message,
            date: new Date().toISOString(),
            read: false
        };
        feedback.push(newFeedback);
        localStorage.setItem('aleer_db_feedback', JSON.stringify(feedback));
        return newFeedback;
    },

    getStudentFeedback: (studentName) => {
        const feedback = JSON.parse(localStorage.getItem('aleer_db_feedback') || '[]');
        // Return unread feedback for this student
        return feedback.filter(f => f.studentName === studentName && !f.read);
    },

    markFeedbackAsRead: (feedbackId) => {
        const feedback = JSON.parse(localStorage.getItem('aleer_db_feedback') || '[]');
        const updatedFeedback = feedback.map(f =>
            f.id === feedbackId ? { ...f, read: true } : f
        );
        localStorage.setItem('aleer_db_feedback', JSON.stringify(updatedFeedback));
    },

    // --- GAMIFICATION ENGINE (v1) ---
    getStudentGamification: (studentName) => {
        if (!studentName) return { streak: 0, badges: [], points: 0, level: 1 };

        const progressList = JSON.parse(localStorage.getItem(DB_KEYS.PROGRESS) || '[]');
        const myProgress = progressList.filter(p => p.studentName === studentName && p.status === 'completed');

        // 1. Calculate Points (100 pts per reading)
        const points = myProgress.length * 100;
        const level = Math.floor(points / 500) + 1; // Level up every 500 pts

        // 2. Calculate Streak (Consecutive days)
        // Sort by date desc
        const sortedDates = [...new Set(myProgress.map(p => p.completedAt.split('T')[0]))].sort().reverse();

        let streak = 0;
        if (sortedDates.length > 0) {
            const today = new Date().toISOString().split('T')[0];
            const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

            // Check if last activity was today or yesterday
            if (sortedDates[0] === today || sortedDates[0] === yesterday) {
                streak = 1;
                let currentDate = new Date(sortedDates[0]);

                for (let i = 1; i < sortedDates.length; i++) {
                    const prevDate = new Date(sortedDates[i]);
                    const diffTime = Math.abs(currentDate - prevDate);
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                    if (diffDays === 1) {
                        streak++;
                        currentDate = prevDate;
                    } else {
                        break;
                    }
                }
            }
        }

        // 3. Calculate Badges
        const badges = [
            {
                id: 'first_read',
                name: 'Primeros Pasos',
                icon: '🥉',
                description: 'Completa tu primera lectura',
                unlocked: myProgress.length >= 1
            },
            {
                id: 'streak_3',
                name: 'Lector Constante',
                icon: '🔥',
                description: 'Racha de 3 días seguidos',
                unlocked: streak >= 3
            },
            {
                id: 'speed_demon',
                name: 'Velocidad Sónica',
                icon: '⚡',
                description: 'Lee a más de 200 WPM',
                unlocked: myProgress.some(p => p.wpm > 200)
            },
            {
                id: 'bookworm',
                name: 'Devorador de Libros',
                icon: '🏆',
                description: 'Completa 10 lecturas',
                unlocked: myProgress.length >= 10
            }
        ];

        return {
            streak,
            badges,
            points,
            level,
            history: myProgress // Return history for charts
        };
    },

    // --- STUDENT VIEW ---
    // ... existing code ...
    // --- CLASSES ---
    getClasses: () => {
        return JSON.parse(localStorage.getItem(DB_KEYS.CLASSES) || '[]');
    },

    createClass: (classData) => {
        const classes = MockBackendService.getClasses();
        const newClass = {
            id: crypto.randomUUID(),
            code: Math.floor(100000 + Math.random() * 900000).toString(),
            students: [],
            createdAt: new Date().toISOString(),
            ...classData
        };
        classes.push(newClass);
        localStorage.setItem(DB_KEYS.CLASSES, JSON.stringify(classes));
        return newClass;
    },

    deleteClass: (classId) => {
        const classes = MockBackendService.getClasses();
        const filteredClasses = classes.filter(cls => cls.id !== classId);

        if (filteredClasses.length < classes.length) {
            localStorage.setItem(DB_KEYS.CLASSES, JSON.stringify(filteredClasses));
            return true; // Eliminación exitosa
        }
        return false; // Clase no encontrada
    },

    // Verificar si una clase tiene estudiantes o asignaciones activas
    canDeleteClass: (classId) => {
        const classes = MockBackendService.getClasses();
        const classToDelete = classes.find(cls => cls.id === classId);

        if (!classToDelete) return { canDelete: false, reason: "Clase no encontrada" };

        // Verificar estudiantes
        if (classToDelete.students && classToDelete.students.length > 0) {
            return {
                canDelete: false,
                reason: `La clase tiene ${classToDelete.students.length} estudiante(s) inscrito(s)`
            };
        }

        // Verificar asignaciones activas
        const assignments = MockBackendService.getAssignments();
        const activeAssignments = assignments.filter(assignment =>
            assignment.classId === classId && assignment.status === 'active'
        );

        if (activeAssignments.length > 0) {
            return {
                canDelete: false,
                reason: `La clase tiene ${activeAssignments.length} asignación(es) activa(s)`
            };
        }

        return { canDelete: true };
    },

    // --- ASSIGNMENTS ---
    getAssignments: () => {
        return JSON.parse(localStorage.getItem(DB_KEYS.ASSIGNMENTS) || '[]');
    },

    createAssignment: (assignmentData) => {
        const assignments = MockBackendService.getAssignments();
        const newAssignment = {
            id: crypto.randomUUID(),
            createdAt: new Date().toISOString(),
            status: 'active',
            ...assignmentData // { classId, textId, textTitle, dueDate }
        };
        assignments.push(newAssignment);
        localStorage.setItem(DB_KEYS.ASSIGNMENTS, JSON.stringify(assignments));
        return newAssignment;
    },

    deleteAssignment: (assignmentId) => {
        const assignments = MockBackendService.getAssignments();
        const filteredAssignments = assignments.filter(a => a.id !== assignmentId);

        if (filteredAssignments.length < assignments.length) {
            localStorage.setItem(DB_KEYS.ASSIGNMENTS, JSON.stringify(filteredAssignments));
            return true;
        }
        return false;
    },

    // --- LIBRARY ---
    getLibrary: (initialLibrary = []) => {
        const customItems = JSON.parse(localStorage.getItem(DB_KEYS.LIBRARY) || '[]');
        return [...initialLibrary, ...customItems];
    },

    addToLibrary: (item) => {
        const customItems = JSON.parse(localStorage.getItem(DB_KEYS.LIBRARY) || '[]');
        const newItem = {
            id: crypto.randomUUID(),
            isCustom: true,
            createdAt: new Date().toISOString(),
            ...item
        };
        customItems.push(newItem);
        localStorage.setItem(DB_KEYS.LIBRARY, JSON.stringify(customItems));
        return newItem;
    },

    updateBook: (bookId, newContent) => {
        const customItems = JSON.parse(localStorage.getItem(DB_KEYS.LIBRARY) || '[]');
        const idx = customItems.findIndex(item => item.id === bookId);
        if (idx >= 0) {
            customItems[idx].content = newContent;
            // update word count in metadata if needed, but for now just content
            localStorage.setItem(DB_KEYS.LIBRARY, JSON.stringify(customItems));
            return customItems[idx];
        }
        return null;
    },

    removeFromLibrary: (bookId) => {
        const customItems = JSON.parse(localStorage.getItem(DB_KEYS.LIBRARY) || '[]');
        const filteredItems = customItems.filter(item => item.id !== bookId);

        if (filteredItems.length < customItems.length) {
            localStorage.setItem(DB_KEYS.LIBRARY, JSON.stringify(filteredItems));
            return true; // Eliminación exitosa
        }
        return false; // Libro no encontrado
    },

    // Verificar si un libro está siendo usado en asignaciones activas
    isBookAssigned: (bookId) => {
        const assignments = MockBackendService.getAssignments();
        return assignments.some(assignment =>
            assignment.textId === bookId && assignment.status === 'active'
        );
    },

    // --- STUDENT VIEW ---

    // Inscribir estudiante en una clase usando el código
    enrollStudent: (classCode, studentName) => {
        const classes = MockBackendService.getClasses();
        const targetClass = classes.find(c => c.code === classCode);

        if (!targetClass) {
            return { success: false, message: 'Código de clase no válido' };
        }

        // Verificar si ya está inscrito (simulado con localStorage por ahora)
        const enrollments = JSON.parse(localStorage.getItem(DB_KEYS.ENROLLMENTS) || '[]');
        const alreadyEnrolled = enrollments.some(e => e.classId === targetClass.id);

        if (alreadyEnrolled) {
            return { success: false, message: 'Ya estás inscrito en esta clase' };
        }

        // Crear inscripción
        const newEnrollment = {
            id: crypto.randomUUID(),
            classId: targetClass.id,
            className: targetClass.name,
            studentName: studentName || 'Estudiante',
            joinedAt: new Date().toISOString()
        };

        enrollments.push(newEnrollment);
        localStorage.setItem(DB_KEYS.ENROLLMENTS, JSON.stringify(enrollments));

        // Actualizar lista de estudiantes en la clase (para vista del profesor)
        targetClass.students = targetClass.students || [];
        targetClass.students.push({
            id: crypto.randomUUID(), // ID temporal del estudiante
            name: studentName || 'Estudiante',
            joinedAt: new Date().toISOString()
        });

        // Guardar clase actualizada
        const updatedClasses = classes.map(c => c.id === targetClass.id ? targetClass : c);
        localStorage.setItem(DB_KEYS.CLASSES, JSON.stringify(updatedClasses));

        return { success: true, className: targetClass.name };
    },

    getStudentEnrollments: () => {
        return JSON.parse(localStorage.getItem(DB_KEYS.ENROLLMENTS) || '[]');
    },

    /**
     * Get assignments ONLY for classes the student is enrolled in.
     */
    getStudentAssignments: () => {
        const enrollments = MockBackendService.getStudentEnrollments();
        const enrolledClassIds = enrollments.map(e => e.classId);

        const allAssignments = MockBackendService.getAssignments();
        const classes = MockBackendService.getClasses();

        // Filtrar asignaciones de mis clases
        return allAssignments
            .filter(a => enrolledClassIds.includes(a.classId))
            .map(a => {
                // Enriquecer con nombre de la clase
                const cls = classes.find(c => c.id === a.classId);
                return {
                    ...a,
                    className: cls ? cls.name : 'Clase Desconocida'
                };
            });
    },

    // --- DEBUG ---
    clearDb: () => {
        localStorage.removeItem(DB_KEYS.CLASSES);
        localStorage.removeItem(DB_KEYS.ASSIGNMENTS);
        localStorage.removeItem(DB_KEYS.STUDENTS);
        console.log('Database cleared');
    }
};

export default MockBackendService;
