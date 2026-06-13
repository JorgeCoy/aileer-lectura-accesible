/**
 * COMPONENTE: HighlightedWord
 *
 * TÉCNICAS IMPLEMENTADAS:
 * 1. RSVP Optimizado: Punto de fijación inteligente basado en morfología
 * 2. Highlight: Resaltado completo de palabra con énfasis gradual
 * 3. Bionic Reading: Resaltado de sílabas iniciales
 * 4. Chunking: Procesamiento visual por grupos semánticos
 */

import { motion } from "framer-motion";
import { adultThemes } from "../config/themes";
import { transformToBionic } from "../utils/bionicReading";

// ... (ChunkingWord remains the same)

const HighlightedWord = ({
  word = "",
  fontSize = 80,
  fontFamily = "sans-serif",
  theme = "minimalist",
  technique = "singleWord", // singleWord | highlight | bionic | chunking
  isGhostMode = false,
  speed = 200
}) => {
  if (!word || word.trim() === "") {
    return <span className="text-gray-500 text-6xl">…</span>;
  }

  // Técnica Chunking, LineFocus, ParagraphFocus
  if (technique === "chunking" || technique === "lineFocus" || technique === "paragraphFocus") {
    // En Ghost Mode, evitamos las cajas individuales. Solo resaltamos el texto.
    if (isGhostMode) {
      const themeStyle = adultThemes[theme] || adultThemes.minimalist;

      // Estilo específico para Line Focus: Barra de fondo suave (Reading Ruler) con animación de barrido
      if (technique === "lineFocus") {
        // Calcular duración basada en la cantidad de palabras y la velocidad (WPM)
        // Tiempo = (Palabras / WPM) * 60 segundos
        const wordCount = word.trim().split(/\s+/).length;
        const duration = (wordCount / speed) * 60;

        return (
          <span
            className="font-bold relative overflow-hidden"
            style={{
              color: themeStyle.textColor, // Mantener color de texto legible
              borderRadius: '4px',
              padding: '0.1em 0.4em',
              display: 'inline-block',
              width: '100%', // Intentar llenar el ancho disponible del contenedor padre
              verticalAlign: 'bottom'
            }}
          >
            {/* Capa de fondo animada (Barrido) */}
            <motion.span
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: duration, ease: "linear" }}
              className="absolute top-0 left-0 h-full z-0"
              style={{
                backgroundColor: `${themeStyle.highlight}40`, // Fondo suave (40% opacidad)
                boxShadow: `0 0 0 1px ${themeStyle.highlight}60` // Borde sutil
              }}
            />

            {/* Texto por encima del fondo */}
            <span className="relative z-10">{word}</span>
          </span>
        );
      }

      // Estilo para Chunking y Paragraph (Solo texto coloreado)
      return (
        <span
          className="font-bold"
          style={{
            color: themeStyle.highlight,
            textShadow: `0 0 10px ${themeStyle.highlight}40`
          }}
        >
          {word}
        </span>
      );
    }

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
        <span className="font-black" style={{ /* Sin color, solo peso */ }}>{bold}</span>
        <span className="font-light opacity-70">{normal}</span>
      </div>
    );
  }

  // --- TÉCNICA HIGHLIGHT: Resaltado tipo "Marcador" ---
  if (technique === "highlight") {
    // "El Marcador": Fondo de color sólido, texto oscuro para contraste.
    // Simula pasar un resaltador sobre el texto.

    return (
      <div
        className="inline-block font-bold transition-all duration-200"
        style={{
          fontSize: `${fontSize}px`,
          fontFamily: actualFont,
          color: '#ffffff', // Texto blanco para mejor contraste en modo oscuro/colores vibrantes
          backgroundColor: themeStyle.highlight, // Color del tema

          // Estilo de marcador
          padding: '0.1em 0.4em',
          borderRadius: '4px',
          boxShadow: `0 0 15px ${themeStyle.highlight}60`, // Resplandor suave del color del tema

          // Transformación sutil
          transform: 'scale(1.05)',
        }}
      >
        {word}
      </div>
    );
  }

  // --- RENDERIZADO RSVP (Una palabra) - LIMPIO Y MINIMALISTA ---
  // "La Velocidad Pura": Sin distracciones, sin colores, solo la palabra.

  return (
    <div
      className="inline-block font-bold tracking-tight leading-tight"
      style={{
        fontSize: `${fontSize}px`,
        fontFamily: actualFont,
        color: themeStyle.textColor,
        // Sin sombras, sin efectos, pureza total
      }}
    >
      {word}
    </div>
  );
};

export default HighlightedWord;
