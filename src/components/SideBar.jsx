// src/components/SideBar.jsx
import React, { useState } from "react";
import ConfigMenu from "./ConfigMenu"; // ✅ Importar el nuevo menú

const SideBar = ({ 
  isRunning, 
  hasText, 
  startReading, 
  pauseReading, 
  resumeReading, 
  stopReading, 
  setShowHistory,
  onHomeClick,
  voiceEnabled, 
  setVoiceEnabled,
  speed,
  setSpeed,
  fontSize,
  setFontSize,
  fontFamily,
  setFontFamily,
  isCountingDown, // ✅ Recibir isCountingDown
}) => {
  const [isConfigOpen, setIsConfigOpen] = useState(false); // ✅ Estado para el menú de configuración

  const handleSettingsClick = () => {
    setIsConfigOpen(!isConfigOpen); // ✅ Alternar menú
  };

  return (
    <>
      <div className="fixed left-0 top-0 h-full w-16 bg-gray-800 text-white flex flex-col items-center py-4 z-40 shadow-lg">
        {/* Icono de Inicio */}
        <button
          onClick={onHomeClick}
          className="p-2 mb-2 rounded-full hover:bg-gray-700 transition flex items-center justify-center"
          aria-label="Ir al inicio"
        >
          🏠
        </button>

        {/* Icono de Configuración */}
        <button
          onClick={handleSettingsClick}
          className="p-2 mb-2 rounded-full hover:bg-gray-700 transition flex items-center justify-center relative" // ✅ Añadir relative para posicionar el menú
          aria-label="Abrir configuración"
        >
          ⚙️
        </button>

        {/* Separador visual opcional */}
        <div className="w-full h-px bg-gray-600 my-2"></div>

        {/* Icono de Voz */}
        <button
          onClick={() => setVoiceEnabled(!voiceEnabled)}
          className="p-2 mb-2 rounded-full hover:bg-gray-700 transition flex items-center justify-center"
          aria-label={voiceEnabled ? "Desactivar voz" : "Activar voz"}
        >
          {voiceEnabled ? "🔊" : "🔇"}
        </button>

        {/* Icono de Iniciar */}
        <button
          onClick={startReading}
          disabled={isRunning || !hasText || isCountingDown} // ✅ Deshabilitar si está contando
          className={`p-2 mb-2 rounded-full transition flex items-center justify-center ${
            isRunning || !hasText || isCountingDown
              ? "text-gray-500 cursor-not-allowed"
              : "hover:bg-gray-700"
          }`}
          aria-label="Iniciar lectura"
        >
          ▶️
        </button>

        {/* Icono de Pausar */}
        <button
          onClick={pauseReading}
          disabled={!isRunning || isCountingDown} // ✅ Deshabilitar si está contando
          className={`p-2 mb-2 rounded-full transition flex items-center justify-center ${
            !isRunning || isCountingDown
              ? "text-gray-500 cursor-not-allowed"
              : "hover:bg-gray-700"
          }`}
          aria-label="Pausar lectura"
        >
          ⏸️
        </button>

        {/* Icono de Reanudar */}
        <button
          onClick={resumeReading}
          disabled={isRunning || isCountingDown} // ✅ Deshabilitar si está contando
          className={`p-2 mb-2 rounded-full transition flex items-center justify-center ${
            isRunning || isCountingDown
              ? "text-gray-500 cursor-not-allowed"
              : "hover:bg-gray-700"
          }`}
          aria-label="Reanudar lectura"
        >
          ↻
        </button>

        {/* Icono de Detener */}
        <button
          onClick={stopReading}
          disabled={isCountingDown} // ✅ Deshabilitar si está contando
          className={`p-2 mb-2 rounded-full hover:bg-gray-700 transition flex items-center justify-center ${
            isCountingDown
              ? "text-gray-500 cursor-not-allowed"
              : "hover:bg-gray-700"
          }`}
          aria-label="Detener lectura"
        >
          ⏹️
        </button>

        {/* Icono de Historial */}
        <button
          onClick={() => setShowHistory(true)}
          className="p-2 mb-2 rounded-full hover:bg-gray-700 transition flex items-center justify-center"
          aria-label="Abrir historial"
        >
          📚
        </button>
      </div>

      {/* ✅ Menú de configuración emergente */}
      <ConfigMenu
        isOpen={isConfigOpen}
        onClose={() => setIsConfigOpen(false)}
        speed={speed}
        setSpeed={setSpeed}
        fontSize={fontSize}
        setFontSize={setFontSize}
        fontFamily={fontFamily}
        setFontFamily={setFontFamily}
      />
    </>
  );
};

export default SideBar;