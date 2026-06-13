import React from 'react';

const GamificationPanel = ({ gamification }) => {
    if (!gamification) return null;

    const { streak, badges, points, level } = gamification;

    // Calculate progress to next level (every 500 pts)
    const pointsForNextLevel = level * 500;
    const currentLevelPoints = points % 500;
    const progressPercent = (currentLevelPoints / 500) * 100;

    return (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-indigo-100 mb-8">
            <div className="grid md:grid-cols-3 gap-8 items-center">

                {/* Level & Points */}
                <div className="text-center md:text-left">
                    <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                        <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-2xl">
                            ⭐
                        </div>
                        <div>
                            <h3 className="text-sm text-gray-500 font-bold uppercase tracking-wider">Nivel {level}</h3>
                            <p className="text-2xl font-bold text-indigo-900">{points} Puntos</p>
                        </div>
                    </div>
                    {/* Progress Bar */}
                    <div className="w-full bg-gray-100 rounded-full h-2.5 mt-2">
                        <div
                            className="bg-indigo-600 h-2.5 rounded-full transition-all duration-1000"
                            style={{ width: `${progressPercent}%` }}
                        ></div>
                    </div>
                    <p className="text-xs text-gray-400 mt-1 text-right">{currentLevelPoints} / 500 para Nivel {level + 1}</p>
                </div>

                {/* Streak Counter */}
                <div className="flex flex-col items-center justify-center border-l border-r border-gray-100 px-4">
                    <div className={`text-5xl mb-2 transition-transform ${streak > 0 ? 'scale-110 animate-pulse' : 'opacity-30 grayscale'}`}>
                        🔥
                    </div>
                    <div className="text-center">
                        <p className="text-3xl font-black text-orange-500">{streak}</p>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Días Seguidos</p>
                    </div>
                </div>

                {/* Badges Showcase */}
                <div>
                    <h3 className="text-sm text-gray-500 font-bold uppercase tracking-wider mb-3 text-center md:text-left">Insignias</h3>
                    <div className="flex gap-2 justify-center md:justify-start flex-wrap">
                        {badges.map(badge => (
                            <div
                                key={badge.id}
                                className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl border-2 transition-all relative group cursor-help ${badge.unlocked
                                        ? 'bg-yellow-50 border-yellow-200 shadow-sm scale-100'
                                        : 'bg-gray-50 border-gray-100 opacity-40 grayscale scale-90'
                                    }`}
                            >
                                {badge.icon}

                                {/* Tooltip */}
                                <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                                    <p className="font-bold">{badge.name}</p>
                                    <p className="font-normal opacity-80">{badge.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GamificationPanel;
