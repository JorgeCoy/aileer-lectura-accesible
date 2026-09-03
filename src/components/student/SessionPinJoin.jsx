import React, { useState } from 'react';
import FirebaseBackendService from '../../services/FirebaseBackendService';
import StudentDiagnosticRunner from './StudentDiagnosticRunner';

const SessionPinJoin = () => {
    const [pin, setPin] = useState('');
    const [studentName, setStudentName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [activeSessionInfo, setActiveSessionInfo] = useState(null);

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

            setActiveSessionInfo({
                sessionPin: pin.trim(),
                studentName: studentName.trim(),
                sessionTitle: session.sessionTitle,
                classId: session.classId
            });
        } catch (err) {
            console.error("Error al unirse con PIN:", err);
            setError('Ocurrió un error al buscar la sesión. Inténtalo de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    if (activeSessionInfo) {
        return <StudentDiagnosticRunner sessionInfo={activeSessionInfo} />;
    }

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <div className="max-w-md w-full p-8 bg-surface border border-border-color rounded-3xl shadow-xl text-text-main">
                <div className="text-center mb-6">
                    <div className="w-14 h-14 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto mb-3 text-2xl font-bold">
                        🔑
                    </div>
                    <h2 className="text-2xl font-bold text-text-main">Diagnóstico Exprés (3 Min)</h2>
                    <p className="text-xs text-text-muted mt-1">Ingresa el PIN de 6 dígitos proyectado por tu profesor</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl text-sm text-center font-medium">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-semibold mb-2 text-text-main">
                            PIN de la Sesión (6 dígitos)
                        </label>
                        <input
                            type="text"
                            maxLength={6}
                            required
                            value={pin}
                            onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                            placeholder="Ej: 583921"
                            className="w-full text-center text-3xl tracking-widest font-mono py-3 rounded-xl border border-border-color bg-surface-elevated text-text-main focus:ring-2 focus:ring-primary focus:border-primary transition"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold mb-2 text-text-main">
                            Nombre y Apellido del Estudiante
                        </label>
                        <input
                            type="text"
                            required
                            value={studentName}
                            onChange={(e) => setStudentName(e.target.value)}
                            placeholder="Ej: María Gómez"
                            className="w-full px-4 py-3 rounded-xl border border-border-color bg-surface-elevated text-text-main focus:ring-2 focus:ring-primary focus:border-primary transition"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3.5 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl transition shadow-lg shadow-primary/30 disabled:opacity-50"
                    >
                        {loading ? 'Buscando Sesión...' : '🚀 Iniciar Diagnóstico'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default SessionPinJoin;
