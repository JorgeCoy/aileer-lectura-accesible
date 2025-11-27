import { useState, useEffect } from 'react';

const ACHIEVEMENTS = [
    { id: 'novato', icon: '🌱', title: 'Novato', description: 'Lee tus primeras 100 palabras', condition: (stats) => stats.totalWords >= 100 },
    { id: 'velocista', icon: '⚡', title: 'Velocista', description: 'Alcanza 300 palabras por minuto', condition: (stats) => stats.maxSpeed >= 300 },
    { id: 'raton', icon: '📚', title: 'Ratón de Biblioteca', description: 'Lee 10,000 palabras en total', condition: (stats) => stats.totalWords >= 10000 },
    { id: 'dedicado', icon: '⏳', title: 'Dedicado', description: 'Acumula 1 hora de lectura', condition: (stats) => stats.totalTime >= 3600 },
    { id: 'maraton', icon: '🏃', title: 'Maratón', description: 'Lee durante 20 minutos seguidos', condition: (stats) => stats.longestSession >= 1200 },
];

const useGlobalStats = () => {
    const [stats, setStats] = useState({
        totalWords: 0,
        totalTime: 0, // seconds
        maxSpeed: 0,
        sessions: 0,
        longestSession: 0, // seconds
        unlockedAchievements: []
    });

    const [newAchievement, setNewAchievement] = useState(null);

    // Cargar estadísticas al inicio
    useEffect(() => {
        const savedStats = localStorage.getItem('aleer_global_stats');
        if (savedStats) {
            setStats(JSON.parse(savedStats));
        }
    }, []);

    // Guardar estadísticas cuando cambian
    useEffect(() => {
        localStorage.setItem('aleer_global_stats', JSON.stringify(stats));
    }, [stats]);

    const updateStats = (sessionWords, sessionTime, currentSpeed) => {
        setStats(prev => {
            const newTotalWords = prev.totalWords + sessionWords;
            const newTotalTime = prev.totalTime + sessionTime;
            const newMaxSpeed = Math.max(prev.maxSpeed, currentSpeed);
            const newLongestSession = Math.max(prev.longestSession, sessionTime);

            const newStats = {
                ...prev,
                totalWords: newTotalWords,
                totalTime: newTotalTime,
                maxSpeed: newMaxSpeed,
                longestSession: newLongestSession,
                sessions: prev.sessions + 1
            };

            // Verificar logros
            const newlyUnlocked = [];
            const currentUnlocked = new Set(prev.unlockedAchievements);

            ACHIEVEMENTS.forEach(ach => {
                if (!currentUnlocked.has(ach.id) && ach.condition(newStats)) {
                    newlyUnlocked.push(ach.id);
                    setNewAchievement(ach); // Notificar el último desbloqueado
                }
            });

            if (newlyUnlocked.length > 0) {
                newStats.unlockedAchievements = [...prev.unlockedAchievements, ...newlyUnlocked];
            }

            return newStats;
        });
    };

    const clearNewAchievement = () => setNewAchievement(null);

    return {
        stats,
        updateStats,
        achievements: ACHIEVEMENTS,
        newAchievement,
        clearNewAchievement
    };
};

export default useGlobalStats;
