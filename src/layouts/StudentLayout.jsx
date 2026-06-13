import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const StudentLayout = () => {
    const { logout } = useAuth();
    return (
        <div className="min-h-screen bg-emerald-50 font-sans">
            {/* Top Bar */}
            <header className="bg-white border-b border-emerald-100 px-4 py-3 flex justify-between items-center shadow-sm">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700 font-bold">
                        A
                    </div>
                    <span className="font-bold text-emerald-900">Mi Espacio</span>
                </div>

                <button onClick={logout} className="text-sm text-emerald-600 hover:text-emerald-800 font-medium">
                    Salir
                </button>
            </header>

            {/* Main Content */}
            <main className="p-4 md:p-6 max-w-5xl mx-auto">
                <Outlet />
            </main>
        </div>
    );
};

export default StudentLayout;
