// src/utils/speech.js

// ✅ Estimar duración de una palabra en milisegundos
export const estimateWordDuration = (word, baseSpeed = 300) => {
  if (!word) return baseSpeed;
  const syllables = Math.max(1, Math.ceil(word.length / 3)); // Aproxima sílabas
  return Math.max(200, syllables * 100); // Mínimo 200ms
};


export const speakWord = (word, lang = 'es-ES', onEnd = null) => {
  if ('speechSynthesis' in window) {
    // ✅ Detener la voz actual antes de leer la nueva
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(word);
    utterance.lang = lang;
    utterance.rate = 1; // Velocidad de la voz (1 = normal)
    utterance.pitch = 1; // Tono de la voz (1 = normal)
    utterance.volume = 1; // Volumen (1 = máximo)

    if (onEnd) {
      utterance.onend = onEnd;
    }

    window.speechSynthesis.speak(utterance);
  } else {
    console.warn('La API de voz no está disponible en este navegador.');
    if (onEnd) onEnd(); // Fallback para continuar si no hay voz
  }
};

export const stopSpeech = () => {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
};