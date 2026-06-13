import React, { useState } from 'react';

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
                <h1 className="text-2xl font-bold text-gray-900">Configuración</h1>
                <p className="text-gray-500 mt-1">Administra tus preferencias y conexiones con servicios externos.</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">Inteligencia Artificial Avanzada</h2>
                        <p className="text-sm text-gray-500">Conecta una API Key de OpenRouter para generar lecturas con calidad humana de forma instantánea.</p>
                    </div>
                </div>

                <div className="p-6 space-y-4">
                    <div className="flex flex-col gap-2">
                        <label className="block text-sm font-medium text-gray-700">
                            API Key de OpenRouter (Opcional)
                        </label>
                        <input
                            type="text"
                            autoComplete="new-password"
                            value={cloudApiKey}
                            onChange={(e) => setCloudApiKey(e.target.value)}
                            placeholder="sk-or-v1-..."
                            className="w-full px-4 py-2 text-gray-900 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none transition"
                        />
                        <p className="text-xs text-gray-500">
                            Si no configuras una llave, el sistema usará el motor de Inteligencia Artificial local integrado (más lento y básico).
                        </p>
                    </div>

                    <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                        {isSaved ? (
                            <span className="text-green-600 text-sm font-medium flex items-center gap-1">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                </svg>
                                Configuración guardada
                            </span>
                        ) : (
                            <span className="text-gray-400 text-sm">Los cambios requieren guardado manual</span>
                        )}

                        <button
                            onClick={handleSave}
                            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition shadow-sm font-medium"
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
