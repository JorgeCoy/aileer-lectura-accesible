import React from 'react';

const ProgressChart = ({ history = [] }) => {
    if (!history || history.length < 2) {
        return (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 h-full flex flex-col items-center justify-center text-center">
                <div className="text-4xl mb-2 opacity-30">📊</div>
                <p className="text-gray-500 font-medium">Tu gráfico de progreso aparecerá aquí</p>
                <p className="text-xs text-gray-400">Completa al menos 2 lecturas para ver tu evolución.</p>
            </div>
        );
    }

    // Take last 7 readings
    const data = history.slice(0, 7).reverse(); // Assuming history comes newest first
    const maxWpm = Math.max(...data.map(d => d.wpm), 200); // Scale based on max or at least 200

    return (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 h-full">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span>📈</span> Tu Velocidad (WPM)
            </h3>

            <div className="flex items-end justify-between h-40 gap-2 pt-4">
                {data.map((entry, index) => {
                    const heightPercent = (entry.wpm / maxWpm) * 100;
                    return (
                        <div key={entry.id || index} className="flex flex-col items-center flex-1 group">
                            <div className="relative w-full flex justify-center">
                                {/* Tooltip */}
                                <div className="absolute bottom-full mb-1 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-800 text-white text-xs py-1 px-2 rounded pointer-events-none whitespace-nowrap z-10">
                                    {entry.wpm} WPM
                                </div>
                                {/* Bar */}
                                <div
                                    className="w-full max-w-[30px] bg-indigo-100 rounded-t-lg group-hover:bg-indigo-500 transition-colors relative overflow-hidden"
                                    style={{ height: `${heightPercent}%`, minHeight: '10%' }}
                                >
                                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-300 group-hover:bg-indigo-600"></div>
                                </div>
                            </div>
                            <p className="text-[10px] text-gray-400 mt-2 truncate w-full text-center">
                                {new Date(entry.completedAt).toLocaleDateString(undefined, { day: 'numeric', month: 'numeric' })}
                            </p>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default ProgressChart;
