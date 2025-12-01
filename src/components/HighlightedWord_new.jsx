/**
 * COMPONENTE: HighlightedWord
 *
 * TÉCNICAS IMPLEMENTADAS:
 * 1. RSVP Optimizado: Punto de fijación inteligente basado en morfología
 * 2. Highlight: Resaltado completo de palabra con énfasis gradual
 * 3. Bionic Reading: Resaltado de sílabas iniciales
 * 4. Chunking: Procesamiento visual por grupos semánticos
 */

import React from "react";
import { adultThemes } from "../config/themes";
import { transformToBionic } from "../utils/bionicReading";

// Componente auxiliar para técnica Chunking
const ChunkingWord = ({
  word = "",
  fontSize = 80,
  fontFamily = "sans-serif",
  theme = "minimalist"
}) => {
  const themeStyle = adultThemes[theme] || adultThemes.minimalist;

  // Fuentes reales
  let actualFont = fontFamily;
  if (fontFamily === "cursive") actualFont = "'Dancing Script', cursive";
  if (fontFamily === "dyslexic") actualFont = "'OpenDyslexic', sans-serif";
  if (fontFamily === "comic") actualFont = "'Comic Neue', cursive";

  // Técnica mejorada: chunks con jerarquía visual
  const getChunkStyling = (chunkWords) => {
    const wordCount = chunkWords.length;

    return chunkWords.map((chunkWord, index) => {
      const isFirst = index === 0;
      const isLast = index === wordCount - 1;
      const isMiddle = !isFirst && !isLast;

      return {
        word: chunkWord,
        style: {
          color: isFirst ? themeStyle.highlight : // Primera palabra prominente
                 isMiddle ? themeStyle.textColor :
                 '#6B7280', // Última palabra tenue
          opacity: isFirst ? 1.0 : isMiddle ? 0.9 : 0.7,
          fontWeight: isFirst ? '700' : isMiddle ? '500' : '400',
          transform: isFirst ? 'scale(1.05)' : 'scale(1.0)',
          textShadow: isFirst ? `0 0 4px ${themeStyle.highlight}30` : 'none'
        }
      };
    });
  };

  const chunkWords = word.split(' ');
  const styledWords = getChunkStyling(chunkWords);

  return (
    <div
      className="inline-block transition-all duration-300 ease-out"
      style={{
        fontSize: `${fontSize}px`,
        fontFamily: actualFont,
        backgroundColor: `rgba(96, 165, 250, 0.08)`,
        borderRadius: '6px',
        padding: '0.2em 0.4em',
        border: `1px solid ${themeStyle.highlight}20`,
        boxShadow: `0 2px 8px ${themeStyle.highlight}15`
      }}
    >
      {styledWords.map((styledWord, index) => (
        <span
          key={index}
          className="inline-block transition-all duration-300 mx-0.5"
          style={styledWord.style}
        >
          {styledWord.word}
        </span>
      ))}
    </div>
  );
};

const HighlightedWord = ({
  word = "",
  fontSize = 80,
  fontFamily = "sans-serif",
  theme = "minimalist",
  technique = "singleWord" // singleWord | highlight | bionic | chunking
}) => {
  if (!word || word.trim() === "") {
    return <span className="text-gray-500 text-6xl">…</span>;
  }

  // Técnica Chunking: Usa componente especializado
  if (technique === "chunking") {
    return (
      <ChunkingWord
        word={word}
        fontSize={fontSize}
        fontFamily={fontFamily}
        theme={theme}
      />
    );
  }

  // Obtener colores del tema actual
  const themeStyle = adultThemes[theme] || adultThemes.minimalist;

  // Fuentes reales
  let actualFont = fontFamily;
  if (fontFamily === "cursive") actualFont = "'Dancing Script', cursive";
  if (fontFamily === "dyslexic") actualFont = "'OpenDyslexic', sans-serif";
  if (fontFamily === "comic") actualFont = "'Comic Neue', cursive";

  // --- RENDERIZADO BIÓNICO ---
  if (technique === "bionic") {
    const { bold, normal } = transformToBionic(word);
    return (
      <div
        className="inline-block tracking-tight leading-tight"
        style={{
          fontSize: `${fontSize}px`,
          fontFamily: actualFont,
          color: themeStyle.textColor,
        }}
      >
        <span className="font-black" style={{ color: themeStyle.highlight }}>{bold}</span>
        <span className="font-light opacity-90">{normal}</span>
      </div>
    );
  }

  // --- TÉCNICA HIGHLIGHT: Resaltado completo de palabra ---
  if (technique === "highlight") {
    // Técnica diferente: resalta la palabra ENTERA con énfasis gradual
    // No tiene punto de fijación específico como Spritz
    // Es más como un "destacado" continuo para entrenamiento visual

    const getHighlightIntensity = (wordLen) => {
      if (wordLen <= 4) return { scale: 1.05, brightness: 1.1 }; // Suave
      if (wordLen <= 7) return { scale: 1.08, brightness: 1.15 }; // Moderado
      return { scale: 1.1, brightness: 1.2 }; // Enfático para palabras complejas
    };

    const highlightConfig = getHighlightIntensity(word.length);

    return (
      <div
        className="inline-block font-semibold transition-all duration-500 ease-out"
        style={{
          fontSize: `${fontSize}px`,
          fontFamily: actualFont,
          color: themeStyle.highlight, // Toda la palabra en color de resaltado

          // Transformaciones sutiles para toda la palabra
          transform: `scale(${highlightConfig.scale})`,
          filter: `brightness(${highlightConfig.brightness})`,

          // Sombra que une toda la palabra
          textShadow: `0 0 8px ${themeStyle.highlight}60`,

          // Padding para separación visual
          padding: '0 0.3em',

          // Fondo sutil que envuelve toda la palabra
          backgroundColor: `rgba(96, 165, 250, 0.1)`,
          borderRadius: '4px',

          // Animación de aparición gradual
          animation: 'highlightPulse 2s ease-in-out infinite'
        }}
      >
        {word}
        <style jsx>{`
          @keyframes highlightPulse {
            0%, 100% { opacity: 0.9; }
            50% { opacity: 1.0; }
          }
        `}</style>
      </div>
    );
  }

  // --- RENDERIZADO RSVP OPTIMIZADO (Una palabra) ---

  /**
   * ALGORITMO DE FIJACIÓN ÓPTIMA:
   *
   * 1. Para palabras cortas (≤3 letras): Final de la palabra
   * 2. Para palabras medias (4-6 letras): 60% del inicio
   * 3. Para palabras largas (≥7 letras): 40% del inicio
   *
   * Esto se basa en estudios de eye-tracking que muestran que:
   * - Leemos desde el inicio hacia el final
   * - El punto óptimo no es el medio absoluto
   * - Palabras más largas necesitan fijación más temprana
   */

  const calculateOptimalFixation = (word) => {
    const len = word.length;

    if (len <= 3) {
      // Palabras cortas: fijar al final
      return len - 1;
    } else if (len <= 6) {
      // Palabras medias: 60% del inicio
      return Math.floor(len * 0.6);
    } else {
      // Palabras largas: 40% del inicio (más temprano para procesar morfemas)
      return Math.floor(len * 0.4);
    }
  };

  const fixationIndex = calculateOptimalFixation(word);

  // Adaptar intensidad visual según longitud y complejidad
  const getVisualIntensity = (wordLen) => {
    if (wordLen <= 3) return { opacity: 0.6, scale: 1.1 };      // Suave
    if (wordLen <= 6) return { opacity: 0.8, scale: 1.15 };     // Moderado
    return { opacity: 1.0, scale: 1.2 };                        // Enfático para palabras complejas
  };

  const visualConfig = getVisualIntensity(word.length);

  // Variables para RSVP (necesarias para el componente)
  const speed = 300; // Valor por defecto
  const adaptiveStyle = {
    orpColor: themeStyle.highlight,
    orpScale: visualConfig.scale,
    orpOpacity: visualConfig.opacity
  };

  return (
    <div
      className="inline-block font-bold tracking-tight leading-tight"
      style={{
        fontSize: `${fontSize}px`,
        fontFamily: actualFont,
        color: themeStyle.textColor,
        // Sombra sutil solo para contexto, no para distracción
        textShadow: `0 0 8px ${themeStyle.highlight}20`
      }}
    >
      {/* Parte inicial de la palabra */}
      <span className="opacity-90">
        {word.slice(0, fixationIndex)}
      </span>

      {/* ORP: Punto de fijación inteligente y sutil */}
      <span
        className="font-semibold transition-all duration-300 relative inline-block"
        style={{
          color: adaptiveStyle.orpColor,
          transform: `scale(${adaptiveStyle.orpScale})`,
          opacity: adaptiveStyle.orpOpacity,

          // Sombra sutil solo cuando es necesario
          textShadow: adaptiveStyle.orpScale > 1.1 ?
            `0 0 4px ${adaptiveStyle.orpColor}30` : 'none',

          // Espaciado integrado - parte de la palabra
          margin: '0 0.05em',

          // Indicador minimalista (opcional basado en complejidad)
          borderBottom: word.length > 8 && speed < 400 ?
            `1px solid ${adaptiveStyle.orpColor}40` : 'none',
          paddingBottom: word.length > 8 && speed < 400 ? '2px' : '0'
        }}
      >
        {word[fixationIndex]}
      </span>

      {/* Parte final de la palabra */}
      <span className="opacity-80">
        {word.slice(fixationIndex + 1)}
      </span>
    </div>
  );
};

export default HighlightedWord;
