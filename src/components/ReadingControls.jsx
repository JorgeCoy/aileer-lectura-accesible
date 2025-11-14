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
  speed, // ✅ Recibir la velocidad
    voiceEnabled, // ✅ Recibir el estado de voz
  setVoiceEnabled, // ✅ Recibir la función para cambiar el estado
}) => {
  const colors = themeStyles[theme] || themeStyles.minimalist; // ✅ Usar directamente

  // ✅ Calcular si la velocidad es viable para voz
  const isVoiceSpeedValid = speed >= 500; // o el valor que elijas

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
            {/* ✅ Botón de voz con estado y mensaje */}
      <div className="flex flex-col items-center">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="voice-toggle"
            checked={voiceEnabled && isVoiceSpeedValid} // ✅ Solo activo si es válido
            onChange={() => isVoiceSpeedValid && setVoiceEnabled(!voiceEnabled)}
            disabled={!isVoiceSpeedValid} // ✅ Inhabilitar si no es válido
            className="h-5 w-5 accent-blue-500 disabled:opacity-50"
          />
          <label htmlFor="voice-toggle" className={isVoiceSpeedValid ? "" : "text-gray-400"}>
            Voz
          </label>
        </div>

        {/* ✅ Mensaje si la velocidad no es viable */}
        {!isVoiceSpeedValid && (
          <p className="text-xs text-red-500 mt-1">
            Velocidad no viable con voz de lectura
          </p>
        )}
      </div>
    </div>
  );
};

export default ReadingControls;