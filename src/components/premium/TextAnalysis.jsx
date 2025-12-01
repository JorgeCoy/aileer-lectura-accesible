import React, { useState, useEffect } from 'react';
import { DocumentTextIcon, BeakerIcon, ChartBarIcon, LightBulbIcon } from '@heroicons/react/24/outline';

/**
 * Análisis de Texto Inteligente
 * Componente premium que analiza el texto actual y proporciona
 * insights sobre complejidad, vocabulario, y recomendaciones
 */
const TextAnalysis = ({ currentText, userProfile }) => {
  const [analysis, setAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    if (!currentText || currentText.trim().length < 50) {
      setAnalysis(null);
      return;
    }

    const analyzeText = async () => {
      setIsAnalyzing(true);

      // Simular análisis con IA (en producción sería una API call)
      await new Promise(resolve => setTimeout(resolve, 1500));

      const words = currentText.split(/\s+/);
      const sentences = currentText.split(/[.!?]+/).filter(s => s.trim().length > 0);
      const avgWordsPerSentence = words.length / sentences.length;

      // Análisis de complejidad
      let complexity = 'Básico';
      let complexityScore = 0;

      if (avgWordsPerSentence > 20) {
        complexity = 'Avanzado';
        complexityScore = 3;
      } else if (avgWordsPerSentence > 15) {
        complexity = 'Intermedio';
        complexityScore = 2;
      } else if (avgWordsPerSentence > 10) {
        complexity = 'Intermedio-Básico';
        complexityScore = 1;
      }

      // Análisis de vocabulario
      const uniqueWords = new Set(words.map(w => w.toLowerCase().replace(/[^a-záéíóúñ]/g, '')));
      const vocabularyLevel = uniqueWords.size > 1000 ? 'Avanzado' :
                             uniqueWords.size > 500 ? 'Intermedio' : 'Básico';

      // Recomendaciones basadas en perfil del usuario
      const recommendations = [];

      if (userProfile.age < 12 && complexityScore > 1) {
        recommendations.push({
          type: 'difficulty',
          message: 'Este texto parece un poco difícil para tu edad. ¿Quieres que te ayude a encontrar uno más apropiado?',
          action: 'Buscar texto más fácil'
        });
      }

      if (avgWordsPerSentence > 25) {
        recommendations.push({
          type: 'structure',
          message: 'Las oraciones son muy largas. Te recomiendo practicar con textos que tengan oraciones más cortas primero.',
          action: 'Practicar con oraciones simples'
        });
      }

      if (vocabularyLevel === 'Avanzado' && userProfile.currentLevel === 'beginner') {
        recommendations.push({
          type: 'vocabulary',
          message: 'Este texto tiene vocabulario avanzado. Considera usar el diccionario integrado.',
          action: 'Activar modo diccionario'
        });
      }

      // Sugerencias de técnicas de lectura
      const techniqueSuggestions = [];
      if (complexityScore <= 1) {
        techniqueSuggestions.push('RSVP (Una palabra)', 'Lectura en voz alta');
      } else if (complexityScore === 2) {
        techniqueSuggestions.push('Biónica', 'Chunking', 'Línea por puntos');
      } else {
        techniqueSuggestions.push('Spritz', 'Lectura fotográfica', 'Previewing');
      }

      setAnalysis({
        wordCount: words.length,
        sentenceCount: sentences.length,
        avgWordsPerSentence: Math.round(avgWordsPerSentence * 10) / 10,
        complexity,
        complexityScore,
        vocabularyLevel,
        uniqueWords: uniqueWords.size,
        recommendations,
        techniqueSuggestions,
        estimatedReadingTime: Math.ceil(words.length / (userProfile.age > 12 ? 250 : 150)), // minutos
        comprehensionDifficulty: complexityScore > 2 ? 'Alta' : complexityScore > 1 ? 'Media' : 'Baja'
      });

      setIsAnalyzing(false);
    };

    analyzeText();
  }, [currentText, userProfile]);

  if (!currentText || currentText.trim().length < 50) {
    return (
      <div className="bg-gradient-to-br from-blue-50 to-cyan-100 p-6 rounded-xl border-2 border-blue-200">
        <div className="text-center py-6">
          <DocumentTextIcon className="w-12 h-12 text-blue-500 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-gray-800 mb-2">
            Análisis de Texto Inteligente
          </h3>
          <p className="text-gray-600">
            Escribe o carga un texto más largo para obtener análisis inteligente
          </p>
        </div>
      </div>
    );
  }

  if (isAnalyzing) {
    return (
      <div className="bg-gradient-to-br from-blue-50 to-cyan-100 p-6 rounded-xl border-2 border-blue-200">
        <div className="text-center py-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <BeakerIcon className="w-8 h-8 text-blue-500 animate-pulse" />
            <span className="text-lg font-semibold text-gray-700">
              Analizando texto con IA...
            </span>
          </div>
          <p className="text-gray-600">
            Procesando estructura, vocabulario y complejidad
          </p>
        </div>
      </div>
    );
  }

  if (!analysis) return null;

  return (
    <div className="bg-gradient-to-br from-blue-50 to-cyan-100 p-6 rounded-xl border-2 border-blue-200">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-blue-500 rounded-lg">
          <DocumentTextIcon className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-800">Análisis Inteligente del Texto</h3>
          <p className="text-sm text-gray-600">Procesado con IA avanzada</p>
        </div>
      </div>

      {/* Estadísticas principales */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-3 rounded-lg text-center">
          <div className="text-2xl font-bold text-blue-600">{analysis.wordCount}</div>
          <div className="text-xs text-gray-600">Palabras</div>
        </div>
        <div className="bg-white p-3 rounded-lg text-center">
          <div className="text-2xl font-bold text-green-600">{analysis.avgWordsPerSentence}</div>
          <div className="text-xs text-gray-600">Palabras/oración</div>
        </div>
        <div className="bg-white p-3 rounded-lg text-center">
          <div className="text-2xl font-bold text-purple-600">{analysis.estimatedReadingTime}min</div>
          <div className="text-xs text-gray-600">Tiempo estimado</div>
        </div>
        <div className="bg-white p-3 rounded-lg text-center">
          <div className={`text-2xl font-bold ${
            analysis.complexity === 'Básico' ? 'text-green-600' :
            analysis.complexity === 'Intermedio' ? 'text-yellow-600' : 'text-red-600'
          }`}>
            {analysis.complexityScore}/3
          </div>
          <div className="text-xs text-gray-600">Complejidad</div>
        </div>
      </div>

      {/* Nivel de complejidad */}
      <div className="bg-white p-4 rounded-lg mb-6">
        <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
          <ChartBarIcon className="w-5 h-5 text-blue-500" />
          Nivel de Complejidad
        </h4>
        <div className="flex items-center gap-4">
          <span className="font-medium text-gray-700">{analysis.complexity}</span>
          <span className="text-sm text-gray-600">
            Vocabulario: {analysis.vocabularyLevel} • Comprensión: {analysis.comprehensionDifficulty}
          </span>
        </div>
        <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-500 ${
              analysis.complexityScore === 1 ? 'bg-green-500 w-1/3' :
              analysis.complexityScore === 2 ? 'bg-yellow-500 w-2/3' : 'bg-red-500 w-full'
            }`}
          />
        </div>
      </div>

      {/* Recomendaciones */}
      {analysis.recommendations.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg mb-6">
          <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <LightBulbIcon className="w-5 h-5 text-yellow-600" />
            Recomendaciones Personalizadas
          </h4>
          <div className="space-y-3">
            {analysis.recommendations.map((rec, index) => (
              <div key={index} className="bg-white p-3 rounded-lg">
                <p className="text-sm text-gray-700 mb-2">{rec.message}</p>
                <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                  {rec.action} →
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Técnicas sugeridas */}
      <div className="bg-indigo-50 border border-indigo-200 p-4 rounded-lg">
        <h4 className="font-semibold text-gray-800 mb-3">🎯 Técnicas Recomendadas</h4>
        <div className="flex flex-wrap gap-2">
          {analysis.techniqueSuggestions.map((technique, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-indigo-100 text-indigo-800 text-sm rounded-full"
            >
              {technique}
            </span>
          ))}
        </div>
        <p className="text-xs text-gray-600 mt-2">
          Estas técnicas están optimizadas para tu nivel y el texto actual
        </p>
      </div>
    </div>
  );
};

export default TextAnalysis;

