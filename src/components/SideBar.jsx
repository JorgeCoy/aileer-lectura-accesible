import React, { useState, useContext, useRef, useEffect } from "react";
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
  AcademicCapIcon,
  Bars3Icon,
  XMarkIcon,
  TrophyIcon,
  CheckCircleIcon,
  UserIcon,
  BriefcaseIcon
} from "@heroicons/react/24/solid";

const SideBar = ({
  isRunning,
  hasText,
  startReading,
  pauseReading,
  resumeReading,
  stopReading,
  setShowHistory,
  setShowStats,
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
  setShowStudyPlans,
  previewMode,
  setPreviewMode,
  memoryExerciseMode,
  setMemoryExerciseMode
}) => {
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isLandscape, setIsLandscape] = useState(false);
  const { goToView, streak, studyPlan, sidebarMode, setSidebarMode } = useContext(AppContext);
  const fileInputRef = useRef(null);

  // Detectar orientación del dispositivo
  useEffect(() => {
    const checkOrientation = () => {
      setIsLandscape(window.innerWidth > window.innerHeight);
    };

    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);

    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
    };
  }, []);

  const handleSettingsClick = () => {
    setIsConfigOpen(!isConfigOpen);
  };

  const handlePlayClick = () => {
    const canResume = currentIndex > 0 && currentIndex < totalWords - 1;
    if (canResume) {
      resumeReading();
    } else {
      startReading();
    }
    setIsMobileOpen(false);
  };

  const canResume = currentIndex > 0 && currentIndex < totalWords - 1;

  // ✅ Clases dinámicas para botones
  const buttonClass = `mb-2 rounded-xl transition-all duration-300 flex items-center shadow-md hover:shadow-lg hover:scale-105 ${isMobileOpen ? "w-full px-4 py-2 justify-start" : "p-3 justify-center"}`;
  const inactiveClass = "bg-gray-700 text-gray-300 hover:bg-gray-600";
  const activeModeClass = "bg-indigo-600 text-white ring-2 ring-indigo-400";

  // ✅ Helper para renderizar texto solo en móvil abierto
  const Label = ({ text }) => (
    isMobileOpen ? <span className="ml-3 font-medium text-sm md:hidden animate-fadeIn">{text}</span> : null
  );

  // Iconos principales siempre visibles
  const mainIcons = [
    {
      id: 'home',
      icon: HomeIcon,
      label: 'Inicio',
      onClick: onHomeClick,
      active: false
    },
    {
      id: 'practice',
      icon: BookOpenIcon,
      label: 'Práctica Personal',
      onClick: () => setSidebarMode(sidebarMode === 'practice' ? null : 'practice'),
      active: sidebarMode === 'practice'
    },
    {
      id: 'study',
      icon: AcademicCapIcon,
      label: 'Plan de Estudios',
      onClick: () => setSidebarMode(sidebarMode === 'study' ? null : 'study'),
      active: sidebarMode === 'study'
    }
  ];

  // Sub-iconos para modo práctica
  const practiceIcons = [
    {
      id: 'config',
      icon: Cog6ToothIcon,
      label: 'Configuración',
      onClick: handleSettingsClick,
      active: isConfigOpen
    },
    {
      id: 'voice',
      icon: voiceEnabled ? SpeakerWaveIcon : SpeakerXMarkIcon,
      label: voiceEnabled ? 'Voz Activada' : 'Voz Desactivada',
      onClick: () => setVoiceEnabled(!voiceEnabled),
      active: voiceEnabled
    },
    {
      id: 'text',
      icon: PencilSquareIcon,
      label: 'Escribir Texto',
      onClick: () => {
        setInputMode('text');
        setIsMobileOpen(false);
      },
      active: inputMode === 'text'
    },
    {
      id: 'pdf',
      component: <PdfSidebarButton
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
        isMobileOpen={isMobileOpen}
        Label={Label}
      />,
      isComponent: true
    },
    {
      id: 'stats',
      icon: TrophyIcon,
      label: 'Estadísticas',
      onClick: () => setShowStats(true),
      active: false
    },
    {
      id: 'history',
      icon: BookOpenIcon,
      label: 'Historial',
      onClick: () => setShowHistory(true),
      active: false
    },
    {
      id: 'warmup',
      icon: EyeIcon,
      label: 'Calentamiento',
      onClick: () => goToView('warmup'),
      active: false
    }
  ];

  // Sub-iconos para modo estudio
  const studyIcons = [
    {
      id: 'config',
      icon: Cog6ToothIcon,
      label: 'Configuración',
      onClick: handleSettingsClick,
      active: isConfigOpen,
      alwaysVisible: true
    },
    {
      id: 'progress',
      icon: TrophyIcon,
      label: 'Mi Progreso',
      onClick: () => goToView('dashboard'),
      active: false,
      alwaysVisible: true
    },
    {
      id: 'plans',
      icon: BriefcaseIcon,
      label: 'Ver Planes',
      onClick: () => setShowStudyPlans(true),
      active: false,
      alwaysVisible: true
    },
    {
      id: 'warmup',
      icon: EyeIcon,
      label: 'Calentamiento',
      onClick: () => goToView('warmup'),
      active: false,
      alwaysVisible: true
    },
    {
      id: 'voice',
      icon: voiceEnabled ? SpeakerWaveIcon : SpeakerXMarkIcon,
      label: voiceEnabled ? 'Voz Activada' : 'Voz Desactivada',
      onClick: () => setVoiceEnabled(!voiceEnabled),
      active: voiceEnabled,
      requiresSession: true
    }
  ].filter(icon => icon.alwaysVisible || (icon.requiresSession && studyPlan?.gameState?.activeSession));

  // Determinar qué iconos mostrar
  const getVisibleIcons = () => {
    if (sidebarMode === 'practice') {
      return practiceIcons;
    } else if (sidebarMode === 'study') {
      return studyIcons;
    }
    return [];
  };

  return (
    <>
      {/* Mobile Bubble Toggle */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className={`md:hidden fixed bottom-6 right-6 z-50 p-4 rounded-full shadow-2xl transition-all duration-300 ${isMobileOpen ? 'bg-red-500' : 'bg-blue-600 hover:scale-110'} ${isRunning ? 'opacity-30 hover:opacity-100' : ''}`}
      >
        {isMobileOpen ? (
          <XMarkIcon className="w-8 h-8 text-white" />
        ) : (
          <Bars3Icon className="w-8 h-8 text-white" />
        )}
      </button>

      {/* Sidebar Container */}
      <div className={`fixed left-0 top-0 h-full bg-gray-900/95 backdrop-blur-md text-white flex flex-col items-center z-40 shadow-2xl transition-all duration-300 ease-in-out overflow-y-auto scrollbar-hide
        ${isRunning ? "w-20 justify-center" : (isMobileOpen ? `w-64 ${isLandscape ? "px-2 py-2" : "px-4 py-4"}` : "w-20")}
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>

        {/* Iconos principales siempre visibles */}
        <div className={`flex flex-col items-center w-full ${isLandscape && isMobileOpen ? "space-y-1" : "space-y-2"}`}>
          {mainIcons.map((iconItem) => (
            <Tooltip key={iconItem.id} text={iconItem.label} placement={isMobileOpen ? "right" : "top"}>
              <button
                onClick={iconItem.onClick}
                className={`${buttonClass} ${iconItem.active ? "bg-blue-600 ring-4 ring-blue-400/50" : inactiveClass}`}
              >
                <iconItem.icon className="w-6 h-6 flex-shrink-0" />
                <Label text={iconItem.label} />
              </button>
            </Tooltip>
          ))}

          {/* Mostrar racha solo en modo estudio */}
          {sidebarMode === 'study' && (
            <Tooltip text={`Racha: ${streak} días`} placement={isMobileOpen ? "right" : "top"}>
              <div className={`mb-4 ${isMobileOpen ? "w-full flex items-center bg-gray-800 p-2 rounded-xl" : ""}`}>
                <div className="p-2 rounded-full bg-orange-500/20 border border-orange-500/30 flex-shrink-0">
                  <FireIcon className="w-6 h-6 text-orange-400" />
                </div>
                {isMobileOpen ? (
                  <span className="ml-3 text-orange-300 font-bold md:hidden">{streak} {streak === 1 ? 'día' : 'días'} en racha</span>
                ) : (
                  <span className="text-xs text-orange-300 flex justify-center mt-1">{streak}</span>
                )}
              </div>
            </Tooltip>
          )}

          {/* Separador */}
          {sidebarMode && (
            <div className={`h-px bg-gray-700 my-3 ${isMobileOpen ? "w-full" : "w-10"}`}></div>
          )}
        </div>

        {/* Iconos específicos del modo seleccionado */}
        {sidebarMode && (
          <div className={`flex flex-col items-center w-full ${isLandscape && isMobileOpen ? "space-y-1" : "space-y-2"}`}>

            {/* MODO PRÁCTICA PERSONAL */}

            {sidebarMode === 'practice' && (
              <>
                {/* Renderizar iconos de práctica */}
                {practiceIcons.map((iconItem) => {
                  if (iconItem.isComponent) {
                    return iconItem.component;
                  }

                  return (
                    <Tooltip key={iconItem.id} text={iconItem.label} placement={isMobileOpen ? "right" : "top"}>
                      <button
                        onClick={iconItem.onClick}
                        className={`${buttonClass} ${iconItem.active ? "bg-blue-600 ring-4 ring-blue-400/50" : inactiveClass}`}
                      >
                        <iconItem.icon className="w-6 h-6 flex-shrink-0" />
                        <Label text={iconItem.label} />
                      </button>
                    </Tooltip>
                  );
                })}
              </>
            )}

            {sidebarMode === 'study' && studyIcons.length > 0 && (
              <>
                {/* Renderizar iconos de estudio */}
                {studyIcons.map((iconItem) => (
                  <Tooltip key={iconItem.id} text={iconItem.label} placement={isMobileOpen ? "right" : "top"}>
                    <button
                      onClick={iconItem.onClick}
                      className={`${buttonClass} ${iconItem.active ? "bg-yellow-500 hover:bg-yellow-400" : "bg-red-600 hover:bg-red-500"}`}
                    >
                      <iconItem.icon className="w-6 h-6 flex-shrink-0" />
                      <Label text={iconItem.label} />
                    </button>
                  </Tooltip>
                ))}
              </>
            )}
          </div>
        )}

        {/* --- CONTROLES DE REPRODUCCIÓN (COMÚN) --- */}
        <div className={`${isRunning ? "justify-center flex-1" : `mt-auto w-full ${isLandscape && isMobileOpen ? "mb-4" : "mb-8"}`} ${isLandscape && isMobileOpen ? "flex flex-row items-center justify-center space-x-3 px-2" : "flex flex-col items-center space-y-4"}`}>
          {!isRunning && (
            <Tooltip text={canResume ? "Reanudar" : "Leer"} placement={isMobileOpen ? "right" : "top"}>
              <button
                onClick={handlePlayClick}
                disabled={!hasText || isCountingDown}
                className={`${buttonClass} ${!hasText || isCountingDown ? "bg-gray-800 opacity-50" : "bg-blue-600 hover:bg-blue-500"} ${isLandscape && isMobileOpen ? "px-3 py-2 min-w-0 flex-shrink-0" : ""}`}
              >
                {canResume ? <ArrowPathIcon className={`${isLandscape && isMobileOpen ? "w-6 h-6" : "w-6 h-6"} flex-shrink-0`} /> : <PlayIcon className={`${isLandscape && isMobileOpen ? "w-6 h-6" : "w-6 h-6 ml-1"} flex-shrink-0`} />}
                <Label text={canResume ? "Reanudar" : "Leer"} />
              </button>
            </Tooltip>
          )}

          {isRunning && (
            <Tooltip text="Pausar" placement={isMobileOpen ? "right" : "top"}>
              <button onClick={pauseReading} className={`${buttonClass} bg-yellow-500 hover:bg-yellow-400 ${isLandscape && isMobileOpen ? "px-3 py-2 min-w-0 flex-shrink-0" : ""}`}>
                <PauseIcon className={`${isLandscape && isMobileOpen ? "w-6 h-6" : "w-6 h-6"} flex-shrink-0`} />
              </button>
            </Tooltip>
          )}

          {(isRunning || hasText) && (
            <Tooltip text="Detener" placement={isMobileOpen ? "right" : "top"}>
              <button onClick={stopReading} className={`${buttonClass} bg-red-600 hover:bg-red-500 ${isLandscape && isMobileOpen ? "px-3 py-2 min-w-0 flex-shrink-0" : ""}`}>
                <StopIcon className={`${isLandscape && isMobileOpen ? "w-5 h-5" : "w-6 h-6"} flex-shrink-0`} />
                <Label text="Detener" />
              </button>
            </Tooltip>
          )}

          {/* Botón Completar Sesión (Solo en modo Estudio y si hay sesión activa) */}
          {sidebarMode === 'study' && studyPlan?.gameState?.activeSession && (
            <Tooltip text="Completar Sesión" placement={isMobileOpen ? "right" : "top"}>
              <button
                onClick={() => {
                  studyPlan.completeSession();
                  goToView('dashboard');
                }}
                className={`${buttonClass} bg-green-600 hover:bg-green-500 ${isLandscape && isMobileOpen ? "px-3 py-2 min-w-0 flex-shrink-0" : ""}`}
              >
                <CheckCircleIcon className={`${isLandscape && isMobileOpen ? "w-5 h-5" : "w-6 h-6"} flex-shrink-0`} />
                <Label text="Completar" />
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
        previewMode={previewMode}
        setPreviewMode={setPreviewMode}
        memoryExerciseMode={memoryExerciseMode}
        setMemoryExerciseMode={setMemoryExerciseMode}
      />
    </>
  );
};

export default SideBar;