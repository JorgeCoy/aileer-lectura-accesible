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
  setFontFamily
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
        className="absolute top-16 left-20 w-72 p-5 rounded-2xl shadow-2xl z-50 animate-fadeIn"
        style={{
          background: "rgba(255, 255, 255, 0.85)", // Fondo blanco translúcido
          backdropFilter: "blur(12px)", // Efecto de desenfoque
          border: "1px solid rgba(255, 255, 255, 0.3)", // Borde sutil
          boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.37)", // Sombra suave
        }}
      >
        <div className="flex justify-between items-center mb-4 border-b border-gray-200 pb-2">
          <h3 className="text-gray-800 font-bold text-lg flex items-center gap-2">
            <AdjustmentsHorizontalIcon className="w-5 h-5 text-blue-600" />
            Configuración
          </h3>
        </div>

        {/* Velocidad */}
        <div className="mb-5">
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
        <div className="mb-5">
          <div className="flex justify-between items-center mb-2">
            <label className="text-gray-700 text-sm font-semibold">Tamaño de fuente</label>
            <span className="text-gray-600 text-xs font-bold bg-gray-100 px-2 py-1 rounded-full">{fontSize}px</span>
          </div>
          <input
            type="range"
            min="16"
            max="72"
            value={fontSize}
            onChange={(e) => setFontSize(Number(e.target.value))}
            className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer accent-gray-600"
          />
        </div>

        {/* Tipo de letra */}
        <div className="mb-2">
          <label className="text-gray-700 text-sm font-semibold mb-2 flex items-center gap-2">
            <LanguageIcon className="w-4 h-4 text-gray-500" />
            Tipografía
          </label>
          <select
            value={fontFamily}
            onChange={(e) => setFontFamily(e.target.value)}
            className="w-full bg-white border border-gray-300 text-gray-700 py-2 px-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all cursor-pointer text-sm"
          >
            <option value="sans-serif">Sans-serif (Limpia)</option>
            <option value="cursive">Dancing Script (Cursiva)</option>
            <option value="dyslexic">OpenDyslexic (Accesible)</option>
          </select>
        </div>
      </div>
    </>
  );
};

export default ConfigMenu;