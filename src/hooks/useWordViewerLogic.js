import { useState, useEffect, useCallback, useContext, useRef } from "react";
import { modeOptions } from "../config/modeOptions";
import useReadingEngine from "./useReadingEngine";
import useSpeech from "./useSpeech";
import useHistory from "./useHistory";
import usePdf from "./usePdf";
import useGlobalStats from "./useGlobalStats";
import ThemeContext from "../context/ThemeContext";
import { ReadingSessionBuilder, ReadingSessionAdapter } from "../patterns/ReadingSessionBuilder";
import { TEXT_LIBRARY } from '../data/TextLibrary';
import { LEVELS } from '../data/studyPlans';

const useWordViewerLogic = (mode = "adult", customOptions = {}) => {
  const defaultOptions = modeOptions[mode] || modeOptions.adult;
  const options = { ...defaultOptions, ...customOptions };

  const { theme, setTheme } = useContext(ThemeContext);

  const [text, setText] = useState("");
  const [words, setWords] = useState([]);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [inputMode, setInputMode] = useState(null); // null | 'text' | 'pdf'
  const [textObj, setTextObj] = useState(null); // New state for the full text object

  const [sessionType, setSessionType] = useState('practice'); // 'discovery' | 'speed' | 'practice'

  const [readingTechnique, setReadingTechnique] = useState("singleWord");
  const [fontSize, setFontSize] = useState(options.fontSize || 32);
  const [fontFamily, setFontFamily] = useState(options.fontFamily || "sans-serif");

  // New States for Advanced Techniques
  const [previewMode, setPreviewMode] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [repeatedReadingMode, setRepeatedReadingMode] = useState(false);
  const [currentRepetition, setCurrentRepetition] = useState(0);
  const repetitionCount = 3; // Hardcoded for now, could be configurable
  const [memoryExerciseMode, setMemoryExerciseMode] = useState(false);
  const [showMemoryTest, setShowMemoryTest] = useState(false);

  // Stats Integration
  const { stats, updateStats, achievements, newAchievement, clearNewAchievement } = useGlobalStats();
  const sessionStartTime = useRef(null);

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

      // Detectar móvil (simple check)
      const isMobile = window.innerWidth < 768;
      const minWords = isMobile ? 2 : 4; // Reducido min desktop también
      const maxWords = isMobile ? 4 : 8; // Reducido de 12 a 8 para desktop
      const maxChars = isMobile ? 25 : 60; // Reducido de 100 a 60 para desktop

      for (const word of allWords) {
        currentChunk.push(word);

        // Smart Chunking: 
        // 1. Puntuación Fuerte (Final de oración): SIEMPRE rompe línea
        const isSentenceEnd = /[.?!]+$/.test(word);

        // 2. Puntuación Débil (Pausas): Rompe solo si la línea tiene longitud mínima
        const isPause = /[,;:]$/.test(word);

        const isLongEnough = currentChunk.length >= minWords;
        const isTooLong = currentChunk.length >= maxWords;

        // Calcular longitud actual en caracteres
        const currentLength = currentChunk.join(' ').length;
        const exceedsChars = currentLength > maxChars;

        if (isSentenceEnd || (isPause && isLongEnough) || isTooLong || exceedsChars) {
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
    isRunning,
    isCountingDown,
    countdownValue,
    speed,
    setSpeed,
    startReading: originalStartReading,
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

  // Método para aplicar configuración de sesión usando Builder Pattern
  const applySessionConfig = useCallback((sessionConfig) => {
    console.log('Aplicando configuración de sesión:', sessionConfig);

    if (sessionConfig.speed) setSpeed(sessionConfig.speed);
    if (sessionConfig.technique) setReadingTechnique(sessionConfig.technique);
    if (sessionConfig.fontSize) setFontSize(sessionConfig.fontSize);
    if (sessionConfig.fontFamily) setFontFamily(sessionConfig.fontFamily);
    if (sessionConfig.theme) setTheme(sessionConfig.theme);
    if (sessionConfig.voiceEnabled !== undefined) setVoiceEnabled(sessionConfig.voiceEnabled);
    if (sessionConfig.text) setText(sessionConfig.text);
    if (sessionConfig.repetitions) setCurrentRepetition(sessionConfig.repetitions);
    if (sessionConfig.previewMode !== undefined) setPreviewMode(sessionConfig.previewMode);
    if (sessionConfig.memoryExerciseMode !== undefined) setMemoryExerciseMode(sessionConfig.memoryExerciseMode);
  }, [setTheme]);

  // Método para crear sesión desde builder
  const createSessionFromBuilder = useCallback((builderCallback) => {
    try {
      const builder = new ReadingSessionBuilder().forMode(mode);
      const config = builderCallback(builder).build();
      applySessionConfig(ReadingSessionAdapter.adaptForHook(config));
      return config;
    } catch (error) {
      console.error('Error creando sesión desde builder:', error);
      throw error;
    }
  }, [mode, applySessionConfig]);

  const startReading = () => {
    if (previewMode) {
      setShowPreview(true);
    } else {
      originalStartReading();
    }
  };

  const onPreviewFinish = () => {
    setShowPreview(false);
    originalStartReading();
  };

  // Repeated Reading Logic
  useEffect(() => {
    if (!isRunning && words.length > 0 && currentIndex >= words.length - 1) {
      if (repeatedReadingMode) {
        if (currentRepetition < repetitionCount - 1) {
          const timer = setTimeout(() => {
            setCurrentRepetition(prev => prev + 1);
            setSpeed(prev => Math.max(50, Math.round(prev * 0.9))); // 10% faster
            originalStartReading();
          }, 2000); // 2 seconds pause
          return () => clearTimeout(timer);
        } else {
          // Finished all repetitions
          setCurrentRepetition(0);
          if (memoryExerciseMode) {
            setTimeout(() => setShowMemoryTest(true), 1000);
          }
        }
      } else if (memoryExerciseMode) {
        // Normal reading finished, trigger memory test
        setTimeout(() => setShowMemoryTest(true), 1000);
      }
    }
  }, [isRunning, currentIndex, words.length, repeatedReadingMode, currentRepetition, originalStartReading, setSpeed, memoryExerciseMode]);

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
    history
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
    previewMode,
    setPreviewMode,
    showPreview,
    setShowPreview,
    onPreviewFinish,
    repeatedReadingMode,
    setRepeatedReadingMode,
    currentRepetition,
    memoryExerciseMode,
    setMemoryExerciseMode,
    showMemoryTest,
    setShowMemoryTest,
    // Builder Pattern methods
    applySessionConfig,
    createSessionFromBuilder,
    // Stats
    stats,
    achievements,
    newAchievement,
    clearNewAchievement
  };
};

export default useWordViewerLogic;