import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';

const Tooltip = ({ text, children, placement = 'right', className = '' }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [coords, setCoords] = useState({ top: 0, left: 0 });
    const timeoutRef = useRef(null);
    const containerRef = useRef(null);

    const updatePosition = () => {
        if (containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            let top = 0;
            let left = 0;

            switch (placement) {
                case 'right':
                    top = rect.top + rect.height / 2;
                    left = rect.right;
                    break;
                case 'top':
                    top = rect.top;
                    left = rect.left + rect.width / 2;
                    break;
                case 'bottom':
                    top = rect.bottom;
                    left = rect.left + rect.width / 2;
                    break;
                case 'left':
                    top = rect.top + rect.height / 2;
                    left = rect.left;
                    break;
                default:
                    top = rect.top;
                    left = rect.right;
            }
            setCoords({ top, left });
        }
    };

    const showTooltip = () => {
        updatePosition();
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        setIsVisible(true);
    };

    const hideTooltip = () => {
        timeoutRef.current = setTimeout(() => {
            setIsVisible(false);
        }, 150);
    };

    // Actualizar posición al hacer scroll o resize
    useEffect(() => {
        if (isVisible) {
            window.addEventListener('scroll', updatePosition, true);
            window.addEventListener('resize', updatePosition);
            return () => {
                window.removeEventListener('scroll', updatePosition, true);
                window.removeEventListener('resize', updatePosition);
            };
        }
    }, [isVisible, updatePosition]);

    const getMotionProps = () => {
        switch (placement) {
            case 'right':
                return {
                    initial: { x: -5, y: "-50%", opacity: 0 },
                    animate: { x: 10, y: "-50%", opacity: 1 },
                    exit: { x: -5, y: "-50%", opacity: 0 }
                };
            case 'top':
                return {
                    initial: { x: "-50%", y: 5, opacity: 0 },
                    animate: { x: "-50%", y: -10, opacity: 1 },
                    exit: { x: "-50%", y: 5, opacity: 0 }
                };
            case 'bottom':
                return {
                    initial: { x: "-50%", y: -5, opacity: 0 },
                    animate: { x: "-50%", y: 10, opacity: 1 },
                    exit: { x: "-50%", y: -5, opacity: 0 }
                };
            case 'left':
                return {
                    initial: { x: 5, y: "-50%", opacity: 0 },
                    animate: { x: -10, y: "-50%", opacity: 1 },
                    exit: { x: 5, y: "-50%", opacity: 0 }
                };
            default:
                return {};
        }
    };

    const motionProps = getMotionProps();

    return (
        <div
            ref={containerRef}
            className={`relative flex items-center ${className}`}
            onMouseEnter={showTooltip}
            onMouseLeave={hideTooltip}
            onTouchStart={showTooltip}
            onTouchEnd={hideTooltip}
            onClickCapture={() => {
                setIsVisible(false);
                if (timeoutRef.current) clearTimeout(timeoutRef.current);
            }}
        >
            {children}
            {createPortal(
                <AnimatePresence>
                    {isVisible && (
                        <motion.div
                            {...motionProps}
                            transition={{ duration: 0.2, ease: "easeOut" }}
                            style={{
                                position: 'fixed',
                                top: coords.top,
                                left: coords.left,
                                zIndex: 9999, // Asegurar que esté por encima de todo
                            }}
                            className="px-3 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg shadow-xl whitespace-nowrap pointer-events-none border border-gray-700"
                        >
                            {text}
                            {/* Arrow (Simplificado, opcionalmente se puede añadir rotado) */}
                        </motion.div>
                    )}
                </AnimatePresence>,
                document.body
            )}
        </div>
    );
};

export default Tooltip;
