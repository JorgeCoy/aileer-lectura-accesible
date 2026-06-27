import React, { useState } from 'react';
import {
  Cog6ToothIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
  PlayIcon,
  PauseIcon,
  ArrowPathIcon,
  StopIcon,
  BoltIcon,
  WrenchScrewdriverIcon,
  PaintBrushIcon,
  DocumentTextIcon,
  ArrowsPointingOutIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline';

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

  const buttonClass = "mb-3 w-full px-4 py-3 rounded-xl transition-all duration-300 flex items-center shadow-sm hover:shadow-md";
  const inactiveClass = "bg-gray-800/80 backdrop-blur text-gray-300 hover:bg-gray-700/80 border border-gray-700/50";
  const activeClass = "bg-blue-600/20 text-blue-400 border border-blue-500/30";

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
    <div className="w-full h-full bg-gray-900/95 backdrop-blur-md text-white flex flex-col overflow-y-auto custom-scrollbar">

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
            <div className="ml-2 space-y-5 p-5 bg-gray-800/40 backdrop-blur-md rounded-2xl border border-gray-700/50 shadow-inner">

              {/* Toggle Modo Contexto (Ghost Mode) */}
              {supportsContextMode && (
                <div className="pb-4 border-b border-gray-700/50">
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-sm font-medium text-gray-200 flex items-center gap-2">
                      {isContextMode ? <EyeIcon className="w-5 h-5 text-blue-400" /> : <EyeSlashIcon className="w-5 h-5 text-gray-400" />}
                      Modo Contexto
                    </label>
                    <button
                      onClick={() => onContextModeChange(!isContextMode)}
                      className={`w-12 h-6 rounded-full transition-colors duration-300 relative ${isContextMode ? 'bg-blue-500' : 'bg-gray-600'}`}
                    >
                      <div
                        className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 ${isContextMode ? 'translate-x-6' : 'translate-x-0'}`}
                      />
                    </button>
                  </div>
                  <p className="text-xs text-gray-400 ml-7">Ver técnica aplicada sobre el texto.</p>
                </div>
              )}

              {/* Velocidad */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-200 flex items-center gap-2">
                    <BoltIcon className="w-5 h-5 text-yellow-400" /> Velocidad
                  </label>
                  <span className="text-xs font-bold bg-gray-900/60 px-2 py-1 rounded-md text-blue-300">{Math.round(60000 / speed)} WPM</span>
                </div>
                <input
                  type="range"
                  value={Math.round(60000 / speed)}
                  onChange={(e) => setSpeed(Math.round(60000 / Number(e.target.value)))}
                  min="20"
                  max="1000"
                  step="5"
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500 hover:accent-blue-400"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Lento</span>
                  <span>Rápido</span>
                </div>
              </div>

              {/* Técnica */}
              <div>
                <label className="text-sm font-medium text-gray-200 flex items-center gap-2 mb-2">
                  <WrenchScrewdriverIcon className="w-5 h-5 text-gray-400" /> Técnica
                </label>
                <select
                  value={readingTechnique}
                  onChange={(e) => setReadingTechnique(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-900/50 border border-gray-600/50 rounded-xl text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none appearance-none cursor-pointer"
                  style={{ backgroundImage: 'url("data:image/svg+xml,%3csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 20 20\'%3e%3cpath stroke=\'%239ca3af\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'1.5\' d=\'M6 8l4 4 4-4\'/%3e%3c/svg%3e")', backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em', paddingRight: '2.5rem' }}
                >
                  <option value="highlight">Resaltado (Básico)</option>
                  <option value="singleWord">Una palabra (RSVP)</option>
                  <option value="bionic">Lectura Biónica</option>
                  <option value="spritz">Spritz (Meta-guide)</option>
                  <option value="chunking">Chunking (Grupos)</option>
                  <option value="lineFocus">Línea por Puntos</option>
                  <option value="paragraphFocus">Enfoque en Párrafos</option>
                  <option value="saccade">Entrenamiento Sacádico</option>
                  <option value="saccadicFocus">Salto Sacádico Guiado</option>
                  <option value="preview">Previewing</option>
                  <option value="cloze">Ejercicio Cloze</option>
                </select>
              </div>

              {/* Tema */}
              <div>
                <label className="text-sm font-medium text-gray-200 flex items-center gap-2 mb-2">
                  <PaintBrushIcon className="w-5 h-5 text-pink-400" /> Tema
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'minimalist', name: 'Minimalista' },
                    { id: 'cinematic', name: 'Cinemático' },
                    { id: 'zen', name: 'Zen' },
                    { id: 'professional', name: 'Profesional' },
                    { id: 'vintage', name: 'Vintage' },
                    { id: 'focus', name: 'Enfoque' }
                  ].map(t => (
                    <button
                      key={t.id}
                      onClick={() => setTheme(t.id)}
                      className={`px-3 py-2 text-xs rounded-lg border transition-all ${theme === t.id ? 'bg-blue-600/30 border-blue-500/50 text-white' : 'bg-gray-900/30 border-gray-700/50 text-gray-400 hover:bg-gray-800/50'}`}
                    >
                      {t.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tipografía (Fuente y Tamaño) */}
              <div className="grid grid-cols-2 gap-4">
                {/* Tipo de Fuente */}
                <div>
                  <label className="text-sm font-medium text-gray-200 flex items-center gap-2 mb-2">
                    <DocumentTextIcon className="w-4 h-4 text-gray-400" /> Fuente
                  </label>
                  <select
                    value={fontFamily}
                    onChange={(e) => setFontFamily(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-900/50 border border-gray-600/50 rounded-lg text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none appearance-none cursor-pointer"
                    style={{ backgroundImage: 'url("data:image/svg+xml,%3csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 20 20\'%3e%3cpath stroke=\'%239ca3af\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'1.5\' d=\'M6 8l4 4 4-4\'/%3e%3c/svg%3e")', backgroundPosition: 'right 0.2rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.2em 1.2em', paddingRight: '1.5rem' }}
                  >
                    <option value="sans-serif">Sans Serif</option>
                    <option value="serif">Serif</option>
                    <option value="dyslexic">Dislexia</option>
                    <option value="cursive">Cursiva</option>
                  </select>
                </div>

                {/* Tamaño de Fuente */}
                <div>
                  <label className="text-sm font-medium text-gray-200 flex items-center gap-2 mb-2">
                    <ArrowsPointingOutIcon className="w-4 h-4 text-gray-400" /> Tamaño
                  </label>
                  <input
                    type="number"
                    value={fontSize}
                    onChange={(e) => setFontSize(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-gray-900/50 border border-gray-600/50 rounded-lg text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none"
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
                <span>{Math.round(60000 / speed)} WPM</span>
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
            className={`${buttonClass} ${!hasText || isCountingDown ? "bg-gray-800/80 opacity-50" : "bg-blue-600 hover:bg-blue-500 text-white border-transparent"}`}
          >
            {canResume ? (
              <ArrowPathIcon className="w-6 h-6 flex-shrink-0" />
            ) : (
              <PlayIcon className="w-6 h-6 flex-shrink-0 ml-1 text-white" />
            )}
            <span className="ml-3 font-medium text-white">
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



