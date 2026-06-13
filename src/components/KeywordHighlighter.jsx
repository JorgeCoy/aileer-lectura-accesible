import React, { useMemo } from 'react';
import { adultThemes } from '../config/themes';

const KeywordHighlighter = ({
    text = "",
    theme = "minimalist",
    fontSize = 24,
    fontFamily = "sans-serif"
}) => {
    const themeStyle = adultThemes[theme] || adultThemes.minimalist;

    // Logic to identify keywords (same as in PreviewReader but cleaner)
    const processedWords = useMemo(() => {
        if (!text) return [];
        const words = text.split(/(\s+)/); // Split keeping whitespace

        return words.map((word, index) => {
            const cleanWord = word.replace(/[.,;?!:()"]/g, '');
            // Keyword criteria: > 5 chars OR > 3 chars and Capitalized
            const isKeyword = cleanWord.length > 5 || (cleanWord.length > 3 && /^[A-Z]/.test(cleanWord));

            return {
                text: word,
                isKeyword: isKeyword && !/^\s+$/.test(word), // Don't highlight whitespace
                isWhitespace: /^\s+$/.test(word)
            };
        });
    }, [text]);

    return (
        <div className="w-full max-w-4xl mx-auto p-8 overflow-y-auto custom-scrollbar" style={{ maxHeight: '70vh' }}>
            <div
                className="leading-relaxed text-justify"
                style={{
                    fontFamily: fontFamily,
                    fontSize: `${fontSize}px`,
                    color: themeStyle.textColor,
                    opacity: 0.8 // Slightly dim base text
                }}
            >
                {processedWords.map((item, idx) => (
                    <span
                        key={idx}
                        className={`transition-all duration-300 ${item.isKeyword
                                ? 'font-bold opacity-100 inline-block transform hover:scale-105 cursor-default'
                                : 'opacity-60 blur-[0.3px]'
                            }`}
                        style={{
                            color: item.isKeyword ? themeStyle.highlight : 'inherit',
                            // Add a subtle background to keywords for better visibility in some themes
                            backgroundColor: item.isKeyword && theme === 'minimalist' ? 'rgba(255, 255, 0, 0.1)' : 'transparent',
                            borderRadius: '4px',
                            padding: item.isKeyword ? '0 2px' : '0'
                        }}
                    >
                        {item.text}
                    </span>
                ))}
            </div>

            <div className="mt-8 text-center text-sm opacity-50" style={{ color: themeStyle.textColor }}>
                <p>Las palabras clave están resaltadas para un escaneo rápido.</p>
            </div>
        </div>
    );
};

export default KeywordHighlighter;
