import React, { useContext, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FireIcon, StarIcon, ArrowLeftIcon } from '@heroicons/react/24/solid';
import AppContext from '../context/AppContext';
import StudyPlanMap from '../components/StudyPlanMap';
import ModuleSessionNavigator from '../components/ModuleSessionNavigator';
import PremiumFeaturesPanel from '../components/PremiumFeaturesPanel';
import { useProgressiveLoader } from '../hooks/useProgressiveLoader.jsx';

const StudyDashboard = ({ selectedModule: initialSelectedModule }) => {
    const { userProfile, goToView, setSidebarMode, streak, studyPlan } = useContext(AppContext);
    const { canUsePremiumFeatures, getPremiumComponent } = useProgressiveLoader();
    const [activePremiumFeature, setActivePremiumFeature] = useState(null);
    const [selectedModule, setSelectedModule] = useState(initialSelectedModule || null);

    // Enforce Study Mode when entering dashboard
    useEffect(() => {
        setSidebarMode('study');
    }, []);

    // Calculate progress based on XP (simplified for now)
    const nextLevelXp = (userProfile.currentLevel === 'beginner' ? 1000 : 5000);
    const progressPercentage = Math.min((userProfile.xp / nextLevelXp) * 100, 100);

    const handleStartSession = (sessionData) => {
        if (typeof sessionData === 'string') {
            // Legacy support for old format - show plan overview
            const level = sessionData;
            studyPlan.startPlan(level);
            setSelectedModule(null); // Show map
        } else {
            // New format with module information
            const { planId, moduleId, mode } = sessionData;

            // Initialize plan if not already started
            if (studyPlan.gameState.currentPlanId !== planId) {
                studyPlan.startPlan(planId);
            }

            // Show module session navigator
            setSelectedModule({ planId, moduleId, mode });
        }
    };

    const handlePremiumFeatureActivated = (featureId, component) => {
        setActivePremiumFeature({ id: featureId, component });
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Header / Stats Bar */}
            <div className="bg-white shadow-sm sticky top-0 z-10">
                <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
                    <button onClick={() => goToView('start')} className="p-2 hover:bg-gray-100 rounded-full">
                        <ArrowLeftIcon className="w-6 h-6 text-gray-600" />
                    </button>

                    <div className="flex items-center gap-6">
                        {/* Streak (Placeholder for now) */}
                        <div className="flex items-center gap-1 text-orange-500 font-bold">
                            <FireIcon className="w-6 h-6 animate-pulse" />
                            <span>{streak?.currentStreak || 0}</span>
                        </div>

                        {/* Level & XP */}
                        <div className="flex items-center gap-3">
                            <div className="flex flex-col items-end">
                                <span className="text-xs font-bold text-indigo-600">
                                    {userProfile.name} • Nivel {userProfile.currentLevel}
                                </span>
                                <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                                    <motion.div
                                        className="h-full bg-indigo-500"
                                        initial={{ width: 0 }}
                                        animate={{ width: `${progressPercentage}%` }}
                                    />
                                </div>
                                <span className="text-[10px] text-gray-400">{userProfile.xp} / {nextLevelXp} XP</span>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center border-2 border-indigo-500">
                                <StarIcon className="w-6 h-6 text-indigo-600" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 max-w-5xl mx-auto w-full p-6 overflow-y-auto">
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        {selectedModule ? 'Sesiones del Módulo' : 'Tu Mapa de Aventura'}
                    </h1>
                    <p className="text-gray-600">
                        {selectedModule
                            ? 'Selecciona una sesión para practicar'
                            : 'Sigue el camino para desbloquear nuevos poderes de lectura.'
                        }
                    </p>
                    {selectedModule && (
                        <button
                            onClick={() => setSelectedModule(null)}
                            className="mt-4 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors inline-flex items-center gap-2"
                        >
                            ← Volver al Mapa
                        </button>
                    )}
                </div>

                {selectedModule ? (
                    <ModuleSessionNavigator
                        planId={selectedModule.planId}
                        moduleId={selectedModule.moduleId}
                        mode={selectedModule.mode}
                        onStartSession={handleStartSession}
                    />
                ) : (
                    <StudyPlanMap onStartSession={handleStartSession} />
                )}

                {/* Progressive Enhancement: Funcionalidades Premium */}
                <div className="mt-8">
                    <PremiumFeaturesPanel
                        userProfile={userProfile}
                        onFeatureActivated={handlePremiumFeatureActivated}
                    />
                </div>

                {/* Mostrar componente premium activo */}
                {activePremiumFeature && (
                    <div className="mt-8">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-xl shadow-lg p-6"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-xl font-bold text-gray-800">
                                    Funcionalidad Premium Activada
                                </h3>
                                <button
                                    onClick={() => setActivePremiumFeature(null)}
                                    className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded-full text-sm transition-colors"
                                >
                                    Cerrar
                                </button>
                            </div>

                            {/* Renderizar el componente premium */}
                            {(() => {
                                const PremiumComponent = activePremiumFeature.component;
                                return <PremiumComponent userProfile={userProfile} />;
                            })()}
                        </motion.div>
                    </div>
                )}

                {/* Recomendaciones inteligentes (si está disponible) */}
                {canUsePremiumFeatures && (() => {
                    const SmartRecommendations = getPremiumComponent('smartRecommendations');
                    return SmartRecommendations ? (
                        <div className="mt-8">
                            <SmartRecommendations
                                userProfile={userProfile}
                                readingStats={{
                                    averageWpm: 180,
                                    averageComprehension: 85,
                                    sessionsCompleted: 12
                                }}
                            />
                        </div>
                    ) : null;
                })()}
            </div>
        </div>
    );
};

export default StudyDashboard;
