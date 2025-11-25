import React from "react";
import { adultThemes } from "../config/themes";

const SpritzReader = ({
    word = "",
    theme = "minimalist",
    fontSize = 32,
    fontFamily = "sans-serif"
}) => {
    const themeStyle = adultThemes[theme] || adultThemes.minimalist;

    // Calcular el Optimal Recognition Point (ORP)
    // Generalmente es el carácter en la posición ~35% de la palabra
    const calculateORP = (w) => {
        const length = w.length;
        let orpIndex = 0;

        if (length === 1) orpIndex = 0;
        else if (length >= 2 && length <= 5) orpIndex = 1;
        else if (length >= 6 && length <= 9) orpIndex = 2;
        else if (length >= 10 && length <= 13) orpIndex = 3;
        else orpIndex = 4;

        return orpIndex;
    };

    const orpIndex = calculateORP(word);
    const prefix = word.slice(0, orpIndex);
    const orpChar = word[orpIndex];
    const suffix = word.slice(orpIndex + 1);

    return (
        <div className="flex flex-col items-center justify-center w-full h-64 relative">
            {/* Guías visuales (Líneas de retícula Spritz) */}
            <div className="absolute top-0 bottom-0 w-px bg-gray-700 opacity-20 left-1/2 transform -translate-x-1/2"></div>
            <div className="absolute left-0 right-0 h-px bg-gray-700 opacity-20 top-1/2 transform -translate-y-1/2"></div>

            {/* Contenedor de la palabra alineada */}
            <div
                className="flex items-baseline whitespace-nowrap"
                style={{
                    fontFamily: fontFamily === 'sans-serif' ? '"Courier New", monospace' : fontFamily, // Monospace ayuda a la alineación
                    fontSize: `${fontSize}px`,
                    color: themeStyle.textColor,
                    lineHeight: 1
                }}
            >
                {/* Prefijo: Alineado a la derecha para empujar el ORP al centro */}
                <span className="text-right" style={{ width: '50%', minWidth: '200px', paddingRight: '2px' }}>
                    {prefix}
                </span>

                {/* Carácter ORP: Centrado y destacado */}
                <span
                    className="font-bold relative"
                    style={{
                        color: '#ef4444', // Rojo Spritz estándar
                        transform: 'scale(1.2)'
                    }}
                >
                    {orpChar}
                    {/* Pequeña marca debajo del ORP */}
                    <span className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-red-500 rounded-full opacity-70"></span>
                </span>

                {/* Sufijo: Alineado a la izquierda */}
                <span className="text-left" style={{ width: '50%', minWidth: '200px', paddingLeft: '2px' }}>
                    {suffix}
                </span>
            </div>
        </div>
    );
};

export default SpritzReader;
