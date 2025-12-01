import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { EyeIcon, XMarkIcon } from '@heroicons/react/24/outline';

const PreviewOverlay = ({ text, onStartReading, onCancel, duration = 5000 }) => {
    const [timeLeft, setTimeLeft] = useState(duration / 1000);
    const [keywords, setKeywords] = useState([]);

    // Algoritmo simple para extraer palabras clave
    useEffect(() => {
        if (!text) return;

        const words = text.split(/\s+/);
        const uniqueKeywords = new Set();

        words.forEach(word => {
            // Limpiar puntuación
            const cleanWord = word.replace(/[.,;?!:()"]/g, '');

            // Criterios para ser palabra clave:
            // 1. Longitud > 4
            // 2. Empieza con mayúscula (nombres propios, inicio de oraciones importantes)
            // 3. O está en una lista de palabras comunes "importantes" (opcional, por ahora simple)
            if (cleanWord.length > 5 || (cleanWord.length > 3 && /^[A-Z]/.test(cleanWord))) {
                uniqueKeywords.add(cleanWord);
            }
        });

        setKeywords(Array.from(uniqueKeywords));
    }, [text]);

    // Timer
    useEffect(() => {
        if (timeLeft <= 0) {
            onStartReading();
            return;
        }

        const timer = setInterval(() => {
            setTimeLeft(prev => prev - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft, onStartReading]);

    const isKeyword = (word) => {
        const cleanWord = word.replace(/[.,;?!:()"]/g, '');
        return keywords.includes(cleanWord);
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-40 bg-white/95 backdrop-blur-sm flex flex-col items-center justify-center p-8"
        >
            <div className="max-w-4xl w-full h-full flex flex-col">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-indigo-100 rounded-full">
                            <EyeIcon className="w-8 h-8 text-indigo-600" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">Modo Preview</h2>
                            <p className="text-gray-500">Escanea las palabras clave antes de empezar</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-4xl font-bold text-indigo-600 font-mono">
                            {timeLeft}s
                        </div>
                        <button
                            onClick={onStartReading}
                            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                        >
                            Empezar Ya
                        </button>
                        <button
                            onClick={onCancel}
                            className="p-2 hover:bg-gray-100 rounded-full text-gray-500"
                        >
                            <XMarkIcon className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8 bg-gray-50 rounded-2xl shadow-inner text-lg leading-relaxed text-gray-400">
                    {text.split(/\s+/).map((word, index) => {
                        const highlight = isKeyword(word);
                        return (
                            <span
                                key={index}
                                className={`inline-block mr-1.5 transition-all duration-500 ${highlight
                                        ? 'text-gray-900 font-bold scale-105 transform bg-yellow-100 px-1 rounded'
                                        : 'blur-[1px] opacity-60'
                                    }`}
                            >
                                {word}
                            </span>
                        );
                    })}
                </div>
            </div>
        </motion.div>
    );
};

export default PreviewOverlay;
