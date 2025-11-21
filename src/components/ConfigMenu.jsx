// src/components/ConfigMenu.jsx
import React, { useRef, useEffect } from "react";

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
        onClose(); // ✅ Cerrar al hacer clic fuera
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
        onClose(); // ✅ Cerrar al salir del menú
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
      {/* ✅ Menú de configuración emergente */}
      <div 
        ref={menuRef}
        className="settings-menu absolute top-16 left-20 shadow-xl rounded-lg p-4 w-64 z-50"
        style={{
          backgroundColor: 'rgba(155, 255, 255, 0.7)', // ✅ Fondo blanco con 90% de opacidad
        }}
      >
        <h3 className="text-blue-500 font-bold mb-3">⚙️ Configuración</h3>

        {/* Velocidad */}
        <div className="mb-4">
          <label className="text-black block text-sm font-medium mb-1">📈 Velocidad (ms)</label>
          <input
            type="range"
            min="10"
            max="1000"
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))} // ✅ Aplicar inmediatamente
            className="w-full h-2 bg-blue-950 rounded-lg appearance-none cursor-pointer"
          />
          <span className="text-blue-500">{speed}ms</span>
        </div>

        {/* Tamaño de fuente */}
        <div className="mb-4">
          <label className="text-black block text-sm font-medium mb-1">🔤 Tamaño de fuente (px)</label>
          <input
            type="range"
            min="16"
            max="72"
            value={fontSize}
            onChange={(e) => setFontSize(Number(e.target.value))} // ✅ Aplicar inmediatamente
            className="w-full h-2 bg-blue-950 rounded-lg appearance-none cursor-pointer"
          />
          <span className="text-xs text-red-950">{fontSize}px</span>
        </div>

        {/* Tipo de letra */}
        <div className="mb-4">
          <label className=" text-black block text-sm font-medium mb-1">✍️ Tipo de Letra</label>
          <select
            value={fontFamily}
            onChange={(e) => setFontFamily(e.target.value)} // ✅ Aplicar inmediatamente
            className="w-full bg-blue-950 p-1 border border-gray-300 rounded text-sm"
          >
            <option value="sans-serif">Letra separada (Sans-serif)</option>
            <option value="cursive">Letra cursiva (Dancing Script)</option> {/* ✅ Nombre más descriptivo */}
            <option value="dyslexic">Letra dislexia (OpenDyslexic)</option>
          </select>
        </div>

        {/* Botón Cerrar → Eliminado, se cierra al salir */}
      </div>
    </>
  );
};

export default ConfigMenu;