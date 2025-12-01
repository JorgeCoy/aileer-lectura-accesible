import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircleIcon, XCircleIcon, ArrowPathIcon } from '@heroicons/react/24/solid';

const MemoryTestModal = ({ isOpen, onClose, text, onComplete }) => {
    const [words, setWords] = useState([]);
    const [userAnswers, setUserAnswers] = useState({});
    const [score, setScore] = useState(null);
    const [showResults, setShowResults] = useState(false);

    useEffect(() => {
        if (isOpen && text) {
            generateTest(text);
        }
    }, [isOpen, text]);

    const generateTest = (originalText) => {
        const allWords = originalText.split(/\s+/);
        // Select random words to remove (e.g., every 5th word or random 20%)
        const newWords = allWords.map((word, index) => {
            // Simple logic: remove words longer than 3 chars with 20% probability
            const shouldRemove = word.length > 3 && Math.random() < 0.2;
            return {
                original: word.replace(/[.,;?!:]/g, ''), // Clean punctuation for checking
                display: word,
                isMissing: shouldRemove,
                id: index
            };
        });
        setWords(newWords);
        setUserAnswers({});
        setScore(null);
        setShowResults(false);
    };

    const handleInputChange = (id, value) => {
        setUserAnswers(prev => ({
            ...prev,
            [id]: value
        }));
    };

    const checkAnswers = () => {
        let correctCount = 0;
        let totalMissing = 0;

        words.forEach(word => {
            if (word.isMissing) {
                totalMissing++;
                const userAnswer = userAnswers[word.id] || '';
                if (userAnswer.toLowerCase().trim() === word.original.toLowerCase()) {
                    correctCount++;
                }
            }
        });

        const calculatedScore = Math.round((correctCount / totalMissing) * 100) || 0;
        setScore(calculatedScore);
        setShowResults(true);
        if (onComplete) onComplete(calculatedScore);
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col"
                >
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-indigo-50">
                        <h2 className="text-2xl font-bold text-indigo-900">🧠 Ejercicio de Memoria</h2>
                        {showResults && (
                            <div className={`px-4 py-1 rounded-full text-sm font-bold ${score >= 70 ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                                Puntuación: {score}%
                            </div>
                        )}
                    </div>

                    <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
                        <p className="text-gray-600 mb-6 text-sm">
                            Completa los espacios en blanco con las palabras que faltan del texto que acabas de leer.
                        </p>

                        <div className="leading-loose text-lg text-gray-800">
                            {words.map((word, index) => (
                                <span key={word.id} className="inline-block mr-1">
                                    {word.isMissing ? (
                                        showResults ? (
                                            <span className={`font-bold px-1 rounded ${(userAnswers[word.id] || '').toLowerCase().trim() === word.original.toLowerCase()
                                                    ? 'text-green-600 bg-green-50'
                                                    : 'text-red-500 bg-red-50 line-through'
                                                }`}>
                                                {word.original}
                                                {(userAnswers[word.id] || '').toLowerCase().trim() !== word.original.toLowerCase() && (
                                                    <span className="text-gray-400 text-xs ml-1">({userAnswers[word.id]})</span>
                                                )}
                                            </span>
                                        ) : (
                                            <input
                                                type="text"
                                                className="border-b-2 border-indigo-300 bg-indigo-50 px-1 w-24 text-center focus:outline-none focus:border-indigo-600 text-indigo-900 transition-colors"
                                                value={userAnswers[word.id] || ''}
                                                onChange={(e) => handleInputChange(word.id, e.target.value)}
                                                placeholder="___"
                                            />
                                        )
                                    ) : (
                                        <span>{word.display}</span>
                                    )}
                                </span>
                            ))}
                        </div>
                    </div>

                    <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
                        >
                            Cerrar
                        </button>
                        {!showResults ? (
                            <button
                                onClick={checkAnswers}
                                className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 transition-all transform hover:scale-105 flex items-center gap-2"
                            >
                                <CheckCircleIcon className="w-5 h-5" />
                                Verificar
                            </button>
                        ) : (
                            <button
                                onClick={() => generateTest(text)}
                                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-200 transition-all transform hover:scale-105 flex items-center gap-2"
                            >
                                <ArrowPathIcon className="w-5 h-5" />
                                Reintentar
                            </button>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default MemoryTestModal;
