// src/context/AppProvider.jsx
import React, { useState, useEffect } from 'react';
import AppContext from './AppContext'; // Importamos el contexto

const AppProvider = ({ children }) => {
  const [currentView, setCurrentView] = useState('start');
  const [teacherTheme, setTeacherTheme] = useState(() => {
    return localStorage.getItem('teacherTheme') || 'minimal';
  });

  useEffect(() => {
    localStorage.setItem('teacherTheme', teacherTheme);
  }, [teacherTheme]);

  return (
    <AppContext.Provider value={{
      currentView,
      setCurrentView,
      teacherTheme,
      setTeacherTheme
    }}>
      {children}
    </AppContext.Provider>
  );
};

export default AppProvider;