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
    const [isOpen, setIsOpen] = useState(true); // El drawer empieza abierto

    return (
        <>
            {/* Botón Flotante para reabrir el Drawer si el usuario lo oculta */}
            {!isOpen && (
                <button 
                    onClick={() => setIsOpen(true)}
                    className="fixed top-24 right-0 bg-orange-600 text-white p-3 rounded-l-xl shadow-lg z-[60] hover:bg-orange-700 transition flex items-center gap-2"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
                    </svg>
                    <span className="font-medium text-sm pr-1">Ajustes</span>
                </button>
            )}

            {/* Backdrop oscuro (opcional, ayuda a enfocar) */}
            {isOpen && (
                <div 
                    className="fixed inset-0 bg-black/20 z-[55] transition-opacity backdrop-blur-[1px]" 
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Drawer Panel */}
            <div className={`fixed inset-y-0 right-0 w-96 bg-white shadow-2xl z-[60] flex flex-col transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50/50">
                    <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        📚 Asignación
                    </h2>
                    <button 
                        onClick={() => setIsOpen(false)}
                        className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-lg transition"
                        title="Ocultar panel"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Status Badge */}
                    <div className="mb-2">
                        {selectedClassId ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-green-700 bg-green-50 border border-green-200">
                                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                Lista para asignar
                            </span>
                        ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-orange-700 bg-orange-50 border border-orange-200">
                                <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>
                                Selecciona una clase
                            </span>
                        )}
                    </div>

                    {/* Clase */}
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Clase Destino</label>
                        {classes.length > 0 ? (
                            <select
                                value={selectedClassId}
                                onChange={(e) => setSelectedClassId(e.target.value)}
                                className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-orange-500 outline-none text-gray-900 bg-gray-50 hover:bg-gray-100 transition cursor-pointer"
                            >
                                <option value="">Seleccionar clase...</option>
                                {classes.map(cls => (
                                    <option key={cls.id} value={cls.id}>{cls.name}</option>
                                ))}
                            </select>
                        ) : (
                            <div className="p-3 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100">
                                No tienes clases creadas
                            </div>
                        )}
                    </div>

                    {/* Fecha límite */}
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Fecha Límite (Opcional)</label>
                        <input
                            type="date"
                            value={dueDate}
                            onChange={(e) => setDueDate(e.target.value)}
                            className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-orange-500 outline-none text-gray-900 bg-gray-50 hover:bg-gray-100 transition cursor-pointer"
                        />
                    </div>
                    
                    {/* Tipo de Asignación */}
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Tipo de Lectura</label>
                        <div className="space-y-2">
                            <label className={`flex items-center p-3 border rounded-xl cursor-pointer transition ${assignmentType === 'practice' ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:bg-gray-50'}`}>
                                <input type="radio" name="assignmentType" value="practice" checked={assignmentType === 'practice'} onChange={(e) => setAssignmentType(e.target.value)} className="w-4 h-4 text-orange-600 border-gray-300 focus:ring-orange-500" />
                                <span className="ml-3 text-sm font-medium text-gray-900">Solo Lectura (Práctica)</span>
                            </label>
                            <label className={`flex items-center p-3 border rounded-xl cursor-pointer transition ${assignmentType === 'evaluation' ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:bg-gray-50'}`}>
                                <input type="radio" name="assignmentType" value="evaluation" checked={assignmentType === 'evaluation'} onChange={(e) => setAssignmentType(e.target.value)} className="w-4 h-4 text-orange-600 border-gray-300 focus:ring-orange-500" />
                                <span className="ml-3 text-sm font-medium text-gray-900">Lectura + Evaluación</span>
                            </label>
                        </div>
                    </div>

                    {/* Configurar Cuestionario */}
                    {assignmentType === 'evaluation' && (
                        <div className="pt-2 animate-in fade-in slide-in-from-top-2 duration-300">
                            <button
                                onClick={() => setShowEvaluationModal(true)}
                                className={`w-full py-3 px-4 rounded-xl font-medium transition flex items-center justify-center gap-2 shadow-sm border
                                    ${evaluation.enabled && evaluation.questions.length > 0
                                        ? 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
                                        : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                                    }
                                `}
                            >
                                <span className="text-lg">📝</span> 
                                {evaluation.enabled && evaluation.questions.length > 0 
                                    ? `Editar Preguntas (${evaluation.questions.length})` 
                                    : 'Configurar Cuestionario'}
                            </button>
                        </div>
                    )}
                </div>

                {/* Footer / Actions */}
                <div className="p-6 border-t border-gray-100 bg-gray-50/80 flex flex-col gap-3">
                    <button
                        onClick={onConfirm}
                        disabled={!isValid}
                        className="w-full py-3 bg-orange-600 text-white rounded-xl hover:bg-orange-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-orange-600/20 flex items-center justify-center gap-2"
                    >
                        <span>Confirmar Asignación</span>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                    </button>
                    <button
                        onClick={onCancel}
                        className="w-full py-3 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition font-medium text-sm border border-transparent hover:border-gray-200"
                    >
                        Cancelar y Salir
                    </button>
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
        </>
    );
};

export default AssignmentConfigurator;



