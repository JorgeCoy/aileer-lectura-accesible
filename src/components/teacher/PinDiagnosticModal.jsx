import React, { useState, useEffect } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../../services/firebase';
import FirebaseBackendService from '../../services/FirebaseBackendService';

const PinDiagnosticModal = ({ isOpen, onClose, teacherUid, classes = [] }) => {
    const [title, setTitle] = useState('Diagnóstico Inicial de Lectura');
    const [selectedClassId, setSelectedClassId] = useState('');
    const [activeSession, setActiveSession] = useState(null);
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Escuchar respuestas en tiempo real de la subcolección de la sesión activa
    useEffect(() => {
        if (!activeSession?.pin) return;

        const submissionsRef = collection(db, 'diagnostic_sessions', activeSession.pin, 'submissions');
        const unsubscribe = onSnapshot(submissionsRef, (snapshot) => {
            const subs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setSubmissions(subs);
        }, (err) => {
            console.error("Error al escuchar respuestas en tiempo real:", err);
        });

        return () => unsubscribe();
    }, [activeSession]);

    if (!isOpen) return null;

    const handleCreateSession = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const session = await FirebaseBackendService.createDiagnosticSession(
                teacherUid,
                selectedClassId || 'express',
                title.trim()
            );
            setActiveSession(session);
            setSubmissions([]);
        } catch (err) {
            console.error("Error al crear sesión por PIN:", err);
            setError("No se pudo generar la sesión de diagnóstico. Inténtalo de nuevo.");
        } finally {
            setLoading(false);
        }
    };

    const handleCloseSession = async () => {
        if (!activeSession) return;
        setLoading(true);
        try {
            await FirebaseBackendService.closeDiagnosticSession(activeSession.pin);
            setActiveSession(null);
            onClose();
        } catch (err) {
            console.error("Error al cerrar sesión de diagnóstico:", err);
            setError("Error al cerrar la sesión.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-surface border border-border-color rounded-3xl shadow-2xl max-w-2xl w-full p-6 sm:p-8 text-text-main">
                
                {/* Encabezado */}
                <div className="flex justify-between items-center pb-4 mb-6 border-b border-border-color">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center font-bold text-xl">
                            🔑
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-text-main">Diagnóstico Exprés por PIN (3 Minutos)</h2>
                            <p className="text-xs text-text-muted">Proyecta el código en el aula para evaluar sin registros previa</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-text-muted hover:text-text-main p-2 rounded-xl hover:bg-surface-elevated transition"
                    >
                        ✕
                    </button>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl text-sm text-center font-medium">
                        {error}
                    </div>
                )}

                {/* Paso 1: Configurar y Crear Sesión */}
                {!activeSession ? (
                    <form onSubmit={handleCreateSession} className="space-y-6">
                        <div>
                            <label className="block text-sm font-semibold mb-2 text-text-main">
                                Título del Diagnóstico Lectores
                            </label>
                            <input
                                type="text"
                                required
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-border-color bg-surface-elevated text-text-main focus:ring-2 focus:ring-primary focus:border-primary transition"
                                placeholder="Ej: Diagnóstico Inicial Lectura 5°A"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold mb-2 text-text-main">
                                Aula / Grupo Destino (Opcional)
                            </label>
                            <select
                                value={selectedClassId}
                                onChange={(e) => setSelectedClassId(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-border-color bg-surface-elevated text-text-main focus:ring-2 focus:ring-primary focus:border-primary transition"
                            >
                                <option value="">Diagnóstico Exprés General (Sin aula asignada)</option>
                                {classes.map((cls) => (
                                    <option key={cls.id} value={cls.id}>
                                        {cls.name} ({cls.grade || 'Grado no especificado'})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="pt-4 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-5 py-2.5 rounded-xl border border-border-color text-text-muted hover:bg-surface-elevated font-medium transition"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold transition shadow-lg shadow-primary/30 disabled:opacity-50"
                            >
                                {loading ? 'Generando PIN...' : '🚀 Generar PIN Proyectable'}
                            </button>
                        </div>
                    </form>
                ) : (
                    /* Paso 2: PIN Proyectable en Pantalla Gigante + Envíos en Tiempo Real */
                    <div className="space-y-6 text-center">
                        <div className="bg-slate-950/90 border border-primary/40 rounded-3xl p-6 shadow-2xl">
                            <p className="text-xs uppercase tracking-widest text-primary font-bold mb-2">
                                📢 Instrucciones para los estudiantes
                            </p>
                            <p className="text-sm text-slate-300 mb-4">
                                Ingresen a <span className="text-white font-bold underline">aleer.app/pin</span> e introduzcan el PIN:
                            </p>
                            <div className="flex justify-center items-center gap-3 my-4">
                                {activeSession.pin.split('').map((num, i) => (
                                    <span
                                        key={i}
                                        className="w-14 h-16 sm:w-16 sm:h-20 bg-primary/20 border-2 border-primary text-primary font-black text-3xl sm:text-4xl rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20 animate-pulse"
                                    >
                                        {num}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Monitor en Tiempo Real */}
                        <div className="bg-surface-elevated border border-border-color rounded-2xl p-4 text-left">
                            <div className="flex justify-between items-center mb-3">
                                <h3 className="text-sm font-bold text-text-main flex items-center gap-2">
                                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
                                    Respuestas Recibidas ({submissions.length})
                                </h3>
                                <span className="text-xs text-text-muted">Actualización automática</span>
                            </div>

                            {submissions.length === 0 ? (
                                <p className="text-xs text-text-muted py-6 text-center italic">
                                    Esperando que los estudiantes envíen sus diagnósticos...
                                </p>
                            ) : (
                                <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
                                    {submissions.map((sub) => (
                                        <div
                                            key={sub.id}
                                            className="flex justify-between items-center p-3 bg-surface rounded-xl border border-border-color text-xs"
                                        >
                                            <div className="font-semibold text-text-main">
                                                👤 {sub.studentName}
                                            </div>
                                            <div className="flex items-center gap-3 font-mono">
                                                <span className="text-emerald-400 font-bold">{sub.wpm || 0} WPM</span>
                                                <span className="text-indigo-400 font-bold">{sub.score || 0}% Comprensión</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Botón de Cierre */}
                        <div className="flex justify-between items-center pt-4 border-t border-border-color">
                            <span className="text-xs text-text-muted">
                                Al cerrar la sesión, los PINs expiran automáticamente.
                            </span>
                            <button
                                onClick={handleCloseSession}
                                disabled={loading}
                                className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition shadow-lg shadow-red-600/30 disabled:opacity-50"
                            >
                                🔒 Finalizar Diagnóstico
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PinDiagnosticModal;
