// src/components/PdfSidebarButton.jsx
import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    DocumentTextIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    BookmarkIcon as BookmarkSolidIcon,
    PencilIcon,
    ChartBarIcon,
    ArrowDownTrayIcon,
    XMarkIcon,
} from "@heroicons/react/24/solid";
import { BookmarkIcon as BookmarkOutlineIcon } from "@heroicons/react/24/outline";

const PdfSidebarButton = ({
    handlePdfUpload,
    pdfPages,
    selectedPage,
    setSelectedPage,
    pdfName,
    readingProgress,
    bookmarks,
    toggleBookmark,
    pageNotes,
    addPageNote,
    removePageNote,
    goToNextPage,
    goToPreviousPage,
    exportProgress,
    isMobileOpen,
    Label
}) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [activeTab, setActiveTab] = useState("pages"); // pages, bookmarks, notes, stats
    const [noteText, setNoteText] = useState("");
    const fileInputRef = useRef(null);

    const hasPdf = pdfPages.length > 0;
    const currentPageNote = pageNotes[selectedPage] || "";
    const isBookmarked = bookmarks.some(b => b.pageNumber === selectedPage);

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            const pdfjsLib = await import("pdfjs-dist");
            pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

            const arrayBuffer = await file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            const pages = [];

            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const textContent = await page.getTextContent();
                const pageText = textContent.items.map(item => item.str).join(" ");
                pages.push(pageText);
            }

            const allText = pages.join("\n\n");
            handlePdfUpload(allText, pages, file.name);
            setIsExpanded(true);
        } catch (error) {
            console.error("Error loading PDF:", error);
            alert("Error al cargar el PDF. Por favor intenta con otro archivo.");
        }
    };

    const handleExport = () => {
        const data = exportProgress();
        const blob = new Blob([data], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${pdfName}_progress.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleSaveNote = () => {
        if (noteText.trim()) {
            addPageNote(selectedPage, noteText);
            setNoteText("");
        }
    };

    // ✅ Clases dinámicas para botones
    const buttonClass = `mb-3 rounded-xl transition-all duration-300 flex items-center shadow-md hover:shadow-lg hover:scale-105 relative ${isMobileOpen ? "w-full px-4 py-3 justify-start" : "p-3 justify-center"
        } ${hasPdf ? "bg-purple-600 text-white hover:bg-purple-500" : "bg-gray-700 text-gray-300 hover:bg-gray-600"}`;

    return (
        <>
            {/* Botón principal en sidebar */}
            <button
                onClick={() => (hasPdf ? setIsExpanded(!isExpanded) : fileInputRef.current?.click())}
                className={buttonClass}
                aria-label={hasPdf ? "Gestionar PDF" : "Subir PDF"}
                title={hasPdf ? `${pdfName} (${Math.round(readingProgress)}%)` : "Subir PDF"}
            >
                <DocumentTextIcon className="w-6 h-6 flex-shrink-0" />
                {Label && <Label text={hasPdf ? "Gestionar PDF" : "Subir PDF"} />}

                {/* Badge con número de páginas */}
                {hasPdf && !isMobileOpen && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                        {pdfPages.length}
                    </span>
                )}

                {/* Barra de progreso circular */}
                {hasPdf && readingProgress > 0 && !isMobileOpen && (
                    <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none">
                        <circle
                            cx="50%"
                            cy="50%"
                            r="45%"
                            fill="none"
                            stroke="rgba(255,255,255,0.2)"
                            strokeWidth="2"
                        />
                        <circle
                            cx="50%"
                            cy="50%"
                            r="45%"
                            fill="none"
                            stroke="white"
                            strokeWidth="2"
                            strokeDasharray={`${readingProgress * 2.8} 280`}
                            className="transition-all duration-500"
                        />
                    </svg>
                )}
            </button>

            {/* Input oculto para cargar PDF */}
            <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="hidden"
            />

            {/* Panel expandido */}
            <AnimatePresence>
                {isExpanded && hasPdf && (
                    <motion.div
                        initial={{ opacity: 0, x: -300 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -300 }}
                        transition={{ type: "spring", damping: 25 }}
                        className="fixed left-0 md:left-16 top-0 h-full w-full md:w-96 bg-gray-900 text-white shadow-2xl z-50 flex flex-col"
                    >
                        {/* Header */}
                        <div className="p-4 border-b border-gray-700 flex justify-between items-center bg-gray-900">
                            <div className="flex-1 min-w-0">
                                <h3 className="font-bold text-lg truncate">{pdfName}</h3>
                                <p className="text-sm text-gray-400">
                                    Página {selectedPage}/{pdfPages.length} • {Math.round(readingProgress)}% leído
                                </p>
                            </div>
                            <button
                                onClick={() => setIsExpanded(false)}
                                className="p-2 hover:bg-gray-800 rounded-lg transition"
                                aria-label="Cerrar panel"
                            >
                                <XMarkIcon className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Tabs */}
                        <div className="flex border-b border-gray-700 bg-gray-900">
                            {[
                                { id: "pages", label: "Páginas", icon: DocumentTextIcon },
                                { id: "bookmarks", label: "Marcadores", icon: BookmarkSolidIcon },
                                { id: "notes", label: "Notas", icon: PencilIcon },
                                { id: "stats", label: "Estadísticas", icon: ChartBarIcon },
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex-1 p-3 flex items-center justify-center gap-2 transition ${activeTab === tab.id
                                        ? "bg-gray-800 text-white border-b-2 border-purple-500"
                                        : "text-gray-400 hover:bg-gray-800"
                                        }`}
                                >
                                    <tab.icon className="w-4 h-4" />
                                    <span className="text-xs font-medium hidden sm:inline">{tab.label}</span>
                                </button>
                            ))}
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-4 bg-gray-900">
                            {/* Tab: Páginas */}
                            {activeTab === "pages" && (
                                <div className="space-y-3">
                                    {/* Navegación rápida */}
                                    <div className="flex items-center gap-2 mb-4">
                                        <button
                                            onClick={goToPreviousPage}
                                            disabled={selectedPage <= 1}
                                            className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <ChevronLeftIcon className="w-5 h-5" />
                                        </button>
                                        <input
                                            type="number"
                                            min="1"
                                            max={pdfPages.length}
                                            value={selectedPage}
                                            onChange={(e) => setSelectedPage(Number(e.target.value))}
                                            className="flex-1 px-3 py-2 bg-gray-800 rounded-lg text-center"
                                        />
                                        <button
                                            onClick={goToNextPage}
                                            disabled={selectedPage >= pdfPages.length}
                                            className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <ChevronRightIcon className="w-5 h-5" />
                                        </button>
                                    </div>

                                    {/* Lista de páginas */}
                                    <div className="space-y-2">
                                        {pdfPages.map((_, index) => {
                                            const pageNum = index + 1;
                                            const hasBookmark = bookmarks.some(b => b.pageNumber === pageNum);
                                            const hasNote = pageNotes[pageNum];

                                            return (
                                                <button
                                                    key={pageNum}
                                                    onClick={() => setSelectedPage(pageNum)}
                                                    className={`w-full p-3 rounded-lg text-left transition flex items-center justify-between ${selectedPage === pageNum
                                                        ? "bg-purple-600 text-white"
                                                        : "bg-gray-800 hover:bg-gray-700"
                                                        }`}
                                                >
                                                    <span className="font-medium">Página {pageNum}</span>
                                                    <div className="flex items-center gap-2">
                                                        {hasBookmark && <BookmarkSolidIcon className="w-4 h-4 text-yellow-400" />}
                                                        {hasNote && <PencilIcon className="w-4 h-4 text-blue-400" />}
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Tab: Marcadores */}
                            {activeTab === "bookmarks" && (
                                <div className="space-y-3">
                                    <button
                                        onClick={() => toggleBookmark(selectedPage)}
                                        className={`w-full p-3 rounded-lg flex items-center justify-center gap-2 ${isBookmarked
                                            ? "bg-yellow-600 hover:bg-yellow-500"
                                            : "bg-gray-800 hover:bg-gray-700"
                                            }`}
                                    >
                                        {isBookmarked ? <BookmarkSolidIcon className="w-5 h-5" /> : <BookmarkOutlineIcon className="w-5 h-5" />}
                                        {isBookmarked ? "Quitar marcador" : "Marcar página actual"}
                                    </button>

                                    {bookmarks.length === 0 ? (
                                        <p className="text-gray-400 text-center py-8">No hay marcadores aún</p>
                                    ) : (
                                        <div className="space-y-2">
                                            {bookmarks.map(bookmark => (
                                                <div
                                                    key={bookmark.id}
                                                    className="p-3 bg-gray-800 rounded-lg flex items-center justify-between"
                                                >
                                                    <button
                                                        onClick={() => setSelectedPage(bookmark.pageNumber)}
                                                        className="flex-1 text-left hover:text-purple-400 transition"
                                                    >
                                                        Página {bookmark.pageNumber}
                                                        {bookmark.note && <p className="text-xs text-gray-400 mt-1">{bookmark.note}</p>}
                                                    </button>
                                                    <button
                                                        onClick={() => toggleBookmark(bookmark.pageNumber)}
                                                        className="p-2 hover:bg-gray-700 rounded"
                                                    >
                                                        <XMarkIcon className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Tab: Notas */}
                            {activeTab === "notes" && (
                                <div className="space-y-3">
                                    <div className="bg-gray-800 p-4 rounded-lg">
                                        <label className="block text-sm font-medium mb-2">
                                            Nota para página {selectedPage}
                                        </label>
                                        <textarea
                                            value={noteText || currentPageNote}
                                            onChange={(e) => setNoteText(e.target.value)}
                                            placeholder="Escribe una nota..."
                                            className="w-full px-3 py-2 bg-gray-900 rounded-lg resize-none h-32"
                                        />
                                        <div className="flex gap-2 mt-2">
                                            <button
                                                onClick={handleSaveNote}
                                                className="flex-1 px-4 py-2 bg-purple-600 rounded-lg hover:bg-purple-500"
                                            >
                                                Guardar
                                            </button>
                                            {currentPageNote && (
                                                <button
                                                    onClick={() => {
                                                        removePageNote(selectedPage);
                                                        setNoteText("");
                                                    }}
                                                    className="px-4 py-2 bg-red-600 rounded-lg hover:bg-red-500"
                                                >
                                                    Eliminar
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {Object.keys(pageNotes).length > 0 && (
                                        <div className="space-y-2">
                                            <h4 className="font-medium text-sm text-gray-400">Todas las notas</h4>
                                            {Object.entries(pageNotes).map(([page, note]) => (
                                                <div key={page} className="p-3 bg-gray-800 rounded-lg">
                                                    <div className="flex items-center justify-between mb-1">
                                                        <button
                                                            onClick={() => setSelectedPage(Number(page))}
                                                            className="text-sm font-medium hover:text-purple-400"
                                                        >
                                                            Página {page}
                                                        </button>
                                                    </div>
                                                    <p className="text-sm text-gray-300">{note}</p>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Tab: Estadísticas */}
                            {activeTab === "stats" && (
                                <div className="space-y-4">
                                    <div className="bg-gray-800 p-4 rounded-lg">
                                        <h4 className="font-medium mb-3">Progreso de Lectura</h4>
                                        <div className="space-y-3">
                                            <div>
                                                <div className="flex justify-between text-sm mb-1">
                                                    <span>Completado</span>
                                                    <span className="font-bold">{Math.round(readingProgress)}%</span>
                                                </div>
                                                <div className="w-full bg-gray-700 rounded-full h-2">
                                                    <div
                                                        className="bg-purple-600 h-2 rounded-full transition-all duration-500"
                                                        style={{ width: `${readingProgress}%` }}
                                                    />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-3 text-sm">
                                                <div className="bg-gray-900 p-3 rounded">
                                                    <p className="text-gray-400">Páginas leídas</p>
                                                    <p className="text-2xl font-bold">{Math.round((readingProgress / 100) * pdfPages.length)}</p>
                                                </div>
                                                <div className="bg-gray-900 p-3 rounded">
                                                    <p className="text-gray-400">Total páginas</p>
                                                    <p className="text-2xl font-bold">{pdfPages.length}</p>
                                                </div>
                                                <div className="bg-gray-900 p-3 rounded">
                                                    <p className="text-gray-400">Marcadores</p>
                                                    <p className="text-2xl font-bold">{bookmarks.length}</p>
                                                </div>
                                                <div className="bg-gray-900 p-3 rounded">
                                                    <p className="text-gray-400">Notas</p>
                                                    <p className="text-2xl font-bold">{Object.keys(pageNotes).length}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleExport}
                                        className="w-full p-3 bg-green-600 rounded-lg hover:bg-green-500 flex items-center justify-center gap-2"
                                    >
                                        <ArrowDownTrayIcon className="w-5 h-5" />
                                        Exportar Progreso
                                    </button>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default PdfSidebarButton;
