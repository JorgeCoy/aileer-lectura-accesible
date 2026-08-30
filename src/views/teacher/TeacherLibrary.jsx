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
import { analyzeReadability } from '../../utils/readability';

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

    // Filtros de Biblioteca
    const [searchTerm, setSearchTerm] = useState("");
    const [filters, setFilters] = useState({
        category: "Todas",
        difficulty: "Todas",
        source: "Todos"
    });
    const [showFilterMenu, setShowFilterMenu] = useState(false);
    const [viewMode, setViewMode] = useState('detailed');
    const filterMenuRef = React.useRef(null);

    React.useEffect(() => {
        const handleClickOutside = (event) => {
            if (filterMenuRef.current && !filterMenuRef.current.contains(event.target)) {
                setShowFilterMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const filteredLibrary = React.useMemo(() => {
        return library.filter(book => {
            const matchesSearch = !searchTerm || 
                book.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                (book.author && book.author.toLowerCase().includes(searchTerm.toLowerCase()));
            
            const matchesCategory = filters.category === "Todas" || book.category === filters.category;
            
            const matchesDifficulty = filters.difficulty === "Todas" || book.difficulty === filters.difficulty;
            
            let matchesSource = true;
            if (filters.source === "Catálogo Base") matchesSource = !book.isCustom;
            if (filters.source === "Generados por IA") matchesSource = book.isCustom && book.author?.startsWith("IA");
            if (filters.source === "Material Propio") matchesSource = book.isCustom && !book.author?.startsWith("IA");
            
            return matchesSearch && matchesCategory && matchesDifficulty && matchesSource;
        });
    }, [library, searchTerm, filters]);

    const uniqueCategories = React.useMemo(() => {
        const cats = new Set(library.map(b => b.category).filter(Boolean));
        return ["Todas", ...Array.from(cats)];
    }, [library]);

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

    const readabilityStats = React.useMemo(() => {
        if (!previewBook?.content) return null;
        return analyzeReadability(previewBook.content);
    }, [previewBook?.content]);

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
                        category: `IA ${genre.toUpperCase()}`,
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
        <div className="h-full flex flex-col">
            {/* Assignment Mode - Preview with Configuration */}
            {isAssignmentMode && selectedBook ? (
                <div className="fixed inset-0 z-50 bg-background flex flex-col">
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
                <div className="space-y-6 flex-1 flex flex-col">
                    <div className="bg-surface/80 backdrop-blur-xl p-4 md:p-5 rounded-2xl border border-border-color/50 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-all">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                                <span className="text-xl">📚</span>
                            </div>
                            <div>
                                <h1 className="text-xl md:text-2xl font-display font-black text-text-main leading-tight">Biblioteca General</h1>
                                <p className="text-text-muted font-medium text-xs md:text-sm">Explora y asigna lecturas a tus estudiantes</p>
                            </div>
                        </div>

                        <div className="flex flex-wrap w-full md:w-auto gap-3">
                            <button
                                onClick={() => setShowGeneratorModal(true)}
                                className="flex-1 md:flex-none bg-purple-100 text-purple-700 hover:bg-purple-200 px-4 py-2.5 rounded-xl font-bold transition-all flex justify-center items-center gap-2 text-sm shadow-sm"
                            >
                                <span>✨</span>
                                <span>Generar con IA</span>
                            </button>

                            <label className="flex-1 md:flex-none cursor-pointer bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-2.5 rounded-xl hover:shadow-lg hover:scale-[1.02] transition-all font-bold flex justify-center items-center gap-2 shadow-orange-500/20 shadow-md text-sm">
                                <span>📤</span>
                                <span>Cargar Material</span>
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

                                        // Clasificar dificultad pedagógica matemáticamente
                                        try {
                                            const stats = analyzeReadability(content);
                                            const diff = stats ? stats.difficulty : "Intermedio";

                                            // Actualizar en background
                                            newBook.difficulty = diff;
                                                const customItems = JSON.parse(localStorage.getItem('aleer_db_library') || '[]');
                                                const idx = customItems.findIndex(item => item.id === newBook.id);
                                                if (idx >= 0) {
                                                    customItems[idx].difficulty = diff;
                                                    localStorage.setItem('aleer_db_library', JSON.stringify(customItems));
                                                }
                                                setLibrary(prev => prev.map(b => b.id === newBook.id ? { ...b, difficulty: diff } : b));
                                        } catch (e) {
                                            console.warn("No se pudo iniciar el análisis de dificultad:", e);
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
                </div>

                {/* Filter Bar */}
                <div className="flex flex-col md:flex-row gap-3 items-start md:items-center relative z-20">
                    <div className="relative flex-1 w-full">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
                        <input 
                            type="text"
                            placeholder="Buscar por título o autor..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-surface border border-border-color rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm shadow-sm"
                        />
                    </div>
                    
                    <div className="relative" ref={filterMenuRef}>
                        <button
                            onClick={() => setShowFilterMenu(!showFilterMenu)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border font-medium text-sm transition-all ${
                                showFilterMenu || Object.values(filters).some(v => v !== 'Todas' && v !== 'Todos') 
                                    ? 'bg-primary text-white border-primary shadow-md shadow-primary/20' 
                                    : 'bg-surface text-text-main border-border-color hover:bg-surface-elevated'
                            }`}
                        >
                            <span>⚙️</span>
                            <span>Filtros Avanzados</span>
                            {Object.values(filters).filter(v => v !== 'Todas' && v !== 'Todos').length > 0 && (
                                <span className="bg-white/30 px-2 py-0.5 rounded-full text-xs">
                                    {Object.values(filters).filter(v => v !== 'Todas' && v !== 'Todos').length}
                                </span>
                            )}
                        </button>

                        {/* Dropdown de Filtros */}
                        {showFilterMenu && (
                            <div className="absolute right-0 top-full mt-2 w-72 bg-surface border border-border-color shadow-xl rounded-2xl p-4 z-50">
                                <h3 className="font-bold text-text-main mb-3">Filtros Avanzados</h3>
                                
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-xs font-semibold text-text-muted mb-1 block">Categoría</label>
                                        <select 
                                            value={filters.category} 
                                            onChange={(e) => setFilters({...filters, category: e.target.value})}
                                            className="w-full bg-background border border-border-color rounded-lg px-3 py-2 text-sm outline-none focus:border-primary"
                                        >
                                            {uniqueCategories.map(cat => (
                                                <option key={cat} value={cat}>{cat}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="text-xs font-semibold text-text-muted mb-1 block">Origen</label>
                                        <select 
                                            value={filters.source} 
                                            onChange={(e) => setFilters({...filters, source: e.target.value})}
                                            className="w-full bg-background border border-border-color rounded-lg px-3 py-2 text-sm outline-none focus:border-primary"
                                        >
                                            <option value="Todos">Todos los orígenes</option>
                                            <option value="Catálogo Base">Catálogo Base</option>
                                            <option value="Generados por IA">Generados por IA</option>
                                            <option value="Material Propio">Material Propio</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="text-xs font-semibold text-text-muted mb-1 block">Dificultad</label>
                                        <select 
                                            value={filters.difficulty} 
                                            onChange={(e) => setFilters({...filters, difficulty: e.target.value})}
                                            className="w-full bg-background border border-border-color rounded-lg px-3 py-2 text-sm outline-none focus:border-primary"
                                        >
                                            <option value="Todas">Cualquier dificultad</option>
                                            <option value="Fácil">Fácil</option>
                                            <option value="Medio">Medio</option>
                                            <option value="Difícil">Difícil</option>
                                        </select>
                                    </div>
                                </div>
                                
                                <div className="mt-4 pt-3 border-t border-border-color flex justify-end">
                                    <button 
                                        onClick={() => setFilters({category: 'Todas', difficulty: 'Todas', source: 'Todos'})}
                                        className="text-xs text-red-500 hover:text-red-600 font-medium px-2 py-1"
                                    >
                                        Limpiar Filtros
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Chips de filtros activos */}
                {(filters.category !== 'Todas' || filters.source !== 'Todos' || filters.difficulty !== 'Todas') && (
                    <div className="flex flex-wrap gap-2 items-center mb-1">
                        <span className="text-xs text-text-muted font-medium mr-1">Activos:</span>
                        {filters.category !== 'Todas' && (
                            <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                                {filters.category}
                                <button onClick={() => setFilters({...filters, category: 'Todas'})} className="hover:text-blue-900 font-bold ml-1">×</button>
                            </span>
                        )}
                        {filters.source !== 'Todos' && (
                            <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                                {filters.source}
                                <button onClick={() => setFilters({...filters, source: 'Todos'})} className="hover:text-purple-900 font-bold ml-1">×</button>
                            </span>
                        )}
                        {filters.difficulty !== 'Todas' && (
                            <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                                {filters.difficulty}
                                <button onClick={() => setFilters({...filters, difficulty: 'Todas'})} className="hover:text-green-900 font-bold ml-1">×</button>
                            </span>
                        )}
                    </div>
                )}

                {/* Layout de dos columnas: Lista + Vista Previa */}
                <div className="grid lg:grid-cols-2 gap-8 h-[calc(100vh-200px)]">
                        {/* Columna Izquierda: Lista de Libros */}
                        <div className="flex flex-col h-full min-h-0">
                            <h2 className="text-lg font-semibold text-text-main mb-4 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <span>Materiales Disponibles</span>
                                    <span className="text-sm font-normal text-text-muted bg-surface-elevated px-3 py-1 rounded-full">
                                        {filteredLibrary.length} {filteredLibrary.length === 1 ? 'resultado' : 'resultados'}
                                    </span>
                                </div>
                                <div className="flex bg-surface-elevated rounded-lg p-1 border border-border-color">
                                    <button
                                        onClick={() => setViewMode('detailed')}
                                        className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${viewMode === 'detailed' ? 'bg-background shadow-sm text-text-main' : 'text-text-muted hover:text-text-main'}`}
                                        title="Vista Detallada"
                                    >
                                        Detalle
                                    </button>
                                    <button
                                        onClick={() => setViewMode('compact')}
                                        className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${viewMode === 'compact' ? 'bg-background shadow-sm text-text-main' : 'text-text-muted hover:text-text-main'}`}
                                        title="Vista Compacta"
                                    >
                                        Lista
                                    </button>
                                </div>
                            </h2>
                            <div className="space-y-3 flex-1 overflow-y-auto pr-2 custom-scrollbar min-h-0 mb-4">
                                {filteredLibrary.length === 0 && (
                                    <div className="text-center py-10 bg-surface rounded-2xl border border-border-color border-dashed">
                                        <span className="text-3xl mb-3 block">🕵️‍♂️</span>
                                        <h3 className="text-text-main font-semibold">No hay resultados</h3>
                                        <p className="text-text-muted text-sm mt-1">Prueba quitando algunos filtros o cambiando tu búsqueda.</p>
                                    </div>
                                )}
                                {filteredLibrary.map((book) => (
                                    <div
                                        key={book.id}
                                        className={`transition-all cursor-pointer relative group border ${
                                            viewMode === 'detailed' ? 'rounded-2xl p-4' : 'rounded-xl p-3 flex items-center justify-between gap-3'
                                        } ${previewBook?.id === book.id
                                            ? 'bg-primary text-background border-primary shadow-lg shadow-primary/20'
                                            : 'bg-surface text-text-main border-border-color hover:bg-surface-elevated hover:shadow-md'
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
                                                className={`absolute ${viewMode === 'detailed' ? 'top-2 right-2' : 'top-1/2 -translate-y-1/2 right-2'} p-1.5 rounded-lg transition-colors opacity-0 group-hover:opacity-100 ${previewBook?.id === book.id ? 'bg-background/20 hover:bg-background/30 text-background' : 'bg-red-500/10 hover:bg-red-500/20 text-red-500'}`}
                                                title={`Eliminar "${book.title}"`}
                                            >
                                                <TrashIcon className="w-4 h-4" />
                                            </button>
                                        )}

                                        {viewMode === 'detailed' ? (
                                            <>
                                                <div className="flex justify-between items-start mb-2 pr-10">
                                                    <span className={`text-xs font-bold px-2 py-1 rounded-md ${previewBook?.id === book.id ? 'bg-background/20 text-background' : 'bg-surface-elevated text-text-muted border border-border-color'}`}>
                                                        {book.category}
                                                    </span>
                                                    {previewBook?.id === book.id && (
                                                        <span className="text-xs text-background/80 font-medium">Seleccionado</span>
                                                    )}
                                                </div>
                                                <h3 className={`text-base font-bold mb-1 ${previewBook?.id === book.id ? 'text-background' : 'text-text-main'}`}>{book.title}</h3>
                                                <p className={`text-sm mb-2 ${previewBook?.id === book.id ? 'text-background/80' : 'text-text-muted'}`}>{book.author}</p>
                                                <p className={`text-xs line-clamp-2 italic ${previewBook?.id === book.id ? 'text-background/70' : 'text-text-muted'}`}>
                                                    "{book.content.substring(0, 80)}..."
                                                </p>
                                            </>
                                        ) : (
                                            <>
                                                <div className="flex-1 min-w-0 pr-8">
                                                    <div className="flex items-center gap-2 mb-0.5">
                                                        <h3 className={`text-sm font-bold truncate ${previewBook?.id === book.id ? 'text-background' : 'text-text-main'}`}>{book.title}</h3>
                                                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded flex-shrink-0 ${previewBook?.id === book.id ? 'bg-background/20 text-background' : 'bg-surface-elevated text-text-muted border border-border-color'}`}>
                                                            {book.category}
                                                        </span>
                                                    </div>
                                                    <p className={`text-xs truncate ${previewBook?.id === book.id ? 'text-background/80' : 'text-text-muted'}`}>{book.author}</p>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Columna Derecha: Vista Previa */}
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <h2 className="text-lg font-semibold text-text-main">Vista Previa</h2>
                                <div className="flex gap-2">
                                    {previewBook && (
                                        <>
                                            <button
                                                onClick={() => {
                                                    // Cuando tengamos preguntas desde la biblioteca, las pasaremos aquí
                                                    exportToPDF(previewBook.title, previewBook.author, previewBook.content, []);
                                                }}
                                                className="px-4 py-2 bg-surface-elevated border border-border-color text-text-main rounded-xl hover:bg-surface transition-colors flex items-center gap-2 font-bold shadow-sm"
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
                                <div className="bg-surface rounded-3xl shadow-sm border border-border-color overflow-hidden h-[calc(100%-80px)] flex flex-col">
                                    {/* Header del libro */}
                                    <div className="p-6 bg-surface-elevated border-b border-border-color">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex-1">
                                                <span className="text-xs font-bold text-text-muted bg-surface border border-border-color px-3 py-1 rounded-md mb-3 inline-block">
                                                    {previewBook.category}
                                                </span>
                                                <h3 className="text-2xl font-bold text-text-main mb-1">{previewBook.title}</h3>
                                                <p className="text-sm text-text-muted font-medium mb-4">{previewBook.author}</p>

                                                {/* Metadata adicional para PDFs */}
                                                {previewBook.metadata && (
                                                    <div className="flex flex-wrap gap-4 text-xs text-text-muted bg-surface p-3 rounded-xl border border-border-color">
                                                        {previewBook.metadata.totalPages && (
                                                            <div className="flex items-center gap-1">
                                                                <span className="font-bold text-text-main">Páginas:</span> {previewBook.metadata.totalPages}
                                                            </div>
                                                        )}
                                                        {previewBook.fileSize && (
                                                            <div className="flex items-center gap-1">
                                                                <span className="font-bold text-text-main">Tamaño:</span> {(previewBook.fileSize / 1024).toFixed(1)} KB
                                                            </div>
                                                        )}
                                                        {previewBook.uploadDate && (
                                                            <div className="flex items-center gap-1">
                                                                <span className="font-bold text-text-main">Subido:</span> {new Date(previewBook.uploadDate).toLocaleDateString()}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="text-right text-xs text-text-muted ml-4 flex flex-col gap-1 bg-surface p-3 rounded-xl border border-border-color">
                                                <p className="font-bold text-text-main">{previewBook.content.split(/\s+/).filter(word => word.length > 0).length} <span className="font-normal text-text-muted">palabras</span></p>
                                                <p className="font-bold text-text-main">{previewBook.content.length} <span className="font-normal text-text-muted">caracteres</span></p>
                                                {previewBook.pages && (
                                                    <p className="font-bold text-primary mt-1 pt-1 border-t border-border-color">{previewBook.pages.length} página(s)</p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Panel de Análisis de Complejidad */}
                                        {readabilityStats && (
                                            <div className="mb-4 bg-surface rounded-xl border border-border-color p-4 shadow-sm">
                                                <h4 className="text-sm font-bold text-text-main mb-3 flex items-center gap-2">
                                                    <span>🧠</span> Análisis de Legibilidad
                                                </h4>
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                    <div className="bg-surface-elevated p-3 rounded-lg border border-border-color">
                                                        <p className="text-xs text-text-muted mb-1">Nivel Recomendado</p>
                                                        <p className={`font-bold ${readabilityStats.color}`}>{readabilityStats.ageGroup}</p>
                                                    </div>
                                                    <div className="bg-surface-elevated p-3 rounded-lg border border-border-color">
                                                        <p className="text-xs text-text-muted mb-1">Dificultad</p>
                                                        <p className="font-bold text-text-main">{readabilityStats.difficulty}</p>
                                                    </div>
                                                    <div className="bg-surface-elevated p-3 rounded-lg border border-border-color">
                                                        <p className="text-xs text-text-muted mb-1">Score (0-100)</p>
                                                        <p className="font-bold text-text-main">{readabilityStats.score} <span className="text-xs font-normal text-text-muted">/ 100</span></p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Navegación de páginas para PDFs con múltiples páginas */}
                                        {previewBook.pages && previewBook.pages.length > 1 && (
                                            <div className="flex items-center justify-center gap-4 mt-4 p-3 bg-surface border border-border-color rounded-lg">
                                                <button
                                                    onClick={goToPreviousPage}
                                                    disabled={selectedPage <= 1}
                                                    className="p-2 bg-surface-elevated rounded-lg hover:bg-surface disabled:opacity-50 disabled:cursor-not-allowed shadow-sm text-text-main"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                                                    </svg>
                                                </button>

                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm text-text-muted">Página</span>
                                                    <select
                                                        value={selectedPage}
                                                        onChange={(e) => setSelectedPage(Number(e.target.value))}
                                                        className="px-2 py-1 border border-border-color rounded text-sm bg-surface-elevated text-text-main"
                                                    >
                                                        {previewBook.pages.map((_, index) => (
                                                            <option key={index + 1} value={index + 1}>
                                                                {index + 1}
                                                            </option>
                                                        ))}
                                                    </select>
                                                    <span className="text-sm text-text-muted">de {previewBook.pages.length}</span>
                                                </div>

                                                <button
                                                    onClick={goToNextPage}
                                                    disabled={selectedPage >= previewBook.pages.length}
                                                    className="p-2 bg-surface-elevated rounded-lg hover:bg-surface disabled:opacity-50 disabled:cursor-not-allowed shadow-sm text-text-main"
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
                                                    <div className="border-l-4 border-primary pl-4 py-2 bg-surface-elevated rounded text-text-main">
                                                        <h4 className="text-sm font-semibold text-primary mb-2">Página {selectedPage}</h4>
                                                        <p className="text-text-main leading-relaxed whitespace-pre-wrap">
                                                            {previewBook.pages[selectedPage - 1] || "Página sin contenido"}
                                                        </p>
                                                    </div>
                                                    {selectedPage < previewBook.pages.length && (
                                                        <div className="text-xs text-text-muted italic border-t border-border-color pt-2">
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
                                                                className="w-full h-96 p-4 border-2 border-border-color rounded-xl focus:ring-primary focus:border-primary bg-surface-elevated text-text-main outline-none leading-relaxed resize-none shadow-sm"
                                                                value={editContentValue}
                                                                onChange={(e) => setEditContentValue(e.target.value)}
                                                            />
                                                            <div className="flex justify-end gap-2">
                                                                <button
                                                                    onClick={() => setIsEditingContent(false)}
                                                                    className="px-4 py-2 text-text-muted hover:bg-surface-elevated rounded-lg transition"
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
                                                                    className="px-4 py-2 bg-primary text-white rounded-lg hover:opacity-90 transition"
                                                                >
                                                                    Guardar Cambios
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <p className="text-text-main leading-relaxed whitespace-pre-wrap">
                                                                {previewBook.content}
                                                            </p>
                                                            {previewBook.isCustom && (
                                                                <button
                                                                    onClick={() => {
                                                                        setEditContentValue(previewBook.content);
                                                                        setIsEditingContent(true);
                                                                    }}
                                                                    className="absolute top-0 right-0 p-2 bg-surface border border-border-color text-text-muted hover:text-primary hover:border-primary shadow-sm rounded-lg opacity-0 group-hover:opacity-100 transition-all flex items-center gap-2"
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
                                <div className="bg-surface-elevated rounded-xl border-2 border-dashed border-border-color h-[calc(100%-80px)] flex items-center justify-center">
                                    <div className="text-center text-text-muted">
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
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                            <div className="bg-surface border border-border-color rounded-xl shadow-xl w-full max-w-md p-6">
                                <h3 className="text-xl font-bold text-text-main mb-4 flex items-center gap-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-primary">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
                                    </svg>
                                    Generar Lectura con IA
                                </h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-text-muted mb-1">Tema o Asunto</label>
                                        <input
                                            type="text"
                                            value={topicText}
                                            onChange={(e) => setTopicText(e.target.value)}
                                            placeholder="Ej. El ciclo del agua, Los dinosaurios..."
                                            className="w-full px-4 py-2 text-text-main bg-surface-elevated border border-border-color rounded-lg focus:ring-2 focus:ring-primary outline-none"
                                            disabled={isGeneratingText}
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-text-muted mb-1">Idioma</label>
                                        <select
                                            value={language}
                                            onChange={(e) => setLanguage(e.target.value)}
                                            className="w-full px-4 py-2 text-text-main bg-surface-elevated border border-border-color rounded-lg focus:ring-2 focus:ring-primary outline-none"
                                            disabled={isGeneratingText}
                                        >
                                                <option value="Español">Español</option>
                                                <option value="Inglés">Inglés</option>
                                                <option value="Francés">Francés</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-text-muted mb-1">Tipo de Texto</label>
                                            <select
                                                value={genre}
                                                onChange={(e) => setGenre(e.target.value)}
                                                className="w-full px-4 py-2 text-text-main bg-surface-elevated border border-border-color rounded-lg focus:ring-2 focus:ring-primary outline-none"
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
                                            <label className="block text-sm font-medium text-text-muted mb-1">Nivel Pedagógico</label>
                                            <select
                                                value={levelText}
                                                onChange={(e) => setLevelText(e.target.value)}
                                                className="w-full px-4 py-2 text-text-main bg-surface-elevated border border-border-color rounded-lg focus:ring-2 focus:ring-primary outline-none"
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
                                            <label className="block text-sm font-medium text-text-muted mb-1">Palabras (Aprox)</label>
                                            <select
                                                value={wordsCount}
                                                onChange={(e) => setWordsCount(Number(e.target.value))}
                                                className="w-full px-4 py-2 text-text-main bg-surface-elevated border border-border-color rounded-lg focus:ring-2 focus:ring-primary outline-none"
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
                                    <div className="mt-4 p-3 bg-primary/10 rounded-lg">
                                        <div className="flex items-center gap-3 text-primary font-medium">
                                            <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                                            <span>Generando lectura con IA...</span>
                                        </div>
                                        {aiProgress !== null && (
                                            <div className="mt-2 w-full bg-surface-elevated rounded-full h-2">
                                                <div className="bg-primary h-2 rounded-full transition-all duration-300" style={{ width: `${aiProgress}%` }}></div>
                                            </div>
                                        )}
                                        <p className="text-xs text-primary mt-1 opacity-70">
                                            Esto puede tomar unos segundos.
                                        </p>
                                    </div>
                                )}

                                <div className="mt-6 flex justify-end gap-3">
                                    <button
                                        onClick={() => setShowGeneratorModal(false)}
                                        className="px-4 py-2 text-text-muted hover:bg-surface-elevated rounded-lg transition"
                                        disabled={isGeneratingText}
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={handleGenerateTopicText}
                                        disabled={isGeneratingText || !topicText.trim()}
                                        className="px-4 py-2 bg-primary text-white rounded-lg hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Generar y Guardar
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}


                </div>
            )}
        </div>
    );
};

export default TeacherLibrary;
