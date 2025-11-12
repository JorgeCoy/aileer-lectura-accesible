// src/context/TdahThemeContext.jsx
import { createContext } from 'react';

// Definimos el contexto con un valor por defecto
const TdahThemeContext = createContext({
  tdahTheme: 'focus', // Tema por defecto: Modo Foco
  setTdahTheme: () => {},
});

export default TdahThemeContext;