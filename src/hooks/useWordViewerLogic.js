// src/hooks/useWordViewerLogic.jsx
import { useState, useEffect, useCallback } from "react";
import { modeOptions } from "../config/modeOptions";
import useReadingEngine from "./useReadingEngine";
import useSpeech from "./useSpeech";
import useHistory from "./useHistory";
import usePdf from "./usePdf";

const useWordViewerLogic = (mode = "adult", customOptions = {}) => {
  const defaultOptions = modeOptions[mode] || modeOptions.adult;
  const options = { ...defaultOptions, ...customOptions };

  const [text, setText] = useState("");
  const [words, setWords] = useState([]);

  // ✅ Separar lógica según modo
  const parseText = useCallback((text) => {
    if (mode === "child") {
      return text.split(/[\s]+/);
    } else {
      return text.split(/\s+/);
    }
  }, [mode]);

  useEffect(() => {
    if (text) {
      console.log("🚀 si (text)");
      setWords(parseText(text));
    } else {
      console.log("🚀 no hay texto, reiniciar");
      setWords([]);
    }
  }, [text, parseText]);

  // ✅ Usar el motor de lectura
  const {
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
    stopReading
  } = useReadingEngine({ words, options });

  // ✅ Sincronizar reinicio cuando se borra el texto
  useEffect(() => {
    if (!text) {
      stopReading();
    }
  }, [text, stopReading]);

  // ✅ Usar hook de PDF
  const {
    pdfPages,
    selectedPage,
    setSelectedPage,
    handlePdfUpload
  } = usePdf({ enablePdf: options.enablePdf, setText });

  // ✅ Usar hook de Historial
  const {
    showHistory,
    setShowHistory,
    history,
    addToHistory
  } = useHistory({ text, selectedPage, isPlaying: isRunning, isCountingDown });

  const selectFromHistory = (item) => {
    setText(item.text);
    setSelectedPage(item.page || 0);
  };

  // ✅ Usar hook de Voz
  const {
    voiceEnabled,
    setVoiceEnabled
  } = useSpeech({
    currentWord: words[currentIndex],
    isPlaying: isRunning,
    isCountingDown,
    speed,
    maxSpeed: options.maxSpeed
  });

  return {
    text,
    setText,
    words,
    currentIndex,
    isRunning,
    isCountingDown,
    countdownValue,
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