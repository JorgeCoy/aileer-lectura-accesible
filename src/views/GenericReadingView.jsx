// src/views/GenericReadingView.jsx
import React, { useContext, useState, useEffect } from "react";
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
import SettingsPanel from "../components/SettingsPanel"; // ✅ Importar el panel
import SideBar from "../components/SideBar"; // ✅ Importar la nueva barra lateral
import AppContext from "../context/AppContext"; // ✅ Importar AppContext
import { motion } from "framer-motion"; // ✅ Importar motions

const GenericReadingView = ({ modeId }) => {
  const { theme, setTheme } = useContext(ThemeContext);
  const { setCurrentView } = useContext(AppContext); // ✅ Acceder a setCurrentView
  const [readingTechnique, setReadingTechnique] = useState("singleWord");
  const [fontSize, setFontSize] = useState(32);
  const [fontFamily, setFontFamily] = useState("sans-serif");
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMobile, setIsMobile] = useState(false);



    // ✅ Detectar si es móvil
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);

    return () => {
      window.removeEventListener('resize', checkIsMobile);
    };
  }, []);

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

  // ✅ Cargar ajustes de usuario desde localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem(`userSettings-${modeId}`);
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      setFontSize(settings.fontSize || 32);
      setFontFamily(settings.fontFamily || "sans-serif");
    }
  }, [modeId]);

  // ✅ Guardar ajustes de usuario en localStorage
  useEffect(() => {
    const settings = {
      fontSize,
      fontFamily,
    };
    localStorage.setItem(`userSettings-${modeId}`, JSON.stringify(settings));
  }, [fontSize, fontFamily, modeId]);

  // ✅ Actualizar isPlaying cuando cambia isRunning
  useEffect(() => {
    setIsPlaying(isRunning);
  }, [isRunning]);


  const mode = getModeById(modeId); // ✅ Obtener metadatos del modo
  
  if (!mode) {
    return <div>Modo no encontrado</div>; // ✅ Ahora está permitido
  }

  const currentTheme = adultThemes[theme] || adultThemes.minimalist;
  const backgroundUrl = themeBackgrounds[theme] || themeBackgrounds.minimalist; // ✅ Fondo según tema

  // ✅ Ahora usamos los metadatos del modo
  const title = mode.label;
  const subtitle = mode.subtitle;

  // ✅ Funciones para los iconos de la barra lateral
  const handleHomeClick = () => {
    // Aquí puedes navegar al inicio o reiniciar la vista
      setCurrentView('start'); // ✅ Volver al menú de inicio
  };



  // ✅ Definir el panel izquierdo (ahora solo texto y PDF)
  const leftPanel = (
    <div className={`transition-all duration-300 ${isPlaying ? 'hidden' : ''}`}> {/* ✅ Ahora se oculta en todos los tamaños */}
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

      {/* Opcional: Mantener SpeedSlider si lo necesitas, pero ahora está en Configuración */}
      {/* <SpeedSlider speed={speed} setSpeed={setSpeed} /> */}
    </div>
  );

  // ✅ Definir el panel derecho
  const rightPanel = (
    <motion.div
      key={theme}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      style={{
        backgroundImage: `url(${backgroundUrl})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        minHeight: isMobile ? "50vh" : "400px", // ✅ Ajustar altura en móvil
        width: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        borderRadius: "12px",
        padding: "2rem",
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
        overflow: "hidden",
      }}
      className="text-center"
    >
      {/* Contenido */}
      <h2 className="text-xl font-semibold mb-4 opacity-70">
        {theme === "professional"
          ? `Palabra ${currentIndex + 1}/${words.length}`
          : isRunning
          ? `Palabra ${currentIndex + 1}/${words.length}`
          : words.length > 0
          ? "Presiona iniciar para leer"
          : "Leyendo..."}
      </h2>

      <div className="min-h-[100px] flex items-center justify-center">
        <HighlightedWord
          word={words[currentIndex] || ""}
          fontSize={fontSize}
          fontFamily={fontFamily}
          theme={theme} // ✅ Pasar el tema
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
      {/* ✅ Barra lateral con iconos */}
      <SideBar
        isRunning={isRunning}
        hasText={text.trim().length > 0}
        startReading={startReading}
        pauseReading={pauseReading}
        resumeReading={resumeReading}
        stopReading={stopReading}
        setShowHistory={setShowHistory}
        onHomeClick={handleHomeClick}
      voiceEnabled={voiceEnabled} // ✅ Pasar estado de voz
      setVoiceEnabled={setVoiceEnabled} // ✅ Pasar función para cambiar estado de voz   
      speed={speed} // ✅ Añadir esta línea     
      setSpeed={setSpeed}
        fontSize={fontSize}
        setFontSize={setFontSize}
        fontFamily={fontFamily}
        setFontFamily={setFontFamily}
      />

      {/* ✅ Layout principal (ajustado para dejar espacio a la barra lateral) */}
      <div className="ml-16"> {/* ✅ Margen izquierdo para la barra lateral */}
        <ReadingLayout
          title={title}
          subtitle={subtitle}
          theme={currentTheme}
          leftPanel={leftPanel}
          rightPanel={rightPanel}
          isPlaying={isPlaying} // ✅ Pasar estado para ajustar el layout
        />
      </div>


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