// src/hooks/useWordViewerLogic.js
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
  const [inputMode, setInputMode] = useState(null); // null | 'text' | 'pdf'

  const [readingTechnique, setReadingTechnique] = useState("singleWord");
  const [fontSize, setFontSize] = useState(options.fontSize || 32);
  const [fontFamily, setFontFamily] = useState(options.fontFamily || "sans-serif");

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

  // Calcular multiplicador dinámico basado en la longitud de la línea actual
  // Esto asegura que líneas cortas pasen rápido y largas lento
  // Nota: currentIndex viene del hook de abajo, pero necesitamos pasarlo como opción.
  // React manejará esto en el siguiente render.
  // Para el primer render, usamos 1.

  // PROBLEMA: No podemos usar currentIndex antes de llamar a useReadingEngine.
  // SOLUCIÓN: useReadingEngine maneja el intervalo. Podemos pasar una función o valor que cambie.
  // Pero useReadingEngine toma 'options' como argumento inicial.
  // Sin embargo, el useEffect dentro de useReadingEngine depende de options.speedMultiplier.
  // Así que si cambiamos options.speedMultiplier en cada render, el efecto se reiniciará con la nueva velocidad.

  // Necesitamos una referencia a words y currentIndex que aún no tenemos.
  // Pero words ya lo tenemos. currentIndex NO.
  // Así que tenemos que hacer esto en dos pasos o asumir que el hook useReadingEngine expone currentIndex.

  // Vamos a usar un estado local o ref para el multiplicador si es necesario, pero
  // lo más limpio es que useReadingEngine acepte el multiplicador dinámico.
  // Como no puedo acceder a currentIndex ANTES de llamar al hook,
  // voy a tener que pasar una prop al hook que sea "calculateMultiplier(index)".
  // O simplemente, como el hook devuelve currentIndex, en el siguiente render
  // calculamos el multiplicador y se lo pasamos de nuevo.

  // Para evitar el error de "access before initialization", definimos currentIndex con un valor por defecto
  // o usamos un estado separado. Pero useReadingEngine controla el estado.

  // TRUCO: El hook se ejecuta, devuelve currentIndex (0).
  // Calculamos multiplier = words[0].length.
  // Pasamos multiplier al hook.
  // El hook usa ese multiplier en su useEffect.
  // Cuando currentIndex cambia a 1, el componente se re-renderiza.
  // Calculamos multiplier = words[1].length.
  // Pasamos multiplier al hook.
  // El hook actualiza su intervalo.

  // PERO: currentIndex es devuelto POR el hook.
  // No puedo usar `const { currentIndex } = useReadingEngine(...)` y luego pasar `currentIndex` a `useReadingEngine`.

  // SOLUCIÓN: Modificar useReadingEngine para que calcule el multiplicador internamente si se le pasa una opción "dynamicSpeed".
  // O, más simple: Mover la lógica de velocidad variable DENTRO de useReadingEngine.

  // Por ahora, para no romper useReadingEngine, vamos a hacer un pequeño hack:
  // Usar un estado externo para el multiplicador que se actualiza cuando cambia currentIndex.
  // Pero eso causaría un render extra.

  // MEJOR: Modificar useReadingEngine para aceptar `words` y calcular la velocidad basada en la palabra actual si una flag está activa.

  // VOY A MODIFICAR useReadingEngine LIGÉRAMENTE en el siguiente paso.
  // Por ahora, dejaré el multiplicador en 1 o fijo en 8 para que compile, y luego ajusto useReadingEngine.

  // ESPERA, en el código anterior (que funcionaba con 8), pasaba:
  // speedMultiplier: readingTechnique === 'lineFocus' ? 8 : 1

  // Si quiero que sea dinámico, necesito que useReadingEngine sepa calcularlo.
  // Voy a pasar `speedMultiplier: 1` por ahora y modificar useReadingEngine para que,
  // si `autoCalculateSpeed` es true, use la longitud de la palabra actual.

  // O mejor: Pasemos `readingTechnique` a useReadingEngine y que él decida.

  // Para este archivo, lo dejaré preparado.

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
      // Pasamos una función o flag para velocidad dinámica?
      // Por ahora pasamos 1 y lo arreglamos en useReadingEngine
      speedMultiplier: 1,
      readingTechnique // Pasamos la técnica para que el motor sepa qué hacer
    }
  });

  // 2. LUEGO: Hooks que dependen de isRunning
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
    readingStats,
    readingProgress,
    pdfFile,
    pdfName,
    updatePageText
  } = usePdf({ enablePdf: options.enablePdf, setText, isRunning });

  // MODIFICADO: Cambia inputMode al subir PDF
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
    setInputMode(item.type || 'text'); // si guardas tipo en historial
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
    setFontFamily,
    inputMode,
    setInputMode
  };
};

export default useWordViewerLogic;