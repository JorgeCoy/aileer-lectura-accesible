import { useState, useEffect, useCallback } from "react";

const useReadingEngine = ({ words, options }) => {
    const { enableAutoPause, autoPauseInterval, autoPauseDuration, disableTimer } = options; // ✅ disableTimer añadido

    const [currentIndex, setCurrentIndex] = useState(0);
    const [isRunning, setIsRunning] = useState(false);
    const [isCountingDown, setIsCountingDown] = useState(false);
    const [countdownValue, setCountdownValue] = useState(3);
    const [speed, setSpeed] = useState(300);

    const startReading = useCallback(() => {
        console.log("🚀 startReading llamado");
        if (words.length > 0) {
            setIsCountingDown(true);
            setCountdownValue(5);
            setCurrentIndex(0);
            console.log("✅ Conteo iniciado, palabras:", words);
        } else {
            console.log("❌ No hay palabras para leer");
        }
    }, [words]);

    const pauseReading = useCallback(() => setIsRunning(false), []);
    const resumeReading = useCallback(() => setIsRunning(true), []);

    const stopReading = useCallback(() => {
        setIsRunning(false);
        setIsCountingDown(false);
        setCurrentIndex(0);
    }, []);

    // ✅ Función para avanzar manualmente (usada por la voz)
    const nextWord = useCallback(() => {
        if (isRunning && currentIndex < words.length - 1) {
            setCurrentIndex(prev => prev + 1);
        } else if (currentIndex >= words.length - 1) {
            setIsRunning(false); // Detener al final
        }
    }, [isRunning, currentIndex, words.length]);

    // ✅ Efecto para manejar el conteo regresivo
    useEffect(() => {
        let countdownInterval;
        if (isCountingDown && countdownValue > 0) {
            countdownInterval = setInterval(() => {
                setCountdownValue(prev => prev - 1);
            }, 1000);
        } else if (isCountingDown && countdownValue === 0) {
            setIsCountingDown(false);
            setIsRunning(true);
            setCountdownValue(3);
        }

        return () => {
            if (countdownInterval) clearInterval(countdownInterval);
        };
    }, [isCountingDown, countdownValue]);

    // ✅ Efecto que controla la lectura palabra por palabra
    useEffect(() => {
        if (isCountingDown || disableTimer) return; // ✅ Si disableTimer es true, no usar intervalo

        if (isRunning && words.length > 0 && currentIndex < words.length - 1) {
            const interval = setInterval(() => {
                setCurrentIndex(prev => prev + 1);
            }, speed);

            return () => clearInterval(interval);
        } else {
            if (isRunning && currentIndex >= words.length - 1) {
                setIsRunning(false);
            }
        }
    }, [isRunning, words, currentIndex, speed, isCountingDown, disableTimer]);

    // ✅ Efecto para pausas automáticas
    useEffect(() => {
        if (enableAutoPause && isRunning && !isCountingDown) {
            const pauseInterval = setInterval(() => {
                setIsRunning(false);
                setTimeout(() => {
                    setIsRunning(true);
                }, autoPauseDuration);
            }, autoPauseInterval);

            return () => clearInterval(pauseInterval);
        }
    }, [isRunning, enableAutoPause, autoPauseInterval, autoPauseDuration, isCountingDown]);

    return {
        currentIndex,
        setCurrentIndex,
        isRunning,
        setIsRunning,
        isCountingDown,
        setIsCountingDown,
        countdownValue,
        speed,
        setSpeed,
        startReading,
        pauseReading,
        resumeReading,
        stopReading,
        nextWord // ✅ Exportar nextWord
    };
};

export default useReadingEngine;
