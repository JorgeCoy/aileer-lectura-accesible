// src/components/ConfigMenu.jsx
import React, { useRef, useEffect } from "react";
import {
  XMarkIcon,
  AdjustmentsHorizontalIcon,
  LanguageIcon
} from "@heroicons/react/24/outline";

const ConfigMenu = ({
  isOpen,
  onClose,
  speed,
  setSpeed,
  fontSize,
  setFontSize,
  fontFamily,
  setFontFamily,
  theme, // ✅ Nueva prop
  setTheme, // ✅ Nueva prop
  readingTechnique, // ✅ Nueva prop
  setReadingTechnique, // ✅ Nueva prop
}) => {
  const menuRef = useRef(null);

  // ✅ Cerrar si se hace clic fuera del menú
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (isOpen && menuRef.current && !menuRef.current.contains(e.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // ✅ Cerrar si el mouse sale del menú
  useEffect(() => {
    const handleMouseLeave = () => {
      if (isOpen) {
        onClose();
      }
    };

    if (isOpen && menuRef.current) {
      menuRef.current.addEventListener('mouseleave', handleMouseLeave);
    }

    return () => {
      if (menuRef.current) {
        menuRef.current.removeEventListener('mouseleave', handleMouseLeave);
      }
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      {/* ✅ Menú de configuración con Glassmorphism */}
      <div
        ref={menuRef}
        className="absolute top-16 left-20 w-80 p-5 rounded-2xl shadow-2xl z-50 animate-fadeIn"
        style={{
          background: "rgba(255, 255, 255, 0.9)", // Un poco más opaco para legibilidad
          backdropFilter: "blur(16px)",
          border: "1px solid rgba(255, 255, 255, 0.5)",
          boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.37)",
        }}
      >
        <div className="flex justify-between items-center mb-4 border-b border-gray-200 pb-2">
          <h3 className="text-gray-800 font-bold text-lg flex items-center gap-2">
            <AdjustmentsHorizontalIcon className="w-5 h-5 text-blue-600" />
            Configuración
          </h3>
        </div>

        <div className="space-y-5 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
          {/* Tema Visual */}
          <div>
            <label className="text-gray-700 text-sm font-semibold mb-2 block">Tema Visual</label>
            <select
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              className="w-full p-2 rounded-lg bg-white/50 border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none text-sm transition-all text-gray-900"
            >
              <option value="minimalist">🧼 Minimalista</option>
              <option value="cinematic">🎬 Cinemático</option>
              <option value="zen">🌿 Zen</option>
              <option value="professional">💻 Profesional</option>
              <option value="vintage">📜 Vintage</option>
              <option value="focus">🎯 Enfoque</option>
              <option value="gray">⚫ Gris elegante</option>
            </select>
          </div>

          {/* Técnica de Lectura */}
          <div>
            <label className="text-gray-700 text-sm font-semibold mb-2 block">Técnica de Lectura</label>
            <select
              value={readingTechnique}
              onChange={(e) => setReadingTechnique(e.target.value)}
              className="w-full p-2 rounded-lg bg-white/50 border border-gray-300 focus:ring-2 focus:ring-green-500 outline-none text-sm transition-all text-gray-900"
            >
              <option value="singleWord">🅰️ Una palabra</option>
              <option value="lineThreePoints">📖 Línea en tres puntos</option>
              <option value="paragraphFocus">🧠 Párrafo con foco</option>
            </select>
          </div>

          {/* Velocidad */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-gray-700 text-sm font-semibold">Velocidad</label>
              <span className="text-blue-600 text-xs font-bold bg-blue-100 px-2 py-1 rounded-full">{speed} ms</span>
            </div>
            <input
              type="range"
              min="10"
              max="1000"
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
              className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Rápido</span>
              <span>Lento</span>
            </div>
          </div>

          {/* Tamaño de fuente */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-gray-700 text-sm font-semibold">Tamaño Texto</label>
              <span className="text-purple-600 text-xs font-bold bg-purple-100 px-2 py-1 rounded-full">{fontSize}px</span>
            </div>
            <input
              type="range"
              min="16"
              max="96"
              value={fontSize}
              onChange={(e) => setFontSize(Number(e.target.value))}
              className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer accent-purple-600"
            />
          </div>

          {/* Fuente */}
          <div>
            <label className="text-gray-700 text-sm font-semibold mb-2 flex items-center gap-2">
              <LanguageIcon className="w-4 h-4" /> Fuente
            </label>
            <select
              value={fontFamily}
              onChange={(e) => setFontFamily(e.target.value)}
              className="w-full p-2 rounded-lg bg-white/50 border border-gray-300 focus:ring-2 focus:ring-purple-500 outline-none text-sm transition-all text-gray-900"
            >
              <option value="sans-serif">Sans Serif</option>
              <option value="serif">Serif</option>
              <option value="monospace">Monospace</option>
              <option value="'Comic Sans MS', cursive">Comic Sans</option>
              <option value="'Open Dyslexic', sans-serif">Open Dyslexic</option>
            </select>
          </div>
        </div>
      </div>
    </>
  );
};

export default ConfigMenu;