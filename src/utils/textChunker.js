/**
 * Utility to split text into semantic chunks for reading.
 * Uses punctuation, newlines, and common prepositions/conjunctions as delimiters.
 */

const PREPOSITIONS = new Set([
    'a', 'ante', 'bajo', 'cabe', 'con', 'contra', 'de', 'desde', 'durante',
    'en', 'entre', 'hacia', 'hasta', 'mediante', 'para', 'por', 'según',
    'sin', 'so', 'sobre', 'tras', 'versus', 'via'
]);

const CONJUNCTIONS = new Set([
    'y', 'e', 'ni', 'que', 'pero', 'mas', 'aunque', 'sino', 'porque',
    'pues', 'si', 'como', 'cuando', 'donde'
]);

const MAX_CHUNK_LENGTH = 25; // Reduced from 40 to prevent long single-line highlights
const MIN_CHUNK_LENGTH = 8;  // Reduced from 15 to allow more granular splits

export const chunkText = (text) => {
    if (!text) return [];

    // 1. Split by newlines first to respect paragraph structure
    const paragraphs = text.split(/\n+/).filter(p => p.trim().length > 0);
    const allChunks = [];

    paragraphs.forEach(paragraph => {
        // 2. Split by major punctuation within paragraph
        // Keep the punctuation attached to the previous part
        const sentences = paragraph.split(/([.?!;:]+)/).filter(Boolean);

        for (let i = 0; i < sentences.length; i += 2) {
            const sentencePart = sentences[i];
            const punctuation = sentences[i + 1] || '';
            const fullSentence = (sentencePart + punctuation).trim();

            if (fullSentence) {
                const sentenceChunks = processSentence(fullSentence);
                allChunks.push(...sentenceChunks);
            }
        }
    });

    return allChunks;
};

const processSentence = (sentence) => {
    // If sentence is short enough, return as is
    if (sentence.length <= MAX_CHUNK_LENGTH) {
        return [sentence];
    }

    const words = sentence.split(/\s+/);
    const result = [];
    let currentChunk = [];
    let currentLength = 0;

    words.forEach((word, index) => {
        const cleanWord = word.toLowerCase().replace(/[.,?!;:]/g, '');
        const isPreposition = PREPOSITIONS.has(cleanWord);
        const isConjunction = CONJUNCTIONS.has(cleanWord);
        const hasPunctuation = /[.,?!;:]/.test(word);

        // Logic to start a NEW chunk
        const shouldStartNew =
            currentChunk.length > 0 &&
            (isPreposition || isConjunction) &&
            currentLength >= MIN_CHUNK_LENGTH;

        if (shouldStartNew) {
            result.push(currentChunk.join(' '));
            currentChunk = [];
            currentLength = 0;
        }

        currentChunk.push(word);
        currentLength += word.length;

        // Logic to END the current chunk
        // 1. Strong punctuation (always break)
        // 2. Comma (break if chunk is long enough)
        // 3. Max length exceeded (soft break)
        const isStrongPunctuation = /[.?!;:]$/.test(word);
        const isComma = /,$/.test(word);

        if (isStrongPunctuation || (isComma && currentLength > 10) || currentLength > MAX_CHUNK_LENGTH) {
            result.push(currentChunk.join(' '));
            currentChunk = [];
            currentLength = 0;
        }
    });

    if (currentChunk.length > 0) {
        result.push(currentChunk.join(' '));
    }

    return result;
};

/**
 * Specialized chunker for Line Focus technique.
 * Creates longer chunks (lines) based on punctuation and length.
 */
export const chunkTextForLineFocus = (text, fontSize = 32) => {
    if (!text) return [];

    // Respect paragraphs
    const paragraphs = text.split(/\n+/).filter(p => p.trim().length > 0);
    const allChunks = [];

    paragraphs.forEach(paragraph => {
        const words = paragraph.split(/\s+/);
        let currentChunk = [];

        // Detectar móvil y tamaño de fuente
        const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
        const isGiantFont = fontSize >= 42;
        const isLargeFont = fontSize >= 32;

        const minWords = isMobile || isGiantFont ? 2 : 4;
        const maxWords = isGiantFont ? 4 : (isLargeFont ? 6 : 8);
        const maxChars = isGiantFont ? 25 : (isLargeFont ? 40 : 60);

        for (const word of words) {
            currentChunk.push(word);

            // Smart Chunking: 
            // 1. Puntuación Fuerte (Final de oración): SIEMPRE rompe línea
            const isSentenceEnd = /[.?!]+$/.test(word);

            // 2. Puntuación Débil (Pausas): Rompe solo si la línea tiene longitud mínima
            const isPause = /[,;:]$/.test(word);

            const isLongEnough = currentChunk.length >= minWords;
            const isTooLong = currentChunk.length >= maxWords;

            // Calcular longitud actual en caracteres
            const currentLength = currentChunk.join(' ').length;
            const exceedsChars = currentLength > maxChars;

            if (isSentenceEnd || (isPause && isLongEnough) || isTooLong || exceedsChars) {
                allChunks.push(currentChunk.join(' '));
                currentChunk = [];
            }
        }

        if (currentChunk.length > 0) {
            allChunks.push(currentChunk.join(' '));
        }
    });

    return allChunks;
};

/**
 * Specialized chunker for Saccadic Focus technique.
 * Creates short chunks of 3-4 words for eye fixations.
 */
export const chunkTextForSaccades = (text) => {
    if (!text) return [];

    // Respect paragraphs so they can be rendered correctly with breaks
    const paragraphs = text.split(/\n+/).filter(p => p.trim().length > 0);
    const allChunks = [];

    paragraphs.forEach(paragraph => {
        const words = paragraph.split(/\s+/);
        let currentChunk = [];

        // Typically a fixation is 3-4 words.
        const maxWords = 3;

        for (const word of words) {
            currentChunk.push(word);

            // Break if we reach the max words, or if there's strong punctuation
            const isSentenceEnd = /[.?!]+$/.test(word);
            const isTooLong = currentChunk.length >= maxWords;

            if (isSentenceEnd || isTooLong) {
                allChunks.push(currentChunk.join(' '));
                currentChunk = [];
            }
        }

        if (currentChunk.length > 0) {
            allChunks.push(currentChunk.join(' '));
        }
        
        // Add a paragraph break marker so SaccadicFocusReader can render newlines
        allChunks.push('\n\n');
    });

    // Remove the last paragraph break marker
    if (allChunks.length > 0 && allChunks[allChunks.length - 1] === '\n\n') {
        allChunks.pop();
    }

    return allChunks;
};

