import React from 'react';

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
                                                    {char.name} {char.isMain && <span className="text-[8px] font-bold text-pink-505 bg-pink-500/10 px-1 py-0.5 rounded-full ml-1">Principal</span>}
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

export default PreReadingPanel;
