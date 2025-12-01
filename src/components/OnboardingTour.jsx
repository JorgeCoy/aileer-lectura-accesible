import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRightIcon, XMarkIcon, CheckCircleIcon } from '@heroicons/react/24/solid';

const OnboardingTour = ({ onComplete }) => {
    const [currentStep, setCurrentStep] = useState(0);

    const steps = [
        {
            id: 'sidebar',
            title: 'Tu Espacio Personal',
            description: 'Aquí encontrarás todas tus herramientas: Configuración, Historial y tus Modos de Lectura.',
            icon: '🛠️',
            color: 'bg-blue-500'
        },
        {
            id: 'map',
            title: 'Tu Camino de Aprendizaje',
            description: 'Sigue el mapa para desbloquear nuevos niveles y ganar experiencia mientras mejoras tu lectura.',
            icon: '🗺️',
            color: 'bg-green-500'
        },
        {
            id: 'reader',
            title: 'Lector Inteligente',
            description: 'Usa técnicas avanzadas como RSVP y Bionic Reading para leer más rápido y comprender mejor.',
            icon: '📖',
            color: 'bg-purple-500'
        }
    ];

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            onComplete();
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden relative"
            >
                {/* Close Button */}
                <button
                    onClick={onComplete}
                    className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors z-10"
                >
                    <XMarkIcon className="w-6 h-6 text-gray-400" />
                </button>

                {/* Content */}
                <div className="p-8 text-center">
                    <AnimatePresence mode='wait'>
                        <motion.div
                            key={currentStep}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                        >
                            <div className={`w-24 h-24 mx-auto rounded-full ${steps[currentStep].color} flex items-center justify-center text-4xl mb-6 shadow-lg`}>
                                {steps[currentStep].icon}
                            </div>

                            <h2 className="text-2xl font-bold text-gray-800 mb-3">
                                {steps[currentStep].title}
                            </h2>

                            <p className="text-gray-600 text-lg leading-relaxed mb-8">
                                {steps[currentStep].description}
                            </p>
                        </motion.div>
                    </AnimatePresence>

                    {/* Indicators */}
                    <div className="flex justify-center gap-2 mb-8">
                        {steps.map((_, index) => (
                            <div
                                key={index}
                                className={`h-2 rounded-full transition-all duration-300 ${index === currentStep ? 'w-8 bg-indigo-600' : 'w-2 bg-gray-300'
                                    }`}
                            />
                        ))}
                    </div>

                    {/* Action Button */}
                    <button
                        onClick={handleNext}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:scale-[1.02]"
                    >
                        {currentStep === steps.length - 1 ? (
                            <>
                                ¡Empezar! <CheckCircleIcon className="w-6 h-6" />
                            </>
                        ) : (
                            <>
                                Siguiente <ChevronRightIcon className="w-6 h-6" />
                            </>
                        )}
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default OnboardingTour;
