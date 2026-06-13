import React, { useState } from 'react';
import MockBackendService from '../../services/MockBackendService';

const StudentSemaphore = ({ students = [] }) => {
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [feedbackType, setFeedbackType] = useState('kudos'); // 'kudos' | 'alert'
    const [message, setMessage] = useState('');
    const [showModal, setShowModal] = useState(false);

    const handleStudentClick = (student) => {
        setSelectedStudent(student);
        setFeedbackType('kudos');
        setMessage('');
        setShowModal(true);
    };

    const handleSendFeedback = () => {
        if (!selectedStudent) return;

        MockBackendService.sendFeedback(selectedStudent.name, feedbackType, message);

        alert(`✅ Feedback enviado a ${selectedStudent.name}`);
        setShowModal(false);
        setSelectedStudent(null);
    };

    if (students.length === 0) {
        return (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center h-full flex flex-col justify-center">
                <div className="text-4xl mb-2">👥</div>
                <h3 className="text-gray-500 font-medium">Sin estudiantes</h3>
                <p className="text-gray-400 text-sm">Comparte el código de clase para inscribirlos.</p>
            </div>
        );
    }

    // Sort: Red first (needs attention), then Yellow, then Green
    const sortedStudents = [...students].sort((a, b) => {
        const scoreA = a.status === 'risk' ? 0 : a.status === 'warning' ? 1 : 2;
        const scoreB = b.status === 'risk' ? 0 : b.status === 'warning' ? 1 : 2;
        return scoreA - scoreB;
    });

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-full relative">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span className="text-xl">🚦</span> Semáforo de Estudiantes
            </h3>
            <div className="overflow-y-auto max-h-[300px] pr-2 custom-scrollbar">
                <div className="space-y-3">
                    {sortedStudents.map((student, index) => (
                        <div
                            key={index}
                            onClick={() => handleStudentClick(student)}
                            className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100 hover:border-blue-300 hover:bg-blue-50 cursor-pointer transition-all group"
                        >
                            <div className="flex items-center gap-3">
                                <div className={`w-3 h-3 rounded-full ${student.status === 'success' ? 'bg-green-500 shadow-green-200' :
                                    student.status === 'warning' ? 'bg-yellow-500 shadow-yellow-200' :
                                        'bg-red-500 shadow-red-200'
                                    } shadow-lg`}></div>
                                <div>
                                    <p className="text-sm font-bold text-gray-800 group-hover:text-blue-700 transition-colors">{student.name}</p>
                                    <p className="text-xs text-gray-500">{student.className}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-xs font-bold text-gray-700">{student.completionRate}%</p>
                                <p className="text-[10px] text-gray-400">Completado</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <div className="mt-4 flex justify-between text-xs text-gray-400 px-2">
                <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-green-500"></div> Al día</div>
                <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-yellow-500"></div> Regular</div>
                <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-red-500"></div> Riesgo</div>
            </div>

            {/* Feedback Modal */}
            {showModal && selectedStudent && (
                <div className="absolute inset-0 bg-white/95 backdrop-blur-sm z-10 rounded-2xl flex flex-col items-center justify-center p-6 animate-in fade-in duration-200">
                    <h4 className="text-lg font-bold text-gray-800 mb-4">Enviar Feedback a {selectedStudent.name}</h4>

                    <div className="flex gap-4 mb-6">
                        <button
                            onClick={() => setFeedbackType('kudos')}
                            className={`flex flex-col items-center p-4 rounded-xl border-2 transition-all ${feedbackType === 'kudos' ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-100 text-gray-400 hover:border-green-200'}`}
                        >
                            <span className="text-2xl mb-1">🎉</span>
                            <span className="text-xs font-bold">Felicitación</span>
                        </button>
                        <button
                            onClick={() => setFeedbackType('alert')}
                            className={`flex flex-col items-center p-4 rounded-xl border-2 transition-all ${feedbackType === 'alert' ? 'border-red-500 bg-red-50 text-red-700' : 'border-gray-100 text-gray-400 hover:border-red-200'}`}
                        >
                            <span className="text-2xl mb-1">⚠️</span>
                            <span className="text-xs font-bold">Alerta</span>
                        </button>
                    </div>

                    <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder={feedbackType === 'kudos' ? "¡Excelente trabajo! Sigue así..." : "Noté que has tenido dificultades..."}
                        className="w-full text-sm p-3 border border-gray-200 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500 h-24 resize-none"
                    />

                    <div className="flex gap-2 w-full">
                        <button
                            onClick={() => setShowModal(false)}
                            className="flex-1 py-2 text-gray-500 hover:bg-gray-100 rounded-lg text-sm font-medium transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleSendFeedback}
                            className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors shadow-sm"
                        >
                            Enviar
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentSemaphore;
