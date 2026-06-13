import React, { useState } from 'react';
import {
  Cog6ToothIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
  PlayIcon,
  PauseIcon,
  ArrowPathIcon,
  StopIcon,
  PencilSquareIcon,
  BookOpenIcon
} from '@heroicons/react/24/solid';

const PreviewConfigPanel = ({
  isRunning,
  hasText,
  startReading,
  pauseReading,
  stopReading,
  voiceEnabled,
  setVoiceEnabled,
  speed,
  setSpeed,
  fontSize,
  setFontSize,
  fontFamily,
  setFontFamily,
  theme,
  setTheme,
  readingTechnique,
  setReadingTechnique,
  currentIndex,
  totalWords,
  isCountingDown,
  isContextMode,
  onContextModeChange,
  supportsContextMode = true,
  isStudentView = false
}) => {
  const [isConfigOpen, setIsConfigOpen] = useState(false);

  const buttonClass = "mb-3 w-full px-4 py-3 rounded-xl transition-all duration-300 flex items-center shadow-md hover:shadow-lg hover:scale-105";
  const inactiveClass = "bg-gray-700 text-gray-300 hover:bg-gray-600";
  const activeClass = "bg-blue-600 text-white ring-2 ring-blue-400";

  const handlePlayClick = () => {
    const canResume = currentIndex > 0 && currentIndex < totalWords - 1;
    if (canResume) {
      // resumeReading(); // No tenemos esta función en preview
      startReading();
    } else {
      startReading();
    }
  };

  const canResume = currentIndex > 0 && currentIndex < totalWords - 1;

  return (
    <div className="w-full h-full bg-gray-900/95 backdrop-blur-md text-white flex flex-col overflow-y-auto scrollbar-hide">

      {/* Contenido */}
      <div className="flex-1 p-4 space-y-4 pt-6">

        {/* Configuración Principal */}
        <div className="space-y-3">
          {!isStudentView && (
            <button
              onClick={() => setIsConfigOpen(!isConfigOpen)}
              className={`${buttonClass} ${isConfigOpen ? activeClass : inactiveClass}`}
            >
              <Cog6ToothIcon className="w-6 h-6 flex-shrink-0" />
              <span className="ml-3 font-medium">Configuración</span>
            </button>
          )}

          {isConfigOpen && (
            <div className="ml-4 space-y-3 p-4 bg-gray-800 rounded-xl border border-gray-700">

              {/* Toggle Modo Contexto (Ghost Mode) - Solo si la técnica lo soporta */}
              {supportsContextMode && (
                <div className="mb-4 pb-4 border-b border-gray-700">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                      <span className="text-lg">👻</span> Modo Contexto
                    </label>
                    <button
                      onClick={() => onContextModeChange(!isContextMode)}
                      className={`w-12 h-6 rounded-full transition-colors duration-300 relative ${isContextMode ? 'bg-blue-500' : 'bg-gray-600'
                        }`}
                    >
                      <div
                        className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 ${isContextMode ? 'translate-x-6' : 'translate-x-0'
                          }`}
                      />
                    </button>
                  </div>
                  <p className="text-xs text-gray-400">
                    Ver técnica aplicada sobre el texto completo.
                  </p>
                </div>
              )}

              {/* Velocidad */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">⚡ Velocidad (WPM)</label>
                <input
                  type="number"
                  value={speed}
                  onChange={(e) => setSpeed(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                  min="50"
                  max="1000"
                />
              </div>

              {/* Técnica */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">🛠️ Técnica</label>
                <select
                  value={readingTechnique}
                  onChange={(e) => setReadingTechnique(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value="highlight">Resaltado (Básico)</option>
                  <option value="singleWord">Una palabra (RSVP)</option>
                  <option value="bionic">Lectura Biónica</option>
                  <option value="spritz">Spritz (Meta-guide)</option>
                  <option value="chunking">Chunking (Grupos)</option>
                  <option value="lineFocus">Línea por Puntos</option>
                  <option value="paragraphFocus">Enfoque en Párrafos</option>
                  <option value="saccade">Entrenamiento Sacádico</option>
                  <option value="saccadicFocus">Salto Sacádico Guiado (Saccadic Focus)</option>
                  <option value="preview">Previewing (Palabras Clave)</option>
                  <option value="cloze">Ejercicio Cloze (Memoria)</option>
                </select>
              </div>

              {/* Tema */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">🎨 Tema</label>
                <select
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value="minimalist">Minimalista</option>
                  <option value="cinematic">Cinematográfico</option>
                  <option value="zen">Zen</option>
                  <option value="professional">Profesional</option>
                  <option value="vintage">Vintage</option>
                  <option value="focus">Enfoque</option>
                </select>
              </div>

              {/* Tipografía (Fuente y Tamaño) */}
              <div className="grid grid-cols-2 gap-3">
                {/* Tipo de Fuente */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">🔤 Fuente</label>
                  <select
                    value={fontFamily}
                    onChange={(e) => setFontFamily(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 text-sm"
                  >
                    <option value="sans-serif">Sans Serif</option>
                    <option value="serif">Serif</option>
                    <option value="dyslexic">Dislexia</option>
                    <option value="cursive">Cursiva</option>
                    <option value="comic">Comic</option>
                  </select>
                </div>

                {/* Tamaño de Fuente */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">📏 Tamaño</label>
                  <input
                    type="number"
                    value={fontSize}
                    onChange={(e) => setFontSize(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 text-sm"
                    min="12"
                    max="48"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Voz */}
          <button
            onClick={() => setVoiceEnabled(!voiceEnabled)}
            className={`${buttonClass} ${voiceEnabled ? activeClass : inactiveClass}`}
          >
            {voiceEnabled ? (
              <SpeakerWaveIcon className="w-6 h-6 flex-shrink-0" />
            ) : (
              <SpeakerXMarkIcon className="w-6 h-6 flex-shrink-0" />
            )}
            <span className="ml-3 font-medium">
              {voiceEnabled ? 'Voz Activada' : 'Voz Desactivada'}
            </span>
          </button>
        </div>

        {/* Información de Lectura */}
        {hasText && (
          <div className="p-4 bg-gray-800 rounded-xl border border-gray-700">
            <div className="text-center space-y-2">
              <div className="text-sm text-gray-400">
                Palabra {currentIndex + 1} de {totalWords}
              </div>
              <div className="text-xs text-gray-500 flex flex-col gap-1">
                <span>{speed} WPM</span>
                <span className="text-blue-400 font-medium">
                  {/* Map technique value to readable name */}
                  {(() => {
                    const options = {
                      highlight: "Resaltado",
                      singleWord: "Una Palabra",
                      bionic: "Bionic Reading",
                      spritz: "Spritz",
                      chunking: "Chunking",
                      lineFocus: "Línea por Puntos",
                      paragraphFocus: "Enfoque Párrafos",
                      saccade: "Sacádico",
                      preview: "Previewing",
                      cloze: "Cloze"
                    };
                    return options[readingTechnique] || readingTechnique;
                  })()}
                </span>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Controles de Reproducción */}
      <div className="p-4 border-t border-gray-700 space-y-3">
        {!isRunning && (
          <button
            onClick={handlePlayClick}
            disabled={!hasText || isCountingDown}
            className={`${buttonClass} ${!hasText || isCountingDown ? "bg-gray-800 opacity-50" : "bg-blue-600 hover:bg-blue-500"}`}
          >
            {canResume ? (
              <ArrowPathIcon className="w-6 h-6 flex-shrink-0" />
            ) : (
              <PlayIcon className="w-6 h-6 flex-shrink-0 ml-1" />
            )}
            <span className="ml-3 font-medium">
              {canResume ? "Reanudar" : "Iniciar Lectura"}
            </span>
          </button>
        )}

        {isRunning && (
          <button
            onClick={pauseReading}
            className={`${buttonClass} bg-yellow-500 hover:bg-yellow-400`}
          >
            <PauseIcon className="w-6 h-6 flex-shrink-0" />
            <span className="ml-3 font-medium">Pausar</span>
          </button>
        )}

        {(isRunning || hasText) && (
          <button
            onClick={stopReading}
            className={`${buttonClass} bg-red-600 hover:bg-red-500`}
          >
            <StopIcon className="w-6 h-6 flex-shrink-0" />
            <span className="ml-3 font-medium">Detener</span>
          </button>
        )}
      </div>

    </div>
  );
};

export default PreviewConfigPanel;



