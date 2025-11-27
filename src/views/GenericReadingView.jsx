// src/views/GenericReadingView.jsx
import React, { useState, useEffect, useRef, useContext } from "react";
import { motion } from "framer-motion";
import HighlightedWord from "../components/HighlightedWord";
import LineReader from "../components/LineReader";
import ParagraphReader from "../components/ParagraphReader";
import SpritzReader from "../components/SpritzReader";
import SaccadeReader from "../components/SaccadeReader";
import ReadingLayout from "../components/ReadingLayout";
import SideBar from "../components/SideBar";
import HistoryModal from "../components/HistoryModal";
import StatsModal from "../components/StatsModal";
import PdfRenderer from "../components/PdfRenderer";
import useWordViewerLogic from "../hooks/useWordViewerLogic";
import { adultThemes } from "../config/themes";
import { themeBackgrounds } from "../config/themeBackgrounds";
import { getModeById } from "../config/modes";
import { recognizePage } from "../utils/ocrService";
import { PencilSquareIcon, DocumentArrowUpIcon } from "@heroicons/react/24/solid";
import AppContext from "../context/AppContext";

const GenericReadingView = ({ modeId }) => {
  const {
    words, currentIndex, isRunning, speed, setSpeed, fontSize, setFontSize,
    fontFamily, setFontFamily, startReading, pauseReading, resumeReading, stopReading,
    text, setText, history, showHistory, setShowHistory, selectFromHistory,
    voiceEnabled, setVoiceEnabled, isCountingDown, countdownValue, theme, setTheme,
    readingTechnique, setReadingTechnique, pdfPages, selectedPage, setSelectedPage,
    pdfName, bookmarks, toggleBookmark, pageNotes, addPageNote, goToNextPage,
    goToPreviousPage, handlePdfUpload, pdfFile, updatePageText, voices,
    selectedVoice, setSelectedVoice, inputMode, setInputMode,
    removePageNote, exportProgress, readingProgress,
    stats, achievements, newAchievement, clearNewAchievement
  } = useWordViewerLogic();

  const { setCurrentView } = useContext(AppContext);

  const [isScanning, setIsScanning] = useState(false);
  const [ocrProgress, setOcrProgress] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(1.0);
  const [showStats, setShowStats] = useState(false);
  const pdfRendererRef = useRef(null);

  const mode = getModeById(modeId);
  if (!mode) return <div className="text-white">Modo no encontrado</div>;

  const currentTheme = adultThemes[theme] || adultThemes.minimalist;
  const backgroundUrl = themeBackgrounds[theme] || themeBackgrounds.minimalist;

  const handleScanPage = async () => {
    if (!pdfRendererRef.current) return;
    const cacheKey = `ocr_${pdfName}_page_${selectedPage}`;
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      updatePageText(selectedPage, cached);
      return;
    }

    setIsScanning(true);
    setOcrProgress(0);
    try {
      const blob = await pdfRendererRef.current.getImageBlob();
      const text = await recognizePage(blob, p => {
        if (p.status === 'recognizing text') setOcrProgress(Math.round(p.progress * 100));
      });
      if (text?.trim()) {
        localStorage.setItem(cacheKey, text);
        updatePageText(selectedPage, text);
      }
    } catch (e) {
      alert("Error al escanear");
    } finally {
      setIsScanning(false);
      setOcrProgress(0);
    }
  };

  const leftPanel = inputMode === null ? null : (
    <div className="w-full h-full flex items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-4xl h-full md:h-auto flex flex-col justify-center">
        {/* Modo Texto Manual */}
        {inputMode === 'text' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/10 backdrop-blur-xl rounded-3xl p-4 md:p-8 shadow-2xl border border-white/20 h-auto min-h-[50vh] md:min-h-96 flex flex-col"
          >
            <h2 className="text-xl md:text-2xl font-bold text-white mb-4 md:mb-6 text-center">Escribe tu texto</h2>
            <textarea
              className="w-full flex-1 bg-transparent text-white placeholder-gray-500 text-base md:text-lg resize-none focus:outline-none min-h-[300px]"
              placeholder="Escribe o pega aquí tu texto para leer..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              autoFocus
            />
          </motion.div>
        )}

        {/* Modo PDF */}
        {inputMode === 'pdf' && pdfFile && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/10 backdrop-blur-xl rounded-3xl p-4 md:p-6 shadow-2xl border border-white/20"
          >
            <h2 className="text-lg md:text-xl font-bold text-white mb-4 truncate">{pdfName || "PDF cargado"}</h2>

            <div className="relative bg-black/50 rounded-2xl overflow-hidden mb-4">
              <PdfRenderer
                ref={pdfRendererRef}
                file={pdfFile}
                pageNumber={selectedPage}
                zoom={zoomLevel}
              />
              {isScanning && (
                <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center z-10">
                  <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
                  <p className="text-blue-400 text-lg">Escaneando... {ocrProgress}%</p>
                </div>
              )}
            </div>

            <div className="flex justify-between items-center text-gray-300">
              <span className="text-xs md:text-sm">Página {selectedPage} de {pdfPages.length}</span>
              <div className="flex gap-3">
                <button
                  onClick={goToPreviousPage}
                  disabled={selectedPage <= 1}
                  className="p-2 md:p-3 bg-gray-800 rounded-xl hover:bg-gray-700 disabled:opacity-50 transition"
                >
                  ←
                </button>
                <button
                  onClick={goToNextPage}
                  disabled={selectedPage >= pdfPages.length}
                  className="p-2 md:p-3 bg-gray-800 rounded-xl hover:bg-gray-700 disabled:opacity-50 transition"
                >
                  →
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Si hay PDF pero no hay texto en la página */}
        {inputMode === 'pdf' && pdfFile && words.length === 0 && !isScanning && (
          <div className="text-center py-20">
            <p className="text-gray-400 text-xl mb-8">No se encontró texto en esta página</p>
            <button
              onClick={handleScanPage}
              className="px-8 py-4 bg-blue-600 hover:bg-blue-700 rounded-xl text-lg font-medium transition shadow-lg"
            >
              Escanear con OCR
            </button>
          </div>
        )}
      </div>
    </div>
  );

  const showRightPanel = inputMode !== null && (isRunning || (inputMode === 'pdf' && words.length > 0));

  const rightPanel = (!showRightPanel && !isCountingDown) ? null : (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6 }}
      className="w-full h-full flex flex-col justify-center items-center relative"
      style={{
        backgroundImage: backgroundUrl,
        backgroundSize: "cover",
        backgroundPosition: "center"
      }}
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
          {inputMode !== null && words.length === 0 && inputMode === 'pdf' && (
            <button onClick={handleScanPage} className="px-8 py-4 bg-blue-600 hover:bg-blue-700 rounded-xl text-xl">
              Escanear página con OCR
            </button>
          )}

          {inputMode !== null && (
            <div className="flex-1 flex items-center justify-center w-full">
              {readingTechnique === 'lineFocus' ? (
                <LineReader
                  line={words[currentIndex] || ""}
                  speed={speed}
                  multiplier={8} // Debe coincidir con el chunk size en useWordViewerLogic
                  theme={theme}
                  fontSize={fontSize}
                  fontFamily={fontFamily}
                />
              ) : readingTechnique === 'paragraphFocus' ? (
                <ParagraphReader
                  words={words}
                  currentIndex={currentIndex}
                  theme={theme}
                  fontSize={fontSize}
                  fontFamily={fontFamily}
                />
              ) : readingTechnique === 'spritz' ? (
                <SpritzReader
                  word={words[currentIndex] || ""}
                  theme={theme}
                  fontSize={fontSize}
                  fontFamily={fontFamily}
                />
              ) : readingTechnique === 'saccade' ? (
                <SaccadeReader
                  word={words[currentIndex] || ""}
                  theme={theme}
                  fontSize={fontSize}
                  fontFamily={fontFamily}
                />
              ) : (
                <HighlightedWord
                  word={words[currentIndex] || ""}
                  fontSize={fontSize}
                  fontFamily={fontFamily}
                  theme={theme}
                  technique={readingTechnique}
                />
              )}
            </div>
          )}
        </>
      )}
    </motion.div>
  );

  return (
    <div className="flex min-h-screen bg-gray-900">
      <SideBar
        isRunning={isRunning}
        hasText={text.trim().length > 0}
        startReading={startReading}
        pauseReading={pauseReading}
        resumeReading={resumeReading}
        stopReading={stopReading}
        setShowHistory={setShowHistory}
        onHomeClick={() => setCurrentView('start')}
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
        setShowStats={setShowStats}
      />

      <div className="w-full md:ml-20 transition-all duration-300">
        <ReadingLayout
          title="AILEER"
          subtitle={mode.subtitle}
          theme={currentTheme}
          leftPanel={leftPanel}
          rightPanel={rightPanel}
          isPlaying={isRunning || isCountingDown}
        />
      </div>

      <HistoryModal
        isOpen={showHistory}
        onClose={() => setShowHistory(false)}
        history={history}
        onSelect={selectFromHistory}
      />

      <StatsModal
        isOpen={showStats}
        onClose={() => setShowStats(false)}
        stats={stats}
        achievements={achievements}
      />
    </div>
  );
};

export default GenericReadingView;