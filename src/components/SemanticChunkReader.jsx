import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { adultThemes } from '../config/themes';
import { chunkText } from '../utils/textChunker';

const SemanticChunkReader = ({
    text = "", // SemanticChunkReader receives full text, not just current word
    words = [], // Fallback if text is not provided
    currentIndex = 0,
    theme = "minimalist",
    fontSize = 32,
    fontFamily = "sans-serif"
}) => {
    const themeStyle = adultThemes[theme] || adultThemes.minimalist;

    // State for dynamic chunks (rule-based fallback -> neural chunks)
    const [chunks, setChunks] = React.useState([]);
    const [isNeuralLoading, setIsNeuralLoading] = React.useState(false);
    const fullText = text || words.join(' ');
    React.useEffect(() => {
        let active = true;

        // 1. Inmediatamente aplicar el fallback basado en reglas (síncrono)
        const ruleChunks = chunkText(fullText);
        if (active) {
            setChunks(ruleChunks);
        }

        // 2. Intentar aplicar segmentación semántica neuronal asíncrona en background
        async function fetchNeuralChunks() {
            try {
                const { getGlobalServiceContainer } = await import('../patterns/ServiceContainer');
                const container = getGlobalServiceContainer();
                if (container.has('aiService')) {
                    setIsNeuralLoading(true);
                    const aiService = container.resolve('aiService');
                    const neuralChunks = await aiService.fetchSemanticChunks(fullText);
                    if (active && neuralChunks && neuralChunks.length > 0) {
                        setChunks(neuralChunks);
                    }
                }
            } catch (error) {
                console.warn('[SemanticChunkReader] Fallback a reglas activado debido a:', error);
            } finally {
                if (active) {
                    setIsNeuralLoading(false);
                }
            }
        }

        fetchNeuralChunks();

        return () => {
            active = false;
        };
    }, [fullText]);

    // Map the word-based currentIndex to the chunk-based index
    // This is an approximation since the main engine drives by 'words'
    // We need to find which chunk contains the word at currentIndex
    const currentChunkIndex = useMemo(() => {
        if (chunks.length === 0) return 0;
        let wordCount = 0;
        for (let i = 0; i < chunks.length; i++) {
            const chunkWordCount = chunks[i].split(/\s+/).length;
            if (wordCount + chunkWordCount > currentIndex) {
                return i;
            }
            wordCount += chunkWordCount;
        }
        return chunks.length - 1;
    }, [chunks, currentIndex]);

    const currentChunk = chunks[currentChunkIndex] || "";

    return (
        <div className="flex flex-col items-center justify-center w-full h-64 relative overflow-hidden">
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentChunkIndex}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.2 }}
                    className="text-center px-8 max-w-3xl"
                    style={{
                        fontFamily: fontFamily,
                        fontSize: `${fontSize}px`,
                        color: themeStyle.textColor,
                        lineHeight: 1.4
                    }}
                >
                    {currentChunk}
                </motion.div>
            </AnimatePresence>

            {/* Progress Indicator */}
            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1">
                {chunks.map((_, idx) => (
                    <div
                        key={idx}
                        className={`h-1 rounded-full transition-all duration-300 ${idx === currentChunkIndex ? 'w-8 opacity-100' : 'w-2 opacity-30'
                            }`}
                        style={{ backgroundColor: themeStyle.highlight }}
                    />
                ))}
            </div>
        </div>
    );
};

export default SemanticChunkReader;
