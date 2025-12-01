// src/components/SettingsPanel.jsx
import React, { useState, useEffect } from "react";

const SettingsPanel = ({
  isOpen,
  onClose,
  speed,
  setSpeed,
  fontSize,
  setFontSize,
  fontFamily,
  setFontFamily
}) => {
  const [localSpeed, setLocalSpeed] = useState(speed);
  const [localFontSize, setLocalFontSize] = useState(fontSize);
  const [localFontFamily, setLocalFontFamily] = useState(fontFamily);

  // ✅ Sincronizar con los valores externos si cambian mientras está abierto
  useEffect(() => {
    setLocalSpeed(speed);
    setLocalFontSize(fontSize);
    setLocalFontFamily(fontFamily);
  }, [speed, fontSize, fontFamily]);

  // ✅ Aplicar cambios en tiempo real
  const handleSpeedChange = (e) => {
    const value = Number(e.target.value);
    setLocalSpeed(value);
    setSpeed(value); // ✅ Aplicar inmediatamente
  };

  const handleFontSizeChange = (e) => {
    const value = Number(e.target.value);
    setLocalFontSize(value);
    setFontSize(value); // ✅ Aplicar inmediatamente
  };

  const handleFontFamilyChange = (e) => {
    const value = e.target.value;
    setLocalFontFamily(value);
    setFontFamily(value); // ✅ Aplicar inmediatamente
  };

  if (!isOpen) return null;

  return (
    <div className="settings-panel fixed top-0 right-0 h-full w-80 bg-white shadow-lg z-50 p-6 overflow-y-auto">
      <h2 className="text-xl font-bold mb-4">⚙️ Configuración</h2>

      {/* Velocidad */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">📈 Velocidad (ms)</label>
        <div className="flex flex-col items-center">
          <input
            type="range"
            min="10"
            max="1000"
            value={localSpeed}
            onChange={handleSpeedChange}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <span className="mt-2 text-sm">{localSpeed}ms</span>
        </div>
      </div>

      {/* Tamaño de fuente */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">🔤 Tamaño de fuente (px)</label>
        <div className="flex flex-col items-center">
          <input
            type="range"
            min="16"
            max="72"
            value={localFontSize}
            onChange={handleFontSizeChange}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <span className="mt-2 text-sm">{localFontSize}px</span>
        </div>
      </div>

      {/* Tipo de letra */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">✍️ Tipo de Letra</label>
        <select
          value={localFontFamily}
          onChange={handleFontFamilyChange}
          className="w-full p-2 border border-gray-300 rounded text-gray-900"
        >
          <option value="sans-serif">📖 Sans Serif (Clara y moderna)</option>
          <option value="serif">📚 Serif (Clásica y formal)</option>
          <option value="monospace">⌨️ Monospace (Código y precisión)</option>
          <option value="'Comic Sans MS', cursive">😊 Comic Sans (Amigable para niños)</option>
          <option value="cursive">✨ Dancing Script (Cursiva elegante)</option>
          <option value="dyslexic">🧠 OpenDyslexic (Dislexia y TDAH)</option>
        </select>
      </div>

      {/* Danger Zone */}
      <div className="mb-6 pt-4 border-t border-gray-200">
        <label className="block text-sm font-bold text-red-600 mb-2">⚠️ Zona de Peligro</label>
        <button
          onClick={() => {
            if (window.confirm('¿Estás seguro? Esto borrará todo tu progreso y volverás al inicio.')) {
              localStorage.clear();
              window.location.reload();
            }
          }}
          className="w-full bg-red-100 hover:bg-red-200 text-red-700 py-2 rounded transition font-medium text-sm"
        >
          🗑️ Borrar Progreso y Reiniciar
        </button>
      </div>

      {/* Botón Aplicar → Eliminado, se aplica en tiempo real */}
      {<button
        onClick={onClose}
        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
      >
        ✅ Cerrar
      </button>}
    </div>
  );
};

export default SettingsPanel;