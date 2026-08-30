import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ThemeSelector from '../components/ThemeSelector';

const StudentLayout = () => {
    const { logout } = useAuth();
    return (
        <div className="min-h-screen bg-background text-text-main font-sans transition-colors duration-500 overflow-hidden flex flex-col relative">
            {/* Background elements for depth */}
            <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-primary/10 to-transparent pointer-events-none -z-10" />

            {/* Top Bar (Glassmorphism) */}
            <header className="bg-surface/80 backdrop-blur-xl border-b border-border-color/50 px-4 py-3 md:px-6 flex justify-between items-center sticky top-0 z-30 shadow-sm transition-colors duration-300">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-primary/20 transform transition-transform hover:scale-105 hover:rotate-3 duration-300 cursor-pointer">
                        <span className="text-xl">🌟</span>
                    </div>
                    <span className="font-display font-black text-2xl bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent hidden sm:block">Mi Espacio</span>
                </div>

                <div className="flex items-center gap-4">
                    <ThemeSelector />
                    <button onClick={logout} className="flex items-center gap-2 text-sm font-semibold text-text-muted hover:text-red-500 hover:bg-red-500/10 px-3 py-2 rounded-lg transition-all duration-300 group">
                        <span className="hidden sm:inline">Salir</span>
                        <span className="text-lg group-hover:translate-x-1 transition-transform">👋</span>
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8 max-w-5xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both">
                <Outlet />
            </main>
        </div>
    );
};

export default StudentLayout;
