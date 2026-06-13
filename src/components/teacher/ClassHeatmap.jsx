import React from 'react';

const ClassHeatmap = ({ classesHealth = [] }) => {
    if (classesHealth.length === 0) {
        return (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center h-full flex flex-col justify-center">
                <p className="text-gray-400 text-sm">No hay datos de clases disponibles.</p>
            </div>
        );
    }

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-full">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span className="text-xl">📊</span> Progreso por Clase
            </h3>
            <div className="space-y-6">
                {classesHealth.map((cls) => (
                    <div key={cls.id}>
                        <div className="flex justify-between items-end mb-1">
                            <span className="font-bold text-gray-700 text-sm">{cls.name}</span>
                            <div className="text-right">
                                <span className="text-xs font-bold text-blue-600">{cls.completionRate}%</span>
                                <span className="text-[10px] text-gray-400 ml-2">
                                    {cls.completedCount}/{cls.totalAssignments} lecturas
                                </span>
                            </div>
                        </div>

                        {/* Heatmap Bar */}
                        <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden flex">
                            {/* We simulate segments for the heatmap effect */}
                            <div
                                className={`h-full transition-all duration-500 ${cls.completionRate > 80 ? 'bg-gradient-to-r from-green-400 to-green-500' :
                                        cls.completionRate > 40 ? 'bg-gradient-to-r from-yellow-400 to-yellow-500' :
                                            'bg-gradient-to-r from-red-400 to-red-500'
                                    }`}
                                style={{ width: `${cls.completionRate}%` }}
                            ></div>
                        </div>

                        {/* Secondary Metric: WPM */}
                        <div className="flex justify-between items-center mt-1">
                            <span className="text-[10px] text-gray-400">Velocidad Promedio</span>
                            <span className={`text-[10px] font-bold ${cls.avgWpm > 200 ? 'text-green-600' :
                                    cls.avgWpm > 150 ? 'text-yellow-600' : 'text-orange-600'
                                }`}>
                                {cls.avgWpm} WPM
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ClassHeatmap;
