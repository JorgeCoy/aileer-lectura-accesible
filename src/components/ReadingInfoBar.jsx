import React from 'react';
import { adultThemes } from '../config/themes';

const ReadingInfoBar = ({
    technique,
    speed,
    currentIndex,
    totalWords,
    theme = "minimalist"
}) => {
    const themeStyle = adultThemes[theme] || adultThemes.minimalist;

    // Map technique value to readable name
    const getTechniqueName = (tech) => {
        const options = {
            highlight: "Resaltado",
            singleWord: "Una Palabra",
            bionic: "Bionic Reading",
            spritz: "Spritz",
            chunking: "Chunking",
            lineFocus: "Línea por Puntos",
            paragraphFocus: "Enfoque Párrafos",
            saccade: "Sacádico",
            preview: "Previewing",
            cloze: "Cloze"
        };
        return options[tech] || tech;
    };

    return (
        <div
            className="absolute bottom-2 right-4 transition-all duration-300 z-50 flex items-center gap-2 text-xs font-medium select-none pointer-events-none opacity-60"
            style={{
                color: themeStyle.textColor
            }}
        >
            {/* Technique Name */}
            <span className="uppercase tracking-wider">
                {getTechniqueName(technique)}
            </span>

            <span className="opacity-40">|</span>

            {/* Speed */}
            <span className="font-mono">
                {speed} WPM
            </span>

            <span className="opacity-40">|</span>

            {/* Progress */}
            <span className="font-mono">
                {currentIndex + 1}/{totalWords}
            </span>
        </div>
    );
};

export default ReadingInfoBar;
