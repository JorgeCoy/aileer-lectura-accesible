import React, { useState, useEffect } from 'react';
import { MOCK_LIBRARY } from '../../data/mockLibrary';
import MockBackendService from '../../services/MockBackendService';
import FirebaseBackendService from '../../services/FirebaseBackendService';
import { useAuth } from '../../context/AuthContext';
import { TrashIcon } from '@heroicons/react/24/outline';
import AssignmentConfigurator from '../../components/AssignmentConfigurator';
import GenericReadingView from '../GenericReadingView';
import { getGlobalServiceContainer } from '../../patterns/ServiceContainer';
import { onModelProgress } from '../../services/aiService';
import { exportToPDF } from '../../utils/pdfExport';

// Lista de temas disponibles para asignación
const availableThemes = [
    { value: 'minimalist', label: 'Minimalista', description: 'Tema clásico y profesional' },
    { value: 'cinematic', label: 'Cinematográfico', description: 'Tema dramático y moderno' },
    { value: 'zen', label: 'Zen', description: 'Tema tranquilo y relajante' },
    { value: 'professional', label: 'Profesional', description: 'Tema corporativo' },
    { value: 'vintage', label: 'Vintage', description: 'Tema retro y elegante' },
    { value: 'focus', label: 'Enfoque', description: 'Para estudiantes con TDAH' },
    { value: 'ocean', label: 'Océano', description: 'Tema azul y sereno' },
    { value: 'sunset', label: 'Atardecer', description: 'Tema cálido y motivador' },
    { value: 'forest', label: 'Bosque', description: 'Tema natural y fresco' },
    { value: 'cosmic', label: 'Cósmico', description: 'Tema futurista' }
];

const TeacherLibrary = () => {
    const { user } = useAuth();
    const [selectedBook, setSelectedBook] = useState(null);
    const [previewBook, setPreviewBook] = useState(null);
    const [selectedPage, setSelectedPage] = useState(1);
    const [isAssignmentMode, setIsAssignmentMode] = useState(false);
    const [classes, setClasses] = useState([]);
    const [selectedClassId, setSelectedClassId] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [config, setConfig] = useState({
        speed: 200,
        technique: 'highlight',
        fontFamily: 'sans-serif',
        fontSize: 18,
        voice: 'Google Español',
        theme: 'minimalist' // Tema por defecto
    });

    // Debug: Log config changes
    useEffect(() => {
        console.log('📚 TeacherLibrary config updated:', config);
    }, [config]);

    // Memoized config change handler to prevent flickering
    const handleConfigChange = React.useCallback((newConfig) => {
        setConfig(prev => {
            const hasChanges =
                prev.speed !== newConfig.speed ||
                prev.technique !== newConfig.technique ||
                prev.theme !== newConfig.theme ||
                prev.fontSize !== newConfig.fontSize ||
                prev.fontFamily !== newConfig.fontFamily ||
                prev.voiceEnabled !== newConfig.voiceEnabled;

            if (!hasChanges) return prev;

            return {
                ...prev,
                ...newConfig
            };
        });
    }, []);

    const [library, setLibrary] = useState([]);

    // Estados para la IA
    const [isGeneratingText, setIsGeneratingText] = useState(false);
    const [showGeneratorModal, setShowGeneratorModal] = useState(false);
    const [topicText, setTopicText] = useState('');
    const [levelText, setLevelText] = useState('Intermedio');
    const [wordsCount, setWordsCount] = useState(150);
    const [language, setLanguage] = useState('Español');
    const [genre, setGenre] = useState('Texto Informativo');
    const [aiProgress, setAiProgress] = useState(null);

    // Preguntas autogeneradas por la IA para asignaciones
    const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);
    const [aiQuestions, setAiQuestions] = useState([]);

    // New evaluation states
    const [assignmentType, setAssignmentType] = useState('practice');
    const [evaluation, setEvaluation] = useState({
        enabled: false,
        showResultsToStudent: false,
        questions: []
    });

    // Edición en línea
    const [isEditingContent, setIsEditingContent] = useState(false);
    const [editContentValue, setEditContentValue] = useState("");

    useEffect(() => {
        onModelProgress((data) => {
            if (data.status === 'progress') {
                setAiProgress(Math.round(data.progress || 0));
            } else if (data.status === 'ready' || data.status === 'done') {
                setAiProgress(null);
            }
        });
    }, []);

    // Reiniciar nivel al cambiar de idioma
    useEffect(() => {
        if (language === 'Inglés') {
            setLevelText('A1.1');
        } else {
            setLevelText('Intermedio');
        }
    }, [language]);

    useEffect(() => {
        const loadClassesFromFirebase = async () => {
            if (user) {
                const fetchedClasses = await FirebaseBackendService.getTeacherClasses(user.uid);
                setClasses(fetchedClasses);
            }
        };
        loadClassesFromFirebase();
        setLibrary(MockBackendService.getLibrary(MOCK_LIBRARY));
    }, [user]);

    const handlePreview = (book) => {
        setPreviewBook(book);
        setSelectedPage(1); // Resetear a página 1 cuando cambie el libro
        setIsEditingContent(false);
    };

    const handleDelete = (book) => {
        // Verificar si el libro está asignado a estudiantes
        if (MockBackendService.isBookAssigned(book.id)) {
            const confirmed = window.confirm(
                `⚠️ Este libro está asignado a estudiantes activos.\n\n` +
                `Si lo eliminas, los estudiantes perderán acceso a esta lectura.\n\n` +
                `¿Estás seguro de que quieres eliminar "${book.title}"?`
            );
            if (!confirmed) return;
        } else {
            const confirmed = window.confirm(
                `¿Estás seguro de que quieres eliminar "${book.title}"?\n\n` +
                `Esta acción no se puede deshacer.`
            );
            if (!confirmed) return;
        }

        // Intentar eliminar el libro
        const success = MockBackendService.removeFromLibrary(book.id);

        if (success) {
            // Actualizar la biblioteca local
            setLibrary(prev => prev.filter(b => b.id !== book.id));

            // Si el libro eliminado era el que estaba en vista previa, limpiarlo
            if (previewBook?.id === book.id) {
                setPreviewBook(null);
                setSelectedPage(1);
            }

            alert(`✅ "${book.title}" ha sido eliminado exitosamente.`);
        } else {
            alert(`❌ Error al eliminar "${book.title}". El libro no se encontró.`);
        }
    };

    const goToNextPage = () => {
        if (previewBook?.pages && selectedPage < previewBook.pages.length) {
            setSelectedPage(selectedPage + 1);
        }
    };

    const goToPreviousPage = () => {
        if (selectedPage > 1) {
            setSelectedPage(selectedPage - 1);
        }
    };

    const handleAssign = (book) => {
        setSelectedBook(book);
        // Select first class by default if available
        if (classes.length > 0) setSelectedClassId(classes[0].id);
        setIsAssignmentMode(true);
    };

    const cancelAssignment = () => {
        setIsAssignmentMode(false);
        setSelectedBook(null);
        setSelectedClassId('');
        setDueDate('');
        setAiQuestions([]); // Limpiar preguntas generadas
        // Reset config to defaults
        setConfig({
            speed: 200,
            technique: 'highlight',
            fontFamily: 'sans-serif',
            fontSize: 18,
            voice: 'Google Español',
            theme: 'minimalist'
        });
    };

    const handleGenerateAIQuestions = async (multipleChoiceCount, openEndedCount) => {
        if (!selectedBook) return;
        setIsGeneratingQuestions(true);
        try {
            const container = getGlobalServiceContainer();
            if (container.has('aiService')) {
                const aiService = container.resolve('aiService');
                const generated = await aiService.generateReadingQuestions(selectedBook.content, multipleChoiceCount, openEndedCount);
                if (generated && generated.length > 0) {
                    const formattedQuestions = generated.map((q, idx) => ({
                        id: `ai_${Date.now()}_${idx}`,
                        type: q.type || 'multiple_choice',
                        question: q.question,
                        options: q.type === 'open_ended' ? undefined : (q.options || ['', '', '', '']),
                        correctAnswer: q.type === 'open_ended' ? undefined : (q.correctAnswer || 0)
                    }));
                    
                    setEvaluation(prev => ({
                        ...prev,
                        enabled: true,
                        questions: [...prev.questions, ...formattedQuestions]
                    }));
                    alert(`✅ IA local generó exitosamente un cuestionario de ${generated.length} preguntas de comprensión lectora.`);
                } else {
                    alert('⚠️ La IA no pudo generar preguntas en este intento. Prueba de nuevo.');
                }
            } else {
                alert('⚠️ El servicio de IA no se encuentra disponible.');
            }
        } catch (error) {
            console.error('Error al generar preguntas con IA:', error);
            alert(`❌ Error al generar la evaluación: ${error.message}`);
        } finally {
            setIsGeneratingQuestions(false);
        }
    };

    const handleGenerateTopicText = async () => {
        if (!topicText.trim()) {
            alert("Por favor ingresa un tema.");
            return;
        }

        setIsGeneratingText(true);
        try {
            const container = getGlobalServiceContainer();
            if (container.has('aiService')) {
                const aiService = container.resolve('aiService');
                
                // Iniciar la generación por tema con la IA local
                const textResult = await aiService.generateReadingByTopic(topicText, levelText, wordsCount, { language, genre });
                
                if (textResult) {
                    // Agregar el libro autogenerado a la biblioteca
                    const titlePrefix = genre === 'Texto Informativo' ? 'Lectura' : genre;
                    const newBook = MockBackendService.addToLibrary({
                        title: `${titlePrefix}: ${topicText}`,
                        author: `IA Generativa - Nivel ${levelText}`,
                        category: "Generado por IA",
                        difficulty: levelText,
                        content: textResult,
                        pages: [textResult],
                        originalFileName: `AI_${topicText.replace(/\s+/g, '_')}.txt`,
                        uploadDate: new Date().toISOString(),
                        fileSize: textResult.length,
                        fileType: "text/plain"
                    });

                    setLibrary(prev => [...prev, newBook]);
                    setPreviewBook(newBook);
                    setSelectedPage(1);
                    setShowGeneratorModal(false);
                    setTopicText('');
                    alert(`✅ Lectura sobre "${topicText}" generada y guardada exitosamente.`);
                } else {
                    alert('⚠️ No se recibió contenido del modelo. Intenta de nuevo.');
                }
            }
        } catch (error) {
            console.error('Error al generar texto por tema:', error);
            alert(`❌ Error al generar la lectura: ${error.message}`);
        } finally {
            setIsGeneratingText(false);
            setAiProgress(null);
        }
    };

    const confirmAssignment = () => {
        if (!selectedClassId) {
            alert("Por favor selecciona una clase.");
            return;
        }

        const selectedClass = classes.find(c => c.id === selectedClassId);

        const assignmentData = {
            // classId and teacherId are now handled by FirebaseBackendService
            className: selectedClass?.name,
            textId: selectedBook.id,
            textTitle: selectedBook.title,
            textAuthor: selectedBook.author,
            dueDate: dueDate || null,
            type: assignmentType,
            config: config, // Pass the teacher's configuration
            evaluation: evaluation // Pasa la configuración de la evaluación y preguntas
        };

        const createAssignAsync = async () => {
            try {
                await FirebaseBackendService.createAssignment(selectedClassId, user.uid, assignmentData);
                alert(`✅ Lectura "${selectedBook.title}" asignada exitosamente a la clase "${selectedClass?.name}".\n\nLos estudiantes podrán comenzar la lectura con la configuración especificada.`);
            } catch (error) {
                alert('❌ Hubo un error al asignar la lectura.');
            }
        };
        
        createAssignAsync();

        // Reset and close
        setIsAssignmentMode(false);
        setSelectedBook(null);
        setSelectedClassId('');
        setDueDate('');
        setAiQuestions([]); // Limpiar preguntas generadas
        setAssignmentType('practice');
        setEvaluation({ enabled: false, showResultsToStudent: false, questions: [] });
        // Reset config to defaults
        setConfig({
            speed: 200,
            technique: 'highlight',
            fontFamily: 'sans-serif',
            fontSize: 18,
            voice: 'Google Español',
            theme: 'minimalist'
        });
    };

    const memoizedInitialConfig = React.useMemo(() => ({
        speed: config.speed,
        technique: config.technique,
        theme: config.theme,
        fontSize: config.fontSize,
        fontFamily: config.fontFamily,
        voiceEnabled: config.voiceEnabled
    }), [config.speed, config.technique, config.theme, config.fontSize, config.fontFamily, config.voiceEnabled]);

    return (
        <div className="space-y-6">
            <div className="bg-white/60 backdrop-blur-md p-6 rounded-3xl border border-white/40 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Biblioteca General</h1>
                    <p className="text-slate-500 font-medium">Explora y asigna lecturas a tus estudiantes</p>
                </div>
            </div>

            {/* Assignment Mode - Preview with Configuration */}
            {isAssignmentMode && selectedBook ? (
                <div className="fixed inset-0 z-50 bg-white flex flex-col">
                    {/* Configuración superior unificada */}
                    <AssignmentConfigurator
                        selectedClassId={selectedClassId}
                        setSelectedClassId={setSelectedClassId}
                        dueDate={dueDate}
                        setDueDate={setDueDate}
                        classes={classes}
                        onCancel={cancelAssignment}
                        onConfirm={confirmAssignment}
                        isValid={!!selectedClassId}
                        assignmentType={assignmentType}
                        setAssignmentType={setAssignmentType}
                        evaluation={evaluation}
                        setEvaluation={setEvaluation}
                        onGenerateAIQuestions={handleGenerateAIQuestions}
                    />

                    {/* Vista de lectura completa usando GenericReadingView */}
                    <div className="flex-1 overflow-hidden relative">
                        <GenericReadingView
                            modeId="preview"
                            initialText={selectedBook.content}
                            initialConfig={memoizedInitialConfig}
                            onConfigChange={handleConfigChange}
                            isPreviewMode={true}
                            hideFullSidebar={false}
                            bookTitle={selectedBook.title}
                        />
                    </div>
                </div>
            ) : (
                <>
                    <div className="flex flex-wrap justify-end gap-3 mb-4">
                        <button
                            onClick={() => setShowGeneratorModal(true)}
                            className="bg-purple-100 text-purple-700 hover:bg-purple-200 px-5 py-3 rounded-xl font-bold transition-all flex items-center gap-2"
                        >
                            <span>✨</span>
                            Generar con IA
                        </button>

                        <label className="cursor-pointer bg-gradient-to-r from-orange-500 to-orange-600 text-white px-5 py-3 rounded-xl hover:shadow-lg hover:scale-[1.02] transition-all font-bold flex items-center gap-2 shadow-orange-200 shadow-md">
                            <span>📤</span>
                            Cargar Material
                            <input
                                type="file"
                                accept=".pdf,.txt"
                                className="hidden"
                                onChange={async (e) => {
                                    const file = e.target.files[0];
                                    if (!file) return;

                                    let content = "";
                                    let pages = [];
                                    let title = file.name.replace(/\.[^/.]+$/, "");
                                    let metadata = {};

                                    try {
                                        if (file.type === "application/pdf") {
                                            // Cargar worker de PDF.js
                                            const pdfjsLib = await import("pdfjs-dist");
                                            const workerUrl = (await import("pdfjs-dist/build/pdf.worker.min.mjs?url")).default;
                                            pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;

                                            // Mostrar progreso de carga
                                            console.log("📄 Procesando PDF:", file.name);

                                            const arrayBuffer = await file.arrayBuffer();
                                            const pdf = await pdfjsLib.getDocument({
                                                data: arrayBuffer,
                                                // Opciones para mejor OCR
                                                disableFontFace: false,
                                                disableRange: false,
                                                disableStream: false,
                                                disableAutoFetch: false,
                                            }).promise;

                                            // Extraer metadata del PDF
                                            const pdfInfo = await pdf.getMetadata();
                                            metadata = {
                                                totalPages: pdf.numPages,
                                                title: pdfInfo.info?.Title || title,
                                                author: pdfInfo.info?.Author || "Desconocido",
                                                creator: pdfInfo.info?.Creator,
                                                producer: pdfInfo.info?.Producer,
                                                creationDate: pdfInfo.info?.CreationDate,
                                                modificationDate: pdfInfo.info?.ModDate,
                                            };

                                            console.log("📊 Metadata del PDF:", metadata);

                                            // Procesar cada página con mejor OCR
                                            pages = [];
                                            for (let i = 1; i <= pdf.numPages; i++) {
                                                console.log(`📖 Procesando página ${i}/${pdf.numPages}`);

                                                const page = await pdf.getPage(i);
                                                const viewport = page.getViewport({ scale: 1.5 }); // Mejor resolución para OCR

                                                // Intentar extraer texto con mejor configuración
                                                const textContent = await page.getTextContent({
                                                    disableCombineTextItems: false,
                                                    includeMarkedContent: false,
                                                });

                                                // Procesar items de texto con mejor formato
                                                let pageText = "";
                                                let lastY = null;
                                                const textItems = textContent.items;

                                                for (let j = 0; j < textItems.length; j++) {
                                                    const item = textItems[j];
                                                    const currentY = Math.round(item.transform[5]);

                                                    // Agregar salto de línea si hay cambio significativo en Y
                                                    if (lastY !== null && Math.abs(currentY - lastY) > 10) {
                                                        pageText += "\n";
                                                    }

                                                    pageText += item.str;
                                                    lastY = currentY;
                                                }

                                                // Limpiar y formatear el texto
                                                pageText = pageText
                                                    .replace(/\s+/g, ' ')  // Múltiples espacios → uno solo
                                                    .replace(/-\s+/g, '')  // Quitar guiones de separación
                                                    .trim();

                                                pages.push(pageText);
                                                console.log(`✅ Página ${i} procesada: ${pageText.length} caracteres`);
                                            }

                                            // Unir todas las páginas con separadores claros
                                            content = pages.join("\n\n--- Página ---\n\n");

                                            console.log("🎉 PDF procesado exitosamente:", {
                                                totalPages: pages.length,
                                                totalCharacters: content.length,
                                                totalWords: content.split(/\s+/).length
                                            });

                                        } else if (file.type === "text/plain") {
                                            content = await file.text();
                                            pages = [content]; // Un solo "página" para archivos de texto
                                            metadata = {
                                                totalPages: 1,
                                                title: title,
                                                author: "Archivo de texto",
                                                type: "text/plain"
                                            };
                                        } else {
                                            throw new Error(`Tipo de archivo no soportado: ${file.type}`);
                                        }

                                        // Crear el libro con toda la información
                                        const newBook = MockBackendService.addToLibrary({
                                            title: metadata.title || title,
                                            author: metadata.author || "Material Docente",
                                            category: file.type === "application/pdf" ? "PDF Digital" : "Documento de Texto",
                                            difficulty: "N/A",
                                            content: content,
                                            metadata: metadata,
                                            pages: pages,
                                            originalFileName: file.name,
                                            uploadDate: new Date().toISOString(),
                                            fileSize: file.size,
                                            fileType: file.type
                                        });

                                        // Actualizar la biblioteca local
                                        setLibrary(prev => [...prev, newBook]);

                                        // Clasificar dificultad pedagógica en background con IA local
                                        try {
                                            const container = getGlobalServiceContainer();
                                            if (container.has('aiService')) {
                                                const aiService = container.resolve('aiService');
                                                // Un WARM UP rápido que deduce el nivel según la complejidad del texto
                                                const wordsList = content.split(/\s+/).filter(w => w.length > 0);
                                                const numWords = wordsList.length;
                                                const avgWordLen = wordsList.reduce((acc, w) => acc + w.length, 0) / (numWords || 1);
                                                
                                                let diff = "Intermedio";
                                                if (avgWordLen < 4.9 && numWords < 400) {
                                                    diff = "Básico";
                                                } else if (avgWordLen > 5.9 || numWords > 1200) {
                                                    diff = "Avanzado";
                                                }

                                                // Actualizar en background
                                                newBook.difficulty = diff;
                                                const customItems = JSON.parse(localStorage.getItem('aleer_db_library') || '[]');
                                                const idx = customItems.findIndex(item => item.id === newBook.id);
                                                if (idx >= 0) {
                                                    customItems[idx].difficulty = diff;
                                                    localStorage.setItem('aleer_db_library', JSON.stringify(customItems));
                                                }
                                                setLibrary(prev => prev.map(b => b.id === newBook.id ? { ...b, difficulty: diff } : b));
                                            }
                                        } catch (e) {
                                            console.warn("No se pudo iniciar el análisis de dificultad IA:", e);
                                        }

                                        // Feedback al usuario
                                        alert(`✅ Material cargado exitosamente!\n\n📄 ${metadata.totalPages || 1} página(s)\n📝 ${content.split(/\s+/).length} palabras\n📊 ${content.length} caracteres`);

                                        console.log("📚 Libro agregado a la biblioteca:", newBook);

                                    } catch (error) {
                                        console.error("❌ Error al procesar archivo:", error);
                                        alert(`Error al procesar el archivo: ${error.message}\n\nVerifica que el archivo no esté corrupto o protegido.`);
                                    }
                                }}
                            />
                        </label>
                    </div>

                    {/* Layout de dos columnas: Lista + Vista Previa */}
                    <div className="grid lg:grid-cols-2 gap-8 h-[calc(100vh-200px)]">
                        {/* Columna Izquierda: Lista de Libros */}
                        <div className="space-y-4">
                            <h2 className="text-lg font-semibold text-gray-800 mb-4">Materiales Disponibles</h2>
                            <div className="space-y-3 max-h-[600px] overflow-y-auto">
                                {library.map((book) => (
                                    <div
                                        key={book.id}
                                        className={`rounded-2xl p-4 transition-all cursor-pointer relative group border backdrop-blur-sm ${previewBook?.id === book.id
                                            ? 'bg-indigo-600/90 text-white border-indigo-500 shadow-lg shadow-indigo-200'
                                            : 'bg-white/60 text-slate-700 border-white/40 hover:bg-white hover:shadow-md'
                                            }`}
                                        onClick={() => handlePreview(book)}
                                    >
                                        {/* Botón de eliminar - solo para libros personalizados */}
                                        {book.isCustom && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation(); // Prevenir que active la selección
                                                    handleDelete(book);
                                                }}
                                                className={`absolute top-2 right-2 p-1.5 rounded-lg transition-colors opacity-0 group-hover:opacity-100 ${previewBook?.id === book.id ? 'bg-indigo-500 hover:bg-indigo-400 text-white' : 'bg-red-50 hover:bg-red-100 text-red-600'}`}
                                                title={`Eliminar "${book.title}"`}
                                            >
                                                <TrashIcon className="w-4 h-4" />
                                            </button>
                                        )}

                                        <div className="flex justify-between items-start mb-2 pr-10">
                                            <span className={`text-xs font-bold px-2 py-1 rounded-md ${previewBook?.id === book.id ? 'bg-indigo-500/50 text-indigo-100' : 'bg-indigo-100 text-indigo-700'}`}>
                                                {book.category}
                                            </span>
                                            {previewBook?.id === book.id && (
                                                <span className="text-xs text-indigo-200 font-medium">Seleccionado</span>
                                            )}
                                        </div>
                                        <h3 className={`text-base font-bold mb-1 ${previewBook?.id === book.id ? 'text-white' : 'text-slate-800'}`}>{book.title}</h3>
                                        <p className={`text-sm mb-2 ${previewBook?.id === book.id ? 'text-indigo-200' : 'text-slate-500'}`}>{book.author}</p>
                                        <p className={`text-xs line-clamp-2 italic ${previewBook?.id === book.id ? 'text-indigo-100' : 'text-slate-400'}`}>
                                            "{book.content.substring(0, 80)}..."
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Columna Derecha: Vista Previa */}
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <h2 className="text-lg font-semibold text-gray-800">Vista Previa</h2>
                                <div className="flex gap-2">
                                    {previewBook && (
                                        <>
                                            <button
                                                onClick={() => {
                                                    // Cuando tengamos preguntas desde la biblioteca, las pasaremos aquí
                                                    exportToPDF(previewBook.title, previewBook.author, previewBook.content, []);
                                                }}
                                                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors flex items-center gap-2 font-bold shadow-sm"
                                            >
                                                <span>🖨️</span> PDF
                                            </button>
                                            <button
                                                onClick={() => handleAssign(previewBook)}
                                                className="px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl hover:shadow-lg transition-all flex items-center gap-2 font-bold"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                                </svg>
                                                Asignar a Clase
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>

                            {previewBook ? (
                                <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden h-[calc(100%-80px)] flex flex-col">
                                    {/* Header del libro */}
                                    <div className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50 border-b border-indigo-100/50">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex-1">
                                                <span className="text-xs font-bold text-indigo-700 bg-indigo-100/80 px-3 py-1 rounded-md mb-3 inline-block">
                                                    {previewBook.category}
                                                </span>
                                                <h3 className="text-2xl font-bold text-slate-800 mb-1">{previewBook.title}</h3>
                                                <p className="text-sm text-slate-600 font-medium mb-4">{previewBook.author}</p>

                                                {/* Metadata adicional para PDFs */}
                                                {previewBook.metadata && (
                                                    <div className="flex flex-wrap gap-4 text-xs text-slate-500 bg-white/60 p-3 rounded-xl border border-white/60">
                                                        {previewBook.metadata.totalPages && (
                                                            <div className="flex items-center gap-1">
                                                                <span className="font-bold text-slate-700">Páginas:</span> {previewBook.metadata.totalPages}
                                                            </div>
                                                        )}
                                                        {previewBook.fileSize && (
                                                            <div className="flex items-center gap-1">
                                                                <span className="font-bold text-slate-700">Tamaño:</span> {(previewBook.fileSize / 1024).toFixed(1)} KB
                                                            </div>
                                                        )}
                                                        {previewBook.uploadDate && (
                                                            <div className="flex items-center gap-1">
                                                                <span className="font-bold text-slate-700">Subido:</span> {new Date(previewBook.uploadDate).toLocaleDateString()}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="text-right text-xs text-slate-500 ml-4 flex flex-col gap-1 bg-white/60 p-3 rounded-xl border border-white/60">
                                                <p className="font-bold text-slate-700">{previewBook.content.split(/\s+/).filter(word => word.length > 0).length} <span className="font-normal text-slate-500">palabras</span></p>
                                                <p className="font-bold text-slate-700">{previewBook.content.length} <span className="font-normal text-slate-500">caracteres</span></p>
                                                {previewBook.pages && (
                                                    <p className="font-bold text-indigo-600 mt-1 pt-1 border-t border-indigo-100/50">{previewBook.pages.length} página(s)</p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Navegación de páginas para PDFs con múltiples páginas */}
                                        {previewBook.pages && previewBook.pages.length > 1 && (
                                            <div className="flex items-center justify-center gap-4 mt-4 p-3 bg-orange-50 rounded-lg">
                                                <button
                                                    onClick={goToPreviousPage}
                                                    disabled={selectedPage <= 1}
                                                    className="p-2 bg-white rounded-lg hover:bg-orange-100 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                                                    </svg>
                                                </button>

                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm text-gray-600">Página</span>
                                                    <select
                                                        value={selectedPage}
                                                        onChange={(e) => setSelectedPage(Number(e.target.value))}
                                                        className="px-2 py-1 border border-gray-300 rounded text-sm bg-white"
                                                    >
                                                        {previewBook.pages.map((_, index) => (
                                                            <option key={index + 1} value={index + 1}>
                                                                {index + 1}
                                                            </option>
                                                        ))}
                                                    </select>
                                                    <span className="text-sm text-gray-600">de {previewBook.pages.length}</span>
                                                </div>

                                                <button
                                                    onClick={goToNextPage}
                                                    disabled={selectedPage >= previewBook.pages.length}
                                                    className="p-2 bg-white rounded-lg hover:bg-orange-100 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                                                    </svg>
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    {/* Contenido del libro */}
                                    <div className="flex-1 p-6 overflow-y-auto">
                                        <div className="prose prose-sm max-w-none">
                                            {previewBook.pages && previewBook.pages.length > 1 ? (
                                                // Mostrar página específica para PDFs multi-página
                                                <div className="space-y-4">
                                                    <div className="border-l-4 border-orange-400 pl-4 py-2 bg-orange-50 rounded">
                                                        <h4 className="text-sm font-semibold text-orange-800 mb-2">Página {selectedPage}</h4>
                                                        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                                                            {previewBook.pages[selectedPage - 1] || "Página sin contenido"}
                                                        </p>
                                                    </div>
                                                    {selectedPage < previewBook.pages.length && (
                                                        <div className="text-xs text-gray-500 italic border-t pt-2">
                                                            💡 Página siguiente: "{previewBook.pages[selectedPage].substring(0, 100)}..."
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                // Mostrar contenido completo para textos simples
                                                <div className="relative group">
                                                    {isEditingContent ? (
                                                        <div className="flex flex-col gap-3">
                                                            <textarea
                                                                className="w-full h-96 p-4 border-2 border-purple-300 rounded-xl focus:ring-purple-500 focus:border-purple-500 outline-none text-gray-700 leading-relaxed resize-none shadow-sm"
                                                                value={editContentValue}
                                                                onChange={(e) => setEditContentValue(e.target.value)}
                                                            />
                                                            <div className="flex justify-end gap-2">
                                                                <button
                                                                    onClick={() => setIsEditingContent(false)}
                                                                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
                                                                >
                                                                    Cancelar
                                                                </button>
                                                                <button
                                                                    onClick={() => {
                                                                        const updatedBook = MockBackendService.updateBook(previewBook.id, editContentValue);
                                                                        if (updatedBook) {
                                                                            setPreviewBook(updatedBook);
                                                                            setLibrary(prev => prev.map(b => b.id === updatedBook.id ? updatedBook : b));
                                                                        }
                                                                        setIsEditingContent(false);
                                                                    }}
                                                                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                                                                >
                                                                    Guardar Cambios
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                                                                {previewBook.content}
                                                            </p>
                                                            {previewBook.isCustom && (
                                                                <button
                                                                    onClick={() => {
                                                                        setEditContentValue(previewBook.content);
                                                                        setIsEditingContent(true);
                                                                    }}
                                                                    className="absolute top-0 right-0 p-2 bg-white border border-gray-200 text-gray-500 hover:text-purple-600 hover:border-purple-300 shadow-sm rounded-lg opacity-0 group-hover:opacity-100 transition-all flex items-center gap-2"
                                                                    title="Editar este texto"
                                                                >
                                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                                                    Editar
                                                                </button>
                                                            )}
                                                        </>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 h-[calc(100%-80px)] flex items-center justify-center">
                                    <div className="text-center text-gray-400">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 mx-auto mb-4 opacity-50">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                        </svg>
                                        <p className="text-sm">Selecciona un material de la lista para ver su contenido</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Modal de Generación de Lectura por IA */}
                    {showGeneratorModal && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                            <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
                                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-purple-600">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
                                    </svg>
                                    Generar Lectura con IA
                                </h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Tema o Asunto</label>
                                        <input
                                            type="text"
                                            value={topicText}
                                            onChange={(e) => setTopicText(e.target.value)}
                                            placeholder="Ej. El ciclo del agua, Los dinosaurios..."
                                            className="w-full px-4 py-2 text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                                            disabled={isGeneratingText}
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Idioma</label>
                                            <select
                                                value={language}
                                                onChange={(e) => setLanguage(e.target.value)}
                                                className="w-full px-4 py-2 text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                                                disabled={isGeneratingText}
                                            >
                                                <option value="Español">Español</option>
                                                <option value="Inglés">Inglés</option>
                                                <option value="Francés">Francés</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Texto</label>
                                            <select
                                                value={genre}
                                                onChange={(e) => setGenre(e.target.value)}
                                                className="w-full px-4 py-2 text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                                                disabled={isGeneratingText}
                                            >
                                                <option value="Texto Informativo">Informativo</option>
                                                <option value="Cuento Corto">Cuento / Historia</option>
                                                <option value="Diálogo">Diálogo</option>
                                                <option value="Poema">Poema</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Nivel Pedagógico</label>
                                            <select
                                                value={levelText}
                                                onChange={(e) => setLevelText(e.target.value)}
                                                className="w-full px-4 py-2 text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                                                disabled={isGeneratingText}
                                            >
                                                {language === 'Inglés' ? (
                                                    <>
                                                        <option value="A1.1">A1.1 (Principiante básico)</option>
                                                        <option value="A1.2">A1.2 (Principiante superior)</option>
                                                        <option value="A2.1">A2.1 (Pre-intermedio bajo)</option>
                                                        <option value="A2.2">A2.2 (Pre-intermedio alto)</option>
                                                        <option value="B1.1">B1.1 (Intermedio bajo)</option>
                                                        <option value="B1.2">B1.2 (Intermedio alto)</option>
                                                        <option value="B2.1">B2.1 (Intermedio-Alto bajo)</option>
                                                        <option value="B2.2">B2.2 (Intermedio-Alto superior)</option>
                                                        <option value="C1">C1 (Avanzado)</option>
                                                    </>
                                                ) : (
                                                    <>
                                                        <option value="Básico">Básico (Fácil)</option>
                                                        <option value="Intermedio">Intermedio</option>
                                                        <option value="Avanzado">Avanzado (Complejo)</option>
                                                    </>
                                                )}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Palabras (Aprox)</label>
                                            <select
                                                value={wordsCount}
                                                onChange={(e) => setWordsCount(Number(e.target.value))}
                                                className="w-full px-4 py-2 text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                                                disabled={isGeneratingText}
                                            >
                                                <option value={100}>Corto (100)</option>
                                                <option value={200}>Mediano (200)</option>
                                                <option value={400}>Largo (400)</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                                
                                {isGeneratingText && (
                                    <div className="mt-4 p-3 bg-purple-50 rounded-lg">
                                        <div className="flex items-center gap-3 text-purple-700 font-medium">
                                            <div className="w-5 h-5 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                                            <span>Generando lectura con IA...</span>
                                        </div>
                                        {aiProgress !== null && (
                                            <div className="mt-2 w-full bg-purple-200 rounded-full h-2">
                                                <div className="bg-purple-600 h-2 rounded-full transition-all duration-300" style={{ width: `${aiProgress}%` }}></div>
                                            </div>
                                        )}
                                        <p className="text-xs text-purple-600 mt-1 opacity-70">
                                            Esto puede tomar unos segundos.
                                        </p>
                                    </div>
                                )}

                                <div className="mt-6 flex justify-end gap-3">
                                    <button
                                        onClick={() => setShowGeneratorModal(false)}
                                        className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
                                        disabled={isGeneratingText}
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={handleGenerateTopicText}
                                        disabled={isGeneratingText || !topicText.trim()}
                                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Generar y Guardar
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}


                </>
            )}
        </div>
    );
};

export default TeacherLibrary;
