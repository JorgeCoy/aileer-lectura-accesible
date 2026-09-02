import React, { useMemo, useState, useEffect } from 'react';
import { ChevronLeftIcon, ChevronRightIcon, PlayIcon, PauseIcon, ArrowPathIcon } from '@heroicons/react/24/solid';
import { ReadingTechniqueChain } from '../patterns/ReadingTechniqueHandler';
import { useReadingComponentFactory } from '../patterns/ReadingComponentFactory.jsx';
import HighlightedWord from './HighlightedWord';
import SpritzReader from './SpritzReader';
import { analyzeReadability, analyzePreview } from '../utils/readability';
import { clampWpm } from '../utils/validation';

// ============================================
// COMPONENTE PANEL DE PRELECTURA
// ============================================
const PreReadingPanel = ({ previewData, theme, styles, onStartPreview, onStartReading }) => {
    if (!previewData) return null;

    const { textType, readability, scanGuide, narrative, conceptMap, summary, suggestedQuestions } = previewData;

    let headerGradient = 'from-blue-500 to-indigo-600';
    if (textType.type === 'narrative') {
        headerGradient = 'from-pink-500 via-purple-600 to-indigo-500';
    } else if (conceptMap) {
        headerGradient = 'from-indigo-600 via-purple-600 to-pink-600';
    }

    return (
        <div className={`flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar ${styles.bg}`}>
            <div className="max-w-4xl mx-auto space-y-6">
                
                {/* 1. Encabezado Dinámico */}
                <div className={`relative overflow-hidden rounded-3xl bg-gradient-to-r ${headerGradient} p-6 md:p-8 text-white shadow-lg transform hover:scale-[1.005] transition-all duration-300`}>
                    <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-2xl"></div>
                    <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
                    
                    <div className="relative z-10 space-y-3">
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-wider">
                                {textType.name || 'LECTURA'}
                            </span>
                            {readability?.difficulty && (
                                <span className="px-3 py-1 bg-black/15 backdrop-blur-md rounded-full text-[10px] font-bold">
                                    📊 {readability.difficulty}
                                </span>
                            )}
                            <span className="px-3 py-1 bg-black/15 backdrop-blur-md rounded-full text-[10px] font-bold flex items-center gap-1">
                                ⏱️ Est: {scanGuide?.estimatedTime?.formatted || '1m'}
                            </span>
                        </div>
                        
                        <h1 className="text-2xl md:text-3xl font-black leading-tight tracking-tight uppercase">
                            {previewData.structure.title || 'Preparación de Lectura'}
                        </h1>
                        
                        <p className="text-white/80 text-xs md:text-sm max-w-2xl leading-relaxed">
                            {textType.description}
                        </p>
                    </div>
                </div>

                {/* 2. Sección Didáctica Específica */}
                {conceptMap ? (
                    /* RENDER: MAPA CONCEPTUAL */
                    <div className={`rounded-3xl p-6 border ${styles.cardBg} space-y-6`}>
                        <div className="flex items-center gap-3 border-b pb-4 border-gray-200/10">
                            <span className="text-2xl">🗺️</span>
                            <div>
                                <h3 className={`text-base font-black uppercase ${styles.textMain}`}>Mapa Conceptual</h3>
                                <p className={`text-[10px] ${styles.textMuted}`}>Estructura lógica y ejemplos clave para preparar tu lectura</p>
                            </div>
                        </div>

                        <div className="flex flex-col items-center w-full my-4">
                            {/* Concepto Principal */}
                            <div className="bg-purple-600 text-white rounded-2xl px-6 py-4 shadow-lg border border-purple-500 max-w-sm text-center transform hover:scale-[1.02] transition-all">
                                <span className="text-[9px] uppercase tracking-wider text-purple-200 font-bold">Concepto Principal</span>
                                <h4 className="text-lg font-black uppercase mt-0.5">{conceptMap.mainConcept.word}</h4>
                                {conceptMap.mainDefinition && (
                                    <p className="text-xs text-purple-100 mt-2 italic leading-relaxed">
                                        "{conceptMap.mainDefinition.text}"
                                    </p>
                                )}
                            </div>

                            {conceptMap.classifications.length > 0 && (
                                <div className="w-0.5 h-6 bg-purple-400"></div>
                            )}

                            {/* Ramas de Clasificación */}
                            <div className="w-full flex flex-col md:flex-row justify-center gap-6 mt-1">
                                {conceptMap.classifications.map((classification, idx) => (
                                    <div key={idx} className="flex-1 flex flex-col items-center border border-dashed border-purple-300/30 rounded-3xl p-4 bg-purple-50/5 relative">
                                        <div className="bg-indigo-600 text-white px-3 py-1 rounded-xl text-[10px] font-black shadow-md uppercase tracking-wider">
                                            {classification.label}
                                        </div>
                                        <div className="w-0.5 h-4 bg-indigo-400"></div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
                                            {/* Categoría 1 */}
                                            <div className="bg-white/40 dark:bg-slate-900/30 border border-blue-200/30 rounded-2xl p-4 shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
                                                <div>
                                                    <span className="text-[8px] uppercase font-bold text-blue-500 tracking-wider">Clase</span>
                                                    <h5 className={`text-sm font-black capitalize mt-0.5 ${styles.textMain}`}>{classification.category1.name}</h5>
                                                    {classification.category1.definition && (
                                                        <p className={`text-[11px] mt-1 leading-relaxed ${styles.textMuted}`}>
                                                            {classification.category1.definition}
                                                        </p>
                                                    )}
                                                </div>
                                                {classification.category1.name && conceptMap.examples[classification.category1.name] && (
                                                    <div className="mt-3 pt-2.5 border-t border-gray-200/10">
                                                        <span className="text-[8px] uppercase font-bold text-gray-400 block mb-1">Ejemplos</span>
                                                        <div className="flex flex-wrap gap-1">
                                                            {conceptMap.examples[classification.category1.name].slice(0, 4).map((ex, i) => (
                                                                <span key={i} className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 rounded-md text-[9px] font-bold border border-blue-200/10">
                                                                    {ex}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Categoría 2 */}
                                            <div className="bg-white/40 dark:bg-slate-900/30 border border-blue-200/30 rounded-2xl p-4 shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
                                                <div>
                                                    <span className="text-[8px] uppercase font-bold text-blue-500 tracking-wider">Clase</span>
                                                    <h5 className={`text-sm font-black capitalize mt-0.5 ${styles.textMain}`}>{classification.category2.name}</h5>
                                                    {classification.category2.definition && (
                                                        <p className={`text-[11px] mt-1 leading-relaxed ${styles.textMuted}`}>
                                                            {classification.category2.definition}
                                                        </p>
                                                    )}
                                                </div>
                                                {classification.category2.name && conceptMap.examples[classification.category2.name] && (
                                                    <div className="mt-3 pt-2.5 border-t border-gray-200/10">
                                                        <span className="text-[8px] uppercase font-bold text-gray-400 block mb-1">Ejemplos</span>
                                                        <div className="flex flex-wrap gap-1">
                                                            {conceptMap.examples[classification.category2.name].slice(0, 4).map((ex, i) => (
                                                                <span key={i} className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 rounded-md text-[9px] font-bold border border-blue-200/10">
                                                                    {ex}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {conceptMap.characteristics && conceptMap.characteristics.length > 0 && (
                            <div className="mt-4 pt-4 border-t border-gray-200/10 space-y-2">
                                <h5 className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${styles.textMain}`}>
                                    <span>💡</span> Características Clave
                                </h5>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {conceptMap.characteristics.map((char, i) => (
                                        <div key={i} className="flex gap-2 text-xs leading-relaxed items-start">
                                            <span className="text-green-500 mt-0.5">✔</span>
                                            <span className={styles.textMuted}>
                                                <strong>{char.text.split(' ')[0]} {char.text.split(' ')[1] || ''}</strong> {char.detail || char.text}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                ) : textType.type === 'narrative' && narrative ? (
                    /* RENDER: NARRATIVAS */
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Personajes */}
                        <div className={`rounded-3xl p-6 border ${styles.cardBg} md:col-span-2 space-y-4`}>
                            <div className="flex items-center gap-2 border-b pb-3 border-gray-200/10">
                                <span className="text-xl">👥</span>
                                <h3 className={`text-sm font-black uppercase ${styles.textMain}`}>Personajes</h3>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {narrative.characters?.list?.length > 0 ? (
                                    narrative.characters.list.map((char, idx) => (
                                        <div key={idx} className="flex items-center gap-3 bg-white/5 border border-gray-200/5 rounded-2xl p-3 shadow-sm hover:shadow-md transition-all">
                                            <div className={`w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center font-black text-white text-xs bg-gradient-to-tr ${idx === 0 ? 'from-pink-500 to-purple-500' : 'from-indigo-400 to-blue-500'}`}>
                                                {char.name.substring(0, 2).toUpperCase()}
                                            </div>
                                            <div>
                                                <h4 className={`font-bold capitalize text-xs ${styles.textMain}`}>
                                                    {char.name} {char.isMain && <span className="text-[8px] font-bold text-pink-500 bg-pink-500/10 px-1 py-0.5 rounded-full ml-1">Principal</span>}
                                                </h4>
                                                {char.actions.length > 0 && (
                                                    <p className={`text-[9px] mt-0.5 ${styles.textMuted}`}>
                                                        Acción: <span className="italic">{char.actions.slice(0, 2).join(', ')}</span>
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className={`text-xs ${styles.textMuted}`}>Sin personajes explícitos.</div>
                                )}
                            </div>
                        </div>

                        {/* Escenario y Tono */}
                        <div className={`rounded-3xl p-6 border ${styles.cardBg} space-y-4`}>
                            <div className="flex items-center gap-2 border-b pb-3 border-gray-200/10">
                                <span className="text-xl">📍</span>
                                <h3 className={`text-sm font-black uppercase ${styles.textMain}`}>Escenario</h3>
                            </div>
                            <div className="space-y-3 text-xs">
                                <div className="space-y-0.5">
                                    <span className="text-[8px] font-bold text-gray-400 uppercase tracking-wider block">Contexto</span>
                                    <p className={`font-medium ${styles.textMain}`}>
                                        {narrative.setting?.description || 'En algún lugar de la historia...'}
                                    </p>
                                </div>
                                <div className="space-y-0.5">
                                    <span className="text-[8px] font-bold text-gray-400 uppercase tracking-wider block">Tono Emocional</span>
                                    <div className="flex items-center gap-1.5 mt-1">
                                        <span className="text-xl">{narrative.tone?.icon || '⭐'}</span>
                                        <span className={`font-bold text-xs capitalize ${styles.textMain}`}>
                                            {narrative.tone?.type}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Arco de la Historia */}
                        {narrative.keyMoments && narrative.keyMoments.length > 0 && (
                            <div className={`rounded-3xl p-6 border ${styles.cardBg} md:col-span-3 space-y-4`}>
                                <div className="flex items-center gap-2 border-b pb-3 border-gray-200/10">
                                    <span className="text-xl">📈</span>
                                    <h3 className={`text-sm font-black uppercase ${styles.textMain}`}>Arco Narrativo</h3>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
                                    <div className="hidden md:block absolute top-5 left-[16.6%] right-[16.6%] h-0.5 bg-gray-200 dark:bg-slate-700/50 z-0"></div>
                                    {narrative.keyMoments.map((moment, idx) => (
                                        <div key={idx} className="relative z-10 flex flex-col items-center text-center space-y-1.5">
                                            <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-white shadow-md bg-gradient-to-tr ${
                                                moment.type === 'opening' ? 'from-blue-500 to-cyan-400' :
                                                moment.type === 'action' ? 'from-orange-500 to-amber-400' :
                                                'from-green-500 to-emerald-400'
                                            }`}>
                                                {moment.type === 'opening' && '📖'}
                                                {moment.type === 'action' && '⚔️'}
                                                {moment.type === 'closing' && '🏁'}
                                            </div>
                                            <h4 className={`font-black text-[10px] uppercase tracking-wider ${styles.textMain}`}>
                                                {moment.label}
                                            </h4>
                                            <p className={`text-[11px] leading-relaxed max-w-[220px] italic ${styles.textMuted}`}>
                                                "{moment.text}"
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    /* RENDER: EXPOSITIVOS GENERALES */
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Conceptos */}
                        <div className={`rounded-3xl p-6 border ${styles.cardBg} space-y-4`}>
                            <div className="flex items-center gap-2 border-b pb-3 border-gray-200/10">
                                <span className="text-xl">🏷️</span>
                                <h3 className={`text-sm font-black uppercase ${styles.textMain}`}>Palabras Clave</h3>
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                                {(previewData.keywords?.primary || []).slice(0, 5).map((k, i) => (
                                    <span key={i} className="px-2.5 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-700 dark:text-blue-300 rounded-xl text-xs font-bold">
                                        ★ {k}
                                    </span>
                                ))}
                                {(previewData.keywords?.secondary || []).slice(0, 5).map((k, i) => (
                                    <span key={i} className="px-2.5 py-1 bg-gray-500/10 border border-gray-500/10 text-gray-600 dark:text-gray-400 rounded-xl text-xs">
                                        {k}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Ideas Principales */}
                        <div className={`rounded-3xl p-6 border ${styles.cardBg} md:col-span-2 space-y-4`}>
                            <div className="flex items-center gap-2 border-b pb-3 border-gray-200/10">
                                <span className="text-xl">🔑</span>
                                <h3 className={`text-sm font-black uppercase ${styles.textMain}`}>Ideas Principales</h3>
                            </div>
                            <div className="space-y-2.5">
                                {(scanGuide?.sections || []).filter(s => s.type === 'topic_sentence' || s.type === 'introduction').slice(0, 3).map((sec, i) => (
                                    <div key={i} className="flex gap-2 items-start p-2.5 bg-white/5 rounded-xl border border-gray-200/5 text-xs">
                                        <span className="px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-700 dark:text-amber-300 font-bold mt-0.5">Idea</span>
                                        <p className={`leading-relaxed ${styles.textMain}`}>
                                            "{sec.text}"
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* 3. Resumen Previo */}
                {summary && (
                    <div className={`rounded-3xl p-6 border ${styles.cardBg} space-y-2`}>
                        <h3 className={`text-xs font-black uppercase tracking-wider flex items-center gap-1.5 ${styles.textMain}`}>
                            <span>📝</span> Resumen Previo
                        </h3>
                        <p className={`text-xs md:text-sm leading-relaxed ${styles.textMuted}`}>
                            {summary}
                        </p>
                    </div>
                )}

                {/* 4. Preguntas & Tips */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {suggestedQuestions && suggestedQuestions.length > 0 && (
                        <div className={`rounded-3xl p-6 border ${styles.cardBg} space-y-3`}>
                            <h3 className={`text-xs font-black uppercase tracking-wider flex items-center gap-1.5 ${styles.textMain}`}>
                                <span>❓</span> Preguntas para verificar
                            </h3>
                            <div className="space-y-2">
                                {suggestedQuestions.map((q, i) => (
                                    <div key={i} className="flex items-start gap-2 text-xs leading-relaxed">
                                        <span className="font-bold text-purple-500">{i + 1}.</span>
                                        <span className={styles.textMain}>{q}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {scanGuide?.tips && scanGuide.tips.length > 0 && (
                        <div className={`rounded-3xl p-6 border ${styles.cardBg} space-y-3`}>
                            <h3 className={`text-xs font-black uppercase tracking-wider flex items-center gap-1.5 ${styles.textMain}`}>
                                <span>💡</span> Tips de Lectura
                            </h3>
                            <div className="space-y-2">
                                {scanGuide.tips.slice(0, 3).map((tip, i) => (
                                    <div key={i} className="flex items-start gap-2 text-xs leading-relaxed">
                                        <span className="text-yellow-500 font-bold">★</span>
                                        <span className={styles.textMuted}>{tip}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* 5. CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 items-center justify-center pt-4">
                    <button
                        onClick={onStartPreview}
                        className="w-full sm:w-auto px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-xs tracking-wide shadow-md active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                        <span>👁️</span> Realizar Vista Previa (Skimming)
                    </button>
                    <button
                        onClick={onStartReading}
                        className="w-full sm:w-auto px-6 py-3.5 bg-green-600 hover:bg-green-700 text-white rounded-2xl font-black text-xs tracking-wide shadow-md active:scale-95 transition-all flex items-center justify-center gap-2 animate-pulse"
                    >
                        <span>⚡</span> Comenzar Modo Lectura
                    </button>
                </div>

            </div>
        </div>
    );
};


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
    const [activeTab, setActiveTab] = useState('pre_reading');
    const [isReadingMode, setIsReadingMode] = useState(false);
    const [currentWordIndex, setCurrentWordIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);

    const [isCountingDown, setIsCountingDown] = useState(false);
    const [countdownValue, setCountdownValue] = useState(5);

    // Sync isReadingMode to activeTab
    useEffect(() => {
        if (isReadingMode) {
            setActiveTab('reading');
        } else if (activeTab === 'reading') {
            setActiveTab('preview');
        }
    }, [isReadingMode]);


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

    // Full preview data from NLP engine
    const previewData = useMemo(() => {
        if (!text) return null;
        return analyzePreview(text);
    }, [text]);

    // Keyword extraction from previewData
    const keywords = useMemo(() => {
        if (!previewData) return [];
        return (previewData.keywords?.primary || []).map(w => w.toLowerCase());
    }, [previewData]);

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
            const safeWpm = clampWpm(speed || 200, 30, 1200);
            const intervalMs = 60000 / safeWpm; // Convert WPM to ms
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
            case 'minimalist':
                return {
                    text: 'text-gray-400',
                    highlight: 'text-gray-900 bg-yellow-100 font-bold',
                    bg: 'bg-white',
                    nav: 'bg-gray-100 text-gray-600 hover:bg-gray-200',
                    textMain: 'text-gray-900',
                    textMuted: 'text-gray-500',
                    border: 'border-gray-200',
                    cardBg: 'bg-gray-50/85 border-gray-200 shadow-sm',
                    badgeBg: 'bg-blue-100 text-blue-800 border-blue-200',
                    tipBg: 'bg-yellow-50 text-yellow-800 border-yellow-200',
                    accentText: 'text-blue-600',
                    buttonPrimary: 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20'
                };
            case 'cinematic':
                return {
                    text: 'text-slate-400',
                    highlight: 'text-white bg-blue-900/50 font-bold shadow-[0_0_10px_rgba(59,130,246,0.5)]',
                    bg: 'bg-gradient-to-br from-gray-950 via-slate-900 to-indigo-950',
                    nav: 'bg-white/10 text-white hover:bg-white/20',
                    textMain: 'text-white',
                    textMuted: 'text-slate-400',
                    border: 'border-slate-800',
                    cardBg: 'bg-slate-900/60 backdrop-blur-md border-slate-800 shadow-xl shadow-slate-950/20',
                    badgeBg: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
                    tipBg: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
                    accentText: 'text-blue-400',
                    buttonPrimary: 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/40 hover:shadow-blue-500/50'
                };
            case 'zen':
                return {
                    text: 'text-stone-400',
                    highlight: 'text-stone-900 bg-stone-200 font-bold',
                    bg: 'bg-[#f5f5f4]',
                    nav: 'bg-stone-200 text-stone-600 hover:bg-stone-300',
                    textMain: 'text-stone-800',
                    textMuted: 'text-stone-500',
                    border: 'border-stone-200',
                    cardBg: 'bg-stone-100 border-stone-200 shadow-sm',
                    badgeBg: 'bg-stone-200 text-stone-700 border-stone-300',
                    tipBg: 'bg-orange-100/50 text-orange-800 border-orange-200',
                    accentText: 'text-stone-700',
                    buttonPrimary: 'bg-stone-800 hover:bg-stone-700 text-white shadow-lg shadow-stone-800/10'
                };
            case 'professional':
                return {
                    text: 'text-gray-600',
                    highlight: 'text-blue-900 bg-blue-50 font-bold',
                    bg: 'bg-slate-50/80',
                    nav: 'bg-blue-100 text-blue-700 hover:bg-blue-200',
                    textMain: 'text-slate-900',
                    textMuted: 'text-slate-500',
                    border: 'border-slate-200',
                    cardBg: 'bg-white border-slate-200 shadow-sm',
                    badgeBg: 'bg-blue-100 text-blue-800 border-blue-200',
                    tipBg: 'bg-yellow-50 text-yellow-800 border-yellow-200',
                    accentText: 'text-blue-700',
                    buttonPrimary: 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg'
                };
            case 'vintage':
                return {
                    text: 'text-amber-700',
                    highlight: 'text-amber-900 bg-amber-100 font-bold',
                    bg: 'bg-[#f7f2e8]',
                    nav: 'bg-amber-200 text-amber-800 hover:bg-amber-300',
                    textMain: 'text-amber-950',
                    textMuted: 'text-amber-800/70',
                    border: 'border-amber-200',
                    cardBg: 'bg-amber-100/30 border-amber-200 shadow-sm',
                    badgeBg: 'bg-amber-200/50 text-amber-900 border-amber-300/50',
                    tipBg: 'bg-amber-200/30 text-amber-900 border-amber-300/40',
                    accentText: 'text-amber-800',
                    buttonPrimary: 'bg-amber-800 hover:bg-amber-700 text-[#f7f2e8] shadow-lg'
                };
            case 'focus':
                return {
                    text: 'text-red-600',
                    highlight: 'text-red-900 bg-red-100 font-bold',
                    bg: 'bg-red-50/50',
                    nav: 'bg-red-200 text-red-700 hover:bg-red-300',
                    textMain: 'text-red-955',
                    textMuted: 'text-red-800/70',
                    border: 'border-red-200',
                    cardBg: 'bg-white border-red-200/80 shadow-sm',
                    badgeBg: 'bg-red-100 text-red-800 border-red-200',
                    tipBg: 'bg-yellow-50 text-yellow-800 border-yellow-200',
                    accentText: 'text-red-700',
                    buttonPrimary: 'bg-red-700 hover:bg-red-800 text-white shadow-lg'
                };
            case 'ocean':
                return {
                    text: 'text-blue-600',
                    highlight: 'text-blue-900 bg-blue-100 font-bold',
                    bg: 'bg-blue-50/50',
                    nav: 'bg-blue-200 text-blue-700 hover:bg-blue-300',
                    textMain: 'text-blue-955',
                    textMuted: 'text-blue-800/70',
                    border: 'border-blue-200',
                    cardBg: 'bg-white border-blue-200/80 shadow-sm',
                    badgeBg: 'bg-blue-100 text-blue-800 border-blue-200',
                    tipBg: 'bg-yellow-50 text-yellow-800 border-yellow-200',
                    accentText: 'text-blue-700',
                    buttonPrimary: 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg'
                };
            case 'sunset':
                return {
                    text: 'text-orange-600',
                    highlight: 'text-orange-900 bg-orange-100 font-bold',
                    bg: 'bg-orange-50/50',
                    nav: 'bg-orange-200 text-orange-700 hover:bg-orange-300',
                    textMain: 'text-orange-955',
                    textMuted: 'text-orange-850/70',
                    border: 'border-orange-200',
                    cardBg: 'bg-white border-orange-200/80 shadow-sm',
                    badgeBg: 'bg-orange-100 text-orange-800 border-orange-200',
                    tipBg: 'bg-yellow-50 text-yellow-800 border-yellow-200',
                    accentText: 'text-orange-700',
                    buttonPrimary: 'bg-orange-600 hover:bg-orange-700 text-white shadow-lg'
                };
            default:
                return {
                    text: 'text-gray-400',
                    highlight: 'text-gray-900 bg-yellow-100 font-bold',
                    bg: 'bg-white',
                    nav: 'bg-gray-100 text-gray-600 hover:bg-gray-200',
                    textMain: 'text-gray-900',
                    textMuted: 'text-gray-500',
                    border: 'border-gray-200',
                    cardBg: 'bg-gray-50 border-gray-200 shadow-sm',
                    badgeBg: 'bg-blue-100 text-blue-800 border-blue-200',
                    tipBg: 'bg-yellow-50 text-yellow-800 border-yellow-200',
                    accentText: 'text-blue-600',
                    buttonPrimary: 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg'
                };
        }
    }, [theme]);

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
                        onClick={() => {
                            setActiveTab('pre_reading');
                            setIsReadingMode(false);
                        }}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition ${activeTab === 'pre_reading'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                    >
                        📋 Prelectura
                    </button>
                    <button
                        onClick={() => {
                            setActiveTab('preview');
                            setIsReadingMode(false);
                        }}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition ${activeTab === 'preview'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                    >
                        👁️ Vista Previa
                    </button>
                    <button
                        onClick={() => {
                            setActiveTab('reading');
                            setIsReadingMode(true);
                        }}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition ${activeTab === 'reading'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                    >
                        ⚡ Modo Lectura
                    </button>
                </div>

                {activeTab === 'reading' && !isAssignmentMode && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span>{speed || 200} WPM</span>
                        <span>•</span>
                        <span className="font-medium text-blue-600">{technique || 'singleWord'}</span>
                        <span>•</span>
                        <span>{fontSize || 18}px</span>
                    </div>
                )}
            </div>

            {/* Renderizado de Pestañas */}
            {activeTab === 'pre_reading' ? (
                <PreReadingPanel 
                    previewData={previewData}
                    theme={theme}
                    styles={styles}
                    onStartPreview={() => {
                        setActiveTab('preview');
                        setIsReadingMode(false);
                    }}
                    onStartReading={startReading}
                />
            ) : activeTab === 'reading' ? (
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
                                    className="text-8xl md:text-9xl font-black leading-none text-gray-800 dark:text-white"
                                    style={{
                                        filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.1))",
                                    }}
                                >
                                    {countdownValue === 0 ? "¡YA!" : countdownValue}
                                </span>
                                <p className="mt-6 text-2xl md:text-3xl font-bold text-gray-600 dark:text-gray-300 tracking-wide">
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
