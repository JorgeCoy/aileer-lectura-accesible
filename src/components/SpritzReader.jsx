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

        const len = w.length;

        // Palabras muy cortas: centro natural
        if (len <= 2) return Math.floor(len / 2);

        // Palabras cortas: segunda letra (después de vocal/consonante inicial)
        if (len === 3) return 1;
        if (len === 4) return 2;

        // Palabras medias: buscar vocal después de sílaba inicial
        if (len >= 5 && len <= 7) {
            // Buscar patrón VCV (Vocal-Consonante-Vocal) o CVC
            for (let i = 1; i < Math.min(len - 1, 4); i++) {
                const current = w[i].toLowerCase();
                const next = w[i + 1]?.toLowerCase();

                // Preferir vocal después de consonante
                if ('aeiouáéíóú'.includes(current) && 'bcdfghjklmnpqrstvwxyz'.includes(next || '')) {
                    return i;
                }
            }
            return 2; // Fallback
        }

        // Palabras largas: algoritmo morfológico avanzado
        if (len >= 8) {
            // Buscar raíces y morfemas comunes en español
            const lowerWord = w.toLowerCase();

            // Prefijos comunes (des-, in-, re-, etc.)
            if (lowerWord.startsWith('des') && len >= 6) return 3;
            if (lowerWord.startsWith('in') && len >= 5) return 2;
            if (lowerWord.startsWith('re') && len >= 4) return 2;

            // Sufijos comunes (ción, mente, etc.)
            if (lowerWord.endsWith('ción') && len >= 6) return len - 4;
            if (lowerWord.endsWith('mente') && len >= 7) return len - 5;
            if (lowerWord.endsWith('mente') && len >= 7) return len - 5;

            // Algoritmo general: ~35-40% de la palabra
            const optimalPos = Math.floor(len * 0.35);

            // Ajustar para evitar cortes problemáticos
            if ('aeiouáéíóú'.includes(w[optimalPos]?.toLowerCase())) {
                return optimalPos; // Vocal es buena
            }

            // Buscar vocal más cercana
            for (let offset = 1; offset <= 2; offset++) {
                if (optimalPos - offset >= 0 && 'aeiouáéíóú'.includes(w[optimalPos - offset]?.toLowerCase())) {
                    return optimalPos - offset;
                }
                if (optimalPos + offset < len && 'aeiouáéíóú'.includes(w[optimalPos + offset]?.toLowerCase())) {
                    return optimalPos + offset;
                }
            }

            return Math.max(2, Math.min(len - 2, optimalPos));
        }

        return Math.floor(len / 2); // Fallback
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
            {/* SIN RETÍCULA VISUAL - Se elimina completamente para no distraer */}

            {/* Contenedor de palabra con cohesión visual */}
            <div
                className="inline-flex items-baseline relative"
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

            {/* Información de debugging sutil (solo desarrollo) */}
            {import.meta.env.DEV && (
                <div className="absolute bottom-2 right-2 text-xs text-gray-500 opacity-50">
                    ORP: {orpIndex} | Speed: {speed}WPM | Len: {word.length}
                </div>
            )}
        </div>
    );
};

export default SpritzReader;
