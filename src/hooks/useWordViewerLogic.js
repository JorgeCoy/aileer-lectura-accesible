import { useState, useEffect, useCallback, useContext, useRef } from "react";
import { modeOptions } from "../config/modeOptions";
import useReadingEngine from "./useReadingEngine";
import useSpeech from "./useSpeech";
import useHistory from "./useHistory";
import usePdf from "./usePdf";
import useGlobalStats from "./useGlobalStats";
import ThemeContext from "../context/ThemeContext";

const useWordViewerLogic = (mode = "adult", customOptions = {}) => {
  const defaultOptions = modeOptions[mode] || modeOptions.adult;
  const options = { ...defaultOptions, ...customOptions };

  const { theme, setTheme } = useContext(ThemeContext);

  const [text, setText] = useState("");
  const [words, setWords] = useState([]);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [inputMode, setInputMode] = useState(null); // null | 'text' | 'pdf'

  const [readingTechnique, setReadingTechnique] = useState("singleWord");
  const [fontSize, setFontSize] = useState(options.fontSize || 32);
  const [fontFamily, setFontFamily] = useState(options.fontFamily || "sans-serif");

  // Stats Integration
  const { stats, updateStats, achievements, newAchievement, clearNewAchievement } = useGlobalStats();
  const sessionStartTime = useRef(null);
  const wordsReadInSession = useRef(0);

  const parseText = useCallback((text) => {
    // Lógica de Chunking
    if (readingTechnique === 'chunking') {
      const words = text.split(/\s+/);
      const chunks = [];
      const chunkSize = 3; // Tamaño del grupo
      for (let i = 0; i < words.length; i += chunkSize) {
        chunks.push(words.slice(i, i + chunkSize).join(' '));
      }
      return chunks;
    }

    // Lógica de Line Focus (Línea por puntos)
    if (readingTechnique === 'lineFocus') {
      const allWords = text.split(/\s+/);
      const chunks = [];
      let currentChunk = [];

      for (let word of allWords) {
        currentChunk.push(word);

        // Smart Chunking: Romper en puntuación o si es muy largo
        const hasPunctuation = /[.,;?!:]$/.test(word);
        const isLongEnough = currentChunk.length >= 6; // Mínimo palabras por línea
        const isTooLong = currentChunk.length >= 12;   // Máximo palabras por línea

        if ((hasPunctuation && isLongEnough) || isTooLong) {
          chunks.push(currentChunk.join(' '));
          currentChunk = [];
        }
      }

      if (currentChunk.length > 0) {
        chunks.push(currentChunk.join(' '));
      }

      return chunks;
    }

    if (mode === "child") {
      return text.split(/[\s]+/);
    } else {
      return text.split(/\s+/);
    }
  }, [mode, readingTechnique]);

  useEffect(() => {
    if (text) {
      setWords(parseText(text));
    } else {
      setWords([]);
    }
  }, [text, parseText, readingTechnique]);

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
      disableTimer: voiceEnabled,
      speedMultiplier: 1,
      readingTechnique
    }
  });

  // Track session stats
  useEffect(() => {
    if (isRunning && !isCountingDown) {
      sessionStartTime.current = Date.now();
    } else if (!isRunning && sessionStartTime.current) {
      // Session ended
      const duration = (Date.now() - sessionStartTime.current) / 1000;
      const wpm = Math.round(60000 / speed);

      // Estimate words read based on time and speed (more accurate than index diff for chunks)
      // Or use index difference if available. Let's use duration * (wpm / 60)
      const estimatedWords = Math.round(duration * (wpm / 60));

      if (duration > 1) { // Ignore accidental clicks < 1s
        updateStats(estimatedWords, duration, wpm);
      }

      sessionStartTime.current = null;
    }
  }, [isRunning, isCountingDown, speed, updateStats]);

  const {
    pdfPages,
    selectedPage,
    setSelectedPage,
    handlePdfUpload: originalHandlePdfUpload,
    goToNextPage,
    goToPreviousPage,
    bookmarks,
    toggleBookmark,
    pageNotes,
    addPageNote,
    removePageNote,
    readingStats,
    readingProgress,
    pdfFile,
    pdfName,
    updatePageText,
    exportProgress
  } = usePdf({ enablePdf: options.enablePdf, setText, isRunning });

  const handlePdfUpload = (pdfText, pages, file) => {
    originalHandlePdfUpload(pdfText, pages, file);
    setInputMode('pdf');
  };

  const {
    showHistory,
    setShowHistory,
    history,
    addToHistory
  } = useHistory({ text, selectedPage, isPlaying: isRunning, isCountingDown });

  const selectFromHistory = (item) => {
    setText(item.text);
    setSelectedPage(item.page || 0);
    setInputMode(item.type || 'text');
  };

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
    removePageNote,
    readingStats,
    readingProgress,
    pdfFile,
    pdfName,
    updatePageText,
    exportProgress,
    theme,
    setTheme,
    readingTechnique,
    setReadingTechnique,
    fontSize,
    setFontSize,
    fontFamily,
    setFontFamily,
    inputMode,
    setInputMode,
    // Stats
    stats,
    achievements,
    newAchievement,
    clearNewAchievement
  };
};

export default useWordViewerLogic;