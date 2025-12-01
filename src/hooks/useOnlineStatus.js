import { useState, useEffect, useCallback } from 'react';

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [connectionType, setConnectionType] = useState('unknown');
  const [connectionQuality, setConnectionQuality] = useState('unknown');
  const [lastOnlineCheck, setLastOnlineCheck] = useState(Date.now());

  // Función para verificar conectividad real (no solo navigator.onLine)
  const checkRealConnectivity = useCallback(async () => {
    try {
      // Intentar una petición HEAD a un endpoint pequeño
      const response = await fetch('/favicon.ico', {
        method: 'HEAD',
        cache: 'no-cache',
        signal: AbortSignal.timeout(3000) // Timeout de 3 segundos
      });
      return response.ok;
    } catch {
      return false;
    }
  }, []);

  // Verificar conectividad periódicamente cuando está offline
  useEffect(() => {
    if (!isOnline) {
      const interval = setInterval(async () => {
        const realOnline = await checkRealConnectivity();
        if (realOnline) {
          setIsOnline(true);
          setLastOnlineCheck(Date.now());
        }
      }, 30000); // Verificar cada 30 segundos cuando está offline

      return () => clearInterval(interval);
    }
  }, [isOnline, checkRealConnectivity]);

  useEffect(() => {
    const handleOnline = async () => {
      // Verificar conectividad real antes de marcar como online
      const realOnline = await checkRealConnectivity();
      setIsOnline(realOnline);
      if (realOnline) {
        setLastOnlineCheck(Date.now());
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Detectar tipo de conexión si está disponible
    if ('connection' in navigator) {
      const connection = navigator.connection;
      setConnectionType(connection.effectiveType || 'unknown');

      const updateConnectionInfo = () => {
        const type = connection.effectiveType || 'unknown';
        setConnectionType(type);

        // Calcular calidad de conexión
        let quality = 'unknown';
        switch (type) {
          case '4g':
          case 'fast-4g':
            quality = 'fast';
            break;
          case '3g':
            quality = 'medium';
            break;
          case '2g':
          case 'slow-2g':
            quality = 'slow';
            break;
          default:
            quality = 'unknown';
        }
        setConnectionQuality(quality);
      };

      updateConnectionInfo();
      connection.addEventListener('change', updateConnectionInfo);

      return () => {
        connection.removeEventListener('change', updateConnectionInfo);
      };
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [checkRealConnectivity]);

  return {
    isOnline,
    connectionType,
    connectionQuality,
    lastOnlineCheck,
    isSlowConnection: connectionQuality === 'slow',
    isFastConnection: connectionQuality === 'fast',
    isMediumConnection: connectionQuality === 'medium',
    // Funciones útiles
    checkConnectivity: checkRealConnectivity,
    timeSinceLastCheck: Date.now() - lastOnlineCheck
  };
}
