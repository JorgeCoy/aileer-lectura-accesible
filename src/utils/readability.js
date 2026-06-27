/**
 * Cuenta las sílabas de una palabra en español de manera heurística.
 * Respeta diptongos, triptongos e hiatos básicos.
 */
export function countSyllables(word) {
    if (!word) return 0;
    let w = word.toLowerCase();
    
    // Convertimos 'y' al final de palabra a 'i' para que actúe como vocal
    w = w.replace(/y\b/g, 'i');
    
    // Extraemos todas las vocales
    const vowels = w.match(/[aeiouáéíóúü]/g);
    if (!vowels) return 1; // Fallback para palabras sin vocales claras
    
    let syllables = vowels.length;
    
    // Triptongos: Vocal débil + Fuerte + Débil (ej. miau, buey)
    // Se restan 2 porque 3 vocales forman 1 sola sílaba.
    const triphthongs = w.match(/[iuü][aeoáéó][iuü]/g);
    if (triphthongs) {
        syllables -= (triphthongs.length * 2);
        // Evitar que se cuenten como diptongos después
        w = w.replace(/[iuü][aeoáéó][iuü]/g, 'a'); 
    }
    
    // Diptongos: Débil + Fuerte, Fuerte + Débil, Débil + Débil
    // No cuenta como diptongo si la vocal débil tiene tilde (ej. rí-o, ba-úl) -> Hiato
    const diphthongs = w.match(/[iuü][aeoáéó]|[aeoáéó][iuü]|[iuü][iuü]/g);
    if (diphthongs) {
        syllables -= diphthongs.length;
    }
    
    return Math.max(1, syllables);
}

/**
 * Analiza un texto y devuelve métricas de legibilidad basadas en la 
 * fórmula de Fernández Huerta (adaptación de Flesch para español).
 */
export function analyzeReadability(text) {
    if (!text || text.trim().length === 0) return null;

    // Extraer oraciones usando puntuación final
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    // Extraer palabras
    const words = text.split(/[\s,;:()[\]"'-]+/).filter(w => w.trim().length > 0 && /[a-záéíóúüñ]/i.test(w));
    
    if (words.length === 0) return null;

    let totalSyllables = 0;
    words.forEach(word => {
        totalSyllables += countSyllables(word);
    });

    const totalWords = words.length;
    const totalSentences = sentences.length || 1;

    // Fórmula de Fernández Huerta
    // P = promedio de sílabas por cada 100 palabras
    // F = promedio de frases por cada 100 palabras
    const P = (totalSyllables / totalWords) * 100;
    const F = (totalSentences / totalWords) * 100;
    
    // IFH = 206.84 - 0.60 * P - 1.02 * F
    let score = 206.84 - (0.60 * P) - (1.02 * F);
    score = Math.max(0, Math.min(100, score)); // Acotar entre 0 y 100

    // Clasificación basada en la escala INFLESZ
    let difficulty = '';
    let ageGroup = '';
    let color = '';

    if (score < 40) {
        difficulty = 'Muy difícil';
        ageGroup = 'Universitario/Técnico';
        color = 'text-red-500';
    } else if (score < 55) {
        difficulty = 'Algo difícil';
        ageGroup = 'Bachillerato (15-18 años)';
        color = 'text-orange-500';
    } else if (score < 65) {
        difficulty = 'Grado Medio';
        ageGroup = 'Secundaria (12-15 años)';
        color = 'text-yellow-500';
    } else if (score < 80) {
        difficulty = 'Bastante fácil';
        ageGroup = 'Primaria (9-12 años)';
        color = 'text-green-500';
    } else {
        difficulty = 'Muy fácil';
        ageGroup = 'Infantil (6-9 años)';
        color = 'text-blue-500';
    }

    // Extraer palabras complejas (de 4 o más sílabas) y únicas para el Previewing
    const complexWords = [...new Set(
        words.filter(w => countSyllables(w) >= 4)
    )]
    .sort((a,b) => countSyllables(b) - countSyllables(a))
    .map(w => w.toLowerCase());

    return {
        score: parseFloat(score.toFixed(1)),
        difficulty,
        ageGroup,
        color,
        stats: {
            words: totalWords,
            sentences: totalSentences,
            syllables: totalSyllables
        },
        complexWords: complexWords.slice(0, 15) // Limitar a las 15 más complejas
    };
}
