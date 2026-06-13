import React, { useRef, useState, useEffect } from 'react';
import { adultThemes } from "../config/themes";

const SaccadicFocusReader = ({
    words = [],
    currentIndex = 0,
    speed = 250,
    theme = "minimalist",
    fontSize = 32,
    fontFamily = "sans-serif"
}) => {
    const themeStyle = adultThemes[theme] || adultThemes.minimalist;
    const spanRefs = useRef([]);
    const containerRef = useRef(null);
    const [ballPos, setBallPos] = useState(null);
    const [isInstantSnap, setIsInstantSnap] = useState(false);

    useEffect(() => {
        const activeSpan = spanRefs.current[currentIndex];
        const container = containerRef.current;
        if (activeSpan && container) {
            // Calculate center relative to the offsetParent
            const x = activeSpan.offsetLeft + activeSpan.offsetWidth / 2;
            const y = activeSpan.offsetTop - 15; // Un poco por encima del texto
            
            setBallPos(prev => {
                // Si la coordenada Y cambia significativamente, hubo un salto de línea
                if (prev && Math.abs(y - prev.y) > 20) {
                    setIsInstantSnap(speed >= 250);
                    // Hacer scroll suave hacia la nueva línea
                    activeSpan.scrollIntoView({ behavior: 'smooth', block: 'center' });
                } else {
                    setIsInstantSnap(false);
                }
                return { x, y };
            });

            // En el primer render o cuando se reinicia al principio, centrar también
            if (currentIndex === 0) {
                activeSpan.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    }, [currentIndex, words, speed]);

    // Limpiar el estado instantSnap rápidamente para que los saltos horizontales sigan siendo fluidos
    useEffect(() => {
        if (isInstantSnap) {
            const timeout = setTimeout(() => setIsInstantSnap(false), 50);
            return () => clearTimeout(timeout);
        }
    }, [isInstantSnap]);

    return (
        <div 
            ref={containerRef}
            className="relative w-full h-full flex flex-col items-center justify-start overflow-y-auto p-4 md:p-12 scroll-smooth"
            style={{ 
                fontFamily: fontFamily, 
                fontSize: `${fontSize}px`,
                color: themeStyle.textColor,
                lineHeight: '2.0',
                backgroundColor: 'transparent'
            }}
        >
            <div className="max-w-5xl text-left relative z-10 mx-auto w-full">
                {words.map((word, i) => {
                    if (word === '\n\n') {
                        return <div key={`br-${i}`} className="h-6 md:h-10 w-full" />;
                    }
                    
                    const isFocus = i === currentIndex;
                    const isPast = i < currentIndex;

                    return (
                        <span
                            key={i}
                            ref={el => spanRefs.current[i] = el}
                            className="inline-block mr-2 md:mr-3 mb-3 md:mb-4 transition-all duration-300 ease-in-out px-2 rounded-xl"
                            style={{
                                filter: isFocus ? 'blur(0px)' : 'blur(5px)',
                                opacity: isFocus ? 1 : (isPast ? 0.3 : 0.6),
                                backgroundColor: isFocus ? `${themeStyle.accentColor}33` : 'transparent',
                                borderBottom: isFocus ? `3px solid ${themeStyle.accentColor}` : '3px solid transparent',
                                transform: isFocus ? 'scale(1.02)' : 'scale(1)'
                            }}
                        >
                            {word}
                        </span>
                    );
                })}

                {/* La Pelotita Cometa (Guía Visual) */}
                {ballPos && (
                    <div 
                        className="absolute z-50 pointer-events-none"
                        style={{
                            left: ballPos.x,
                            top: ballPos.y,
                            transform: 'translate(-50%, -50%)',
                            transition: isInstantSnap ? 'none' : 'all 0.25s cubic-bezier(0.25, 1, 0.5, 1)'
                        }}
                    >
                        {/* Núcleo de la pelota */}
                        <div className="w-4 h-4 md:w-5 md:h-5 rounded-full bg-cyan-400 shadow-[0_0_20px_8px_rgba(34,211,238,0.7)] animate-pulse" />
                        
                        {/* Rastro Cometa usando pseudo-elementos via CSS in line */}
                        <div 
                            className="absolute top-1/2 left-1/2 h-1 md:h-2 bg-gradient-to-l from-cyan-400 to-transparent opacity-60 origin-left rounded-full"
                            style={{
                                width: '40px',
                                transform: 'translateY(-50%) rotate(180deg) translateX(10px)',
                                transition: isInstantSnap ? 'none' : 'all 0.25s'
                            }}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default SaccadicFocusReader;
