import React from 'react';

const AssignmentControls = ({
    onConfirm,
    onCancel,
    selectedClassId,
    isValid = true
}) => {
    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-600">
                        {!selectedClassId && (
                            <span className="text-orange-600 font-medium">
                                ⚠️ Selecciona una clase para continuar
                            </span>
                        )}
                        {selectedClassId && (
                            <span className="text-green-600 font-medium">
                                ✅ Configuración lista para asignar
                            </span>
                        )}
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={onCancel}
                            className="px-6 py-3 text-gray-600 hover:bg-gray-100 rounded-lg transition font-medium"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={onConfirm}
                            disabled={!selectedClassId || !isValid}
                            className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                        >
                            ✅ Confirmar Asignación
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AssignmentControls;



