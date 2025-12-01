// Core Web Vitals Monitor - Solo para desarrollo
import logger from './logger.js';

class PerformanceMonitor {
  constructor() {
    this.metrics = {};
    this.init();
  }

  init() {
    // Solo en desarrollo o con flag de debug
    if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.search.includes('debug=perf'))) {
      // Cargar web-vitals dinámicamente para evitar problemas de build
      import('web-vitals').then(({ onCLS, onFID, onFCP, onLCP, onTTFB }) => {
        this.startMonitoring(onCLS, onFID, onFCP, onLCP, onTTFB);
      }).catch(() => {
        console.warn('web-vitals no disponible, usando monitoreo básico');
        this.startBasicMonitoring();
      });
    }
  }

  startMonitoring(onCLS, onFID, onFCP, onLCP, onTTFB) {
    logger.log('📊 Iniciando monitoreo de Core Web Vitals...');

    // Largest Contentful Paint (LCP)
    onLCP((metric) => {
      this.metrics.LCP = metric;
      logger.log('🖼️ LCP:', metric.value.toFixed(2) + 'ms', this.getLCPScore(metric.value));
    });

    // First Input Delay (FID)
    onFID((metric) => {
      this.metrics.FID = metric;
      logger.log('👆 FID:', metric.value.toFixed(2) + 'ms', this.getFIDScore(metric.value));
    });

    // Cumulative Layout Shift (CLS)
    onCLS((metric) => {
      this.metrics.CLS = metric;
      logger.log('📐 CLS:', metric.value.toFixed(4), this.getCLSScore(metric.value));
    });

    // First Contentful Paint (FCP)
    onFCP((metric) => {
      this.metrics.FCP = metric;
      logger.log('🎨 FCP:', metric.value.toFixed(2) + 'ms', this.getFCPScore(metric.value));
    });

    // Time to First Byte (TTFB)
    onTTFB((metric) => {
      this.metrics.TTFB = metric;
      logger.log('⚡ TTFB:', metric.value.toFixed(2) + 'ms', this.getTTFBScore(metric.value));
    });

    // Bundle loading time
    this.measureBundleLoading();

    // Memory usage
    this.monitorMemoryUsage();
  }

  startBasicMonitoring() {
    logger.log('📊 Monitoreo básico de performance activado...');

    // Bundle loading time
    this.measureBundleLoading();

    // Basic memory monitoring
    this.monitorMemoryUsage();

    // Basic load time
    if (window.performance && window.performance.timing) {
      const loadTime = window.performance.timing.loadEventEnd - window.performance.timing.navigationStart;
      logger.log('⚡ Tiempo de carga básico:', loadTime + 'ms');
    }
  }

  // Scoring functions based on Google's thresholds
  getLCPScore(value) {
    if (value <= 2500) return '🟢 Bueno';
    if (value <= 4000) return '🟡 Necesita mejorar';
    return '🔴 Malo';
  }

  getFIDScore(value) {
    if (value <= 100) return '🟢 Bueno';
    if (value <= 300) return '🟡 Necesita mejorar';
    return '🔴 Malo';
  }

  getCLSScore(value) {
    if (value <= 0.1) return '🟢 Bueno';
    if (value <= 0.25) return '🟡 Necesita mejorar';
    return '🔴 Malo';
  }

  getFCPScore(value) {
    if (value <= 1800) return '🟢 Bueno';
    if (value <= 3000) return '🟡 Necesita mejorar';
    return '🔴 Malo';
  }

  getTTFBScore(value) {
    if (value <= 800) return '🟢 Bueno';
    if (value <= 1800) return '🟡 Necesita mejorar';
    return '🔴 Malo';
  }

  measureBundleLoading() {
    // Medir tiempo de carga del primer bundle
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        if (entry.name.includes('.js') && entry.transferSize > 0) {
          logger.log('📦 Bundle cargado:', entry.name.split('/').pop(),
                     'Tamaño:', (entry.transferSize / 1024).toFixed(1) + 'KB',
                     'Tiempo:', entry.duration.toFixed(2) + 'ms');
        }
      });
    });

    observer.observe({ entryTypes: ['resource'] });

    // Cleanup después de 10 segundos
    setTimeout(() => observer.disconnect(), 10000);
  }

  monitorMemoryUsage() {
    if ('memory' in performance) {
      setInterval(() => {
        const memInfo = performance.memory;
        logger.log('🧠 Memoria:', {
          used: (memInfo.usedJSHeapSize / 1024 / 1024).toFixed(1) + 'MB',
          total: (memInfo.totalJSHeapSize / 1024 / 1024).toFixed(1) + 'MB',
          limit: (memInfo.jsHeapSizeLimit / 1024 / 1024).toFixed(1) + 'MB'
        });
      }, 5000);
    }
  }

  // Método para obtener métricas (útil para debugging)
  getMetrics() {
    return this.metrics;
  }

  // Reporte final
  generateReport() {
    logger.log('\n📊 REPORTE DE PERFORMANCE - aLeer');
    logger.log('=' .repeat(40));

    const scores = [];
    Object.keys(this.metrics).forEach(key => {
      const metric = this.metrics[key];
      scores.push(`${key}: ${metric.value.toFixed(2)}`);
    });

    logger.log('Core Web Vitals:', scores.join(' | '));

    // Calcular score general
    const lcpScore = this.metrics.LCP ? (this.metrics.LCP.value <= 2500 ? 1 : this.metrics.LCP.value <= 4000 ? 0.5 : 0) : 0;
    const fidScore = this.metrics.FID ? (this.metrics.FID.value <= 100 ? 1 : this.metrics.FID.value <= 300 ? 0.5 : 0) : 0;
    const clsScore = this.metrics.CLS ? (this.metrics.CLS.value <= 0.1 ? 1 : this.metrics.CLS.value <= 0.25 ? 0.5 : 0) : 0;

    const overallScore = ((lcpScore + fidScore + clsScore) / 3) * 100;
    logger.log('Score General CWV:', Math.round(overallScore) + '/100');

    return this.metrics;
  }
}

// Singleton instance
const performanceMonitor = new PerformanceMonitor();

export default performanceMonitor;
