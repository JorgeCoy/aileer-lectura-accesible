// src/utils/previewing.js

// ============================================
// 1. STOP WORDS (mantenido de tu código)
// ============================================
const STOP_WORDS_ES = new Set([
    "el", "la", "los", "las", "un", "una", "unos", "unas", "y", "e", "ni", "o", "u", 
    "pero", "aunque", "mas", "sino", "porque", "pues", "que", "como", "si", "cuando", 
    "donde", "mientras", "a", "ante", "bajo", "con", "contra", "de", "desde", "en", 
    "entre", "hacia", "hasta", "para", "por", "segun", "sin", "sobre", "tras", "este", 
    "esta", "estos", "estas", "ese", "esa", "esos", "esas", "aquel", "aquella", "ser", 
    "es", "son", "era", "eran", "estar", "estoy", "estan", "hacer", "hace", "hacen", 
    "su", "sus", "al", "del", "lo", "le", "les", "ha", "han", "hay", "todo", "todos", 
    "toda", "todas", "tambien", "asimismo", "ademas", "mediante", "durante",
    "implica", "realiza", "realizarse", "ejemplo", "casos", "tener", "tienen", "tiene", 
    "dividir", "calcula", "calcular", "pueden", "puede", "deben", "debe", "hacerlo",
    "parte", "partes", "entidad", "entidades", "caracteristica", "caracteristicas", 
    "segmento", "segmentos", "contexto", "contextos", "estudio", "estudios", "forma", 
    "formas", "punto", "puntos", "manera", "maneras", "diferente", "diferentes", 
    "relacion", "relaciones", "dividido", "divididos", "dividida", "divididas",
    "ejemplo", "ejemplos", "caso"
]);

const STOP_WORDS_EN = new Set([
    "the", "be", "to", "of", "and", "a", "in", "that", "have", "i", "it", "for", "not", 
    "on", "with", "he", "as", "you", "do", "at", "this", "but", "his", "by", "from", 
    "they", "we", "say", "her", "she", "or", "an", "will", "my", "one", "all", "would", 
    "there", "their", "what", "so", "up", "out", "if", "about", "who", "get", "which", 
    "go", "me", "when", "make", "can", "like", "time", "no", "just", "him", "know", 
    "take", "people", "into", "year", "your", "good", "some", "could", "them", "see", 
    "other", "than", "then", "now", "look", "only", "come", "its", "over", "think", 
    "also", "back", "after", "use", "two", "how", "our", "work", "first", "well", 
    "way", "even", "new", "want", "because",
    "system", "process", "method", "technique", "function", "part", "parts", "example", 
    "examples", "case", "cases", "different", "relationship", "divided", "dividing"
]);

// ============================================
// 2. DETECTOR DE IDIOMA
// ============================================
export class LanguageDetector {
    static detect(text) {
        if (!text) return 'es';
        const cleanText = text.toLowerCase();
        
        const spanishMarkers = (cleanText.match(/\b(el|la|los|las|y|de|en|un|una|es|con|para|que|por|del|se|su|al|como|pero|más|también|ha|una|o|fue|fueron)\b/gi) || []).length;
        const englishMarkers = (cleanText.match(/\b(the|and|of|to|a|is|that|in|it|you|was|for|are|with|this|have|from|or|one|had|by|but|not|what|all|were|we|when|your|can|said|there|use|an|each|which|she|do|how|their|if|will|up|other|about|out|many|then|them|these|so|some|her|would|make|like|him|into|time|has|look|two|more|write|go|see|number|no|way|could|people|my|than|first|water|been|call|who|oil|its|now|find|long|down|day|did|get|come|made|may|part)\b/gi) || []).length;
        
        return englishMarkers > spanishMarkers ? 'en' : 'es';
    }
}

// ============================================
// 3. CONTADOR DE SÍLABAS (mejorado)
// ============================================
export class SyllableCounter {
    static countSpanish(word) {
        if (!word) return 0;
        let w = word.toLowerCase();
        
        w = w.replace(/y\b/g, 'i');
        const vowels = w.match(/[aeiouáéíóúü]/g);
        if (!vowels) return 1;
        
        let syllables = vowels.length;
        
        // Triptongos
        const triphthongs = w.match(/[iuü][aeoáéó][iuü]/g);
        if (triphthongs) {
            syllables -= (triphthongs.length * 2);
            w = w.replace(/[iuü][aeoáéó][iuü]/g, 'a');
        }
        
        // Diptongos
        const diphthongs = w.match(/[iuü][aeoáéó]|[aeoáéó][iuü]|[iuü][iuü]/g);
        if (diphthongs) {
            syllables -= diphthongs.length;
        }
        
        return Math.max(1, syllables);
    }

    static countEnglish(word) {
        if (!word) return 0;
        let w = word.toLowerCase().replace(/[^a-z]/g, '');
        if (w.length <= 3) return 1;

        if (w.endsWith('e')) {
            if (w.endsWith('le') && w.length > 3 && !/[aeiouy]le$/.test(w)) {
                // Mantener
            } else if (w.endsWith('ee') || w.endsWith('oe') || w.endsWith('ye')) {
                // Mantener
            } else {
                w = w.slice(0, -1);
            }
        }

        const vowelGroups = w.match(/[aeiouy]+/g);
        if (!vowelGroups) return 1;

        let count = vowelGroups.length;

        if (w.endsWith('ed') && w.length > 4 && !w.endsWith('ted') && !w.endsWith('ded')) {
            count--;
        }

        return Math.max(1, count);
    }

    static count(word, lang = 'es') {
        return lang === 'en' ? this.countEnglish(word) : this.countSpanish(word);
    }
}

// ============================================
// 4. PREPROCESADOR DE TEXTO (mejorado)
// ============================================
export class TextPreprocessor {
    static tokenize(text) {
        if (!text) return [];
        const wordsRaw = text.split(/[\s,;:()[\]"'-]+/);
        let lastSearchIndex = 0;

        return wordsRaw
            .filter(w => w.trim().length > 0 && /[a-zA-ZáéíóúüñÁÉÍÓÚÜÑ]/.test(w))
            .map((rawWord) => {
                const wordPos = text.indexOf(rawWord, lastSearchIndex);
                const prefixContext = text.substring(lastSearchIndex, wordPos);
                
                const isStartOfParagraph = lastSearchIndex === 0 || prefixContext.includes('\n');
                const isStartOfSentence = isStartOfParagraph || /[.!?]/.test(prefixContext);
                
                lastSearchIndex = wordPos + rawWord.length;

                return {
                    rawWord,
                    cleanWord: rawWord.replace(/[^a-zA-ZáéíóúüñÁÉÍÓÚÜÑ]/g, ''),
                    index: wordPos,
                    isStartOfParagraph,
                    isStartOfSentence
                };
            });
    }
    
    static splitSentences(text) {
        // Mejor detección de oraciones que solo split por punto
        const sentences = [];
        let current = '';
        let i = 0;
        
        while (i < text.length) {
            current += text[i];
            
            // Detectar fin de oración
            if (/[.!?]/.test(text[i])) {
                // Verificar que no sea abreviatura
                const beforeMatch = current.match(/([A-Za-záéíóúüñ])\.\s*$/);
                const isAbbreviation = beforeMatch && /[a-záéíóúüñ]/.test(beforeMatch[1]);
                
                if (!isAbbreviation) {
                    sentences.push(current.trim());
                    current = '';
                }
            }
            i++;
        }
        
        if (current.trim()) {
            sentences.push(current.trim());
        }
        
        return sentences.filter(s => s.length > 10);
    }
}

// ============================================
// 5. EXTRACTOR DE PALABRAS CLAVE (mejorado)
// ============================================
export class KeywordExtractor {
    static getStem(word, lang = 'es') {
        let w = word.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        if (lang === 'en') {
            if (w.endsWith('ies') && w.length > 4) return w.slice(0, -3) + 'y';
            if (w.endsWith('es') && w.length > 3) return w.slice(0, -2);
            if (w.endsWith('s') && !w.endsWith('ss') && w.length > 2) return w.slice(0, -1);
            return w;
        } else {
            if (w.endsWith('es') && w.length > 4) return w.slice(0, -2);
            if (w.endsWith('s') && !w.endsWith('is') && w.length > 3) return w.slice(0, -1);
            return w;
        }
    }

    static extract(tokens, text, lang = 'es') {
        const stopWords = lang === 'en' ? STOP_WORDS_EN : STOP_WORDS_ES;
        const wordAnalysisMap = {};

        tokens.forEach((token) => {
            const lowerWord = token.cleanWord.toLowerCase();
            const normalizedWord = lowerWord.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

            if (lowerWord.length > 3 && !stopWords.has(normalizedWord)) {
                const stem = this.getStem(normalizedWord, lang);

                if (!wordAnalysisMap[stem]) {
                    wordAnalysisMap[stem] = {
                        displayWord: token.cleanWord,
                        frequency: 0,
                        positionScore: 0,
                        isCapitalized: false,
                        isSentenceStart: token.isStartOfSentence,
                        positions: []
                    };
                }

                wordAnalysisMap[stem].frequency += 1;
                wordAnalysisMap[stem].positions.push(token.index);

                if (token.isStartOfParagraph) {
                    wordAnalysisMap[stem].positionScore += 2.0;
                } else if (token.isStartOfSentence) {
                    wordAnalysisMap[stem].positionScore += 1.0;
                }

                const firstChar = token.rawWord[0];
                const startsWithCapital = /[A-ZÁÉÍÓÚÑ]/.test(firstChar);
                if (startsWithCapital && !token.isStartOfSentence) {
                    wordAnalysisMap[stem].isCapitalized = true;
                }
            }
        });

        const candidates = Object.values(wordAnalysisMap).map(item => {
            let weight = item.frequency * 3.0 + item.positionScore;
            
            if (item.isCapitalized) {
                weight += 2.5;
            }

            const cleanLower = item.displayWord.toLowerCase();
            const normalized = cleanLower.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

            if (lang === 'es') {
                const nounSuffixes = ['cion', 'sion', 'miento', 'dad', 'tad', 'ismo', 'ura', 'ez', 
                                      'logia', 'grafia', 'metria', 'tica', 'ma', 'ncia'];
                if (nounSuffixes.some(s => normalized.endsWith(s))) {
                    weight += 2.5;
                }
                if (/(ado|ido|ada|ida|ados|idos|adas)$/i.test(normalized)) {
                    weight -= 2.5;
                }
            } else {
                const nounSuffixes = ['tion', 'sion', 'ment', 'ness', 'ity', 'ship', 'ism', 'logy', 'ics', 'ance', 'ence'];
                if (nounSuffixes.some(s => normalized.endsWith(s))) {
                    weight += 2.5;
                }
                if (/(ed|ing|est|er)$/i.test(normalized) && normalized.length > 5) {
                    weight -= 2.0;
                }
            }

            if (lang === 'es' && cleanLower.length > 12 && cleanLower.endsWith('mente')) {
                weight -= 2.0;
            } else if (lang === 'en' && cleanLower.length > 10 && cleanLower.endsWith('ly')) {
                weight -= 2.0;
            }

            return {
                word: item.displayWord,
                stem: this.getStem(normalized, lang),
                weight,
                frequency: item.frequency,
                isEntity: item.isCapitalized
            };
        });

        candidates.sort((a, b) => b.weight - a.weight);

        return {
            primary: candidates.slice(0, 10),
            secondary: candidates.slice(10, 25)
        };
    }
}

// ============================================
// 6. ANALIZADOR DE LEGIBILIDAD (mantenido)
// ============================================
export class ReadabilityAnalyzer {
    static analyze(text, tokens, lang = 'es') {
        const sentences = TextPreprocessor.splitSentences(text);
        const totalWords = tokens.length;
        const totalSentences = sentences.length || 1;
        
        let totalSyllables = 0;
        tokens.forEach(t => {
            totalSyllables += SyllableCounter.count(t.cleanWord, lang);
        });

        if (totalWords === 0) return null;

        let score = 0;
        let difficulty = '';
        let ageGroup = '';
        let color = '';

        if (lang === 'es') {
            const P = (totalSyllables / totalWords) * 100;
            const F = (totalSentences / totalWords) * 100;
            score = 206.84 - (0.60 * P) - (1.02 * F);
            score = Math.max(0, Math.min(100, score));

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
        } else {
            const asl = totalWords / totalSentences;
            const asw = totalSyllables / totalWords;
            score = 206.835 - (1.015 * asl) - (84.6 * asw);
            score = Math.max(0, Math.min(100, score));

            if (score < 30) {
                difficulty = 'Very Difficult';
                ageGroup = 'College Graduate';
                color = 'text-red-500';
            } else if (score < 50) {
                difficulty = 'Difficult';
                ageGroup = 'College';
                color = 'text-orange-500';
            } else if (score < 60) {
                difficulty = 'Fairly Difficult';
                ageGroup = 'High School';
                color = 'text-yellow-500';
            } else if (score < 70) {
                difficulty = 'Standard';
                ageGroup = '8th-9th Grade';
                color = 'text-green-500';
            } else if (score < 80) {
                difficulty = 'Fairly Easy';
                ageGroup = '7th Grade';
                color = 'text-green-400';
            } else {
                difficulty = 'Easy';
                ageGroup = '6th Grade';
                color = 'text-blue-500';
            }
        }

        return {
            score: parseFloat(score.toFixed(1)),
            difficulty,
            ageGroup,
            color,
            stats: {
                words: totalWords,
                sentences: totalSentences,
                syllables: totalSyllables,
                avgWordsPerSentence: parseFloat((totalWords / totalSentences).toFixed(1)),
                avgSyllablesPerWord: parseFloat((totalSyllables / totalWords).toFixed(2))
            }
        };
    }
}

// ============================================
// 7. NUEVO: ANALIZADOR DE ESTRUCTURA DEL DOCUMENTO
// ============================================
export class DocumentStructureAnalyzer {
    static analyze(text) {
        const lines = text.split('\n');
        const structure = {
            title: null,
            subtitles: [],
            paragraphs: [],
            lists: [],
            stats: {
                totalLines: lines.length,
                totalParagraphs: 0,
                totalSubtitles: 0,
                hasLists: false
            }
        };
        
        let currentParagraph = { 
            text: '', 
            startIndex: 0, 
            endIndex: 0,
            lineIndex: 0 
        };
        let inParagraph = false;
        
        lines.forEach((line, lineIndex) => {
            const trimmedLine = line.trim();
            const startIndex = text.indexOf(line);
            
            // Línea vacía = fin de párrafo
            if (trimmedLine.length === 0) {
                if (inParagraph && currentParagraph.text.trim()) {
                    currentParagraph.endIndex = startIndex;
                    currentParagraph.lineIndex = lineIndex;
                    structure.paragraphs.push({ ...currentParagraph, index: structure.paragraphs.length });
                }
                currentParagraph = { text: '', startIndex: 0, endIndex: 0, lineIndex: 0 };
                inParagraph = false;
                return;
            }
            
            // Detectar título principal
            if (!structure.title && this.isTitle(trimmedLine, true)) {
                structure.title = { 
                    text: trimmedLine, 
                    lineIndex, 
                    startIndex 
                };
                return;
            }
            
            // Detectar subtítulos
            if (this.isTitle(trimmedLine, false)) {
                // Guardar párrafo anterior si existe
                if (inParagraph && currentParagraph.text.trim()) {
                    currentParagraph.endIndex = startIndex;
                    structure.paragraphs.push({ ...currentParagraph, index: structure.paragraphs.length });
                    currentParagraph = { text: '', startIndex: 0, endIndex: 0, lineIndex: 0 };
                    inParagraph = false;
                }
                
                structure.subtitles.push({ 
                    text: trimmedLine, 
                    lineIndex, 
                    startIndex,
                    index: structure.subtitles.length 
                });
                return;
            }
            
            // Detectar listas
            if (this.isListItem(trimmedLine)) {
                structure.lists.push({ text: trimmedLine, lineIndex, startIndex });
                structure.stats.hasLists = true;
                return;
            }
            
            // Es contenido de párrafo
            if (!inParagraph) {
                currentParagraph.startIndex = startIndex;
                inParagraph = true;
            }
            currentParagraph.text += (currentParagraph.text ? ' ' : '') + trimmedLine;
        });
        
        // Último párrafo
        if (inParagraph && currentParagraph.text.trim()) {
            currentParagraph.endIndex = text.length;
            structure.paragraphs.push({ ...currentParagraph, index: structure.paragraphs.length });
        }
        
        structure.stats.totalParagraphs = structure.paragraphs.length;
        structure.stats.totalSubtitles = structure.subtitles.length;
        
        return structure;
    }
    
    static isTitle(line, isFirst) {
        // Muy largo = no es título
        if (line.length > 120) return false;
        
        // Termina con punto = probablemente no es título
        if (line.endsWith('.')) return false;
        
        // Todo en mayúsculas
        if (line === line.toUpperCase() && line.length > 3 && line.length < 80) {
            return true;
        }
        
        // Empieza con número (ej: "1. Introducción")
        if (/^\d+[\.\)]\s+/.test(line)) {
            return true;
        }
        
        // Empieza con marcador como ## o ** (markdown)
        if (/^#{1,6}\s+/.test(line) || /^\*{1,3}[^*]+\*{1,3}$/.test(line)) {
            return true;
        }
        
        // Corto y sin verbos conjugados típicos
        if (isFirst && line.length < 80) {
            const words = line.split(/\s+/);
            if (words.length <= 10) {
                const hasTypicalVerbs = /^(es|son|era|fueron|tiene|hay|está|hace|puede|debe|ser|estar|haber)\b/i.test(line);
                if (!hasTypicalVerbs) return true;
            }
        }
        
        return false;
    }
    
    static isListItem(line) {
        return /^[\-\*\•]\s/.test(line) || /^\d+[\.\)]\s/.test(line);
    }
}

// ============================================
// 8. NUEVO: ANALIZADOR DE PÁRRAFOS
// ============================================
export class ParagraphAnalyzer {
    static analyze(paragraph, index, totalParagraphs, lang = 'es') {
        const tokens = TextPreprocessor.tokenize(paragraph.text);
        const sentences = TextPreprocessor.splitSentences(paragraph.text);
        const wordCount = tokens.length;
        const sentenceCount = sentences.length;
        
        // Determinar función del párrafo
        let paragraphFunction = this.detectFunction(paragraph.text, index, totalParagraphs, lang);
        
        // Extraer frase temática
        const topicSentence = this.extractTopicSentence(sentences, paragraphFunction);
        
        // Calcular importancia para el preview
        const importance = this.calculateImportance(paragraphFunction, index, totalParagraphs, wordCount);
        
        // Detectar si contiene definición clave
        const hasDefinition = this.containsDefinition(paragraph.text, lang);
        
        // Detectar si contiene ejemplo
        const hasExample = this.containsExample(paragraph.text, lang);
        
        return {
            ...paragraph,
            wordCount,
            sentenceCount,
            function: paragraphFunction,
            topicSentence,
            importance,
            hasDefinition,
            hasExample,
            // Para la UI: porcentaje de importancia relativa
            importancePercent: Math.min(100, Math.round(importance * 33))
        };
    }
    
    static detectFunction(text, index, total, lang = 'es') {
        const lowerText = text.toLowerCase();
        const firstSentence = text.split(/[.!?]+/)[0]?.toLowerCase() || '';
        
        // Introducción: primer párrafo
        if (index === 0) {
            return 'introduction';
        }
        
        // Conclusión: último párrafo o marcadores explícitos
        if (index === total - 1) {
            return 'conclusion';
        }
        
        // Marcadores de conclusión
        const conclusionMarkers = lang === 'es' 
            ? ['en resumen', 'en conclusión', 'finalmente', 'para concluir', 'en definitiva', 'en síntesis', 'para terminar']
            : ['in conclusion', 'to summarize', 'finally', 'in summary', 'to conclude', 'in short'];
        if (conclusionMarkers.some(m => firstSentence.includes(m))) {
            return 'conclusion';
        }
        
        // Marcadores de ejemplo
        const exampleMarkers = lang === 'es'
            ? ['por ejemplo', 'es decir', 'como caso', 'para ilustrar', 'un ejemplo', 'tal como']
            : ['for example', 'for instance', 'such as', 'to illustrate', 'e.g.', 'i.e.'];
        if (exampleMarkers.some(m => firstSentence.includes(m))) {
            return 'example';
        }
        
        // Marcadores de contraste
        const contrastMarkers = lang === 'es'
            ? ['sin embargo', 'no obstante', 'aunque', 'por el contrario', 'en cambio', 'pero']
            : ['however', 'nevertheless', 'although', 'on the other hand', 'in contrast', 'but'];
        if (contrastMarkers.some(m => firstSentence.includes(m))) {
            return 'contrast';
        }
        
        // Marcadores de causa-efecto
        const causeMarkers = lang === 'es'
            ? ['por lo tanto', 'en consecuencia', 'por ende', 'así que', 'de ahí que', 'como resultado']
            : ['therefore', 'consequently', 'as a result', 'thus', 'hence', 'so'];
        if (causeMarkers.some(m => firstSentence.includes(m))) {
            return 'cause_effect';
        }
        
        // Marcadores de enumeración
        const enumMarkers = lang === 'es'
            ? ['en primer lugar', 'primero', 'segundo', 'tercero', 'por un lado', 'por otro lado']
            : ['firstly', 'secondly', 'thirdly', 'on one hand', 'on the other hand'];
        if (enumMarkers.some(m => firstSentence.includes(m))) {
            return 'enumeration';
        }
        
        return 'development';
    }
    
    static extractTopicSentence(sentences, paragraphFunction) {
        if (sentences.length === 0) return null;
        
        // Para la mayoría de párrafos, la frase temática es la primera
        if (['introduction', 'development', 'enumeration', 'cause_effect'].includes(paragraphFunction)) {
            return this.cleanSentence(sentences[0]);
        }
        
        // Para contraste, suele ser la que establece la oposición
        if (paragraphFunction === 'contrast') {
            return this.cleanSentence(sentences[0]);
        }
        
        // Para ejemplos, la frase que introduce el ejemplo
        if (paragraphFunction === 'example') {
            return this.cleanSentence(sentences[0]);
        }
        
        // Para conclusión
        if (paragraphFunction === 'conclusion') {
            return this.cleanSentence(sentences[0]);
        }
        
        return this.cleanSentence(sentences[0]);
    }
    
    static cleanSentence(sentence) {
        return sentence.trim().replace(/\s+/g, ' ');
    }
    
    static calculateImportance(func, index, total, wordCount) {
        let importance = 1.0;
        
        // Introducción y conclusión son críticos
        if (func === 'introduction') importance = 3.5;
        else if (func === 'conclusion') importance = 3.0;
        
        // Segundo párrafo suele establecer el tema principal
        else if (index === 1) importance = 2.5;
        
        // Penúltimo párrafo suele ser transición a conclusión
        else if (index === total - 2) importance = 2.0;
        
        // Párrafos con contraste o causa-efecto son importantes
        else if (func === 'contrast' || func === 'cause_effect') importance = 2.0;
        
        // Ejemplos son menos importantes para el preview
        else if (func === 'example') importance = 0.8;
        
        // Párrafos muy cortos pueden ser transiciones
        if (wordCount < 25 && wordCount > 5 && func === 'development') {
            importance *= 1.3;
        }
        
        // Penalizar párrafos muy largos sin estructura clara
        if (wordCount > 150 && func === 'development') {
            importance *= 0.9;
        }
        
        return importance;
    }
    
    static containsDefinition(text, lang = 'es') {
        const definitionPatterns = lang === 'es'
            ? [/se define como/i, /es (un|una|el|la)\s+\w+/i, /consiste en/i, /se caracteriza por/i, /podemos definir/i, /entendemos por/i]
            : [/is defined as/i, /refers to/i, /can be defined/i, /means/i, /is (a|an|the)\s+\w+/i];
        return definitionPatterns.some(p => p.test(text));
    }
    
    static containsExample(text, lang = 'es') {
        const examplePatterns = lang === 'es'
            ? [/por ejemplo/i, /tal como/i, /un caso de/i, /por instancia/i]
            : [/for example/i, /for instance/i, /such as/i, /e\.g\./i];
        return examplePatterns.some(p => p.test(text));
    }
}

// ============================================
// 9. NUEVO: CLASIFICADOR DE TIPO DE TEXTO
// ============================================
export class TextTypeClassifier {
    static classify(text, structure, lang = 'es') {
        const lowerText = text.toLowerCase();
        const scores = {
            expository: 0,
            narrative: 0,
            argumentative: 0,
            instructive: 0,
            descriptive: 0
        };
        
        if (lang === 'es') {
            // Marcadores expositivos
            const expMarkers = ['se define como', 'consiste en', 'se caracteriza por', 'está formado por', 
                'se compone de', 'sus elementos son', 'las partes son', 'se divide en', 'se clasifica en', 
                'tipos de', 'clases de', 'variedades de', 'se denomina', 'recibe el nombre de'];
            expMarkers.forEach(m => { if (lowerText.includes(m)) scores.expository += 3; });
            
            // Marcadores narrativos
            const narMarkers = ['una vez', 'entonces', 'después', 'luego', 'mientras', 'cuando', 
                'de repente', 'al final', 'al principio', 'había una vez', 'el protagonista', 
                'el personaje', 'me contó', 'ocurrió que'];
            narMarkers.forEach(m => { if (lowerText.includes(m)) scores.narrative += 3; });
            
            // Verbos en pasado (indicativo de narración)
            const pastVerbs = (lowerText.match(/\b(fue|fueron|había|habían|hizo|hicieron|dijo|dijeron|vio|vieron|llegó|llegaron|salió|salieron|pasó|pasaron|ocurrió|ocurrieron|decidió|empezó|terminó)\b/g) || []);
            scores.narrative += pastVerbs.length * 1.5;
            
            // Marcadores argumentativos
            const argMarkers = ['opino que', 'creo que', 'mi posición es', 'estoy en contra', 'a favor de', 
                'es cierto que', 'no es cierto que', 'por un lado', 'por otro lado', 'en mi opinión', 
                'argumento que', 'se demuestra que', 'la evidencia muestra', 'es innegable que',
                'defiendo que', 'considero que', 'desde mi punto de vista'];
            argMarkers.forEach(m => { if (lowerText.includes(m)) scores.argumentative += 3; });
            
            // Marcadores instructivos
            const insMarkers = ['paso a paso', 'los pasos son', 'primero haz', 'luego haz', 'a continuación',
                'debes', 'debe', 'es necesario', 'instrucciones', 'procedimiento', 'método para',
                'cómo hacer', 'guía para', 'tutorial'];
            insMarkers.forEach(m => { if (lowerText.includes(m)) scores.instructive += 2; });
            
            // Imperativos
            const imperatives = (lowerText.match(/\b(haz|haga|hazlo|inserta|inserte|selecciona|seleccione|pulsa|pulse|abre|abra|cierra|cierre|escribe|escriba|entra|entre|copia|copie|pega|pegue|arrastra|haz clic)\b/g) || []);
            scores.instructive += imperatives.length * 3;
            
            // Marcadores descriptivos
            const descMarkers = ['es grande', 'es pequeño', 'tiene forma', 'de color', 'mide', 'pesa', 
                'se observa', 'se nota', 'aparenta', 'parece', 'se ve', 'se percibe', 'de aspecto',
                'textura', 'tono', 'brillante', 'opaco'];
            descMarkers.forEach(m => { if (lowerText.includes(m)) scores.descriptive += 2.5; });
            
        } else {
            // English markers
            const expMarkers = ['is defined as', 'consists of', 'is characterized by', 'is composed of',
                'is divided into', 'is classified as', 'types of', 'kinds of', 'refers to'];
            expMarkers.forEach(m => { if (lowerText.includes(m)) scores.expository += 3; });
            
            const narMarkers = ['once upon a time', 'then', 'after that', 'suddenly', 'finally',
                'the protagonist', 'the character', 'meanwhile', 'later that day'];
            narMarkers.forEach(m => { if (lowerText.includes(m)) scores.narrative += 3; });
            
            const pastVerbs = (lowerText.match(/\b(was|were|had|did|said|went|came|saw|took|made|told|became|began|ended)\b/g) || []);
            scores.narrative += pastVerbs.length * 1.5;
            
            const argMarkers = ['I believe', 'in my opinion', 'on the one hand', 'on the other hand',
                'it is clear that', 'the evidence shows', 'I argue that', 'is undeniable',
                'from my perspective', 'I strongly believe'];
            argMarkers.forEach(m => { if (lowerText.includes(m)) scores.argumentative += 3; });
            
            const insMarkers = ['step by step', 'first do', 'then do', 'next', 'you should',
                'instructions', 'procedure', 'how to', 'guide to', 'tutorial'];
            insMarkers.forEach(m => { if (lowerText.includes(m)) scores.instructive += 2; });
            
            const imperatives = (lowerText.match(/\b(click|type|press|select|insert|open|close|write|enter|copy|paste|drag|move|create|delete|save)\b/g) || []);
            scores.instructive += imperatives.length * 2;
            
            const descMarkers = ['is large', 'is small', 'has the shape', 'colored', 'measures',
                'weighs', 'can be observed', 'appears to be', 'looks like', 'texture', 'bright'];
            descMarkers.forEach(m => { if (lowerText.includes(m)) scores.descriptive += 2.5; });
        }
        
        // Estructura del documento como señal
        if (structure.title) scores.expository += 1;
        if (structure.subtitles.length > 2) scores.expository += 2;
        if (structure.lists.length > 3) scores.instructive += 2;
        if (structure.stats.totalParagraphs > 5) scores.expository += 0.5;
        
        // Encontrar el tipo con mayor score
        const maxScore = Math.max(...Object.values(scores));
        
        if (maxScore === 0) {
            return { 
                type: 'expository', 
                confidence: 0.3, 
                allScores: scores 
            };
        }
        
        const type = Object.keys(scores).find(key => scores[key] === maxScore);
        const confidence = Math.min(0.95, maxScore / 12);
        
        return { type, confidence, allScores: scores };
    }
    
    static getTypeName(type, lang = 'es') {
        const names = {
            es: {
                expository: 'Expositivo',
                narrative: 'Narrativo',
                argumentative: 'Argumentativo',
                instructive: 'Instructivo',
                descriptive: 'Descriptivo'
            },
            en: {
                expository: 'Expository',
                narrative: 'Narrative',
                argumentative: 'Argumentative',
                instructive: 'Instructive',
                descriptive: 'Descriptive'
            }
        };
        return (names[lang] || names.es)[type] || type;
    }
    
    static getTypeDescription(type, lang = 'es') {
        const descriptions = {
            es: {
                expository: 'Presenta información y explica conceptos de forma objetiva',
                narrative: 'Cuenta una historia o relata hechos en secuencia temporal',
                argumentative: 'Defiende una posición u opinión con razones y evidencias',
                instructive: 'Explica cómo realizar un proceso paso a paso',
                descriptive: 'Detalla características físicas o sensoriales de algo'
            },
            en: {
                expository: 'Presents information and explains concepts objectively',
                narrative: 'Tells a story or recounts events in temporal sequence',
                argumentative: 'Defends a position or opinion with reasons and evidence',
                instructive: 'Explains how to perform a process step by step',
                descriptive: 'Details physical or sensory characteristics of something'
            }
        };
        return (descriptions[lang] || descriptions.es)[type] || '';
    }
}

// ============================================
// 10. NUEVO: GENERADOR DE PREVIEW
// ============================================
export class PreviewGenerator {
    static generate(text, lang = null) {
        if (!text || text.trim().length === 0) return null;
        
        // 1. Detectar idioma
        const language = lang || LanguageDetector.detect(text);
        
        // 2. Analizar estructura del documento
        const structure = DocumentStructureAnalyzer.analyze(text);
        
        // 3. Preprocesar texto completo
        const tokens = TextPreprocessor.tokenize(text);
        
        // 4. Extraer palabras clave
        const keywords = KeywordExtractor.extract(tokens, text, language);
        
        // 5. Analizar legibilidad
        const readability = ReadabilityAnalyzer.analyze(text, tokens, language);
        
        // 6. Analizar cada párrafo
        const analyzedParagraphs = structure.paragraphs.map((p, i) => 
            ParagraphAnalyzer.analyze(p, i, structure.stats.totalParagraphs, language)
        );
        
        // 7. Clasificar tipo de texto
        const textType = TextTypeClassifier.classify(text, structure, language);
        
        // 8. Generar guía de escaneo
        const scanGuide = this.generateScanGuide(structure, analyzedParagraphs, language);
        
        // 9. Extraer frases temáticas clave
        const topicSentences = this.extractKeyTopicSentences(analyzedParagraphs, textType.type);
        
        // 10. Generar resumen de preview
        const summary = this.generatePreviewSummary(structure, keywords, textType, readability, language);
        
        // 11. Generar preguntas sugeridas
        const suggestedQuestions = this.generateSuggestedQuestions(structure, keywords, textType.type, language);
        
        return {
            // Metadatos del texto
            language,
            textType: {
                ...textType,
                name: TextTypeClassifier.getTypeName(textType.type, language),
                description: TextTypeClassifier.getTypeDescription(textType.type, language)
            },
            readability,
            
            // Estructura detectada
            structure: {
                title: structure.title?.text || null,
                subtitles: structure.subtitles.map(s => s.text),
                totalParagraphs: structure.stats.totalParagraphs,
                hasLists: structure.stats.hasLists,
                listCount: structure.lists.length
            },
            
            // Contenido clave para el previewing
            keywords: {
                primary: keywords.primary.map(k => k.word),
                secondary: keywords.secondary.map(k => k.word),
                entities: keywords.primary.filter(k => k.isEntity).map(k => k.word)
            },
            topicSentences,
            summary,
            suggestedQuestions,
            
            // Guía de escaneo visual
            scanGuide,
            
            // Párrafos analizados con metadatos para la UI
            paragraphs: analyzedParagraphs
        };
    }
    
    static generateScanGuide(structure, paragraphs, lang = 'es') {
        const sections = [];
        
        // 1. TÍTULO - Siempre primero
        if (structure.title) {
            sections.push({
                type: 'title',
                text: structure.title.text,
                reason: lang === 'es' ? 'Activa tu conocimiento previo sobre el tema' : 'Activates your prior knowledge about the topic',
                priority: 1,
                icon: 'heading',
                color: 'purple'
            });
        }
        
        // 2. INTRODUCCIÓN (primer párrafo)
        const introParagraph = paragraphs.find(p => p.function === 'introduction');
        if (introParagraph?.topicSentence) {
            sections.push({
                type: 'introduction',
                text: introParagraph.topicSentence,
                fullText: introParagraph.text,
                reason: lang === 'es' ? 'Contexto y objetivo del texto' : 'Context and purpose of the text',
                priority: 2,
                icon: 'play',
                color: 'blue'
            });
        }
        
        // 3. SUBTÍTULOS
        structure.subtitles.forEach((sub, i) => {
            sections.push({
                type: 'subtitle',
                text: sub.text,
                reason: lang === 'es' ? 'Estructura y organización del contenido' : 'Structure and organization of content',
                priority: 3 + (i * 0.1),
                icon: 'list',
                color: 'indigo'
            });
        });
        
        // 4. FRASES TEMÁTICAS de párrafos importantes (desarrollo)
        paragraphs.forEach((p, i) => {
            if ((p.function === 'development' || p.function === 'contrast' || p.function === 'cause_effect') 
                && p.importance >= 2.0 && p.topicSentence) {
                sections.push({
                    type: 'topic_sentence',
                    text: p.topicSentence,
                    paragraphIndex: i,
                    reason: lang === 'es' ? `Idea clave del párrafo ${i + 1}` : `Key idea from paragraph ${i + 1}`,
                    priority: 4,
                    icon: 'key',
                    color: 'amber'
                });
            }
        });
        
        // 5. DEFINICIONES (si hay)
        paragraphs.forEach((p, i) => {
            if (p.hasDefinition && p.topicSentence) {
                // Evitar duplicados si ya se incluyó como topic_sentence
                if (!sections.some(s => s.paragraphIndex === i && s.type === 'topic_sentence')) {
                    sections.push({
                        type: 'definition',
                        text: p.topicSentence,
                        paragraphIndex: i,
                        reason: lang === 'es' ? 'Definición de concepto importante' : 'Important concept definition',
                        priority: 3.5,
                        icon: 'book',
                        color: 'emerald'
                    });
                }
            }
        });
        
        // 6. CONCLUSIÓN
        const conclusionParagraph = paragraphs.find(p => p.function === 'conclusion');
        if (conclusionParagraph?.topicSentence) {
            sections.push({
                type: 'conclusion',
                text: conclusionParagraph.topicSentence,
                fullText: conclusionParagraph.text,
                reason: lang === 'es' ? 'Resumen de conclusiones principales' : 'Summary of main conclusions',
                priority: 2.5,
                icon: 'check-circle',
                color: 'green'
            });
        }
        
        // Ordenar por prioridad
        sections.sort((a, b) => a.priority - b.priority);
        
        // Calcular tiempo estimado de escaneo
        const estimatedSeconds = Math.max(15, sections.length * 8);
        
        // Generar tips específicos
        const tips = this.generateTips(sections, paragraphs.length, lang);
        
        return {
            sections,
            estimatedTime: {
                seconds: estimatedSeconds,
                formatted: estimatedSeconds < 60 
                    ? `${estimatedSeconds}s`
                    : `${Math.floor(estimatedSeconds / 60)}:${(estimatedSeconds % 60).toString().padStart(2, '0')}`
            },
            tips,
            totalSections: sections.length
        };
    }
    
    static generateTips(sections, totalParagraphs, lang = 'es') {
        const tips = [];
        
        if (sections.some(s => s.type === 'title')) {
            tips.push(lang === 'es' 
                ? '📖 Lee el título y pregúntate: ¿Qué sé ya sobre este tema?' 
                : '📖 Read the title and ask: What do I already know about this topic?');
        }
        
        if (totalParagraphs > 4) {
            tips.push(lang === 'es'
                ? '⏱️ No leas todo: escanea solo la primera frase de cada párrafo'
                : '⏱️ Don\'t read everything: scan only the first sentence of each paragraph');
        }
        
        if (sections.some(s => s.type === 'subtitle')) {
            tips.push(lang === 'es'
                ? '🗺️ Los subtítulos son como un mapa: te muestran la ruta del texto'
                : '🗺️ Subtitles are like a map: they show you the text\'s route');
        }
        
        tips.push(lang === 'es'
            ? '🎯 El objetivo NO es entender todo, sino crear un marco mental'
            : '🎯 The goal is NOT to understand everything, but to create a mental framework');
        
        tips.push(lang === 'es'
            ? '❓ Formula 2-3 preguntas que esperas responder al leer'
            : '❓ Formulate 2-3 questions you expect to answer when reading');
        
        return tips;
    }
    
    static extractKeyTopicSentences(paragraphs, textType) {
        const sentences = [];
        
        // Para textos expositivos, argumentativos e instructivos
        if (['expository', 'argumentative', 'instructive'].includes(textType)) {
            paragraphs.forEach((p, i) => {
                if (p.topicSentence && p.importance >= 1.8) {
                    sentences.push({
                        text: p.topicSentence,
                        paragraphIndex: i,
                        type: p.function,
                        importance: p.importance
                    });
                }
            });
        } 
        // Para narrativos, tomar inicio y cierre
        else if (textType === 'narrative') {
            if (paragraphs[0]?.topicSentence) {
                sentences.push({
                    text: paragraphs[0].topicSentence,
                    paragraphIndex: 0,
                    type: 'opening',
                    importance: 3
                });
            }
            if (paragraphs.length > 1 && paragraphs[paragraphs.length - 1]?.topicSentence) {
                sentences.push({
                    text: paragraphs[paragraphs.length - 1].topicSentence,
                    paragraphIndex: paragraphs.length - 1,
                    type: 'closing',
                    importance: 3
                });
            }
        }
        // Para descriptivos, tomar los párrafos más importantes
        else {
            paragraphs.forEach((p, i) => {
                if (p.topicSentence && p.importance >= 2.0) {
                    sentences.push({
                        text: p.topicSentence,
                        paragraphIndex: i,
                        type: p.function,
                        importance: p.importance
                    });
                }
            });
        }
        
        return sentences;
    }
    
    static generatePreviewSummary(structure, keywords, textType, readability, lang = 'es') {
        const typeName = TextTypeClassifier.getTypeName(textType.type, lang);
        const topKeywords = keywords.primary.slice(0, 5).map(k => k.word);
        
        if (lang === 'es') {
            let parts = [`Texto ${typeName.toLowerCase()}`];
            
            if (structure.title) {
                parts.push(`sobre "${structure.title.text}"`);
            }
            
            parts.push(`con ${structure.stats.totalParagraphs} párrafos`);
            
            if (readability) {
                parts.push(`de dificultad ${readability.difficulty.toLowerCase()}`);
            }
            
            if (topKeywords.length > 0) {
                parts.push(`. Conceptos clave: ${topKeywords.join(', ')}`);
            }
            
            if (structure.subtitles.length > 0) {
                parts.push(`. Secciones: ${structure.subtitles.slice(0, 3).join(' → ')}${structure.subtitles.length > 3 ? '...' : ''}`);
            }
            
            return parts.join('') + '.';
        } else {
            let parts = [`${typeName} text`];
            
            if (structure.title) {
                parts.push(`about "${structure.title.text}"`);
            }
            
            parts.push(`with ${structure.stats.totalParagraphs} paragraphs`);
            
            if (readability) {
                parts.push(`of ${readability.difficulty.toLowerCase()} difficulty`);
            }
            
            if (topKeywords.length > 0) {
                parts.push(`. Key concepts: ${topKeywords.join(', ')}`);
            }
            
            if (structure.subtitles.length > 0) {
                parts.push(`. Sections: ${structure.subtitles.slice(0, 3).join(' → ')}${structure.subtitles.length > 3 ? '...' : ''}`);
            }
            
            return parts.join('') + '.';
        }
    }
    
    static generateSuggestedQuestions(structure, keywords, textType, lang = 'es') {
        const questions = [];
        const topKeywords = keywords.primary.slice(0, 3).map(k => k.word);
        
        if (lang === 'es') {
            if (structure.title) {
                questions.push(`¿Qué trata de explicarme el autor sobre "${structure.title.text}"?`);
            }
            
            if (topKeywords.length >= 2) {
                questions.push(`¿Qué relación existe entre ${topKeywords[0]} y ${topKeywords[1]}?`);
            }
            
            if (textType.type === 'argumentative') {
                questions.push('¿Cuál es la posición principal del autor y qué evidencias presenta?');
            } else if (textType.type === 'expository') {
                questions.push(`¿Cuáles son las características principales de ${topKeywords[0] || 'este tema'}?`);
            } else if (textType.type === 'instructive') {
                questions.push('¿Cuáles son los pasos clave que debo recordar?');
            } else {
                questions.push('¿Cuál es la idea principal que debería recordar después de leer?');
            }
        } else {
            if (structure.title) {
                questions.push(`What is the author trying to explain about "${structure.title.text}"?`);
            }
            
            if (topKeywords.length >= 2) {
                questions.push(`What is the relationship between ${topKeywords[0]} and ${topKeywords[1]}?`);
            }
            
            if (textType.type === 'argumentative') {
                questions.push('What is the author\'s main position and what evidence do they present?');
            } else if (textType.type === 'expository') {
                questions.push(`What are the main characteristics of ${topKeywords[0] || 'this topic'}?`);
            } else {
                questions.push('What is the main idea I should remember after reading?');
            }
        }
        
        return questions.slice(0, 3);
    }
}

// ============================================
// 11. EXPORTACIÓN UNIFICADA
// ============================================
export function analyzePreview(text, lang = null) {
    return PreviewGenerator.generate(text, lang);
}

// Mantener compatibilidad hacia atrás
export function countSyllables(word) {
    return SyllableCounter.countSpanish(word);
}

export function analyzeReadability(text) {
    const preview = analyzePreview(text);
    if (!preview) return null;
    
    return {
        ...preview.readability,
        keywords: preview.keywords
    };
}