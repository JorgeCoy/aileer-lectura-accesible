import React, { useState } from 'react';
import MockBackendService from '../../services/MockBackendService';
import { sanitizeString, isValidClassCode } from '../../utils/validation';

const ClassJoin = ({ onJoinSuccess }) => {
    const [method, setMethod] = useState('code'); // 'code' | 'qr'
    const [code, setCode] = useState('');
    const [studentName, setStudentName] = useState('');

    const handleJoin = (e) => {
        e.preventDefault();

        const cleanName = sanitizeString(studentName, 100);
        const cleanCode = sanitizeString(code, 20).toUpperCase();

        if (!cleanName || cleanName.length < 2) {
            alert('❌ Por favor ingresa tu nombre (al menos 2 caracteres).');
            return;
        }

        if (!isValidClassCode(cleanCode)) {
            alert('❌ El código de clase debe tener 6 caracteres alfanuméricos.');
            return;
        }

        const result = MockBackendService.enrollStudent(cleanCode, cleanName);

        if (result.success) {
            alert(`✅ ¡Bienvenido a la clase de ${result.className}!`);
            setCode('');
            setStudentName('');
            if (onJoinSuccess) onJoinSuccess();
        } else {
            alert(`❌ Error: ${result.message}`);
        }
    };

    return (
        <div className="bg-white rounded-3xl p-6 shadow-lg border border-emerald-100 max-w-sm mx-auto w-full">
            <h2 className="text-2xl font-bold text-emerald-900 mb-6 text-center">Unirse a una Clase</h2>

            <div className="flex gap-4 mb-6 justify-center">
                <button
                    onClick={() => setMethod('code')}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all w-32 ${method === 'code'
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-900'
                        : 'border-gray-100 hover:border-emerald-200 text-gray-500'
                        }`}
                >
                    <span className="text-2xl">⌨️</span>
                    <span className="text-sm font-bold">Código</span>
                </button>

                <button
                    onClick={() => setMethod('qr')}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all w-32 ${method === 'qr'
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-900'
                        : 'border-gray-100 hover:border-emerald-200 text-gray-500'
                        }`}
                >
                    <span className="text-2xl">📷</span>
                    <span className="text-sm font-bold">Escanear</span>
                </button>
            </div>

            {method === 'code' ? (
                <form onSubmit={handleJoin} className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Tu Nombre
                        </label>
                        <input
                            type="text"
                            required
                            value={studentName}
                            onChange={(e) => setStudentName(e.target.value)}
                            placeholder="Ej: Juan Pérez"
                            className="w-full border-2 border-gray-200 rounded-xl p-3 focus:border-emerald-500 focus:ring-0 outline-none placeholder-gray-300 text-gray-900"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Código de 6 dígitos
                        </label>
                        <input
                            type="text"
                            maxLength={6}
                            value={code}
                            onChange={(e) => setCode(e.target.value.toUpperCase())}
                            placeholder="EJ: 123456"
                            className="w-full text-center text-3xl font-mono tracking-widest border-2 border-gray-200 rounded-xl p-3 focus:border-emerald-500 focus:ring-0 outline-none uppercase placeholder-gray-300 text-gray-900"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={code.length < 6 || !studentName.trim()}
                        className="w-full bg-emerald-600 text-white font-bold py-3 rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Entrar a Clase
                    </button>
                </form>
            ) : (
                <div className="text-center space-y-4 animate-in fade-in slide-in-from-bottom-2">
                    <div className="bg-black rounded-xl aspect-square flex items-center justify-center text-white/50 relative overflow-hidden">
                        {/* Mock Camera View */}
                        <div className="absolute inset-0 border-2 border-emerald-500/50 m-8 rounded-lg animate-pulse"></div>
                        <p className="text-sm">Cámara simulada</p>
                    </div>
                    <p className="text-sm text-gray-500">
                        Apunta al código QR del profesor
                    </p>
                </div>
            )}
        </div>
    );
};

export default ClassJoin;
