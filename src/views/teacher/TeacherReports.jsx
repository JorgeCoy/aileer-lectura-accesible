import React, { useState, useEffect } from 'react';
import AnalyticsService from '../../services/AnalyticsService';
import MockBackendService from '../../services/MockBackendService';

const TeacherReports = () => {
    const [activeTab, setActiveTab] = useState('comprehension');
    const [selectedClassId, setSelectedClassId] = useState('global');
    const [classes, setClasses] = useState([]);
    
    // Data states
    const [comprehensionData, setComprehensionData] = useState([]);
    const [studentsInRisk, setStudentsInRisk] = useState([]);

    useEffect(() => {
        const loadedClasses = MockBackendService.getClasses();
        setClasses(loadedClasses);
    }, []);

    useEffect(() => {
        setComprehensionData(AnalyticsService.getComprehensionAnalysis(selectedClassId));
        
        let riskStudents = [];
        if (selectedClassId === 'global') {
            classes.forEach(cls => {
                const risks = AnalyticsService.getStudentRiskList(cls.id).filter(s => s.status === 'risk');
                riskStudents = [...riskStudents, ...risks];
            });
        } else {
            riskStudents = AnalyticsService.getStudentRiskList(selectedClassId).filter(s => s.status === 'risk');
        }
        setStudentsInRisk(riskStudents);

    }, [selectedClassId, classes]);

    return (
        <div className="flex-1 p-8 overflow-auto relative">
            
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-text-main">Reportes de Clase</h1>
                    <p className="text-text-muted mt-1">Análisis detallado del rendimiento de tus estudiantes</p>
                </div>

                <div className="flex items-center gap-4">
                    {/* Class Selector */}
                    <select 
                        value={selectedClassId}
                        onChange={(e) => setSelectedClassId(e.target.value)}
                        className="bg-surface-elevated border border-border-color rounded-xl px-4 py-2 font-bold text-text-main focus:outline-none focus:border-primary shadow-sm"
                    >
                        <option value="global">🏫 Todo el Colegio</option>
                        {classes.map(cls => (
                            <option key={cls.id} value={cls.id}>📚 {cls.name}</option>
                        ))}
                    </select>

                    {/* PDF Download Button */}
                    <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-indigo-200 transition-all">
                        <span>📄</span> Descargar PDF
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 mb-6 border-b border-border-color pb-px">
                <button 
                    onClick={() => setActiveTab('comprehension')}
                    className={`pb-4 px-2 font-bold transition-all border-b-2 ${activeTab === 'comprehension' ? 'border-primary text-primary' : 'border-transparent text-text-muted hover:text-text-main'}`}
                >
                    🎯 Análisis de Comprensión
                </button>
                <button 
                    onClick={() => setActiveTab('early_warning')}
                    className={`pb-4 px-2 font-bold transition-all border-b-2 ${activeTab === 'early_warning' ? 'border-primary text-primary' : 'border-transparent text-text-muted hover:text-text-main'}`}
                >
                    ⚠️ Alertas Tempranas
                </button>
            </div>

            {/* Tab Content: Comprehension */}
            {activeTab === 'comprehension' && (
                <div className="bg-surface border border-border-color p-8 rounded-3xl shadow-xl">
                    <h2 className="text-xl font-bold text-text-main mb-6">Porcentaje de Fallos por Tipo de Pregunta</h2>
                    
                    <div className="space-y-6">
                        {comprehensionData.map((data, idx) => (
                            <div key={idx}>
                                <div className="flex justify-between mb-2">
                                    <span className="font-bold text-text-main">{data.type}</span>
                                    <span className="font-bold text-text-muted">{data.failRate}% fallo</span>
                                </div>
                                <div className="w-full bg-surface-elevated rounded-full h-4 overflow-hidden border border-border-color">
                                    <div 
                                        className={`${data.color} h-4 rounded-full transition-all duration-1000`} 
                                        style={{ width: `${data.failRate}%` }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>
                    
                    <div className="mt-8 p-4 bg-surface-elevated border border-border-color rounded-xl text-text-main text-sm flex gap-3">
                        <span className="text-2xl">💡</span>
                        <p><strong>Sugerencia de IA:</strong> Notamos una alta tasa de fallo en preguntas de <em>Inferencia</em>. Te recomendamos asignar la lectura "El Misterio del Reloj" que está diseñada para practicar esta habilidad.</p>
                    </div>
                </div>
            )}

            {/* Tab Content: Early Warning */}
            {activeTab === 'early_warning' && (
                <div className="bg-surface border border-border-color p-8 rounded-3xl shadow-xl">
                    <h2 className="text-xl font-bold text-text-main mb-6 flex items-center gap-2">
                        <span>🚨</span> Estudiantes con Riesgo de Deserción
                    </h2>

                    {studentsInRisk.length === 0 ? (
                        <div className="text-center p-12 text-text-muted">
                            <span className="text-4xl block mb-2">✅</span>
                            No hay estudiantes en riesgo crítico bajo este filtro.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b-2 border-border-color">
                                        <th className="p-4 font-bold text-text-main">Estudiante</th>
                                        <th className="p-4 font-bold text-text-main">Clase</th>
                                        <th className="p-4 font-bold text-text-main">Tasa de Completitud</th>
                                        <th className="p-4 font-bold text-text-main">Acción Recomendada</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {studentsInRisk.map((student, idx) => (
                                        <tr key={idx} className="border-b border-border-color hover:bg-surface-elevated transition-colors">
                                            <td className="p-4 font-bold text-text-main">{student.name}</td>
                                            <td className="p-4 text-text-muted">{student.className}</td>
                                            <td className="p-4">
                                                <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-bold border border-orange-200">
                                                    {student.completionRate}% completado
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <button className="text-primary font-bold hover:underline text-sm">
                                                    Enviar Recordatorio
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default TeacherReports;
