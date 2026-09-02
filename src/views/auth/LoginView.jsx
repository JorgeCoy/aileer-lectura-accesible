import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const LoginView = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            await login(email, password);
            navigate('/'); // Redirigir al dashboard principal (App.jsx manejará la redirección por rol)
        } catch (err) {
            console.error(err);
            setError('Error al iniciar sesión. Verifica tus credenciales.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4 text-text-main">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-surface border border-border-color rounded-2xl shadow-xl p-8 w-full max-w-md"
            >
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-text-main mb-2">Bienvenido aLeer</h1>
                    <p className="text-text-muted">Ingresa para continuar aprendiendo</p>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 text-sm text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-text-main mb-2">Correo Electrónico</label>
                        <input
                            type="email"
                            required
                            className="w-full px-4 py-3 rounded-lg border border-border-color bg-surface-elevated text-text-main focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                            placeholder="ejemplo@escuela.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-text-main mb-2">Contraseña</label>
                        <input
                            type="password"
                            required
                            className="w-full px-4 py-3 rounded-lg border border-border-color bg-surface-elevated text-text-main focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3 rounded-lg transition-colors shadow-lg shadow-primary/30 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? 'Iniciando...' : 'Iniciar Sesión'}
                    </button>
                </form>

                <div className="mt-8 text-center text-sm text-text-muted">
                    ¿No tienes cuenta?{' '}
                    <Link to="/register" className="text-primary hover:text-primary/80 font-medium hover:underline">
                        Regístrate aquí
                    </Link>
                </div>

                <div className="mt-6 pt-6 border-t border-border-color text-center">
                    <p className="text-xs text-text-muted mb-3">¿Eres estudiante en una prueba diagnóstica?</p>
                    <Link
                        to="/pin"
                        className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-surface-elevated border border-primary/30 text-primary hover:bg-primary/5 rounded-xl font-medium text-sm transition"
                    >
                        <span>Ingresar con PIN de 6 dígitos 🔑</span>
                    </Link>
                </div>
            </motion.div>
        </div>
    );
};

export default LoginView;
