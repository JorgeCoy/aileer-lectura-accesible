import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { UserIcon, AcademicCapIcon } from '@heroicons/react/24/outline';
import { isValidEmail, sanitizeString, isValidRole } from '../../utils/validation';

const RegisterView = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [role, setRole] = useState('student'); // 'student' | 'teacher'
    const [error, setError] = useState('');
    const { register } = useAuth();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        const cleanName = sanitizeString(name, 100);
        const cleanEmail = sanitizeString(email, 150);

        if (!cleanName || cleanName.length < 2) {
            setError('Por favor ingresa un nombre válido de al menos 2 caracteres.');
            return;
        }

        if (!isValidEmail(cleanEmail)) {
            setError('Por favor ingresa un correo electrónico válido.');
            return;
        }

        if (!isValidRole(role)) {
            setError('Por favor selecciona un rol válido.');
            return;
        }

        if (!password || password.length < 6) {
            setError('La contraseña debe tener al menos 6 caracteres.');
            return;
        }

        setIsLoading(true);
        try {
            await register(cleanEmail, password, cleanName, role);
            // Redirigir según el rol
            navigate(role === 'teacher' ? '/docente' : '/estudiante');
        } catch (err) {
            console.error(err);
            setError(`Error: ${err.code || err.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4 text-text-main">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-surface border border-border-color rounded-2xl shadow-xl p-8 w-full max-w-md"
            >
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-text-main mb-2">Crear Cuenta</h1>
                    <p className="text-text-muted">Únete a aLeer hoy mismo</p>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 text-sm text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Selección de Rol */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <button
                            type="button"
                            onClick={() => setRole('student')}
                            className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${role === 'student'
                                ? 'border-primary bg-primary/10 text-primary'
                                : 'border-border-color hover:border-primary/50 text-text-muted'
                                }`}
                        >
                            <UserIcon className="w-8 h-8" />
                            <span className="font-medium">Estudiante</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setRole('teacher')}
                            className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${role === 'teacher'
                                ? 'border-primary bg-primary/10 text-primary'
                                : 'border-border-color hover:border-primary/50 text-text-muted'
                                }`}
                        >
                            <AcademicCapIcon className="w-8 h-8" />
                            <span className="font-medium">Docente</span>
                        </button>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-text-main mb-1">Nombre Completo</label>
                        <input
                            type="text"
                            required
                            className="w-full px-4 py-2 rounded-lg border border-border-color bg-surface-elevated focus:ring-2 focus:ring-primary focus:border-primary text-text-main"
                            placeholder="Juan Pérez"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-text-main mb-1">Correo Electrónico</label>
                        <input
                            type="email"
                            required
                            className="w-full px-4 py-2 rounded-lg border border-border-color bg-surface-elevated focus:ring-2 focus:ring-primary focus:border-primary text-text-main"
                            placeholder="juan@ejemplo.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-text-main mb-1">Contraseña</label>
                        <input
                            type="password"
                            required
                            className="w-full px-4 py-2 rounded-lg border border-border-color bg-surface-elevated focus:ring-2 focus:ring-primary focus:border-primary text-text-main"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3 rounded-lg transition-colors shadow-lg shadow-primary/30 disabled:opacity-50"
                    >
                        {isLoading ? 'Creando cuenta...' : 'Registrarse'}
                    </button>
                </form>

                <div className="mt-6 text-center text-sm text-text-muted">
                    ¿Ya tienes cuenta?{' '}
                    <Link to="/login" className="text-primary hover:text-primary/80 font-medium hover:underline">
                        Inicia sesión
                    </Link>
                </div>
            </motion.div>
        </div>
    );
};

export default RegisterView;
