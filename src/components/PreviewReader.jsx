import React, { useMemo, useState, useEffect } from 'react';
import { ChevronLeftIcon, ChevronRightIcon, PlayIcon, PauseIcon, ArrowPathIcon } from '@heroicons/react/24/solid';
import { ReadingTechniqueChain } from '../patterns/ReadingTechniqueHandler';
import { useReadingComponentFactory } from '../patterns/ReadingComponentFactory.jsx';
import HighlightedWord from './HighlightedWord';
import SpritzReader from './SpritzReader';

const PreviewReader = ({
    text,
    theme,
    fontSize,
    fontFamily,
    speed,
    technique,
    isAssignmentMode = false,
    onConfigChange,
    onCancel,
    onConfirm,
    assignmentData
}) => {
    const [currentPage, setCurrentPage] = useState(0);
    const [wordsPerPage, setWordsPerPage] = useState(250);
    const [isReadingMode, setIsReadingMode] = useState(false);
    const [currentWordIndex, setCurrentWordIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);

    const [isCountingDown, setIsCountingDown] = useState(false);
    const [countdownValue, setCountdownValue] = useState(5);

    // Reading mode variables
    const allWords = useMemo(() => {
        return text ? text.split(/\s+/).filter(word => word.length > 0) : [];
    }, [text]);

    // Pagination logic for preview mode
    const pages = useMemo(() => {
        if (!text) return [];
        const words = text.split(/\s+/);
        const chunks = [];
        for (let i = 0; i < words.length; i += wordsPerPage) {
            chunks.push(words.slice(i, i + wordsPerPage));
        }
        return chunks;
    }, [text, wordsPerPage]);

    const currentWords = pages[currentPage] || [];
    const totalPages = pages.length;

    // Use the same component factory as GenericReadingView
    const { renderComponent } = useReadingComponentFactory('preview');

    // Keyword extraction logic with Stop Words (Spanish & English)
    const keywords = useMemo(() => {
        if (!text) return [];
        const words = text.split(/\s+/);
        const uniqueKeywords = new Set();

        const stopWords = new Set([
            // Español
            "el", "la", "los", "las", "un", "una", "unos", "unas", "y", "e", "ni", "o", "u", "pero", "aunque", "mas", "sino", "porque", "pues", "que", "como", "si", "cuando", "donde", "mientras", "a", "ante", "bajo", "cabe", "con", "contra", "de", "desde", "en", "entre", "hacia", "hasta", "para", "por", "segun", "sin", "so", "sobre", "tras", "yo", "tu", "ella", "nosotros", "nosotras", "vosotros", "vosotras", "ellos", "ellas", "me", "te", "se", "nos", "os", "mi", "mis", "tus", "su", "sus", "nuestro", "nuestra", "nuestros", "nuestras", "este", "esta", "estos", "estas", "ese", "esa", "esos", "esas", "aquel", "aquella", "aquellos", "aquellas", "ser", "es", "son", "era", "eran", "fui", "fue", "fueron", "estar", "estoy", "estan", "estaba", "estaban", "estuve", "estuvo", "estuvieron", "tener", "tengo", "tiene", "tienen", "tenia", "tenian", "tuve", "tuvo", "tuvieron", "hacer", "hago", "hace", "hacen", "hacia", "hacian", "hice", "hizo", "hicieron", "muy", "poco", "mucho", "algo", "nada", "todo", "tambien", "tampoco", "ya", "aun", "todavia", "solo", "solamente", "aqui", "ahi", "alli", "alla", "aca", "hoy", "ayer", "manana", "siempre", "nunca", "jamas", "al", "del", "lo", "le", "les", "ha", "han", "he", "has", "hay",
            // English
            "a", "an", "and", "are", "as", "at", "be", "but", "by", "for", "if", "in", "into", "is", "it", "no", "not", "of", "on", "or", "such", "that", "the", "their", "then", "there", "these", "they", "this", "to", "was", "will", "with", "he", "she", "we", "you", "him", "her", "us", "them", "my", "your", "his", "our", "its", "from", "do", "does", "did", "have", "has", "had", "can", "could", "would", "should", "what", "who", "where", "when", "why", "how", "all", "any", "both", "each", "few", "more", "most", "other", "some", "than", "too", "very", "were", "been", "being", "am", "shall", "may", "might", "must", "about", "above", "across", "after", "against", "along", "among", "around", "before", "behind", "below", "beneath", "beside", "between", "beyond", "down", "during", "except", "inside", "near", "off", "out", "outside", "over", "past", "since", "through", "throughout", "under", "until", "up", "upon", "within", "without"
        ]);

        words.forEach(word => {
            const cleanWord = word.replace(/[.,;?!:()"]/g, '');
            const lowerWord = cleanWord.toLowerCase();
            
            // Regla inteligente: ignorar stop words y palabras de 2 letras o menos (ej. "el", "a", "is", "on")
            if (cleanWord.length > 2 && !stopWords.has(lowerWord)) {
                uniqueKeywords.add(cleanWord);
            }
        });
        return Array.from(uniqueKeywords);
    }, [text]);

    const isKeyword = (word) => {
        const cleanWord = word.replace(/[.,;?!:()"]/g, '');
        return keywords.includes(cleanWord);
    };

    // Reading technique renderer - Using GenericReadingView's system
    const renderReadingTechnique = (word, index) => {
        try {
            // Usar Chain of Responsibility para determinar qué componente usar
            const chain = ReadingTechniqueChain.create();
            const componentConfig = chain.handle(technique, {
                words: [word], // Solo la palabra actual para preview
                currentIndex: 0,
                speed,
                theme,
                fontSize,
                fontFamily,
                text: word,
                readingTechnique: technique
            });

            // Si el Chain retorna una configuración, renderizar el componente
            if (componentConfig && componentConfig.component) {
                const { component: Component, props: componentProps } = componentConfig;
                return <Component key={index} {...componentProps} />;
            }

            // Fallback usando la fábrica
            return renderComponent(technique, {
                word: word,
                words: [word],
                currentIndex: 0,
                speed,
                theme,
                fontSize,
                fontFamily,
                text: word,
                technique: technique,
                line: word
            });
        } catch (error) {
            console.warn('Error rendering technique, falling back to basic:', error);
            // Fallback básico
            return (
                <span key={index} className={`inline-block ${styles.highlight}`}>
                    {word}
                </span>
            );
        }
    };

    // ... (existing effects)

    // Countdown logic
    useEffect(() => {
        let timer;
        if (isCountingDown && countdownValue > 0) {
            timer = setTimeout(() => {
                setCountdownValue(prev => prev - 1);
            }, 1000);
        } else if (isCountingDown && countdownValue === 0) {
            setIsCountingDown(false);
            setIsPlaying(true);
        }
        return () => clearTimeout(timer);
    }, [isCountingDown, countdownValue]);

    // Reading mode logic
    useEffect(() => {
        let interval;
        if (isReadingMode && isPlaying && allWords.length > 0) {
            const intervalMs = 60000 / (speed || 200); // Convert WPM to ms
            interval = setInterval(() => {
                setCurrentWordIndex(prev => {
                    if (prev >= allWords.length - 1) {
                        setIsPlaying(false); // Stop playing when reaching the end
                        setIsCountingDown(false);
                        console.log('Reading completed automatically');
                        return prev;
                    }
                    return prev + 1;
                });
            }, intervalMs);
        }
        return () => clearInterval(interval);
    }, [isReadingMode, isPlaying, allWords.length, speed]);

    // Theme styles mapping
    const styles = useMemo(() => {
        switch (theme) {
            case 'minimalist': return { text: 'text-gray-400', highlight: 'text-gray-900 bg-yellow-100 font-bold', bg: 'bg-white', nav: 'bg-gray-100 text-gray-600 hover:bg-gray-200' };
            case 'cinematic': return { text: 'text-gray-500', highlight: 'text-white bg-blue-900/50 font-bold shadow-[0_0_10px_rgba(59,130,246,0.5)]', bg: 'bg-gradient-to-br from-gray-900 to-blue-900', nav: 'bg-white/10 text-white hover:bg-white/20' };
            case 'zen': return { text: 'text-stone-400', highlight: 'text-stone-800 bg-stone-200 font-bold', bg: 'bg-[#f5f5f4]', nav: 'bg-stone-200 text-stone-600 hover:bg-stone-300' };
            case 'professional': return { text: 'text-gray-600', highlight: 'text-blue-900 bg-blue-50 font-bold', bg: 'bg-gray-50', nav: 'bg-blue-100 text-blue-700 hover:bg-blue-200' };
            case 'vintage': return { text: 'text-amber-700', highlight: 'text-amber-900 bg-amber-100 font-bold', bg: 'bg-amber-50', nav: 'bg-amber-200 text-amber-800 hover:bg-amber-300' };
            case 'focus': return { text: 'text-red-600', highlight: 'text-red-900 bg-red-100 font-bold', bg: 'bg-red-50', nav: 'bg-red-200 text-red-700 hover:bg-red-300' };
            case 'ocean': return { text: 'text-blue-600', highlight: 'text-blue-900 bg-blue-100 font-bold', bg: 'bg-blue-50', nav: 'bg-blue-200 text-blue-700 hover:bg-blue-300' };
            case 'sunset': return { text: 'text-orange-600', highlight: 'text-orange-900 bg-orange-100 font-bold', bg: 'bg-orange-50', nav: 'bg-orange-200 text-orange-700 hover:bg-orange-300' };
            default: return { text: 'text-gray-400', highlight: 'text-gray-900 bg-yellow-100 font-bold', bg: 'bg-white', nav: 'bg-gray-100 text-gray-600 hover:bg-gray-200' };
        }
    }, [theme]);


    // Reading mode functions
    const startReading = () => {
        setCurrentWordIndex(0);
        setCountdownValue(5);
        setIsCountingDown(true);
        setIsReadingMode(true);
        setIsPlaying(false); // Wait for countdown
    };

    const pauseReading = () => {
        setIsPlaying(false);
        setIsCountingDown(false);
    };

    const stopReading = () => {
        setIsPlaying(false);
        setIsCountingDown(false);
        setCurrentWordIndex(0);
        setCountdownValue(5);
        // Note: We don't set isReadingMode to false here to keep controls visible
        // User can restart reading without going back to preview mode
    };

    return (
        <div
            className={`w-full h-full flex flex-col ${styles.bg}`}
            style={{ fontFamily }}
        >
            {/* Assignment Configuration Bar - Hidden during active reading */}
            {isAssignmentMode && assignmentData && !isPlaying && (
                <div className="bg-white border-b border-gray-200 p-4 shadow-sm">
                    {/* ... (existing config UI) ... */}
                    <div className="max-w-6xl mx-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-bold text-gray-800">📚 Configurar Asignación</h2>
                            <button
                                onClick={onCancel}
                                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
                            >
                                ✕ Cancelar
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                            {/* Clase */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">📚 Clase</label>
                                {assignmentData.classes.length > 0 ? (
                                    <select
                                        value={assignmentData.selectedClassId}
                                        onChange={(e) => assignmentData.setSelectedClassId(e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-orange-500 outline-none text-gray-900 bg-white"
                                    >
                                        {assignmentData.classes.map(cls => (
                                            <option key={cls.id} value={cls.id}>{cls.name}</option>
                                        ))}
                                    </select>
                                ) : (
                                    <p className="text-red-500 text-sm">No tienes clases creadas</p>
                                )}
                            </div>

                            {/* Fecha límite */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">📅 Fecha Límite (Opcional)</label>
                                <input
                                    type="date"
                                    value={assignmentData.dueDate}
                                    onChange={(e) => assignmentData.setDueDate(e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg p-2 text-sm text-gray-900 bg-white"
                                />
                            </div>

                            {/* Tema */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">🎨 Tema Visual</label>
                                <select
                                    value={assignmentData.currentTheme || assignmentData.config.theme}
                                    onChange={(e) => {
                                        const newConfig = { ...assignmentData.config, theme: e.target.value };
                                        console.log('🎨 Changing theme to:', e.target.value, 'New config:', newConfig);
                                        onConfigChange(newConfig);
                                    }}
                                    className="w-full border border-gray-300 rounded-lg p-2 text-sm text-gray-900 bg-white"
                                >
                                    <option value="minimalist">Minimalista</option>
                                    <option value="cinematic">Cinematográfico</option>
                                    <option value="zen">Zen</option>
                                    <option value="professional">Profesional</option>
                                    <option value="vintage">Vintage</option>
                                    <option value="focus">Enfoque</option>
                                    <option value="ocean">Océano</option>
                                    <option value="sunset">Atardecer</option>
                                    <option value="forest">Bosque</option>
                                    <option value="cosmic">Cósmico</option>
                                </select>
                            </div>

                            {/* Velocidad */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">⚡ Velocidad (WPM)</label>
                                <input
                                    type="number"
                                    value={assignmentData.currentSpeed || assignmentData.config.speed}
                                    onChange={(e) => {
                                        const newConfig = { ...assignmentData.config, speed: Number(e.target.value) };
                                        console.log('⚡ Changing speed to:', e.target.value, 'New config:', newConfig);
                                        onConfigChange(newConfig);
                                    }}
                                    className="w-full border border-gray-300 rounded-lg p-2 text-sm text-gray-900 bg-white"
                                    min="50"
                                    max="1000"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            {/* Técnica */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">🛠️ Técnica de Lectura</label>
                                <select
                                    value={assignmentData.currentTechnique || assignmentData.config.technique}
                                    onChange={(e) => {
                                        const newConfig = { ...assignmentData.config, technique: e.target.value };
                                        console.log('🛠️ Changing technique to:', e.target.value, 'New config:', newConfig);
                                        onConfigChange(newConfig);
                                    }}
                                    className="w-full border border-gray-300 rounded-lg p-2 text-sm text-gray-900 bg-white"
                                >
                                    <option value="highlight">Resaltado (Básico)</option>
                                    <option value="singleWord">Una palabra (RSVP)</option>
                                    <option value="bionic">Lectura Biónica</option>
                                    <option value="spritz">Spritz (Meta-guide)</option>
                                    <option value="chunking">Chunking (Grupos)</option>
                                    <option value="lineFocus">Línea por Puntos</option>
                                    <option value="paragraphFocus">Enfoque en Párrafos</option>
                                    <option value="saccade">Entrenamiento Sacádico</option>
                                    <option value="preview">Previewing (Palabras Clave)</option>
                                    <option value="cloze">Ejercicio Cloze (Memoria)</option>
                                </select>
                            </div>

                            {/* Tamaño de fuente */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">📏 Tamaño de Fuente</label>
                                <input
                                    type="number"
                                    value={assignmentData.currentFontSize || assignmentData.config.fontSize}
                                    onChange={(e) => {
                                        const newConfig = { ...assignmentData.config, fontSize: Number(e.target.value) };
                                        console.log('📏 Changing fontSize to:', e.target.value, 'New config:', newConfig);
                                        onConfigChange(newConfig);
                                    }}
                                    className="w-full border border-gray-300 rounded-lg p-2 text-sm text-gray-900 bg-white"
                                    min="12"
                                    max="48"
                                />
                            </div>
                        </div>

                        {/* Botón confirmar */}
                        <div className="flex justify-end">
                            <button
                                onClick={onConfirm}
                                disabled={!assignmentData.selectedClassId}
                                className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                            >
                                ✅ Confirmar Asignación
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Top Controls Bar */}
            <div className="flex justify-between items-center p-4 border-b border-gray-200/10">
                <div className="flex gap-2">
                    <button
                        onClick={() => setIsReadingMode(false)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition ${!isReadingMode
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                    >
                        👁️ Vista Previa
                    </button>
                    <button
                        onClick={() => setIsReadingMode(true)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition ${isReadingMode
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                    >
                        ⚡ Modo Lectura
                    </button>
                </div>

                {isReadingMode && !isAssignmentMode && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span>{speed || 200} WPM</span>
                        <span>•</span>
                        <span className="font-medium text-blue-600">{technique || 'singleWord'}</span>
                        <span>•</span>
                        <span>{fontSize || 18}px</span>
                    </div>
                )}
            </div>

            {/* Reading Mode */}
            {isReadingMode ? (
                <div className="flex-1 flex flex-col relative">
                    {/* Reading Controls */}
                    <div className="flex justify-center items-center p-4 gap-4 z-10 relative">
                        {!isPlaying && !isCountingDown ? (
                            <button
                                onClick={startReading}
                                className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium shadow-lg"
                            >
                                <PlayIcon className="w-5 h-5" />
                                Iniciar Lectura
                            </button>
                        ) : isPlaying ? (
                            <button
                                onClick={pauseReading}
                                className="flex items-center gap-2 px-6 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition font-medium shadow-lg"
                            >
                                <PauseIcon className="w-5 h-5" />
                                Pausar
                            </button>
                        ) : null}

                        <button
                            onClick={stopReading}
                            className="flex items-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition font-medium shadow-lg"
                        >
                            <ArrowPathIcon className="w-5 h-5" />
                            Reiniciar
                        </button>
                    </div>

                    {/* Reading Area with Countdown */}
                    <div className="flex-1 flex items-center justify-center p-8 relative overflow-hidden">
                        {isCountingDown ? (
                            <div className="flex flex-col items-center justify-center p-12 rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl animate-in fade-in zoom-in duration-300">
                                <span
                                    className="text-8xl md:text-9xl font-black leading-none text-gray-800"
                                    style={{
                                        filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.1))",
                                    }}
                                >
                                    {countdownValue === 0 ? "¡YA!" : countdownValue}
                                </span>
                                <p className="mt-6 text-2xl md:text-3xl font-bold text-gray-600 tracking-wide">
                                    {countdownValue === 0 ? "¡A LEER!" : "Prepárate..."}
                                </p>
                            </div>
                        ) : (
                            <div className="text-center w-full max-w-4xl">
                                {allWords.length > 0 ? (
                                    <>
                                        <div
                                            className="mb-4 flex items-center justify-center transition-all duration-300"
                                            style={{ fontFamily, minHeight: `${fontSize * 2 + 20}px` }}
                                        >
                                            {technique === 'lineFocus' ? (
                                                renderReadingTechnique(allWords[currentWordIndex], currentWordIndex)
                                            ) : (
                                                <div style={{ fontSize: `${fontSize * 2}px` }}>
                                                    {renderReadingTechnique(allWords[currentWordIndex], currentWordIndex)}
                                                </div>
                                            )}
                                        </div>
                                        <div className="text-gray-500 text-sm mt-8">
                                            Palabra {currentWordIndex + 1} de {allWords.length}
                                            <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                                                {technique || 'Resaltado'}
                                            </span>
                                        </div>
                                    </>
                                ) : (
                                    <div className="text-gray-500">No hay texto para leer</div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <>
                    {/* Content Area */}
                    <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                        <div className="max-w-4xl mx-auto">
                            <div style={{ fontSize: `${fontSize}px`, lineHeight: 1.6 }}>
                                {currentWords.map((word, index) => {
                                    // For preview mode, show basic keyword highlighting + technique preview
                                    const highlight = isKeyword(word);

                                    // Try to use technique component for preview
                                    try {
                                        const chain = ReadingTechniqueChain.create();
                                        const componentConfig = chain.handle(technique, {
                                            words: currentWords,
                                            currentIndex: index,
                                            speed,
                                            theme,
                                            fontSize,
                                            fontFamily,
                                            text: word,
                                            readingTechnique: technique
                                        });

                                        if (componentConfig && componentConfig.component) {
                                            const { component: Component, props: componentProps } = componentConfig;
                                            return <Component key={index} {...componentProps} />;
                                        }
                                    } catch (error) {
                                        // Ignore errors in preview mode
                                    }

                                    // Fallback: basic highlighting
                                    return (
                                        <span
                                            key={index}
                                            className={`inline-block mr-1.5 transition-all duration-300 ${highlight ? styles.highlight + ' px-1 rounded scale-105 transform' : styles.text + ' blur-[0.5px] opacity-70'
                                                }`}
                                        >
                                            {word}
                                        </span>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                        <div className="p-4 border-t border-gray-200/10 flex justify-between items-center max-w-4xl mx-auto w-full">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                                disabled={currentPage === 0}
                                className={`p-2 rounded-full transition-all disabled:opacity-30 disabled:cursor-not-allowed ${styles.nav}`}
                            >
                                <ChevronLeftIcon className="w-6 h-6" />
                            </button>

                            <span className={`text-sm font-medium ${theme === 'minimalist' || theme === 'zen' ? 'text-gray-500' : 'text-gray-400'}`}>
                                Página {currentPage + 1} de {totalPages}
                            </span>

                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
                                disabled={currentPage === totalPages - 1}
                                className={`p-2 rounded-full transition-all disabled:opacity-30 disabled:cursor-not-allowed ${styles.nav}`}
                            >
                                <ChevronRightIcon className="w-6 h-6" />
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default PreviewReader;
