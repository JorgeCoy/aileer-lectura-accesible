import React from "react";
import { motion } from "framer-motion";
import { adultThemes } from "../config/themes";

const LineReader = ({
    line = "",
    speed = 200, // Speed in ms (interval duration)
    multiplier = 8, // Multiplier used for this line
    theme = "minimalist",
    fontSize = 32,
    fontFamily = "sans-serif"
}) => {
    // Obtener colores del tema actual
    const themeStyle = adultThemes[theme] || adultThemes.minimalist;

    // Fuentes reales
    let actualFont = fontFamily;
    if (fontFamily === "cursive") actualFont = "'Dancing Script', cursive";
    if (fontFamily === "dyslexic") actualFont = "'OpenDyslexic', sans-serif";
    if (fontFamily === "comic") actualFont = "'Comic Neue', cursive";

    // Calcular duración basada en la longitud de la línea (palabras)
    // speed es ms por palabra (aprox). 
    // Si speed = 200ms, una línea de 5 palabras debería tomar 1000ms (1s).
    const wordCount = line.split(' ').length;
    // Ajuste fino: agregamos un pequeño buffer base para líneas muy cortas
    const baseDuration = (wordCount * speed) / 1000;
    const duration = Math.max(0.8, baseDuration); // Mínimo 0.8s para que no sea instantáneo

    return (
        <div className="relative w-full max-w-4xl mx-auto p-4 md:p-8 flex items-center justify-center min-h-[200px]">
            {/* Contenedor tipo tarjeta para agrupar visualmente */}
            <div className="relative w-full bg-gray-800/40 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6 md:p-10 shadow-xl overflow-hidden">

                {/* Texto de la línea */}
                <div className="relative">
                    <div
                        className="text-center leading-relaxed tracking-wide mb-6 relative z-10"
                        style={{
                            fontSize: `${fontSize}px`,
                            fontFamily: actualFont,
                            color: themeStyle.textColor,
                        }}
                    >
                        {line}
                    </div>

                    {/* Overlay de desenfoque (Trailing Blur) */}
                    {/* Se mueve de izquierda a derecha, desenfocando lo que queda atrás */}
                    <motion.div
                        key={`blur-${line}`}
                        initial={{ width: "0%" }}
                        animate={{ width: "100%" }}
                        transition={{ duration: duration, ease: "linear" }}
                        className="absolute top-0 left-0 h-full z-20 pointer-events-none"
                        style={{
                            backdropFilter: "blur(4px)",
                            WebkitBackdropFilter: "blur(4px)",
                            background: "linear-gradient(90deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%)",
                            maskImage: "linear-gradient(to right, black 90%, transparent 100%)",
                            WebkitMaskImage: "linear-gradient(to right, black 90%, transparent 100%)"
                        }}
                    />
                </div>

                {/* Guía visual animada (Barra de progreso) */}
                <div className="w-full h-1.5 bg-gray-700/30 rounded-full mt-2 overflow-hidden relative">
                    <motion.div
                        key={line} // Reinicia la animación cuando cambia la línea
                        initial={{ x: "-100%" }}
                        animate={{ x: "0%" }}
                        transition={{ duration: duration, ease: "linear" }}
                        className="absolute top-0 left-0 w-full h-full"
                        style={{ backgroundColor: themeStyle.highlight }}
                    />
                </div>
            </div>
        </div>
    );
};

export default LineReader;
