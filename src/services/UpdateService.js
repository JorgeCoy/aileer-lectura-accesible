/**
 * Servicio de Actualizaciones Automáticas
 * Verifica y aplica actualizaciones cuando hay internet
 * Funciona en background sin interrumpir al usuario
 */

import logger from '../utils/logger.js';

class UpdateService {
  constructor() {
    this.checkInterval = null;
    this.lastCheck = null;
    this.updateAvailable = false;
    this.currentVersion = '1.0.0'; // Versión actual de la app
  }

  // Inicializar servicio
  async initialize() {
    try {
      // Cargar versión desde localStorage o usar default
      this.currentVersion = localStorage.getItem('appVersion') || this.currentVersion;
      this.lastCheck = new Date(localStorage.getItem('lastUpdateCheck') || Date.now());

      logger.log('🔄 Update Service inicializado - Versión:', this.currentVersion);
    } catch (error) {
      console.warn('Error inicializando Update Service:', error);
    }
  }

  // Verificar si hay actualizaciones disponibles
  async checkForUpdates() {
    // En modo offline-first, no verificamos actualizaciones automáticamente
    // Solo verificamos la versión local
    logger.log('🔍 Verificación de actualizaciones (modo offline)...');

    const lastCheck = localStorage.getItem('lastUpdateCheck');
    const now = Date.now();
    const twentyFourHours = 24 * 60 * 60 * 1000;

    // Solo verificar si ha pasado más de 24 horas (y solo si hay conexión)
    if (lastCheck && (now - parseInt(lastCheck)) < twentyFourHours) {
      logger.log('⏰ Última verificación reciente, saltando...');
      return false;
    }

    // Si no hay conexión, no verificar
    if (!navigator.onLine) {
      logger.log('📴 Sin conexión - saltando verificación de actualizaciones');
      return false;
    }

    try {
      // En producción, aquí iría la lógica real para verificar actualizaciones
      // Por ahora, simulamos que no hay actualizaciones
      logger.log('✅ Verificación completada - usando versión local');

      // Actualizar timestamp de última verificación
      localStorage.setItem('lastUpdateCheck', now.toString());

      return false; // No hay actualizaciones disponibles

    } catch (error) {
      console.warn('Error verificando actualizaciones:', error);
      return false;
    }
  }

  // Verificar actualizaciones del service worker
  async checkServiceWorkerUpdates() {
    try {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready;

        // Forzar verificación de updates
        registration.update();

        // Verificar si hay waiting worker (nueva versión)
        if (registration.waiting) {
          this.updateAvailable = true;
          logger.log('🆕 Service Worker update disponible');
          return true;
        }
      }
      return false;
    } catch (error) {
      console.warn('Error verificando SW updates:', error);
      return false;
    }
  }

  // Comparar versiones semánticas
  compareVersions(version1, version2) {
    const v1 = version1.split('.').map(Number);
    const v2 = version2.split('.').map(Number);

    for (let i = 0; i < Math.max(v1.length, v2.length); i++) {
      const num1 = v1[i] || 0;
      const num2 = v2[i] || 0;

      if (num1 > num2) return 1;
      if (num1 < num2) return -1;
    }

    return 0;
  }

  // Aplicar actualización
  async applyUpdate() {
    if (!this.updateAvailable) return false;

    try {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready;

        if (registration.waiting) {
          // Notificar al service worker que tome el control
          registration.waiting.postMessage({ type: 'SKIP_WAITING' });

          // Escuchar cuando el nuevo SW tome el control
          registration.waiting.addEventListener('statechange', (event) => {
            if (event.target.state === 'activated') {
              logger.log('🔄 Actualización aplicada, recargando...');
              window.location.reload();
            }
          });

          return true;
        }
      }

      // Fallback: recargar la página
      logger.log('🔄 Aplicando actualización...');
      window.location.reload();
      return true;

    } catch (error) {
      console.warn('Error aplicando actualización:', error);
      return false;
    }
  }

  // Iniciar verificación automática
  startAutoCheck(intervalMinutes = 60) {
    this.stopAutoCheck(); // Detener si ya estaba ejecutándose

    this.checkInterval = setInterval(async () => {
      try {
        const updateAvailable = await this.checkForUpdates();
        if (updateAvailable) {
          // Notificar al usuario sutilmente
          this.notifyUserOfUpdate();
        }
      } catch (error) {
        console.warn('Error en verificación automática:', error);
      }
    }, intervalMinutes * 60 * 1000);

    logger.log(`🔄 Verificación automática cada ${intervalMinutes} minutos`);
  }

  // Detener verificación automática
  stopAutoCheck() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
      logger.log('⏹️ Verificación automática detenida');
    }
  }

  // Notificar al usuario de actualización disponible
  notifyUserOfUpdate() {
    // Crear notificación sutil (no intrusiva)
    const notification = document.createElement('div');
    notification.className = 'fixed bottom-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg z-50';
    notification.innerHTML = `
      <div class="flex items-center gap-2">
        <span>🔄 Actualización disponible</span>
        <button onclick="this.parentElement.parentElement.remove()" class="ml-2 text-blue-200 hover:text-white">✕</button>
      </div>
      <button onclick="window.location.reload()" class="mt-2 bg-blue-700 hover:bg-blue-800 px-3 py-1 rounded text-sm">
        Actualizar ahora
      </button>
    `;

    document.body.appendChild(notification);

    // Auto-remover después de 10 segundos
    setTimeout(() => {
      if (notification.parentElement) {
        notification.remove();
      }
    }, 10000);
  }

  // Obtener estado del servicio
  getStatus() {
    return {
      currentVersion: this.currentVersion,
      lastCheck: this.lastCheck,
      updateAvailable: this.updateAvailable,
      autoCheckActive: this.checkInterval !== null,
      timeSinceLastCheck: this.lastCheck ? Date.now() - this.lastCheck.getTime() : null
    };
  }
}

// Instancia singleton
let updateServiceInstance = null;

// API pública del servicio
export const updateAPI = {
  getInstance: () => {
    if (!updateServiceInstance) {
      updateServiceInstance = new UpdateService();
    }
    return updateServiceInstance;
  },

  checkForUpdates: () => {
    const instance = updateAPI.getInstance();
    return instance.initialize().then(() => instance.checkForUpdates());
  },

  applyUpdate: () => {
    const instance = updateAPI.getInstance();
    return instance.applyUpdate();
  },

  startAutoCheck: (intervalMinutes = 60) => {
    const instance = updateAPI.getInstance();
    instance.initialize().then(() => {
      instance.startAutoCheck(intervalMinutes);
    });
  },

  stopAutoCheck: () => {
    if (updateServiceInstance) {
      updateServiceInstance.stopAutoCheck();
    }
  },

  getStatus: () => {
    const instance = updateAPI.getInstance();
    return instance.getStatus();
  }
};

export default updateAPI;
