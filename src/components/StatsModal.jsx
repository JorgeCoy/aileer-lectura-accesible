import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, TrophyIcon, ClockIcon, BookOpenIcon, BoltIcon } from '@heroicons/react/24/outline';

const StatsModal = ({ isOpen, onClose, stats, achievements }) => {
    if (!isOpen) return null;

    const formatTime = (seconds) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        if (h > 0) return `${h}h ${m}m`;
        return `${m}m`;
    };

    return (
        <AnimatePresence>
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
                    className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden"
                    onClick={e => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white flex justify-between items-center">
                        <h2 className="text-2xl font-bold flex items-center gap-2">
                            <TrophyIcon className="w-8 h-8 text-yellow-300" />
                            Tu Progreso
                        </h2>
                        <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition">
                            <XMarkIcon className="w-6 h-6" />
                        </button>
                    </div>

                    <div className="p-6 md:p-8 overflow-y-auto max-h-[70vh]">
                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                            <div className="bg-blue-50 p-4 rounded-2xl text-center">
                                <BookOpenIcon className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                                <div className="text-2xl font-bold text-gray-800">{stats.totalWords.toLocaleString()}</div>
                                <div className="text-xs text-gray-500 uppercase font-bold">Palabras</div>
                            </div>
                            <div className="bg-purple-50 p-4 rounded-2xl text-center">
                                <ClockIcon className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                                <div className="text-2xl font-bold text-gray-800">{formatTime(stats.totalTime)}</div>
                                <div className="text-xs text-gray-500 uppercase font-bold">Tiempo Total</div>
                            </div>
                            <div className="bg-yellow-50 p-4 rounded-2xl text-center">
                                <BoltIcon className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                                <div className="text-2xl font-bold text-gray-800">{stats.maxSpeed}</div>
                                <div className="text-xs text-gray-500 uppercase font-bold">Max PPM</div>
                            </div>
                            <div className="bg-green-50 p-4 rounded-2xl text-center">
                                <TrophyIcon className="w-8 h-8 text-green-500 mx-auto mb-2" />
                                <div className="text-2xl font-bold text-gray-800">{stats.unlockedAchievements.length}/{achievements.length}</div>
                                <div className="text-xs text-gray-500 uppercase font-bold">Logros</div>
                            </div>
                        </div>

                        {/* Achievements List */}
                        <h3 className="text-xl font-bold text-gray-800 mb-4">Logros</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {achievements.map(ach => {
                                const isUnlocked = stats.unlockedAchievements.includes(ach.id);
                                return (
                                    <div
                                        key={ach.id}
                                        className={`p-4 rounded-2xl border-2 flex items-center gap-4 transition-all ${isUnlocked
                                                ? 'border-yellow-400 bg-yellow-50/50'
                                                : 'border-gray-100 bg-gray-50 opacity-60 grayscale'
                                            }`}
                                    >
                                        <div className="text-4xl">{ach.icon}</div>
                                        <div>
                                            <h4 className={`font-bold ${isUnlocked ? 'text-gray-900' : 'text-gray-500'}`}>
                                                {ach.title}
                                            </h4>
                                            <p className="text-sm text-gray-600">{ach.description}</p>
                                        </div>
                                        {isUnlocked && <div className="ml-auto text-yellow-500">✓</div>}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default StatsModal;
