import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ThemeSelector from '../components/ThemeSelector';

const StudentLayout = () => {
    const { logout } = useAuth();
    return (
        <div className="min-h-screen bg-background text-text-main font-sans transition-colors duration-300">
            {/* Top Bar */}
            <header className="bg-surface border-b border-border-color px-4 py-3 flex justify-between items-center shadow-sm transition-colors duration-300">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-border-color rounded-full flex items-center justify-center text-primary font-bold">
                        A
                    </div>
                    <span className="font-bold text-text-main">Mi Espacio</span>
                </div>

                <div className="flex items-center gap-4">
                    <ThemeSelector />
                    <button onClick={logout} className="text-sm text-primary hover:text-text-main font-medium transition-colors">
                        Salir
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <main className="p-4 md:p-6 max-w-5xl mx-auto">
                <Outlet />
            </main>
        </div>
    );
};

export default StudentLayout;
