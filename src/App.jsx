import React from 'react';
import AppContext from './context/AppContext';
import ThemeProvider from './context/ThemeProvider'; // ✅ Importa el nuevo proveedor genérico
import StartScreen from './views/StartScreen';
import AdultView from './views/AdultView';
import TeacherView from './views/TeacherView';
import KidView from './views/KidView';
import BabyView from './views/BabyView';
import KidTdahView from './views/KidTdahView';

const AppContent = () => {
  const { currentView, setCurrentView } = React.useContext(AppContext);

  // Función para renderizar vistas con su proveedor correspondiente
  const renderView = () => {
    switch (currentView) {
      case 'adult':
        return (
          <ThemeProvider viewName="adult"> {/* ✅ Usar ThemeProvider con viewName */}
            <AdultView />
          </ThemeProvider>
        );
      case 'teacher':
        return (
          <ThemeProvider viewName="teacher"> {/* ✅ Usar ThemeProvider con viewName */}
            <TeacherView />
          </ThemeProvider>
        );
      case 'kid':
        return (
          <ThemeProvider viewName="kid"> {/* ✅ Usar ThemeProvider con viewName */}
            <KidView />
          </ThemeProvider>
        );
      case 'baby':
        return (
          <ThemeProvider viewName="baby"> {/* ✅ Usar ThemeProvider con viewName */}
            <BabyView />
          </ThemeProvider>
        );
      case 'ninos_tdah':
        return (
          <ThemeProvider viewName="ninos_tdah"> {/* ✅ Usar ThemeProvider con viewName */}
            <KidTdahView />
          </ThemeProvider>
        );
      case 'start':
      default:
        return <StartScreen />;
    }
  };

  return (
    <div className="min-h-screen">
      {/* ✅ Botón de volver al inicio → Eliminado */}
      {/* El icono 🏠 en la SideBar cumple esta función ahora */}

      {/* Renderizado condicional */}
      {renderView()}
    </div>
  );
};

const App = () => {
  return <AppContent />;
};

export default App;