// src/views/GenericReadingView.jsx
import React, { useState, useRef, useEffect } from "react";
import ReadingLayout from "../components/ReadingLayout";
import PreviewConfigPanel from "../components/PreviewConfigPanel";
import useWordViewerLogic from "../hooks/useWordViewerLogic";
import { adultThemes } from "../config/themes";
import { themeBackgrounds } from "../config/themeBackgrounds";
import { getModeById } from "../config/modes";
import AppContext from "../context/AppContext";
import { useReadingComponentFactory } from "../patterns/ReadingComponentFactory.jsx";
import { ReadingTechniqueChain } from "../patterns/ReadingTechniqueHandler";
import ReadingInfoBar from "../components/ReadingInfoBar";

import ContextReader from "../components/ContextReader";

const GenericReadingView = ({
  modeId,
  initialText,
  initialConfig,
  isPreviewMode = modeId === 'preview',
  bookTitle,
  isStudentView = false,
  headerInfo = null,
  onFinish = null,
  onConfigChange = null // New prop to notify parent of config changes
}) => {
  const {
    words, currentIndex, isRunning, speed, setSpeed, fontSize, setFontSize,
    fontFamily, setFontFamily, startReading, pauseReading, stopReading,
    text, setText, voiceEnabled, setVoiceEnabled, isCountingDown, countdownValue, theme, setTheme,
    readingTechnique, setReadingTechnique, inputMode, setInputMode
  } = useWordViewerLogic(modeId, { ...initialConfig, onFinish });

  const [isContextMode, setIsContextMode] = useState(false);

  // Propagate config changes to parent
  useEffect(() => {
    if (onConfigChange) {
      onConfigChange({
        speed,
        technique: readingTechnique,
        theme,
        fontSize,
        fontFamily,
        voiceEnabled
      });
    }
  }, [speed, readingTechnique, theme, fontSize, fontFamily, voiceEnabled, onConfigChange]);

  useEffect(() => {
    if (initialText) {
      setText(initialText);
      setInputMode('text');
    }
  }, [initialText, setText, setInputMode]);

  // Effect for global keydown to stop reading in preview mode
  useEffect(() => {
    if (isPreviewMode && isRunning && stopReading) {
      const handleKeyDown = (e) => {
        stopReading();
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isPreviewMode, isRunning, stopReading]);

  // Técnicas que NO soportan el Modo Contexto (Ghost Mode)
  const incompatibleTechniques = ['paragraphFocus', 'saccade', 'preview', 'cloze'];
  const supportsContextMode = !incompatibleTechniques.includes(readingTechnique);

  // Desactivar automáticamente el Modo Contexto si la técnica no lo soporta
  useEffect(() => {
    if (!supportsContextMode && isContextMode) {
      setIsContextMode(false);
    }
  }, [readingTechnique, supportsContextMode, isContextMode]);

  const { renderComponent } = useReadingComponentFactory(modeId);
  const currentTheme = adultThemes[theme] || adultThemes.minimalist;
  const backgroundUrl = themeBackgrounds[theme];

  // Memoized reading component to prevent flickering on technique changes
  const renderedReadingComponent = React.useMemo(() => {
    if (!inputMode) return null;

    try {
      const chain = ReadingTechniqueChain.create();
      const componentConfig = chain.handle(readingTechnique, {
        words, currentIndex, speed, theme, fontSize, fontFamily, text, readingTechnique
      });

      if (componentConfig && componentConfig.component) {
        const { component: Component, props: componentProps } = componentConfig;
        return <Component {...componentProps} />;
      }

      return renderComponent(readingTechnique, {
        word: words[currentIndex] || "",
        words, currentIndex, speed, theme, fontSize, fontFamily, text, technique: readingTechnique,
        line: words[currentIndex] || ""
      });
    } catch (error) {
      console.error("Error rendering reading component:", error);
      return <div className="text-red-500">Error al cargar la vista de lectura.</div>;
    }
  }, [inputMode, readingTechnique, speed, theme, fontSize, fontFamily, text, currentIndex, words]);

  const leftPanel = (
    <div className="text-white p-4 h-full flex flex-col">
      <h2 className="mb-2 font-bold text-lg">{bookTitle || "Title"}</h2>
      <textarea readOnly value={text} className="w-full flex-1 bg-transparent text-white border border-gray-700 rounded-lg p-2 resize-none focus:outline-none focus:ring-1 focus:ring-blue-500" />
    </div>
  );

  const rightPanel = (
    <div className="w-full h-full flex items-center justify-center text-white relative" style={{ backgroundImage: backgroundUrl }}>
      {inputMode !== null && (
        <div className="flex-1 flex items-center justify-center w-full h-full">
          {isContextMode && supportsContextMode ? (
            // MODO CONTEXTO (Ghost Mode)
            <div className="w-full h-full p-8">
              <ContextReader
                text={text}
                words={words}
                currentIndex={currentIndex}
                theme={theme}
                technique={readingTechnique}
                fontSize={fontSize}
                fontFamily={fontFamily}
                speed={speed}
              />
            </div>
          ) : (
            // MODO AISLADO (Standard) - Memoized component
            renderedReadingComponent
          )}
        </div>
      )}

      {/* Standardized Info Bar Overlay */}
      {isRunning && (
        <ReadingInfoBar
          technique={readingTechnique}
          speed={speed}
          currentIndex={currentIndex}
          totalWords={words.length}
          theme={theme}
        />
      )}
    </div>
  );

  const showSidebar = isPreviewMode || isStudentView;

  if (showSidebar) {
    return (
      <div className="h-full bg-gray-900 relative flex overflow-hidden">
        {/* Sidebar Simple */}
        {!isRunning && !isCountingDown && (
          <div className="w-72 h-full border-r border-gray-700 flex-shrink-0 overflow-hidden">
            <PreviewConfigPanel
              isRunning={isRunning}
              hasText={text && typeof text === 'string' && text.trim().length > 0}
              startReading={startReading}
              pauseReading={pauseReading}
              stopReading={stopReading}
              voiceEnabled={voiceEnabled}
              setVoiceEnabled={setVoiceEnabled}
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
              currentIndex={currentIndex}
              totalWords={words.length}
              isCountingDown={isCountingDown}
              isContextMode={isContextMode}
              onContextModeChange={setIsContextMode}
              supportsContextMode={supportsContextMode}
              isStudentView={isStudentView}
            />
          </div>
        )}

        {/* Reading Area */}
        <div className="flex-1 flex flex-col h-full overflow-hidden relative">
          <ReadingLayout
            title={headerInfo?.title || bookTitle || "Lectura"}
            subtitle={headerInfo?.subtitle || (isStudentView ? "Modo Estudiante" : "Vista Previa")}
            theme={currentTheme}
            leftPanel={leftPanel}
            rightPanel={rightPanel}
            isPlaying={isRunning || isCountingDown}
            previewMode={isPreviewMode}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full bg-gray-900 relative flex flex-col overflow-hidden">
      <ReadingLayout
        title={headerInfo?.title || bookTitle || "Lectura"}
        subtitle={headerInfo?.subtitle || "Modo Estudiante"}
        theme={currentTheme}
        leftPanel={leftPanel}
        rightPanel={rightPanel}
        isPlaying={isRunning || isCountingDown}
        previewMode={false}
      />
    </div>
  );
};

export default GenericReadingView;