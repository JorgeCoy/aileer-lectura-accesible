import React, { useState } from 'react';
import { SparklesIcon, CloudIcon, CpuChipIcon, ChartBarIcon, UsersIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { useProgressiveLoader } from '../hooks/useProgressiveLoader.jsx';

const PremiumFeaturesPanel = ({ userProfile: _userProfile, onFeatureActivated }) => {
  const {
    canUsePremiumFeatures,
    loadPremiumComponent,
    isComponentAvailable,
    loadingStates,
    refreshConnectivity
  } = useProgressiveLoader();

  const [showDetails, setShowDetails] = useState(false);

  const premiumFeatures = [
    {
      id: 'enhancedOCR',
      name: 'OCR con IA Avanzada',
      description: 'Procesamiento de imágenes con inteligencia artificial en la nube para mayor precisión',
      icon: CpuChipIcon,
      benefits: ['98% precisión', 'Corrección automática', 'Análisis de estructura', 'Múltiples idiomas'],
      color: 'from-blue-500 to-indigo-600',
      impact: 'Alto'
    },
    {
      id: 'smartRecommendations',
      name: 'Recomendaciones Inteligentes',
      description: 'Análisis personalizado basado en tu progreso y datos de la comunidad',
      icon: SparklesIcon,
      benefits: ['Análisis IA', 'Recomendaciones personalizadas', 'Benchmarks comunitarios', 'Planes adaptativos'],
      color: 'from-purple-500 to-pink-600',
      impact: 'Alto'
    },
    {
      id: 'textAnalysis',
      name: 'Análisis de Texto Avanzado',
      description: 'Análisis inteligente de complejidad, vocabulario y recomendaciones automáticas',
      icon: ChartBarIcon,
      benefits: ['Análisis de complejidad', 'Detección de vocabulario', 'Técnicas sugeridas', 'Tiempo estimado'],
      color: 'from-green-500 to-teal-600',
      impact: 'Alto'
    }
  ];

  const handleActivateFeature = async (featureId) => {
    try {
      const component = await loadPremiumComponent(featureId);
      if (component && onFeatureActivated) {
        onFeatureActivated(featureId, component);
      }
    } catch (error) {
      console.error(`Error activando ${featureId}:`, error);
    }
  };

  if (!canUsePremiumFeatures) {
    return (
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-xl border-2 border-gray-200">
        <div className="text-center py-6">
          <CloudIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-gray-800 mb-2">
            Funcionalidades Premium
          </h3>
          <p className="text-gray-600 mb-4">
            Conecta a internet para desbloquear funciones avanzadas con IA
          </p>
          <button
            onClick={refreshConnectivity}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
          >
            <ArrowPathIcon className="w-4 h-4" />
            Verificar conexión
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-purple-100 p-6 rounded-xl border-2 border-indigo-200">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-500 rounded-lg">
            <SparklesIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-800">
              Funcionalidades Premium
            </h3>
            <p className="text-sm text-gray-600">
              Potenciadas con IA en la nube
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowDetails(!showDetails)}
          className="px-3 py-1 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 rounded-full text-sm transition-colors"
        >
          {showDetails ? 'Ocultar' : 'Ver detalles'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {premiumFeatures.map((feature) => {
          const IconComponent = feature.icon;
          const isAvailable = isComponentAvailable(feature.id);
          const isLoading = loadingStates.get(feature.id) === 'loading';

          return (
            <div
              key={feature.id}
              className={`bg-white rounded-lg p-4 border-2 transition-all ${
                isAvailable
                  ? 'border-green-300 bg-green-50'
                  : 'border-gray-200 hover:border-indigo-300 hover:shadow-md'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg bg-gradient-to-r ${feature.color}`}>
                  <IconComponent className="w-5 h-5 text-white" />
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-gray-800">{feature.name}</h4>
                    <span className={`px-2 py-1 text-xs rounded-full font-semibold ${
                      feature.impact === 'Alto'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {feature.impact}
                    </span>
                  </div>

                  <p className="text-sm text-gray-600 mb-3">{feature.description}</p>

                  {showDetails && (
                    <div className="mb-3">
                      <h5 className="text-xs font-semibold text-gray-700 mb-1">Beneficios:</h5>
                      <div className="flex flex-wrap gap-1">
                        {feature.benefits.map((benefit, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                          >
                            {benefit}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    {isAvailable ? (
                      <span className="text-green-600 text-sm font-semibold flex items-center gap-1">
                        ✅ Activado
                      </span>
                    ) : (
                      <button
                        onClick={() => handleActivateFeature(feature.id)}
                        disabled={isLoading}
                        className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white text-sm rounded-lg transition-colors flex items-center gap-1"
                      >
                        {isLoading ? (
                          <>
                            <ArrowPathIcon className="w-3 h-3 animate-spin" />
                            Cargando...
                          </>
                        ) : (
                          <>
                            <CloudIcon className="w-3 h-3" />
                            Activar
                          </>
                        )}
                      </button>
                    )}

                    {isAvailable && (
                      <span className="text-xs text-green-600 font-medium">
                        ¡Disponible ahora!
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 p-4 bg-indigo-600 text-white rounded-lg">
        <h4 className="font-semibold mb-2">🎯 ¿Cómo funciona el Progressive Enhancement?</h4>
        <div className="text-sm space-y-1">
          <p>• <strong>Offline:</strong> Funcionalidad completa básica</p>
          <p>• <strong>Conexión lenta:</strong> Funciones esenciales + algunas mejoras</p>
          <p>• <strong>Conexión rápida:</strong> Todas las funcionalidades premium con IA</p>
          <p>• <strong>Transición seamless:</strong> Sin interrupciones para el usuario</p>
        </div>
      </div>
    </div>
  );
};

export default PremiumFeaturesPanel;
