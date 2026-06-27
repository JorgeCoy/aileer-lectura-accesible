import React from 'react';

const InsightsPanel = ({ insights = [], onDismiss, onDismissAll }) => {
    // Determine alerts vs positive insights
    const riskAlerts = insights.filter(i => i.type === 'risk' || i.type === 'alert');
    const positiveInsights = insights.filter(i => i.type === 'success' || i.type === 'trend' || i.type === 'kudos');

    return (
        <div className="flex flex-col bg-surface w-full max-w-sm max-h-[80vh] overflow-hidden">
            {/* Header */}
            <div className="px-4 py-3 border-b border-border-color bg-surface-elevated flex justify-between items-center">
                <h3 className="font-bold text-text-main flex items-center gap-2">
                    <span>🔔</span> Notificaciones
                </h3>
                <span className="bg-primary/20 text-primary text-xs font-bold px-2 py-1 rounded-full">
                    {insights.length} Nuevas
                </span>
            </div>

            {/* List */}
            <div className="overflow-y-auto p-2 custom-scrollbar space-y-2">
                {insights.length === 0 ? (
                    <div className="p-6 text-center text-text-muted">
                        <div className="text-4xl mb-2 opacity-50">✅</div>
                        <p className="text-sm font-medium">Todo al día</p>
                        <p className="text-xs">No hay nuevas alertas</p>
                    </div>
                ) : (
                    <>
                        {/* Positive / AI Insights */}
                        {positiveInsights.map((insight, idx) => (
                            <div key={idx} className="bg-surface-elevated border border-primary/30 p-3 rounded-xl flex gap-3 group hover:shadow-md transition-all relative">
                                {onDismiss && (
                                    <button 
                                        onClick={() => onDismiss(insight.id)}
                                        className="absolute top-2 right-2 text-text-muted hover:text-primary opacity-0 group-hover:opacity-100 transition-opacity"
                                        title="Marcar como leída"
                                    >
                                        ✕
                                    </button>
                                )}
                                <div className="text-2xl mt-1">💡</div>
                                <div>
                                    <h4 className="text-text-main font-bold text-sm mb-1">Insight de la IA</h4>
                                    <p className="text-text-muted text-xs leading-relaxed pr-4">
                                        {insight.text || insight.message || "Tus estudiantes van por buen camino."}
                                    </p>
                                    {(insight.action || insight.text?.includes('riesgo')) && (
                                        <button className="mt-2 text-xs text-primary font-bold hover:underline">
                                            {insight.action || "Ver detalles →"}
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}

                        {/* Risk Alerts */}
                        {riskAlerts.map((alert, idx) => (
                            <div key={idx} className="bg-orange-500/10 border border-orange-500/30 p-3 rounded-xl flex gap-3 group hover:shadow-md transition-all relative">
                                {onDismiss && (
                                    <button 
                                        onClick={() => onDismiss(alert.id)}
                                        className="absolute top-2 right-2 text-text-muted hover:text-orange-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                        title="Marcar como leída"
                                    >
                                        ✕
                                    </button>
                                )}
                                <div className="text-2xl mt-1">⚠️</div>
                                <div>
                                    <h4 className="text-text-main font-bold text-sm mb-1">Atención Requerida</h4>
                                    <p className="text-text-muted text-xs leading-relaxed pr-4">
                                        {alert.text || alert.message}
                                    </p>
                                    {(alert.action || alert.text?.includes('riesgo')) && (
                                        <button className="mt-2 text-xs text-orange-500 font-bold hover:underline">
                                            {alert.action || "Ver estudiantes afectados →"}
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </>
                )}
            </div>
            
            {/* Footer */}
            {insights.length > 0 && (
                <div className="p-2 border-t border-border-color bg-surface-elevated text-center">
                    <button 
                        onClick={onDismissAll}
                        className="text-xs font-bold text-text-muted hover:text-primary transition-colors"
                    >
                        Marcar todas como leídas
                    </button>
                </div>
            )}
        </div>
    );
};

export default InsightsPanel;
