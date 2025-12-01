import React, { useState, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, AcademicCapIcon, BookOpenIcon, TrophyIcon, ChevronDownIcon, ChevronUpIcon, LightBulbIcon, ClockIcon, FlagIcon, CheckCircleIcon, ClipboardDocumentCheckIcon } from '@heroicons/react/24/outline';
import ReadingTestModal from './ReadingTestModal';
import AppContext from '../context/AppContext';

const StudyPlansModal = ({ isOpen, onClose }) => {
    const { studyPlan, goToView } = useContext(AppContext);
    const { startPlan } = studyPlan;

    const [expandedSections, setExpandedSections] = useState({});
    const [showTest, setShowTest] = useState(false);
    const [recommendedLevel, setRecommendedLevel] = useState(null);
    const [selectedLevel, setSelectedLevel] = useState(null);

    if (!isOpen) return null;

    const toggleSection = (level, section) => {
        const key = `${level}-${section}`;
        setExpandedSections(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    const handleStartPlan = () => {
        const levelToStart = selectedLevel || recommendedLevel || 'Principiante';
        startPlan(levelToStart);
        onClose();
        goToView('dashboard');
    };

    const studyPlans = [
        {
            level: 'Principiante',
            icon: BookOpenIcon,
            color: 'from-green-500 to-green-600',
            bgColor: 'bg-green-50',
            iconColor: 'text-green-500',
            description: 'Perfecto para quienes están empezando. Enfócate en construir hábitos de lectura sólidos.',
            plan: [
                'Lee por 15-20 minutos diarios',
                'Elige textos simples y familiares',
                'Practica técnicas básicas de velocidad de lectura',
                'Establece metas pequeñas y alcanzables',
                'Registra tu progreso semanalmente'
            ],
            tips: 'Comienza con artículos cortos o libros infantiles adaptados. El objetivo es crear consistencia.',
            detailedInfo: {
                duration: '3-6 meses',
                goal: '200-300 palabras por minuto',
                techniques: ['Lectura en voz alta', 'Seguimiento con dedo', 'Lectura repetida'],
                recommendedBooks: ['Libros infantiles', 'Artículos cortos', 'Revistas simples'],
                challenges: ['Mantener consistencia', 'Evitar distracciones', 'Practicar diariamente'],
                milestones: ['Leer sin mover los labios', 'Comprender el 80% del texto', 'Leer 20 minutos seguidos']
            }
        },
        {
            level: 'Intermedio',
            icon: AcademicCapIcon,
            color: 'from-blue-500 to-blue-600',
            bgColor: 'bg-blue-50',
            iconColor: 'text-blue-500',
            description: 'Para lectores con experiencia básica. Desarrolla técnicas avanzadas y aumenta la velocidad.',
            plan: [
                'Lee por 30-45 minutos diarios',
                'Practica con textos de complejidad media',
                'Experimenta con técnicas como el previewing',
                'Trabaja en la comprensión lectora',
                'Aumenta gradualmente la velocidad'
            ],
            tips: 'Enfócate en eliminar subvocalización y expandir el campo visual. Usa textos académicos o novelas.',
            detailedInfo: {
                duration: '6-12 meses',
                goal: '400-600 palabras por minuto',
                techniques: ['Previewing', 'Chunking', 'Eliminación de subvocalización'],
                recommendedBooks: ['Novelas', 'Artículos académicos', 'Libros de no ficción'],
                challenges: ['Eliminar hábitos lentos', 'Mejorar concentración', 'Aumentar vocabulario'],
                milestones: ['Leer grupos de palabras', 'Comprender el 90% del texto', 'Leer 45 minutos seguidos']
            }
        },
        {
            level: 'Avanzado',
            icon: TrophyIcon,
            color: 'from-purple-500 to-purple-600',
            bgColor: 'bg-purple-50',
            iconColor: 'text-purple-500',
            description: 'Para lectores experimentados que buscan perfeccionar sus habilidades y alcanzar velocidades óptimas.',
            plan: [
                'Lee por 45-60 minutos diarios',
                'Trabaja con textos técnicos y académicos complejos',
                'Domina técnicas avanzadas de velocidad',
                'Practica la lectura fotográfica',
                'Mantén y mejora la comprensión'
            ],
            tips: 'Concéntrate en textos científicos, legales o técnicos. El objetivo es leer a 800+ palabras por minuto con alta comprensión.',
            detailedInfo: {
                duration: '12+ meses',
                goal: '800+ palabras por minuto',
                techniques: ['Lectura fotográfica', 'Lectura periférica', 'Técnicas de memoria'],
                recommendedBooks: ['Textos científicos', 'Documentos legales', 'Libros técnicos especializados'],
                challenges: ['Mantener alta comprensión', 'Lectura de textos complejos', 'Velocidad máxima'],
                milestones: ['Lectura fotográfica fluida', 'Comprensión del 95%+', 'Lectura de 1000+ ppm']
            }
        }
    ];

    return (
        <>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                        onClick={onClose}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden"
                            onClick={e => e.stopPropagation()}
                        >
                            {/* Header */}
                            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-2xl font-bold flex items-center gap-2">
                                        <AcademicCapIcon className="w-8 h-8 text-yellow-300" />
                                        Planes de Estudio
                                    </h2>
                                    <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition">
                                        <XMarkIcon className="w-6 h-6" />
                                    </button>
                                </div>
                                <button
                                    onClick={() => setShowTest(true)}
                                    className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-all flex items-center gap-2 text-sm font-medium"
                                >
                                    <ClipboardDocumentCheckIcon className="w-4 h-4" />
                                    Hacer Test de Evaluación
                                </button>
                            </div>

                            <div className="p-4 md:p-6 overflow-y-auto max-h-[70vh]">
                                {/* Intro */}
                                <div className="text-center mb-5">
                                    <p className="text-gray-600 text-lg mb-2">
                                        Elige tu nivel de experiencia para obtener un plan de estudio personalizado
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        Cada plan está diseñado para ayudarte a mejorar tu velocidad de lectura de manera progresiva
                                    </p>
                                </div>

                                {/* Study Plans Grid */}
                                <div className="grid md:grid-cols-3 gap-4">
                                    {studyPlans.map((plan, index) => {
                                        const isRecommended = recommendedLevel === plan.level;
                                        const isSelected = selectedLevel === plan.level;

                                        return (
                                            <motion.div
                                                key={plan.level}
                                                onClick={() => setSelectedLevel(plan.level)}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{
                                                    opacity: 1,
                                                    y: 0,
                                                    scale: isSelected || isRecommended ? 1.02 : 1,
                                                    borderColor: isSelected ? '#4F46E5' : isRecommended ? '#10B981' : '#E5E7EB',
                                                    borderWidth: isSelected || isRecommended ? 2 : 1
                                                }}
                                                transition={{ delay: index * 0.1 }}
                                                className={`${plan.bgColor} cursor-pointer rounded-2xl p-4 relative hover:shadow-lg transition-shadow ${isSelected ? 'shadow-xl ring-2 ring-indigo-500 ring-offset-2' : ''}`}
                                            >
                                                {isRecommended && (
                                                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-3 py-0.5 rounded-full text-xs font-bold shadow-lg flex items-center gap-1 z-10">
                                                        <CheckCircleIcon className="w-3 h-3" />
                                                        Recomendado
                                                    </div>
                                                )}

                                                {isSelected && !isRecommended && (
                                                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-indigo-600 text-white px-3 py-0.5 rounded-full text-xs font-bold shadow-lg flex items-center gap-1 z-10">
                                                        <CheckCircleIcon className="w-3 h-3" />
                                                        Seleccionado
                                                    </div>
                                                )}

                                                {/* Header */}
                                                <div className={`bg-gradient-to-r ${plan.color} rounded-xl p-3 text-white mb-3 shadow-md`}>
                                                    <div className="flex items-center gap-2">
                                                        <plan.icon className="w-6 h-6" />
                                                        <h3 className="text-lg font-bold">{plan.level}</h3>
                                                    </div>
                                                </div>

                                                {/* Description */}
                                                <p className="text-gray-700 mb-3 text-xs leading-relaxed font-medium">
                                                    {plan.description}
                                                </p>

                                                {/* Plan Details */}
                                                <div className="mb-3">
                                                    <h4 className="font-bold text-gray-900 text-sm mb-2">Tu Plan:</h4>
                                                    <ul className="space-y-1">
                                                        {plan.plan.map((item, idx) => (
                                                            <li key={idx} className="flex items-start gap-2 text-xs text-gray-700">
                                                                <CheckCircleIcon className={`w-3.5 h-3.5 ${plan.iconColor} mt-0.5 flex-shrink-0`} />
                                                                {item}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>

                                                {/* Tips */}
                                                <div className={`p-2.5 rounded-lg bg-white border border-gray-100 shadow-sm mb-3`}>
                                                    <p className="text-xs text-gray-600 italic">
                                                        <span className="font-bold text-yellow-600 not-italic">💡 Tip:</span> {plan.tips}
                                                    </p>
                                                </div>

                                                {/* Interactive Sections */}
                                                <div className="space-y-2">
                                                    {/* Duration & Goals */}
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            toggleSection(plan.level, 'basics');
                                                        }}
                                                        className="w-full flex items-center justify-between p-2.5 bg-white rounded-lg border border-gray-200 hover:border-indigo-300 hover:shadow-sm transition-all group"
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            <div className={`p-1.5 rounded-md ${plan.bgColor} group-hover:bg-indigo-50 transition-colors`}>
                                                                <FlagIcon className={`w-4 h-4 ${plan.iconColor}`} />
                                                            </div>
                                                            <span className="text-xs font-bold text-gray-800">Duración y Metas</span>
                                                        </div>
                                                        {expandedSections[`${plan.level}-basics`] ?
                                                            <ChevronUpIcon className="w-3 h-3 text-gray-400" /> :
                                                            <ChevronDownIcon className="w-3 h-3 text-gray-400" />
                                                        }
                                                    </button>

                                                    <AnimatePresence>
                                                        {expandedSections[`${plan.level}-basics`] && (
                                                            <motion.div
                                                                initial={{ height: 0, opacity: 0 }}
                                                                animate={{ height: 'auto', opacity: 1 }}
                                                                exit={{ height: 0, opacity: 0 }}
                                                                className="overflow-hidden"
                                                            >
                                                                <div className="p-2.5 bg-white/50 border border-gray-100 rounded-lg space-y-2 text-gray-900 mt-1">
                                                                    <div className="flex items-center gap-2 text-xs">
                                                                        <ClockIcon className="w-3.5 h-3.5 text-gray-500" />
                                                                        <span><strong className="text-gray-700">Duración:</strong> {plan.detailedInfo.duration}</span>
                                                                    </div>
                                                                    <div className="flex items-center gap-2 text-xs">
                                                                        <FlagIcon className="w-3.5 h-3.5 text-gray-500" />
                                                                        <span><strong className="text-gray-700">Meta:</strong> {plan.detailedInfo.goal}</span>
                                                                    </div>
                                                                </div>
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>

                                                    {/* Techniques */}
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            toggleSection(plan.level, 'techniques');
                                                        }}
                                                        className="w-full flex items-center justify-between p-2.5 bg-white rounded-lg border border-gray-200 hover:border-indigo-300 hover:shadow-sm transition-all group"
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            <div className={`p-1.5 rounded-md ${plan.bgColor} group-hover:bg-indigo-50 transition-colors`}>
                                                                <LightBulbIcon className={`w-4 h-4 ${plan.iconColor}`} />
                                                            </div>
                                                            <span className="text-xs font-bold text-gray-800">Técnicas</span>
                                                        </div>
                                                        {expandedSections[`${plan.level}-techniques`] ?
                                                            <ChevronUpIcon className="w-3 h-3 text-gray-400" /> :
                                                            <ChevronDownIcon className="w-3 h-3 text-gray-400" />
                                                        }
                                                    </button>

                                                    <AnimatePresence>
                                                        {expandedSections[`${plan.level}-techniques`] && (
                                                            <motion.div
                                                                initial={{ height: 0, opacity: 0 }}
                                                                animate={{ height: 'auto', opacity: 1 }}
                                                                exit={{ height: 0, opacity: 0 }}
                                                                className="overflow-hidden"
                                                            >
                                                                <div className="p-2.5 bg-white/50 border border-gray-100 rounded-lg text-gray-900 mt-1">
                                                                    <ul className="space-y-1">
                                                                        {plan.detailedInfo.techniques.map((technique, idx) => (
                                                                            <li key={idx} className="flex items-center gap-2 text-xs text-gray-600">
                                                                                <div className={`w-1.5 h-1.5 rounded-full ${plan.iconColor.replace('text-', 'bg-')} flex-shrink-0`} />
                                                                                {technique}
                                                                            </li>
                                                                        ))}
                                                                    </ul>
                                                                </div>
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>

                                                    {/* Challenges & Milestones */}
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            toggleSection(plan.level, 'challenges');
                                                        }}
                                                        className="w-full flex items-center justify-between p-2.5 bg-white rounded-lg border border-gray-200 hover:border-indigo-300 hover:shadow-sm transition-all group"
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            <div className={`p-1.5 rounded-md ${plan.bgColor} group-hover:bg-indigo-50 transition-colors`}>
                                                                <TrophyIcon className={`w-4 h-4 ${plan.iconColor}`} />
                                                            </div>
                                                            <span className="text-xs font-bold text-gray-800">Desafíos y Logros</span>
                                                        </div>
                                                        {expandedSections[`${plan.level}-challenges`] ?
                                                            <ChevronUpIcon className="w-3 h-3 text-gray-400" /> :
                                                            <ChevronDownIcon className="w-3 h-3 text-gray-400" />
                                                        }
                                                    </button>

                                                    <AnimatePresence>
                                                        {expandedSections[`${plan.level}-challenges`] && (
                                                            <motion.div
                                                                initial={{ height: 0, opacity: 0 }}
                                                                animate={{ height: 'auto', opacity: 1 }}
                                                                exit={{ height: 0, opacity: 0 }}
                                                                className="overflow-hidden"
                                                            >
                                                                <div className="p-2.5 bg-white/50 border border-gray-100 rounded-lg space-y-2 text-gray-900 mt-1">
                                                                    <div>
                                                                        <h5 className="text-xs font-bold text-red-600 mb-1">Desafíos:</h5>
                                                                        <ul className="space-y-1">
                                                                            {plan.detailedInfo.challenges.map((challenge, idx) => (
                                                                                <li key={idx} className="flex items-center gap-2 text-[10px] text-gray-600">
                                                                                    <div className="w-1 h-1 rounded-full bg-red-400 flex-shrink-0" />
                                                                                    {challenge}
                                                                                </li>
                                                                            ))}
                                                                        </ul>
                                                                    </div>
                                                                    <div>
                                                                        <h5 className="text-xs font-bold text-green-600 mb-1">Hitos:</h5>
                                                                        <ul className="space-y-1">
                                                                            {plan.detailedInfo.milestones.map((milestone, idx) => (
                                                                                <li key={idx} className="flex items-center gap-2 text-[10px] text-gray-600">
                                                                                    <div className="w-1 h-1 rounded-full bg-green-400 flex-shrink-0" />
                                                                                    {milestone}
                                                                                </li>
                                                                            ))}
                                                                        </ul>
                                                                    </div>
                                                                </div>
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </div>

                                {/* Footer */}
                                <div className="mt-6 text-center">
                                    <p className="text-gray-500 text-xs mb-3">
                                        Recuerda: La mejora en la velocidad de lectura requiere práctica consistente.
                                        ¡Sé paciente y celebra tus progresos!
                                    </p>
                                    <button
                                        onClick={handleStartPlan}
                                        className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:shadow-lg transition-all hover:scale-105"
                                    >
                                        {selectedLevel ? `Empezar Plan ${selectedLevel}` : '¡Empezar a Practicar!'}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Reading Test Modal */}
            <AnimatePresence>
                <ReadingTestModal
                    isOpen={showTest}
                    onClose={() => setShowTest(false)}
                    onComplete={(results) => {
                        setShowTest(false);
                        setRecommendedLevel(results.recommendedLevel);
                        setSelectedLevel(results.recommendedLevel);
                    }}
                />
            </AnimatePresence>
        </>
    );
};

export default StudyPlansModal;
