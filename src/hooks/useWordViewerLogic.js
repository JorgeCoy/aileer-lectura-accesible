// src/hooks/useWordViewerLogic.jsx
import { useState, useEffect, useCallback } from "react";
import { modeOptions } from "../config/modeOptions";

const useWordViewerLogic = (mode = "adult", customOptions = {}) => {
  const defaultOptions = modeOptions[mode] || modeOptions.adult;
  const options = { ...defaultOptions, ...customOptions }; // ✅ Fusionar opciones por defecto con personalizadas

  const [text, setText] = useState("");
  const [words, setWords] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(300); // Valor base
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState([]);
  const [pdfPages, setPdfPages] = useState([]);
  const [selectedPage, setSelectedPage] = useState(0);

  // ✅ Usar opciones centralizadas
  const { maxSpeed, enablePdf, enableAutoPause, autoPauseInterval, autoPauseDuration } = options;

  useEffect(() => {
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
      setWords(parseText(text));
      setCurrentIndex(0);
    }
  }, [text, parseText]);

  // ✅ Lógica de lectura
  const startReading = () => {
    if (words.length > 0) {
      setIsRunning(true);
    }
  };

  const pauseReading = () => setIsRunning(false);

  const resumeReading = () => setIsRunning(true);

  const stopReading = () => {
    setIsRunning(false);
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
    if (text && text.trim() && !isRunning) {
      addToHistory(text, selectedPage);
    }
  }, [text, selectedPage, isRunning]);

  // ✅ Efecto para pausas automáticas (configurable)
  useEffect(() => {
    if (enableAutoPause && isRunning) {
      const pauseInterval = setInterval(() => {
        setIsRunning(false);
        setTimeout(() => {
          setIsRunning(true);
        }, autoPauseDuration); // Pausa configurable
      }, autoPauseInterval); // Intervalo configurable

      return () => clearInterval(pauseInterval);
    }
  }, [isRunning, enableAutoPause, autoPauseInterval, autoPauseDuration]);

  return {
    text,
    setText,
    words,
    currentIndex,
    isRunning,
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