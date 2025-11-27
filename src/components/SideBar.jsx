import React, { useState, useContext, useRef } from "react";
import ConfigMenu from "./ConfigMenu";
import PdfSidebarButton from "./PdfSidebarButton";
import Tooltip from "./Tooltip";
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
  PencilSquareIcon,
  TrophyIcon
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
  exportProgress,
  setShowStats
}) => {
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { setCurrentView, goToView, streak } = useContext(AppContext);
  const fileInputRef = useRef(null);

  const handleSettingsClick = () => {
    setIsConfigOpen(!isConfigOpen);
  };

  const onUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const pdfjsLib = await import("pdfjs-dist");
      pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const pages = [];

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map(item => item.str).join(" ");
        pages.push(pageText);
      }

      const allText = pages.join("\n\n");
      handlePdfUpload(allText, pages, file);
      setIsMobileOpen(false); // Close sidebar on mobile after upload
    } catch (error) {
      console.error("Error loading PDF:", error);
      alert("Error al cargar el PDF. Intenta con otro archivo.");
    }
  };

  const canResume = currentIndex > 0 && currentIndex < totalWords - 1;

  const handlePlayClick = () => {
    if (canResume) {
      resumeReading();
    } else {
      startReading();
    }
    setIsMobileOpen(false); // Close sidebar on mobile when reading starts
  };

  // ✅ Clases dinámicas para botones
  const buttonClass = `mb-3 rounded-xl transition-all duration-300 flex items-center shadow-md hover:shadow-lg hover:scale-105 ${isMobileOpen ? "w-full px-4 py-3 justify-start" : "p-3 justify-center"
    }`;

  const inactiveClass = "bg-gray-700 text-gray-300 hover:bg-gray-600";

  // ✅ Helper para renderizar texto solo en móvil abierto
  const Label = ({ text }) => (
    isMobileOpen ? <span className="ml-3 font-medium text-sm md:hidden animate-fadeIn">{text}</span> : null
  );

  return (
    <>
      {/* Mobile Bubble Toggle */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className={`md:hidden fixed bottom-6 right-6 z-50 p-4 rounded-full shadow-2xl transition-all duration-300 ${isMobileOpen ? 'bg-red-500 rotate-45' : 'bg-blue-600 hover:scale-110'} ${isRunning ? 'opacity-30 hover:opacity-100' : ''}`}
      >
        <Cog6ToothIcon className="w-8 h-8 text-white" />
      </button>

      {/* Sidebar Container */}
      <div className={`fixed left-0 top-0 h-full bg-gray-900/95 backdrop-blur-md text-white flex flex-col items-center py-6 z-40 shadow-2xl transition-all duration-300 ease-in-out
        ${isRunning ? "w-20 justify-center" : (isMobileOpen ? "w-64 px-4" : "w-20")}
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>

        {!isRunning && (
          <div className="flex flex-col items-center w-full space-y-2">
            <Tooltip text="Inicio">
              <button onClick={onHomeClick} className={`${buttonClass} ${inactiveClass}`}>
                <HomeIcon className="w-6 h-6 flex-shrink-0" />
                <Label text="Inicio" />
              </button>
            </Tooltip>
            <Tooltip text="Configuración">
              <button onClick={handleSettingsClick} className={`${buttonClass} ${isConfigOpen ? "bg-blue-600 ring-4 ring-blue-400/50" : inactiveClass}`}>
                <Cog6ToothIcon className="w-6 h-6 flex-shrink-0" />
                <Label text="Configuración" />
              </button>
            </Tooltip>

            <Tooltip text={voiceEnabled ? "Desactivar Voz" : "Activar Voz"}>
              <button onClick={() => setVoiceEnabled(!voiceEnabled)} className={`${buttonClass} ${voiceEnabled ? "bg-green-600 ring-4 ring-green-400/50" : inactiveClass}`}>
                {voiceEnabled ? <SpeakerWaveIcon className="w-6 h-6 flex-shrink-0" /> : <SpeakerXMarkIcon className="w-6 h-6 flex-shrink-0" />}
                <Label text={voiceEnabled ? "Voz Activada" : "Voz Desactivada"} />
              </button>
            </Tooltip>

            {/* Botón Texto */}
            <Tooltip text="Escribir Texto">
              <button
                onClick={() => {
                  setInputMode('text');
                  setIsMobileOpen(false);
                }}
                className={`${buttonClass} ${inputMode === 'text' ? 'bg-blue-600 ring-4 ring-blue-400/50' : inactiveClass}`}
              >
                <PencilSquareIcon className="w-6 h-6 flex-shrink-0" />
                <Label text="Escribir Texto" />
              </button>
            </Tooltip>

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
              isMobileOpen={isMobileOpen} // ✅ Pasar prop para adaptar botón PDF
              Label={Label} // ✅ Pasar componente Label
            />

            <Tooltip text="Estadísticas y Logros">
              <button onClick={() => setShowStats(true)} className={`${buttonClass} ${inactiveClass}`}>
                <TrophyIcon className="w-6 h-6 text-yellow-400 flex-shrink-0" />
                <Label text="Estadísticas" />
              </button>
            </Tooltip>

            <Tooltip text="Historial">
              <button onClick={() => setShowHistory(true)} className={`${buttonClass} ${inactiveClass}`}>
                <BookOpenIcon className="w-6 h-6 flex-shrink-0" />
                <Label text="Historial" />
              </button>
            </Tooltip>

            <Tooltip text="Calentamiento">
              <button onClick={() => goToView('warmup')} className={`${buttonClass} ${inactiveClass}`}>
                <EyeIcon className="w-6 h-6 flex-shrink-0" />
                <Label text="Calentamiento" />
              </button>
            </Tooltip>

            <div className={`h-px bg-gray-700 my-6 ${isMobileOpen ? "w-full" : "w-10"}`}></div>
          </div>
        )}

        {/* Controles de reproducción */}
        <div className={`flex flex-col items-center space-y-4 ${isRunning ? "justify-center flex-1" : "mt-auto mb-8 w-full"}`}>
          {!isRunning && (
            <Tooltip text={canResume ? "Reanudar" : "Leer"}>
              <button
                onClick={handlePlayClick}
                disabled={!hasText || isCountingDown}
                className={`${buttonClass} ${!hasText || isCountingDown ? "bg-gray-800 opacity-50" : "bg-blue-600 hover:bg-blue-500"}`}
              >
                {canResume ? <ArrowPathIcon className="w-7 h-7 flex-shrink-0" /> : <PlayIcon className="w-7 h-7 ml-1 flex-shrink-0" />}
                <Label text={canResume ? "Reanudar" : "Leer"} />
              </button>
            </Tooltip>
          )}

          {isRunning && (
            <Tooltip text="Pausar">
              <button onClick={pauseReading} className={`${buttonClass} bg-yellow-500 hover:bg-yellow-400`}>
                <PauseIcon className="w-8 h-8 flex-shrink-0" />
              </button>
            </Tooltip>
          )}

          {(isRunning || hasText) && (
            <Tooltip text="Detener">
              <button onClick={stopReading} className={`${buttonClass} bg-red-600 hover:bg-red-500`}>
                <StopIcon className="w-6 h-6 flex-shrink-0" />
                <Label text="Detener" />
              </button>
            </Tooltip>
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