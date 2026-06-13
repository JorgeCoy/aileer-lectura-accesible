import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MOCK_LIBRARY } from '../../data/mockLibrary';

const StudentLibrary = () => {
    const navigate = useNavigate();

    return (
        <div className="space-y-6">
            <header className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-emerald-900">Biblioteca</h1>
                    <p className="text-emerald-700">Historias para leer hoy</p>
                </div>
                <button
                    onClick={() => navigate('/estudiante')}
                    className="text-emerald-600 hover:bg-emerald-100 px-3 py-1 rounded-lg transition"
                >
                    ← Volver
                </button>
            </header>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {MOCK_LIBRARY.map((book) => (
                    <div
                        key={book.id}
                        onClick={() => navigate(`/estudiante/lectura/${book.id}`)}
                        className="bg-white rounded-2xl p-6 shadow-sm border border-emerald-100 hover:shadow-md hover:border-emerald-300 transition-all cursor-pointer group"
                    >
                        <div className="h-32 bg-emerald-50 rounded-xl mb-4 flex items-center justify-center text-4xl group-hover:scale-105 transition-transform">
                            {book.category === 'Fábula' ? '🐸' : book.category === 'Mito' ? '🌳' : '📖'}
                        </div>

                        <div className="space-y-2">
                            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                                {book.category}
                            </span>
                            <h3 className="text-lg font-bold text-gray-800 leading-tight">
                                {book.title}
                            </h3>
                            <p className="text-sm text-gray-500">
                                {book.author}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default StudentLibrary;
