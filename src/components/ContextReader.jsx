import React, { useEffect, useRef } from 'react';
import HighlightedWord from './HighlightedWord';
import { adultThemes } from '../config/themes';
import { chunkText, chunkTextForLineFocus } from '../utils/textChunker';

/**
 * COMPONENTE: ContextReader (Ghost Mode)
 * 
 * Propósito:
 * Renderizar el texto completo manteniendo su estructura (párrafos), pero "invisible" (Ghost).
 * Solo la palabra actual se ilumina con la técnica seleccionada.
 * 
 * Props:
 * - text: El texto completo a renderizar.
 * - words: Array de palabras (para sincronizar índice).
 * - currentIndex: Índice de la palabra actual en el array 'words'.
 * - theme: Tema visual seleccionado.
 * - technique: Técnica de lectura a aplicar (Spritz, Bionic, etc.).
 * - fontSize: Tamaño de fuente.
 * - fontFamily: Familia de fuente.
 */
const ContextReader = ({
    text = "",
    words = [],
    currentIndex = 0,
    theme = "minimalist",
    technique = "singleWord",
    fontSize = 24,
    fontFamily = "sans-serif",
    speed = 200
}) => {
    const themeStyle = adultThemes[theme] || adultThemes.minimalist;
    const containerRef = useRef(null);
    const activeWordRef = useRef(null);

    // Auto-scroll para mantener la palabra activa visible
    useEffect(() => {
        if (activeWordRef.current) {
            activeWordRef.current.scrollIntoView({
                behavior: 'smooth',
                block: 'center',
                inline: 'nearest'
            });
        }
    }, [currentIndex]);

    // Procesar el texto para mantener estructura de párrafos
    const paragraphs = text.split(/\n+/).filter(p => p.trim().length > 0);

    // Contador global de chunks para sincronizar con currentIndex
    let globalChunkCounter = 0;

    return (
        <div
            ref={containerRef}
            className="w-full h-full overflow-y-auto p-8 custom-scrollbar"
            style={{
                backgroundColor: themeStyle.bgGradient ? 'transparent' : themeStyle.backgroundColor,
                color: themeStyle.textColor,
                fontFamily: fontFamily === 'dyslexic' ? 'OpenDyslexic, sans-serif' : fontFamily
            }}
        >
            <div className="max-w-4xl mx-auto">
                {paragraphs.map((paragraph, pIndex) => {
                    // Si la técnica es chunking, usamos el chunker. Si no, dividimos por palabras.
                    // PERO: Para mantener consistencia con el índice global 'words' (que viene del hook),
                    // debemos usar la MISMA lógica de división que usó el hook.
                    // El hook usa 'textChunker' si la técnica es 'chunking', o split simple si no.
                    // Para simplificar y garantizar sincronización, asumimos que 'words' es la fuente de la verdad
                    // y tratamos de mapear párrafos a chunks.

                    // Estrategia Robusta:
                    // Usamos chunkText para dividir el párrafo en los mismos chunks que el sistema principal.
                    // Esto garantiza que los índices coincidan.
                    let paragraphChunks = [];
                    if (technique === 'chunking') {
                        paragraphChunks = chunkText(paragraph);
                    } else if (technique === 'lineFocus') {
                        paragraphChunks = chunkTextForLineFocus(paragraph);
                    } else if (technique === 'paragraphFocus') {
                        // Para técnicas de una sola palabra, dividimos por espacios
                        paragraphChunks = paragraph.split(/\s+/).filter(w => w.length > 0);
                    }

                    return (
                        <p
                            key={pIndex}
                            className="mb-6 leading-relaxed text-justify"
                            style={{ fontSize: `${fontSize}px` }}
                        >
                            {paragraphChunks.map((chunk, cIndex) => {
                                const currentGlobalIndex = globalChunkCounter;
                                const isActive = currentGlobalIndex === currentIndex;
                                globalChunkCounter++;

                                return (
                                    <span
                                        key={`${pIndex}-${cIndex}`}
                                        ref={isActive ? activeWordRef : null}
                                        className="inline-block mr-[0.3em] transition-all duration-200"
                                        style={{
                                            opacity: isActive ? 1 : 0.1,
                                            filter: isActive ? 'none' : 'blur(0.5px)',
                                            transform: isActive ? 'scale(1.05)' : 'scale(1)',
                                            fontWeight: isActive ? 'bold' : 'normal',
                                            // CLAVE: inline-block evita que el chunk se parta entre líneas
                                            display: 'inline-block',
                                            whiteSpace: 'nowrap' // Fuerza a que las palabras del chunk no se separen
                                        }}
                                    >
                                        {isActive ? (
                                            <HighlightedWord
                                                word={chunk}
                                                technique={technique}
                                                theme={theme}
                                                fontSize={fontSize}
                                                fontFamily={fontFamily}
                                                isGhostMode={true}
                                                speed={speed}
                                            />
                                        ) : (
                                            chunk
                                        )}
                                    </span>
                                );
                            })}
                        </p>
                    );
                })}
            </div>
        </div>
    );
};

export default ContextReader;
