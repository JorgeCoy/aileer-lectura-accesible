// src/components/HighlightedWord.jsx
import React from "react";
import { motion } from "framer-motion";
import { adultThemes } from "../config/themes";
import { transformToBionic } from "../utils/bionicReading";

const HighlightedWord = ({
  word = "",
  fontSize = 80,
  fontFamily = "sans-serif",
  theme = "minimalist",
  technique = "singleWord" // singleWord | bionic | chunking
}) => {
  if (!word || word.trim() === "") {
    return <span className="text-gray-500 text-6xl">…</span>;
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

  // --- RENDERIZADO RSVP (Una palabra) ---
  const mid = Math.floor(word.length / 2);

  return (
    <div
      className="inline-block font-black tracking-tight leading-tight"
      style={{
        fontSize: `${fontSize}px`,
        fontFamily: actualFont,
        color: themeStyle.textColor,
        textShadow: `
          0 0 20px ${themeStyle.highlight}40,
          0 0 40px ${themeStyle.highlight}30,
          0 0 80px ${themeStyle.highlight}20
        `
      }}
    >
      {word.slice(0, mid)}
      <motion.span
        key={word[mid]}
        initial={{ scale: 1.3, rotate: 5 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ duration: 0.2 }}
        className="inline-block px-3 py-1 mx-1 rounded-lg font-black"
        style={{
          backgroundColor: themeStyle.highlight,
          color: theme === "vintage" || theme === "sunset" ? "#1f2937" : "white",
          boxShadow: `0 0 30px ${themeStyle.highlight}80`
        }}
      >
        {word[mid]}
      </motion.span>
      {word.slice(mid + 1)}
    </div>
  );
};

export default HighlightedWord;