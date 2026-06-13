// src/services/aiService.js

let workerInstance = null;
const pendingRequests = new Map();
let requestIdCounter = 0;
let progressCallback = null;

// Inicializar la instancia única del worker
function getWorker() {
  if (!workerInstance && typeof window !== 'undefined') {
    workerInstance = new Worker(
      new URL('../workers/ai.worker.js', import.meta.url),
      { type: 'module' }
    );

    workerInstance.onmessage = (e) => {
      const { id, type, data, result, error } = e.data;

      // Si es un evento de progreso de descarga del modelo, notificar al callback global
      if (type === 'progress') {
        if (progressCallback) {
          progressCallback(data);
        }
        return;
      }

      // Resolver o rechazar la promesa según corresponda
      const request = pendingRequests.get(id);
      if (request) {
        if (type === 'success' || type === 'ready') {
          request.resolve(result);
        } else if (type === 'error') {
          request.reject(new Error(error || 'Error desconocido en el Worker de IA'));
        }
        pendingRequests.delete(id);
      }
    };
  }
  return workerInstance;
}

// Helper para enviar mensajes al worker y retornar una promesa
function sendToWorker(type, text, model, options = {}) {
  return new Promise((resolve, reject) => {
    const worker = getWorker();
    if (!worker) {
      reject(new Error('No se pudo inicializar el Worker de IA (Entorno no compatible)'));
      return;
    }

    const id = ++requestIdCounter;
    pendingRequests.set(id, { resolve, reject });
    worker.postMessage({ id, type, text, model, options });
  });
}

// Registrar un callback para actualizaciones de progreso de descarga del modelo
export function onModelProgress(callback) {
  progressCallback = callback;
}

// Método para precargar/inicializar un modelo
export async function preload(model = 'Xenova/LaMini-Flan-T5-77M', task = 'text2text-generation') {
  return await sendToWorker('load', '', model, { task });
}

// Método para resumir texto
export async function summarizeText(text, options = {}) {
  const model = options.model || 'Xenova/LaMini-Flan-T5-77M';
  return await sendToWorker('summarize', text, model, options);
}

// Método para generar preguntas de comprensión
export async function generateQuestions(text, multipleChoiceCount = 3, openEndedCount = 1, options = {}) {
  const cloudApiKey = localStorage.getItem('cloud_api_key');
  
  if (cloudApiKey) {
    try {
      const prompt = `Actúa como un profesor experto. Basado en el siguiente texto, genera un cuestionario de comprensión lectora.
Necesito EXACTAMENTE:
- ${multipleChoiceCount} preguntas de opción múltiple (cada una con 3 opciones y la respuesta correcta).
- ${openEndedCount} preguntas abiertas.

Responde ÚNICAMENTE con un arreglo (array) JSON válido con la siguiente estructura, sin formato Markdown ni texto adicional:
[
  { "type": "multiple_choice", "question": "...", "options": ["...", "...", "..."], "correctAnswer": 0 },
  { "type": "open_ended", "question": "..." }
]

Texto:
${text}`;

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${cloudApiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.origin,
          'X-Title': 'aLeer'
        },
        body: JSON.stringify({
          model: 'openrouter/free',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.5,
        })
      });

      if (response.ok) {
        const data = await response.json();
        const content = data.choices?.[0]?.message?.content || '';
        try {
          // Intentar parsear el JSON extraído
          const jsonMatch = content.match(/\[\s*\{.*\}\s*\]/s);
          const rawJson = jsonMatch ? jsonMatch[0] : content;
          const parsed = JSON.parse(rawJson);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
          }
        } catch (e) {
          console.error("Error parseando JSON de OpenRouter:", e, content);
          throw new Error("El formato de respuesta de la IA en la nube fue incorrecto.");
        }
      } else {
        const errorText = await response.text();
        console.error("Error de OpenRouter:", response.status, errorText);
        throw new Error(`Error de OpenRouter (${response.status}): ${errorText}`);
      }
    } catch (error) {
      console.warn("Cloud API falló:", error);
      // Opcional: Podríamos re-lanzar el error para que la UI sepa, 
      // pero por ahora dejaremos que intente el fallback local (que devolverá plantillas limpias)
      throw error; // Lanzar el error para que no haga fallback local si hay API Key configurada
    }
  }

  // Fallback: usar IA local
  const model = options.model || 'Xenova/LaMini-Flan-T5-77M';
  return await sendToWorker('generateQuestions', text, model, { multipleChoiceCount, openEndedCount, ...options });
}

// Método para generar lecturas por tema y nivel
export async function generateTextByTopic(topic, level, wordsCount = 150, options = {}) {
  // Verificar si hay una API Key en la nube guardada (OpenRouter/DeepSeek)
  const cloudApiKey = localStorage.getItem('cloud_api_key');
  
  if (cloudApiKey) {
    try {
      const genre = options.genre || 'texto educativo';
      const language = options.language || 'español';
      let paragraphRule = "Divide el texto en párrafos de máximo 3 o 4 oraciones cada uno";
      const lvl = level.toLowerCase();
      if (lvl.includes('básico') || lvl.includes('a1') || lvl.includes('a2') || lvl.includes('inicial')) {
        paragraphRule = "Divide el texto en párrafos muy cortos de máximo 1 o 2 oraciones cada uno";
      } else if (lvl.includes('avanzado') || lvl.includes('c1') || lvl.includes('b2')) {
        paragraphRule = "Divide el texto en párrafos más largos de 5 a 6 oraciones cada uno";
      }

      const prompt = `Escribe un ${genre} sobre el tema "${topic}" en ${language}. El texto debe estar adaptado para un nivel de lectura ${level} (niños/estudiantes) y tener aproximadamente ${wordsCount} palabras. Importante: ${paragraphRule}, y separa cada párrafo con un salto de línea doble. Responde ÚNICAMENTE con el contenido solicitado, sin saludos, introducciones ni explicaciones adicionales.`;

      // Hacer petición a OpenRouter (compatible con formato OpenAI)
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${cloudApiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.origin, // Requerido por OpenRouter
          'X-Title': 'aLeer' // Requerido por OpenRouter
        },
        body: JSON.stringify({
          model: 'openrouter/free', // Comodín dinámico que usa el mejor modelo gratuito disponible
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.7,
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `Error HTTP: ${response.status}`);
      }

      const data = await response.json();
      const generatedContent = data.choices?.[0]?.message?.content;
      
      if (!generatedContent) throw new Error('Respuesta vacía de la API en la nube');
      
      return generatedContent.trim();
    } catch (error) {
      console.error('Error usando IA en la Nube:', error);
      throw new Error(`Error de IA Avanzada: ${error.message}. Verifica tu API Key.`);
    }
  }

  // Fallback: usar IA local si no hay API Key
  const model = options.model || 'Xenova/LaMini-Flan-T5-77M';
  return await sendToWorker('generateTextByTopic', '', model, {
    topic,
    level,
    wordsCount,
    ...options
  });
}

// Método para obtener segmentación semántica mediante embeddings
export async function getSemanticChunks(text) {
  // Siempre usa Xenova/all-MiniLM-L6-v2 para embeddings
  return await sendToWorker('semanticChunks', text, 'Xenova/all-MiniLM-L6-v2');
}

// Apagar el worker si es necesario (ej. testing o liberar memoria)
export function terminateWorker() {
  if (workerInstance) {
    workerInstance.terminate();
    workerInstance = null;
    pendingRequests.clear();
  }
}
