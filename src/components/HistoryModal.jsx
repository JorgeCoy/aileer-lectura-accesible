import React from "react";

const HistoryModal = ({ showHistory, setShowHistory, history, selectFromHistory }) => {
  if (!showHistory) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50">
      <div className="bg-primary rounded-lg w-full max-w-md max-h-[80vh] overflow-y-auto">
        <div className="p-4">
          <h3 className="text-xl font-bold mb-4">Historial de textos</h3>
          {history.length === 0 ? (
            <p className="text-gray-400">No hay textos guardados</p>
          ) : (
            history.map((item) => (
              <div
                key={item.id}
                className="p-3 border-b border-gray-700 cursor-pointer hover:bg-gray-700"
                onClick={() => selectFromHistory(item.text)}
              >
                <strong>{item.timestamp}</strong>
                <p className="text-sm text-gray-400 truncate">{item.text.substring(0, 60)}...</p>
              </div>
            ))
          )}
        </div>
        <button
          onClick={() => setShowHistory(false)}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
          aria-label="Cerrar historial"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

export default HistoryModal;