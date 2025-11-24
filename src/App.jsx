// src/App.jsx
import React from 'react';
import AppContext from './context/AppContext';     // ← ¡ESTO FALTABA!
import ThemeProvider from './context/ThemeProvider';
import StartScreen from './views/StartScreen';
import AdultView from './views/AdultView';
import TeacherView from './views/TeacherView';
import KidView from './views/KidView';
import BabyView from './views/BabyView';
import KidTdahView from './views/KidTdahView';
import WarmUpView from './views/WarmUpView';

const AppContent = () => {
  const { currentView } = React.useContext(AppContext); // ← Ahora SÍ existe

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
      case 'start':
      default:
        return <StartScreen />;
    }
  };

  return (
    <div className="min-h-screen">
      {renderView()}
    </div>
  );
};

const App = () => {
  return <AppContent />;
};

export default App;