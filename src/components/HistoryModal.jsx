import React from "react";


const HistoryModal = ({ showHistory, setShowHistory, history, selectFromHistory }) => {
  if (!showHistory) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-900 text-white rounded-2xl w-full max-w-md max-h-[80vh] overflow-y-auto relative shadow-2xl border border-gray-700">
        <div className="p-6">
          <h3 className="text-2xl font-bold mb-6 text-center border-b border-gray-700 pb-4">Historial de textos</h3>
          {history.length === 0 ? (
            <p className="text-gray-400 text-center py-8">No hay textos guardados</p>
          ) : (
            <div className="space-y-3">
              {history.map((item) => (
                <div
                  key={item.id}
                  className="p-4 bg-gray-800 rounded-xl cursor-pointer hover:bg-gray-700 transition-colors border border-gray-700 hover:border-blue-500"
                  onClick={() => selectFromHistory(item.text)}
                >
                  <strong className="block text-blue-400 text-xs mb-1">{item.timestamp}</strong>
                  <p className="text-sm text-gray-300 line-clamp-2">{item.text}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Botón de cierre superior */}
        <button
          onClick={() => setShowHistory(false)}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-full transition-colors"
          aria-label="Cerrar historial"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Botón de cierre inferior */}
        <div className="p-4 border-t border-gray-700 bg-gray-900/50 sticky bottom-0">
          <button
            onClick={() => setShowHistory(false)}
            className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default HistoryModal;