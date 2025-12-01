import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WifiIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

const ConnectionIndicator = () => {
  const { isOnline, connectionType, isSlowConnection } = useOnlineStatus();

  if (isOnline && !isSlowConnection) {
    return null; // No mostrar si está online y conexión es buena
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -50 }}
        className={`fixed top-4 right-4 z-50 px-4 py-2 rounded-lg shadow-lg border ${
          isOnline
            ? 'bg-yellow-100 border-yellow-300 text-yellow-800'
            : 'bg-red-100 border-red-300 text-red-800'
        }`}
      >
        <div className="flex items-center gap-2">
          {isOnline ? (
            <>
              <WifiIcon className="w-4 h-4" />
              <span className="text-sm font-medium">
                {isSlowConnection ? 'Conexión lenta' : 'Conectado'}
              </span>
            </>
          ) : (
            <>
              <ExclamationTriangleIcon className="w-4 h-4" />
              <span className="text-sm font-medium">Sin conexión</span>
            </>
          )}
        </div>
        <div className="text-xs mt-1 opacity-75">
          {isOnline
            ? 'Funciona en modo offline'
            : 'Modo offline activado'
          }
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ConnectionIndicator;

