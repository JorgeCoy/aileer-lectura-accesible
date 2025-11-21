// src/hooks/useWordViewerLogic.jsx
import { useState, useEffect, useCallback } from "react";
import { modeOptions } from "../config/modeOptions";
import { speakWord, stopSpeech, estimateWordDuration } from "../utils/speech"; // ✅ Importar estimateWordDuration

const useWordViewerLogic = (mode = "adult", customOptions = {}) => {
  const defaultOptions = modeOptions[mode] || modeOptions.adult;
  const options = { ...defaultOptions, ...customOptions }; // ✅ Fusionar opciones por defecto con personalizadas

  const [text, setText] = useState("");
  const [words, setWords] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isCountingDown, setIsCountingDown] = useState(false); // ✅ Nuevo estado para el conteo
  const [countdownValue, setCountdownValue] = useState(3); // ✅ Valor del conteo (5, 4, 3, 2, 1)
  const [speed, setSpeed] = useState(300); // Valor base
  const [voiceEnabled, setVoiceEnabled] = useState(false); // ✅ false por defecto
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState([]);
  const [pdfPages, setPdfPages] = useState([]);
  const [selectedPage, setSelectedPage] = useState(0);

  // ✅ Usar opciones centralizadas
  const { maxSpeed, enablePdf, enableAutoPause, autoPauseInterval, autoPauseDuration } = options;

  // ✅ Desactivar voz si la velocidad es muy alta
  useEffect(() => {
    console.log("🚀 Desactivar Voz por velocidad");
    if (speed < maxSpeed) {
      setVoiceEnabled(false); // Desactivar voz si es muy rápido
    }
  }, [speed, maxSpeed]);

  // ✅ Separar lógica según modo
  const parseText = useCallback((text) => {
    if (mode === "child") {
      // Para niños: dividir en frases o palabras más simples
      return text.split(/[\s]+/);
    } else {
      // Para adultos: dividir por palabras normales
      return text.split(/\s+/);
    }
  }, [mode]);

  useEffect(() => {
    if (text) {
      console.log("🚀 si (text)");
      setWords(parseText(text));
      setCurrentIndex(0);
    } else {
      // ✅ Si no hay texto, reiniciar todo
      console.log("🚀 no hay texto, reiniciar");
      setWords([]);
      setCurrentIndex(0);
      setIsRunning(false); // ✅ Detener la lectura si se borra el texto
      setIsCountingDown(false); // ✅ Detener conteo si se borra el texto
    }
  }, [text, parseText]);

  // ✅ Lógica de lectura
const startReading = () => {
  console.log("🚀 startReading llamado");
  if (words.length > 0) {
    // ✅ Iniciar conteo regresivo en lugar de iniciar la lectura directamente
    setIsCountingDown(true);
    setCountdownValue(5); // ✅ Reiniciar el conteo
    setCurrentIndex(0); // ✅ Reiniciar índice al iniciar
    // setIsRunning(true); // ❌ COMENTA O ELIMINA ESTA LÍNEA
    console.log("✅ Conteo iniciado, palabras:", words);
  } else {
    console.log("❌ No hay palabras para leer");
  }
};

  // ✅ Efecto para manejar el conteo regresivo
  useEffect(() => {
    let countdownInterval;
    if (isCountingDown && countdownValue > 0) {
      countdownInterval = setInterval(() => {
        setCountdownValue(prev => prev - 1);
      }, 1000);
    } else if (isCountingDown && countdownValue === 0) {
      // ✅ Terminar conteo y comenzar lectura
      setIsCountingDown(false);
      setIsRunning(true);
      setCountdownValue(3); // ✅ Reiniciar para próxima vez
    }

    return () => {
      if (countdownInterval) clearInterval(countdownInterval);
    };
  }, [isCountingDown, countdownValue]);

  const pauseReading = () => setIsRunning(false);

  const resumeReading = () => setIsRunning(true);

  const stopReading = () => {
    setIsRunning(false);
    setIsCountingDown(false); // ✅ Detener conteo si estaba activo
    setCurrentIndex(0);
  };

  const handlePdfUpload = (pdfText, pages) => {
    if (!enablePdf) return; // ✅ No permitir PDF si no está habilitado
    setText(pdfText);
    setPdfPages(pages);
  };

  const addToHistory = (text, page = null) => {
    if (text.trim()) {
      setHistory(prev => [{ text, page, date: new Date().toISOString() }, ...prev.slice(0, 9)]);
    }
  };

  const selectFromHistory = (item) => {
    setText(item.text);
    setSelectedPage(item.page || 0);
  };

  // ✅ Efecto para agregar texto al historial al cambiar
  useEffect(() => {
    if (text && text.trim() && !isRunning && !isCountingDown) { // ✅ No agregar si está contando
      addToHistory(text, selectedPage);
    }
  }, [text, selectedPage, isRunning, isCountingDown]);

  // ✅ Efecto que controla la lectura palabra por palabra (único)
  useEffect(() => {
    // ✅ No ejecutar si está contando
    console.log("🔄 useEffect de lectura - isCountingDown:", isCountingDown); // ✅ Añadir este log

    if (isCountingDown) {
      console.log("🔄 useEffect de lectura - CONTANDO, NO EJECUTAR"); // ✅ Añadir este log
      return;
    }

    console.log("🔄 useEffect de lectura", { isRunning, words, currentIndex, speed });
    
    if (isRunning && words.length > 0 && currentIndex < words.length - 1) {
      console.log("✅ Intervalo activo, avanzando palabra...");
      const interval = setInterval(() => {
        console.log("➡️ Avanzando índice a:", currentIndex + 1);
        setCurrentIndex(prev => prev + 1);
      }, speed);

      return () => clearInterval(interval);
    } else {
      // ✅ Si ya terminó de leer o no está corriendo, detener la lectura
      if (isRunning && currentIndex >= words.length - 1) {
        console.log("🏁 Lectura terminada, deteniendo isRunning");
        setIsRunning(false);
      }
      console.log("❌ No se activó el intervalo", { isRunning, words, currentIndex });
    }
  }, [isRunning, words, currentIndex, speed, isCountingDown]); // ✅ Añadir isCountingDown como dependencia

  // ✅ Efecto que reproduce la palabra en voz alta
  useEffect(() => {
    // ✅ No ejecutar si está contando
    if (isCountingDown) return;

    if (isRunning && voiceEnabled && words[currentIndex]) {
      console.log("🚀 Reproduce voz para palabra:", words[currentIndex]);
      speakWord(words[currentIndex]);
    }
  }, [currentIndex, isRunning, voiceEnabled, words, isCountingDown]); // ✅ Añadir isCountingDown como dependencia

  // ✅ Efecto que detiene la voz inmediatamente si se inhabilita
  useEffect(() => {
    if (!voiceEnabled) {
      console.log("🚀 Detener Voz");
      stopSpeech(); // ✅ Detener voz inmediatamente
    }
  }, [voiceEnabled]);

  // ✅ Efecto que detiene la voz al detener la lectura
  useEffect(() => {
    return () => {
      console.log("🚀 Detiene la voz al desmontar");
      stopSpeech(); // Detener voz al desmontar el hook
    };
  }, []);

  // ✅ Desactivar voz si la velocidad es muy rápida para la pronunciación
  useEffect(() => {
    const wordDuration = estimateWordDuration("a"); // palabra más corta
    if (speed < wordDuration * 0.8) {
      setVoiceEnabled(false);
    }
  }, [speed]);

  // ✅ Efecto para pausas automáticas (configurable)
  useEffect(() => {
    // ✅ No ejecutar si está contando
    if (enableAutoPause && isRunning && !isCountingDown) {
      const pauseInterval = setInterval(() => {
        setIsRunning(false);
        setTimeout(() => {
          setIsRunning(true);
        }, autoPauseDuration); // Pausa configurable
      }, autoPauseInterval); // Intervalo configurable

      return () => clearInterval(pauseInterval);
    }
  }, [isRunning, enableAutoPause, autoPauseInterval, autoPauseDuration, isCountingDown]); // ✅ Añadir isCountingDown como dependencia

  return {
    text,
    setText,
    words,
    currentIndex,
    isRunning,
    isCountingDown, // ✅ Nuevo estado para el conteo
    countdownValue, // ✅ Valor del conteo
    speed,
    setSpeed,
    voiceEnabled,
    setVoiceEnabled,
    startReading,
    pauseReading,
    resumeReading,
    stopReading,
    handlePdfUpload,
    showHistory,
    setShowHistory,
    history,
    selectFromHistory,
    pdfPages,
    selectedPage,
    setSelectedPage,
  };
};

export default useWordViewerLogic;