import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import GenericReadingView from '../GenericReadingView';
import { MOCK_LIBRARY } from '../../data/mockLibrary';
import MockBackendService from '../../services/MockBackendService';
import AuthContext from '../../context/AuthContext';
import StudentEvaluationModal from '../../components/StudentEvaluationModal';

const StudentReadingWrapper = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [textData, setTextData] = useState(null);
    const { user } = React.useContext(AuthContext);

    const [isEvaluationOpen, setIsEvaluationOpen] = useState(false);
    const [savedStats, setSavedStats] = useState(null);

    useEffect(() => {
        // 1. Find the text content
        // Check both MOCK_LIBRARY and the custom library in MockBackendService
        const mockText = MOCK_LIBRARY.find(t => t.id === id);
        const customLibrary = MockBackendService.getLibrary ? MockBackendService.getLibrary() : [];
        const customText = customLibrary.find(t => t.id === id);

        const foundText = mockText || customText;

        // 2. Find the assignment config (if any)
        // Check if we have a preview config passed via navigation state (Teacher Preview)
        const previewConfig = location.state?.previewConfig;

        // Otherwise look for the actual assignment
        const assignments = MockBackendService.getAssignments();
        const assignment = assignments.find(a => a.textId === id);

        if (foundText) {
            setTextData({
                ...foundText,
                config: previewConfig || assignment?.config || null,
                assignment: previewConfig ? { config: previewConfig } : (assignment || null),
                isPreview: !!previewConfig
            });
        } else {
            navigate('/estudiante');
        }
    }, [id, navigate, location.state]);

    if (!textData) return <div className="p-8 text-center">Cargando lectura...</div>;

    const moduleContext = {
        moduleId: id,
        mode: 'practice',
    };

    const completeWithoutRecall = (stats) => {
        const enrollments = MockBackendService.getStudentEnrollments();
        const classEnrollment = enrollments.find(e => e.classId === textData.assignment.classId);
        const nameToSave = classEnrollment?.studentName || user?.displayName || 'Estudiante';

        MockBackendService.saveProgress(textData.assignment.id, {
            wpm: stats.wpm,
            status: 'completed',
            studentName: nameToSave
        });

        setTimeout(() => {
            if (window.confirm(`🎉 ¡Felicitaciones! Terminaste la lectura.\n\nVelocidad: ${stats.wpm} WPM\n\n¿Volver al inicio?`)) {
                navigate('/estudiante');
            }
        }, 500);
    };

    const handleFinish = async (stats) => {
        if (!textData.assignment || textData.isPreview) {
            setTimeout(() => {
                alert(`👁️ Vista previa terminada.\nVelocidad: ${stats.wpm} WPM`);
                navigate('/estudiante');
            }, 500);
            return;
        }

        setSavedStats(stats);

        const evaluation = textData.assignment?.evaluation || textData.assignment?.config?.evaluation;

        if (evaluation?.enabled && evaluation?.questions?.length > 0) {
            setIsEvaluationOpen(true);
        } else {
            completeWithoutRecall(stats);
        }
    };

    const handleEvaluationSubmit = ({ answers, score }) => {
        // Here we could save the score
    };

    const handleEvaluationClose = () => {
        setIsEvaluationOpen(false);
        const enrollments = MockBackendService.getStudentEnrollments();
        const classEnrollment = enrollments.find(e => e.classId === textData.assignment?.classId);
        const nameToSave = classEnrollment?.studentName || user?.displayName || 'Estudiante';

        MockBackendService.saveProgress(textData.assignment?.id || 'preview', {
            wpm: savedStats?.wpm || 0,
            status: 'completed',
            studentName: nameToSave
        });

        setTimeout(() => {
            alert(`🏆 Tarea Completada con éxito.\n\nVelocidad: ${savedStats?.wpm || 0} WPM`);
            navigate('/estudiante');
        }, 300);
    };

    const isQuizOnly = textData.assignment?.type === 'quiz_only';
    
    // Automatically open the evaluation if it's quiz only
    useEffect(() => {
        if (isQuizOnly && textData) {
            setSavedStats({ wpm: 0 }); // No reading stats
            setIsEvaluationOpen(true);
        }
    }, [isQuizOnly, textData]);

    return (
        <div className="fixed inset-0 z-50 bg-white">
            {/* Mostrar configuración del docente si existe */}
            {textData.config && textData.assignment && textData.showConfig !== false && (
                <div className={`absolute top-4 left-4 right-4 z-50 border rounded-xl p-3 shadow-lg animate-in fade-in slide-in-from-top-2 ${textData.isPreview ? 'bg-orange-50 border-orange-200' : 'bg-blue-50 border-blue-200'
                    }`}>
                    <div className="flex items-center gap-2">
                        <span className="text-2xl">{textData.isPreview ? '👁️' : '👨‍🏫'}</span>
                        <div className="flex-1">
                            <p className={`text-sm font-semibold ${textData.isPreview ? 'text-orange-900' : 'text-blue-900'}`}>
                                {textData.isPreview ? 'Vista Preliminar Docente' : 'Tema personalizado por tu docente'}
                            </p>
                            <p className={`text-xs ${textData.isPreview ? 'text-orange-700' : 'text-blue-700'}`}>
                                Tema: {textData.config.theme || 'Por defecto'} •
                                Técnica: {textData.config.technique || 'Resaltado'} •
                                Velocidad: {textData.config.speed || 200} WPM
                            </p>
                        </div>
                        <button
                            onClick={() => setTextData({ ...textData, showConfig: false })}
                            className="text-blue-500 hover:text-blue-700 text-xl"
                        >
                            ×
                        </button>
                    </div>
                </div>
            )}

            {/* Reading View (Hidden if Quiz Only) */}
            {!isQuizOnly && (
                <GenericReadingView
                    modeId="kid"
                    moduleContext={moduleContext}
                    initialText={textData.content}
                    initialConfig={textData.config}
                    onFinish={handleFinish}
                    isStudentView={true}
                    headerInfo={{
                        title: textData.title || "Lectura Asignada",
                        subtitle: textData.assignment?.className || "Clase"
                    }}
                />
            )}

            {/* Modal de Evaluación */}
            {isEvaluationOpen && (
                <StudentEvaluationModal
                    evaluation={textData.assignment?.evaluation || textData.assignment?.config?.evaluation}
                    onClose={handleEvaluationClose}
                    onSubmit={handleEvaluationSubmit}
                />
            )}

        </div>
    );
};

export default StudentReadingWrapper;
