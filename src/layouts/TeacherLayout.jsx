import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

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
        <div className="flex h-screen w-full bg-gradient-to-br from-indigo-50 via-slate-50 to-purple-50 font-sans overflow-hidden">
            {/* Sidebar Wrapper with padding for floating effect */}
            <div className="hidden md:flex p-6 pr-2">
                <aside className="w-64 bg-white/70 backdrop-blur-xl border border-white/60 shadow-2xl shadow-indigo-200/40 rounded-3xl flex flex-col overflow-hidden transition-all">
                    <div className="p-6 border-b border-white/40 bg-white/30">
                        <h2 className="text-2xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">aLeer</h2>
                        <p className="text-xs font-semibold text-indigo-400 tracking-wider uppercase mt-1">Portal Docente</p>
                    </div>

                    <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                        {navItems.map((item) => (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 ${location.pathname === item.path
                                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 translate-x-1'
                                        : 'text-slate-600 hover:bg-white/60 hover:text-indigo-600 hover:scale-[1.02] hover:shadow-sm'
                                    }`}
                            >
                                <span className="text-lg">{item.icon}</span>
                                <span className="font-medium">{item.label}</span>
                            </Link>
                        ))}
                    </nav>

                    <div className="p-4 border-t border-white/40 bg-white/20">
                        <button onClick={logout} className="w-full flex items-center gap-3 text-sm font-medium text-slate-500 hover:text-red-500 hover:bg-white/50 px-4 py-3 rounded-2xl transition-all">
                            <span className="text-lg">🚪</span> Salir del Portal
                        </button>
                    </div>
                </aside>
            </div>

            {/* Main Content */}
            <main className="flex-1 overflow-auto flex flex-col">
                {/* Mobile Header */}
                <header className="bg-white/80 backdrop-blur-md border-b border-white/50 p-4 md:hidden flex justify-between items-center sticky top-0 z-10 shadow-sm">
                    <span className="font-black bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">aLeer Docente</span>
                    <button className="text-slate-600 p-2 rounded-lg hover:bg-white/50 transition-colors">
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
