// src/context/ThemeProvider.jsx
import React, { useState, useEffect } from "react";
import ThemeContext from "./ThemeContext";

const validThemes = [
  "minimalist",
  "cinematic",
  "zen",
  "professional",
  "vintage",
  "focus",
  "gray"
];

const defaultThemes = {
  adult: "minimalist",
  child: "zen",
  teacher: "professional",
  adhd: "focus",
};

const ThemeProvider = ({ children, viewName = "adult" }) => {
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem(`theme-${viewName}`);

    // Si existe en localStorage y es válido, úsalo. Si no, usa el tema por defecto.
    return validThemes.includes(savedTheme) ? savedTheme : (defaultThemes[viewName] || "minimalist");
  });

  // 🔹 Guarda el tema en localStorage cada vez que cambia
  useEffect(() => {
    localStorage.setItem(`theme-${viewName}`, theme);
  }, [theme, viewName]);

  const contextValue = { theme, setTheme };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;