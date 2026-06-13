import React, { useState } from 'react';

const EvaluationModal = ({ evaluation, setEvaluation, onGenerateAI, onClose }) => {
    const [isGenerating, setIsGenerating] = useState(false);
    const [aiConfig, setAiConfig] = useState({ multipleChoice: 3, openEnded: 1 });

    const handleAddQuestion = (type) => {
        const newQuestion = {
            id: `q_${Date.now()}`,
            type: type,
            question: '',
            options: type === 'multiple_choice' ? ['', '', '', ''] : undefined,
            correctAnswer: type === 'multiple_choice' ? 0 : undefined
        };
        setEvaluation(prev => ({
            ...prev,
            questions: [...prev.questions, newQuestion]
        }));
    };

    const handleUpdateQuestion = (index, updatedQuestion) => {
        setEvaluation(prev => {
            const newQuestions = [...prev.questions];
            newQuestions[index] = updatedQuestion;
            return { ...prev, questions: newQuestions };
        });
    };

    const handleDeleteQuestion = (index) => {
        setEvaluation(prev => {
            const newQuestions = [...prev.questions];
            newQuestions.splice(index, 1);
            return { ...prev, questions: newQuestions };
        });
    };

    const handleGenerateClick = async () => {
        if (!onGenerateAI) return;
        setIsGenerating(true);
        try {
            // Pasamos los parámetros de cantidad al servicio de IA
            await onGenerateAI(aiConfig.multipleChoice, aiConfig.openEnded);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                    <div>
                        <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                            <span>📝</span> Constructor de Evaluación
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">Diseña el cuestionario que los estudiantes verán al finalizar la lectura.</p>
                    </div>
                    <button 
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Main Content Scrollable Area */}
                <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
                    
                    {/* Settings Row */}
                    <div className="flex flex-wrap gap-6 items-center mb-6 bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                        <label className="flex items-center gap-3 cursor-pointer flex-1 min-w-[200px]">
                            <input 
                                type="checkbox"
                                checked={evaluation.showResultsToStudent}
                                onChange={(e) => setEvaluation({...evaluation, showResultsToStudent: e.target.checked})}
                                className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                            />
                            <div>
                                <span className="block font-semibold text-gray-800">Mostrar resultados al estudiante</span>
                                <span className="block text-xs text-gray-500">Verá sus aciertos y errores al terminar.</span>
                            </div>
                        </label>
                        
                        <div className="flex gap-4 border-l border-gray-200 pl-6 flex-1 min-w-[300px]">
                            <div className="flex-1">
                                <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Intentos Permitidos</label>
                                <input 
                                    type="number" 
                                    min="0"
                                    value={evaluation.maxAttempts ?? 1}
                                    onChange={(e) => setEvaluation({...evaluation, maxAttempts: parseInt(e.target.value) || 0})}
                                    title="0 significa intentos ilimitados"
                                    className="w-full border border-gray-300 rounded-lg p-2 text-sm text-gray-900 bg-white"
                                />
                                <span className="text-[10px] text-gray-400">0 = Ilimitados</span>
                            </div>
                            <div className="flex-1">
                                <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Preguntas por intento</label>
                                <input 
                                    type="number" 
                                    min="0"
                                    max={evaluation.questions.length}
                                    value={evaluation.questionsPerAttempt ?? 0}
                                    onChange={(e) => setEvaluation({...evaluation, questionsPerAttempt: parseInt(e.target.value) || 0})}
                                    title="0 significa mostrar todas las preguntas"
                                    className="w-full border border-gray-300 rounded-lg p-2 text-sm text-gray-900 bg-white"
                                />
                                <span className="text-[10px] text-gray-400">0 = Mostrar Todas ({evaluation.questions.length})</span>
                            </div>
                        </div>

                        <div className="pl-4">
                            <button
                                onClick={() => {
                                    if (window.confirm("¿Seguro que quieres borrar todas las preguntas y deshabilitar el cuestionario?")) {
                                        setEvaluation({ ...evaluation, enabled: false, questions: [] });
                                        onClose();
                                    }
                                }}
                                className="text-sm text-red-600 hover:text-red-700 font-medium px-4 py-2 rounded-lg hover:bg-red-50 border border-transparent hover:border-red-200 transition whitespace-nowrap"
                            >
                                Deshabilitar Cuestionario
                            </button>
                        </div>
                    </div>

                    {/* AI Wizard Panel */}
                    {onGenerateAI && (
                        <div className="mb-6 bg-indigo-50 border border-indigo-100 rounded-xl p-5 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10 text-indigo-600">
                                <span className="text-6xl">🧠</span>
                            </div>
                            <h4 className="font-bold text-indigo-900 mb-4 relative z-10 flex items-center gap-2">
                                <span>✨</span> Asistente Mágico con IA
                            </h4>
                            <div className="flex gap-4 items-end relative z-10">
                                <div className="flex-1 max-w-[200px]">
                                    <label className="block text-xs font-semibold text-indigo-700 mb-1">Opción Múltiple</label>
                                    <input 
                                        type="number" 
                                        min="0" max="10"
                                        value={aiConfig.multipleChoice}
                                        onChange={(e) => setAiConfig({...aiConfig, multipleChoice: parseInt(e.target.value) || 0})}
                                        className="w-full border border-indigo-200 rounded-lg p-2 text-sm text-gray-900 bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                                    />
                                </div>
                                <div className="flex-1 max-w-[200px]">
                                    <label className="block text-xs font-semibold text-indigo-700 mb-1">Preguntas Abiertas</label>
                                    <input 
                                        type="number" 
                                        min="0" max="5"
                                        value={aiConfig.openEnded}
                                        onChange={(e) => setAiConfig({...aiConfig, openEnded: parseInt(e.target.value) || 0})}
                                        className="w-full border border-indigo-200 rounded-lg p-2 text-sm text-gray-900 bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                                    />
                                </div>
                                <button
                                    onClick={handleGenerateClick}
                                    disabled={isGenerating || (aiConfig.multipleChoice === 0 && aiConfig.openEnded === 0)}
                                    className="px-6 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 shadow-sm disabled:opacity-50 transition"
                                >
                                    {isGenerating ? 'Generando...' : 'Generar Preguntas'}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Lista de Preguntas */}
                    <div className="space-y-6 mb-6">
                        {evaluation.questions.length === 0 ? (
                            <div className="text-center py-12 text-gray-500 bg-white rounded-xl border border-dashed border-gray-300">
                                <span className="text-4xl mb-4 block">📝</span>
                                <p className="font-medium">No hay preguntas en este cuestionario todavía.</p>
                                <p className="text-sm mt-1">Usa el asistente de IA arriba o añade preguntas manualmente abajo.</p>
                            </div>
                        ) : (
                            evaluation.questions.map((q, index) => (
                                <div key={q.id} className="bg-white border border-gray-200 rounded-xl p-5 relative group shadow-sm hover:border-blue-300 transition-colors">
                                    <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => handleDeleteQuestion(index)}
                                            className="p-2 text-gray-400 hover:text-red-600 bg-gray-50 hover:bg-red-50 rounded-lg border border-gray-200 hover:border-red-200"
                                            title="Eliminar pregunta"
                                        >
                                            🗑️
                                        </button>
                                    </div>

                                    <div className="mb-4 pr-16">
                                        <label className="flex items-center gap-2 text-sm font-bold text-gray-800 mb-2">
                                            <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-md text-xs">{index + 1}</span>
                                            {q.type === 'multiple_choice' ? 'Opción Múltiple' : 'Pregunta Abierta'}
                                        </label>
                                        <textarea
                                            value={q.question}
                                            onChange={(e) => handleUpdateQuestion(index, { ...q, question: e.target.value })}
                                            className="w-full border border-gray-300 rounded-lg p-3 text-base font-medium text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none resize-y min-h-[80px]"
                                            placeholder="Escribe la pregunta aquí..."
                                        />
                                    </div>

                                    {q.type === 'multiple_choice' && (
                                        <div className="space-y-3 pl-4 border-l-4 border-blue-100 ml-2">
                                            {q.options.map((opt, optIndex) => (
                                                <div key={optIndex} className="flex items-center gap-3">
                                                    <input
                                                        type="radio"
                                                        name={`correct_${q.id}`}
                                                        checked={q.correctAnswer === optIndex}
                                                        onChange={() => handleUpdateQuestion(index, { ...q, correctAnswer: optIndex })}
                                                        className="w-5 h-5 text-blue-600 cursor-pointer"
                                                        title="Marcar como respuesta correcta"
                                                    />
                                                    <input
                                                        type="text"
                                                        value={opt}
                                                        onChange={(e) => {
                                                            const newOpts = [...q.options];
                                                            newOpts[optIndex] = e.target.value;
                                                            handleUpdateQuestion(index, { ...q, options: newOpts });
                                                        }}
                                                        className={`flex-1 border ${q.correctAnswer === optIndex ? 'border-blue-500 bg-blue-50 text-blue-900 font-medium' : 'border-gray-300 bg-white text-gray-700'} rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-colors`}
                                                        placeholder={`Opción ${optIndex + 1}`}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {q.type === 'open_ended' && (
                                        <div className="pl-4 border-l-4 border-green-100 ml-2">
                                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-gray-400 text-sm italic text-center">
                                                🖊️ El estudiante verá un área de texto grande para responder a esta pregunta.
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>

                    {/* Controles Manuales */}
                    <div className="flex gap-3 justify-center py-4">
                        <button
                            onClick={() => handleAddQuestion('multiple_choice')}
                            className="px-5 py-2.5 bg-white border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 shadow-sm flex items-center gap-2 transition"
                        >
                            <span>+</span> Añadir Opción Múltiple
                        </button>
                        <button
                            onClick={() => handleAddQuestion('open_ended')}
                            className="px-5 py-2.5 bg-white border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 shadow-sm flex items-center gap-2 transition"
                        >
                            <span>+</span> Añadir Pregunta Abierta
                        </button>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-gray-200 bg-white flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-500">
                        {evaluation.questions.length} preguntas en total
                    </span>
                    <button
                        onClick={onClose}
                        className="px-8 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-md transition"
                    >
                        Guardar Cuestionario
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EvaluationModal;
