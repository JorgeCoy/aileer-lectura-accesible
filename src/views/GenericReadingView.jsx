import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  PlayIcon,
  PauseIcon,
  StopIcon,
  ArrowPathIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  DocumentTextIcon,
  BookmarkIcon as BookmarkOutlineIcon,
  PencilIcon,
  XMarkIcon
} from "@heroicons/react/24/outline";
import { BookmarkIcon as BookmarkSolidIcon } from "@heroicons/react/24/solid";
import HighlightedWord from "../components/HighlightedWord";
import ReadingLayout from "../components/ReadingLayout";
import SideBar from "../components/SideBar";
import HistoryModal from "../components/HistoryModal";
import PdfRenderer from "../components/PdfRenderer"; // ✅ Importar PdfRenderer
import useWordViewerLogic from "../hooks/useWordViewerLogic";
import { adultThemes } from "../config/themes";
import { themeBackgrounds } from "../config/themeBackgrounds"; // ✅ Ruta corregida
import { getModeById } from "../config/modes"; // ✅ Ruta corregida

const GenericReadingView = ({ modeId }) => {
  const {
    words,
    currentIndex,
    isRunning,
    speed,
    setSpeed,
    fontSize,
    setFontSize,
    fontFamily,
    setFontFamily,
    startReading,
    pauseReading,
    resumeReading,
    stopReading,
    text,
    setText,
    history,
    showHistory,
    setShowHistory,
    selectFromHistory,
    voiceEnabled,
    setVoiceEnabled,
    isCountingDown,
    countdownValue,
    theme,
    setTheme,
    readingTechnique,
    setReadingTechnique,
    isPlaying,

    // ✅ PDF Props
    pdfPages,
    selectedPage,
    setSelectedPage,
    pdfName,
    bookmarks,
    toggleBookmark,
    pageNotes,
    addPageNote,
    goToNextPage,
    goToPreviousPage,
    handlePdfUpload,
    pdfFile // ✅ Archivo PDF crudo
  } = useWordViewerLogic();

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [showNotes, setShowNotes] = useState(false); // Estado para mostrar notas

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Shortcuts de teclado
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === "Space") {
        e.preventDefault();
        if (isRunning) pauseReading();
        else if (currentIndex > 0) resumeReading();
        else startReading();
      } else if (e.code === "ArrowLeft") {
        goToPreviousPage();
      } else if (e.code === "ArrowRight") {
        goToNextPage();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isRunning, currentIndex, startReading, pauseReading, resumeReading, goToNextPage, goToPreviousPage]);

  // Gestos táctiles (Swipe)
  const swipeHandlers = useMemo(() => ({
    onSwipedLeft: () => goToNextPage(),
    onSwipedRight: () => goToPreviousPage(),
    onTap: () => {
      if (!isCountingDown) {
        if (isRunning) {
          pauseReading();
        } else {
          if (currentIndex >= words.length - 1) {
            startReading();
          } else {
            resumeReading();
          }
        }
      }
    },
    onEsc: () => setCurrentView('start'),
    onArrowUp: () => setSpeed(s => Math.min(s + 10, 1000)),
    onArrowDown: () => setSpeed(s => Math.max(s - 10, 50)),
  }), [isRunning, words, currentIndex, isCountingDown, startReading, pauseReading, resumeReading, goToNextPage, goToPreviousPage, setSpeed]);

  const mode = getModeById(modeId);

  if (!mode) {
    return <div>Modo no encontrado</div>;
  }

  const currentTheme = adultThemes[theme] || adultThemes.minimalist;
  const backgroundUrl = themeBackgrounds[theme] || themeBackgrounds.minimalist;

  const title = mode.label;
  const subtitle = mode.subtitle;

  const handleHomeClick = () => {
    // setCurrentView('start'); // Esto debería venir de props o contexto si se usa
  };

  // ✅ Definir el panel izquierdo (ahora con controles PDF)
  const leftPanel = (
    <div className={`transition-all duration-300 h-full flex flex-col ${isPlaying ? 'hidden' : ''}`}>
      <div className="flex-1 flex flex-col">
        {pdfPages.length > 0 ? (
          <div className="space-y-6">
            {/* Cabecera PDF */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <DocumentTextIcon className="w-6 h-6 text-purple-400" />
                {pdfName}
              </h3>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-400">
                  Página {selectedPage} de {pdfPages.length}
                </span>
              </div>
            </div>

            {/* Vista Previa del PDF (Canvas) */}
            <div className="relative bg-gray-900 rounded-xl overflow-hidden shadow-lg border border-gray-700 min-h-[400px] flex items-center justify-center">
              {pdfFile ? (
                <PdfRenderer file={pdfFile} pageNumber={selectedPage} />
              ) : (
                <div className="text-center p-6">
                  <DocumentTextIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400 font-medium">Vista previa no disponible</p>
                  <p className="text-xs text-gray-500 mt-2">Sube el PDF nuevamente para ver las páginas.</p>
                </div>
              )}

              {/* Overlay de Notas (Solo si está activado) */}
              {showNotes && (
                <div className="absolute inset-0 bg-gray-900/95 backdrop-blur-sm p-4 transition-all duration-300 z-20">
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-medium text-gray-300">
                      Notas de la página {selectedPage}
                    </label>
                    <button
                      onClick={() => setShowNotes(false)}
                      className="text-gray-400 hover:text-white"
                    >
                      <XMarkIcon className="w-5 h-5" />
                    </button>
                  </div>
                  <textarea
                    value={pageNotes[selectedPage] || ""}
                    onChange={(e) => addPageNote(selectedPage, e.target.value)}
                    placeholder="Escribe tus notas aquí..."
                    className="w-full h-[calc(100%-40px)] bg-gray-800 text-white p-3 rounded-lg resize-none focus:ring-2 focus:ring-purple-500 outline-none"
                  />
                </div>
              )}
            </div>

            {/* Controles de Página */}
            <div className="flex items-center justify-between bg-gray-900 p-3 rounded-xl border border-gray-700">
              <button
                onClick={goToPreviousPage}
                disabled={selectedPage <= 1}
                className="p-2 hover:bg-gray-800 rounded-lg disabled:opacity-50 transition-colors"
              >
                <ChevronLeftIcon className="w-6 h-6 text-white" />
              </button>

              <div className="flex gap-2">
                {/* Botón Toggle Notas (Solo visible si pausado o stop) */}
                {!isPlaying && (
                  <button
                    onClick={() => setShowNotes(!showNotes)}
                    className={`p-2 rounded-lg transition-colors ${showNotes ? 'bg-purple-600 text-white' : 'hover:bg-gray-800 text-gray-400'}`}
                    title="Ver/Editar Notas"
                  >
                    <PencilIcon className="w-5 h-5" />
                  </button>
                )}

                <button
                  onClick={() => toggleBookmark(selectedPage)}
                  className={`p-2 rounded-lg transition-colors ${bookmarks.some(b => b.pageNumber === selectedPage)
                    ? "text-yellow-400 hover:bg-gray-800"
                    : "text-gray-400 hover:bg-gray-800"
                    }`}
                  title="Marcar página"
                >
                  {bookmarks.some(b => b.pageNumber === selectedPage) ? (
                    <BookmarkSolidIcon className="w-5 h-5" />
                  ) : (
                    <BookmarkOutlineIcon className="w-5 h-5" />
                  )}
                </button>
              </div>

              <button
                onClick={goToNextPage}
                disabled={selectedPage >= pdfPages.length}
                className="p-2 hover:bg-gray-800 rounded-lg disabled:opacity-50 transition-colors"
              >
                <ChevronRightIcon className="w-6 h-6 text-white" />
              </button>
            </div>

            {/* Texto extraído (Oculto visualmente pero útil para debug si se necesita) */}
            <details className="mt-4">
              <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-300">Ver texto extraído (Debug)</summary>
              <p className="mt-2 text-sm text-gray-400 font-mono bg-gray-900 p-2 rounded max-h-40 overflow-y-auto">
                {text.substring(0, 500)}...
              </p>
            </details>

          </div>
        ) : (
          <textarea
            className="w-full flex-1 p-4 bg-gray-50 rounded-lg text-gray-900 resize-none font-sans border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            placeholder="Pega o escribe el texto aquí..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={isRunning}
            aria-label="Texto a leer"
            style={{ minHeight: "300px" }}
          />
        )}
      </div>
    </div>
  );

  // ✅ Definir el panel derecho
  const rightPanel = (
    <motion.div
      key={theme + countdownValue}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      style={{
        backgroundImage: `url(${backgroundUrl})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        width: "100%",
        height: "100%",
        minHeight: isMobile ? "50vh" : "500px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        borderRadius: "12px",
        padding: "2rem",
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
        overflow: "hidden",
      }}
      className="text-center relative"
    >
      {isCountingDown ? (
        <motion.div
          key={countdownValue}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 1.1, opacity: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="flex flex-col items-center justify-center p-12 rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl"
        >
          <span
            className="text-8xl md:text-9xl font-black leading-none bg-clip-text text-transparent bg-gradient-to-br from-white to-white/70"
            style={{
              filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.2))",
            }}
          >
            {countdownValue === 0 ? "¡YA!" : countdownValue}
          </span>
          <p className="mt-6 text-2xl md:text-3xl font-bold text-white/90 tracking-wide">
            {countdownValue === 0 ? "¡A LEER!" : "Prepárate..."}
          </p>
        </motion.div>
      ) : (
        <>
          <h2 className="text-xl font-semibold mb-4 opacity-70">
            {theme === "professional"
              ? `Palabra ${currentIndex + 1}/${words.length}`
              : isRunning
                ? `Palabra ${currentIndex + 1}/${words.length}`
                : words.length > 0
                  ? "Presiona iniciar para leer"
                  : pdfFile
                    ? "No se encontró texto en esta página (posiblemente sea una imagen)"
                    : "Leyendo..."}
          </h2>

          <div className="flex-1 flex items-center justify-center w-full">
            <HighlightedWord
              word={words[currentIndex] || ""}
              fontSize={fontSize}
              fontFamily={fontFamily}
              theme={theme}
            />
          </div>

          <p className="mt-4 text-gray-600 text-sm">
            {theme === "focus"
              ? "Modo lectura Zen"
              : theme === "cinematic"
                ? "Modo inmersivo cinematográfico"
                : theme === "professional"
                  ? "Modo profesional"
                  : theme === "vintage"
                    ? "Modo clásico"
                    : "Modo relajado"}
          </p>
        </>
      )}
    </motion.div>
  );

  return (
    <>
      <SideBar
        isRunning={isRunning}
        hasText={text.trim().length > 0}
        startReading={startReading}
        pauseReading={pauseReading}
        resumeReading={resumeReading}
        stopReading={stopReading}
        setShowHistory={setShowHistory}
        onHomeClick={handleHomeClick}
        voiceEnabled={voiceEnabled}
        setVoiceEnabled={setVoiceEnabled}
        speed={speed}
        setSpeed={setSpeed}
        fontSize={fontSize}
        setFontSize={setFontSize}
        fontFamily={fontFamily}
        setFontFamily={setFontFamily}
        isCountingDown={isCountingDown}
        currentIndex={currentIndex}
        totalWords={words.length}
        theme={theme}
        setTheme={setTheme}
        readingTechnique={readingTechnique}
        setReadingTechnique={setReadingTechnique}
        currentTheme={currentTheme}
        handlePdfUpload={handlePdfUpload}
      />

      <div className="ml-24 transition-all duration-300">
        <ReadingLayout
          title={title}
          subtitle={subtitle}
          theme={currentTheme}
          leftPanel={leftPanel}
          rightPanel={rightPanel}
          isPlaying={isPlaying}
        />
      </div>

      <HistoryModal
        showHistory={showHistory}
        setShowHistory={setShowHistory}
        history={history}
        selectFromHistory={selectFromHistory}
      />
    </>
  );
};

export default GenericReadingView;