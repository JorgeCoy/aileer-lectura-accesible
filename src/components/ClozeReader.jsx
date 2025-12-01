import React, { useState, useEffect } from 'react';
import { CheckCircleIcon, ArrowPathIcon } from '@heroicons/react/24/solid';

const ClozeReader = ({ text, theme, fontSize, fontFamily }) => {
    const [words, setWords] = useState([]);
    const [userAnswers, setUserAnswers] = useState({});
    const [score, setScore] = useState(null);
    const [showResults, setShowResults] = useState(false);

    useEffect(() => {
        if (text) {
            generateTest(text);
        }
    }, [text]);

    const generateTest = (originalText) => {
        const allWords = originalText.split(/\s+/);
        const newWords = allWords.map((word, index) => {
            // Remove words longer than 3 chars with 20% probability
            const shouldRemove = word.length > 3 && Math.random() < 0.2;
            return {
                original: word.replace(/[.,;?!:]/g, ''),
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
        setUserAnswers(prev => ({ ...prev, [id]: value }));
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
    };

    // Theme styles
    const isDark = ['cinematic', 'cosmic', 'forest', 'ocean'].includes(theme);
    const textColor = isDark ? 'text-gray-200' : 'text-gray-800';
    const inputBg = isDark ? 'bg-white/10 text-white border-white/30' : 'bg-indigo-50 text-indigo-900 border-indigo-300';

    return (
        <div
            className="w-full h-full overflow-y-auto p-8 custom-scrollbar flex flex-col items-center"
            style={{ fontFamily }}
        >
            <div className="max-w-4xl w-full mb-8">
                <div className="flex justify-between items-center mb-6 sticky top-0 z-10 p-4 rounded-xl backdrop-blur-md bg-white/10 border border-white/20 shadow-lg">
                    <h2 className={`text-xl font-bold ${textColor}`}>Ejercicio de Memoria</h2>
                    <div className="flex gap-4 items-center">
                        {showResults && (
                            <span className={`px-3 py-1 rounded-full font-bold ${score >= 70 ? 'bg-green-500 text-white' : 'bg-orange-500 text-white'}`}>
                                {score}% Aciertos
                            </span>
                        )}
                        {!showResults ? (
                            <button
                                onClick={checkAnswers}
                                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold flex items-center gap-2 transition"
                            >
                                <CheckCircleIcon className="w-5 h-5" /> Verificar
                            </button>
                        ) : (
                            <button
                                onClick={() => generateTest(text)}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold flex items-center gap-2 transition"
                            >
                                <ArrowPathIcon className="w-5 h-5" /> Nuevo Test
                            </button>
                        )}
                    </div>
                </div>

                <div
                    className={`leading-loose ${textColor}`}
                    style={{ fontSize: `${fontSize}px` }}
                >
                    {words.map((word) => (
                        <span key={word.id} className="inline-block mr-1.5">
                            {word.isMissing ? (
                                showResults ? (
                                    <span className={`font-bold px-1 rounded ${(userAnswers[word.id] || '').toLowerCase().trim() === word.original.toLowerCase()
                                        ? 'text-green-600 bg-green-100'
                                        : 'text-red-500 bg-red-100 line-through'
                                        }`}>
                                        {word.original}
                                        {(userAnswers[word.id] || '').toLowerCase().trim() !== word.original.toLowerCase() && (
                                            <span className="text-gray-500 text-xs ml-1">({userAnswers[word.id]})</span>
                                        )}
                                    </span>
                                ) : (
                                    <input
                                        type="text"
                                        className={`border-b-2 px-1 w-24 text-center focus:outline-none focus:border-indigo-500 transition-colors rounded ${inputBg}`}
                                        value={userAnswers[word.id] || ''}
                                        onChange={(e) => handleInputChange(word.id, e.target.value)}
                                        placeholder="___"
                                        autoComplete="off"
                                    />
                                )
                            ) : (
                                <span>{word.display}</span>
                            )}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ClozeReader;
