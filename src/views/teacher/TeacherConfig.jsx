import React, { useState } from 'react';
import ThemeSelector from '../../components/ThemeSelector';

const TeacherConfig = () => {
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
                        <p className="text-sm text-text-muted">Estado del motor de Inteligencia Artificial para generación de lecturas y evaluaciones.</p>
                    </div>
                </div>

                <div className="p-6 space-y-4">
                    <div className="p-4 rounded-lg bg-surface-elevated border border-border-color space-y-2">
                        <span className="text-xs font-bold text-primary uppercase tracking-wider block">🔒 Seguridad de Credenciales</span>
                        <p className="text-sm text-text-main">
                            Las API Keys de OpenRouter se gestionan de forma segura a través de variables de entorno del servidor (<code>VITE_OPENROUTER_API_KEY</code>).
                        </p>
                        <p className="text-xs text-text-muted">
                            Si no se configura una llave de servidor, la aplicación conmuta automáticamente al motor de Inteligencia Artificial Local integrado (HuggingFace Web Worker).
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TeacherConfig;
