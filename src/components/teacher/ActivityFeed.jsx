import React from 'react';

const ActivityFeed = ({ activities = [] }) => {
    if (activities.length === 0) {
        return (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center h-full flex flex-col justify-center">
                <div className="text-4xl mb-2">💤</div>
                <h3 className="text-gray-500 font-medium">Sin actividad reciente</h3>
                <p className="text-gray-400 text-sm">Cuando tus estudiantes lean, aparecerán aquí.</p>
            </div>
        );
    }

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-full">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span className="text-xl">⚡</span> Actividad Reciente
            </h3>
            <div className="space-y-4">
                {activities.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-lg shrink-0">
                            {activity.action === 'completed' ? '🎓' : '👤'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                                {activity.studentName}
                            </p>
                            <p className="text-xs text-gray-500">
                                {activity.action === 'completed' ? (
                                    <>
                                        Completó <span className="font-semibold text-blue-600">{activity.target}</span>
                                    </>
                                ) : (
                                    `Se unió a ${activity.className}`
                                )}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-[10px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                                    {new Date(activity.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                                {activity.wpm > 0 && (
                                    <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                                        {activity.wpm} WPM
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ActivityFeed;
