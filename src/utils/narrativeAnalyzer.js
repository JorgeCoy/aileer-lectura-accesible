// src/utils/narrativeAnalyzer.js

export class NarrativeAnalyzer {
    static analyze(text, paragraphs, lang = 'es') {
        const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
        const tokens = this.tokenizeSimple(text);
        
        const characters = this.extractCharacters(text, sentences, lang);
        const setting = this.extractSetting(sentences, lang);
        const tone = this.detectTone(tokens, lang);
        const keyMoments = this.extractKeyMoments(paragraphs, sentences, lang);
        const narrativeLevel = this.assessLevel(text, sentences, lang);
        
        return {
            characters,
            setting,
            tone,
            keyMoments,
            narrativeLevel
        };
    }
    
    static tokenizeSimple(text) {
        return text.toLowerCase().match(/\b\w+\b/g) || [];
    }

    static extractCharacters(text, sentences, lang) {
        // Detectar palabras con mayúscula inicial (Nombres propios)
        const nameRegex = /\b[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+\b/g;
        let matches = text.match(nameRegex) || [];
        
        // Filtrar palabras que probablemente no sean nombres (al principio de la frase)
        const possibleNames = {};
        const stopWordsCap = lang === 'es' ? 
            ['El', 'La', 'Los', 'Las', 'Un', 'Una', 'En', 'Por', 'Pero', 'Y', 'Cuando', 'Había', 'Hace', 'Se', 'Su', 'A', 'De'] :
            ['The', 'A', 'An', 'In', 'On', 'But', 'And', 'When', 'Once', 'There', 'He', 'She', 'They'];
            
        matches.forEach(name => {
            if (!stopWordsCap.includes(name) && name.length > 2) {
                possibleNames[name] = (possibleNames[name] || 0) + 1;
            }
        });
        
        // Convertir a lista y ordenar por frecuencia
        let charList = Object.keys(possibleNames)
            .map(name => ({ name, freq: possibleNames[name], actions: [] }))
            .sort((a, b) => b.freq - a.freq)
            .slice(0, 3); // Top 3 personajes
            
        // Extraer acciones (verbos cercanos al nombre)
        charList.forEach(char => {
            sentences.forEach(sentence => {
                if (sentence.includes(char.name)) {
                    // Buscar la palabra justo después del nombre (probablemente un verbo de acción)
                    const words = sentence.replace(/[^\w\s]/g, '').split(/\s+/);
                    const idx = words.indexOf(char.name);
                    if (idx !== -1 && idx < words.length - 1) {
                        const action = words[idx + 1].toLowerCase();
                        if (action.length > 2 && !['el', 'la', 'un', 'una', 'the', 'a', 'is', 'was', 'es', 'era'].includes(action)) {
                            if (!char.actions.includes(action)) char.actions.push(action);
                        }
                    }
                }
            });
        });

        // Contar diálogos (guiones o comillas)
        const dialogueCount = (text.match(/["'«»]|- /g) || []).length / 2;
        
        if (charList.length > 0) {
            charList[0].isMain = true;
        }
        
        return {
            list: charList,
            mainCharacter: charList.length > 0 ? charList[0].name : null,
            dialogueCount: Math.floor(dialogueCount)
        };
    }

    static extractSetting(sentences, lang) {
        let isSpecified = false;
        let description = lang === 'es' ? 'en un lugar desconocido' : 'in an unknown place';
        
        // Analizar solo las primeras 3 oraciones para el escenario
        const opening = sentences.slice(0, 3).join(' ').toLowerCase();
        
        const places = lang === 'es' ?
            ['bosque', 'ciudad', 'pueblo', 'castillo', 'casa', 'escuela', 'isla', 'planeta', 'reino', 'granja'] :
            ['forest', 'city', 'town', 'castle', 'house', 'school', 'island', 'planet', 'kingdom', 'farm'];
            
        const times = lang === 'es' ?
            ['había una vez', 'hace mucho tiempo', 'un día', 'aquella noche', 'en el futuro', 'cierta vez'] :
            ['once upon a time', 'long ago', 'one day', 'that night', 'in the future', 'one time'];

        let foundPlace = places.find(p => opening.includes(p));
        let foundTime = times.find(t => opening.includes(t));

        if (foundPlace || foundTime) {
            isSpecified = true;
            if (lang === 'es') {
                description = `${foundTime ? foundTime : 'un día'}, en un ${foundPlace || 'lugar especial'}`;
            } else {
                description = `${foundTime ? foundTime : 'one day'}, in a ${foundPlace || 'special place'}`;
            }
        }
        
        return { description, isSpecified };
    }

    static detectTone(tokens, lang) {
        const tones = {
            joyful: {
                words: lang === 'es' ? ['feliz', 'alegría', 'sonrió', 'reír', 'fiesta', 'juego', 'amor', 'amistad', 'divertido'] : ['happy', 'joy', 'smiled', 'laugh', 'party', 'play', 'love', 'friendship', 'fun'],
                icon: '😊', color: 'yellow'
            },
            calm: {
                words: lang === 'es' ? ['tranquilo', 'paz', 'durmió', 'suave', 'silencio', 'noche', 'luna', 'descansó'] : ['calm', 'peace', 'slept', 'soft', 'silence', 'night', 'moon', 'rested'],
                icon: '🌙', color: 'blue'
            },
            adventurous: {
                words: lang === 'es' ? ['viaje', 'peligro', 'corrió', 'saltó', 'descubrió', 'bosque', 'montaña', 'valiente'] : ['journey', 'danger', 'ran', 'jumped', 'discovered', 'forest', 'mountain', 'brave'],
                icon: '⚔️', color: 'orange'
            },
            curious: {
                words: lang === 'es' ? ['misterio', 'secreto', 'buscó', 'encontró', 'magia', 'puerta', 'sorpresa'] : ['mystery', 'secret', 'searched', 'found', 'magic', 'door', 'surprise'],
                icon: '🔍', color: 'purple'
            },
            tender: {
                words: lang === 'es' ? ['abrazó', 'cuidó', 'pequeño', 'madre', 'padre', 'corazón', 'tierno'] : ['hugged', 'cared', 'little', 'mother', 'father', 'heart', 'tender'],
                icon: '❤️', color: 'pink'
            }
        };

        let maxScore = 0;
        let selectedTone = 'adventurous'; // Default
        
        for (const [toneName, data] of Object.entries(tones)) {
            let score = data.words.filter(w => tokens.includes(w)).length;
            if (score > maxScore) {
                maxScore = score;
                selectedTone = toneName;
            }
        }
        
        return {
            type: selectedTone,
            icon: tones[selectedTone].icon,
            color: tones[selectedTone].color
        };
    }

    static extractKeyMoments(paragraphs, sentences, lang) {
        const moments = [];
        const isEs = lang === 'es';
        
        // Opening (Primer párrafo)
        if (paragraphs.length > 0) {
            moments.push({
                type: 'opening',
                text: paragraphs[0].topicSentence || paragraphs[0].text.substring(0, 100) + '...',
                label: isEs ? 'El Inicio' : 'The Beginning',
                icon: 'book-open',
                color: 'blue'
            });
        }
        
        // Evento Medio (Buscar párrafo con mayor densidad)
        if (paragraphs.length > 2) {
            const middleParagraphs = paragraphs.slice(1, paragraphs.length - 1);
            const mainEvent = middleParagraphs.sort((a, b) => b.wordCount - a.wordCount)[0];
            
            if (mainEvent) {
                moments.push({
                    type: 'action',
                    text: mainEvent.topicSentence || mainEvent.text.substring(0, 100) + '...',
                    label: isEs ? 'La Aventura' : 'The Adventure',
                    icon: 'zap',
                    color: 'orange'
                });
            }
        }

        // Closing (Último párrafo)
        if (paragraphs.length > 1) {
            const last = paragraphs[paragraphs.length - 1];
            moments.push({
                type: 'closing',
                text: last.topicSentence || last.text.substring(0, 100) + '...',
                label: isEs ? 'El Final' : 'The End',
                icon: 'flag',
                color: 'green'
            });
        }
        
        return moments;
    }

    static assessLevel(text, sentences, lang) {
        const isEs = lang === 'es';
        const words = this.tokenizeSimple(text);
        
        if (words.length < 150 && sentences.length < 15) {
            return { level: 'beginner', label: isEs ? 'Cuento Corto (Ideal para iniciar)' : 'Short Story (Great for starting)' };
        } else if (words.length < 500) {
            return { level: 'intermediate', label: isEs ? 'Cuento Medio (Desarrollo)' : 'Medium Story (Development)' };
        } else {
            return { level: 'advanced', label: isEs ? 'Cuento Largo (Avanzado)' : 'Long Story (Advanced)' };
        }
    }
}