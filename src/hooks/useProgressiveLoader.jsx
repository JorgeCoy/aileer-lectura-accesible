import { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import { useOnlineStatus } from './useOnlineStatus';
import logger from '../utils/logger.js';

/**
 * Hook para carga progresiva de componentes basada en conectividad
 * Permite cargar funcionalidades premium cuando hay buena conexión
 * y mantener funcionalidad básica offline
 */

// Configuración de componentes premium que requieren internet
const PREMIUM_COMPONENTS = {
  // OCR mejorado con servicios en la nube
  enhancedOCR: () => import('../components/premium/EnhancedOCRService'),
  // Recomendaciones basadas en datos de la nube
  smartRecommendations: () => import('../components/premium/SmartRecommendations'),
  // Análisis de texto avanzado
  textAnalysis: () => import('../components/premium/TextAnalysis')
  // Más componentes premium se pueden agregar aquí cuando estén implementados
};

// Funcionalidades premium que mejoran la experiencia sin cambiar la UI
const PREMIUM_ENHANCEMENTS = {
  // Mejoras automáticas que se aplican en background
  autoTextAnalysis: async (text, _userProfile) => {
    // Análisis inteligente que se ejecuta automáticamente
    if (!text || text.length < 100) return null;

    try {
      // Simular análisis de complejidad
      const words = text.split(/\s+/);
      const complexity = words.length > 500 ? 'high' :
                        words.length > 200 ? 'medium' : 'low';

      return {
        complexity,
        suggestedTechnique: complexity === 'high' ? 'spritz' :
                           complexity === 'medium' ? 'bionic' : 'singleWord',
        estimatedTime: Math.ceil(words.length / 200) // minutos
      };
    } catch (error) {
      console.warn('Error en análisis automático:', error);
      return null;
    }
  },

  // Optimización automática de velocidad basada en análisis
  adaptiveSpeed: (textAnalysis, userProfile) => {
    if (!textAnalysis) return null;

    const baseSpeed = userProfile.age > 12 ? 250 : 180;
    const adjustment = textAnalysis.complexity === 'high' ? -50 :
                      textAnalysis.complexity === 'low' ? +30 : 0;

    return Math.max(100, Math.min(600, baseSpeed + adjustment));
  }
};

export function useProgressiveLoader() {
  const { isOnline, isFastConnection, isGoodConnection, checkConnectivity } = useOnlineStatus();
  const [loadedComponents, setLoadedComponents] = useState(new Set());
  const [loadingStates, setLoadingStates] = useState(new Map());
  const [premiumFeatures, setPremiumFeatures] = useState(new Map());

  // Función para cargar un componente premium condicionalmente
  const loadPremiumComponent = useCallback(async (componentName) => {
    // Si ya está cargado, retornar
    if (loadedComponents.has(componentName)) {
      return premiumFeatures.get(componentName);
    }

    // Si no hay buena conexión, no cargar
    if (!isGoodConnection) {
      logger.log(`⏳ ${componentName} no cargado - conexión insuficiente`);
      return null;
    }

    try {
      setLoadingStates(prev => new Map(prev.set(componentName, 'loading')));

      const componentLoader = PREMIUM_COMPONENTS[componentName];
      if (!componentLoader) {
        throw new Error(`Componente ${componentName} no encontrado`);
      }

      const module = await componentLoader();
      const Component = module.default;

      // Crear componente lazy
      const LazyComponent = lazy(() =>
        Promise.resolve({
          default: (props) => (
            <Suspense fallback={<div>Cargando funcionalidad premium...</div>}>
              <Component {...props} />
            </Suspense>
          )
        })
      );

      setLoadedComponents(prev => new Set([...prev, componentName]));
      setPremiumFeatures(prev => new Map(prev.set(componentName, LazyComponent)));
      setLoadingStates(prev => new Map(prev.set(componentName, 'loaded')));

      logger.log(`✅ ${componentName} cargado exitosamente`);
      return LazyComponent;

    } catch (error) {
      console.warn(`❌ Error cargando ${componentName}:`, error);
      setLoadingStates(prev => new Map(prev.set(componentName, 'error')));
      return null;
    }
  }, [isGoodConnection, loadedComponents, premiumFeatures]);

  // Función para obtener un componente premium (o null si no está disponible)
  const getPremiumComponent = useCallback((componentName) => {
    return premiumFeatures.get(componentName) || null;
  }, [premiumFeatures]);

  // Función para verificar si un componente está disponible
  const isComponentAvailable = useCallback((componentName) => {
    return loadedComponents.has(componentName);
  }, [loadedComponents]);

  // Función para precargar componentes importantes cuando hay buena conexión
  const preloadCriticalComponents = useCallback(async () => {
    if (!isFastConnection) return;

    const criticalComponents = ['enhancedOCR', 'cloudSync'];

    for (const componentName of criticalComponents) {
      if (!loadedComponents.has(componentName)) {
        await loadPremiumComponent(componentName);
      }
    }
  }, [isFastConnection, loadedComponents, loadPremiumComponent]);

  // Efecto para precargar componentes cuando la conexión mejora
  useEffect(() => {
    if (isGoodConnection && loadedComponents.size === 0) {
      // Pequeño delay para no interferir con la carga inicial
      const timer = setTimeout(preloadCriticalComponents, 2000);
      return () => clearTimeout(timer);
    }
  }, [isGoodConnection, loadedComponents.size, preloadCriticalComponents]);

  // Función para forzar recarga de conectividad y componentes
  const refreshConnectivity = useCallback(async () => {
    const isReallyOnline = await checkConnectivity();
    if (isReallyOnline && isGoodConnection) {
      // Si hay buena conexión, intentar cargar componentes que fallaron
      for (const [componentName, state] of loadingStates) {
        if (state === 'error') {
          await loadPremiumComponent(componentName);
        }
      }
    }
  }, [checkConnectivity, isGoodConnection, loadingStates, loadPremiumComponent]);

  return {
    // Estado de conectividad
    isOnline,
    isFastConnection,
    isGoodConnection,
    connectionQuality: isFastConnection ? 'fast' : isGoodConnection ? 'good' : 'limited',

    // Gestión de componentes
    loadPremiumComponent,
    getPremiumComponent,
    isComponentAvailable,

    // Estados de carga
    loadingStates,
    loadedComponents: Array.from(loadedComponents),

    // Utilidades
    refreshConnectivity,
    canUsePremiumFeatures: isGoodConnection,
    premiumFeatureCount: loadedComponents.size
  };
}

// Hook específico para componentes que tienen versión premium y básica
export function useAdaptiveComponent(basicComponent, premiumComponentName) {
  const { getPremiumComponent, isComponentAvailable, loadPremiumComponent, canUsePremiumFeatures } = useProgressiveLoader();
  const [isLoadingPremium, setIsLoadingPremium] = useState(false);

  const AdaptiveComponent = useCallback((props) => {
    const PremiumComponent = getPremiumComponent(premiumComponentName);

    // Si hay componente premium disponible, usarlo
    if (PremiumComponent) {
      return <PremiumComponent {...props} />;
    }

    // Si no está disponible pero podemos cargarlo, intentar cargarlo
    if (canUsePremiumFeatures && !isComponentAvailable(premiumComponentName) && !isLoadingPremium) {
      setIsLoadingPremium(true);
      loadPremiumComponent(premiumComponentName).finally(() => {
        setIsLoadingPremium(false);
      });
    }

    // Usar componente básico mientras tanto
    return basicComponent(props);
  }, [getPremiumComponent, premiumComponentName, basicComponent, canUsePremiumFeatures, isComponentAvailable, loadPremiumComponent, isLoadingPremium]);

  return {
    AdaptiveComponent,
    hasPremium: isComponentAvailable(premiumComponentName),
    isLoadingPremium,
    canUpgrade: canUsePremiumFeatures && !isComponentAvailable(premiumComponentName)
  };
}
