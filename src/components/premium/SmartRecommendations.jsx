import React, { useState, useEffect } from 'react';
import { LightBulbIcon, ChartBarIcon, UsersIcon, ArrowUpIcon } from '@heroicons/react/24/outline';

/**
 * Recomendaciones Inteligentes
 * Componente premium que analiza datos de usuario y comunidad
 * para dar recomendaciones personalizadas de mejora
 */
const SmartRecommendations = ({ userProfile, readingStats }) => {
  const [recommendations, setRecommendations] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(true);

  useEffect(() => {
    // Simular análisis de datos (en producción vendría de API)
    const analyzeAndRecommend = async () => {
      setIsAnalyzing(true);

      // Simular delay de procesamiento en la nube
      await new Promise(resolve => setTimeout(resolve, 2000));

      const userRecommendations = [];

      // Análisis basado en velocidad de lectura
      const avgWpm = readingStats?.averageWpm || 180;
      if (avgWpm < 200) {
        userRecommendations.push({
          id: 'speed_improvement',
          type: 'technique',
          priority: 'high',
          title: 'Mejora tu velocidad de lectura',
          description: `Tu velocidad actual (${avgWpm} PPM) está por debajo del promedio. Recomendamos practicar con textos más sencillos antes de aumentar la complejidad.`,
          action: 'Practica 15 minutos diarios con textos de nivel principiante',
          icon: ArrowUpIcon,
          color: 'bg-blue-500',
          impact: 'high'
        });
      }

      // Análisis basado en precisión/comprensión
      const avgComprehension = readingStats?.averageComprehension || 85;
      if (avgComprehension < 80) {
        userRecommendations.push({
          id: 'comprehension_focus',
          type: 'study_plan',
          priority: 'high',
          title: 'Enfócate en la comprensión lectora',
          description: 'Tu comprensión está en el 85%. Recomendamos técnicas de re-lectura y resumen para mejorar la retención.',
          action: 'Implementa la técnica de "preguntas antes de leer" en tus sesiones',
          icon: LightBulbIcon,
          color: 'bg-green-500',
          impact: 'high'
        });
      }

      // Recomendaciones basadas en edad y nivel
      if (userProfile.age < 13) {
        userRecommendations.push({
          id: 'age_appropriate_content',
          type: 'content',
          priority: 'medium',
          title: 'Contenido adaptado a tu edad',
          description: 'Recomendamos textos de aventuras y ciencia para mantenerte motivado.',
          action: 'Explora la biblioteca de "Aventuras Científicas" en la sección premium',
          icon: UsersIcon,
          color: 'bg-purple-500',
          impact: 'medium'
        });
      }

      // Recomendación de comunidad
      userRecommendations.push({
        id: 'community_benchmark',
        type: 'social',
        priority: 'low',
        title: 'Compara tu progreso',
        description: 'Eres el 15º percentil en tu grupo de edad. ¡Sigue practicando para alcanzar el top 10%!',
        action: 'Únete a grupos de estudio semanales para compartir técnicas',
        icon: ChartBarIcon,
        color: 'bg-orange-500',
        impact: 'low'
      });

      // Recomendación personalizada basada en patrones
      if (readingStats?.sessionsCompleted > 10) {
        userRecommendations.push({
          id: 'advanced_techniques',
          type: 'technique',
          priority: 'medium',
          title: 'Domina técnicas avanzadas',
          description: 'Has completado más de 10 sesiones. Es hora de probar técnicas avanzadas como Meta-guide.',
          action: 'Desbloquea el módulo "Lectura Fotográfica" en tu plan premium',
          icon: ArrowUpIcon,
          color: 'bg-red-500',
          impact: 'medium'
        });
      }

      setRecommendations(userRecommendations);
      setIsAnalyzing(false);
    };

    analyzeAndRecommend();
  }, [userProfile, readingStats]);

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'border-red-300 bg-red-50';
      case 'medium': return 'border-yellow-300 bg-yellow-50';
      case 'low': return 'border-green-300 bg-green-50';
      default: return 'border-gray-300 bg-gray-50';
    }
  };

  const getImpactBadge = (impact) => {
    const colors = {
      high: 'bg-red-100 text-red-800',
      medium: 'bg-yellow-100 text-yellow-800',
      low: 'bg-green-100 text-green-800'
    };
    return (
      <span className={`px-2 py-1 text-xs rounded-full font-semibold ${colors[impact]}`}>
        {impact === 'high' ? 'Alto' : impact === 'medium' ? 'Medio' : 'Bajo'} Impacto
      </span>
    );
  };

  if (isAnalyzing) {
    return (
      <div className="bg-gradient-to-br from-indigo-50 to-purple-100 p-6 rounded-xl border-2 border-indigo-200">
        <div className="text-center py-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-lg font-semibold text-gray-700">
              Analizando tu progreso...
            </span>
          </div>
          <p className="text-gray-600">
            Usando IA para generar recomendaciones personalizadas basadas en datos de la comunidad
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-purple-100 p-6 rounded-xl border-2 border-indigo-200">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-indigo-500 rounded-lg">
          <LightBulbIcon className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-800">Recomendaciones Inteligentes</h3>
          <p className="text-sm text-gray-600">Análisis personalizado con IA</p>
        </div>
      </div>

      <div className="space-y-4">
        {recommendations.map((rec, _index) => {
          const IconComponent = rec.icon;
          return (
            <div
              key={rec.id}
              className={`p-4 rounded-lg border-2 transition-all hover:shadow-md ${getPriorityColor(rec.priority)}`}
            >
              <div className="flex items-start gap-4">
                <div className={`p-2 rounded-lg ${rec.color}`}>
                  <IconComponent className="w-5 h-5 text-white" />
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-gray-800">{rec.title}</h4>
                    {getImpactBadge(rec.impact)}
                  </div>

                  <p className="text-gray-700 text-sm mb-3">{rec.description}</p>

                  <div className="bg-white/50 p-3 rounded-lg">
                    <p className="text-sm font-medium text-gray-800 mb-1">💡 Acción recomendada:</p>
                    <p className="text-sm text-gray-700">{rec.action}</p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 p-4 bg-indigo-600 text-white rounded-lg">
        <h4 className="font-semibold mb-2">🎯 Próximos pasos recomendados:</h4>
        <ol className="text-sm space-y-1">
          <li>1. Completa 3 sesiones más esta semana</li>
          <li>2. Prueba la técnica de "chunking" en tus próximas lecturas</li>
          <li>3. Únete a un grupo de estudio para compartir experiencias</li>
        </ol>
      </div>
    </div>
  );
};

export default SmartRecommendations;
