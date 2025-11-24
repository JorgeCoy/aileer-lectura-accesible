import React, { useState, useEffect, useMemo, useRef } from "react";
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
  XMarkIcon,
  MagnifyingGlassIcon,
  MagnifyingGlassPlusIcon,
  MagnifyingGlassMinusIcon
} from "@heroicons/react/24/outline";
import { BookmarkIcon as BookmarkSolidIcon } from "@heroicons/react/24/solid";
import HighlightedWord from "../components/HighlightedWord";
import ReadingLayout from "../components/ReadingLayout";
import SideBar from "../components/SideBar";
import HistoryModal from "../components/HistoryModal";
import PdfRenderer from "../components/PdfRenderer";
import useWordViewerLogic from "../hooks/useWordViewerLogic";
import { adultThemes } from "../config/themes";
import { themeBackgrounds } from "../config/themeBackgrounds";
import { getModeById } from "../config/modes";
import { recognizePage } from "../utils/ocrService";

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
    pdfFile,
    updatePageText,
    voices,
    selectedVoice,
    setSelectedVoice
  } = useWordViewerLogic();

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [showNotes, setShowNotes] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [ocrProgress, setOcrProgress] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(1.0);
  const pdfRendererRef = useRef(null);

  // Debug logs
  useEffect(() => {
    console.log("GenericReadingView State:", {
      pdfFile,
      selectedPage,
      textLength: text?.length,
      wordsLength: words?.length,
      isRunning,
      theme,
      fontFamily,
      fontSize
    });
  }, [pdfFile, selectedPage, text, words, isRunning, theme, fontFamily, fontSize]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ignorar atajos si el usuario está escribiendo en un input o textarea
      if (e.target.tagName === 'TEXTAREA' || e.target.tagName === 'INPUT') {
        return;
      }

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
  };

  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 0.25, 3.0));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 0.25, 0.5));

  const handleScanPage = async () => {
    console.log("OCR: handleScanPage llamado");
    if (!pdfRendererRef.current) {
      console.error("OCR: pdfRendererRef.current es null");
      return;
    }

    // 1. Verificar Caché
    const cacheKey = `ocr_${pdfName}_page_${selectedPage}`;
    const cachedText = localStorage.getItem(cacheKey);

    if (cachedText) {
      console.log("OCR: Texto encontrado en caché");
      updatePageText(selectedPage, cachedText);
      return;
    }

    setIsScanning(true);
    setOcrProgress(0);

    try {
      console.log("OCR: Obteniendo imagen del PDF...");
      const imageBlob = await pdfRendererRef.current.getImageBlob();
      console.log("OCR: Blob obtenido:", imageBlob);

      if (imageBlob) {
        console.log("OCR: Llamando a recognizePage...");
        const extractedText = await recognizePage(imageBlob, (progress) => {
          if (progress.status === 'recognizing text') {
            setOcrProgress(Math.round(progress.progress * 100));
          }
        });
        console.log("OCR: Texto extraído:", extractedText?.substring(0, 50) + "...");

        if (extractedText && extractedText.trim().length > 0) {
          // 2. Guardar en Caché
          localStorage.setItem(cacheKey, extractedText);
          updatePageText(selectedPage, extractedText);
        } else {
          alert("No se pudo extraer texto de esta página.");
        }
      } else {
        console.error("OCR: No se pudo obtener el blob de la imagen");
      }
    } catch (error) {
      console.error("Error OCR:", error);
      alert("Error al escanear la página.");
    } finally {
      setIsScanning(false);
      setOcrProgress(0);
    }
  };

  const leftPanel = (
    <div className={`transition-all duration-300 h-full flex flex-col ${isPlaying ? 'hidden' : ''}`}>
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {pdfPages.length > 0 ? (
          <div className="space-y-4 flex flex-col h-full">
            <div className="flex items-center justify-between shrink-0">
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
            <div className="relative bg-gray-900 rounded-xl overflow-hidden shadow-lg border border-gray-700 flex-1 min-h-0 flex items-center justify-center">
              {pdfFile && selectedPage > 0 ? (
                <PdfRenderer
                  ref={pdfRendererRef}
                  file={pdfFile}
                  pageNumber={selectedPage}
                  zoom={zoomLevel}
                />
              ) : (
                <div className="text-center p-6">
                  <DocumentTextIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400 font-medium">Vista previa no disponible</p>
                  <p className="text-xs text-gray-500 mt-2">Sube el PDF nuevamente para ver las páginas.</p>
                </div>
              )}

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

            {/* Controles de Página y Zoom */}
            <div className="flex items-center justify-between bg-gray-900 p-3 rounded-xl border border-gray-700 shrink-0">
              <button
                onClick={goToPreviousPage}
                disabled={selectedPage <= 1 || isScanning}
                className="p-2 hover:bg-gray-800 rounded-lg disabled:opacity-50 transition-colors"
              >
                <ChevronLeftIcon className="w-6 h-6 text-white" />
              </button>

              <div className="flex gap-2 items-center">
                {/* Controles de Zoom */}
                <div className="flex items-center bg-gray-800 rounded-lg mr-2">
                  <button
                    onClick={handleZoomOut}
                    className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-l-lg transition-colors"
                    title="Reducir Zoom"
                  >
                    <MagnifyingGlassMinusIcon className="w-4 h-4" />
                  </button>
                  <span className="text-xs text-gray-300 w-12 text-center font-mono">
                    {Math.round(zoomLevel * 100)}%
                  </span>
                  <button
                    onClick={handleZoomIn}
                    className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-r-lg transition-colors"
                    title="Aumentar Zoom"
                  >
                    <MagnifyingGlassPlusIcon className="w-4 h-4" />
                  </button>
                </div>

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
                disabled={selectedPage >= pdfPages.length || isScanning}
                className="p-2 hover:bg-gray-800 rounded-lg disabled:opacity-50 transition-colors"
              >
                <ChevronRightIcon className="w-6 h-6 text-white" />
              </button>
            </div>

            {/* Texto extraído (Debug) */}
            <details className="mt-4 shrink-0">
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
            {pdfFile && words.length === 0 ? (
              <div className="flex flex-col items-center gap-4">
                <p className="text-gray-500 italic">No se encontró texto en esta página</p>
                <button
                  onClick={handleScanPage}
                  disabled={isScanning}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-md"
                >
                  {isScanning ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Escaneando... {ocrProgress > 0 && `${ocrProgress}%`}
                    </>
                  ) : (
                    <>
                      <MagnifyingGlassIcon className="w-5 h-5" />
                      Escanear texto (OCR)
                    </>
                  )}
                </button>
              </div>
            ) : (
              theme === "professional" || isRunning
                ? `Palabra ${currentIndex + 1}/${words.length}`
                : "Presiona iniciar para leer"
            )}
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
        voices={voices}
        selectedVoice={selectedVoice}
        setSelectedVoice={setSelectedVoice}
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