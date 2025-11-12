// src/context/KidThemeContext.jsx
import { createContext } from 'react';

// Definimos el contexto con un valor por defecto
const KidThemeContext = createContext({
  kidTheme: 'piggy', // Tema por defecto: Cerdito Feliz
  setKidTheme: () => {},
});

export default KidThemeContext;