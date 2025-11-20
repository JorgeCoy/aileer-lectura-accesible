// src/components/HighlightedWord.jsx
import React from "react";

const HighlightedWord = ({ word, fontSize = 32, fontFamily = "sans-serif", theme = "minimalist" }) => {
  if (!word) return <span className="text-gray-400">…</span>;

  const mid = Math.floor(word.length / 2);

  // ✅ Definir estilos dinámicos
  const dynamicStyles = {
    fontSize: `${fontSize}px`,
    fontFamily: fontFamily === "cursive" ? "cursive" : fontFamily,
    lineHeight: "1.2",
  };

  return (
    <div style={dynamicStyles}>
      {word.slice(0, mid)}
      <span className="bg-yellow-400 text-white px-2 py-1 rounded">
        {word[mid]}
      </span>
      {word.slice(mid + 1)}
    </div>
  );
};

export default HighlightedWord;