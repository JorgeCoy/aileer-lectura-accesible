import React, { useState, useContext, useRef } from "react";
import ConfigMenu from "./ConfigMenu";
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
  DocumentArrowUpIcon
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
  setSelectedVoice
}) => {
  const [isConfigOpen, setIsConfigOpen] = useState(false);
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
      const pdf = await pdfjsLib.getDocument({
        data: arrayBuffer,
        disableFontFace: true,
      }).promise;
      const pages = [];

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map(item => item.str).join(" ");
        console.log(`📄 Extracted Page ${i}: ${pageText.length} chars, ${textContent.items.length} items`);
        pages.push(pageText);
      }

      const allText = pages.join("\n\n");
      handlePdfUpload(allText, pages, file);
    } catch (error) {
      console.error("Error loading PDF:", error);
      alert("Error al cargar el PDF. Por favor intenta con otro archivo.");
    }
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
  const activeClass = "bg-blue-600 text-white hover:bg-blue-500";
  const inactiveClass = "bg-gray-700 text-gray-300 hover:bg-gray-600";
  const disabledClass = "bg-gray-800 text-gray-600 cursor-not-allowed opacity-50";

  return (
    <>
      <div
        className={`fixed left-0 top-0 h-full bg-gray-900/95 backdrop-blur-md text-white flex flex-col items-center py-6 z-50 shadow-2xl transition-all duration-500 ease-in-out ${isRunning ? "w-20 justify-center" : "w-20 justify-start"
          }`}
      >
        {!isRunning && (
          <div className="flex flex-col items-center w-full">
            <button
              onClick={onHomeClick}
              className={`${buttonClass} ${inactiveClass}`}
              title="Ir al inicio"
              aria-label="Ir al inicio"
            >
              <HomeIcon className="w-6 h-6" />
            </button>

            <div className="mb-6 flex flex-col items-center group cursor-help" title={`Racha actual: ${streak} días`}>
              <div className="p-2 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30 shadow-[0_0_15px_rgba(249,115,22,0.3)] animate-pulse group-hover:scale-110 transition-transform">
                <FireIcon className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-bold text-orange-300 mt-1">{streak}</span>
            </div>

            <button
              onClick={handleSettingsClick}
              className={`${buttonClass} ${isConfigOpen ? activeClass : inactiveClass}`}
              title="Configuración"
              aria-label="Configuración"
            >
              <Cog6ToothIcon className="w-6 h-6" />
            </button>

            <button
              onClick={() => setVoiceEnabled(!voiceEnabled)}
              className={`${buttonClass} ${voiceEnabled ? "bg-green-600 hover:bg-green-500" : inactiveClass}`}
              title={voiceEnabled ? "Desactivar voz" : "Activar voz"}
              aria-label={voiceEnabled ? "Desactivar voz" : "Activar voz"}
            >
              {voiceEnabled ? <SpeakerWaveIcon className="w-6 h-6" /> : <SpeakerXMarkIcon className="w-6 h-6" />}
            </button>

            <button
              onClick={onUploadClick}
              className={`${buttonClass} ${inactiveClass}`}
              title="Subir PDF"
              aria-label="Subir archivo PDF"
            >
              <DocumentArrowUpIcon className="w-6 h-6" />
            </button>
            <input
              type="file"
              accept=".pdf"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              aria-hidden="true"
            />

            <button
              onClick={() => setShowHistory(true)}
              className={`${buttonClass} ${inactiveClass}`}
              title="Historial"
              aria-label="Historial"
            >
              <BookOpenIcon className="w-6 h-6" />
            </button>

            <button
              onClick={() => goToView('warmup')}
              className={`${buttonClass} ${inactiveClass}`}
              title="Ejercicios de Calentamiento"
              aria-label="Ejercicios de Calentamiento"
            >
              <EyeIcon className="w-6 h-6" />
            </button>

            <div className="w-10 h-px bg-gray-700 my-4"></div>
          </div>
        )}

        <div className={`flex flex-col items-center w-full ${isRunning ? "justify-center h-full" : "mt-auto mb-auto"}`}>
          {!isRunning && (
            <button
              onClick={handlePlayClick}
              disabled={!hasText || isCountingDown}
              className={`${buttonClass} ${!hasText || isCountingDown ? disabledClass : "bg-blue-600 hover:bg-blue-500 text-white"
                }`}
              title={canResume ? "Reanudar lectura" : "Iniciar lectura"}
              aria-label={canResume ? "Reanudar lectura" : "Iniciar lectura"}
            >
              {canResume ? <ArrowPathIcon className="w-7 h-7" /> : <PlayIcon className="w-7 h-7 ml-1" />}
            </button>
          )}

          {isRunning && (
            <button
              onClick={pauseReading}
              disabled={isCountingDown}
              className={`${buttonClass} bg-yellow-500 hover:bg-yellow-400 text-white`}
              title="Pausar"
              aria-label="Pausar"
            >
              <PauseIcon className="w-8 h-8" />
            </button>
          )}

          {(isRunning || hasText) && (
            <button
              onClick={stopReading}
              disabled={isCountingDown}
              className={`${buttonClass} ${isCountingDown ? disabledClass : "bg-red-600 hover:bg-red-500 text-white"}`}
              title="Detener"
              aria-label="Detener"
            >
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