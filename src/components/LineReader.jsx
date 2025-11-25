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

    // Calcular duración total de la animación en segundos
    // speed es el intervalo base (ej. 200ms). multiplier es 8.
    // Duración total = 200 * 8 = 1600ms = 1.6s
    const duration = (speed * multiplier) / 1000;

    return (
        <div className="relative w-full max-w-4xl mx-auto p-8 rounded-xl overflow-hidden">
            {/* Texto de la línea */}
            <div
                className="text-center leading-relaxed tracking-wide mb-4"
                style={{
                    fontSize: `${fontSize}px`,
                    fontFamily: actualFont,
                    color: themeStyle.textColor,
                }}
            >
                {line}
            </div>

            {/* Guía visual animada */}
            <div className="w-full h-1 bg-gray-700/30 rounded-full mt-2 overflow-hidden relative">
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
    );
};

export default LineReader;
