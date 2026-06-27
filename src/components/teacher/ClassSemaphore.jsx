import React from 'react';

const ClassSemaphore = ({ classesHealth = [], onSelectClass }) => {
    if (classesHealth.length === 0) {
        return (
            <div className="bg-surface border border-border-color shadow-xl shadow-indigo-100/50 p-6 rounded-3xl text-center h-full flex flex-col justify-center">
                <div className="text-4xl mb-2">🏫</div>
                <h3 className="text-text-muted font-bold uppercase tracking-wider text-xs">Sin clases registradas</h3>
            </div>
        );
    }

    // Calcular estado y ordenar (Rojo primero, luego Amarillo, luego Verde)
    const processedClasses = classesHealth.map(cls => {
        let status = 'risk';
        if (cls.completionRate >= 80) status = 'success';
        else if (cls.completionRate >= 50) status = 'warning';
        return { ...cls, status };
    }).sort((a, b) => {
        const scoreA = a.status === 'risk' ? 0 : a.status === 'warning' ? 1 : 2;
        const scoreB = b.status === 'risk' ? 0 : b.status === 'warning' ? 1 : 2;
        return scoreA - scoreB;
    });

    return (
        <div className="bg-surface border border-border-color shadow-xl shadow-indigo-100/50 p-6 rounded-3xl h-full relative flex flex-col">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-black text-text-main flex items-center gap-2">
                    <span className="text-2xl">🚦</span> Semáforo Global (Clases)
                </h3>
            </div>
            
            <div className="overflow-y-auto pr-2 custom-scrollbar flex-1">
                <div className="space-y-3">
                    {processedClasses.map((cls, index) => (
                        <div
                            key={index}
                            onClick={() => onSelectClass && onSelectClass(cls.id)}
                            className="flex items-center justify-between p-4 rounded-2xl bg-surface-elevated border border-border-color hover:bg-surface hover:shadow-md hover:scale-[1.02] cursor-pointer transition-all group"
                        >
                            <div className="flex items-center gap-3">
                                <div className={`w-3 h-3 rounded-full ${cls.status === 'success' ? 'bg-emerald-500 shadow-emerald-200' :
                                    cls.status === 'warning' ? 'bg-amber-500 shadow-amber-200' :
                                        'bg-rose-500 shadow-rose-200'
                                    } shadow-lg`}></div>
                                <div>
                                    <p className="text-sm font-bold text-text-main group-hover:text-primary transition-colors">{cls.name}</p>
                                    <p className="text-xs text-text-muted font-medium">{cls.totalAssignments || 0} lecturas asignadas</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-black text-text-main">{cls.completionRate}%</p>
                                <p className="text-[10px] text-text-muted font-bold uppercase tracking-wider">Completado</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <div className="mt-4 pt-4 border-t border-border-color flex justify-between text-xs font-bold text-text-muted px-2 uppercase tracking-wider">
                <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-emerald-500 shadow-md"></div> Al día</div>
                <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-amber-500 shadow-md"></div> Regular</div>
                <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-rose-500 shadow-md"></div> Riesgo</div>
            </div>
        </div>
    );
};

export default ClassSemaphore;
