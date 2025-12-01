import { useEffect } from 'react';

/**
 * Custom hook for handling keyboard shortcuts.
 * @param {Object} handlers - Object containing handler functions.
 * @param {Function} [handlers.onSpace] - Handler for Space key.
 * @param {Function} [handlers.onEsc] - Handler for Escape key.
 * @param {Function} [handlers.onArrowUp] - Handler for ArrowUp key.
 * @param {Function} [handlers.onArrowDown] - Handler for ArrowDown key.
 * @param {Array} [deps] - Dependency array for useEffect.
 */
const useKeyboardShortcuts = ({ onSpace, onEsc, onArrowUp, onArrowDown }, deps = []) => {
    useEffect(() => {
        const handleKeyDown = (event) => {
            // Ignore if focus is on an input or textarea
            if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)) {
                return;
            }

            switch (event.code) {
                case 'Space':
                    if (onSpace) {
                        event.preventDefault(); // Prevent scrolling
                        onSpace();
                    }
                    break;
                case 'Escape':
                    if (onEsc) {
                        onEsc();
                    }
                    break;
                case 'ArrowUp':
                    if (onArrowUp) {
                        event.preventDefault(); // Prevent scrolling
                        onArrowUp();
                    }
                    break;
                case 'ArrowDown':
                    if (onArrowDown) {
                        event.preventDefault(); // Prevent scrolling
                        onArrowDown();
                    }
                    break;
                default:
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [...deps, onSpace, onArrowDown, onArrowUp, onEsc]);
};

export default useKeyboardShortcuts;
