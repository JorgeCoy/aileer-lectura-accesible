/**
 * Configuración de Analytics - OPCIONAL
 *
 * ⚠️ IMPORTANTE: Las métricas están DESACTIVADAS por defecto
 * para garantizar funcionamiento 100% offline.
 *
 * Para activar métricas cuando tengas backend robusto:
 * 1. Configurar servicio de analytics (Google Analytics, etc.)
 * 2. Cambiar ENABLE_ANALYTICS = true
 * 3. Probar funcionamiento offline después de activar
 */

// 🚫 ANALYTICS DESACTIVADOS POR DEFECTO PARA FUNCIONAMIENTO OFFLINE
import logger from '../utils/logger.js';

export const ENABLE_ANALYTICS = false;

// Configuración de analytics (solo se usa si está activado)
export const ANALYTICS_CONFIG = {
  googleAnalyticsId: import.meta.env.VITE_GA_ID || '',
  mixpanelToken: import.meta.env.VITE_MIXPANEL_TOKEN || '',
  enableUserTracking: false,
  enablePerformanceTracking: false,
  enableErrorTracking: false
};

// Eventos que se trackearían (solo si analytics está activado)
export const ANALYTICS_EVENTS = {
  USER_LOGIN: 'user_login',
  READING_SESSION_START: 'reading_session_start',
  READING_SESSION_COMPLETE: 'reading_session_complete',
  TEST_START: 'test_start',
  TEST_COMPLETE: 'test_complete',
  PLAN_START: 'plan_start',
  LEVEL_UP: 'level_up',
  APP_INSTALLED: 'app_installed',
  OFFLINE_MODE: 'offline_mode'
};

// Estado interno para progressive enhancement
let analyticsLoaded = false;
let gtag = null;

// Función para inicializar Google Analytics cuando hay internet
export const initializeAnalytics = async () => {
  if (analyticsLoaded || !ENABLE_ANALYTICS) return;

  try {
    // Cargar Google Analytics dinámicamente
    if (ANALYTICS_CONFIG.googleAnalyticsId) {
      // Crear script de Google Analytics
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${ANALYTICS_CONFIG.googleAnalyticsId}`;
      document.head.appendChild(script);

      // Configurar gtag
      window.dataLayer = window.dataLayer || [];
      gtag = function() {
        window.dataLayer.push(arguments);
      };
      gtag('js', new Date());
      gtag('config', ANALYTICS_CONFIG.googleAnalyticsId);

      analyticsLoaded = true;
      logger.log('📊 Google Analytics inicializado');
    }
  } catch (error) {
    logger.warn('Error inicializando analytics:', error);
  }
};

// Función segura que maneja progressive enhancement
export const trackEvent = (eventName, data = {}) => {
  // Si analytics está activado y cargado, enviar evento
  if (ENABLE_ANALYTICS && analyticsLoaded && gtag) {
    try {
      gtag('event', eventName, {
        custom_parameters: data
      });
      logger.log('📊 Evento enviado:', eventName, data);
    } catch (error) {
      logger.warn('Error enviando evento:', error);
    }
    return;
  }

  // Si analytics está activado pero no cargado, intentar inicializar
  if (ENABLE_ANALYTICS && !analyticsLoaded) {
    initializeAnalytics().then(() => {
      if (analyticsLoaded) {
        trackEvent(eventName, data); // Reintentar
      }
    });
    return;
  }

  // Fallback: solo loguear en desarrollo
  if (import.meta.env.DEV) {
    logger.log('📊 Analytics Event (simulado):', eventName, data);
  }
};

// Función para trackear performance (solo si está activado)
export const trackPerformance = (metric, value) => {
  if (!ENABLE_ANALYTICS || !ANALYTICS_CONFIG.enablePerformanceTracking) {
    return;
  }

  // Implementar tracking de performance aquí
  logger.log('⚡ Performance Metric:', metric, value);
};

// Función para trackear errores (solo si está activado)
export const trackError = (error, context = {}) => {
  if (!ENABLE_ANALYTICS || !ANALYTICS_CONFIG.enableErrorTracking) {
    // Siempre loguear errores en consola
    logger.error('❌ Error:', error, context);
    return;
  }

  // Implementar tracking de errores aquí
  logger.error('❌ Tracked Error:', error, context);
};

// ⚠️ NOTA IMPORTANTE:
// - Analytics está COMPLETAMENTE DESACTIVADO por defecto
// - La app funciona 100% offline sin analytics
// - Solo activar cuando tengas infraestructura robusta
// - Probar offline después de cualquier cambio en analytics
