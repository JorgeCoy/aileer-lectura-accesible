// src/components/ReadingControls.jsx
import React from "react";
import { themeStyles } from "../config/themes"; // ✅ Importar directamente

const ReadingControls = ({
  isRunning,
  hasText,
  start,
  pause,
  resume,
  stop,
  setShowHistory,
  theme = "minimalist", // Nuevo: recibir tema como prop
}) => {
  const colors = themeStyles[theme] || themeStyles.minimalist; // ✅ Usar directamente

  return (
    <div className="flex flex-wrap gap-2 mb-4">
      <button
        onClick={start}
        disabled={isRunning || !hasText}
        className={`${colors.base} px-4 py-2 rounded text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200`}
        aria-label="Iniciar lectura"
      >
        ▶️ Iniciar
      </button>

      <button
        onClick={pause}
        disabled={!isRunning}
        className={`${colors.base} px-4 py-2 rounded text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200`}
        aria-label="Pausar lectura"
      >
        ⏸️ Pausar
      </button>

      <button
        onClick={resume}
        disabled={isRunning}
        className={`${colors.base} px-4 py-2 rounded text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200`}
        aria-label="Reanudar lectura"
      >
        ↻ Reanudar
      </button>

      <button
        onClick={stop}
        className={`${colors.stop} px-4 py-2 rounded text-white font-medium transition-colors duration-200`}
        aria-label="Detener lectura"
      >
        ⏹️ Detener
      </button>

      <button
        onClick={() => setShowHistory(true)}
        className={`${colors.history} px-4 py-2 rounded text-white font-medium transition-colors duration-200`}
        aria-label="Abrir historial de textos"
      >
        📚 Historial
      </button>
    </div>
  );
};

export default ReadingControls;