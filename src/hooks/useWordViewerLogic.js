import { useState, useEffect, useCallback, useContext, useRef, useMemo } from "react";
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

import { chunkText, chunkTextForLineFocus, chunkTextForSaccades } from '../utils/textChunker';

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

  const [readingTechnique, setReadingTechnique] = useState(options.technique || "singleWord");
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

  // Sync state with customOptions changes (Fix for Student View Config)
  const prevCustomOptions = useRef(customOptions);

  // Stats Integration
  const { stats, updateStats, achievements, newAchievement, clearNewAchievement } = useGlobalStats();
  const sessionStartTime = useRef(null);

  // Memoized text parsing to prevent re-processing on technique changes
  const parsedWords = useMemo(() => {
    if (!text) return [];

    // Lógica de Chunking
    if (readingTechnique === 'chunking') {
      return chunkText(text);
    }

    // Lógica de Line Focus (Línea por puntos)
    if (readingTechnique === 'lineFocus') {
      return chunkTextForLineFocus(text, fontSize);
    }

    // Lógica de Salto Sacádico (Fijaciones)
    if (readingTechnique === 'saccadicFocus') {
      return chunkTextForSaccades(text);
    }

    // Default text splitting
    if (mode === "child") {
      return text.split(/[\s]+/);
    } else {
      return text.split(/\s+/);
    }
  }, [text, readingTechnique, mode, fontSize]); // Only recalculate when text, technique, mode, or fontSize change

  // Set words when parsedWords changes
  useEffect(() => {
    setWords(parsedWords);
  }, [parsedWords]);

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

  // Sync state with customOptions changes (Fix for Student View Config)
  // Optimized to prevent infinite loops by only depending on customOptions
  useEffect(() => {
    // Only update if customOptions object reference has actually changed
    if (customOptions === prevCustomOptions.current) return;

    // Update each state only if the value exists and has changed
    if (customOptions.speed !== undefined && customOptions.speed !== prevCustomOptions.current.speed) {
      setSpeed(customOptions.speed);
    }
    if (customOptions.technique !== undefined && customOptions.technique !== prevCustomOptions.current.technique) {
      setReadingTechnique(customOptions.technique);
    }
    if (customOptions.fontSize !== undefined && customOptions.fontSize !== prevCustomOptions.current.fontSize) {
      setFontSize(customOptions.fontSize);
    }
    if (customOptions.fontFamily !== undefined && customOptions.fontFamily !== prevCustomOptions.current.fontFamily) {
      setFontFamily(customOptions.fontFamily);
    }
    if (customOptions.theme !== undefined && customOptions.theme !== prevCustomOptions.current.theme) {
      setTheme(customOptions.theme);
    }
    if (customOptions.voiceEnabled !== undefined && customOptions.voiceEnabled !== prevCustomOptions.current.voiceEnabled) {
      setVoiceEnabled(customOptions.voiceEnabled);
    }

    prevCustomOptions.current = customOptions;
  }, [customOptions]); // Only depend on customOptions object reference

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

    // Repeated Reading Logic & General Finish Handler
    useEffect(() => {
      if (!isRunning && words.length > 0 && currentIndex >= words.length - 1) {
        // Trigger generic onFinish callback if provided
        if (options.onFinish) {
          options.onFinish({
            wpm: Math.round(60000 / speed),
            words: words.length
          });
        }

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
    }, [isRunning, currentIndex, words.length, repeatedReadingMode, currentRepetition, originalStartReading, setSpeed, memoryExerciseMode, options.onFinish, speed]);

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