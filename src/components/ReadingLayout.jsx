// src/components/ReadingLayout.jsx
import React from "react";
import { motion } from "framer-motion";

const ReadingLayout = ({ title, subtitle, theme, leftPanel, rightPanel, isPlaying }) => {
  // Fallback seguro para theme
  const themeGradient = theme?.bgGradient || 'from-gray-900 to-black';

  return (
    <div className={`min-h-screen bg-gradient-to-br ${themeGradient} flex flex-col items-center justify-center px-6 py-12 transition-colors duration-700`}>
      {/* Header */}
      <header className={`text-center mb-10 transition-opacity duration-500 ${isPlaying ? 'opacity-0 h-0 overflow-hidden mb-0' : 'opacity-100'}`}>
        <h1 className="text-5xl md:text-7xl font-black text-current drop-shadow-2xl tracking-tight">
          {title}
        </h1>
        <p className="text-xl md:text-2xl opacity-70 mt-3 font-light">
          {subtitle}
        </p>
      </header>

      {/* Main Content */}
      <div className={`w-full max-w-7xl grid gap-10 items-start transition-all duration-700 ${isPlaying ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-2'}`}>

        {/* Panel Izquierdo - Se oculta completamente al leer */}
        {leftPanel && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{
              opacity: isPlaying ? 0 : 1,
              y: isPlaying ? -20 : 0,
              height: isPlaying ? 0 : 'auto',
              display: isPlaying ? 'none' : 'block'
            }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="w-full"
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
              width: isPlaying ? '100%' : 'auto'
            }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className={`w-full h-full min-h-96 ${isPlaying ? 'flex justify-center' : ''}`}
          >
            {rightPanel}
          </motion.div>
        )}
      </div>

      {/* Footer opcional */}
      <footer className={`mt-16 text-center opacity-50 text-sm transition-opacity duration-500 ${isPlaying ? 'opacity-0 h-0 overflow-hidden mt-0' : ''}`}>
        <p>AILEER — Lectura accesible para todos ❤️</p>
      </footer>
    </div>
  );
};

export default ReadingLayout;