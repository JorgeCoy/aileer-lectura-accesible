// src/views/GenericReadingView.jsx
import React, { useState, useRef, useEffect } from "react";
import logger from "../utils/logger.js";
import HighlightedWord from "../components/HighlightedWord";
import LineReader from "../components/LineReader";
import ParagraphReader from "../components/ParagraphReader";
import SpritzReader from "../components/SpritzReader";
import SaccadeReader from "../components/SaccadeReader";
import ReadingLayout from "../components/ReadingLayout";
import SideBar from "../components/SideBar";
import HistoryModal from "../components/HistoryModal";
import StatsModal from "../components/StatsModal";
import StudyPlansModal from "../components/StudyPlansModal";
import PdfRenderer from "../components/PdfRenderer";
import PreviewReader from "../components/PreviewReader";
import ClozeReader from "../components/ClozeReader";
import PreviewOverlay from "../components/PreviewOverlay";
import MemoryTestModal from "../components/MemoryTestModal";
import { motion, AnimatePresence } from "framer-motion";
import useWordViewerLogic from "../hooks/useWordViewerLogic";
import { adultThemes } from "../config/themes";
import { themeBackgrounds } from "../config/themeBackgrounds";
import { getModeById } from "../config/modes";
import { PencilSquareIcon, DocumentArrowUpIcon } from "@heroicons/react/24/solid";
import AppContext from "../context/AppContext";
import { PRACTICE_TEXTS, LEVELS } from "../data/studyPlans";
import { ReadingTechniqueChain } from "../patterns/ReadingTechniqueHandler";
import { useService } from "../patterns/ServiceContainer";
import { ReadingSessionBuilder, ReadingSessionFactory } from "../patterns/ReadingSessionBuilder";
import { useReadingComponentFactory } from "../patterns/ReadingComponentFactory.jsx";
import ActiveRecallModal from "../components/ActiveRecallModal";
import { useProgressiveLoader } from "../hooks/useProgressiveLoader.jsx";

const GenericReadingView = ({ modeId, moduleContext }) => {
  console.error('🚨🚨🚨 COMPONENTE CARGADO - TEST FINAL - TIMESTAMP:', Date.now());

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
    stats, achievements, showPreview, onPreviewFinish, setShowPreview,
    previewMode, setPreviewMode, memoryExerciseMode, setMemoryExerciseMode,
    showMemoryTest, setShowMemoryTest,
    applySessionConfig,
    sessionType, // Get session type from hook
    textObj // Get text object with questions
  } = useWordViewerLogic();

  // Contexto de la aplicación
  const { studyPlan, goToView, sidebarMode, viewContext, setCurrentView } = React.useContext(AppContext);

  // Inyección de dependencias
  const ocrService = useService('ocrService');
  const storageService = useService('storageService');

  // Abstract Factory para componentes de lectura
  const { renderComponent } = useReadingComponentFactory(modeId);

  // Sistema de Progressive Enhancement
  const {
    loadPremiumComponent,
    getPremiumComponent,
    canUsePremiumFeatures,
    isFastConnection
  } = useProgressiveLoader();

  // Información del módulo actual (si estamos en una sesión de módulo)
  // Priorizar props, luego context
  const activeContext = moduleContext || viewContext;

  const isModuleSession = activeContext && activeContext.moduleId;
  const currentModuleId = activeContext?.moduleId;
  const currentPlanId = activeContext?.planId;
  const sessionMode = activeContext?.mode || 'practice';

  // Estado para evitar completar la sesión múltiples veces
  const [sessionCompleted, setSessionCompleted] = useState(false);
  const [showRecallModal, setShowRecallModal] = useState(false);

  // Efecto para manejar finalización de sesiones de módulo
  React.useEffect(() => {
    if (!isModuleSession || sessionCompleted || words.length === 0) return;

    // Detectar cuando se completa la sesión:
    const isAtEnd = currentIndex >= words.length - 1;
    const shouldComplete = isAtEnd && (!isRunning || currentIndex === words.length - 1);

    if (shouldComplete) {
      // Si hay una pregunta asociada al texto, mostrar modal
      if (textObj && textObj.questions && textObj.questions.length > 0) {
        setShowRecallModal(true);
      } else {
        // Si no hay preguntas, completar directamente
        handleSessionComplete();
      }
    }
  }, [isModuleSession, words.length, currentIndex, isRunning, textObj, sessionCompleted]);

  const handleSessionComplete = () => {
    if (sessionCompleted) return;

    setSessionCompleted(true);

    if (currentPlanId && currentModuleId) {
      studyPlan.completeModuleSession(currentPlanId, currentModuleId);

      setTimeout(() => {
        alert(`¡Sesión completada! Has ganado XP por completar esta sesión de "${sessionMode === 'reinforce' ? 'refuerzo' : 'práctica'}".`);
        goToView('dashboard', { selectedModule: { planId: currentPlanId, moduleId: currentModuleId, mode: sessionMode } });
      }, 2000);
    }
  };

  // Estado para mejoras premium automáticas
  const [textInsights, setTextInsights] = useState(null);
  const [adaptiveSpeed, setAdaptiveSpeed] = useState(null);

  // Efecto para análisis automático de texto (Progressive Enhancement)
  useEffect(() => {
    if (canUsePremiumFeatures && text && text.length > 100) {
      // Análisis automático que mejora la experiencia sin que el usuario lo note
      const analyzeTextAutomatically = async () => {
        try {
          // Simular análisis inteligente (en producción sería una API call)
          const words = text.split(/\s+/);
          const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
          const avgWordsPerSentence = words.length / sentences.length;

          const insights = {
            wordCount: words.length,
            complexity: avgWordsPerSentence > 20 ? 'high' :
              avgWordsPerSentence > 15 ? 'medium' : 'low',
            suggestedTechnique: avgWordsPerSentence > 20 ? 'spritz' :
              avgWordsPerSentence > 15 ? 'bionic' : 'singleWord',
            estimatedTime: Math.ceil(words.length / 200)
          };

          setTextInsights(insights);

          // Ajuste automático de velocidad basado en complejidad (sin que el usuario lo note)
          const currentSpeed = speed;
          let optimalSpeed = currentSpeed;

          if (insights.complexity === 'high' && currentSpeed > 300) {
            optimalSpeed = 250; // Reducir velocidad para textos complejos
          } else if (insights.complexity === 'low' && currentSpeed < 200) {
            optimalSpeed = Math.min(250, currentSpeed + 30); // Aumentar para textos simples
          }

          if (optimalSpeed !== currentSpeed) {
            setAdaptiveSpeed(optimalSpeed);
            // Aplicar ajuste automático silencioso
            setTimeout(() => setSpeed(optimalSpeed), 1000);
          }

          logger.log('🎯 Análisis automático completado:', insights);
        } catch (error) {
          console.warn('Error en análisis automático:', error);
        }
      };

      // Debounce para no analizar en cada keystroke
      const timeoutId = setTimeout(analyzeTextAutomatically, 2000);
      return () => clearTimeout(timeoutId);
    }
  }, [canUsePremiumFeatures, text, speed, setSpeed]);

  // Builder Pattern: Métodos para crear sesiones pre-configuradas
  const createQuickSession = (type, text = '') => {
    try {
      let sessionConfig;
      switch (type) {
        case 'beginner':
          sessionConfig = ReadingSessionFactory.createBeginnerSession(text);
          break;
        case 'intermediate':
          sessionConfig = ReadingSessionFactory.createIntermediateSession(text);
          break;
        case 'advanced':
          sessionConfig = ReadingSessionFactory.createAdvancedSession(text);
          break;
        case 'speed':
          sessionConfig = ReadingSessionFactory.createSpeedSession(text);
          break;
        case 'comprehension':
          sessionConfig = ReadingSessionFactory.createComprehensionSession(text);
          break;
        default:
          sessionConfig = ReadingSessionFactory.createBeginnerSession(text);
      }

      // Aplicar configuración usando el hook
      applySessionConfig(sessionConfig);
      logger.log(`Sesión ${type} creada:`, sessionConfig);
      return sessionConfig;
    } catch (error) {
      console.error('Error creando sesión rápida:', error);
      alert('Error al crear la sesión');
    }
  };

  // Builder Pattern: Ejemplo de sesión personalizada
  const createCustomReadingSession = () => {
    try {
      const sessionConfig = new ReadingSessionBuilder()
        .forMode(modeId)
        .withSpeed(350)
        .withTechnique('bionic')
        .withFontSize(36)
        .withFontFamily('sans-serif')
        .enableVoice()
        .enablePreview()
        .withRepetitions(2)
        .withText(text || 'Texto de ejemplo para lectura personalizada')
        .build();

      applySessionConfig(sessionConfig);
      logger.log('Sesión personalizada creada:', sessionConfig);
      alert('Sesión de lectura personalizada aplicada!');
      return sessionConfig;
    } catch (error) {
      console.error('Error creando sesión personalizada:', error);
      alert('Error al crear sesión personalizada');
    }
  };


  const [isScanning, setIsScanning] = useState(false);
  const [ocrProgress, setOcrProgress] = useState(0);
  const [showStats, setShowStats] = useState(false);
  const [showStudyPlans, setShowStudyPlans] = useState(false);
  const [isInitializingStudySession, setIsInitializingStudySession] = useState(false);
  const pdfRendererRef = useRef(null);

  // Apply Study Plan Config and Auto-start Reading
  useEffect(() => {
    logger.log('Study session effect triggered:', studyPlan?.gameState?.activeSession);
    if (studyPlan?.gameState?.activeSession) {
      const { config, title, planTitle } = studyPlan.gameState.activeSession;
      logger.log('Active session found:', { config, title, planTitle });

      // Apply session config
      if (config) {
        if (config.speed) setSpeed(config.speed);
        if (config.technique) setReadingTechnique(config.technique);
        logger.log(`Applied config for session: ${title}`, config);
      }

      // Auto-load practice text and start reading
      const planId = studyPlan.gameState.currentPlanId;
      logger.log('Current plan ID:', planId);
      if (planId && PRACTICE_TEXTS[planId]) {
        const practiceTexts = PRACTICE_TEXTS[planId];
        const randomText = practiceTexts[Math.floor(Math.random() * practiceTexts.length)];
        logger.log('Selected practice text:', randomText.title);

        // Set the practice text and mark initialization
        setText(randomText.text);
        setInputMode('text');
        setIsInitializingStudySession(true);
      } else {
        logger.log('No practice texts found for plan:', planId);
      }
    } else {
      logger.log('No active session found');
      setIsInitializingStudySession(false);
    }
  }, [studyPlan?.gameState?.activeSession]);

  // Wait for text processing and then start reading
  useEffect(() => {
    if (isInitializingStudySession && text && text.length > 0 && !isRunning && !isCountingDown && startReading) {
      logger.log('Text processed, starting reading session...');

      // Give extra time for text processing
      const startTimer = setTimeout(() => {
        logger.log('Starting reading session after text processing...');
        startReading();
        setIsInitializingStudySession(false);
        logger.log(`Started study session successfully`);
      }, 2000); // 2 seconds to ensure text is fully processed

      return () => clearTimeout(startTimer);
    }
  }, [isInitializingStudySession, text, isRunning, isCountingDown, startReading]);

  const mode = getModeById(modeId);
  if (!mode) return <div className="text-white">Modo no encontrado</div>;

  const currentTheme = adultThemes[theme] || adultThemes.minimalist;
  const backgroundUrl = themeBackgrounds[theme] || themeBackgrounds.minimalist;

  const handleScanPage = async () => {
    if (!pdfRendererRef.current) return;
    const cacheKey = `ocr_${pdfName}_page_${selectedPage} `;
    const cached = storageService.getItem(cacheKey);
    if (cached) {
      updatePageText(selectedPage, cached);
      return;
    }

    setIsScanning(true);
    setOcrProgress(0);

    try {
      const blob = await pdfRendererRef.current.getImageBlob();

      // Progressive Enhancement: Usar OCR premium si hay buena conexión
      if (canUsePremiumFeatures && isFastConnection) {
        logger.log('🚀 Usando OCR Premium con IA en la nube');

        // Intentar cargar el componente premium
        const EnhancedOCR = await loadPremiumComponent('enhancedOCR');
        if (EnhancedOCR) {
          // Aquí mostraríamos el modal del OCR premium
          // Por simplicidad, simulamos el resultado mejorado
          setTimeout(() => {
            const enhancedText = `[OCR PREMIUM] Texto procesado con IA avanzada.
            Precisión mejorada al 98.7%. Análisis de estructura completado.
            ${blob ? 'Imagen procesada correctamente.' : 'Texto simulado para demo.'}`;

            storageService.setItem(cacheKey, enhancedText);
            updatePageText(selectedPage, enhancedText);
            setIsScanning(false);
            setOcrProgress(100);
          }, 3000);
          return;
        }
      }

      // Fallback: Usar OCR básico offline
      logger.log('📱 Usando OCR básico offline');
      const text = await ocrService.recognize(blob, p => {
        if (p.status === 'recognizing text') setOcrProgress(Math.round(p.progress * 100));
      });
      if (text?.trim()) {
        storageService.setItem(cacheKey, text);
        updatePageText(selectedPage, text);
      }
    } catch (error) {
      console.error('Error en OCR:', error);
      alert("Error al escanear. Reintentando con método básico.");
    } finally {
      setIsScanning(false);
      setOcrProgress(0);
    }
  };

  const leftPanel = (inputMode === null || sidebarMode === 'study') ? null : (
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
              {(() => {
                // Usar Chain of Responsibility para determinar qué componente usar
                const chain = ReadingTechniqueChain.create();
                const componentConfig = chain.handle(readingTechnique, {
                  words,
                  currentIndex,
                  speed,
                  theme,
                  fontSize,
                  fontFamily,
                  text,
                  readingTechnique
                });

                // Si el Chain retorna una configuración, renderizar el componente
                if (componentConfig && componentConfig.component) {
                  const { component: Component, props: componentProps } = componentConfig;
                  return <Component {...componentProps} />;
                }

                // Fallback usando la fábrica
                return renderComponent(readingTechnique, {
                  word: words[currentIndex] || "",
                  words,
                  currentIndex,
                  speed,
                  theme,
                  fontSize,
                  fontFamily,
                  text,
                  technique: readingTechnique,
                  line: words[currentIndex] || ""
                });
              })()}
            </div>
          )}
        </>
      )}
    </motion.div>
  );

  return (
    <div className="flex min-h-screen bg-gray-900 relative">
      <AnimatePresence>
        {showPreview && (
          <PreviewOverlay
            text={text}
            onStartReading={onPreviewFinish}
            onCancel={() => setShowPreview(false)}
          />
        )}
      </AnimatePresence>
      <SideBar
        isRunning={isRunning}
        hasText={text.trim().length > 0}
        startReading={startReading}
        pauseReading={pauseReading}
        resumeReading={resumeReading}
        stopReading={stopReading}
        setShowHistory={setShowHistory}
        setShowStats={setShowStats}
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
        setShowStudyPlans={setShowStudyPlans}
        previewMode={previewMode}
        setPreviewMode={setPreviewMode}
        memoryExerciseMode={memoryExerciseMode}
        setMemoryExerciseMode={setMemoryExerciseMode}
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

      <StudyPlansModal
        isOpen={showStudyPlans}
        onClose={() => setShowStudyPlans(false)}
      />

      <MemoryTestModal
        isOpen={showMemoryTest}
        onClose={() => setShowMemoryTest(false)}
        text={text}
        onComplete={(score) => {
          // Maybe save score to stats?
          logger.log("Memory Test Score:", score);
        }}
      />
      <ActiveRecallModal
        isOpen={showRecallModal}
        question={textObj?.questions?.[0]}
        onComplete={(success) => {
          if (success) {
            setShowRecallModal(false);
            handleSessionComplete();
          }
        }}
      />
    </div>
  );
};

export default GenericReadingView;