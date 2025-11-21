// src/components/ReadingLayout.jsx
import React from "react";
import { motion, AnimatePresence } from "framer-motion";

const ReadingLayout = ({ 
  leftPanel, 
  rightPanel, 
  theme, 
  title, 
  subtitle,
  isPlaying // ✅ Recibir estado para ajustar el layout
}) => {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 0, filter: "blur(6px)" }}
        animate={{ opacity: 1, filter: "blur(0px)" }}
        exit={{ opacity: 0, filter: "blur(8px)" }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
        className={`min-h-screen ${theme.bg} p-4 md:p-6 flex flex-col transition-all duration-700`}
      >
        {/* Header */}
        <header className="mb-6 text-center">
          <h1 className="text-3xl font-serif font-bold">{title}</h1>
          <p className="text-gray-500 mt-2">{subtitle}</p>
        </header>

        {/* Contenedor principal */}
        <div className={`flex flex-col md:flex-row gap-6 flex-1 ${isPlaying ? 'md:flex-col' : ''}`}>
          {/* Panel Izquierdo */}
          <div className={`${theme.card} p-4 rounded-lg shadow-lg w-full md:w-1/3 transition ${isPlaying ? 'hidden md:block' : ''}`} style={{ display: isPlaying ? 'none' : 'block' }}>
            {leftPanel}
          </div>

          {/* Panel Derecho */}
          <div className={`${theme.card} p-6 rounded-lg shadow-lg flex flex-col items-center justify-center w-full ${isPlaying ? 'md:w-full' : 'md:w-2/3'} transition`}>
            {rightPanel}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ReadingLayout;