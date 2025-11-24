import { useState, useEffect, useCallback, useContext } from "react";
import { modeOptions } from "../config/modeOptions";
import useReadingEngine from "./useReadingEngine";
import useSpeech from "./useSpeech";
import useHistory from "./useHistory";
import usePdf from "./usePdf";
import ThemeContext from "../context/ThemeContext";

const useWordViewerLogic = (mode = "adult", customOptions = {}) => {
  const defaultOptions = modeOptions[mode] || modeOptions.adult;
  const options = { ...defaultOptions, ...customOptions };

  const { theme, setTheme } = useContext(ThemeContext);

  const [text, setText] = useState("");
  const [words, setWords] = useState([]);
  const [voiceEnabled, setVoiceEnabled] = useState(false);

  // Separar lógica según modo
  const parseText = useCallback((text) => {
    if (mode === "child") {
      return text.split(/[\s]+/);
    } else {
      return text.split(/\s+/);
    }
  }, [mode]);

  useEffect(() => {
    if (text) {
      setWords(parseText(text));
    } else {
      setWords([]);
    }
  }, [text, parseText]);

  // Usar el motor de lectura
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
    stopReading,
    nextWord
  } = useReadingEngine({
    words,
    options: {
      ...options,
      disableTimer: voiceEnabled
    }
  });

  // Sincronizar reinicio cuando se borra el texto
  useEffect(() => {
    if (!text) {
      stopReading();
    }
  }, [text, stopReading]);

  // Usar hook de PDF
  const {
    pdfPages,
    selectedPage,
    setSelectedPage,
    handlePdfUpload,
    goToNextPage,
    goToPreviousPage,
    bookmarks,
    toggleBookmark,
    pageNotes,
    addPageNote,
    readingStats,
    readingProgress,
    pdfFile,
    pdfName,
    updatePageText
  } = usePdf({ enablePdf: options.enablePdf, setText, isRunning });

  // Usar hook de Historial
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

  // Usar hook de Voz
  const {
    voices,
    selectedVoice,
    setSelectedVoice
  } = useSpeech({
    currentWord: words[currentIndex],
    isPlaying: isRunning,
    isCountingDown,
    speed,
    maxSpeed: options.maxSpeed,
    onWordEnd: nextWord,
    voiceEnabled,
    setVoiceEnabled
  });

  // Estado local para readingTechnique si no viene del contexto (por ahora local)
  const [readingTechnique, setReadingTechnique] = useState("singleWord");
  const [fontSize, setFontSize] = useState(options.fontSize || 32);
  const [fontFamily, setFontFamily] = useState(options.fontFamily || "sans-serif");

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
    voices,
    selectedVoice,
    setSelectedVoice,
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
    goToNextPage,
    goToPreviousPage,
    bookmarks,
    toggleBookmark,
    pageNotes,
    addPageNote,
    readingStats,
    readingProgress,
    pdfFile,
    pdfName,
    updatePageText,
    theme,
    setTheme,
    readingTechnique,
    setReadingTechnique,
    fontSize,
    setFontSize,
    fontFamily,
    setFontFamily
  };
};

export default useWordViewerLogic;
