import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ThemeSelector from '../components/ThemeSelector';

const TeacherLayout = () => {
    const location = useLocation();
    const { logout } = useAuth();

    const navItems = [
        { path: '/docente', label: 'Dashboard', icon: '📊' },
        { path: '/docente/clases', label: 'Mis Clases', icon: '🏫' },
        { path: '/docente/biblioteca', label: 'Biblioteca', icon: '📚' },
        { path: '/docente/reportes', label: 'Reportes', icon: '📈' },
        { path: '/docente/configuracion', label: 'Configuración', icon: '⚙️' },
    ];

    return (
        <div className="flex h-screen w-full bg-background text-text-main font-sans overflow-hidden transition-colors duration-500">
            {/* Sidebar Wrapper with padding for floating effect */}
            <div className="hidden md:flex p-4 lg:p-6 pr-2">
                <aside className="w-64 bg-sidebar/80 backdrop-blur-2xl border border-border-color shadow-[0_8px_32px_rgba(0,0,0,0.08)] rounded-[2rem] flex flex-col overflow-hidden transition-all duration-300 hover:shadow-[0_12px_48px_rgba(0,0,0,0.12)]">
                    <div className="p-8 border-b border-border-color/50 bg-transparent flex flex-col items-center justify-center">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/30 mb-3 transform transition-transform hover:scale-110 hover:rotate-3 duration-300">
                            <span className="text-2xl text-white">📚</span>
                        </div>
                        <h2 className="text-3xl font-display font-black bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">aLeer</h2>
                        <p className="text-[10px] font-bold text-text-muted tracking-[0.2em] uppercase mt-1">Portal Docente</p>
                    </div>

                    <nav className="flex-1 p-5 space-y-2 overflow-y-auto custom-scrollbar">
                        {navItems.map((item) => (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 group relative overflow-hidden ${location.pathname === item.path
                                        ? 'text-white font-semibold shadow-md shadow-primary/20 translate-x-1'
                                        : 'text-text-muted hover:bg-surface-elevated/50 hover:text-primary hover:translate-x-1'
                                    }`}
                            >
                                {location.pathname === item.path && (
                                    <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent opacity-100 transition-opacity duration-300" />
                                )}
                                <span className="relative z-10 text-xl group-hover:scale-110 transition-transform duration-300">{item.icon}</span>
                                <span className="relative z-10 font-medium tracking-wide">{item.label}</span>
                            </Link>
                        ))}
                    </nav>

                    <div className="p-5 border-t border-border-color/50 bg-transparent">
                        <button onClick={logout} className="w-full flex items-center justify-center gap-3 text-sm font-semibold text-text-muted hover:text-red-500 hover:bg-red-500/10 px-4 py-3.5 rounded-2xl transition-all duration-300 group">
                            <span className="text-lg group-hover:-translate-x-1 transition-transform">🚪</span> 
                            <span>Cerrar Sesión</span>
                        </button>
                    </div>
                </aside>
            </div>

            {/* Main Content */}
            <main className="flex-1 overflow-auto flex flex-col relative">
                {/* Mobile Header (Glassmorphism) */}
                <header className="bg-surface/80 backdrop-blur-xl border-b border-border-color/50 p-4 md:hidden flex justify-between items-center sticky top-0 z-30 shadow-sm transition-colors duration-300">
                    <div className="flex items-center gap-2">
                         <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                            <span className="text-sm text-white">📚</span>
                        </div>
                        <span className="font-display font-black text-xl text-text-main">aLeer Docente</span>
                    </div>
                    <button className="text-text-muted p-2 rounded-xl hover:bg-surface-elevated active:scale-95 transition-all">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16M4 18h16"></path></svg>
                    </button>
                </header>

                {/* Page Content */}
                <div className="p-4 md:p-8 lg:p-10 max-w-7xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default TeacherLayout;
