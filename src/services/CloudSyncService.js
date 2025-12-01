/**
 * Servicio de Sincronización con la Nube
 * Se carga dinámicamente cuando hay buena conexión a internet
 * Maneja backup y sincronización de datos de usuario
 */

import logger from '../utils/logger.js';

class CloudSyncService {
  constructor() {
    this.isInitialized = false;
    this.syncInterval = null;
    this.lastSync = null;
  }

  // Inicializar el servicio
  async initialize() {
    if (this.isInitialized) return;

    try {
      logger.log('☁️ Inicializando Cloud Sync Service...');

      // Aquí iría la configuración real de backend
      // Por ahora es un placeholder que simula sincronización

      this.isInitialized = true;
      this.lastSync = new Date();

      logger.log('☁️ Cloud Sync Service inicializado');
    } catch (error) {
      console.warn('Error inicializando Cloud Sync:', error);
      throw error;
    }
  }

  // Iniciar sincronización automática
  startAutoSync() {
    if (!this.isInitialized) return;

    // Sincronizar cada 5 minutos cuando hay internet
    this.syncInterval = setInterval(async () => {
      try {
        await this.syncUserData();
      } catch (error) {
        console.warn('Error en sincronización automática:', error);
      }
    }, 5 * 60 * 1000); // 5 minutos

    logger.log('🔄 Sincronización automática activada');
  }

  // Detener sincronización automática
  stopAutoSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
      logger.log('⏹️ Sincronización automática detenida');
    }
  }

  // Sincronizar datos del usuario
  async syncUserData() {
    if (!this.isInitialized) return;

    try {
      // Obtener datos locales
      const userProfile = JSON.parse(localStorage.getItem('userProfile') || '{}');
      const gamification = JSON.parse(localStorage.getItem('aleer_gamification') || '{}');

      // Aquí iría la lógica real de sincronización con backend
      // Por ahora simulamos una petición

      logger.log('☁️ Sincronizando datos del usuario...', {
        profile: userProfile,
        gamification: gamification
      });

      // Simular delay de red
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Actualizar timestamp de última sincronización
      this.lastSync = new Date();
      localStorage.setItem('lastCloudSync', this.lastSync.toISOString());

      logger.log('✅ Datos sincronizados con la nube');

    } catch (error) {
      console.warn('Error sincronizando datos:', error);
      throw error;
    }
  }

  // Obtener estado de sincronización
  getSyncStatus() {
    return {
      isInitialized: this.isInitialized,
      lastSync: this.lastSync,
      isAutoSyncActive: this.syncInterval !== null,
      timeSinceLastSync: this.lastSync ? Date.now() - this.lastSync.getTime() : null
    };
  }

  // Backup manual
  async createBackup() {
    try {
      const backup = {
        timestamp: new Date().toISOString(),
        userProfile: localStorage.getItem('userProfile'),
        gamification: localStorage.getItem('aleer_gamification'),
        history: localStorage.getItem('readingHistory'),
        version: '1.0.0'
      };

      // Aquí iría el envío a backend
      logger.log('💾 Backup creado:', backup);

      return backup;
    } catch (error) {
      console.warn('Error creando backup:', error);
      throw error;
    }
  }

  // Restaurar desde backup
  async restoreBackup(backup) {
    try {
      if (backup.userProfile) {
        localStorage.setItem('userProfile', backup.userProfile);
      }
      if (backup.gamification) {
        localStorage.setItem('aleer_gamification', backup.gamification);
      }
      if (backup.history) {
        localStorage.setItem('readingHistory', backup.history);
      }

      logger.log('🔄 Backup restaurado');
      window.location.reload(); // Recargar para aplicar cambios
    } catch (error) {
      console.warn('Error restaurando backup:', error);
      throw error;
    }
  }
}

// Instancia singleton
let cloudSyncInstance = null;

// API pública del servicio
export const cloudSyncAPI = {
  getInstance: () => {
    if (!cloudSyncInstance) {
      cloudSyncInstance = new CloudSyncService();
    }
    return cloudSyncInstance;
  },

  startAutoSync: () => {
    const instance = cloudSyncAPI.getInstance();
    instance.initialize().then(() => {
      instance.startAutoSync();
    });
  },

  stopAutoSync: () => {
    if (cloudSyncInstance) {
      cloudSyncInstance.stopAutoSync();
    }
  },

  syncNow: () => {
    const instance = cloudSyncAPI.getInstance();
    return instance.initialize().then(() => instance.syncUserData());
  },

  getStatus: () => {
    const instance = cloudSyncAPI.getInstance();
    return instance.getSyncStatus();
  }
};

export default cloudSyncAPI;
