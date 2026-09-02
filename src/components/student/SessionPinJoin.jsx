import React, { useState } from 'react';
import FirebaseBackendService from '../../services/FirebaseBackendService';

const SessionPinJoin = ({ onStartDiagnostic }) => {
    const [pin, setPin] = useState('');
    const [studentName, setStudentName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (!pin || pin.length !== 6) {
            setError('Ingresa un PIN válido de 6 dígitos.');
            return;
        }

        if (!studentName.trim()) {
            setError('Ingresa tu nombre y apellido.');
            return;
        }

        setLoading(true);
        try {
            const session = await FirebaseBackendService.getDiagnosticSessionByPin(pin.trim());
            if (!session) {
                setError('No se encontró una sesión de diagnóstico activa con este PIN.');
                setLoading(false);
                return;
            }

            // Iniciar prueba diagnóstica de 3 minutos
            if (onStartDiagnostic) {
                onStartDiagnostic({
                    sessionPin: pin.trim(),
                    studentName: studentName.trim(),
                    sessionTitle: session.sessionTitle,
                    classId: session.classId
                });
            }
        } catch (err) {
            console.error("Error al unirse con PIN:", err);
            setError('Ocurrió un error al buscar la sesión. Inténtalo de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto my-8 p-6 bg-surface border border-border-color rounded-2xl shadow-lg">
            <div className="text-center mb-6">
                <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center mx-auto mb-3">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                    </svg>
                </div>
                <h2 className="text-xl font-bold text-text-main">Diagnóstico Exprés (3 Minutos)</h2>
                <p className="text-xs text-text-muted mt-1">Ingresa el PIN de 6 dígitos proyectado por tu profesor</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                    <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-xs rounded-lg">
                        {error}
                    </div>
                )}

                <div>
                    <label className="block text-xs font-bold text-text-muted uppercase mb-1">PIN de la Sesión</label>
                    <input
                        type="text"
                        maxLength="6"
                        value={pin}
                        onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                        placeholder="Ej. 583921"
                        className="w-full text-center text-2xl tracking-widest font-mono py-3 bg-surface-elevated border border-border-color rounded-xl text-text-main focus:ring-2 focus:ring-primary outline-none transition"
                        required
                    />
                </div>

                <div>
                    <label className="block text-xs font-bold text-text-muted uppercase mb-1">Tu Nombre Completo</label>
                    <input
                        type="text"
                        value={studentName}
                        onChange={(e) => setStudentName(e.target.value)}
                        placeholder="Ej. Camila Morales"
                        className="w-full px-4 py-2.5 bg-surface-elevated border border-border-color rounded-xl text-text-main focus:ring-2 focus:ring-primary outline-none transition text-sm"
                        required
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-primary text-white font-semibold rounded-xl hover:opacity-90 transition shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
                >
                    {loading ? (
                        <span>Validando PIN...</span>
                    ) : (
                        <span>Comenzar Prueba Diagnóstica 🚀</span>
                    )}
                </button>
            </form>
        </div>
    );
};

export default SessionPinJoin;
