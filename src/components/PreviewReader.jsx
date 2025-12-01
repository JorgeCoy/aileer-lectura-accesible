import React, { useMemo, useState, useEffect } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid';

const PreviewReader = ({ text, theme, fontSize, fontFamily }) => {
    const [currentPage, setCurrentPage] = useState(0);
    const [wordsPerPage, setWordsPerPage] = useState(250);

    // Responsive words per page
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 768) {
                setWordsPerPage(100);
            } else if (window.innerWidth < 1024) {
                setWordsPerPage(200);
            } else {
                setWordsPerPage(300);
            }
        };

        handleResize(); // Initial check
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Reset page when text changes
    useEffect(() => {
        setCurrentPage(0);
    }, [text]);

    // Keyword extraction logic
    const keywords = useMemo(() => {
        if (!text) return [];
        const words = text.split(/\s+/);
        const uniqueKeywords = new Set();

        words.forEach(word => {
            const cleanWord = word.replace(/[.,;?!:()"]/g, '');
            if (cleanWord.length > 5 || (cleanWord.length > 3 && /^[A-Z]/.test(cleanWord))) {
                uniqueKeywords.add(cleanWord);
            }
        });
        return Array.from(uniqueKeywords);
    }, [text]);

    const isKeyword = (word) => {
        const cleanWord = word.replace(/[.,;?!:()"]/g, '');
        return keywords.includes(cleanWord);
    };

    // Pagination logic
    const pages = useMemo(() => {
        if (!text) return [];
        const allWords = text.split(/\s+/);
        const chunks = [];
        for (let i = 0; i < allWords.length; i += wordsPerPage) {
            chunks.push(allWords.slice(i, i + wordsPerPage));
        }
        return chunks;
    }, [text, wordsPerPage]);

    const currentWords = pages[currentPage] || [];
    const totalPages = pages.length;

    // Theme styles mapping
    const getThemeStyles = () => {
        switch (theme) {
            case 'minimalist': return { text: 'text-gray-400', highlight: 'text-gray-900 bg-yellow-100 font-bold', bg: 'bg-white', nav: 'bg-gray-100 text-gray-600 hover:bg-gray-200' };
            case 'cinematic': return { text: 'text-gray-500', highlight: 'text-white bg-blue-900/50 font-bold shadow-[0_0_10px_rgba(59,130,246,0.5)]', bg: 'bg-transparent', nav: 'bg-white/10 text-white hover:bg-white/20' };
            case 'zen': return { text: 'text-stone-400', highlight: 'text-stone-800 bg-stone-200 font-bold', bg: 'bg-[#f5f5f4]', nav: 'bg-stone-200 text-stone-600 hover:bg-stone-300' };
            default: return { text: 'text-gray-400', highlight: 'text-gray-900 bg-yellow-100 font-bold', bg: 'bg-white', nav: 'bg-gray-100 text-gray-600 hover:bg-gray-200' };
        }
    };

    const styles = getThemeStyles();

    return (
        <div
            className={`w-full h-full flex flex-col ${styles.bg}`}
            style={{ fontFamily }}
        >
            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                <div className="max-w-4xl mx-auto">
                    <div style={{ fontSize: `${fontSize}px`, lineHeight: 1.6 }}>
                        {currentWords.map((word, index) => {
                            const highlight = isKeyword(word);
                            return (
                                <span
                                    key={index}
                                    className={`inline-block mr-1.5 transition-all duration-300 ${highlight ? styles.highlight + ' px-1 rounded scale-105 transform' : styles.text + ' blur-[0.5px] opacity-70'
                                        }`}
                                >
                                    {word}
                                </span>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="p-4 border-t border-gray-200/10 flex justify-between items-center max-w-4xl mx-auto w-full">
                    <button
                        onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                        disabled={currentPage === 0}
                        className={`p-2 rounded-full transition-all disabled:opacity-30 disabled:cursor-not-allowed ${styles.nav}`}
                    >
                        <ChevronLeftIcon className="w-6 h-6" />
                    </button>

                    <span className={`text-sm font-medium ${theme === 'minimalist' || theme === 'zen' ? 'text-gray-500' : 'text-gray-400'}`}>
                        Página {currentPage + 1} de {totalPages}
                    </span>

                    <button
                        onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
                        disabled={currentPage === totalPages - 1}
                        className={`p-2 rounded-full transition-all disabled:opacity-30 disabled:cursor-not-allowed ${styles.nav}`}
                    >
                        <ChevronRightIcon className="w-6 h-6" />
                    </button>
                </div>
            )}
        </div>
    );
};

export default PreviewReader;
