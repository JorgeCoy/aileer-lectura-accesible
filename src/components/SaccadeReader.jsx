import React, { useState, useEffect } from "react";
import { adultThemes } from "../config/themes";

const SaccadeReader = ({
    word = "",
    theme = "minimalist",
    fontSize = 32,
    fontFamily = "sans-serif",
    containerWidth: _containerWidth = 800,
    containerHeight: _containerHeight = 400
}) => {
    const themeStyle = adultThemes[theme] || adultThemes.minimalist;
    const [position, setPosition] = useState({ x: 50, y: 50 });

    // Cada vez que cambia la palabra, calculamos una nueva posición
    useEffect(() => {
        // Generar posición aleatoria pero dentro de márgenes seguros (10% - 90%)
        const newX = 10 + Math.random() * 80;
        const newY = 20 + Math.random() * 60; // Un poco más centrado verticalmente
        setPosition({ x: newX, y: newY });
    }, [word]);

    return (
        <div
            className="relative w-full h-full flex items-center justify-center overflow-hidden"
            style={{ minHeight: '400px' }}
        >
            {/* Guías tenues para referencia (opcional) */}
            <div className="absolute inset-0 border-2 border-dashed border-gray-700 opacity-10 rounded-xl pointer-events-none"></div>

            <div
                className="absolute transition-all duration-100 ease-out"
                style={{
                    left: `${position.x}%`,
                    top: `${position.y}%`,
                    transform: 'translate(-50%, -50%)',
                    fontFamily: fontFamily,
                    fontSize: `${fontSize}px`,
                    color: themeStyle.textColor,
                    fontWeight: 'bold'
                }}
            >
                {word}
            </div>
        </div>
    );
};

export default SaccadeReader;
