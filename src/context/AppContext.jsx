// src/context/AppContext.jsx
// src/context/AppContext.jsx
import { createContext} from 'react';

const AppContext = createContext({
  currentView: 'start',
  setCurrentView: () => {},
  teacherTheme: 'minimal',
  setTeacherTheme: () => {},
});

export default AppContext; // ✅ Exporta como default