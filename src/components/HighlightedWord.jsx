// src/components/HighlightedWord.jsx
import React from "react";

const HighlightedWord = ({ word, fontSize = 32, fontFamily = "sans-serif", theme = "minimalist" }) => {
  if (!word) return <span className="text-gray-400">…</span>;

  const mid = Math.floor(word.length / 2);

  // ✅ Definir estilos dinámicos con fuentes reales
  const dynamicStyles = {
    fontSize: `${fontSize}px`,
    lineHeight: "1.2",
    color: theme === "cinematic" || theme === "gray" || theme === "focus" 
      ? "white" // Letra blanca si fondo oscuro
      : "black", // Letra negra si fondo claro
  };

  // ✅ Mapear fontFamily a una fuente real
  let actualFontFamily = fontFamily;
  if (fontFamily === "cursive") {
    actualFontFamily = "'Dancing Script', cursive"; // ✅ Fuente real de cursiva
  } else if (fontFamily === "dyslexic") {
    actualFontFamily = "'OpenDyslexic', sans-serif"; // ✅ Fuente para dislexia
  }

  return (
    <div style={{ ...dynamicStyles, fontFamily: actualFontFamily }}>
      {word.slice(0, mid)}
      <span className="bg-yellow-400 text-white px-2 py-1 rounded">
        {word[mid]}
      </span>
      {word.slice(mid + 1)}
    </div>
  );
};

export default HighlightedWord;