// src/context/AppProvider.jsx
import React, { useState, useEffect } from 'react';
import AppContext from './AppContext';
import useStreak from '../hooks/useStreak'; // ✅ Importar hook

const AppProvider = ({ children }) => {
  const [currentView, setCurrentView] = useState('start');
  const [previousView, setPreviousView] = useState(null); // 🔥 Inicializar en null
  const [teacherTheme, setTeacherTheme] = useState(() => {
    return localStorage.getItem('teacherTheme') || 'minimal';
  });
  const streak = useStreak(); // ✅ Obtener racha

  useEffect(() => {
    localStorage.setItem('teacherTheme', teacherTheme);
  }, [teacherTheme]);

  // ✅ Navegación con historial
  const goToView = (view) => {
    setPreviousView(currentView);
    setCurrentView(view);
  };

  const goBack = () => {
    if (previousView) {
      setCurrentView(previousView);
      setPreviousView(null);
    } else {
      setCurrentView('start');
    }
  };

  return (
    <AppContext.Provider value={{
      currentView,
      setCurrentView, // Exponer setter crudo por si acaso
      goToView,       // ✅ Función principal para navegar
      goBack,         // ✅ Función para volver
      previousView,
      teacherTheme,
      setTeacherTheme,
      streak,         // ✅ Exponer racha
    }}>
      {children}
    </AppContext.Provider>
  );
};

export default AppProvider;