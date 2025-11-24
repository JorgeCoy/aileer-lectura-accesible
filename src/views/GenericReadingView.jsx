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
    setSelectedVoice,
    inputMode,
    setInputMode
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
      fontSize,
      inputMode
    });
  }, [pdfFile, selectedPage, text, words, isRunning, theme, fontFamily, fontSize, inputMode]);

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
    onEsc: () => window.location.reload(), // Simple reload for now to go home
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
    window.location.reload();
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
    <div className={`
      w-full
      flex flex-col gap-4 transition-all duration-500 ease-in-out
      ${isRunning && !isMobile ? "opacity-0 -translate-x-full absolute pointer-events-none" : "opacity-100 translate-x-0 relative"}
    `}>
      <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 shadow-2xl border border-white/10 h-[calc(100vh-120px)] flex flex-col relative overflow-hidden group hover:border-white/20 transition-colors">

        {/* Header del Panel */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            {inputMode === 'pdf' ? (
              <>
                <DocumentTextIcon className="w-6 h-6 text-purple-400" />
                Visor PDF
              </>
            ) : inputMode === 'text' ? (
              <>
                <PencilIcon className="w-6 h-6 text-blue-400" />
                Entrada de Texto
              </>
            ) : (
              <>
                <DocumentTextIcon className="w-6 h-6 text-gray-400" />
                Selecciona una Fuente
              </>
            )}
          </h2>

          {inputMode === 'pdf' && (
            <div className="flex items-center gap-2">
              <button
                onClick={handleScanPage}
                disabled={isScanning}
                className={`p-2 rounded-lg transition-colors ${isScanning ? 'bg-gray-600 cursor-wait' : 'bg-blue-600 hover:bg-blue-500 text-white'}`}
                title="Escanear página actual con OCR"
              >
                {isScanning ? (
                  <ArrowPathIcon className="w-5 h-5 animate-spin" />
                ) : (
                  <MagnifyingGlassIcon className="w-5 h-5" />
                )}
              </button>
              <div className="flex items-center bg-gray-800 rounded-lg p-1">
                <button
                  onClick={() => setZoomLevel(z => Math.max(0.5, z - 0.1))}
                  className="p-1 hover:bg-gray-700 rounded text-gray-300"
                >
                  <MagnifyingGlassMinusIcon className="w-4 h-4" />
                </button>
                <span className="text-xs text-gray-400 w-12 text-center">{Math.round(zoomLevel * 100)}%</span>
                <button
                  onClick={() => setZoomLevel(z => Math.min(3.0, z + 0.1))}
                  className="p-1 hover:bg-gray-700 rounded text-gray-300"
                >
                  <MagnifyingGlassPlusIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Contenido del Panel */}
        <div className="flex-1 overflow-hidden relative rounded-xl bg-gray-900/50">
          {inputMode === 'pdf' ? (
            pdfFile ? (
              <PdfRenderer
                pdfFile={pdfFile}
                pageNumber={selectedPage}
                scale={zoomLevel}
                onPageChange={setSelectedPage}
                onTextExtracted={(text) => {
                  console.log("Texto extraído del PDF:", text.substring(0, 50) + "...");
                  setText(text);
                }}
                ref={pdfRendererRef}
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <DocumentTextIcon className="w-16 h-16 mb-4 opacity-50" />
                <p>No hay PDF cargado</p>
                <p className="text-sm mt-2">Sube un archivo desde el menú lateral</p>
              </div>
            )
          ) : inputMode === 'text' ? (
            <textarea
              className="w-full h-full bg-transparent text-white p-4 resize-none focus:outline-none font-mono text-lg leading-relaxed placeholder-gray-600"
              placeholder="Escribe o pega tu texto aquí para comenzar la lectura..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              spellCheck="false"
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 p-4 text-center">
              <div className="bg-gray-800/50 p-6 rounded-full mb-6">
                <DocumentTextIcon className="w-16 h-16 opacity-50" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">¿Qué quieres leer hoy?</h3>
              <p className="text-gray-400 mb-8">
                Selecciona una opción en la barra lateral izquierda para comenzar.
              </p>
              <div className="flex gap-4">
                <div className="flex flex-col items-center gap-2">
                  <div className="p-3 bg-blue-600/20 rounded-lg text-blue-400">
                    <PencilIcon className="w-6 h-6" />
                  </div>
                  <span className="text-xs">Escribir</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className="p-3 bg-purple-600/20 rounded-lg text-purple-400">
                    <DocumentTextIcon className="w-6 h-6" />
                  </div>
                  <span className="text-xs">PDF</span>
                </div>
              </div>
            </div>
          )}

          {/* Overlay de Carga OCR */}
          <AnimatePresence>
            {isScanning && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center z-50"
              >
                <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-blue-400 font-medium animate-pulse">Procesando texto con IA...</p>
                <p className="text-sm text-gray-500 mt-2">{ocrProgress}% completado</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer del Panel (Solo PDF) */}
        {inputMode === 'pdf' && pdfFile && (
          <div className="mt-4 flex justify-between items-center text-sm text-gray-400 border-t border-gray-700 pt-3">
            <div className="flex items-center gap-4">
              <span>Página {selectedPage} de {pdfPages.length || 1}</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={goToPreviousPage}
                disabled={selectedPage <= 1}
                className="p-2 hover:bg-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeftIcon className="w-5 h-5" />
              </button>
              <button
                onClick={goToNextPage}
                disabled={selectedPage >= (pdfPages.length || 1)}
                className="p-2 hover:bg-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRightIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
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
            {inputMode === 'pdf' && words.length === 0 ? (
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
        inputMode={inputMode}
        setInputMode={setInputMode}
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