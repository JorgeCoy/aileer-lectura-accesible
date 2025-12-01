import React, { useState, useContext } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeftIcon, ChevronRightIcon, PlayIcon, CheckCircleIcon, ClockIcon } from '@heroicons/react/24/outline';
import AppContext from '../context/AppContext';
import { STUDY_PLANS } from '../data/studyPlans';

const ModuleSessionNavigator = ({ planId, moduleId, mode = 'practice', onStartSession }) => {
    const { studyPlan, goToView } = useContext(AppContext);
    const [currentSessionIndex, setCurrentSessionIndex] = useState(0);

    const plan = STUDY_PLANS[planId];
    const module = plan?.modules?.find(m => m.id === parseInt(moduleId));

    if (!module) {
        return <div>Módulo no encontrado</div>;
    }

    const sessions = module.sessions || [];
    const currentSession = sessions[currentSessionIndex];

    const moduleProgress = studyPlan.getModuleProgress(planId, moduleId);
    const completedSessions = moduleProgress.completedSessions;
    const totalSessions = moduleProgress.totalSessions;

    // Determinar qué sesiones están disponibles
    const availableSessions = mode === 'reinforce' ? totalSessions : Math.min(completedSessions + 1, totalSessions);

    const startCurrentSession = () => {
        if (currentSession) {
            // Set active session in state
            studyPlan.startSession(currentSession);

            // Navigate to reading view with session context
            const viewName = 'adult'; // TODO: determine based on user age
            goToView(viewName, {
                session: currentSession,
                moduleId,
                planId,
                sessionIndex: currentSessionIndex,
                mode
            });
        }
    };

    const nextSession = () => {
        if (currentSessionIndex < sessions.length - 1) {
            setCurrentSessionIndex(currentSessionIndex + 1);
        }
    };

    const prevSession = () => {
        if (currentSessionIndex > 0) {
            setCurrentSessionIndex(currentSessionIndex - 1);
        }
    };

    const isSessionCompleted = (index) => {
        return mode === 'reinforce' || index < completedSessions;
    };

    const isSessionAvailable = (index) => {
        return mode === 'reinforce' || index <= completedSessions;
    };

    return (
        <div className="bg-white rounded-xl shadow-lg p-6 max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">{module.title}</h2>
                        <p className="text-gray-600">{module.description}</p>
                    </div>
                    <div className="text-right">
                        <div className="text-sm text-gray-600">Progreso del módulo</div>
                        <div className="text-lg font-bold text-indigo-600">
                            {completedSessions}/{totalSessions} sesiones
                        </div>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                    <motion.div
                        className="bg-indigo-500 h-3 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${(completedSessions / totalSessions) * 100}%` }}
                        transition={{ duration: 0.5 }}
                    />
                </div>

                {/* Mode Indicator */}
                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold ${mode === 'reinforce'
                        ? 'bg-orange-100 text-orange-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                    {mode === 'reinforce' ? '🔄 Modo Refuerzo' : '🎯 Modo Práctica'}
                </div>
            </div>

            {/* Session Grid */}
            <div className="grid grid-cols-5 md:grid-cols-10 gap-3 mb-6">
                {sessions.map((session, index) => {
                    const isCompleted = isSessionCompleted(index);
                    const isAvailable = isSessionAvailable(index);
                    const isCurrent = index === currentSessionIndex;

                    return (
                        <button
                            key={index}
                            onClick={() => isAvailable && setCurrentSessionIndex(index)}
                            disabled={!isAvailable}
                            className={`aspect-square rounded-lg border-2 flex items-center justify-center transition-all ${isCompleted
                                    ? 'bg-green-500 border-green-600 text-white'
                                    : isCurrent
                                        ? 'bg-indigo-500 border-indigo-600 text-white'
                                        : isAvailable
                                            ? 'bg-indigo-100 border-indigo-300 text-indigo-600 hover:bg-indigo-200'
                                            : 'bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed'
                                }`}
                        >
                            {isCompleted ? (
                                <CheckCircleIcon className="w-6 h-6" />
                            ) : (
                                <span className="text-sm font-bold">{index + 1}</span>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Current Session Details */}
            {currentSession && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gray-50 rounded-lg p-6 mb-6"
                >
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <h3 className="text-xl font-bold text-gray-800 mb-2">
                                Sesión {currentSessionIndex + 1}: {currentSession.title}
                            </h3>
                            <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                                <div className="flex items-center gap-1">
                                    <ClockIcon className="w-4 h-4" />
                                    <span>{currentSession.duration} minutos</span>
                                </div>
                                <div>+{currentSession.xp} XP</div>
                            </div>

                            {/* Session Info */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                <div className="bg-white p-3 rounded-lg">
                                    <div className="font-semibold text-gray-700">Técnica</div>
                                    <div className="text-indigo-600 capitalize">{currentSession.config?.technique || 'General'}</div>
                                </div>
                                <div className="bg-white p-3 rounded-lg">
                                    <div className="font-semibold text-gray-700">Velocidad</div>
                                    <div className="text-green-600">{currentSession.config?.speed || 200} WPM</div>
                                </div>
                                <div className="bg-white p-3 rounded-lg">
                                    <div className="font-semibold text-gray-700">Estado</div>
                                    <div className={`capitalize ${isSessionCompleted(currentSessionIndex)
                                            ? 'text-green-600'
                                            : 'text-indigo-600'
                                        }`}>
                                        {isSessionCompleted(currentSessionIndex) ? 'Completada' : 'Pendiente'}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="ml-6 flex flex-col gap-3">
                            {/* Navigation Buttons */}
                            <div className="flex gap-2">
                                <button
                                    onClick={prevSession}
                                    disabled={currentSessionIndex === 0}
                                    className="p-2 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400 rounded-lg transition-colors"
                                >
                                    <ChevronLeftIcon className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={nextSession}
                                    disabled={currentSessionIndex === sessions.length - 1}
                                    className="p-2 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400 rounded-lg transition-colors"
                                >
                                    <ChevronRightIcon className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Start Session Button */}
                            <button
                                onClick={startCurrentSession}
                                disabled={!isSessionAvailable(currentSessionIndex)}
                                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white rounded-lg font-semibold transition-colors flex items-center gap-2"
                            >
                                <PlayIcon className="w-5 h-5" />
                                {isSessionCompleted(currentSessionIndex) ? 'Repetir Sesión' : 'Iniciar Sesión'}
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Module Completion Message */}
            {completedSessions >= totalSessions && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                    <CheckCircleIcon className="w-12 h-12 text-green-500 mx-auto mb-3" />
                    <h3 className="text-lg font-bold text-green-800 mb-2">
                        ¡Módulo Completado! 🎉
                    </h3>
                    <p className="text-green-700 mb-4">
                        Has completado todas las sesiones de "{module.title}".
                        ¡Sigue practicando para mantener tus habilidades!
                    </p>
                    <div className="flex gap-3 justify-center">
                        <button
                            onClick={() => goToView('dashboard')}
                            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                        >
                            Volver al Mapa
                        </button>
                        <button
                            onClick={() => onStartSession({ planId, moduleId: parseInt(moduleId) + 1, mode: 'practice' })}
                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
                        >
                            Siguiente Módulo
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ModuleSessionNavigator;

