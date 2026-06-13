import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ClassAccessManager from '../../components/teacher/ClassAccessManager';
import MockBackendService from '../../services/MockBackendService';
import AnalyticsService from '../../services/AnalyticsService';
import StudentSemaphore from '../../components/teacher/StudentSemaphore';
import ClassSemaphore from '../../components/teacher/ClassSemaphore';
import InsightsPanel from '../../components/teacher/InsightsPanel';
import ClassHeatmap from '../../components/teacher/ClassHeatmap';
import TrendChart from '../../components/teacher/TrendChart';
import FirebaseBackendService from '../../services/FirebaseBackendService';
import { useAuth } from '../../context/AuthContext';

const TeacherDashboard = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [classes, setClasses] = useState([]);
    const [selectedClassId, setSelectedClassId] = useState('global');
    const [stats, setStats] = useState({ students: 0, assignments: 0, avgWpm: 0, studentsInRisk: 0, avgComprehension: 0 });
    const [studentStatusList, setStudentStatusList] = useState([]);
    const [insights, setInsights] = useState([]);
    const [classesHealth, setClassesHealth] = useState([]);
    const [classHistory, setClassHistory] = useState([]);
    const [isPresentationMode, setIsPresentationMode] = useState(false);
    const [showPodium, setShowPodium] = useState(false);
    const [showInsights, setShowInsights] = useState(false);

    useEffect(() => {
        // Initial load of classes synced from Firebase
        const loadClassesAndSync = async () => {
            if (!user) return;
            const fbClasses = await FirebaseBackendService.getTeacherClasses(user.uid);
            const fbAssignments = await FirebaseBackendService.getTeacherAssignments(user.uid);
            
            // Sync with local storage so AnalyticsService works seamlessly
            localStorage.setItem('aleer_db_classes', JSON.stringify(fbClasses));
            localStorage.setItem('aleer_db_assignments', JSON.stringify(fbAssignments));
            
            setClasses(fbClasses);
        };
        
        loadClassesAndSync();
    }, [user]);

    useEffect(() => {
        calculateDashboardData();
    }, [selectedClassId, classes]);

    const calculateDashboardData = () => {
        if (classes.length === 0) return;

        if (selectedClassId === 'global') {
            setStats(AnalyticsService.getGlobalStats());
            setInsights(AnalyticsService.getInsights('global'));
            setClassesHealth(AnalyticsService.getClassRiskList());
            setStudentStatusList([]);
        } else {
            setStats(AnalyticsService.getClassStats(selectedClassId));
            setInsights(AnalyticsService.getInsights(selectedClassId));
            
            const classHealth = MockBackendService.getClassHealth(selectedClassId);
            setClassesHealth([classHealth]);
            
            setStudentStatusList(AnalyticsService.getStudentRiskList(selectedClassId));
        }
        
        const history = MockBackendService.getClassHistory(selectedClassId === 'global' ? classes[0].id : selectedClassId);
        setClassHistory(history);
    };

    // --- PRESENTATION MODE LAYOUT ---
    if (isPresentationMode) {
        return (
            <div className="fixed inset-0 z-50 bg-slate-900 p-8 overflow-auto text-white flex flex-col">
                <div className="max-w-7xl mx-auto w-full flex-1 flex flex-col">
                    {/* Header */}
                    <header className="flex justify-between items-center mb-12">
                        <div>
                            <h1 className="text-6xl font-black bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent mb-2">
                                {selectedClassId === 'global' ? 'Nuestro Colegio' : classes.find(c => c.id === selectedClassId)?.name || 'Nuestra Clase'}
                            </h1>
                            <p className="text-2xl text-slate-400 font-bold">¡Juntos somos mejores lectores!</p>
                        </div>
                        <div className="flex gap-4">
                            <label className="flex items-center gap-3 cursor-pointer bg-white/10 px-4 py-2 rounded-2xl hover:bg-white/20 transition-colors">
                                <span className="font-bold">💡 Mentes Curiosas</span>
                                <input 
                                    type="checkbox" 
                                    className="w-6 h-6 rounded text-indigo-500 bg-slate-800 border-slate-600 focus:ring-indigo-500 focus:ring-offset-slate-900"
                                    checked={showPodium}
                                    onChange={(e) => setShowPodium(e.target.checked)}
                                />
                            </label>
                            <button
                                onClick={() => setIsPresentationMode(false)}
                                className="bg-rose-500/20 text-rose-400 border border-rose-500/50 px-6 py-2 rounded-2xl text-xl font-bold hover:bg-rose-500 hover:text-white transition-all shadow-lg flex items-center gap-3"
                            >
                                <span>❌</span> Salir
                            </button>
                        </div>
                    </header>

                    {/* Main Content */}
                    <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        {/* Goal & Big Metric */}
                        <div className="space-y-8">
                            <div className="bg-white/5 border border-white/10 rounded-3xl p-10 backdrop-blur-md relative overflow-hidden">
                                <div className="absolute -right-20 -top-20 w-64 h-64 bg-indigo-500 rounded-full blur-[100px] opacity-30"></div>
                                <h3 className="text-2xl text-slate-300 font-bold mb-4 uppercase tracking-widest">Nuestra Precisión Lectora</h3>
                                <div className="text-9xl font-black bg-gradient-to-br from-white to-slate-400 bg-clip-text text-transparent drop-shadow-2xl">
                                    {stats.avgComprehension}%
                                </div>
                                <p className="text-xl text-indigo-300 font-bold mt-4 mb-8">¡Excelente trabajo equipo!</p>
                                
                                <div className="pt-8 border-t border-white/10">
                                    <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">Lectura Más Practicada</h4>
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-2xl shadow-lg">
                                            📖
                                        </div>
                                        <div>
                                            <p className="text-2xl font-bold text-white">
                                                {stats.topReadingName || 'Ninguna'}
                                            </p>
                                            <p className="text-indigo-300 text-sm font-medium">{stats.topReadingCount || 0} lecturas completadas</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Podium (Optional) */}
                        {showPodium ? (
                            <div className="bg-white/5 border border-white/10 rounded-3xl p-10 backdrop-blur-md">
                                <h3 className="text-3xl font-bold mb-2 text-center text-amber-400 flex items-center justify-center gap-3">
                                    <span>🌟</span> Mentes Más Curiosas e Interactivas
                                </h3>
                                <p className="text-center text-slate-400 mb-8 font-medium">
                                    {selectedClassId === 'global' ? 'De todo el colegio' : `De ${classes.find(c => c.id === selectedClassId)?.name}`}
                                </p>
                                <div className="flex justify-center items-end gap-6 h-64 mt-8">
                                    {/* 2nd */}
                                    <div className="w-32 flex flex-col items-center">
                                        <div className="w-16 h-16 rounded-full bg-slate-700 mb-4 border-4 border-slate-400 flex items-center justify-center text-2xl">👦</div>
                                        <div className="w-full bg-gradient-to-t from-slate-600 to-slate-400 h-32 rounded-t-xl flex justify-center pt-4">
                                            <span className="text-4xl font-black text-white/50">2</span>
                                        </div>
                                    </div>
                                    {/* 1st */}
                                    <div className="w-32 flex flex-col items-center">
                                        <div className="w-20 h-20 rounded-full bg-amber-900 mb-4 border-4 border-amber-400 flex items-center justify-center text-3xl shadow-[0_0_30px_rgba(251,191,36,0.5)] z-10">👧</div>
                                        <div className="w-full bg-gradient-to-t from-amber-600 to-amber-400 h-48 rounded-t-xl flex justify-center pt-4 shadow-2xl">
                                            <span className="text-5xl font-black text-white/50">1</span>
                                        </div>
                                    </div>
                                    {/* 3rd */}
                                    <div className="w-32 flex flex-col items-center">
                                        <div className="w-16 h-16 rounded-full bg-amber-950 mb-4 border-4 border-amber-700 flex items-center justify-center text-2xl">👦</div>
                                        <div className="w-full bg-gradient-to-t from-amber-900 to-amber-700 h-24 rounded-t-xl flex justify-center pt-4">
                                            <span className="text-4xl font-black text-white/50">3</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center justify-center h-full">
                                <div className="text-center animate-pulse">
                                    <div className="text-8xl mb-6">🚀</div>
                                    <h2 className="text-4xl font-bold text-slate-300">¡Sigamos aprendiendo!</h2>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // --- NORMAL LAYOUT ---
    return (
        <div className="space-y-6">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex flex-col gap-2">
                    <div>
                        <h1 className="text-3xl font-black bg-gradient-to-r from-indigo-900 to-slate-800 bg-clip-text text-transparent">Panel de Control</h1>
                        <p className="text-slate-500 font-medium">Bienvenido, Profe.</p>
                    </div>
                    {/* Class Selector Dropdown */}
                    <div className="flex items-center gap-2 mt-2">
                        <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">Vista:</span>
                        <select 
                            className="bg-white/80 backdrop-blur-md border border-indigo-100 text-indigo-900 text-sm rounded-xl focus:ring-indigo-500 focus:border-indigo-500 block p-2 shadow-sm font-bold cursor-pointer hover:bg-white transition-colors"
                            value={selectedClassId}
                            onChange={(e) => setSelectedClassId(e.target.value)}
                        >
                            <option value="global">🌍 Colegio (Todas las Clases)</option>
                            {classes.map(cls => (
                                <option key={cls.id} value={cls.id}>📚 {cls.name}</option>
                            ))}
                        </select>
                    </div>
                </div>
                <div className="flex flex-wrap items-center gap-4">
                    <div className="relative">
                        <button 
                            onClick={() => setShowInsights(!showInsights)}
                            className="relative bg-white/80 backdrop-blur-md border border-white/60 text-slate-700 w-12 h-12 rounded-full hover:bg-white hover:scale-105 transition-all flex items-center justify-center shadow-sm font-bold"
                        >
                            <span className="text-xl">🔔</span>
                            {insights.length > 0 && (
                                <span className="absolute top-0 right-0 w-3 h-3 bg-rose-500 border-2 border-white rounded-full"></span>
                            )}
                        </button>
                        {showInsights && (
                            <div className="absolute right-0 top-14 w-80 z-50 shadow-2xl rounded-2xl overflow-hidden border border-gray-100">
                                <InsightsPanel 
                                    insights={insights} 
                                    onDismiss={(id) => setInsights(insights.filter(i => i.id !== id))}
                                    onDismissAll={() => setInsights([])}
                                />
                            </div>
                        )}
                    </div>
                    <button
                        onClick={() => setIsPresentationMode(true)}
                        className="bg-gradient-to-r from-slate-800 to-black text-white px-6 py-3 rounded-2xl hover:scale-105 transition-all flex items-center gap-2 shadow-xl shadow-slate-900/20 font-bold"
                        title="Modo Proyección para Aula"
                    >
                        <span className="text-xl">🍿</span> Modo Cine
                    </button>
                </div>
            </header>

            {/* KPI Cards (Premium Glassmorphism) */}
            <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-white/60 backdrop-blur-xl border border-white/60 shadow-xl shadow-indigo-100/50 rounded-3xl p-6 relative overflow-hidden group hover:-translate-y-1 transition-all duration-300">
                    <div className="absolute -right-6 -top-6 w-24 h-24 bg-gradient-to-br from-indigo-200 to-purple-200 rounded-full blur-2xl opacity-40 group-hover:opacity-70 transition-opacity"></div>
                    <div className="flex items-center justify-between relative z-10">
                        <div>
                            <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">
                                {selectedClassId === 'global' ? 'Estudiantes Totales' : 'Estudiantes Activos'}
                            </h3>
                            <p className="text-4xl font-black text-slate-800">{stats.students}</p>
                        </div>
                        <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-2xl flex items-center justify-center text-2xl shadow-lg shadow-indigo-200/50 rotate-3 group-hover:rotate-6 transition-transform">
                            🎓
                        </div>
                    </div>
                </div>

                <div className="bg-white/60 backdrop-blur-xl border border-white/60 shadow-xl shadow-indigo-100/50 rounded-3xl p-6 relative overflow-hidden group hover:-translate-y-1 transition-all duration-300">
                    <div className="absolute -right-6 -top-6 w-24 h-24 bg-gradient-to-br from-rose-200 to-orange-200 rounded-full blur-2xl opacity-40 group-hover:opacity-70 transition-opacity"></div>
                    <div className="flex items-center justify-between relative z-10">
                        <div>
                            <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Estudiantes en Riesgo</h3>
                            <p className="text-4xl font-black text-slate-800">{stats.studentsInRisk}</p>
                        </div>
                        <div className="w-14 h-14 bg-gradient-to-br from-rose-500 to-orange-500 text-white rounded-2xl flex items-center justify-center text-2xl shadow-lg shadow-rose-200/50 -rotate-3 group-hover:-rotate-6 transition-transform">
                            ⚠️
                        </div>
                    </div>
                </div>

                <div className="bg-white/60 backdrop-blur-xl border border-white/60 shadow-xl shadow-indigo-100/50 rounded-3xl p-6 relative overflow-hidden group hover:-translate-y-1 transition-all duration-300">
                    <div className="absolute -right-6 -top-6 w-24 h-24 bg-gradient-to-br from-emerald-200 to-teal-200 rounded-full blur-2xl opacity-40 group-hover:opacity-70 transition-opacity"></div>
                    <div className="flex items-center justify-between relative z-10">
                        <div>
                            <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">
                                {selectedClassId === 'global' ? 'Comprensión Global' : 'Precisión Promedio'}
                            </h3>
                            <p className="text-4xl font-black text-slate-800">{stats.avgComprehension}<span className="text-lg text-slate-400 font-medium">%</span></p>
                        </div>
                        <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-500 text-white rounded-2xl flex items-center justify-center text-2xl shadow-lg shadow-emerald-200/50 rotate-3 group-hover:rotate-6 transition-transform">
                            🧠
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
                {/* Left Column: Actionable Area */}
                <div className="space-y-6">
                    {/* Student or Class Semaphore */}
                    <div className="h-[500px]">
                        {selectedClassId === 'global' ? (
                            <ClassSemaphore classesHealth={classesHealth} onSelectClass={setSelectedClassId} />
                        ) : (
                            <StudentSemaphore students={studentStatusList} />
                        )}
                    </div>
                    {/* Quick Access / Class Manager */}
                    <ClassAccessManager />
                </div>

                {/* Right Column: Visual Overview */}
                <div className="space-y-6">
                    {/* Class Heatmap */}
                    <div className="h-[500px]">
                        <ClassHeatmap classesHealth={classesHealth} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TeacherDashboard;
