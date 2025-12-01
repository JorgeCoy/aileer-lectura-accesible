/**
 * Utility to split text into semantic chunks for reading.
 * Uses punctuation and common prepositions/conjunctions as delimiters.
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

const MAX_CHUNK_LENGTH = 35; // Characters roughly
const MIN_CHUNK_LENGTH = 10;

export const chunkText = (text) => {
    if (!text) return [];

    // 1. Initial split by major punctuation
    const sentences = text.split(/([.?!;]+)/).filter(Boolean);
    const chunks = [];

    // Re-attach punctuation to the previous segment
    for (let i = 0; i < sentences.length; i += 2) {
        const sentence = sentences[i];
        const punctuation = sentences[i + 1] || '';
        const fullSentence = (sentence + punctuation).trim();

        if (fullSentence) {
            chunks.push(...processSentence(fullSentence));
        }
    }

    return chunks;
};

const processSentence = (sentence) => {
    const words = sentence.split(/\s+/);
    const result = [];
    let currentChunk = [];
    let currentLength = 0;

    words.forEach((word, _index) => {
        const cleanWord = word.toLowerCase().replace(/[.,?!;:]/g, '');
        const isPreposition = PREPOSITIONS.has(cleanWord);
        const isConjunction = CONJUNCTIONS.has(cleanWord);
        const endsWithPunctuation = /[.,?!;:]$/.test(word);

        // Decide if we should start a new chunk BEFORE this word
        // (e.g., before a preposition if the current chunk is long enough)
        if (currentChunk.length > 0 && (isPreposition || isConjunction)) {
            if (currentLength >= MIN_CHUNK_LENGTH) {
                result.push(currentChunk.join(' '));
                currentChunk = [];
                currentLength = 0;
            }
        }

        currentChunk.push(word);
        currentLength += word.length;

        // Decide if we should end the chunk AFTER this word
        // (e.g., punctuation or max length reached)
        if (endsWithPunctuation || currentLength > MAX_CHUNK_LENGTH) {
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
