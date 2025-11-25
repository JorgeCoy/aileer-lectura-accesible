import React, { useEffect, useRef } from "react";
import { adultThemes } from "../config/themes";

const ParagraphReader = ({
    words = [],
    currentIndex = 0,
    theme = "minimalist",
    fontSize = 32,
    fontFamily = "sans-serif",
    windowSize = 60 // Cantidad de palabras a mostrar (contexto)
}) => {
    const containerRef = useRef(null);
    const activeWordRef = useRef(null);

    // Obtener colores del tema actual
    const themeStyle = adultThemes[theme] || adultThemes.minimalist;

    // Fuentes reales
    let actualFont = fontFamily;
    if (fontFamily === "cursive") actualFont = "'Dancing Script', cursive";
    if (fontFamily === "dyslexic") actualFont = "'OpenDyslexic', sans-serif";
    if (fontFamily === "comic") actualFont = "'Comic Neue', cursive";

    // Calcular el rango de palabras a mostrar (Paginación Estática)
    // En lugar de mover la ventana palabra por palabra (que causa reflow),
    // mostramos un bloque estático y movemos solo el resaltado.
    // Cuando el lector llega al final del bloque, cambiamos de página.

    const pageIndex = Math.floor(currentIndex / windowSize);
    const start = pageIndex * windowSize;
    const end = Math.min(words.length, start + windowSize);

    const visibleWords = words.slice(start, end);
    const activeIndexInWindow = currentIndex - start;

    return (
        <div
            className="w-full max-w-4xl mx-auto p-8 rounded-3xl transition-colors duration-500"
            style={{
                backgroundColor: theme === 'minimalist' ? 'transparent' : 'rgba(0,0,0,0.2)', // Fondo sutil para separar
                backdropFilter: "blur(10px)"
            }}
        >
            <div
                className="flex flex-wrap justify-center content-center gap-x-3 gap-y-4 leading-relaxed transition-all duration-300"
                style={{
                    fontFamily: actualFont,
                    fontSize: `${fontSize * 0.6}px`, // Un poco más pequeño que RSVP para que quepa el párrafo
                    color: themeStyle.textColor
                }}
            >
                {visibleWords.map((word, index) => {
                    const isActive = index === activeIndexInWindow;
                    const isPast = index < activeIndexInWindow;

                    return (
                        <span
                            key={start + index}
                            ref={isActive ? activeWordRef : null}
                            className={`transition-all duration-200 rounded px-1 ${isActive ? 'scale-110 font-bold' : ''}`}
                            style={{
                                color: isActive ? themeStyle.highlight : (isPast ? themeStyle.textColor : themeStyle.textColor),
                                opacity: isActive ? 1 : (isPast ? 0.6 : 0.4), // Pasado un poco visible, futuro más tenue
                                backgroundColor: isActive ? 'rgba(255,255,255,0.1)' : 'transparent',
                                textShadow: isActive ? `0 0 15px ${themeStyle.highlight}` : 'none'
                            }}
                        >
                            {word}
                        </span>
                    );
                })}
            </div>
        </div>
    );
};

export default ParagraphReader;
