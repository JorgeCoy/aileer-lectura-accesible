import { useState, useEffect } from "react";

const useHistory = ({ text, selectedPage, isPlaying, isCountingDown }) => {
    const [showHistory, setShowHistory] = useState(false);
    const [history, setHistory] = useState([]);

    const addToHistory = (textToAdd, page = null) => {
        if (textToAdd && textToAdd.trim()) {
            setHistory(prev => [{ text: textToAdd, page, date: new Date().toISOString() }, ...prev.slice(0, 9)]);
        }
    };

    // ✅ Efecto para agregar texto al historial al cambiar
    useEffect(() => {
        if (text && text.trim() && !isPlaying && !isCountingDown) {
            addToHistory(text, selectedPage);
        }
    }, [text, selectedPage, isPlaying, isCountingDown]);

    return {
        showHistory,
        setShowHistory,
        history,
        addToHistory
    };
};

export default useHistory;
