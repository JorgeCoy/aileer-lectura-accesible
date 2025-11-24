// src/context/AppContext.jsx
import React, { createContext, useState } from 'react';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [currentView, setCurrentView] = useState('start');
  const [previousView, setPreviousView] = useState(null);

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
    <AppContext.Provider value={{ currentView, setCurrentView, goToView, goBack, previousView }}>
      {children}
    </AppContext.Provider>
  );
};

export default AppContext;