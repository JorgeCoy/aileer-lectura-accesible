// src/hooks/usePdf.js → VERSIÓN FINAL 100% FUNCIONAL
import { useState, useEffect } from "react";

const usePdf = ({ enablePdf, setText, isRunning = false }) => {
    const [pdfPages, setPdfPages] = useState([]);
    const [selectedPage, setSelectedPage] = useState(0);
    const [pdfHash, setPdfHash] = useState("");
    const [pdfName, setPdfName] = useState("");
    const [pdfMetadata, setPdfMetadata] = useState(null);
    const [bookmarks, setBookmarks] = useState([]);
    const [pageNotes, setPageNotes] = useState({});
    const [readingStats, setReadingStats] = useState({
        pagesRead: [],
        timePerPage: {},
        totalTimeReading: 0,
        lastReadPage: 0,
    });
    const [pageStartTime, setPageStartTime] = useState(null);
    const [pdfFile, setPdfFile] = useState(null);

    // Cargar progreso guardado
    useEffect(() => {
        if (pdfHash) {
            const saved = localStorage.getItem(`pdf_${pdfHash}`);
            if (saved) {
                const data = JSON.parse(saved);
                setBookmarks(data.bookmarks || []);
                setPageNotes(data.pageNotes || {});
                setReadingStats({
                    pagesRead: data.readingStats?.pagesRead || [],
                    timePerPage: data.readingStats?.timePerPage || {},
                    totalTimeReading: data.readingStats?.totalTimeReading || 0,
                    lastReadPage: data.readingStats?.lastReadPage || 0,
                });
                setSelectedPage(data.readingStats?.lastReadPage > 0 ? data.readingStats.lastReadPage : 1);
            } else {
                setSelectedPage(1);
            }
        }
    }, [pdfHash]);

    // Guardado con debounce manual
    useEffect(() => {
        if (!pdfHash || pdfPages.length === 0) return;

        const id = setTimeout(() => {
            localStorage.setItem(`pdf_${pdfHash}`, JSON.stringify({
                bookmarks,
                pageNotes,
                readingStats,
                pdfName,
                totalPages: pdfPages.length,
                lastUpdated: new Date().toISOString(),
            }));
        }, 1000);

        return () => clearTimeout(id);
    }, [bookmarks, pageNotes, readingStats, pdfName, pdfPages.length, pdfHash]);

    // Medir tiempo por página (solo en reproducción automática)
    useEffect(() => {
        if (!isRunning || selectedPage < 1) return;
        setPageStartTime(Date.now());
        return () => {
            if (!pageStartTime) return;
            const timeSpent = (Date.now() - pageStartTime) / 1000;
            setReadingStats(prev => ({
                ...prev,
                timePerPage: { ...prev.timePerPage, [selectedPage]: (prev.timePerPage[selectedPage] || 0) + timeSpent },
                totalTimeReading: prev.totalTimeReading + timeSpent,
            }));
        };
    }, [selectedPage, isRunning, pageStartTime]);

    // Marcar página como leída
    useEffect(() => {
        if (selectedPage > 0 && pdfPages.length > 0) {
            setReadingStats(prev => ({
                ...prev,
                lastReadPage: selectedPage,
                pagesRead: [...new Set([...prev.pagesRead, selectedPage])],
            }));
        }
    }, [selectedPage, pdfPages.length]);

    // Sincronizar texto con página actual
    useEffect(() => {
        if (selectedPage > 0) {
            const pageContent = pdfPages[selectedPage - 1];
            // Si hay contenido, lo ponemos. Si no (undefined/null/""), limpiamos el texto.
            setText(pageContent || "");
        }
    }, [selectedPage, pdfPages, setText]);

    // Generar hash del archivo
    const getFileHash = async (file) => {
        const buffer = await file.arrayBuffer();
        const hash = await crypto.subtle.digest('SHA-256', buffer);
        return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
    };

    // Cargar PDF
    const handlePdfUpload = async (pdfText, pages, file) => {
        if (!enablePdf) return;

        setPdfPages(pages);
        setPdfName(file.name);
        setPdfFile(file);

        const hash = await getFileHash(file);
        setPdfHash(hash);

        setPdfMetadata({
            totalPages: pages.length,
            fileName: file.name,
            uploadDate: new Date().toISOString(),
        });
    };

    // === BOOKMARKS ===
    const addBookmark = (pageNumber, note = "") => {
        const newBookmark = {
            id: Date.now() + Math.random(),
            pageNumber,
            note,
            createdAt: new Date().toISOString(),
        };
        setBookmarks(prev => [...prev, newBookmark]);
    };

    const removeBookmark = (id) => {
        setBookmarks(prev => prev.filter(b => b.id !== id));
    };

    const toggleBookmark = (pageNumber) => {
        const exists = bookmarks.find(b => b.pageNumber === pageNumber);
        if (exists) {
            removeBookmark(exists.id);
        } else {
            addBookmark(pageNumber);
        }
    };

    // === NOTAS ===
    const addPageNote = (pageNumber, note) => {
        setPageNotes(prev => ({ ...prev, [pageNumber]: note }));
    };

    const removePageNote = (pageNumber) => {
        setPageNotes(prev => {
            const copy = { ...prev };
            delete copy[pageNumber];
            return copy;
        });
    };

    // === NAVEGACIÓN ===
    const goToNextPage = () => setSelectedPage(p => Math.min(p + 1, pdfPages.length));
    const goToPreviousPage = () => setSelectedPage(p => Math.max(p - 1, 1));

    // === PROGRESO ===
    const readingProgress = pdfPages.length > 0
        ? (readingStats.pagesRead.length / pdfPages.length) * 100
        : 0;

    // === EXPORT / IMPORT ===
    const exportProgress = () => JSON.stringify({ pdfName, bookmarks, pageNotes, readingStats }, null, 2);
    const importProgress = (json) => {
        try {
            const data = JSON.parse(json);
            setBookmarks(data.bookmarks || []);
            setPageNotes(data.pageNotes || {});
            setReadingStats(data.readingStats || readingStats);
        } catch (e) {
            console.error("Error importando progreso", e);
        }
    };

    // === ACTUALIZACIÓN DE TEXTO (OCR) ===
    const updatePageText = (pageNumber, newText) => {
        setPdfPages(prev => {
            const newPages = [...prev];
            if (pageNumber > 0 && pageNumber <= newPages.length) {
                newPages[pageNumber - 1] = newText;
            }
            return newPages;
        });
        // Si es la página actual, actualizar el texto visible inmediatamente
        if (pageNumber === selectedPage) {
            setText(newText);
        }
    };

    return {
        pdfPages,
        selectedPage,
        setSelectedPage,
        pdfName,
        pdfMetadata,
        pdfFile,
        bookmarks,
        addBookmark,
        removeBookmark,
        toggleBookmark,
        pageNotes,
        addPageNote,
        removePageNote,
        readingStats,
        readingProgress,
        handlePdfUpload,
        goToNextPage,
        goToPreviousPage,
        exportProgress,
        importProgress,
        updatePageText, // ✅ Exponer función
    };
};

export default usePdf;