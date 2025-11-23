// src/context/AppProvider.jsx
import React, { useState, useEffect } from 'react';
import AppContext from './AppContext'; // Importamos el contexto

const AppProvider = ({ children }) => {
  const [currentView, setCurrentView] = useState('start');
  const [previousView, setPreviousView] = useState('start'); // 🔥 Nueva: rastrear vista anterior
  const [teacherTheme, setTeacherTheme] = useState(() => {
    return localStorage.getItem('teacherTheme') || 'minimal';
  });

  useEffect(() => {
    localStorage.setItem('teacherTheme', teacherTheme);
  }, [teacherTheme]);

  // 🔥 Wrapper para setCurrentView que guarda la vista anterior
  const navigateToView = (newView) => {
    setPreviousView(currentView); // Guardar vista actual antes de cambiar
    setCurrentView(newView);
  };

  return (
    <AppContext.Provider value={{
      currentView,
      setCurrentView: navigateToView, // Usar el wrapper
      previousView, // 🔥 Exponer previousView
      teacherTheme,
      setTeacherTheme
    }}>
      {children}
    </AppContext.Provider>
  );
};

export default AppProvider;