import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MockBackendService from '../../services/MockBackendService';
import FirebaseBackendService from '../../services/FirebaseBackendService';
import { useAuth } from '../../context/AuthContext';
import { TrashIcon } from '@heroicons/react/24/outline';
import GenericReadingView from '../GenericReadingView';
import AssignmentConfigurator from '../../components/AssignmentConfigurator';
import PreviewReader from '../../components/PreviewReader';
import { MOCK_LIBRARY } from '../../data/mockLibrary';
import { exportToPDF } from '../../utils/pdfExport';
import StudentEvaluationModal from '../../components/StudentEvaluationModal';

const TeacherClasses = () => {
    const navigate = useNavigate();
    const { user, schoolId } = useAuth();
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [classes, setClasses] = useState([]);
    const [assignments, setAssignments] = useState([]);
    const [viewAssignment, setViewAssignment] = useState(null);
    const [selectedClass, setSelectedClass] = useState(null);
    const [selectedAction, setSelectedAction] = useState(null);
    const [showPreviewModal, setShowPreviewModal] = useState(false);
    const [previewData, setPreviewData] = useState(null);
    const [showPreviewEvaluation, setShowPreviewEvaluation] = useState(false);
    const [classStats, setClassStats] = useState({ totalAssignments: 0, completedCount: 0, avgWpm: 0 });
    
    // Estados para edición
    const [editAssignment, setEditAssignment] = useState(null);
    const [editConfig, setEditConfig] = useState({});
    const [editDueDate, setEditDueDate] = useState('');
    const [editAssignmentType, setEditAssignmentType] = useState('practice');
    const [editEvaluation, setEditEvaluation] = useState({ enabled: false, showResultsToStudent: false, questions: [] });

    useEffect(() => {
        if (user) {
            loadClasses();
        }
    }, [user]);

    useEffect(() => {
        if (selectedClass) {
            loadClassStats();
        }
    }, [selectedClass, assignments]);

    const loadClassStats = async () => {
        if (!selectedClass) return;
        const stats = await FirebaseBackendService.getClassProgress(selectedClass.id);
        setClassStats(stats);
    };

    // ... existing code ...

    const handleViewDetails = (assignment) => {
        setViewAssignment(assignment);
    };

    const handlePreviewExercise = () => {
        if (!viewAssignment) return;

        // Buscar el contenido del texto
        const allTexts = MockBackendService.getLibrary(MOCK_LIBRARY);
        const textData = allTexts.find(t => t.id === viewAssignment.textId);

        if (textData) {
            setPreviewData({
                content: textData.content,
                config: viewAssignment.config,
                type: viewAssignment.type,
                evaluation: viewAssignment.evaluation
            });
            setShowPreviewEvaluation(false);
            setShowPreviewModal(true);
        } else {
            alert('Error: No se encontró el contenido del texto.');
        }
    };

    const handleExportPDF = () => {
        if (!viewAssignment) return;
        const allTexts = MockBackendService.getLibrary(MOCK_LIBRARY);
        const textData = allTexts.find(t => t.id === viewAssignment.textId);
        if (textData) {
            exportToPDF(textData.title, textData.author, textData.content, viewAssignment.evaluation?.questions || []);
        } else {
            alert('Error: No se encontró el contenido del texto.');
        }
    };

    const handleUnassign = async (assignment) => {
        if (window.confirm(`¿Estás seguro de que quieres desasignar "${assignment.textTitle}" de esta clase?`)) {
            const success = await FirebaseBackendService.deleteAssignment(assignment.id);
            if (success) {
                // Actualizar estado local
                setAssignments(prev => prev.filter(a => a.id !== assignment.id));
                // alert('✅ Asignación eliminada correctamente');
            } else {
                alert('❌ Error al eliminar la asignación');
            }
        }
    };

    const openEditModal = (assignment) => {
        // Fetch text content for the preview
        const allTexts = MockBackendService.getLibrary(MOCK_LIBRARY);
        const textData = allTexts.find(t => t.id === assignment.textId);
        
        if (!textData) {
            alert('Error: No se encontró el contenido del texto para editar.');
            return;
        }

        setEditAssignment({ ...assignment, content: textData.content });
        setEditConfig(assignment.config || { speed: 200, technique: 'highlight', theme: 'minimalist', fontSize: 18, fontFamily: 'sans-serif', voice: 'Google Español' });
        setEditDueDate(assignment.dueDate || '');
        setEditAssignmentType(assignment.type || 'practice');
        setEditEvaluation(assignment.evaluation || { enabled: false, showResultsToStudent: false, questions: [] });
    };

    const handleConfigChange = React.useCallback((newConfig) => {
        setEditConfig(prev => {
            const hasChanges = Object.keys(newConfig).some(key => prev[key] !== newConfig[key]);
            if (!hasChanges) return prev;
            return { ...prev, ...newConfig };
        });
    }, []);

    const handleSaveEdit = async () => {
        if (!editAssignment) return;

        const success = await FirebaseBackendService.updateAssignmentConfig(editAssignment.id, editConfig, editDueDate, editAssignmentType, editEvaluation);
        if (success) {
            // Update local state
            setAssignments(prev => prev.map(a => a.id === editAssignment.id ? { ...a, config: editConfig, dueDate: editDueDate, type: editAssignmentType, evaluation: editEvaluation } : a));
            
            // Also update viewAssignment if it's the one being edited, so the preview works
            if (viewAssignment && viewAssignment.id === editAssignment.id) {
                setViewAssignment(prev => ({ ...prev, config: editConfig, dueDate: editDueDate, type: editAssignmentType, evaluation: editEvaluation }));
            }
            
            setEditAssignment(null);
            alert(`✅ Configuración actualizada exitosamente.`);
        } else {
            alert('❌ Error al actualizar la configuración.');
        }
    };



    const loadClasses = async () => {
        if (!user) return;
        const fetchedClasses = await FirebaseBackendService.getTeacherClasses(user.uid);
        const fetchedAssignments = await FirebaseBackendService.getTeacherAssignments(user.uid);
        setClasses(fetchedClasses);
        setAssignments(fetchedAssignments);
    };

    const getAssignmentsForClass = (classId) => {
        return assignments.filter(assignment => assignment.classId === classId && assignment.status === 'active');
    };

    const handleCreateClass = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        
        // Generar un código único simple
        const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();

        await FirebaseBackendService.createClass(schoolId || 'demo_school', user.uid, {
            name: formData.get('className'),
            grade: 'General', // Default for now
            code: inviteCode,
            students: []
        });

        loadClasses(); // Recarga clases y asignaciones
        setShowCreateModal(false);
    };

    const handleDeleteClass = async (classToDelete) => {
        // Verificar si se puede eliminar la clase
        // Por ahora, permitimos borrar si no hay estudiantes
        if (classToDelete.students && classToDelete.students.length > 0) {
            alert(`❌ No se puede eliminar la clase porque tiene estudiantes activos.`);
            return;
        }

        // Confirmación final
        const confirmed = window.confirm(
            `¿Estás seguro de que quieres eliminar la clase "${classToDelete.name}"?\n\n` +
            `Esta acción no se puede deshacer.`
        );

        if (!confirmed) return;

        // Eliminar la clase
        const success = await FirebaseBackendService.deleteClass(classToDelete.id);

        if (success) {
            // Actualizar el estado local
            loadClasses(); // Recarga clases y asignaciones
            if (selectedClass && selectedClass.id === classToDelete.id) {
                setSelectedClass(null);
                setSelectedAction(null);
            }
            alert(`✅ La clase "${classToDelete.name}" ha sido eliminada exitosamente.`);
        } else {
            alert(`❌ Error al eliminar la clase "${classToDelete.name}".`);
        }
    };

    // Acciones disponibles para clases
    const actions = [
        { id: 'students', label: '👥 Estudiantes' },
        { id: 'class-texts', label: '📚 Lecturas Asignadas' }
    ];

    return (
        <div className="h-full flex flex-col md:flex-row gap-6 p-4">
            {/* Panel Izquierdo: Lista de Clases (Master) */}
            <div className="w-full md:w-80 flex flex-col gap-4">
                <div className="flex justify-between items-center mb-2 px-2">
                    <h1 className="text-2xl font-bold text-slate-800">Mis Clases</h1>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-2 px-4 rounded-xl font-bold shadow-md shadow-orange-200 hover:shadow-lg hover:scale-[1.02] transition-all flex items-center justify-center gap-2 text-sm"
                        title="Crear Nueva Clase"
                    >
                        <span>+</span> Crear
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-2 pb-4">
                    {classes.length === 0 ? (
                        <div className="text-center p-6 text-slate-500 bg-white/50 rounded-2xl border border-white/40">
                            No tienes clases aún.
                        </div>
                    ) : (
                        classes.map((cls) => (
                            <button
                                key={cls.id}
                                onClick={() => {
                                    setSelectedClass(cls);
                                    if (!selectedAction) setSelectedAction('students');
                                }}
                                className={`w-full text-left p-4 rounded-2xl transition-all border backdrop-blur-sm ${
                                    selectedClass?.id === cls.id
                                        ? 'bg-indigo-600/90 text-white border-indigo-500 shadow-lg shadow-indigo-200'
                                        : 'bg-white/60 text-slate-700 border-white/40 hover:bg-white hover:shadow-md'
                                }`}
                            >
                                <div className="font-bold text-lg">{cls.name}</div>
                                <div className={`text-sm flex items-center justify-between mt-2 ${selectedClass?.id === cls.id ? 'text-indigo-100' : 'text-slate-500'}`}>
                                    <span>👥 {cls.students?.length || 0} estudiantes</span>
                                    {selectedClass?.id === cls.id && <span>➔</span>}
                                </div>
                            </button>
                        ))
                    )}
                </div>
            </div>

            {/* Panel Derecho: Detalle de Clase (Detail) */}
            <div className="flex-1 bg-white/60 backdrop-blur-xl border border-white/40 rounded-3xl shadow-xl flex flex-col overflow-hidden">
                {!selectedClass ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-12">
                        <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center mb-6 shadow-inner">
                            <span className="text-5xl">🏫</span>
                        </div>
                        <h3 className="text-2xl font-bold text-slate-800 mb-2">Selecciona una clase</h3>
                        <p className="text-slate-500 max-w-sm">Haz clic en una clase del menú izquierdo para gestionar sus estudiantes y lecturas.</p>
                    </div>
                ) : (
                    <>
                        {/* Cabecera del Detalle */}
                        <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-8 text-white relative overflow-hidden flex-shrink-0">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                            
                            <div className="relative z-10 flex justify-between items-start">
                                <div>
                                    <h2 className="text-3xl font-black mb-2">{selectedClass.name}</h2>
                                    <div className="flex items-center gap-4 text-indigo-100">
                                        <div className="bg-white/20 px-3 py-1 rounded-lg font-mono text-sm backdrop-blur-sm border border-white/20 flex items-center gap-2">
                                            <span>Código:</span>
                                            <span className="font-bold text-white tracking-widest">{selectedClass.code}</span>
                                        </div>
                                    </div>
                                </div>

                                <button 
                                    onClick={() => handleDeleteClass(selectedClass)}
                                    className="bg-red-500/20 hover:bg-red-500 text-white px-3 py-2 rounded-xl transition-colors border border-red-400/30 text-sm font-bold flex items-center gap-2"
                                >
                                    <TrashIcon className="w-4 h-4" /> Borrar
                                </button>
                            </div>

                            {/* KPIs Rápidos */}
                            <div className="grid grid-cols-3 gap-4 mt-8 relative z-10">
                                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                                    <div className="text-3xl font-bold">{getAssignmentsForClass(selectedClass.id).length}</div>
                                    <div className="text-indigo-200 text-sm">Lecturas activas</div>
                                </div>
                                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                                    <div className="text-3xl font-bold">{classStats.completedCount}</div>
                                    <div className="text-indigo-200 text-sm">Completadas</div>
                                </div>
                                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                                    <div className="text-3xl font-bold">{classStats.avgWpm}</div>
                                    <div className="text-indigo-200 text-sm">WPM Promedio</div>
                                </div>
                            </div>
                        </div>

                        {/* Pestañas de Navegación Interna */}
                        <div className="flex border-b border-gray-100 bg-white/50 backdrop-blur-sm">
                            {actions.map(action => (
                                <button
                                    key={action.id}
                                    onClick={() => setSelectedAction(action.id)}
                                    className={`flex-1 py-4 font-bold text-sm transition-all border-b-2 ${
                                        selectedAction === action.id 
                                        ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50' 
                                        : 'border-transparent text-slate-500 hover:bg-slate-50'
                                    }`}
                                >
                                    {action.label}
                                </button>
                            ))}
                        </div>

                        {/* Contenido de la Acción */}
                        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                            {selectedAction === 'students' && (
                                <div>
                                    {selectedClass.students && selectedClass.students.length > 0 ? (
                                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                                            {selectedClass.students.map((student, idx) => (
                                                <div key={idx} className="bg-white p-4 rounded-2xl border border-indigo-50 shadow-sm hover:shadow-md transition-shadow flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 border-2 border-white shadow-sm flex items-center justify-center text-indigo-600 font-bold text-lg">
                                                        {student.name?.charAt(0) || '?'}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-slate-800">{student.name}</div>
                                                        <div className="text-xs text-indigo-500 font-medium">Activo</div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-12 text-slate-500">
                                            <span className="text-4xl block mb-4 opacity-50">👥</span>
                                            <p>No hay estudiantes en esta clase.</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {selectedAction === 'class-texts' && (
                                <div>
                                    <div className="flex justify-end mb-4">
                                        <button
                                            onClick={() => navigate('/docente/biblioteca')}
                                            className="bg-indigo-100 text-indigo-700 hover:bg-indigo-200 px-4 py-2 rounded-xl text-sm font-bold transition-colors"
                                        >
                                            + Asignar desde Biblioteca
                                        </button>
                                    </div>
                                    
                                    <div className="space-y-3">
                                        {getAssignmentsForClass(selectedClass.id).length > 0 ? (
                                            getAssignmentsForClass(selectedClass.id).map(assignment => (
                                                <div key={assignment.id} className="bg-white border border-slate-100 p-4 rounded-2xl shadow-sm hover:shadow-md transition-all group flex items-center justify-between">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600 text-xl">
                                                            📖
                                                        </div>
                                                        <div>
                                                            <h4 className="font-bold text-slate-800">{assignment.textTitle}</h4>
                                                            <div className="flex gap-2 mt-1">
                                                                <span className="bg-slate-100 text-slate-600 text-xs px-2 py-1 rounded-md font-medium">
                                                                    {assignment.config?.speed || 200} WPM
                                                                </span>
                                                                {assignment.evaluation?.enabled ? (
                                                                    <span className="bg-orange-100 text-orange-700 text-xs px-2 py-1 rounded-md font-medium">
                                                                        📝 Evaluación
                                                                    </span>
                                                                ) : (
                                                                    <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-md font-medium">
                                                                        ✅ Práctica
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button onClick={() => handleViewDetails(assignment)} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg font-bold text-sm">Probar</button>
                                                        <button onClick={() => openEditModal(assignment)} className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg font-bold text-sm">Editar</button>
                                                        <button onClick={() => handleUnassign(assignment)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg font-bold text-sm">Quitar</button>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-center py-12 text-slate-500">
                                                <p>No hay lecturas asignadas.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>

            {/* Create Class Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl animate-in fade-in zoom-in-95 duration-200">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">Nueva Clase</h2>
                        <form onSubmit={handleCreateClass} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Curso</label>
                                <input
                                    name="className"
                                    type="text"
                                    placeholder="Ej: Tercero C - Mañana"
                                    required
                                    className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-gray-900 bg-white transition-all"
                                />
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    className="flex-1 py-3 text-gray-600 hover:bg-gray-100 rounded-xl transition font-bold"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl hover:shadow-lg transition font-bold"
                                >
                                    Crear Clase
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Assignment Details Modal */}
            {viewAssignment && !showPreviewModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-xl animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h2 className="text-xl font-bold text-gray-800">Detalles de Asignación</h2>
                                <p className="text-gray-600 text-sm">{viewAssignment.textTitle}</p>
                            </div>
                            <button
                                onClick={() => setViewAssignment(null)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="space-y-6 mb-8">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-gray-50 p-3 rounded-lg">
                                    <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Velocidad</div>
                                    <div className="font-semibold text-gray-800">{viewAssignment.config?.speed || 200} WPM</div>
                                </div>
                                <div className="bg-gray-50 p-3 rounded-lg">
                                    <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Técnica</div>
                                    <div className="font-semibold text-gray-800 capitalize">{viewAssignment.config?.technique || 'Resaltado'}</div>
                                </div>
                                <div className="bg-gray-50 p-3 rounded-lg">
                                    <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Tema Visual</div>
                                    <div className="font-semibold text-gray-800 capitalize">{viewAssignment.config?.theme || 'Minimalista'}</div>
                                </div>
                                <div className="bg-gray-50 p-3 rounded-lg">
                                    <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Tamaño Texto</div>
                                    <div className="font-semibold text-gray-800">{viewAssignment.config?.fontSize || 18}px</div>
                                </div>
                                <div className="bg-gray-50 p-3 rounded-lg">
                                    <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Fuente</div>
                                    <div className="font-semibold text-gray-800 capitalize">{viewAssignment.config?.fontFamily || 'Sans Serif'}</div>
                                </div>
                                <div className="bg-gray-50 p-3 rounded-lg">
                                    <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Voz</div>
                                    <div className="font-semibold text-gray-800 truncate">{viewAssignment.config?.voice || 'Google Español'}</div>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col gap-3">
                            <div className="flex gap-3">
                                <button
                                    onClick={handleExportPDF}
                                    className="w-1/3 bg-white border border-gray-300 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-50 transition flex items-center justify-center gap-2"
                                    title="Exportar a PDF"
                                >
                                    <span>🖨️</span> PDF
                                </button>
                                <button
                                    onClick={handlePreviewExercise}
                                    className="flex-1 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white py-3 rounded-xl font-bold hover:shadow-lg transition flex items-center justify-center gap-2"
                                >
                                    <span>▶️</span> Vista Preliminar
                                </button>
                            </div>
                        </div>
                        <div className="mt-4">
                            <button
                                onClick={() => setViewAssignment(null)}
                                className="w-full py-3 text-gray-600 hover:bg-gray-100 rounded-xl transition font-medium"
                            >
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Assignment Full Modal */}
            {editAssignment && (
                <div className="fixed inset-0 z-[60] bg-white flex flex-col">
                    {/* Configuración superior unificada */}
                    <AssignmentConfigurator
                        selectedClassId={editAssignment.classId} // No dejamos cambiar la clase, solo la mostramos
                        setSelectedClassId={() => {}} // Disabled
                        dueDate={editDueDate}
                        setDueDate={setEditDueDate}
                        classes={classes} // Para que el dropdown muestre el nombre
                        onCancel={() => setEditAssignment(null)}
                        onConfirm={handleSaveEdit}
                        isValid={true}
                        assignmentType={editAssignmentType}
                        setAssignmentType={setEditAssignmentType}
                        evaluation={editEvaluation}
                        setEvaluation={setEditEvaluation}
                        onGenerateAIQuestions={async (multipleChoiceCount, openEndedCount) => {
                            try {
                                const { getGlobalServiceContainer } = await import('../../patterns/ServiceContainer');
                                const container = getGlobalServiceContainer();
                                if (container.has('aiService')) {
                                    const aiService = container.resolve('aiService');
                                    const generated = await aiService.generateReadingQuestions(editAssignment.content, multipleChoiceCount, openEndedCount);
                                    if (generated && generated.length > 0) {
                                        const formattedQuestions = generated.map((q, idx) => ({
                                            id: `ai_${Date.now()}_${idx}`,
                                            type: q.type || 'multiple_choice',
                                            question: q.question,
                                            options: q.type === 'open_ended' ? undefined : (q.options || ['', '', '', '']),
                                            correctAnswer: q.type === 'open_ended' ? undefined : (q.correctAnswer || 0)
                                        }));
                                        setEditEvaluation(prev => ({
                                            ...prev,
                                            enabled: true,
                                            questions: [...prev.questions, ...formattedQuestions]
                                        }));
                                        alert(`✅ IA local generó exitosamente un cuestionario.`);
                                    }
                                }
                            } catch (error) {
                                console.error('Error', error);
                                alert(`❌ Error: ${error.message}`);
                            }
                        }}
                    />

                    {/* Vista de lectura completa usando GenericReadingView */}
                    <div className="flex-1 overflow-hidden relative">
                        <GenericReadingView
                            modeId="preview"
                            initialText={editAssignment.content}
                            initialConfig={editConfig}
                            onConfigChange={handleConfigChange}
                            isPreviewMode={true}
                            hideFullSidebar={false}
                            bookTitle={editAssignment.textTitle}
                        />
                    </div>
                </div>
            )}

            {/* Live Preview Modal */}
            {showPreviewModal && previewData && (
                <div className="fixed inset-0 z-[60] bg-white">
                    <div className="absolute top-4 right-4 z-[70]">
                        <button
                            onClick={() => {
                                setShowPreviewModal(false);
                                setShowPreviewEvaluation(false);
                            }}
                            className="bg-red-600 text-white px-6 py-2 rounded-full shadow-lg hover:bg-red-700 transition font-bold flex items-center gap-2"
                        >
                            <span>✕</span> Cerrar Vista Preliminar
                        </button>
                    </div>
                    <div className="h-full w-full">
                        <div className="h-full w-full">
                            {previewData.type !== 'quiz_only' && !showPreviewEvaluation && (
                                <GenericReadingView
                                    modeId="preview"
                                    initialText={previewData.content}
                                    initialConfig={previewData.config}
                                    isStudentView={true}
                                    onFinish={() => {
                                        if (previewData.evaluation?.enabled && previewData.evaluation?.questions?.length > 0) {
                                            setShowPreviewEvaluation(true);
                                        } else {
                                            alert("Vista preliminar de lectura completada. (No hay evaluación configurada)");
                                            setShowPreviewModal(false);
                                        }
                                    }}
                                    headerInfo={{
                                        title: `Clase destino: ${selectedClass?.name || 'Clase'}`,
                                        subtitle: viewAssignment?.dueDate ? `Fecha límite: ${viewAssignment.dueDate}` : 'Sin fecha límite'
                                    }}
                                />
                            )}
                            {(showPreviewEvaluation || previewData.type === 'quiz_only') && previewData.evaluation?.enabled && previewData.evaluation?.questions?.length > 0 && (
                                <StudentEvaluationModal
                                    evaluation={previewData.evaluation}
                                    onClose={() => {
                                        setShowPreviewEvaluation(false);
                                        setShowPreviewModal(false);
                                    }}
                                />
                            )}
                            {previewData.type === 'quiz_only' && (!previewData.evaluation?.enabled || !previewData.evaluation?.questions || previewData.evaluation.questions.length === 0) && (
                                <div className="flex items-center justify-center h-full">
                                    <div className="text-center p-8 bg-orange-50 rounded-2xl border border-orange-200">
                                        <div className="text-4xl mb-4">⚠️</div>
                                        <h2 className="text-xl font-bold text-orange-900 mb-2">Evaluación no configurada</h2>
                                        <p className="text-orange-700">Has seleccionado "Solo Cuestionario" pero no hay preguntas habilitadas o creadas para esta asignación.</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TeacherClasses;
