import React, { useState } from 'react';
import EvaluationModal from './EvaluationModal';

const AssignmentConfigurator = ({
    selectedClassId,
    setSelectedClassId,
    dueDate,
    setDueDate,
    classes,
    onCancel,
    onConfirm,
    isValid = false,
    assignmentType = 'practice',
    setAssignmentType = () => {},
    evaluation = { enabled: false, showResultsToStudent: false, questions: [], questionsPerAttempt: 0, maxAttempts: 1 },
    setEvaluation = () => {},
    onGenerateAIQuestions = null
}) => {
    const [showEvaluationModal, setShowEvaluationModal] = useState(false);
    
    // Determine context: TeacherLibrary uses onGenerateAIQuestions directly, while TeacherClasses might not pass it
    const isEditing = !onGenerateAIQuestions; // If we edit, we might not have AI generation enabled for now, or we can enable it later.
    return (
        <div className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm z-50 relative">
            <div className="max-w-7xl mx-auto">
                {/* Header Row with Actions */}
                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-4">
                        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                            📚 Configurar Asignación
                        </h2>
                        {/* Status Badge */}
                        {selectedClassId ? (
                            <span className="text-xs font-medium text-green-700 bg-green-50 px-2 py-1 rounded-full border border-green-200">
                                ✅ Lista para asignar
                            </span>
                        ) : (
                            <span className="text-xs font-medium text-orange-700 bg-orange-50 px-2 py-1 rounded-full border border-orange-200">
                                ⚠️ Selecciona una clase
                            </span>
                        )}
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={onCancel}
                            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition text-sm font-medium"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={onConfirm}
                            disabled={!isValid}
                            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-sm flex items-center gap-2"
                        >
                            <span>Confirmar Asignación</span>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Configuration Row - Compact */}
                <div className="flex gap-6 items-start bg-gray-50 p-3 rounded-xl border border-gray-100">
                    {/* Clase */}
                    <div className="flex-1 max-w-md">
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Clase Destino</label>
                        {classes.length > 0 ? (
                            <select
                                value={selectedClassId}
                                onChange={(e) => setSelectedClassId(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-orange-500 outline-none text-gray-900 bg-white shadow-sm"
                            >
                                <option value="">Seleccionar clase...</option>
                                {classes.map(cls => (
                                    <option key={cls.id} value={cls.id}>{cls.name}</option>
                                ))}
                            </select>
                        ) : (
                            <p className="text-red-500 text-sm">No tienes clases creadas</p>
                        )}
                    </div>

                    {/* Fecha límite */}
                    <div className="w-48">
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Fecha Límite (Opcional)</label>
                        <input
                            type="date"
                            value={dueDate}
                            onChange={(e) => setDueDate(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg p-2 text-sm text-gray-900 bg-white shadow-sm"
                        />
                    </div>
                    
                    {/* Tipo de Asignación */}
                    <div className="w-56">
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Tipo de Lectura</label>
                        <select
                            value={assignmentType}
                            onChange={(e) => setAssignmentType(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-orange-500 outline-none text-gray-900 bg-white shadow-sm"
                        >
                            <option value="practice">Solo Lectura (Práctica General)</option>
                            <option value="evaluation">Lectura + Cuestionario (Evaluación)</option>
                            <option value="quiz_only">Solo Cuestionario (Sin lectura)</option>
                        </select>
                    </div>

                    {/* Configurar Cuestionario */}
                    <div className="w-48 flex items-end pb-1">
                        <button
                            onClick={() => setShowEvaluationModal(true)}
                            className={`w-full py-2 px-4 rounded-lg font-medium transition flex items-center justify-center gap-2 shadow-sm border
                                ${evaluation.enabled && evaluation.questions.length > 0
                                    ? 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
                                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                }
                            `}
                        >
                            <span>📝</span> 
                            {evaluation.enabled && evaluation.questions.length > 0 
                                ? `Editar Eval (${evaluation.questions.length})` 
                                : 'Configurar Eval.'}
                        </button>
                    </div>
                </div>

                {/* Modal de Evaluación */}
                {showEvaluationModal && (
                    <EvaluationModal 
                        evaluation={evaluation} 
                        setEvaluation={setEvaluation} 
                        onGenerateAI={onGenerateAIQuestions}
                        onClose={() => setShowEvaluationModal(false)}
                    />
                )}
            </div>
        </div>
    );
};

export default AssignmentConfigurator;



