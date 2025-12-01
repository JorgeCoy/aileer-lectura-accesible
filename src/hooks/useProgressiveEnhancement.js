import { useState, useEffect, useCallback } from 'react';
import { useOnlineStatus } from './useOnlineStatus';
import logger from '../utils/logger.js';

/**
 * Hook para Progressive Enhancement
 * Carga funcionalidades mejoradas automáticamente cuando hay internet
 * Mantiene funcionamiento básico offline sin que el usuario se percate
 */
export function useProgressiveEnhancement() {
  const { isOnline, connectionQuality, isFastConnection } = useOnlineStatus();
  const [enhancedFeatures, setEnhancedFeatures] = useState({
    analytics: false,
    cloudSync: false,
    enhancedFonts: false,
    autoUpdates: false,
    socialFeatures: false,
    premiumContent: false
  });
  const [loadingStates, setLoadingStates] = useState({});

  // Cargar analytics cuando hay buena conexión
  const loadAnalytics = useCallback(async () => {
    if (!isOnline || !isFastConnection) return;

    try {
      setLoadingStates(prev => ({ ...prev, analytics: true }));

      // Cargar analytics dinámicamente
      const { trackEvent, trackPerformance } = await import('../config/analytics.js');

      // Activar analytics
      setEnhancedFeatures(prev => ({ ...prev, analytics: true }));

      // Trackear que el usuario ahora tiene funcionalidades mejoradas
      trackEvent('enhanced_mode_activated', {
        connectionType: connectionQuality,
        featuresEnabled: ['analytics']
      });

      logger.log('📊 Analytics activado automáticamente');

    } catch (error) {
      console.warn('Error cargando analytics:', error);
    } finally {
      setLoadingStates(prev => ({ ...prev, analytics: false }));
    }
  }, [isOnline, isFastConnection, connectionQuality]);

  // Fuentes offline ya están disponibles - no necesitamos cargar de internet

  // Cargar sistema de sincronización con nube
  const loadCloudSync = useCallback(async () => {
    if (!isOnline || !isFastConnection) return;

    try {
      setLoadingStates(prev => ({ ...prev, cloudSync: true }));

      // Cargar módulo de sincronización
      const cloudSyncAPI = await import('../services/CloudSyncService.js');

      setEnhancedFeatures(prev => ({ ...prev, cloudSync: true }));
      logger.log('☁️ Sincronización con nube activada');

      // Iniciar sincronización automática
      cloudSyncAPI.default.startAutoSync();

    } catch (error) {
      console.warn('Error cargando sincronización:', error);
    } finally {
      setLoadingStates(prev => ({ ...prev, cloudSync: false }));
    }
  }, [isOnline, isFastConnection]);

  // Cargar sistema de actualizaciones automáticas
  const loadAutoUpdates = useCallback(async () => {
    if (!isOnline) return;

    try {
      setLoadingStates(prev => ({ ...prev, updates: true }));

      // Verificar si hay actualizaciones disponibles
      const updateAPI = await import('../services/UpdateService.js');

      const updateAvailable = await updateAPI.default.checkForUpdates();

      if (updateAvailable) {
        setEnhancedFeatures(prev => ({ ...prev, autoUpdates: true }));
        logger.log('🔄 Actualización automática disponible');
      }

    } catch (error) {
      console.warn('Error verificando actualizaciones:', error);
    } finally {
      setLoadingStates(prev => ({ ...prev, updates: false }));
    }
  }, [isOnline]);

  // Efecto principal: cargar mejoras cuando hay internet
  useEffect(() => {
    if (isOnline) {
      // Priorizar funcionalidades críticas primero
      if (isFastConnection) {
        loadAnalytics();
        loadCloudSync();
      }

      // Funcionalidades que funcionan con conexiones normales
      loadAutoUpdates();
    } else {
      // Si se pierde la conexión, mantener funcionalidades offline
      logger.log('📴 Modo offline activado - funcionalidades básicas disponibles');
    }
  }, [isOnline, isFastConnection, loadAnalytics, loadCloudSync, loadAutoUpdates]);

  // Función para forzar recarga de mejoras
  const refreshEnhancements = useCallback(async () => {
    if (isOnline) {
      await Promise.all([
        loadAnalytics(),
        loadCloudSync(),
        loadAutoUpdates()
      ]);
    }
  }, [isOnline, loadAnalytics, loadCloudSync, loadAutoUpdates]);

  return {
    // Estado de funcionalidades mejoradas
    enhancedFeatures,

    // Estados de carga
    loadingStates,

    // Información de conectividad
    isOnline,
    connectionQuality,

    // Funciones de control
    refreshEnhancements,

    // Utilidades
    hasEnhancements: Object.values(enhancedFeatures).some(Boolean),
    enhancementCount: Object.values(enhancedFeatures).filter(Boolean).length
  };
}
