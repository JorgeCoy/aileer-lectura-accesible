// src/views/GenericReadingView.jsx
import React, { useContext, useState } from "react";
import useWordViewerLogic from "../hooks/useWordViewerLogic";
import ReadingControls from "../components/ReadingControls";
import HighlightedWord from "../components/HighlightedWord";
import SpeedSlider from "../components/SpeedSlider";
import PdfUpload from "../components/PdfUpload";
import HistoryModal from "../components/HistoryModal";
import ThemeContext from "../context/ThemeContext";
import { adultThemes } from "../config/themes";
import ReadingLayout from "../components/ReadingLayout";
import { getModeById } from "../config/modes";
import { themeBackgrounds } from "../config/themeBackgrounds"; // ✅ Importar fondos
import { motion } from "framer-motion"; // ✅ Importar motions

const GenericReadingView = ({ modeId }) => {
  const { theme, setTheme } = useContext(ThemeContext);
  const [readingTechnique, setReadingTechnique] = useState("singleWord");



  // ✅ Llamar al hook antes de cualquier condición
  const {
    text,
    setText,
    words,
    currentIndex,
    isRunning,
    speed,
    setSpeed,
    voiceEnabled,
    setVoiceEnabled,
    startReading,
    pauseReading,
    resumeReading,
    stopReading,
    handlePdfUpload,  
    showHistory,
    setShowHistory,
    history,
    selectFromHistory,
    pdfPages,
    selectedPage,
    setSelectedPage,
  } = useWordViewerLogic(modeId);

  const mode = getModeById(modeId); // ✅ Obtener metadatos del modo
  
  if (!mode) {
    return <div>Modo no encontrado</div>; // ✅ Ahora está permitido
  }

  const currentTheme = adultThemes[theme] || adultThemes.minimalist;
  const backgroundUrl = themeBackgrounds[theme] || themeBackgrounds.minimalist; // ✅ Fondo según tema

  // ✅ Ahora usamos los metadatos del modo
  const title = mode.label;
  const subtitle = mode.subtitle;

  // ✅ Definir el panel izquierdo
  const leftPanel = (
    <>
      <div className="mb-4">
        <textarea
          className="w-full p-3 bg-gray-100 rounded text-gray-900 resize-y min-h-[120px] font-sans"
          placeholder="Pega o escribe el texto aquí..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={isRunning}
        />
      </div>

      {/* Solo mostrar PDF si el modo lo permite */}
      {mode.id !== "child" && (
        <PdfUpload
          handlePdfUpload={handlePdfUpload}
          pdfPages={pdfPages}
          selectedPage={selectedPage}
          setSelectedPage={setSelectedPage}
        />
      )}

      <ReadingControls
        isRunning={isRunning}
        hasText={text.trim().length > 0}
        start={startReading}
        pause={pauseReading}
        resume={resumeReading}
        stop={stopReading}
        setShowHistory={setShowHistory}
        theme={theme}
        speed={speed} // ✅ Pasar velocidad
        voiceEnabled={voiceEnabled} // ✅ Pasar estado de voz
        setVoiceEnabled={setVoiceEnabled} // ✅ Pasar función para cambiar estado
      />

      <SpeedSlider speed={speed} setSpeed={setSpeed} />
    </>
  );

  // ✅ Definir el panel derecho
  const rightPanel = (
  <motion.div // ✅ Solo este div, sin contenedor exterior
    key={theme}
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.5 }}
    style={{
      backgroundImage: `url(${backgroundUrl})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat",
      minHeight: "400px", // ✅ Mantener altura mínima
      width: "100%", // ✅ Ocupar todo el ancho
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      borderRadius: "12px",
      padding: "2rem", // ✅ Padding en el contenedor principal
      boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
      overflow: "hidden",
    }}
    className="text-center"
  >
    {/* Contenido */}
    {/* ✅ Ajustar el mensaje según el estado */}
    <h2 className="text-xl font-semibold mb-4 opacity-70">
      {theme === "professional"
        ? `Palabra ${currentIndex + 1}/${words.length}`
        : isRunning // ✅ Si está corriendo, mostrar el progreso
        ? `Palabra ${currentIndex + 1}/${words.length}`
        : words.length > 0 // ✅ Si hay palabras pero no está corriendo
        ? "Presiona iniciar para leer"
        : "Leyendo..."} {/* ✅ Si no hay palabras, mostrar el mensaje original */}
    </h2>

    <div className="min-h-[100px] flex items-center justify-center">
      <HighlightedWord word={words[currentIndex]} />
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
  </motion.div>
);

  // ✅ Definir los selectores como controlsPanel
  const controlsPanel = (
    <>
      <select
        value={theme}
        onChange={(e) => setTheme(e.target.value)}
        className={`px-4 py-2 rounded-lg ${currentTheme.card} border focus:ring-2 focus:ring-blue-400 transition`}
      >
        <option value="minimalist">🧼 Minimalista</option>
        <option value="cinematic">🎬 Cinemático</option>
        <option value="zen">🌿 Zen</option>
        <option value="professional">💻 Profesional</option>
        <option value="vintage">📜 Vintage</option>
        <option value="focus">🎯 Enfoque</option>
        <option value="gray">⚫ Gris elegante</option>
      </select>

      <select
        value={readingTechnique}
        onChange={(e) => setReadingTechnique(e.target.value)}
        className={`px-4 py-2 rounded-lg ${currentTheme.card} border focus:ring-2 focus:ring-green-400 transition`}
      >
        <option value="singleWord">🅰️ Una palabra</option>
        <option value="lineThreePoints">📖 Línea en tres puntos</option>
        <option value="paragraphFocus">🧠 Párrafo con foco</option>
      </select>
    </>
  );

  return (
    <>
      {/* ✅ Usar el layout genérico con los metadatos del modo */}
      <ReadingLayout
        title={title}
        subtitle={subtitle}
        theme={currentTheme}
        leftPanel={leftPanel}
        rightPanel={rightPanel}
        controlsPanel={controlsPanel}
      />

      {/* Modal del historial */}
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