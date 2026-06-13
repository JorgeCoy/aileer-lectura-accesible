import MockBackendService from './MockBackendService';

/**
 * AnalyticsService
 * Módulo especializado en cálculos matemáticos, estadísticas y promedios.
 * En un backend real, esto viviría en el servidor o en una base de datos analítica.
 */
class AnalyticsService {

    /**
     * Calcula la lectura más practicada basada en los registros de progreso
     * @param {Array} progressList 
     * @param {Array} assignments 
     */
    static _calculateTopReading(progressList, assignments) {
        if (!progressList.length || !assignments.length) return { title: 'Ninguna', count: 0 };
        
        // Count frequencies of assignmentId
        const counts = {};
        progressList.forEach(p => {
            if (p.status === 'completed') {
                counts[p.assignmentId] = (counts[p.assignmentId] || 0) + 1;
            }
        });

        // Find the most frequent
        let topId = null;
        let maxCount = 0;
        for (const [id, count] of Object.entries(counts)) {
            if (count > maxCount) {
                maxCount = count;
                topId = id;
            }
        }

        if (!topId) return { title: 'Ninguna', count: 0 };
        
        const topAssignment = assignments.find(a => a.id === topId);
        return {
            title: topAssignment ? topAssignment.textTitle : 'Lectura Desconocida',
            count: maxCount
        };
    }

    /**
     * Obtiene estadísticas globales para todo el colegio
     */
    static getGlobalStats() {
        const classes = MockBackendService.getClasses();
        const assignments = MockBackendService.getAssignments();
        const progressList = JSON.parse(localStorage.getItem('aleer_db_progress') || '[]');

        const totalStudents = classes.reduce((sum, cls) => sum + (cls.students?.length || 0), 0);
        const totalAssignments = assignments.length;
        
        // Calculate Global Risk
        const classRiskList = this.getClassRiskList();
        // Since we don't have individual risk pre-calculated easily globally without looping, 
        // we sum the risks of all classes. For simplicity, we calculate global completion rate.
        
        let completedEntries = progressList.filter(p => p.status === 'completed').length;
        // Approximation: Total possible completions = totalStudents * assignments per student
        // Here we just use the average of class completion rates
        const avgComprehension = classRiskList.length > 0 
            ? Math.round(classRiskList.reduce((sum, cls) => sum + cls.completionRate, 0) / classRiskList.length)
            : 0;

        // Sum students in risk globally
        let globalStudentsInRisk = 0;
        classes.forEach(cls => {
            const studentRisk = this.getStudentRiskList(cls.id);
            globalStudentsInRisk += studentRisk.filter(s => s.status === 'risk').length;
        });

        const topReading = this._calculateTopReading(progressList, assignments);

        return {
            students: totalStudents,
            assignments: totalAssignments,
            avgComprehension: avgComprehension,
            studentsInRisk: globalStudentsInRisk,
            topReadingName: topReading.title,
            topReadingCount: topReading.count
        };
    }

    /**
     * Obtiene estadísticas para una clase específica
     */
    static getClassStats(classId) {
        const classes = MockBackendService.getClasses();
        const assignments = MockBackendService.getAssignments().filter(a => a.classId === classId);
        const progressList = JSON.parse(localStorage.getItem('aleer_db_progress') || '[]')
            .filter(p => assignments.some(a => a.id === p.assignmentId));
        
        const selectedClass = classes.find(c => c.id === classId);
        if (!selectedClass) return { students: 0, assignments: 0, avgComprehension: 0, studentsInRisk: 0, topReadingName: 'Ninguna', topReadingCount: 0, avgWpm: 0 };

        const totalStudents = selectedClass.students?.length || 0;
        const totalAssignments = assignments.length;

        const classHealth = MockBackendService.getClassHealth(classId);
        const avgWpm = classHealth.avgWpm || 0;
        const avgComprehension = classHealth.completionRate || 0;

        const studentRiskList = this.getStudentRiskList(classId);
        const studentsInRisk = studentRiskList.filter(s => s.status === 'risk').length;

        const topReading = this._calculateTopReading(progressList, assignments);

        return {
            students: totalStudents,
            assignments: totalAssignments,
            avgComprehension: avgComprehension,
            studentsInRisk: studentsInRisk,
            topReadingName: topReading.title,
            topReadingCount: topReading.count,
            avgWpm: avgWpm
        };
    }

    /**
     * Obtiene el listado de estudiantes y su nivel de riesgo para una clase
     */
    static getStudentRiskList(classId) {
        if (classId === 'global') return [];

        const classes = MockBackendService.getClasses();
        const selectedClass = classes.find(c => c.id === classId);
        if (!selectedClass || !selectedClass.students) return [];

        const assignments = MockBackendService.getAssignments().filter(a => a.classId === classId);
        const progressList = JSON.parse(localStorage.getItem('aleer_db_progress') || '[]');

        const totalClassAssignments = assignments.length;
        let classStudentsStatus = [];

        selectedClass.students.forEach(student => {
            const studentProgress = progressList.filter(p =>
                p.studentName === student.name &&
                assignments.some(a => a.id === p.assignmentId)
            );
            
            const completedCount = studentProgress.filter(p => p.status === 'completed').length;
            const completionRate = totalClassAssignments > 0
                ? Math.round((completedCount / totalClassAssignments) * 100)
                : 0;

            let status = 'risk';
            if (completionRate >= 80) status = 'success';
            else if (completionRate >= 50) status = 'warning';

            classStudentsStatus.push({
                name: student.name,
                className: selectedClass.name,
                completionRate,
                status
            });
        });

        return classStudentsStatus;
    }

    /**
     * Obtiene el listado de clases y su nivel de riesgo general
     */
    static getClassRiskList() {
        const classes = MockBackendService.getClasses();
        return classes.map(cls => MockBackendService.getClassHealth(cls.id));
    }

    /**
     * Genera notificaciones/insights basados en análisis
     */
    static getInsights(classId = 'global') {
        let insights = [];
        const timestamp = Date.now();

        if (classId === 'global') {
            const globalStats = this.getGlobalStats();
            if (globalStats.studentsInRisk > 0) {
                insights.push({
                    id: timestamp + 1,
                    type: 'risk',
                    message: `Hay ${globalStats.studentsInRisk} estudiantes en riesgo en el colegio.`,
                    action: 'Revisar semáforo'
                });
            } else {
                insights.push({
                    id: timestamp + 2,
                    type: 'success',
                    message: 'El rendimiento general del colegio es sobresaliente.',
                    action: ''
                });
            }
        } else {
            const classStats = this.getClassStats(classId);
            if (classStats.studentsInRisk > 0) {
                insights.push({
                    id: timestamp + 3,
                    type: 'risk',
                    message: `Tienes ${classStats.studentsInRisk} estudiantes en riesgo en este salón.`,
                    action: 'Ver Semáforo'
                });
            } else {
                insights.push({
                    id: timestamp + 4,
                    type: 'success',
                    message: '¡Excelente! Todos los estudiantes de este salón van a buen ritmo.',
                    action: ''
                });
            }
        }

        return insights;
    }

    /**
     * Obtiene el análisis de comprensión por tipo de pregunta (Mock data)
     * @param {string} classId
     */
    static getComprehensionAnalysis(classId = 'global') {
        // En un escenario real, esto cruzaría los datos de las respuestas fallidas
        // con la categorización de la pregunta (Literal, Inferencia, etc.)
        return [
            { type: 'Inferencia', failRate: 65, color: 'bg-orange-400' },
            { type: 'Vocabulario', failRate: 40, color: 'bg-yellow-400' },
            { type: 'Literal', failRate: 15, color: 'bg-green-400' },
            { type: 'Crítica', failRate: 30, color: 'bg-indigo-400' }
        ];
    }
}

export default AnalyticsService;
