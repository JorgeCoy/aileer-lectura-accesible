// src/components/ReadingLayout.jsx
import React from "react";
import { motion } from "framer-motion";

const ReadingLayout = ({ title, subtitle, theme, leftPanel, rightPanel, isPlaying, previewMode = false }) => {
  // Fallback seguro para theme
  const themeGradient = theme?.bgGradient || 'from-gray-900 to-black';

  return (
    <div className={`${previewMode ? 'h-full py-4' : 'min-h-screen py-12'} bg-gradient-to-br ${themeGradient} flex flex-col items-center justify-center px-6 transition-colors duration-700 overflow-hidden`}>
      {/* Header */}
      <header className={`text-center mb-6 transition-opacity duration-500 ${isPlaying ? 'opacity-0 h-0 overflow-hidden mb-0' : 'opacity-100'}`}>
        <h1 className={`${previewMode ? 'text-3xl md:text-4xl' : 'text-5xl md:text-7xl'} font-black text-current drop-shadow-2xl tracking-tight`}>
          {title}
        </h1>
        <p className={`${previewMode ? 'text-base md:text-lg' : 'text-xl md:text-2xl'} opacity-70 mt-2 font-light`}>
          {subtitle}
        </p>
      </header>

      {/* Main Content */}
      <div className={`w-full max-w-[95%] grid gap-6 items-stretch transition-all duration-700 ${isPlaying ? 'grid-cols-1 h-full' : 'grid-cols-1 lg:grid-cols-2 h-[calc(100%-100px)]'}`}>

        {/* Panel Izquierdo - Se oculta completamente al leer */}
        {leftPanel && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{
              opacity: isPlaying ? 0 : 1,
              y: isPlaying ? -20 : 0,
              height: isPlaying ? 0 : '100%',
              display: isPlaying ? 'none' : 'block'
            }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="w-full h-full overflow-hidden"
          >
            {leftPanel}
          </motion.div>
        )}

        {/* Panel Derecho - Ocupa todo el espacio al leer */}
        {rightPanel && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{
              opacity: rightPanel ? 1 : 0,
              scale: rightPanel ? 1 : 0.95,
              width: isPlaying ? '100%' : 'auto',
              height: '100%'
            }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className={`w-full h-full overflow-hidden ${isPlaying ? 'flex justify-center' : ''}`}
          >
            {rightPanel}
          </motion.div>
        )}
      </div>

      {/* Footer opcional - Oculto en preview */}
      {!previewMode && (
        <footer className={`mt-16 text-center opacity-50 text-sm transition-opacity duration-500 ${isPlaying ? 'opacity-0 h-0 overflow-hidden mt-0' : ''}`}>
          <p>AILEER — Lectura accesible para todos ❤️</p>
        </footer>
      )}
    </div>
  );
};

export default ReadingLayout;