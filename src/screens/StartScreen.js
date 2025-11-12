import React, { useContext } from 'react';
import AppContext from '../context/AppContext';
import { modes } from '../config/modes'; // ✅ Importar los modos

const StartScreen = () => {
  const { setCurrentView } = useContext(AppContext);

  const handleSelect = (id) => {
    console.log('Cambiando a vista:', id);
    setCurrentView(id);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <h1 className="text-3xl font-bold mb-8">AILEER — Selecciona tu modo</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-4xl">
        {Object.values(modes).map((mode) => (
          <div
            key={mode.id}
            className="bg-white p-6 rounded-lg shadow-lg flex flex-col items-center cursor-pointer hover:bg-gray-50 transition"
            onClick={() => handleSelect(mode.id)}
          >
            <span className="text-4xl mb-3">{mode.icon}</span>
            <h2 className="text-xl font-semibold">{mode.label}</h2>
            <p className="text-gray-600 text-center mt-2">{mode.subtitle}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StartScreen;