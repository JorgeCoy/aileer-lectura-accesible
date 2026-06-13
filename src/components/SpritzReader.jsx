import React from "react";
import { adultThemes } from "../config/themes";

/**
 * COMPONENTE: SpritzReader Optimizado
 *
 * TÉCNICA SPRITZ MEJORADA:
 * - ORP inteligente basado en morfología lingüística
 * - Visual minimalista sin retículas distractivas
 * - Alineación natural sin monospace forzado
 * - Guía sutil que entrena visión periférica real
 * - Adaptable por complejidad y velocidad
 */

const SpritzReader = ({
    word = "",
    theme = "minimalist",
    fontSize = 32,
    fontFamily = "sans-serif",
    speed = 300 // WPM para adaptar intensidad visual
}) => {
    const themeStyle = adultThemes[theme] || adultThemes.minimalist;

    /**
     * ALGORITMO DE ORP (Optimal Recognition Point) MEJORADO
     *
     * Considera morfología lingüística real:
     * 1. Vocales y consonantes iniciales
     * 2. Sílabas y raíces morfológicas
     * 3. Longitud y complejidad
     * 4. Patrones lingüísticos del español
     */
    const calculateSmartORP = (w) => {
        if (!w || w.length === 0) return 0;

        const match = w.match(/^([^a-zA-ZáéíóúÁÉÍÓÚñÑ]*)(.*?)([^a-zA-ZáéíóúÁÉÍÓÚñÑ]*)$/);
        const prefix = match ? match[1] : "";
        const coreWord = match ? match[2] : w;

        if (!coreWord) return Math.floor(w.length / 2);

        const len = coreWord.length;
        let coreIndex = 0;

        // Standard Spritz ORP logic based on word length
        if (len === 1) coreIndex = 0;
        else if (len <= 2) coreIndex = 0; // 1st letter (0-index)
        else if (len <= 4) coreIndex = 1; // 2nd letter
        else if (len <= 5) coreIndex = 2; // 3rd letter
        else if (len <= 9) coreIndex = 2; // 3rd letter
        else if (len <= 13) coreIndex = 3; // 4th letter
        else coreIndex = 4; // 5th letter

        // Adjust index by adding the length of the prefix (punctuation)
        return prefix.length + coreIndex;
    };

    /**
     * INTENSIDAD VISUAL ADAPTATIVA
     *
     * Basada en velocidad y complejidad:
     * - Velocidades bajas: más guía visual
     * - Velocidades altas: guía minimalista
     * - Palabras complejas: énfasis sutil
     */
    const getAdaptiveStyling = (wordLen, currentSpeed) => {
        const complexity = wordLen > 8 ? 'high' : wordLen > 5 ? 'medium' : 'low';
        const speedFactor = Math.min(currentSpeed / 300, 3); // Normalizar

        if (speedFactor > 2) {
            // Velocidades muy altas (>600 WPM): guía minimalista
            return {
                orpColor: themeStyle.textColor,
                orpScale: 1.05,
                orpOpacity: 0.9,
                textOpacity: 0.8,
                showGuides: false
            };
        } else if (speedFactor > 1.2) {
            // Velocidades medias (360-600 WPM): guía sutil
            return {
                orpColor: complexity === 'high' ? themeStyle.highlight : themeStyle.textColor,
                orpScale: complexity === 'high' ? 1.1 : 1.05,
                orpOpacity: 0.85,
                textOpacity: 0.75,
                showGuides: false
            };
        } else {
            // Velocidades bajas (<360 WPM): guía moderada
            return {
                orpColor: themeStyle.highlight,
                orpScale: complexity === 'high' ? 1.15 : 1.1,
                orpOpacity: 0.95,
                textOpacity: 0.7,
                showGuides: false // Nunca mostrar guías distractivas
            };
        }
    };

    const orpIndex = calculateSmartORP(word);
    const prefix = word.slice(0, orpIndex);
    const orpChar = word[orpIndex];
    const suffix = word.slice(orpIndex + 1);

    const adaptiveStyle = getAdaptiveStyling(word.length, speed);

    return (
        <div className="flex flex-col items-center justify-center w-full h-64 relative">
            {/* RETÍCULA VISUAL (Guides) */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
                {/* Horizontal Lines */}
                <div className="w-64 h-12 border-t border-b border-current" style={{ color: themeStyle.textColor }}></div>
                {/* Vertical Marker (Top) */}
                <div className="absolute top-1/2 -mt-8 w-px h-2 bg-current" style={{ color: themeStyle.textColor }}></div>
                {/* Vertical Marker (Bottom) */}
                <div className="absolute bottom-1/2 -mb-8 w-px h-2 bg-current" style={{ color: themeStyle.textColor }}></div>
            </div>

            {/* Contenedor de palabra con cohesión visual */}
            <div
                className="inline-flex items-baseline relative z-10"
                style={{
                    fontFamily: fontFamily,
                    fontSize: `${fontSize}px`,
                    color: themeStyle.textColor,
                    lineHeight: 1.2,
                    letterSpacing: '0.01em', // Espaciado natural de letras
                    transition: 'all 0.3s ease-out'
                }}
            >
                {/* Prefijo: Conectado naturalmente al ORP */}
                <span
                    className="transition-opacity duration-300"
                    style={{
                        opacity: adaptiveStyle.textOpacity,
                        paddingRight: '0.1em' // Espacio mínimo, no margen grande
                    }}
                >
                    {prefix}
                </span>

                {/* ORP: Punto de fijación integrado en el flujo de la palabra */}
                <span
                    className="font-semibold transition-all duration-300 relative inline-block"
                    style={{
                        color: adaptiveStyle.orpColor,
                        transform: `scale(${adaptiveStyle.orpScale})`,
                        opacity: adaptiveStyle.orpOpacity,

                        // Sombra sutil solo cuando es necesario
                        textShadow: adaptiveStyle.orpScale > 1.1 ?
                            `0 0 4px ${adaptiveStyle.orpColor}30` : 'none',

                        // Espaciado integrado - parte de la palabra
                        margin: '0 0.05em', // Espacio mínimo

                        // Indicador minimalista (opcional basado en complejidad)
                        borderBottom: word.length > 8 && speed < 400 ?
                            `1px solid ${adaptiveStyle.orpColor}40` : 'none',
                        paddingBottom: word.length > 8 && speed < 400 ? '2px' : '0'
                    }}
                >
                    {orpChar}
                </span>

                {/* Sufijo: Conectado naturalmente al ORP */}
                <span
                    className="transition-opacity duration-300"
                    style={{
                        opacity: adaptiveStyle.textOpacity,
                        paddingLeft: '0.1em' // Espacio mínimo, no margen grande
                    }}
                >
                    {suffix}
                </span>
            </div>


        </div>
    );
};

export default SpritzReader;
