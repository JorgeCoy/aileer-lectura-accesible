import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

const Tooltip = ({ text, children, placement = 'right' }) => {
    const [isVisible, setIsVisible] = useState(false);

    return (
        <div
            className="relative flex items-center"
            onMouseEnter={() => setIsVisible(true)}
            onMouseLeave={() => setIsVisible(false)}
        >
            {children}
            <AnimatePresence>
                {isVisible && (
                    <motion.div
                        initial={{ opacity: 0, x: -10, scale: 0.9 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: -10, scale: 0.9 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className={`absolute z-50 px-3 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg shadow-xl whitespace-nowrap pointer-events-none border border-gray-700
              ${placement === 'right' ? 'left-full ml-3' : ''}
              ${placement === 'left' ? 'right-full mr-3' : ''}
              ${placement === 'top' ? 'bottom-full mb-3' : ''}
              ${placement === 'bottom' ? 'top-full mt-3' : ''}
            `}
                    >
                        {text}
                        {/* Arrow */}
                        <div
                            className={`absolute w-2 h-2 bg-gray-900 border-l border-b border-gray-700 transform rotate-45
                ${placement === 'right' ? 'left-[-5px] top-1/2 -translate-y-1/2' : ''}
                ${placement === 'left' ? 'right-[-5px] top-1/2 -translate-y-1/2 rotate-[225deg]' : ''}
                ${placement === 'top' ? 'bottom-[-5px] left-1/2 -translate-x-1/2 rotate-[315deg]' : ''}
                ${placement === 'bottom' ? 'top-[-5px] left-1/2 -translate-x-1/2 rotate-[135deg]' : ''}
              `}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Tooltip;
