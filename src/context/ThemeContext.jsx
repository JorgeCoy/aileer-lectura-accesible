// src/context/ThemeContext.jsx
import { createContext } from "react";

const ThemeContext = createContext({
  theme: "minimalist",
  setTheme: () => {},
});

export default ThemeContext;