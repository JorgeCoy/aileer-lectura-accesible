// src/utils/conceptMapAnalyzer.js

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
// ANALIZADOR DE MAPAS CONCEPTUALES
// Para textos expositivos con clasificaciones
// ============================================
export class ConceptMapAnalyzer {
    
    static analyze(text, paragraphs, lang = 'es') {
        // 1. Detectar el concepto principal
        const mainConcept = this.detectMainConcept(text, paragraphs, lang);
        
        // 2. Extraer la definición principal
        const mainDefinition = this.extractMainDefinition(paragraphs, mainConcept, lang);
        
        // 3. Detectar clasificaciones (pares de categorías)
        const classifications = this.extractClassifications(paragraphs, mainConcept, lang);
        
        // 4. Extraer ejemplos para cada categoría
        const examples = this.extractExamples(paragraphs, classifications, lang);
        
        // 5. Detectar características adicionales
        const characteristics = this.extractCharacteristics(paragraphs, lang);
        
        // 6. Construir el mapa conceptual
        const conceptMap = this.buildConceptMap(mainConcept, mainDefinition, classifications, examples, characteristics, lang);
        
        return {
            mainConcept,
            mainDefinition,
            classifications,
            examples,
            characteristics,
            conceptMap,
            type: 'concept_map'
        };
    }
    
    // ==========================================
    // DETECTAR CONCEPTO PRINCIPAL
    // ==========================================
    static detectMainConcept(text, paragraphs, lang = 'es') {
        const firstParagraph = paragraphs[0]?.text || text;
        const firstSentence = firstParagraph.split(/[.!?]+/)[0]?.trim() || '';
        
        // Patrón: "Los X son..." o "X es..."
        const definitionPattern = lang === 'es'
            ? /(?:Los|Las|El|La)\s+(\w+)\s+son\s+(?:palabras|cosas|elementos|tipos|formas|clases)/i
            : /(?:The|A)\s+(\w+)\s+(?:are|is)\s+(?:words|things|elements|types|forms)/i;
        
        const match = firstSentence.match(definitionPattern);
        
        if (match) {
            return {
                word: match[1],
                type: 'defined',
                confidence: 0.95
            };
        }
        
        // Fallback: contar frecuencia y tomar la más común
        const words = text.toLowerCase().split(/\s+/);
        const stopWords = lang === 'es' ? STOP_WORDS_ES : STOP_WORDS_EN;
        const freq = {};
        
        words.forEach(w => {
            const clean = w.replace(/[^a-záéíóúüñ]/gi, '').toLowerCase();
            if (clean.length > 3 && !stopWords.has(clean)) {
                freq[clean] = (freq[clean] || 0) + 1;
            }
        });
        
        const sorted = Object.entries(freq).sort((a, b) => b[1] - a[1]);
        
        if (sorted.length > 0) {
            // Buscar la versión con mayúscula original
            const capitalMatch = text.match(new RegExp(`\\b${sorted[0][0]}\\b`, 'i'));
            return {
                word: capitalMatch ? capitalMatch[0] : sorted[0][0],
                type: 'frequency',
                confidence: 0.7
            };
        }
        
        return { word: 'Concepto', type: 'unknown', confidence: 0 };
    }
    
    // ==========================================
    // EXTRAER DEFINICIÓN PRINCIPAL
    // ==========================================
    static extractMainDefinition(paragraphs, mainConcept, lang = 'es') {
        const firstParagraph = paragraphs[0]?.text || '';
        const sentences = firstParagraph.split(/[.!?]+/).filter(s => s.trim());
        
        const conceptLower = mainConcept.word.toLowerCase();
        
        for (const sentence of sentences) {
            const lowerSentence = sentence.toLowerCase();
            
            const isDefinition = lang === 'es'
                ? (lowerSentence.includes(`${conceptLower} son`) ||
                   lowerSentence.includes(`${conceptLower} es`) ||
                   lowerSentence.includes(`definimos como`) ||
                   lowerSentence.includes(`se define como`))
                : (lowerSentence.includes(`${conceptLower} are`) ||
                   lowerSentence.includes(`${conceptLower} is`) ||
                   lowerSentence.includes(`defined as`));
            
            if (isDefinition) {
                return {
                    text: sentence.trim(),
                    sentenceIndex: sentences.indexOf(sentence)
                };
            }
        }
        
        if (sentences.length > 0) {
            return {
                text: sentences[0].trim(),
                sentenceIndex: 0
            };
        }
        
        return null;
    }
    
    // ==========================================
    // EXTRAER CLASIFICACIONES
    // ==========================================
    static extractClassifications(paragraphs, mainConcept, lang = 'es') {
        const classifications = [];
        
        const classificationPatterns = lang === 'es'
            ? [
                /existen\s+(\w+)\s+(\w+)\s+y\s+(\w+)/gi,
                /(?:los|las)\s+\w+\s+(?:pueden|puedo)\s+ser\s+(\w+)\s+(?:o|y)\s+(\w+)/gi,
                /hay\s+(\w+)\s+(\w+)\s+y\s+(\w+)/gi,
                /también\s+hay\s+(\w+)\s+(\w+)\s+y\s+(\w+)/gi,
                /además[,:]?\s+(?:los|las)\s+\w+\s+(?:pueden|puedo)\s+ser\s+(\w+)\s+(?:o|y)\s+(\w+)/gi
            ]
            : [
                /there are (\w+) and (\w+)/gi,
                /can be (\w+) or (\w+)/gi,
                /include (\w+) and (\w+)/gi
            ];
        
        for (let i = 1; i < paragraphs.length; i++) {
            const paragraphText = paragraphs[i].text;
            
            for (const pattern of classificationPatterns) {
                pattern.lastIndex = 0;
                const match = pattern.exec(paragraphText);
                
                if (match) {
                    const categoryType = this.identifyCategoryType(paragraphText, lang);
                    let category1, category2;
                    
                    if (match.length === 4) {
                        category1 = match[2];
                        category2 = match[3];
                    } else {
                        category1 = match[1];
                        category2 = match[2];
                    }
                    
                    const definitions = this.extractCategoryDefinitions(paragraphText, category1, category2, lang);
                    
                    classifications.push({
                        type: categoryType,
                        category1: {
                            name: category1,
                            definition: definitions.def1
                        },
                        category2: {
                            name: category2,
                            definition: definitions.def2
                        },
                        paragraphIndex: i,
                        sourceText: paragraphText
                    });
                    
                    break;
                }
            }
        }
        
        return classifications;
    }
    
    static identifyCategoryType(paragraphText, lang = 'es') {
        const lower = paragraphText.toLowerCase();
        
        if (lang === 'es') {
            if (lower.includes('común') || lower.includes('comunes') || lower.includes('propio') || lower.includes('propios')) {
                return 'genericidad'; // Común vs Propio
            }
            if (lower.includes('individual') || lower.includes('individuales') || lower.includes('colectivo') || lower.includes('colectivos')) {
                return 'cantidad'; // Individual vs Colectivo
            }
            if (lower.includes('concreto') || lower.includes('concretos') || lower.includes('abstracto') || lower.includes('abstractos')) {
                return 'tangibilidad'; // Concreto vs Abstracto
            }
            if (lower.includes('primitivo') || lower.includes('derivado') || lower.includes('compuesto')) {
                return 'estructura'; // Primitivo vs Derivado vs Compuesto
            }
            if (lower.includes('simple') || lower.includes('compuesto') || lower.includes('complejo')) {
                return 'complejidad';
            }
        } else {
            if (lower.includes('common') || lower.includes('proper')) return 'genericidad';
            if (lower.includes('singular') || lower.includes('plural') || lower.includes('collective')) return 'cantidad';
            if (lower.includes('concrete') || lower.includes('abstract')) return 'tangibilidad';
            if (lower.includes('simple') || lower.includes('compound')) return 'complejidad';
        }
        
        return 'otro';
    }
    
    static extractCategoryDefinitions(paragraphText, cat1, cat2, lang = 'es') {
        const sentences = paragraphText.split(/[.!?]+/).filter(s => s.trim());
        const def1 = [];
        const def2 = [];
        
        sentences.forEach(sentence => {
            const lower = sentence.toLowerCase();
            const cat1Lower = cat1.toLowerCase();
            const cat2Lower = cat2.toLowerCase();
            
            if (lang === 'es') {
                if (lower.includes(`los ${cat1Lower}`) || lower.includes(`las ${cat1Lower}`) || lower.includes(`un ${cat1Lower}`) || lower.includes(`una ${cat1Lower}`)) {
                    def1.push(sentence.trim());
                }
                if (lower.includes(`los ${cat2Lower}`) || lower.includes(`las ${cat2Lower}`) || lower.includes(`un ${cat2Lower}`) || lower.includes(`una ${cat2Lower}`)) {
                    def2.push(sentence.trim());
                }
            } else {
                if (lower.includes(`${cat1Lower} `) && !lower.includes(`${cat2Lower}`)) {
                    def1.push(sentence.trim());
                }
                if (lower.includes(`${cat2Lower} `) && !lower.includes(`${cat1Lower}`)) {
                    def2.push(sentence.trim());
                }
            }
        });
        
        return {
            def1: def1.join('. ') || null,
            def2: def2.join('. ') || null
        };
    }
    
    // ==========================================
    // EXTRAER EJEMPLOS
    // ==========================================
    static extractExamples(paragraphs, classifications, lang = 'es') {
        const examples = {};
        
        paragraphs.forEach((paragraph, i) => {
            const text = paragraph.text;
            
            const examplePatterns = lang === 'es'
                ? [
                    /(?:como|por ejemplo|ejemplos?)[,:]\s*([^.!?\n]+)/gi,
                    /(?:tal(?:es)? como|tales como)\s+([^.!?\n]+)/gi
                ]
                : [
                    /(?:such as|like|for example|e\.g\.)\s*([^.!?\n]+)/gi,
                    /(?:including|examples?)[,:]\s*([^.!?\n]+)/gi
                ];
            
            for (const pattern of examplePatterns) {
                pattern.lastIndex = 0;
                let match;
                
                while ((match = pattern.exec(text)) !== null) {
                    const exampleText = match[1].trim();
                    const exampleWords = exampleText
                        .split(/[,;y]+/)
                        .map(w => w.replace(/^(el|la|los|las|un|una|unos|unas)\s+/i, '').trim())
                        .filter(w => w.length > 0 && w.length < 30);
                    
                    const contextStart = Math.max(0, match.index - 100);
                    const contextEnd = Math.min(text.length, match.index + match[0].length);
                    const context = text.substring(contextStart, contextEnd).toLowerCase();
                    
                    for (const classification of classifications) {
                        const cat1Lower = classification.category1.name.toLowerCase();
                        const cat2Lower = classification.category2.name.toLowerCase();
                        
                        const cat1Pos = context.lastIndexOf(cat1Lower);
                        const cat2Pos = context.lastIndexOf(cat2Lower);
                        
                        if (cat1Pos > cat2Pos && cat1Pos !== -1) {
                            if (!examples[classification.category1.name]) {
                                examples[classification.category1.name] = [];
                            }
                            examples[classification.category1.name].push(...exampleWords);
                        } else if (cat2Pos !== -1) {
                            if (!examples[classification.category2.name]) {
                                examples[classification.category2.name] = [];
                            }
                            examples[classification.category2.name].push(...exampleWords);
                        }
                    }
                }
            }
        });
        
        Object.keys(examples).forEach(key => {
            examples[key] = [...new Set(examples[key])];
        });
        
        return examples;
    }
    
    // ==========================================
    // EXTRAER CARACTERÍSTICAS ADICIONALES
    // ==========================================
    static extractCharacteristics(paragraphs, lang = 'es') {
        const characteristics = [];
        
        paragraphs.forEach((paragraph, i) => {
            const patterns = lang === 'es'
                ? [
                    /(?:los|las)\s+\w+\s+(?:siempre|nunca|generalmente|normalmente|suele[n]?)\s+([^.!?\n]+)/gi,
                    /(?:los|las)\s+\w+\s+(?:pueden|puede)\s+acompañarse\s+de\s+([^.!?\n]+)/gi,
                    /reconocer\s+\w+\s+nos\s+ayuda\s+a\s+([^.!?\n]+)/gi
                ]
                : [
                    /\w+\s+(?:always|never|usually|generally)\s+([^.!?\n]+)/gi,
                    /\w+\s+can\s+be\s+accompanied\s+by\s+([^.!?\n]+)/gi
                ];
            
            for (const pattern of patterns) {
                pattern.lastIndex = 0;
                const match = pattern.exec(paragraph.text);
                if (match) {
                    characteristics.push({
                        text: match[0].trim(),
                        detail: match[1]?.trim(),
                        paragraphIndex: i
                    });
                }
            }
        });
        
        return characteristics;
    }
    
    // ==========================================
    // CONSTRUIR MAPA CONCEPTUAL
    // ==========================================
    static buildConceptMap(mainConcept, mainDefinition, classifications, examples, characteristics, lang = 'es') {
        const root = {
            id: 'root',
            label: mainConcept.word,
            type: 'main_concept',
            definition: mainDefinition?.text,
            children: []
        };
        
        classifications.forEach((classification, index) => {
            const classificationNode = {
                id: `classification_${index}`,
                label: this.getClassificationLabel(classification.type, lang),
                type: 'classification',
                children: []
            };
            
            const cat1Node = {
                id: `cat1_${index}`,
                label: classification.category1.name,
                type: 'category',
                definition: classification.category1.definition,
                examples: examples[classification.category1.name] || [],
                children: []
            };
            
            const cat2Node = {
                id: `cat2_${index}`,
                label: classification.category2.name,
                type: 'category',
                definition: classification.category2.definition,
                examples: examples[classification.category2.name] || [],
                children: []
            };
            
            classificationNode.children.push(cat1Node, cat2Node);
            root.children.push(classificationNode);
        });
        
        if (characteristics.length > 0) {
            const charNode = {
                id: 'characteristics',
                label: lang === 'es' ? 'Características' : 'Characteristics',
                type: 'characteristics',
                children: characteristics.map((c, i) => ({
                    id: `char_${i}`,
                    label: c.text,
                    type: 'characteristic',
                    detail: c.detail
                }))
            };
            root.children.push(charNode);
        }
        
        return root;
    }
    
    static getClassificationLabel(type, lang = 'es') {
        const labels = {
            es: {
                genericidad: 'Por genericidad',
                cantidad: 'Por cantidad',
                tangibilidad: 'Por tangibilidad',
                estructura: 'Por estructura',
                complejidad: 'Por complejidad',
                otro: 'Clasificación'
            },
            en: {
                genericidad: 'By generality',
                cantidad: 'By quantity',
                tangibilidad: 'By tangibility',
                estructura: 'By structure',
                complejidad: 'By complexity',
                otro: 'Classification'
            }
        };
        return (labels[lang] || labels.es)[type] || type;
    }
}
