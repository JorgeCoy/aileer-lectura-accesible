import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import ClassJoin from '../../components/student/ClassJoin';
import MockBackendService from '../../services/MockBackendService';
import AuthContext from '../../context/AuthContext';
import GamificationPanel from '../../components/student/GamificationPanel';
import ProgressChart from '../../components/student/ProgressChart';

const StudentDashboard = () => {
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const [assignments, setAssignments] = useState([]);
    const [enrollments, setEnrollments] = useState([]);
    const [feedback, setFeedback] = useState([]);
    const [gamification, setGamification] = useState(null);

    const loadData = () => {
        const myAssignments = MockBackendService.getStudentAssignments();
        // Enrich with progress
        const assignmentsWithProgress = myAssignments.map(a => ({
            ...a,
            progress: MockBackendService.getStudentProgress(a.id)
        }));

        setAssignments(assignmentsWithProgress);
        setEnrollments(MockBackendService.getStudentEnrollments());

        // Load Gamification Data
        // Use the name from the first enrollment if available, or user display name
        // This aligns with how we save progress
        const studentName = MockBackendService.getStudentEnrollments()[0]?.studentName || user?.displayName || 'Estudiante';
        const gameStats = MockBackendService.getStudentGamification(studentName);
        setGamification(gameStats);

        // Load Feedback
        const myFeedback = MockBackendService.getStudentFeedback(studentName);
        setFeedback(myFeedback);
    };

    const handleDismissFeedback = (id) => {
        MockBackendService.markFeedbackAsRead(id);
        setFeedback(prev => prev.filter(f => f.id !== id));
    };

    useEffect(() => {
        loadData();
    }, [user]);

    return (
        <div className="space-y-6">
            {/* Header with Greeting */}
            <div className="flex justify-between items-end mb-2">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">
                        Hola, {user?.displayName?.split(' ')[0] || 'Estudiante'} 👋
                    </h1>
                    <p className="text-gray-500">¿Listo para romper tu récord hoy?</p>
                </div>
            </div>

            {/* Feedback Banners */}
            {feedback.length > 0 && (
                <div className="space-y-2">
                    {feedback.map(f => (
                        <div
                            key={f.id}
                            className={`p-4 rounded-xl flex items-start gap-4 shadow-sm border animate-in slide-in-from-top-2 ${f.type === 'kudos'
                                    ? 'bg-green-50 border-green-100 text-green-800'
                                    : 'bg-red-50 border-red-100 text-red-800'
                                }`}
                        >
                            <div className="text-2xl">
                                {f.type === 'kudos' ? '🎉' : '⚠️'}
                            </div>
                            <div className="flex-1">
                                <h4 className="font-bold text-sm mb-1">
                                    {f.type === 'kudos' ? '¡Felicitaciones!' : 'Atención'}
                                </h4>
                                <p className="text-sm opacity-90">{f.message}</p>
                            </div>
                            <button
                                onClick={() => handleDismissFeedback(f.id)}
                                className={`text-xs font-bold px-3 py-1 rounded-lg transition-colors ${f.type === 'kudos'
                                        ? 'bg-green-200 hover:bg-green-300 text-green-800'
                                        : 'bg-red-200 hover:bg-red-300 text-red-800'
                                    }`}
                            >
                                Entendido
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Gamification Panel (Top Priority) */}
            <GamificationPanel gamification={gamification} />

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Main Content (2 cols) */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Assignments Card */}
                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-xl text-blue-600">
                                📝
                            </div>
                            <h3 className="text-xl font-bold text-gray-800">Mis Tareas</h3>
                        </div>

                        {assignments.length > 0 ? (
                            <div className="space-y-3">
                                {assignments.map(task => (
                                    <div
                                        key={task.id}
                                        onClick={() => navigate(`/estudiante/lectura/${task.textId}`)}
                                        className={`p-4 rounded-2xl cursor-pointer transition-all border-2 group ${task.progress?.status === 'completed'
                                            ? 'bg-green-50 border-green-100 hover:border-green-300'
                                            : 'bg-white border-gray-100 hover:border-blue-300 hover:shadow-md'
                                            }`}
                                    >
                                        <div className="flex justify-between items-center">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${task.progress?.status === 'completed' ? 'bg-green-200' : 'bg-blue-50 group-hover:bg-blue-100'
                                                    }`}>
                                                    {task.progress?.status === 'completed' ? '✅' : '📖'}
                                                </div>
                                                <div>
                                                    <p className={`font-bold text-lg ${task.progress?.status === 'completed' ? 'text-green-900' : 'text-gray-800'
                                                        }`}>
                                                        {task.textTitle}
                                                    </p>
                                                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">
                                                        {task.className}
                                                    </p>
                                                </div>
                                            </div>

                                            {task.progress?.status === 'completed' && (
                                                <div className="text-right">
                                                    <p className="text-xl font-black text-green-600">{task.progress.wpm} <span className="text-xs font-bold text-green-400">WPM</span></p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-10 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                                <p className="text-gray-400 font-medium">No tienes lecturas asignadas aún.</p>
                            </div>
                        )}
                    </div>

                    {/* Join Class Section */}
                    <ClassJoin onJoinSuccess={loadData} />
                </div>

                {/* Sidebar (1 col) */}
                <div className="space-y-6">
                    {/* Progress Chart */}
                    <div className="h-64">
                        <ProgressChart history={gamification?.history} />
                    </div>

                    {/* Free Reading Button */}
                    <div
                        onClick={() => navigate('/estudiante/biblioteca')}
                        className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-3xl p-6 shadow-lg text-white cursor-pointer hover:shadow-xl transition-all transform hover:-translate-y-1 relative overflow-hidden group"
                    >
                        <div className="absolute top-0 right-0 opacity-10 text-9xl transform translate-x-10 -translate-y-10 group-hover:scale-110 transition-transform">
                            📖
                        </div>
                        <div className="relative z-10">
                            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-2xl mb-4 backdrop-blur-sm">
                                🚀
                            </div>
                            <h3 className="text-xl font-bold mb-1">Lectura Libre</h3>
                            <p className="text-purple-100 text-sm opacity-90">Explora cuentos y practica sin límites.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentDashboard;
