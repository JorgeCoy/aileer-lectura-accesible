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
        <div className="flex h-screen w-full bg-background text-text-main font-sans overflow-hidden transition-colors duration-300">
            {/* Sidebar Wrapper with padding for floating effect */}
            <div className="hidden md:flex p-6 pr-2">
                <aside className="w-64 bg-[var(--bg-sidebar)] border border-border-color shadow-2xl rounded-3xl flex flex-col overflow-hidden transition-all">
                    <div className="p-6 border-b border-border-color bg-transparent">
                        <h2 className="text-2xl font-black text-text-main">aLeer</h2>
                        <p className="text-xs font-semibold text-primary tracking-wider uppercase mt-1">Portal Docente</p>
                    </div>

                    <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                        {navItems.map((item) => (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 ${location.pathname === item.path
                                        ? 'bg-primary text-background shadow-lg translate-x-1'
                                        : 'text-text-muted hover:bg-surface-elevated hover:text-primary hover:scale-[1.02]'
                                    }`}
                            >
                                <span className="text-lg">{item.icon}</span>
                                <span className="font-medium">{item.label}</span>
                            </Link>
                        ))}
                    </nav>

                    <div className="p-4 border-t border-border-color bg-transparent flex flex-col gap-3">
                        <button onClick={logout} className="w-full flex items-center gap-3 text-sm font-medium text-text-muted hover:text-red-500 hover:bg-surface px-4 py-3 rounded-2xl transition-all">
                            <span className="text-lg">🚪</span> Salir del Portal
                        </button>
                    </div>
                </aside>
            </div>

            {/* Main Content */}
            <main className="flex-1 overflow-auto flex flex-col">
                {/* Mobile Header */}
                <header className="bg-surface border-b border-border-color p-4 md:hidden flex justify-between items-center sticky top-0 z-10 shadow-sm">
                    <span className="font-black text-text-main">aLeer Docente</span>
                    <button className="text-text-muted p-2 rounded-lg hover:bg-surface-elevated transition-colors">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
                    </button>
                </header>

                {/* Page Content */}
                <div className="p-4 md:p-8 max-w-7xl mx-auto w-full">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default TeacherLayout;
