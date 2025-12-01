// src/patterns/ServiceContainer.js
// Patrón Dependency Injection Container

export class ServiceContainer {
  constructor() {
    this.services = new Map();
    this.singletons = new Map();
  }

  // Registrar un servicio con una factory function
  register(name, factory, singleton = false) {
    this.services.set(name, { factory, singleton });
    return this;
  }

  // Resolver una dependencia
  resolve(name) {
    const service = this.services.get(name);

    if (!service) {
      throw new Error(`Service ${name} not registered`);
    }

    if (service.singleton) {
      if (!this.singletons.has(name)) {
        this.singletons.set(name, service.factory(this));
      }
      return this.singletons.get(name);
    }

    return service.factory(this);
  }

  // Verificar si un servicio está registrado
  has(name) {
    return this.services.has(name);
  }

  // Limpiar todos los singletons (útil para testing)
  clear() {
    this.singletons.clear();
  }
}

// Servicios disponibles
export class OCRService {
  constructor(container) {
    this.recognizePage = container.resolve('ocrRecognizePage');
    this.terminateWorker = container.resolve('ocrTerminateWorker');
    this.getWorker = container.resolve('ocrGetWorker');
  }

  async recognize(imageSource, progressCallback) {
    return await this.recognizePage(imageSource, progressCallback);
  }

  async terminate() {
    return await this.terminateWorker();
  }
}

export class SpeechService {
  constructor(container) {
    this.speak = container.resolve('speechSpeak');
    this.stop = container.resolve('speechStop');
    this.getVoices = container.resolve('speechGetVoices');
    this.setVoice = container.resolve('speechSetVoice');
  }

  async speakText(text, options = {}) {
    return await this.speak(text, options);
  }

  stopSpeaking() {
    this.stop();
  }

  getAvailableVoices() {
    return this.getVoices();
  }

  setSelectedVoice(voice) {
    this.setVoice(voice);
  }
}

export class PDFService {
  constructor(container) {
    this.loadPDF = container.resolve('pdfLoad');
    this.getPageText = container.resolve('pdfGetPageText');
    this.renderPage = container.resolve('pdfRenderPage');
    this.getPageCount = container.resolve('pdfGetPageCount');
  }

  async loadDocument(file) {
    return await this.loadPDF(file);
  }

  async extractText(pageNumber) {
    return await this.getPageText(pageNumber);
  }

  async renderToCanvas(pageNumber, canvas, scale = 1.5) {
    return await this.renderPage(pageNumber, canvas, scale);
  }

  getTotalPages() {
    return this.getPageCount();
  }
}

export class StorageService {
  constructor(container) {
    this.get = container.resolve('storageGet');
    this.set = container.resolve('storageSet');
    this.remove = container.resolve('storageRemove');
    this.clear = container.resolve('storageClear');
  }

  getItem(key) {
    return this.get(key);
  }

  setItem(key, value) {
    this.set(key, value);
  }

  removeItem(key) {
    this.remove(key);
  }

  clearAll() {
    this.clear();
  }
}

export class PerformanceMonitorService {
  constructor(container) {
    this.startTracking = container.resolve('performanceStart');
    this.stopTracking = container.resolve('performanceStop');
    this.getMetrics = container.resolve('performanceGetMetrics');
    this.logEvent = container.resolve('performanceLogEvent');
  }

  startSession(sessionId) {
    this.startTracking(sessionId);
  }

  endSession() {
    return this.stopTracking();
  }

  getPerformanceMetrics() {
    return this.getMetrics();
  }

  logUserEvent(eventType, data) {
    this.logEvent(eventType, data);
  }
}

// Factory para crear el contenedor con servicios por defecto
export function createDefaultServiceContainer() {
  const container = new ServiceContainer();

  // OCR Services
  container
    .register('ocrGetWorker', () => import('../utils/ocrService.js').then(m => m.getWorkerInstance))
    .register('ocrRecognizePage', () => import('../utils/ocrService.js').then(m => m.recognizePageInstance))
    .register('ocrTerminateWorker', () => import('../utils/ocrService.js').then(m => m.terminateWorkerInstance))
    .register('ocrService', (c) => new OCRService(c), true);

  // Speech Services
  container
    .register('speechSpeak', () => import('../utils/speech.js').then(m => m.speak))
    .register('speechStop', () => import('../utils/speech.js').then(m => m.stop))
    .register('speechGetVoices', () => import('../utils/speech.js').then(m => m.getVoices))
    .register('speechSetVoice', () => import('../utils/speech.js').then(m => m.setVoice))
    .register('speechService', (c) => new SpeechService(c), true);

  // PDF Services
  container
    .register('pdfLoad', () => import('../hooks/usePdf.js').then(m => m.default))
    .register('pdfGetPageText', () => import('../hooks/usePdf.js').then(m => m.extractText))
    .register('pdfRenderPage', () => import('../hooks/usePdf.js').then(m => m.renderPage))
    .register('pdfGetPageCount', () => import('../hooks/usePdf.js').then(m => m.getPageCount))
    .register('pdfService', (c) => new PDFService(c), true);

  // Storage Services
  container
    .register('storageGet', () => (key) => localStorage.getItem(key))
    .register('storageSet', () => (key, value) => localStorage.setItem(key, value))
    .register('storageRemove', () => (key) => localStorage.removeItem(key))
    .register('storageClear', () => () => localStorage.clear())
    .register('storageService', (c) => new StorageService(c), true);

  // Performance Monitor Services
  container
    .register('performanceStart', () => import('../utils/performanceMonitor.js').then(m => m.startTracking))
    .register('performanceStop', () => import('../utils/performanceMonitor.js').then(m => m.stopTracking))
    .register('performanceGetMetrics', () => import('../utils/performanceMonitor.js').then(m => m.getPerformanceMetrics))
    .register('performanceLogEvent', () => import('../utils/performanceMonitor.js').then(m => m.logEvent))
    .register('performanceService', (c) => new PerformanceMonitorService(c), true);

  return container;
}

// Instancia global del contenedor (singleton)
let globalContainer = null;

export function getGlobalServiceContainer() {
  if (!globalContainer) {
    globalContainer = createDefaultServiceContainer();
  }
  return globalContainer;
}

export function setGlobalServiceContainer(container) {
  globalContainer = container;
}

// Hook para usar servicios inyectados
export function useService(serviceName) {
  const container = getGlobalServiceContainer();
  return container.resolve(serviceName);
}

// Para testing: crear contenedor con mocks
export function createMockServiceContainer(mocks = {}) {
  const container = new ServiceContainer();

  // Registrar servicios mock si se proporcionan
  Object.entries(mocks).forEach(([name, mockFactory]) => {
    container.register(name, mockFactory);
  });

  return container;
}
