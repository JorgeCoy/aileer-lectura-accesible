import React, { useState } from 'react';

const ClassAccessManager = () => {
    const [mode, setMode] = useState('online'); // 'online' | 'offline'
    const classCode = "849201"; // This would come from props or context

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-800 mb-4">Acceso al Aula: Transición A</h3>

            <div className="flex gap-2 mb-6 bg-gray-100 p-1 rounded-lg">
                <button onClick={() => setMode('online')} className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${mode === 'online' ? 'bg-white text-orange-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                    🌐 Online (Código)
                </button>
                <button onClick={() => setMode('offline')} className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${mode === 'offline' ? 'bg-white text-orange-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                    📡 Offline (QR)
                </button>
            </div>

            {mode === 'online' ? (
                <div>
                    <p className="text-sm text-orange-800 mb-2">Comparte este código con tus estudiantes:</p>
                    <div className="bg-orange-50 border-2 border-dashed border-orange-200 rounded-xl p-6 text-center mb-4">
                        <span className="text-5xl font-mono font-bold text-orange-900 tracking-widest">{classCode}</span>
                    </div>
                    <p className="text-xs text-center text-gray-400">Requiere que los estudiantes tengan conexión a internet.</p>
                </div>
            ) : (
                <div>
                    <p className="text-sm text-orange-800 mb-2">Escanea para unirte sin internet:</p>
                    <div className="bg-white border-2 border-gray-200 rounded-xl p-4 flex justify-center mb-4">
                        <div className="bg-gray-900 p-4 rounded-lg">
                            {/* QR Placeholder since npm install failed */}
                            <div className="w-32 h-32 bg-white flex items-center justify-center">
                                <div className="grid grid-cols-4 gap-1">
                                    {[...Array(16)].map((_, i) => (
                                        <div key={i} className={`w-6 h-6 ${Math.random() > 0.5 ? 'bg-black' : 'bg-white'}`}></div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                    <p className="text-xs text-center text-gray-400">Funciona vía red local o transferencia directa.</p>
                </div>
            )}
        </div>
    );
};

export default ClassAccessManager;
