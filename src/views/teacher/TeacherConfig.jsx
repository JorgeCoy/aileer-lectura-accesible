import React, { useState } from 'react';
import ThemeSelector from '../../components/ThemeSelector';

const TeacherConfig = () => {
    const [cloudApiKey, setCloudApiKey] = useState(localStorage.getItem('cloud_api_key') || '');
    const [isSaved, setIsSaved] = useState(false);

    const handleSave = () => {
        if (cloudApiKey.trim()) {
            localStorage.setItem('cloud_api_key', cloudApiKey.trim());
        } else {
            localStorage.removeItem('cloud_api_key');
        }
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 3000);
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-text-main">Configuración</h1>
                <p className="text-text-muted mt-1">Administra tus preferencias y conexiones con servicios externos.</p>
            </div>

            {/* Tema Visual Card */}
            <div className="bg-surface rounded-xl shadow-sm border border-border-color overflow-hidden">
                <div className="p-6 border-b border-border-color flex items-center gap-3">
                    <div className="w-10 h-10 bg-surface-elevated rounded-lg flex items-center justify-center text-primary">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                        </svg>
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-text-main">Apariencia y Tema</h2>
                        <p className="text-sm text-text-muted">Personaliza los colores y el estilo visual del portal.</p>
                    </div>
                </div>
                <div className="p-6">
                    <label className="block text-sm font-medium text-text-muted mb-2">Tema de la Interfaz</label>
                    <div className="max-w-xs">
                        <ThemeSelector />
                    </div>
                </div>
            </div>

            <div className="bg-surface rounded-xl shadow-sm border border-border-color overflow-hidden">
                <div className="p-6 border-b border-border-color flex items-center gap-3">
                    <div className="w-10 h-10 bg-surface-elevated rounded-lg flex items-center justify-center text-primary">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-text-main">Inteligencia Artificial Avanzada</h2>
                        <p className="text-sm text-text-muted">Conecta una API Key de OpenRouter para generar lecturas con calidad humana de forma instantánea.</p>
                    </div>
                </div>

                <div className="p-6 space-y-4">
                    <div className="flex flex-col gap-2">
                        <label className="block text-sm font-medium text-text-muted">
                            API Key de OpenRouter (Opcional)
                        </label>
                        <input
                            type="text"
                            autoComplete="new-password"
                            value={cloudApiKey}
                            onChange={(e) => setCloudApiKey(e.target.value)}
                            placeholder="sk-or-v1-..."
                            className="w-full px-4 py-2 text-text-main bg-surface-elevated border border-border-color rounded-lg focus:ring-2 focus:ring-primary outline-none transition"
                        />
                        <p className="text-xs text-text-muted">
                            Si no configuras una llave, el sistema usará el motor de Inteligencia Artificial local integrado (más lento y básico).
                        </p>
                    </div>

                    <div className="pt-4 border-t border-border-color flex items-center justify-between">
                        {isSaved ? (
                            <span className="text-green-500 text-sm font-medium flex items-center gap-1">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                </svg>
                                Configuración guardada
                            </span>
                        ) : (
                            <span className="text-text-muted text-sm">Los cambios requieren guardado manual</span>
                        )}

                        <button
                            onClick={handleSave}
                            className="px-6 py-2 bg-primary text-white rounded-lg hover:opacity-80 transition shadow-sm font-medium"
                        >
                            Guardar Configuración
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TeacherConfig;
