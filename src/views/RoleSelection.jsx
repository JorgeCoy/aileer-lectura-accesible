import React from 'react';
import { useNavigate } from 'react-router-dom';

const RoleSelection = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-orange-50 flex flex-col items-center justify-center p-4 font-sans">
            <div className="max-w-4xl w-full text-center space-y-12">

                <div className="space-y-4">
                    <h1 className="text-4xl md:text-6xl font-bold text-orange-900 tracking-tight">
                        aLeer
                    </h1>
                    <p className="text-xl md:text-2xl text-orange-800/80 max-w-2xl mx-auto">
                        Lectura accesible para todos. Conéctate desde el campo o la ciudad.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto w-full">
                    {/* Docente Card */}
                    <button
                        onClick={() => navigate('/docente')}
                        className="group relative overflow-hidden bg-white hover:bg-orange-100 border-2 border-orange-200 hover:border-orange-400 rounded-3xl p-8 transition-all duration-300 shadow-lg hover:shadow-xl text-left flex flex-col h-64 justify-between"
                    >
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-32 w-32 text-orange-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                        </div>

                        <div className="z-10">
                            <span className="inline-block px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-semibold mb-4">
                                Para Maestros
                            </span>
                            <h2 className="text-3xl font-bold text-gray-800 group-hover:text-orange-900 transition-colors">
                                Soy Docente
                            </h2>
                        </div>

                        <div className="z-10 text-gray-600 group-hover:text-gray-800">
                            <p>Gestiona tu aula, crea cursos y asigna lecturas.</p>
                        </div>
                    </button>

                    {/* Estudiante Card */}
                    <button
                        onClick={() => navigate('/estudiante')}
                        className="group relative overflow-hidden bg-white hover:bg-emerald-50 border-2 border-emerald-100 hover:border-emerald-400 rounded-3xl p-8 transition-all duration-300 shadow-lg hover:shadow-xl text-left flex flex-col h-64 justify-between"
                    >
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-32 w-32 text-emerald-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                        </div>

                        <div className="z-10">
                            <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-sm font-semibold mb-4">
                                Para Alumnos
                            </span>
                            <h2 className="text-3xl font-bold text-gray-800 group-hover:text-emerald-900 transition-colors">
                                Soy Estudiante
                            </h2>
                        </div>

                        <div className="z-10 text-gray-600 group-hover:text-gray-800">
                            <p>Entra a tu clase, lee historias y completa tareas.</p>
                        </div>
                    </button>
                </div>

                <div className="text-orange-800/60 text-sm">
                    Funciona sin conexión a internet • aLeer v2.0
                </div>
            </div>
        </div>
    );
};

export default RoleSelection;
