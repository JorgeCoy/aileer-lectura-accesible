import React, { useState, useContext, useRef } from "react";
import ConfigMenu from "./ConfigMenu";
import PdfSidebarButton from "./PdfSidebarButton";
import AppContext from "../context/AppContext";
import {
  HomeIcon,
  Cog6ToothIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
  PlayIcon,
  PauseIcon,
  ArrowPathIcon,
  StopIcon,
  BookOpenIcon,
  EyeIcon,
  FireIcon,
  PencilSquareIcon
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
  theme,
  setTheme,
  readingTechnique,
  setReadingTechnique,
  currentTheme,
  handlePdfUpload,
  voices,
  selectedVoice,
  setSelectedVoice,
  inputMode,
  setInputMode,
  pdfPages,
  selectedPage,
  setSelectedPage,
  pdfName,
  readingProgress,
  bookmarks,
  toggleBookmark,
  pageNotes,
  addPageNote,
  removePageNote,
  goToNextPage,
  goToPreviousPage,
  exportProgress
}) => {
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const { setCurrentView, goToView, streak } = useContext(AppContext);

  const handleSettingsClick = () => {
    setIsConfigOpen(!isConfigOpen);
  };

  const canResume = currentIndex > 0 && currentIndex < totalWords - 1;

  const handlePlayClick = () => {
    if (canResume) {
      resumeReading();
    } else {
      startReading();
    }
  };

  const buttonClass = "p-3 mb-3 rounded-xl transition-all duration-300 flex items-center justify-center shadow-md hover:shadow-lg hover:scale-110";
  const inactiveClass = "bg-gray-700 text-gray-300 hover:bg-gray-600";

  return (
    <>
      <div className={`fixed left-0 top-0 h-full bg-gray-900/95 backdrop-blur-md text-white flex flex-col items-center py-6 z-50 shadow-2xl transition-all duration-500 ${isRunning ? "w-20 justify-center" : "w-20 justify-start"}`}>

        {!isRunning && (
          <div className="flex flex-col items-center w-full space-y-4">
            <button onClick={onHomeClick} className={`${buttonClass} ${inactiveClass}`} title="Inicio">
              <HomeIcon className="w-6 h-6" />
            </button>

            <div className="mb-4" title={`Racha: ${streak} días`}>
              <div className="p-2 rounded-full bg-orange-500/20 border border-orange-500/30">
                <FireIcon className="w-6 h-6 text-orange-400" />
              </div>
              <span className="text-xs text-orange-300">{streak}</span>
            </div>

            <button onClick={handleSettingsClick} className={`${buttonClass} ${isConfigOpen ? "bg-blue-600 ring-4 ring-blue-400/50" : inactiveClass}`} title="Configuración">
              <Cog6ToothIcon className="w-6 h-6" />
            </button>

            <button onClick={() => setVoiceEnabled(!voiceEnabled)} className={`${buttonClass} ${voiceEnabled ? "bg-green-600 ring-4 ring-green-400/50" : inactiveClass}`} title="Voz">
              {voiceEnabled ? <SpeakerWaveIcon className="w-6 h-6" /> : <SpeakerXMarkIcon className="w-6 h-6" />}
            </button>

            {/* Botón Texto */}
            <button
              onClick={() => setInputMode('text')}
              className={`${buttonClass} ${inputMode === 'text' ? 'bg-blue-600 ring-4 ring-blue-400/50' : inactiveClass}`}
              title="Escribir texto"
            >
              <PencilSquareIcon className="w-6 h-6" />
            </button>

            {/* Botón PDF Avanzado */}
            <PdfSidebarButton
              handlePdfUpload={handlePdfUpload}
              pdfPages={pdfPages}
              selectedPage={selectedPage}
              setSelectedPage={setSelectedPage}
              pdfName={pdfName}
              readingProgress={readingProgress}
              bookmarks={bookmarks}
              toggleBookmark={toggleBookmark}
              pageNotes={pageNotes}
              addPageNote={addPageNote}
              removePageNote={removePageNote}
              goToNextPage={goToNextPage}
              goToPreviousPage={goToPreviousPage}
              exportProgress={exportProgress}
            />

            <button onClick={() => setShowHistory(true)} className={`${buttonClass} ${inactiveClass}`} title="Historial">
              <BookOpenIcon className="w-6 h-6" />
            </button>

            <button onClick={() => goToView('warmup')} className={`${buttonClass} ${inactiveClass}`} title="Calentamiento">
              <EyeIcon className="w-6 h-6" />
            </button>

            <div className="w-10 h-px bg-gray-700 my-6"></div>
          </div>
        )}

        {/* Controles de reproducción */}
        <div className={`flex flex-col items-center space-y-4 ${isRunning ? "justify-center flex-1" : "mt-auto mb-8"}`}>
          {!isRunning && (
            <button
              onClick={handlePlayClick}
              disabled={!hasText || isCountingDown}
              className={`${buttonClass} ${!hasText || isCountingDown ? "bg-gray-800 opacity-50" : "bg-blue-600 hover:bg-blue-500"}`}
            >
              {canResume ? <ArrowPathIcon className="w-7 h-7" /> : <PlayIcon className="w-7 h-7 ml-1" />}
            </button>
          )}

          {isRunning && (
            <button onClick={pauseReading} className={`${buttonClass} bg-yellow-500 hover:bg-yellow-400`}>
              <PauseIcon className="w-8 h-8" />
            </button>
          )}

          {(isRunning || hasText) && (
            <button onClick={stopReading} className={`${buttonClass} bg-red-600 hover:bg-red-500`}>
              <StopIcon className="w-6 h-6" />
            </button>
          )}
        </div>
      </div>

      <ConfigMenu
        isOpen={isConfigOpen}
        onClose={() => setIsConfigOpen(false)}
        speed={speed}
        setSpeed={setSpeed}
        fontSize={fontSize}
        setFontSize={setFontSize}
        fontFamily={fontFamily}
        setFontFamily={setFontFamily}
        theme={theme}
        setTheme={setTheme}
        readingTechnique={readingTechnique}
        setReadingTechnique={setReadingTechnique}
        currentTheme={currentTheme}
        voices={voices}
        selectedVoice={selectedVoice}
        setSelectedVoice={setSelectedVoice}
      />
    </>
  );
};

export default SideBar;