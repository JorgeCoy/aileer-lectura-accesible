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
        <div className={`flex flex-col md:flex-row gap-6 flex-1`}>
          {/* Panel Izquierdo */}
          <motion.div
            initial={false} // ✅ No animar en el primer render
            animate={{
              width: isPlaying ? 0 : "33.333%", // ✅ Cambiar ancho: 1/3 -> 0
              opacity: isPlaying ? 0 : 1,       // ✅ Cambiar opacidad: 1 -> 0
              display: isPlaying ? "none" : "block", // ✅ Ocultar con display
            }}
            transition={{ duration: 0.5, ease: "easeInOut" }} // ✅ Duración y tipo de transición
            className={`${theme.card} p-4 rounded-lg shadow-lg md:w-1/3 flex-shrink-0`} // ✅ Ajustar clases para que el ancho funcione
            style={{ overflow: 'hidden' }} // ✅ Evitar desbordes durante la animación
          >
            {leftPanel}
          </motion.div>

          {/* Panel Derecho */}
          <motion.div
            initial={false} // ✅ No animar en el primer render
            animate={{
              width: isPlaying ? "100%" : "66.666%", // ✅ Cambiar ancho: 2/3 -> 100%
              opacity: 1,                           // ✅ Mantener opacidad en 1
            }}
            transition={{ duration: 0.5, ease: "easeInOut" }} // ✅ Duración y tipo de transición
            className={`${theme.card} p-6 rounded-lg shadow-lg flex flex-col items-center justify-center md:w-2/3`} // ✅ Ajustar clases para que el ancho funcione
          >
            {rightPanel}
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ReadingLayout;