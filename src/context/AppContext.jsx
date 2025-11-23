// src/context/AppContext.jsx
// src/context/AppContext.jsx
import { createContext } from 'react';

const AppContext = createContext({
  currentView: 'start',
  setCurrentView: () => { },
  previousView: 'start', // 🔥 Nueva propiedad
  teacherTheme: 'minimal',
  setTeacherTheme: () => { },
});

export default AppContext; // ✅ Exporta como default