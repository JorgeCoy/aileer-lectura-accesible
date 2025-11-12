// src/context/BabyThemeContext.jsx
import { createContext } from 'react';

// Definimos el contexto con un valor por defecto
const BabyThemeContext = createContext({
  babyTheme: 'highContrast', // Tema por defecto: Alto Contraste
  setBabyTheme: () => {},
});

export default BabyThemeContext;