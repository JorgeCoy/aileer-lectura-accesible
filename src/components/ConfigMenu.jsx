// src/components/ConfigMenu.jsx
import React, { useRef, useEffect } from "react";
import {
  XMarkIcon,
  AdjustmentsHorizontalIcon,
  LanguageIcon,
  SpeakerWaveIcon,
  EyeIcon,
  ArrowPathIcon,
  AcademicCapIcon
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
  theme,
  setTheme,
  readingTechnique,
  setReadingTechnique,
  voices,
  selectedVoice,
  setSelectedVoice,
  previewMode,
  setPreviewMode,
  repeatedReadingMode,
  setRepeatedReadingMode,
  memoryExerciseMode,
  setMemoryExerciseMode
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
              <option value="ocean">🌊 Océano</option>
              <option value="sunset">🌅 Atardecer</option>
              <option value="forest">🌲 Bosque</option>
              <option value="cosmic">🌌 Cósmico</option>
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
              <option value="singleWord">🎯 Una palabra (RSVP Optimizado)</option>
              <option value="bionic">🧠 Biónica (Bionic Reading)</option>
              <option value="chunking">📦 Chunking (Grupos)</option>
              <option value="lineFocus">📏 Línea por Puntos (Line Focus)</option>
              <option value="paragraphFocus">🎯 Lectura por Frases (Paragraph Focus - Optimizada)</option>
              <option value="spritz">🎯 Meta-guide (Spritz Optimizado)</option>
              <option value="saccade">👀 Entrenamiento Sacádico</option>
              <option value="preview">👁️ Previewing (Palabras Clave)</option>
              <option value="cloze">🎓 Ejercicio de Memoria (Cloze)</option>
            </select>
          </div>

          {/* Velocidad */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-gray-700 text-sm font-semibold">Velocidad</label>
              <div className="flex gap-2">
                <span className="text-gray-500 text-xs font-medium self-center">
                  ~{Math.round(60000 / speed)} ppm
                </span>
                <span className="text-blue-600 text-xs font-bold bg-blue-100 px-2 py-1 rounded-full">{speed} ms</span>
              </div>
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
              <option value="sans-serif">📖 Sans Serif (Clara y moderna)</option>
              <option value="serif">📚 Serif (Clásica y formal)</option>
              <option value="monospace">⌨️ Monospace (Código y precisión)</option>
              <option value="'Comic Sans MS', cursive">😊 Comic Sans (Amigable para niños)</option>
              <option value="cursive">✨ Dancing Script (Cursiva elegante)</option>
              <option value="dyslexic">🧠 OpenDyslexic (Dislexia y TDAH)</option>
            </select>
          </div>

          {/* Voz */}
          {voices && voices.length > 0 && (
            <div>
              <label className="text-gray-700 text-sm font-semibold mb-2 flex items-center gap-2">
                <SpeakerWaveIcon className="w-4 h-4" /> Voz
              </label>
              <select
                value={selectedVoice ? selectedVoice.name : ""}
                onChange={(e) => {
                  const voice = voices.find(v => v.name === e.target.value);
                  setSelectedVoice(voice);
                }}
                className="w-full p-2 rounded-lg bg-white/50 border border-gray-300 focus:ring-2 focus:ring-green-500 outline-none text-sm transition-all text-gray-900"
              >
                {voices
                  .filter(v => v.lang.startsWith('es')) // Filtrar solo español
                  .map((voice) => (
                    <option key={voice.name} value={voice.name}>
                      {voice.name.replace(/Microsoft|Google|Desktop/g, '').trim()} ({voice.lang})
                    </option>
                  ))}
              </select>
            </div>
          )}

          {/* Preview Mode Toggle */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <div className="flex items-center gap-2">
              <EyeIcon className="w-5 h-5 text-gray-600" />
              <span className="text-gray-700 font-medium">Modo Preview</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={previewMode}
                onChange={(e) => setPreviewMode(e.target.checked)}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>

          {/* Repeated Reading Toggle */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <div className="flex items-center gap-2">
              <ArrowPathIcon className="w-5 h-5 text-gray-600" />
              <span className="text-gray-700 font-medium">Lectura Repetida (3x)</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={repeatedReadingMode}
                onChange={(e) => setRepeatedReadingMode(e.target.checked)}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>

          {/* Memory Exercise Toggle */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <div className="flex items-center gap-2">
              <AcademicCapIcon className="w-5 h-5 text-gray-600" />
              <span className="text-gray-700 font-medium">Ejercicio de Memoria</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={memoryExerciseMode}
                onChange={(e) => setMemoryExerciseMode(e.target.checked)}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>

        </div>
      </div>
    </>
  );
};

export default ConfigMenu;