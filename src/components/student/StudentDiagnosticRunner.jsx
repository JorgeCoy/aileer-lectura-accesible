import React, { useState, useEffect } from 'react';
import FirebaseBackendService from '../../services/FirebaseBackendService';

const SAMPLE_TEXT = `En una pequeña aldea en las montañas de los Andes, la joven Valentina descubrió un antiguo observatorio astronómico abandonado. Guiada por la curiosidad y la luz de la luna llena, Valentina restauró los viejos telescopios de bronce y documentó el movimiento de las estrellas. Su hallazgo no solo inspiró a la comunidad local a estudiar las ciencias, sino que también demostró cómo la determinación y la pasión por la lectura pueden abrir las puertas hacia el conocimiento del universo.`;

const QUESTIONS = [
    {
        id: 1,
        question: "¿En dónde encontró Valentina el antiguo observatorio?",
        options: ["En la costa del mar", "En las montañas de los Andes", "En el centro de una ciudad", "En una cueva oscura"],
        correct: 1 // Literal
    },
    {
        id: 2,
        question: "¿Qué elemento utilizó Valentina para guiarse durante su hallazgo?",
        options: ["Una linterna solar", "La luz de la luna llena", "Un mapa de papel", "El fuego de una fogata"],
        correct: 1 // Inferencial
    },
    {
        id: 3,
        question: "¿Qué lección principal transmite la historia de Valentina?",
        options: ["Que los telescopios viejos no funcionan", "Que la lectura y la determinación abren puertas al conocimiento", "Que es peligroso caminar de noche", "Que solo los astrónomos deben estudiar las estrellas"],
        correct: 1 // Crítica
    }
];

const StudentDiagnosticRunner = ({ sessionInfo, onComplete }) => {
    const [step, setStep] = useState('reading'); // 'reading' | 'quiz' | 'finished'
    const [startTime, setStartTime] = useState(null);
    const [endTime, setEndTime] = useState(null);
    const [answers, setAnswers] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [results, setResults] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        setStartTime(Date.now());
    }, []);

    const handleFinishReading = () => {
        setEndTime(Date.now());
        setStep('quiz');
    };

    const handleAnswerSelect = (questionId, optionIndex) => {
        setAnswers(prev => ({ ...prev, [questionId]: optionIndex }));
    };

    const handleSubmitQuiz = async () => {
        if (Object.keys(answers).length < QUESTIONS.length) {
            setError("Por favor responde todas las preguntas antes de enviar.");
            return;
        }

        setError(null);
        setSubmitting(true);

        try {
            // Calcular WPM
            const totalWords = SAMPLE_TEXT.split(/\s+/).length;
            const timeInSeconds = (endTime - startTime) / 1000;
            const timeInMinutes = timeInSeconds / 60 || 0.05;
            const calculatedWpm = Math.round(totalWords / timeInMinutes);

            // Calcular Respuestas Correctas
            let correctCount = 0;
            QUESTIONS.forEach(q => {
                if (answers[q.id] === q.correct) correctCount++;
            });
            const comprehensionScore = Math.round((correctCount / QUESTIONS.length) * 100);

            const resultData = {
                wpm: calculatedWpm,
                score: comprehensionScore,
                correctAnswers: correctCount,
                totalQuestions: QUESTIONS.length,
                readingTimeSeconds: Math.round(timeInSeconds)
            };

            await FirebaseBackendService.submitDiagnosticResult(
                sessionInfo.sessionPin,
                sessionInfo.studentName,
                resultData
            );

            setResults(resultData);
            setStep('finished');
        } catch (err) {
            console.error("Error enviando resultados de diagnóstico:", err);
            setError("Ocurrió un error al guardar tus resultados. Inténtalo de nuevo.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto my-8 p-6 bg-surface border border-border-color rounded-3xl shadow-xl text-text-main">
            
            {/* Header */}
            <div className="flex justify-between items-center pb-4 mb-6 border-b border-border-color">
                <div>
                    <span className="text-xs text-primary font-bold uppercase tracking-wider">Prueba Diagnóstica Exprés</span>
                    <h2 className="text-lg font-bold text-text-main">{sessionInfo.sessionTitle}</h2>
                </div>
                <div className="bg-primary/10 text-primary px-3 py-1 rounded-xl text-xs font-bold">
                    👤 {sessionInfo.studentName}
                </div>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl text-sm text-center font-medium">
                    {error}
                </div>
            )}

            {/* PASO 1: LECTURA */}
            {step === 'reading' && (
                <div className="space-y-6">
                    <p className="text-xs text-text-muted">
                        Lee el siguiente texto a tu ritmo normal. Al finalizar, haz clic en "Comenzar Preguntas".
                    </p>
                    <div className="p-6 bg-surface-elevated border border-border-color rounded-2xl text-base leading-relaxed text-text-main font-serif">
                        {SAMPLE_TEXT}
                    </div>
                    <div className="flex justify-end">
                        <button
                            onClick={handleFinishReading}
                            className="px-6 py-3 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl transition shadow-lg shadow-primary/30"
                        >
                            Comenzar Preguntas ➔
                        </button>
                    </div>
                </div>
            )}

            {/* PASO 2: CUESTIONARIO */}
            {step === 'quiz' && (
                <div className="space-y-6">
                    <p className="text-xs text-text-muted">
                        Responde las preguntas de comprensión basadas en la lectura.
                    </p>

                    <div className="space-y-6">
                        {QUESTIONS.map((q, idx) => (
                            <div key={q.id} className="p-4 bg-surface-elevated border border-border-color rounded-2xl">
                                <h3 className="text-sm font-bold text-text-main mb-3">
                                    {idx + 1}. {q.question}
                                </h3>
                                <div className="space-y-2">
                                    {q.options.map((opt, oIdx) => (
                                        <button
                                            key={oIdx}
                                            type="button"
                                            onClick={() => handleAnswerSelect(q.id, oIdx)}
                                            className={`w-full text-left p-3 rounded-xl text-xs font-medium border transition ${
                                                answers[q.id] === oIdx
                                                    ? 'bg-primary/10 border-primary text-primary font-bold'
                                                    : 'bg-surface border-border-color text-text-main hover:bg-surface-elevated'
                                            }`}
                                        >
                                            {opt}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="flex justify-end pt-4">
                        <button
                            onClick={handleSubmitQuiz}
                            disabled={submitting}
                            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition shadow-lg shadow-emerald-600/30 disabled:opacity-50"
                        >
                            {submitting ? 'Guardando Resultados...' : '✅ Enviar Diagnóstico'}
                        </button>
                    </div>
                </div>
            )}

            {/* PASO 3: RESULTADOS / FINALIZADO */}
            {step === 'finished' && results && (
                <div className="text-center space-y-6 py-6">
                    <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto text-3xl">
                        🎉
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-text-main">¡Diagnóstico Completado!</h2>
                        <p className="text-xs text-text-muted mt-1">Tus resultados fueron transmitidos al panel de tu profesor.</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto my-6">
                        <div className="p-4 bg-surface-elevated border border-border-color rounded-2xl">
                            <span className="text-xs text-text-muted block">Velocidad</span>
                            <span className="text-2xl font-black text-emerald-400">{results.wpm}</span>
                            <span className="text-xs text-text-muted block">Palabras por Minuto</span>
                        </div>
                        <div className="p-4 bg-surface-elevated border border-border-color rounded-2xl">
                            <span className="text-xs text-text-muted block">Comprensión</span>
                            <span className="text-2xl font-black text-indigo-400">{results.score}%</span>
                            <span className="text-xs text-text-muted block">{results.correctAnswers}/{results.totalQuestions} Aciertos</span>
                        </div>
                    </div>

                    <button
                        onClick={() => window.location.href = '/'}
                        className="px-6 py-2.5 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl transition"
                    >
                        Volver al Inicio
                    </button>
                </div>
            )}
        </div>
    );
};

export default StudentDiagnosticRunner;
