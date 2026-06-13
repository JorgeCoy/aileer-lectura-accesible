import { env, pipeline } from '@huggingface/transformers';

// Configurar CDN global
env.allowLocalModels = false;

// Almacén de pipelines activos (Singletons por modelo/tarea)
const activePipelines = {};

// Obtener o crear un pipeline asíncronamente
async function getPipeline(task, model, progressCallback) {
  const cacheKey = `${task}_${model}`;
  if (activePipelines[cacheKey]) {
    return activePipelines[cacheKey];
  }

  // Determinar opciones por defecto
  const options = {
    progress_callback: (data) => {
      if (progressCallback) {
        progressCallback(data);
      }
    }
  };

  // Intentar usar WebGPU si está disponible
  try {
    activePipelines[cacheKey] = await pipeline(task, model, {
      ...options,
      device: 'webgpu',
    });
    console.log(`[AI Worker] Pipeline '${cacheKey}' inicializado con WebGPU`);
  } catch (error) {
    console.warn(`[AI Worker] WebGPU falló, reintentando con CPU (Wasm):`, error.message);
    activePipelines[cacheKey] = await pipeline(task, model, {
      ...options,
      device: 'wasm',
    });
    console.log(`[AI Worker] Pipeline '${cacheKey}' inicializado con Wasm (CPU)`);
  }

  return activePipelines[cacheKey];
}

// Escuchar mensajes del hilo principal
self.onmessage = async (e) => {
  const { id, type, text, model = 'Xenova/LaMini-Flan-T5-77M', options = {} } = e.data;

  try {
    if (type === 'load') {
      // Pre-cargar modelo
      const task = options.task || 'text2text-generation';
      await getPipeline(task, model, (progressData) => {
        self.postMessage({ id, type: 'progress', data: progressData });
      });
      self.postMessage({ id, type: 'ready', model, task });
    }

    else if (type === 'summarize') {
      const task = 'text2text-generation';
      const pipe = await getPipeline(task, model, (progressData) => {
        self.postMessage({ id, type: 'progress', data: progressData });
      });

      const maxLength = options.maxLength || 100;
      const minLength = options.minLength || 30;

      const prompt = `Summarize the following text in Spanish: ${text}`;
      const result = await pipe(prompt, {
        max_new_tokens: maxLength,
        min_new_tokens: minLength,
        temperature: 0.7,
      });

      const summary = result[0]?.generated_text || '';
      self.postMessage({ id, type: 'success', result: summary });
    }

    else if (type === 'generateQuestions') {
      const task = 'text2text-generation';
      const pipe = await getPipeline(task, model, (progressData) => {
        self.postMessage({ id, type: 'progress', data: progressData });
      });

      const multipleChoiceCount = options.multipleChoiceCount || 0;
      const openEndedCount = options.openEndedCount || 0;
      
      const totalQuestions = multipleChoiceCount + openEndedCount;
      if (totalQuestions === 0) {
        self.postMessage({ id, type: 'success', result: [] });
        return;
      }

      const prompt = `Based on the following text, write exactly ${multipleChoiceCount} multiple choice reading comprehension questions in Spanish (with 3 options A, B, C and correct answer), and exactly ${openEndedCount} open-ended questions in Spanish. Prefix multiple choice questions with "Selección Múltiple:" and open-ended with "Abierta:".
Text: ${text}
Questions:`;

      const result = await pipe(prompt, {
        max_new_tokens: 400,
        temperature: 0.6,
      });

      const rawOutput = result[0]?.generated_text || '';
      // Procesar la salida en un array estructurado
      const questions = parseQuestions(rawOutput, multipleChoiceCount, openEndedCount);

      self.postMessage({ id, type: 'success', result: questions });
    }

    else if (type === 'generateTextByTopic') {
      const task = 'text2text-generation';
      const pipe = await getPipeline(task, model, (progressData) => {
        self.postMessage({ id, type: 'progress', data: progressData });
      });

      const { topic, level, wordsCount = 150, language = 'Español', genre = 'Texto Informativo' } = options;
      
      // LaMini es muy sensible al idioma del prompt.
      // Escribir la instrucción en inglés forzando el idioma destino mejora mucho el resultado.
      const langMap = {
        'Español': 'Spanish',
        'Inglés': 'English',
        'Francés': 'French'
      };
      const targetLang = langMap[language] || language;
      
      const genreMap = {
        'Texto Informativo': 'an informative educational article',
        'Cuento Corto': 'a short story',
        'Diálogo': 'a dialogue between two people',
        'Poema': 'a poem'
      };
      const targetGenre = genreMap[genre] || genre;

      let paragraphRule = "Divide the text into short paragraphs of maximum 3 or 4 sentences each";
      const lvl = String(level).toLowerCase();
      if (lvl.includes('básico') || lvl.includes('a1') || lvl.includes('a2') || lvl.includes('inicial') || lvl.includes('basic')) {
        paragraphRule = "Divide the text into very short paragraphs of maximum 1 or 2 sentences each";
      } else if (lvl.includes('avanzado') || lvl.includes('c1') || lvl.includes('b2') || lvl.includes('advanced')) {
        paragraphRule = "Divide the text into longer paragraphs of 5 to 6 sentences each";
      }

      const prompt = `Write ${targetGenre} about "${topic}" in ${targetLang}. It must be suitable for a ${level} reading level and be approximately ${wordsCount} words long. Important: ${paragraphRule}, and separate each paragraph with a double blank line (enter). Provide only the content requested.
Text:`;

      const result = await pipe(prompt, {
        max_new_tokens: wordsCount + 100,
        temperature: 0.7,
        do_sample: true, // Importante para añadir creatividad
      });

      const generatedText = result[0]?.generated_text || '';
      self.postMessage({ id, type: 'success', result: generatedText });
    }

    else if (type === 'semanticChunks') {
      // Usaremos Xenova/all-MiniLM-L6-v2 para embeddings y segmentación semántica
      const embeddingModel = 'Xenova/all-MiniLM-L6-v2';
      const pipe = await getPipeline('feature-extraction', embeddingModel, (progressData) => {
        self.postMessage({ id, type: 'progress', data: progressData });
      });

      // Dividir el texto en oraciones individuales
      const sentences = text
        .split(/(?<=[.?!])\s+/)
        .filter(s => s.trim().length > 0);

      if (sentences.length <= 1) {
        self.postMessage({ id, type: 'success', result: sentences });
        return;
      }

      // Obtener embeddings para todas las oraciones
      const embeddings = [];
      for (const sentence of sentences) {
        const output = await pipe(sentence, { pooling: 'mean', normalize: true });
        embeddings.push(Array.from(output.data));
      }

      // Calcular similitud coseno entre oraciones adyacentes y agrupar semánticamente
      const chunks = [];
      let currentChunk = [sentences[0]];

      for (let i = 1; i < sentences.length; i++) {
        const similarity = cosineSimilarity(embeddings[i - 1], embeddings[i]);
        
        // Si la similitud cae por debajo de un umbral (ej. 0.65), romper el chunk semántico
        if (similarity < 0.65 && currentChunk.join(' ').split(/\s+/).length > 6) {
          chunks.push(currentChunk.join(' '));
          currentChunk = [sentences[i]];
        } else {
          currentChunk.push(sentences[i]);
        }
      }

      if (currentChunk.length > 0) {
        chunks.push(currentChunk.join(' '));
      }

      self.postMessage({ id, type: 'success', result: chunks });
    }
  } catch (error) {
    self.postMessage({ id, type: 'error', error: error.message });
  }
};

// Función para calcular similitud coseno
function cosineSimilarity(vecA, vecB) {
  let dotProduct = 0.0;
  let normA = 0.0;
  let normB = 0.0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  if (normA === 0.0 || normB === 0.0) return 0.0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

// Función helper simple para parsear preguntas en texto a formato estructurado JSON
function parseQuestions(text, expectedMc, expectedOe) {
  const questions = [];
  try {
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    let currentQuestion = null;
    let currentType = 'multiple_choice'; // fallback

    lines.forEach(line => {
      // Intentar detectar si es abierta o múltiple en la línea
      if (/Abierta/i.test(line)) {
          currentType = 'open_ended';
      } else if (/Selección Múltiple|Múltiple/i.test(line)) {
          currentType = 'multiple_choice';
      }

      const isQuestion = /^\d+[\s.)]|^¿|Pregunta/i.test(line) && !/^a[\s.)]|^b[\s.)]|^c[\s.)]/i.test(line);
      const isOptionA = /^a[\s.)]/i.test(line);
      const isOptionB = /^b[\s.)]/i.test(line);
      const isOptionC = /^c[\s.)]/i.test(line);
      const isCorrectAnswer = /Respuesta\s*correcta|Correcta|Respuesta\s*:/i.test(line);

      if (isQuestion) {
        if (currentQuestion) {
          questions.push(currentQuestion);
        }
        currentQuestion = {
          type: currentType,
          question: line.replace(/^\d+[\s.)]|\s*Pregunta\s*\d+:\s*|Selección Múltiple:\s*|Abierta:\s*/i, '').trim(),
          options: [],
          correctAnswer: 'A'
        };
      } else if (currentQuestion && currentQuestion.type === 'multiple_choice') {
        if (isOptionA) {
          currentQuestion.options.push({ key: 'A', text: line.replace(/^a[\s.)]/i, '').trim() });
        } else if (isOptionB) {
          currentQuestion.options.push({ key: 'B', text: line.replace(/^b[\s.)]/i, '').trim() });
        } else if (isOptionC) {
          currentQuestion.options.push({ key: 'C', text: line.replace(/^c[\s.)]/i, '').trim() });
        } else if (isCorrectAnswer) {
          const match = line.match(/\b([A-C])\b/i);
          currentQuestion.correctAnswer = match ? match[1].toUpperCase() : 'A';
        }
      }
    });

    if (currentQuestion) {
      questions.push(currentQuestion);
    }
  } catch (err) {
    console.error('[AI Worker] Error parseando preguntas:', err);
  }

  // Si la IA falló estrepitosamente en generar el formato esperado, descartamos la basura y generamos plantillas limpias
  if (questions.length !== expectedMc + expectedOe) {
      // Limpiar array de preguntas basura
      questions.length = 0;
      let mcCount = 0;
      let oeCount = 0;

      while (mcCount < expectedMc) {
          questions.push({ type: 'multiple_choice', question: '', options: [{text: 'Opción A'}, {text: 'Opción B'}, {text: 'Opción C'}], correctAnswer: 'A' });
          mcCount++;
      }
      while (oeCount < expectedOe) {
          questions.push({ type: 'open_ended', question: '' });
          oeCount++;
      }
  }

  // Fallback para estructurar los arrays correctos (0, 1, 2) y mapear a formato interno
  const finalQuestions = questions.map((q, idx) => {
      const type = q.type || 'multiple_choice';
      if (type === 'multiple_choice') {
          // Asegurar opciones
          const finalOpts = [
              q.options[0]?.text || 'Opción A',
              q.options[1]?.text || 'Opción B',
              q.options[2]?.text || 'Opción C'
          ];
          const mapLetterToIdx = { 'A': 0, 'B': 1, 'C': 2 };
          const cIdx = mapLetterToIdx[q.correctAnswer] !== undefined ? mapLetterToIdx[q.correctAnswer] : 0;
          return { type: 'multiple_choice', question: q.question, options: finalOpts, correctAnswer: cIdx };
      } else {
          return { type: 'open_ended', question: q.question };
      }
  });

  return finalQuestions;
}
