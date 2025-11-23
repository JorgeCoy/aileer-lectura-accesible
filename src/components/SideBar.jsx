// src/components/SideBar.jsx
import React, { useState } from "react";
import ConfigMenu from "./ConfigMenu";
import {
  HomeIcon,
  Cog6ToothIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
  PlayIcon,
  PauseIcon,
  ArrowPathIcon,
  StopIcon,
  BookOpenIcon
} from "@heroicons/react/24/solid";

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
  isCountingDown,
  currentIndex,
  totalWords,
  theme, // ✅ Nueva prop
  setTheme, // ✅ Nueva prop
  readingTechnique, // ✅ Nueva prop
  setReadingTechnique, // ✅ Nueva prop
  currentTheme, // ✅ Nueva prop
}) => {
  const [isConfigOpen, setIsConfigOpen] = useState(false);

  const handleSettingsClick = () => {
    setIsConfigOpen(!isConfigOpen);
  };

  // ✅ Lógica inteligente para Play/Resume
  const canResume = currentIndex > 0 && currentIndex < totalWords - 1;

  const handlePlayClick = () => {
    if (canResume) {
      resumeReading();
    } else {
      startReading();
    }
  };

  // ✅ Clases comunes para los botones
  const buttonClass = "p-3 mb-3 rounded-xl transition-all duration-300 flex items-center justify-center shadow-md hover:shadow-lg hover:scale-110";
  const activeClass = "bg-blue-600 text-white hover:bg-blue-500";
  const inactiveClass = "bg-gray-700 text-gray-300 hover:bg-gray-600";
  const disabledClass = "bg-gray-800 text-gray-600 cursor-not-allowed opacity-50";

  return (
    <>
      <div
        className={`fixed left-0 top-0 h-full bg-gray-900/95 backdrop-blur-md text-white flex flex-col items-center py-6 z-40 shadow-2xl transition-all duration-500 ease-in-out ${isRunning ? "w-20 justify-center" : "w-20 justify-start"
          }`}
      >
        {/* ✅ Grupo Superior: Inicio, Config, Voz, Historial (Se ocultan al leer) */}
        {!isRunning && (
          <div className="flex flex-col items-center w-full animate-fadeIn">
            {/* Inicio */}
            <button
              onClick={onHomeClick}
              className={`${buttonClass} ${inactiveClass}`}
              title="Ir al inicio"
            >
              <HomeIcon className="w-6 h-6" />
            </button>

            {/* Configuración */}
            <button
              onClick={handleSettingsClick}
              className={`${buttonClass} ${isConfigOpen ? activeClass : inactiveClass}`}
              title="Configuración"
            >
              <Cog6ToothIcon className="w-6 h-6" />
            </button>

            {/* Voz */}
            <button
              onClick={() => setVoiceEnabled(!voiceEnabled)}
              className={`${buttonClass} ${voiceEnabled ? "bg-green-600 hover:bg-green-500" : inactiveClass}`}
              title={voiceEnabled ? "Desactivar voz" : "Activar voz"}
            >
              {voiceEnabled ? <SpeakerWaveIcon className="w-6 h-6" /> : <SpeakerXMarkIcon className="w-6 h-6" />}
            </button>

            {/* Historial */}
            <button
              onClick={() => setShowHistory(true)}
              className={`${buttonClass} ${inactiveClass}`}
              title="Historial"
            >
              <BookOpenIcon className="w-6 h-6" />
            </button>

            <div className="w-10 h-px bg-gray-700 my-4"></div>
          </div>
        )}

        {/* ✅ Grupo Central: Controles de Reproducción */}
        <div className={`flex flex-col items-center w-full ${isRunning ? "justify-center h-full" : "mt-auto mb-auto"}`}>
          {/* Iniciar / Reanudar (Solo visible si NO está corriendo) */}
          {!isRunning && (
            <button
              onClick={handlePlayClick} // ✅ Usar el manejador inteligente
              disabled={!hasText || isCountingDown}
              className={`${buttonClass} ${!hasText || isCountingDown ? disabledClass : "bg-blue-600 hover:bg-blue-500 text-white"
                }`}
              title={canResume ? "Reanudar lectura" : "Iniciar lectura"} // ✅ Tooltip dinámico
            >
              {canResume ? <ArrowPathIcon className="w-7 h-7" /> : <PlayIcon className="w-7 h-7 ml-1" />} {/* ✅ Icono dinámico opcional */}
            </button>
          )}

          {/* Pausar (Solo visible si ESTÁ corriendo) */}
          {isRunning && (
            <button
              onClick={pauseReading}
              disabled={isCountingDown}
              className={`${buttonClass} bg-yellow-500 hover:bg-yellow-400 text-white`}
              title="Pausar"
            >
              <PauseIcon className="w-8 h-8" />
            </button>
          )}

          {/* Detener (Siempre visible si hay texto o está corriendo) */}
          {(isRunning || hasText) && (
            <button
              onClick={stopReading}
              disabled={isCountingDown}
              className={`${buttonClass} ${isCountingDown ? disabledClass : "bg-red-600 hover:bg-red-500 text-white"}`}
              title="Detener"
            >
              <StopIcon className="w-6 h-6" />
            </button>
          )}
        </div>
      </div>

      {/* ✅ Menú de configuración */}
      <ConfigMenu
        isOpen={isConfigOpen}
        onClose={() => setIsConfigOpen(false)}
        speed={speed}
        setSpeed={setSpeed}
        fontSize={fontSize}
        setFontSize={setFontSize}
        fontFamily={fontFamily}
        setFontFamily={setFontFamily}
        // ✅ Pasar nuevas props
        theme={theme}
        setTheme={setTheme}
        readingTechnique={readingTechnique}
        setReadingTechnique={setReadingTechnique}
        currentTheme={currentTheme}
      />
    </>
  );
};

export default SideBar;