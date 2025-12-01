import React, { useContext, useState } from 'react';
import AppContext from '../context/AppContext';
import { GLOBAL_PATHS, STUDY_PLANS } from '../data/studyPlans';
import { LockClosedIcon, StarIcon, CheckCircleIcon, PlayIcon, ChevronDownIcon, ArrowPathIcon } from '@heroicons/react/24/solid';
import { motion, AnimatePresence } from 'framer-motion';

const StudyPlanMap = ({ onStartSession }) => {
    const { userProfile, studyPlan } = useContext(AppContext);
    const [expandedNodeId, setExpandedNodeId] = useState(null);

    // Determine path based on age
    const pathId = userProfile.age <= 12 ? 'kids' : 'adult';
    const pathData = GLOBAL_PATHS[pathId];

    if (!pathData) return <div>Ruta no encontrada</div>;

    const toggleNode = (nodeId) => {
        if (expandedNodeId === nodeId) {
            setExpandedNodeId(null);
        } else {
            setExpandedNodeId(nodeId);
        }
    };

    return (
        <div className="max-w-3xl mx-auto py-8 px-4">
            <div className="relative">
                {/* Vertical Line Background */}
                <div className="absolute left-8 top-4 bottom-4 w-1 bg-gray-200 rounded-full" />

                <div className="space-y-8">
                    {pathData.nodes.map((node, index) => {
                        const isUnlocked = userProfile.xp >= node.requirements.xp;
                        const isCompleted = userProfile.xp >= (pathData.nodes[index + 1]?.requirements.xp || 99999);
                        const isCurrent = isUnlocked && !isCompleted;
                        const isExpanded = expandedNodeId === node.id;

                        // Get modules for this level
                        const levelPlan = STUDY_PLANS[node.level];
                        const modules = levelPlan ? levelPlan.modules : [];

                        return (
                            <div key={node.id} className="relative pl-20">
                                {/* Node Icon / Marker */}
                                <motion.button
                                    onClick={() => isUnlocked && toggleNode(node.id)}
                                    className={`absolute left-0 top-0 w-16 h-16 rounded-full flex items-center justify-center border-4 z-10 transition-all duration-300 ${isCompleted ? 'bg-green-500 border-green-600 shadow-green-200' :
                                            isCurrent ? 'bg-yellow-400 border-yellow-500 shadow-yellow-200 scale-110' :
                                                'bg-gray-300 border-gray-400'
                                        } shadow-lg`}
                                    whileHover={isUnlocked ? { scale: 1.1 } : {}}
                                    whileTap={isUnlocked ? { scale: 0.95 } : {}}
                                >
                                    {isCompleted ? (
                                        <CheckCircleIcon className="w-8 h-8 text-white" />
                                    ) : isUnlocked ? (
                                        <StarIcon className="w-8 h-8 text-white" />
                                    ) : (
                                        <LockClosedIcon className="w-6 h-6 text-gray-500" />
                                    )}
                                </motion.button>

                                {/* Node Content Card */}
                                <motion.div
                                    className={`bg-white rounded-2xl shadow-md border-2 overflow-hidden transition-colors ${isCurrent ? 'border-yellow-400 ring-4 ring-yellow-100' :
                                            isCompleted ? 'border-green-500' : 'border-gray-100'
                                        }`}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    {/* Header */}
                                    <div
                                        className={`p-5 cursor-pointer flex justify-between items-center ${isUnlocked ? 'hover:bg-gray-50' : 'opacity-60'}`}
                                        onClick={() => isUnlocked && toggleNode(node.id)}
                                    >
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-800">{node.title}</h3>
                                            <p className="text-gray-600 text-sm mt-1">{node.description}</p>
                                            {!isUnlocked && (
                                                <p className="text-xs text-red-500 font-bold mt-2">🔒 Requiere {node.requirements.xp} XP</p>
                                            )}
                                        </div>
                                        {isUnlocked && (
                                            <ChevronDownIcon
                                                className={`w-6 h-6 text-gray-400 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
                                            />
                                        )}
                                    </div>

                                    {/* Expanded Modules List */}
                                    <AnimatePresence>
                                        {isExpanded && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                className="border-t border-gray-100 bg-gray-50"
                                            >
                                                <div className="p-4 space-y-3">
                                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Módulos de Entrenamiento</p>
                                                    {modules.map((module, _mIndex) => {
                                                        const moduleProgress = studyPlan.getModuleProgress(node.level, module.id);
                                                        const isModuleCompleted = studyPlan.isModuleCompleted(node.level, module.id);
                                                        const availableSessions = studyPlan.getAvailableSessions(node.level, module.id);
                                                        const totalSessions = moduleProgress.totalSessions;
                                                        const completedSessions = moduleProgress.completedSessions;

                                                        return (
                                                            <div key={module.id} className={`p-4 rounded-xl shadow-sm border flex items-center justify-between transition-all ${
                                                                isModuleCompleted ? 'bg-green-50 border-green-300' : 'bg-white border-gray-200'
                                                            }`}>
                                                                <div className="flex items-center gap-3">
                                                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                                                        isModuleCompleted ? 'bg-green-100 text-green-600' : 'bg-indigo-100 text-indigo-600'
                                                                    }`}>
                                                                        {isModuleCompleted ? (
                                                                            <CheckCircleIcon className="w-6 h-6" />
                                                                        ) : (
                                                                            <module.icon className="w-6 h-6" />
                                                                        )}
                                                                    </div>
                                                                    <div className="flex-1">
                                                                        <h4 className="font-bold text-gray-800 text-sm">{module.title}</h4>
                                                                        <div className="flex items-center gap-2 mt-1">
                                                                            <span className="text-xs text-gray-600">
                                                                                {completedSessions}/{totalSessions} sesiones
                                                                            </span>
                                                                            {isModuleCompleted && (
                                                                                <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-semibold">
                                                                                    Completado
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                        {completedSessions > 0 && !isModuleCompleted && (
                                                                            <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                                                                                <div
                                                                                    className="bg-indigo-500 h-1.5 rounded-full transition-all duration-300"
                                                                                    style={{ width: `${(completedSessions / totalSessions) * 100}%` }}
                                                                                />
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>

                                                                <div className="flex gap-2">
                                                                    {isModuleCompleted ? (
                                                                        <button
                                                                            onClick={() => onStartSession({ planId: node.level, moduleId: module.id, mode: 'reinforce' })}
                                                                            className="px-3 py-2 bg-orange-500 hover:bg-orange-600 text-white text-xs rounded-lg transition-colors flex items-center gap-1"
                                                                        >
                                                                            <ArrowPathIcon className="w-3 h-3" />
                                                                            Reforzar
                                                                        </button>
                                                                    ) : availableSessions > 0 ? (
                                                                        <button
                                                                            onClick={() => onStartSession({ planId: node.level, moduleId: module.id, mode: 'practice' })}
                                                                            className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs rounded-lg transition-colors flex items-center gap-1"
                                                                        >
                                                                            <PlayIcon className="w-3 h-3" />
                                                                            Practicar
                                                                        </button>
                                                                    ) : null}
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default StudyPlanMap;
