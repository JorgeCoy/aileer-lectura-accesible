import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { UserIcon, AcademicCapIcon } from '@heroicons/react/24/outline';

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
        setIsLoading(true);
        try {
            await register(email, password, name, role);
            // Redirigir según el rol
            navigate(role === 'teacher' ? '/docente' : '/estudiante');
        } catch (err) {
            console.error(err);
            // Mostrar el mensaje exacto de Firebase para depurar
            setError(`Error: ${err.code || err.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md"
            >
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Crear Cuenta</h1>
                    <p className="text-gray-500">Únete a aLeer hoy mismo</p>
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
                                ? 'border-blue-500 bg-blue-50 text-blue-700'
                                : 'border-gray-200 hover:border-blue-200 text-gray-500'
                                }`}
                        >
                            <UserIcon className="w-8 h-8" />
                            <span className="font-medium">Estudiante</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setRole('teacher')}
                            className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${role === 'teacher'
                                ? 'border-purple-500 bg-purple-50 text-purple-700'
                                : 'border-gray-200 hover:border-purple-200 text-gray-500'
                                }`}
                        >
                            <AcademicCapIcon className="w-8 h-8" />
                            <span className="font-medium">Docente</span>
                        </button>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo</label>
                        <input
                            type="text"
                            required
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900"
                            placeholder="Juan Pérez"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico</label>
                        <input
                            type="email"
                            required
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900"
                            placeholder="juan@ejemplo.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
                        <input
                            type="password"
                            required
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-lg transition-colors shadow-lg shadow-purple-500/30 disabled:opacity-50"
                    >
                        {isLoading ? 'Creando cuenta...' : 'Registrarse'}
                    </button>
                </form>

                <div className="mt-6 text-center text-sm text-gray-500">
                    ¿Ya tienes cuenta?{' '}
                    <Link to="/login" className="text-purple-600 hover:text-purple-700 font-medium hover:underline">
                        Inicia sesión
                    </Link>
                </div>
            </motion.div>
        </div>
    );
};

export default RegisterView;
