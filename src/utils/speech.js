// src/utils/speech.js

// ✅ Estimar duración de una palabra en milisegundos
export const estimateWordDuration = (word, baseSpeed = 300) => {
    const length = word.length;
    // Palabras largas toman más tiempo, cortas menos
    const duration = Math.max(baseSpeed * (length / 5), 100);
    return duration;
};

// ✅ Función para hablar una palabra
export const speakWord = (word, lang = 'es-ES', onEnd = null, rate = 1, voice = null) => {
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel(); // Cancelar cualquier habla anterior

        const utterance = new SpeechSynthesisUtterance(word);
        utterance.lang = lang;
        utterance.rate = rate; // Velocidad de la voz (1 = normal)
        utterance.pitch = 1; // Tono de la voz (1 = normal)
        utterance.volume = 1; // Volumen (1 = máximo)

        if (voice) {
            utterance.voice = voice;
        }

        if (onEnd) {
            utterance.onend = onEnd;
        }

        // Manejo de errores
        utterance.onerror = (event) => {
            console.error('Error en SpeechSynthesis:', event);
            if (onEnd) onEnd();
        };

        window.speechSynthesis.speak(utterance);
    } else {
        console.warn('La API de voz no está disponible en este navegador.');
        if (onEnd) onEnd(); // Fallback para continuar si no hay voz
    }
};

// ✅ Obtener voces disponibles
export const getVoices = () => {
    if ('speechSynthesis' in window) {
        return window.speechSynthesis.getVoices();
    }
    return [];
};

// ✅ Detener cualquier habla en curso
export const stopSpeech = () => {
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
    }
};