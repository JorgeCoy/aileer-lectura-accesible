import FirebaseBackendService from './FirebaseBackendService';

/**
 * AnalyticsService
 * Módulo especializado en cálculos matemáticos, estadísticas y promedios.
 * Totalmente abstraído para recibir datos dinámicos de cualquier proveedor (Firebase / API).
 */
class AnalyticsService {

    /**
     * Calcula la lectura más practicada basada en los registros de progreso
     * @param {Array} progressList 
     * @param {Array} assignments 
     */
    static _calculateTopReading(progressList = [], assignments = []) {
        if (!progressList.length || !assignments.length) return { title: 'Ninguna', count: 0 };
        
        const counts = {};
        progressList.forEach(p => {
            if (p.status === 'completed') {
                counts[p.assignmentId] = (counts[p.assignmentId] || 0) + 1;
            }
        });

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
            title: topAssignment ? (topAssignment.textTitle || topAssignment.title || 'Lectura') : 'Lectura Desconocida',
            count: maxCount
        };
    }

    /**
     * Obtiene estadísticas globales para todo el colegio o conjunto de clases
     */
    static getGlobalStats(classes = [], assignments = [], progressList = []) {
        const totalStudents = classes.reduce((sum, cls) => sum + (cls.students?.length || 0), 0);
        const totalAssignments = assignments.length;

        const classRiskList = this.getClassRiskList(classes);
        const avgComprehension = classRiskList.length > 0 
            ? Math.round(classRiskList.reduce((sum, cls) => sum + (cls.completionRate || 0), 0) / classRiskList.length)
            : 0;

        let globalStudentsInRisk = 0;
        classes.forEach(cls => {
            const studentRisk = this.getStudentRiskList(cls, assignments, progressList);
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
    static getClassStats(classId, classes = [], assignments = [], progressList = [], classHealth = {}) {
        const selectedClass = classes.find(c => c.id === classId) || { id: classId, students: [] };
        const classAssignments = assignments.filter(a => a.classId === classId);
        const classProgress = progressList.filter(p => classAssignments.some(a => a.id === p.assignmentId));

        const totalStudents = selectedClass.students?.length || 0;
        const totalAssignments = classAssignments.length;

        const avgWpm = classHealth.avgWpm || 0;
        const avgComprehension = classHealth.completionRate || 0;

        const studentRiskList = this.getStudentRiskList(selectedClass, classAssignments, classProgress);
        const studentsInRisk = studentRiskList.filter(s => s.status === 'risk').length;

        const topReading = this._calculateTopReading(classProgress, classAssignments);

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
    static getStudentRiskList(selectedClass = {}, classAssignments = [], progressList = []) {
        if (!selectedClass || !selectedClass.students) return [];

        const totalClassAssignments = classAssignments.length;
        let classStudentsStatus = [];

        selectedClass.students.forEach(student => {
            const studentProgress = progressList.filter(p =>
                (p.studentId === student.id || p.studentName === student.name) &&
                classAssignments.some(a => a.id === p.assignmentId)
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
                className: selectedClass.name || 'Clase',
                completionRate,
                status
            });
        });

        return classStudentsStatus;
    }

    /**
     * Obtiene el listado de clases y su nivel de riesgo general
     */
    static getClassRiskList(classes = []) {
        return classes.map(cls => ({
            id: cls.id,
            name: cls.name,
            studentsCount: cls.students?.length || 0,
            completionRate: cls.completionRate || 0,
            avgWpm: cls.avgWpm || 0,
            status: (cls.completionRate || 0) >= 70 ? 'healthy' : 'risk'
        }));
    }

    /**
     * Genera notificaciones/insights basados en análisis
     */
    static getInsights(classId = 'global', stats = {}) {
        let insights = [];
        const timestamp = Date.now();
        const studentsInRisk = stats.studentsInRisk || 0;

        if (classId === 'global') {
            if (studentsInRisk > 0) {
                insights.push({
                    id: timestamp + 1,
                    type: 'risk',
                    message: `Hay ${studentsInRisk} estudiantes en riesgo en el colegio.`,
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
            if (studentsInRisk > 0) {
                insights.push({
                    id: timestamp + 3,
                    type: 'risk',
                    message: `Tienes ${studentsInRisk} estudiantes en riesgo en este salón.`,
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
     * Obtiene el análisis de comprensión por tipo de pregunta
     */
    static getComprehensionAnalysis(classId = 'global') {
        return [
            { type: 'Inferencia', failRate: 65, color: 'bg-orange-400' },
            { type: 'Vocabulario', failRate: 40, color: 'bg-yellow-400' },
            { type: 'Literal', failRate: 15, color: 'bg-green-400' },
            { type: 'Crítica', failRate: 30, color: 'bg-indigo-400' }
        ];
    }
}

export default AnalyticsService;
