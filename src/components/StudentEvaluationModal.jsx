import React, { useState, useEffect, useMemo } from 'react';

const StudentEvaluationModal = ({ evaluation, onClose, onSubmit }) => {
    // 1. Logica de Banco de Preguntas: Barajar y escoger las preguntas para este intento
    const questionsForAttempt = useMemo(() => {
        if (!evaluation || !evaluation.questions || evaluation.questions.length === 0) return [];
        const allQuestions = [...evaluation.questions];
        
        // Barajar aleatoriamente usando algoritmo Fisher-Yates
        for (let i = allQuestions.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [allQuestions[i], allQuestions[j]] = [allQuestions[j], allQuestions[i]];
        }
        
        // Determinar cuántas preguntas mostrar (0 = todas)
        const limit = evaluation.questionsPerAttempt > 0 ? evaluation.questionsPerAttempt : allQuestions.length;
        
        // Envolver cada pregunta con una ID única para el intento, y barajar también las opciones
        return allQuestions.slice(0, limit).map(q => {
            let shuffledOptions = q.options;
            let correctOptionIndex = q.correctAnswer;

            // Si es opción múltiple, barajar las respuestas para que no memoricen la "A" o la "B"
            if (q.type === 'multiple_choice' && q.options) {
                const optionsWithOriginalIndices = q.options.map((opt, idx) => ({ text: opt, originalIndex: idx }));
                for (let i = optionsWithOriginalIndices.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [optionsWithOriginalIndices[i], optionsWithOriginalIndices[j]] = [optionsWithOriginalIndices[j], optionsWithOriginalIndices[i]];
                }
                shuffledOptions = optionsWithOriginalIndices.map(o => o.text);
                correctOptionIndex = optionsWithOriginalIndices.findIndex(o => o.originalIndex === q.correctAnswer);
            }

            return {
                ...q,
                displayOptions: shuffledOptions,
                displayCorrectAnswer: correctOptionIndex
            };
        });
    }, [evaluation]);

    const [answers, setAnswers] = useState({});
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [score, setScore] = useState({ correct: 0, total: 0 });

    const handleAnswerChange = (questionId, value) => {
        if (isSubmitted) return;
        setAnswers(prev => ({
            ...prev,
            [questionId]: value
        }));
    };

    const handleSubmit = () => {
        if (Object.keys(answers).length < questionsForAttempt.length) {
            if (!window.confirm("Aún tienes preguntas sin responder. ¿Seguro que quieres enviar el cuestionario?")) {
                return;
            }
        }

        let correctCount = 0;
        let totalMultipleChoice = 0;

        questionsForAttempt.forEach(q => {
            if (q.type === 'multiple_choice') {
                totalMultipleChoice++;
                if (answers[q.id] === q.displayCorrectAnswer) {
                    correctCount++;
                }
            }
        });

        setScore({ correct: correctCount, total: totalMultipleChoice });
        setIsSubmitted(true);

        // Notificar al padre para guardar progreso (si hay callback)
        if (onSubmit) {
            onSubmit({ answers, score: { correct: correctCount, total: totalMultipleChoice } });
        }
    };

    if (questionsForAttempt.length === 0) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-[100] bg-gray-900/80 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-300">
                
                {/* Header Dinámico */}
                <div className={`px-8 py-6 border-b text-white transition-colors duration-500 ${isSubmitted ? (evaluation.showResultsToStudent ? (score.correct === score.total ? 'bg-gradient-to-r from-green-500 to-emerald-600' : 'bg-gradient-to-r from-blue-500 to-indigo-600') : 'bg-gradient-to-r from-purple-500 to-pink-600') : 'bg-gradient-to-r from-slate-800 to-slate-700'}`}>
                    <div className="flex justify-between items-center">
                        <div>
                            <h2 className="text-2xl font-black tracking-tight flex items-center gap-3">
                                {isSubmitted ? '📝 Resultados de Evaluación' : '📝 Responde el Cuestionario'}
                            </h2>
                            {!isSubmitted && (
                                <p className="text-slate-200 mt-2 font-medium opacity-90">Selecciona la mejor respuesta para cada pregunta.</p>
                            )}
                        </div>
                        {isSubmitted && evaluation.showResultsToStudent && score.total > 0 && (
                            <div className="bg-white/20 backdrop-blur-sm px-6 py-3 rounded-2xl border border-white/30 text-center shadow-inner">
                                <div className="text-sm font-bold uppercase tracking-wider text-white/80 mb-1">Tu Puntaje</div>
                                <div className="text-3xl font-black">
                                    {score.correct} <span className="text-xl text-white/60">/ {score.total}</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Preguntas */}
                <div className="flex-1 overflow-y-auto p-8 bg-slate-50 space-y-8">
                    {questionsForAttempt.map((q, index) => {
                        const isAnswered = answers[q.id] !== undefined;
                        const isMultipleChoice = q.type === 'multiple_choice';
                        const isCorrect = isMultipleChoice && answers[q.id] === q.displayCorrectAnswer;
                        const showFeedback = isSubmitted && evaluation.showResultsToStudent && isMultipleChoice;

                        return (
                            <div 
                                key={q.id} 
                                className={`bg-white border-2 rounded-2xl p-6 transition-all duration-300 shadow-sm
                                    ${showFeedback 
                                        ? (isCorrect ? 'border-green-400 bg-green-50/30' : 'border-red-300 bg-red-50/30') 
                                        : (isAnswered ? 'border-indigo-300 shadow-md' : 'border-slate-200 hover:border-slate-300')
                                    }
                                `}
                            >
                                <h3 className="text-lg font-bold text-slate-800 mb-5 flex gap-3">
                                    <span className={`flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg text-sm font-black
                                        ${showFeedback 
                                            ? (isCorrect ? 'bg-green-500 text-white' : 'bg-red-500 text-white') 
                                            : 'bg-indigo-100 text-indigo-700'
                                        }
                                    `}>
                                        {index + 1}
                                    </span>
                                    <span className="mt-0.5 leading-snug">{q.question}</span>
                                </h3>

                                {isMultipleChoice ? (
                                    <div className="space-y-3 pl-11">
                                        {q.displayOptions.map((opt, optIndex) => {
                                            const isSelected = answers[q.id] === optIndex;
                                            const isActualCorrect = optIndex === q.displayCorrectAnswer;
                                            
                                            // Lógica de colores para feedback
                                            let optionClass = "border-slate-200 hover:border-indigo-300 hover:bg-slate-50";
                                            if (isSelected && !isSubmitted) {
                                                optionClass = "border-indigo-500 bg-indigo-50 ring-1 ring-indigo-500";
                                            } else if (showFeedback) {
                                                if (isActualCorrect) {
                                                    optionClass = "border-green-500 bg-green-50 font-medium text-green-800 ring-1 ring-green-500"; // La correcta siempre resalta en verde
                                                } else if (isSelected && !isActualCorrect) {
                                                    optionClass = "border-red-400 bg-red-50 text-red-700 opacity-80"; // Si la eligió y estaba mal, en rojo
                                                } else {
                                                    optionClass = "border-slate-200 opacity-50 bg-slate-50/50"; // Las demás grises
                                                }
                                            }

                                            return (
                                                <button
                                                    key={optIndex}
                                                    onClick={() => handleAnswerChange(q.id, optIndex)}
                                                    disabled={isSubmitted}
                                                    className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 flex items-center gap-4 ${optionClass}`}
                                                >
                                                    <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center
                                                        ${isSelected ? (showFeedback ? (isActualCorrect ? 'border-green-500' : 'border-red-500') : 'border-indigo-500 bg-indigo-500') : 'border-slate-300'}
                                                    `}>
                                                        {isSelected && !showFeedback && <div className="w-2 h-2 bg-white rounded-full"></div>}
                                                        {showFeedback && isSelected && isActualCorrect && <span className="text-green-500 text-xs">✓</span>}
                                                        {showFeedback && isSelected && !isActualCorrect && <span className="text-red-500 text-xs">✗</span>}
                                                    </div>
                                                    <span className={`text-base ${isSelected && !isSubmitted ? 'font-semibold text-indigo-900' : 'text-slate-700'} ${showFeedback && isActualCorrect ? 'font-bold' : ''}`}>
                                                        {opt}
                                                    </span>
                                                </button>
                                            );
                                        })}
                                        
                                        {showFeedback && !isCorrect && (
                                            <div className="mt-4 p-4 bg-red-100/50 rounded-xl border border-red-200 text-red-800 text-sm flex items-start gap-3">
                                                <span className="text-xl">💡</span>
                                                <div>
                                                    <strong>Respuesta incorrecta.</strong> La respuesta correcta era la opción resaltada en verde.
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="pl-11">
                                        <textarea
                                            value={answers[q.id] || ''}
                                            onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                                            disabled={isSubmitted}
                                            placeholder="Escribe tu respuesta aquí..."
                                            className={`w-full p-4 border-2 rounded-xl h-32 resize-none transition-colors duration-200 outline-none
                                                ${answers[q.id] ? 'border-indigo-300 bg-indigo-50/30' : 'border-slate-200 hover:border-slate-300'}
                                                ${isSubmitted ? 'bg-slate-100 text-slate-600 opacity-90 cursor-not-allowed' : 'focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200'}
                                            `}
                                        />
                                        {isSubmitted && evaluation.showResultsToStudent && (
                                            <div className="mt-3 text-sm text-slate-500 italic">
                                                * Las preguntas abiertas serán revisadas manualmente por el docente.
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Footer Footer */}
                <div className="p-6 border-t border-slate-200 bg-white flex justify-between items-center">
                    {!isSubmitted ? (
                        <>
                            <div className="text-sm font-medium text-slate-500">
                                <span className="text-indigo-600 font-bold">{Object.keys(answers).length}</span> de <span className="font-bold">{questionsForAttempt.length}</span> respondidas
                            </div>
                            <button
                                onClick={handleSubmit}
                                className="px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 hover:shadow-indigo-300 hover:-translate-y-0.5 transition-all duration-200"
                            >
                                Enviar Cuestionario
                            </button>
                        </>
                    ) : (
                        <>
                            <div className="text-sm font-medium text-slate-500">
                                {evaluation.showResultsToStudent ? 'Resultados mostrados. Ya puedes salir.' : 'Tus respuestas han sido enviadas exitosamente.'}
                            </div>
                            <button
                                onClick={onClose}
                                className="px-8 py-3.5 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl shadow-lg hover:-translate-y-0.5 transition-all duration-200"
                            >
                                Finalizar y Volver
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StudentEvaluationModal;
