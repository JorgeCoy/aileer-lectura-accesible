// src/context/AppProvider.jsx
import React, { useState, useEffect } from 'react';
import AppContext from './AppContext';
import useStreak from '../hooks/useStreak';
import useStudyPlan from '../hooks/useStudyPlan';

const AppProvider = ({ children }) => {
  const [currentView, setCurrentView] = useState('start');
  const [previousView, setPreviousView] = useState(null);
  const [viewContext, setViewContext] = useState(null); // Contexto adicional para vistas
  const [teacherTheme, setTeacherTheme] = useState(() => {
    return localStorage.getItem('teacherTheme') || 'minimal';
  });

  // New Sidebar Mode State
  const [sidebarMode, setSidebarMode] = useState(null); // 'practice' | 'study' | null

  const streak = useStreak();
  const studyPlan = useStudyPlan();

  // User Profile State
  const [userProfile, setUserProfile] = useState(() => {
    const savedProfile = localStorage.getItem('userProfile');
    return savedProfile ? JSON.parse(savedProfile) : {
      name: '',
      age: '',
      isFirstTime: true,
      currentLevel: 'beginner',
      xp: 0,
      unlockedNodes: []
    };
  });

  // Update User Profile and Persist
  const updateUserProfile = (updates) => {
    setUserProfile(prev => {
      const newProfile = { ...prev, ...updates };
      localStorage.setItem('userProfile', JSON.stringify(newProfile));
      return newProfile;
    });
  };

  useEffect(() => {
    localStorage.setItem('teacherTheme', teacherTheme);
  }, [teacherTheme]);

  // Navegación con historial y contexto
  const goToView = (view, context = null) => {
    console.log(`[AppProvider] Changing view from ${currentView} to ${view}`, context);
    setPreviousView(currentView);
    setCurrentView(view);
    setViewContext(context);
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
      setCurrentView,
      goToView,
      goBack,
      previousView,
      viewContext,
      teacherTheme,
      setTeacherTheme,
      sidebarMode,
      setSidebarMode,
      streak,
      studyPlan,
      userProfile,
      updateUserProfile
    }}>
      {children}
    </AppContext.Provider>
  );
};

export default AppProvider;