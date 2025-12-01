import React, { useRef } from "react";
import { adultThemes } from "../config/themes";

const ParagraphReader = ({
    words = [],
    currentIndex = 0,
    theme = "minimalist",
    fontSize = 32,
    fontFamily = "sans-serif",
    windowSize = 80, // Aumentado para mejor contexto
    focusPhraseSize = 3, // Frase completa en foco (reducido para menos dependencia)
    previewWords = 6 // Palabras de preview adelante (reducido para menos distracción)
}) => {
    const activeWordRef = useRef(null);

    // Obtener colores del tema actual
    const themeStyle = adultThemes[theme] || adultThemes.minimalist;

    // Fuentes reales
    let actualFont = fontFamily;
    if (fontFamily === "cursive") actualFont = "'Dancing Script', cursive";
    if (fontFamily === "dyslexic") actualFont = "'OpenDyslexic', sans-serif";
    if (fontFamily === "comic") actualFont = "'Comic Neue', cursive";

    /**
     * Técnica Paragraph Focus Mejorada:
     * Evita el "seguimiento como gusano" con zonas sutiles de atención
     *
     * Estrategia:
     * - NO usa colores brillantes que creen dependencia visual
     * - Usa opacidades graduales para guiar naturalmente
     * - Reduce el contraste agresivo
     * - Entrena la visión periférica en lugar del seguimiento
     */

    // Paginación por párrafos completos
    const pageIndex = Math.floor(currentIndex / windowSize);
    const start = pageIndex * windowSize;
    const end = Math.min(words.length, start + windowSize);

    const visibleWords = words.slice(start, end);
    const activeIndexInWindow = currentIndex - start;

    return (
        <div
            className="w-full max-w-4xl mx-auto p-8 rounded-3xl transition-colors duration-500"
            style={{
                backgroundColor: theme === 'minimalist' ? 'transparent' : 'rgba(0,0,0,0.05)',
                backdropFilter: "blur(5px)"
            }}
        >
            <div
                className="flex flex-wrap justify-center content-center gap-x-2 gap-y-3 leading-relaxed"
                style={{
                    fontFamily: actualFont,
                    fontSize: `${fontSize * 0.65}px`,
                    color: themeStyle.textColor,
                    lineHeight: '1.6'
                }}
            >
                {visibleWords.map((word, index) => {
                    const dist = index - activeIndexInWindow;

                    // Zonas de atención sutiles (no cursor brillante)
                    const isCurrentFocus = dist >= 0 && dist < focusPhraseSize;  // Zona de procesamiento actual
                    const isPreviewZone = dist >= focusPhraseSize && dist < (focusPhraseSize + previewWords); // Preparación visual
                    const isPast = dist < 0; // Ya procesado

                    // Es la primera palabra de la zona actual (referencia sutil)
                    const isZoneStart = dist === 0;

                    return (
                        <span
                            key={start + index}
                            ref={isZoneStart ? activeWordRef : null}
                            className="transition-all duration-500 ease-out"
                            style={{
                                // Colores muy sutiles - casi imperceptibles
                                color: isCurrentFocus
                                    ? themeStyle.textColor // Texto normal para zona activa
                                    : isPreviewZone
                                    ? '#6B7280' // Gris sutil para preview
                                    : isPast
                                    ? '#4B5563' // Gris más oscuro para pasado
                                    : '#9CA3AF', // Gris muy tenue para contexto lejano

                                // Opacidades graduales - guía natural
                                opacity: isCurrentFocus
                                    ? 1.0 // Completamente visible
                                    : isPreviewZone
                                    ? 0.7 // Visible pero no distractivo
                                    : isPast
                                    ? 0.5 // Atenuado pero legible
                                    : 0.3, // Muy atenuado para contexto

                                // Sin escalas agresivas - cambios sutiles
                                fontWeight: isCurrentFocus ? '400' : '300',
                                letterSpacing: isCurrentFocus ? '0.01em' : 'normal',

                                // Sin fondos ni sombras brillantes
                                backgroundColor: 'transparent',
                                textShadow: 'none',

                                // Padding mínimo
                                padding: '0 0.1em',

                                // Transición suave para cambios naturales
                                transition: 'all 0.5s ease-in-out'
                            }}
                        >
                            {word}
                        </span>
                    );
                })}
            </div>

            {/* Indicador de progreso sutil (opcional) */}
            <div className="mt-4 text-center">
                <div className="inline-block w-32 h-1 bg-gray-200 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-blue-300 transition-all duration-300 ease-out"
                        style={{
                            width: `${((activeIndexInWindow + 1) / visibleWords.length) * 100}%`,
                            opacity: 0.4 // Muy sutil
                        }}
                    />
                </div>
            </div>
        </div>
    );
};

export default ParagraphReader;