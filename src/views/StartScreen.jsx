import React, { useContext } from 'react';
import AppContext from '../context/AppContext';

const StartScreen = () => {
  const { setCurrentView } = useContext(AppContext);

  const modules = [
    {
      id: 'teacher',
      title: 'Para Profesores',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" className="h-12 w-12 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      description: 'Diseñado para guiar, planificar y enseñar con herramientas adaptadas.',
    },
    {
      id: 'kid',
      title: 'Para Niños (5 años)',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" className="h-12 w-12 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      description: '¡Lee con tus cerditos favoritos!',
    },
    {
      id: 'baby',
      title: 'Para Bebés y Pequeños (1 año)',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" className="h-12 w-12 text-pink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      description: 'Escucha, mira, descubre…',
    },
    {
      id: 'adult',
      title: 'Para Adultos (Yo — Jorge)',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" className="h-12 w-12 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      description: 'Lee como en una biblioteca. Sin distracciones.',
    },
    {
      id: 'ninos_tdah',
      title: 'Para Niños con TDAH',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" className="h-12 w-12 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      ),
      description: 'Un espacio diseñado para mantener el enfoque, sin presión.',
    },
  ];

  const handleSelect = (id) => {
    setCurrentView(id);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex flex-col items-center justify-center p-6">
      {/* Logo central */}
      <div className="mb-8 text-center">
        <div className="flex justify-center mb-4">
          <svg width="100" height="100" viewBox="0 0 100 100" className="text-pink-400">
            <circle cx="30" cy="40" r="15" fill="currentColor" />
            <circle cx="70" cy="40" r="15" fill="currentColor" />
            <path d="M20 70 Q50 90 80 70" stroke="currentColor" strokeWidth="4" fill="none" />
            <text x="50" y="30" textAnchor="middle" fill="white" fontSize="10">📚</text>
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-gray-800">Bienvenido</h1>
        <p className="text-gray-600 mt-2">¿Con quién vas a trabajar hoy?</p>
      </div>

      {/* Botones de módulos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-4xl">
        {modules.map((module) => (
          <button
            key={module.id}
            onClick={() => handleSelect(module.id)}
            className="p-6 rounded-xl border-2 flex flex-col items-center justify-center transition-all transform hover:scale-105 hover:shadow-lg border-gray-200 bg-white hover:border-blue-300"
          >
            {module.icon}
            <h3 className="text-xl font-semibold mt-4 text-gray-800">{module.title}</h3>
            <p className="text-gray-600 text-sm mt-2 text-center">{module.description}</p>
          </button>
        ))}
      </div>

      {/* Pie de pantalla opcional */}
      <footer className="mt-12 text-center text-gray-500 text-sm">
        © {new Date().getFullYear()} - Hecho con cariño para ti y tus cerditos 🐷
      </footer>
    </div>
  );
};

export default StartScreen;