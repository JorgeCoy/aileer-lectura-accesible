import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid';

const ActiveRecallModal = ({ isOpen, question, onComplete }) => {
    const [selectedOption, setSelectedOption] = useState(null);
    const [isCorrect, setIsCorrect] = useState(null); // null, true, false

    if (!isOpen || !question) return null;

    const handleOptionClick = (index) => {
        if (isCorrect === true) return; // Prevent changing after correct answer

        setSelectedOption(index);

        if (index === question.correctAnswer) {
            setIsCorrect(true);
            // Wait a moment to show success state before completing
            setTimeout(() => {
                onComplete(true);
                // Reset state for next time
                setSelectedOption(null);
                setIsCorrect(null);
            }, 1500);
        } else {
            setIsCorrect(false);
            // Optional: Shake effect or message
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden"
            >
                <div className="p-6">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        🧠 Active Recall
                    </h2>
                    <p className="text-gray-600 dark:text-gray-300 mb-6">
                        Demuestra que entendiste lo que leíste.
                    </p>

                    <div className="mb-6">
                        <h3 className="text-xl font-medium text-gray-800 dark:text-gray-100 mb-4">
                            {question.text}
                        </h3>

                        <div className="space-y-3">
                            {question.options.map((option, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleOptionClick(index)}
                                    disabled={isCorrect === true}
                                    className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 flex justify-between items-center
                                        ${selectedOption === index
                                            ? isCorrect === true
                                                ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                                                : isCorrect === false
                                                    ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                                                    : 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                            : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700'
                                        }
                                    `}
                                >
                                    <span className={`font-medium ${selectedOption === index ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'}`}>
                                        {option}
                                    </span>

                                    {selectedOption === index && isCorrect === true && (
                                        <CheckCircleIcon className="w-6 h-6 text-green-500" />
                                    )}
                                    {selectedOption === index && isCorrect === false && (
                                        <XCircleIcon className="w-6 h-6 text-red-500" />
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {isCorrect === false && (
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center text-red-500 font-medium"
                        >
                            Inténtalo de nuevo. Tú puedes.
                        </motion.p>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default ActiveRecallModal;
