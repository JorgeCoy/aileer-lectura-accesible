import React, { useContext } from 'react';
import ThemeContext from '../context/ThemeContext';

const ThemeSelector = () => {
  const { theme, setTheme } = useContext(ThemeContext);

  return (
    <select
      value={theme}
      onChange={(e) => setTheme(e.target.value)}
      className="bg-surface-elevated text-text-main border border-border-color text-xs rounded-full px-3 py-1 cursor-pointer outline-none focus:ring-2 focus:ring-primary transition-colors"
    >
      <option value="minimalist" className="bg-surface-elevated text-text-main">Blanco (Default)</option>
      <option value="cinematic" className="bg-surface-elevated text-text-main">Antigravity IDE</option>
      <option value="zen" className="bg-surface-elevated text-text-main">Esmeralda (Zen)</option>
      <option value="professional" className="bg-surface-elevated text-text-main">Naranja (Profesional)</option>
      <option value="focus" className="bg-surface-elevated text-text-main">Alto Contraste</option>
    </select>
  );
};

export default ThemeSelector;
