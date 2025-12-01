// src/App.jsx
import React from 'react';
import logger from './utils/logger.js';
import AppContext from './context/AppContext';
import ThemeProvider from './context/ThemeProvider';
import StartScreen from './views/StartScreen';
import AdultView from './views/AdultView';
import TeacherView from './views/TeacherView';
import KidView from './views/KidView';
import BabyView from './views/BabyView';
import KidTdahView from './views/KidTdahView';
import WarmUpView from './views/WarmUpView';
import StudyDashboard from './views/StudyDashboard';
import ConnectionIndicator from './components/ConnectionIndicator';
import { useProgressiveEnhancement } from './hooks/useProgressiveEnhancement';

const AppContent = () => {
  const { currentView, viewContext } = React.useContext(AppContext);

  // Progressive Enhancement - carga mejoras automáticamente cuando hay internet
  const {
    enhancedFeatures,
    loadingStates,
    hasEnhancements,
    enhancementCount
  } = useProgressiveEnhancement();

  // Log de estado para debugging (solo en desarrollo)
  React.useEffect(() => {
    if (import.meta.env.DEV) {
      logger.log('🚀 Progressive Enhancement Status:', {
        features: enhancedFeatures,
        loading: loadingStates,
        totalEnhancements: enhancementCount
      });
    }
  }, [enhancedFeatures, loadingStates, enhancementCount]);

  const renderView = () => {
    switch (currentView) {
      case 'adult':
        return <ThemeProvider viewName="adult"><AdultView /></ThemeProvider>;
      case 'teacher':
        return <ThemeProvider viewName="teacher"><TeacherView /></ThemeProvider>;
      case 'kid':
        return <ThemeProvider viewName="kid"><KidView /></ThemeProvider>;
      case 'baby':
        return <ThemeProvider viewName="baby"><BabyView /></ThemeProvider>;
      case 'ninos_tdah':
        return <ThemeProvider viewName="ninos_tdah"><KidTdahView /></ThemeProvider>;
      case 'warmup':
        return <WarmUpView />;
      case 'dashboard':
        return <StudyDashboard />;
      case 'start':
      default:
        return <StartScreen />;
    }
  };

  return (
    <div className="min-h-screen">
      {renderView()}
      <ConnectionIndicator />

      {/* Indicador de funcionalidades mejoradas (solo en desarrollo) */}
      {import.meta.env.DEV && hasEnhancements && (
        <div className="fixed top-16 right-4 bg-green-100 border border-green-300 text-green-800 px-3 py-2 rounded-lg shadow-lg z-40 text-sm">
          <div className="flex items-center gap-1">
            <span>✨</span>
            <span>{enhancementCount} mejoras activas</span>
          </div>
        </div>
      )}
    </div>
  );
};

const App = () => {
  return <AppContent />;
};

export default App;