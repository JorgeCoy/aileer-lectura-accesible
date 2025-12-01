import React, { Suspense, lazy } from 'react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

// Componentes que se cargan solo con buena conexión
const SocialFeatures = lazy(() => import('./enhanced/SocialFeatures.jsx'));
const AdvancedAnalytics = lazy(() => import('./enhanced/AdvancedAnalytics.jsx'));
const CloudBackup = lazy(() => import('./enhanced/CloudBackup.jsx'));

// Fallback mientras carga
const LoadingFallback = ({ feature }) => (
  <div className="animate-pulse bg-gray-200 rounded h-4 w-20">
    <span className="text-xs text-gray-500">Cargando {feature}...</span>
  </div>
);

const EnhancedFeaturesLoader = () => {
  const { isOnline, isFastConnection, connectionQuality } = useOnlineStatus();

  // No renderizar nada si no hay conectividad
  if (!isOnline) return null;

  return (
    <div className="hidden">
      {/* Estas funcionalidades se cargan en background y no afectan la UI */}
      <Suspense fallback={<LoadingFallback feature="social" />}>
        {isFastConnection && <SocialFeatures />}
      </Suspense>

      <Suspense fallback={<LoadingFallback feature="analytics" />}>
        {connectionQuality === 'fast' && <AdvancedAnalytics />}
      </Suspense>

      <Suspense fallback={<LoadingFallback feature="backup" />}>
        <CloudBackup />
      </Suspense>
    </div>
  );
};

export default EnhancedFeaturesLoader;
