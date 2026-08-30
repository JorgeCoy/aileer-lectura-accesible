import React, { useMemo, useState, useEffect } from 'react';
import { adultThemes } from '../config/themes';
import { analyzeReadability, analyzePreview } from '../utils/readability';
import PreReadingPanel from './PreReadingPanel';

const KeywordHighlighter = ({
    text = "",
    theme = "minimalist",
    fontSize = 24,
    fontFamily = "sans-serif",
    speed = 200,
    isRunning = false
}) => {
    const themeStyle = adultThemes[theme] || adultThemes.minimalist;

    const keywords = useMemo(() => {
        if (!text) return { primary: [], secondary: [] };
        const stats = analyzeReadability(text);
        return {
            primary: (stats?.keywords?.primary || []).map(w => w.toLowerCase()),
            secondary: (stats?.keywords?.secondary || []).map(w => w.toLowerCase())
        };
    }, [text]);

    const previewData = useMemo(() => {
        if (!text) return null;
        return analyzePreview(text);
    }, [text]);

    const [activeTab, setActiveTab] = useState('pre_reading');

    // Sync tab with running state
    useEffect(() => {
        if (isRunning) {
            setActiveTab('reading');
        } else if (activeTab === 'reading') {
            setActiveTab('preview'); // Return to preview after finishing/pausing
        }
    }, [isRunning]);

    // Logic to identify keywords
    const processedWords = useMemo(() => {
        if (!text) return [];
        const words = text.split(/(\s+)/); // Split keeping whitespace

        return words.map((word, index) => {
            const cleanWord = word.replace(/[.,;?!:()"]/g, '').toLowerCase();
            
            // Note: getStem is internal to readability.js, but our candidate extraction there returned the exact words as they appeared in text for highlighting. 
            // We just need to check if they are in the arrays.
            const isPrimary = keywords.primary.includes(cleanWord);
            const isSecondary = keywords.secondary.includes(cleanWord);

            return {
                text: word,
                level: isPrimary ? 'primary' : (isSecondary ? 'secondary' : 'none'),
                isWhitespace: /^\s+$/.test(word)
            };
        });
    }, [text, keywords]);

    // Manejo de Fases de Animación
    const [phase, setPhase] = useState(1);

    useEffect(() => {
        // Reiniciar la animación si cambia el texto o se pausa la lectura (opcional, 
        // pero mejor si se reinicia al detener y volver a empezar, o lo mantenemos en 1 si no ha empezado)
        if (!isRunning) {
            setPhase(1);
            return;
        }

        // Si isRunning es true, disparamos los timers
        // Calcular los tiempos en base a la cantidad real de palabras a leer y la velocidad
        const secondsPerWord = 60 / (speed || 200);
        
        // Damos tiempo para repasar las azules (Top 10 max)
        const primaryWordsCount = keywords.primary.length || 5; 
        const primaryDelayMs = secondsPerWord * primaryWordsCount * 1000;

        // Damos tiempo para leer las blancas (Top 15 max)
        const secondaryWordsCount = keywords.secondary.length || 10;
        const secondaryDelayMs = secondsPerWord * secondaryWordsCount * 1000;

        const t1 = setTimeout(() => setPhase(2), primaryDelayMs);
        const t2 = setTimeout(() => setPhase(3), primaryDelayMs + secondaryDelayMs);

        return () => {
            clearTimeout(t1);
            clearTimeout(t2);
        };
    }, [text, speed, isRunning, keywords]);

    return (
        <div className="w-full h-full flex flex-col">
            {/* Header / Tabs - Solo si no está leyendo activamente */}
            {!isRunning && (
                <div className="flex border-b border-gray-700/50 mb-4 px-8 mt-4 space-x-8">
                    <button
                        onClick={() => setActiveTab('pre_reading')}
                        className={`pb-4 text-sm font-bold uppercase tracking-wider border-b-2 transition-all ${activeTab === 'pre_reading'
                            ? 'border-blue-500 text-blue-400'
                            : 'border-transparent text-gray-400 hover:text-gray-300'
                            }`}
                    >
                        📋 Prelectura
                    </button>
                    <button
                        onClick={() => setActiveTab('preview')}
                        className={`pb-4 text-sm font-bold uppercase tracking-wider border-b-2 transition-all ${activeTab === 'preview'
                            ? 'border-green-500 text-green-400'
                            : 'border-transparent text-gray-400 hover:text-gray-300'
                            }`}
                    >
                        👁️ Vista Previa
                    </button>
                </div>
            )}

            {/* Contenido Principal */}
            {activeTab === 'pre_reading' ? (
                <PreReadingPanel 
                    previewData={previewData}
                    theme={theme}
                    styles={{
                        bg: '', 
                        textMain: 'text-gray-900 dark:text-white', 
                        textMuted: 'text-gray-600 dark:text-gray-400',
                        cardBg: 'bg-white dark:bg-gray-800/50 backdrop-blur-sm',
                        highlight: 'bg-blue-500/20 text-blue-400'
                    }}
                    onStartPreview={() => setActiveTab('preview')}
                    onStartReading={() => { /* Start reading handled by outer component normally */ }}
                />
            ) : (
                <div className="w-full flex-1 max-w-4xl mx-auto p-4 md:p-8 overflow-y-auto custom-scrollbar">
                    <div
                className="leading-relaxed text-justify"
                style={{
                    fontFamily: fontFamily,
                    fontSize: `${fontSize}px`
                }}
            >
                {processedWords.map((item, idx) => {
                    let spanClasses = 'transition-all duration-300 ';
                    let spanStyles = { borderRadius: '4px' };

                    // Ocultamos todo excepto el nivel primario inicialmente
                    let currentOpacity = 0;

                    if (item.level === 'primary' && !item.isWhitespace) {
                        spanClasses += 'font-extrabold inline-block transform hover:scale-105 cursor-default';
                        spanStyles.color = themeStyle.highlight;
                        spanStyles.padding = '0 2px';
                        spanStyles.backgroundColor = `${themeStyle.highlight}20`;
                        currentOpacity = 1; // Nivel 1: Siempre visible desde Fase 1
                    } else if (item.level === 'secondary' && !item.isWhitespace) {
                        spanClasses += 'font-bold cursor-default';
                        spanStyles.color = themeStyle.textColor;
                        currentOpacity = phase >= 2 ? 1 : 0; // Nivel 2: Visible en Fase 2 y 3
                    } else {
                        spanClasses += 'font-normal blur-[0.3px]';
                        spanStyles.color = themeStyle.textColor;
                        currentOpacity = phase === 3 ? 0.4 : 0; // Nivel 3 (Texto Base): Visible solo en Fase 3
                        
                        // Efecto cascada de barrido para la Fase 3
                        if (phase === 3) {
                            spanStyles.transitionDelay = `${idx * 2}ms`;
                        } else {
                            spanStyles.transitionDelay = '0ms';
                        }
                    }

                    // Forzamos la opacidad para preservar el layout original y evitar saltos (layout shift)
                    spanStyles.opacity = currentOpacity;

                    return (
                        <span key={idx} className={spanClasses} style={spanStyles}>
                            {item.text}
                        </span>
                    );
                })}
            </div>

            <div className="mt-8 text-center text-sm opacity-50" style={{ color: themeStyle.textColor }}>
                <p>Las palabras clave están resaltadas para un escaneo rápido.</p>
            </div>
                </div>
            )}
        </div>
    );
};

export default KeywordHighlighter;
