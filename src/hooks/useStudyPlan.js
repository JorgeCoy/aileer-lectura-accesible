import { useState, useEffect, useRef } from 'react';
import { STUDY_PLANS, XP_REWARDS, LEVELS } from '../data/studyPlans';

const useStudyPlan = () => {
    // Initialize state from LocalStorage (Lazy Initialization)
    const [gameState, setGameState] = useState(() => {
        try {
            const savedState = localStorage.getItem('aleer_gamification');
            console.log('🔄 [useStudyPlan] Lazy loading state:', savedState);
            if (savedState) {
                const parsed = JSON.parse(savedState);
                return {
                    ...parsed,
                    activeSession: null // Always reset active session
                };
            }
        } catch (e) {
            console.error('❌ [useStudyPlan] Error parsing saved state:', e);
        }

        // Default state if no save found
        return {
            level: 1,
            currentXp: 0,
            nextLevelXp: 1000,
            streak: 0,
            lastLogin: null,
            currentPlanId: null,
            moduleProgress: {},
            completedSessions: [],
            activeSession: null
        };
    });

    const [notification, setNotification] = useState(null);
    const isInitialized = useRef(false);

    // Check streak on mount
    useEffect(() => {
        checkStreak();
        isInitialized.current = true;
    }, []);

    // Save to LocalStorage
    const prevSavedState = useRef(null);
    useEffect(() => {
        if (!isInitialized.current) return; // Don't save before initialization

        // Don't save activeSession to local storage to avoid stuck states
        const { activeSession, ...stateToSave } = gameState;

        // Only save if state actually changed
        const stateString = JSON.stringify(stateToSave);
        if (prevSavedState.current !== stateString) {
            console.log('💾 [useStudyPlan] Saving state to localStorage:', stateToSave);
            localStorage.setItem('aleer_gamification', stateString);
            prevSavedState.current = stateString;
        }
    }, [gameState.level, gameState.currentXp, gameState.streak, gameState.lastLogin, gameState.currentPlanId, JSON.stringify(gameState.moduleProgress), JSON.stringify(gameState.completedSessions)]); // More specific dependencies

    const checkStreak = () => {
        setGameState(prev => {
            const today = new Date().toDateString();
            const lastLogin = prev.lastLogin;

            if (lastLogin === today) return prev; // Already logged in today

            let newStreak = prev.streak;
            if (lastLogin) {
                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                if (lastLogin === yesterday.toDateString()) {
                    newStreak += 1; // Continue streak
                } else {
                    newStreak = 1; // Reset streak (or start new if first time)
                }
            } else {
                newStreak = 1; // First login
            }

            return {
                ...prev,
                streak: newStreak,
                lastLogin: today
            };
        });
    };

    // Función para obtener progreso de un módulo específico
    const getModuleProgress = (planId, moduleId) => {
        const planProgress = gameState.moduleProgress[planId] || {};
        return planProgress[moduleId] || { completedSessions: 0, totalSessions: 10, lastSessionDate: null };
    };

    // Función para completar una sesión en un módulo específico
    const completeModuleSession = (planId, moduleId) => {
        // Calculate based on current state to determine if XP should be awarded
        const currentProgress = getModuleProgress(planId, moduleId);
        const isNewCompletion = currentProgress.completedSessions < currentProgress.totalSessions;

        setGameState(prev => {
            const planProgress = prev.moduleProgress[planId] || {};
            const moduleProgress = planProgress[moduleId] || { completedSessions: 0, totalSessions: 10 };

            const newCompletedSessions = Math.min(moduleProgress.completedSessions + 1, moduleProgress.totalSessions);

            const updatedPlanProgress = {
                ...planProgress,
                [moduleId]: {
                    ...moduleProgress,
                    completedSessions: newCompletedSessions,
                    lastSessionDate: new Date().toISOString(),
                    isCompleted: newCompletedSessions >= moduleProgress.totalSessions
                }
            };

            return {
                ...prev,
                moduleProgress: {
                    ...prev.moduleProgress,
                    [planId]: updatedPlanProgress
                }
            };
        });

        // Agregar XP solo si es una nueva sesión completada
        if (isNewCompletion) {
            addXp(XP_REWARDS.SESSION_COMPLETE);
        }
    };

    // Función para verificar si un módulo está completado
    const isModuleCompleted = (planId, moduleId) => {
        const progress = getModuleProgress(planId, moduleId);
        return progress.completedSessions >= progress.totalSessions;
    };

    // Función para obtener sesiones disponibles en un módulo
    const getAvailableSessions = (planId, moduleId) => {
        const progress = getModuleProgress(planId, moduleId);
        const completed = progress.completedSessions;
        return Math.max(0, progress.totalSessions - completed);
    };

    const addXp = (amount) => {
        setGameState(prev => {
            let newXp = prev.currentXp + amount;
            let newLevel = prev.level;
            let newNextLevelXp = prev.nextLevelXp;
            let leveledUp = false;

            while (newXp >= newNextLevelXp) {
                newXp -= newNextLevelXp;
                newLevel += 1;
                newNextLevelXp = Math.floor(newNextLevelXp * 1.2); // Increase difficulty by 20%
                leveledUp = true;
            }

            if (leveledUp) {
                setNotification({
                    type: 'levelup',
                    message: `¡Felicidades! Has alcanzado el Nivel ${newLevel}`,
                    xp: amount
                });
            } else {
                setNotification({
                    type: 'xp',
                    message: `+${amount} XP`,
                    xp: amount
                });
            }

            return {
                ...prev,
                level: newLevel,
                currentXp: newXp,
                nextLevelXp: newNextLevelXp
            };
        });

        // Clear notification after 3 seconds
        setTimeout(() => setNotification(null), 3000);
    };

    const startPlan = (level) => {
        setGameState(prev => {
            const progress = prev.moduleProgress[level] || { moduleIndex: 0, sessionIndex: 0 };

            // Calculate active session immediately
            const plan = STUDY_PLANS[level];
            const module = plan.modules[progress.moduleIndex];
            const session = module.sessions[progress.sessionIndex];

            const activeSession = {
                ...session,
                moduleTitle: module.title,
                planTitle: plan.title,
                totalSessionsInModule: module.sessions.length,
                currentSessionNumber: progress.sessionIndex + 1
            };

            return {
                ...prev,
                currentPlanId: level,
                activeSession: activeSession,
                moduleProgress: {
                    ...prev.moduleProgress,
                    [level]: progress
                }
            };
        });
    };

    const startSession = (session) => {
        setGameState(prev => ({
            ...prev,
            activeSession: session
        }));
    };

    const completeSession = () => {
        const { currentPlanId, moduleProgress } = gameState;
        if (!currentPlanId) return;

        const currentProgress = moduleProgress[currentPlanId];
        const plan = STUDY_PLANS[currentPlanId];
        const currentModule = plan.modules[currentProgress.moduleIndex];

        // Add XP
        const sessionXp = currentModule.sessions[currentProgress.sessionIndex].xp;
        addXp(sessionXp);

        // Advance Progress
        setGameState(prev => {
            const nextSessionIndex = currentProgress.sessionIndex + 1;
            let nextModuleIndex = currentProgress.moduleIndex;
            let nextSessionIdx = nextSessionIndex;

            if (nextSessionIndex >= currentModule.sessions.length) {
                // Module Completed
                nextModuleIndex += 1;
                nextSessionIdx = 0;

                if (nextModuleIndex >= plan.modules.length) {
                    // Plan Completed!
                    setNotification({
                        type: 'plan_complete',
                        message: `¡Increíble! Has completado el plan ${plan.title}`,
                        xp: 1000
                    });
                    addXp(1000); // Bonus for plan completion
                    return prev; // Stay at end or reset? For now stay.
                }
            }

            return {
                ...prev,
                activeSession: null, // Clear active session
                moduleProgress: {
                    ...prev.moduleProgress,
                    [currentPlanId]: {
                        moduleIndex: nextModuleIndex,
                        sessionIndex: nextSessionIdx
                    }
                }
            };
        });
    };

    const getCurrentSession = () => {
        const { currentPlanId, moduleProgress } = gameState;
        if (!currentPlanId) return null;

        const progress = moduleProgress[currentPlanId] || { moduleIndex: 0, sessionIndex: 0 };
        const plan = STUDY_PLANS[currentPlanId];

        if (!plan || !plan.modules[progress.moduleIndex]) return null;

        const module = plan.modules[progress.moduleIndex];
        const session = module.sessions[progress.sessionIndex];

        return {
            ...session,
            moduleTitle: module.title,
            planTitle: plan.title,
            totalSessionsInModule: module.sessions.length,
            currentSessionNumber: progress.sessionIndex + 1
        };
    };

    return {
        gameState,
        addXp,
        startPlan,
        startSession,
        completeSession,
        getCurrentSession,
        getModuleProgress,
        completeModuleSession,
        isModuleCompleted,
        getAvailableSessions,
        notification,
        plans: STUDY_PLANS
    };
};

export default useStudyPlan;
