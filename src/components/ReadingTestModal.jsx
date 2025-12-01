import React, { useState, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, ClockIcon, CheckCircleIcon, UserIcon, BookOpenIcon, TrophyIcon, ArrowRightIcon, ArrowLeftIcon, SpeakerWaveIcon, StopIcon } from '@heroicons/react/24/outline';
import { speakWord, stopSpeech } from '../utils/speech';
import AppContext from '../context/AppContext';

const ReadingTestModal = ({ isOpen, onClose, onComplete }) => {
    const { userProfile } = useContext(AppContext);
    const [currentStep, setCurrentStep] = useState(0);
    const [testStartTime, setTestStartTime] = useState(null);
    const [testEndTime, setTestEndTime] = useState(null);
    const [readingText, setReadingText] = useState('');
    const [comprehensionAnswers, setComprehensionAnswers] = useState({});
    const [results, setResults] = useState(null);
    const [showResults, setShowResults] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);

    // Steps: 0: Intro/Start, 1: Reading, 2: Comprehension, 3: Results
    const steps = ['Inicio', 'Lectura', 'Comprensión', 'Resultados'];

    // Textos de prueba por rangos de edad
    const testTexts = {
        young: { // < 9 años
            text: `En un pequeño pueblo llamado Rivendel, vivía un niño llamado Tim. Tim amaba explorar el bosque cercano a su casa. Un día, mientras caminaba entre los árboles, encontró un conejo herido. El conejo tenía una pata lastimada y no podía saltar. Tim decidió ayudar al animalito. Lo llevó con cuidado a su casa y le dio agua fresca y comida. Al día siguiente, el conejo ya podía saltar de nuevo. Tim lo soltó en el bosque y el conejo se alejó feliz. Desde ese día, Tim aprendió que ayudar a los demás es lo más importante.`,
            questions: [
                { id: 1, question: '¿Dónde vivía Tim?', options: ['En una ciudad grande', 'En un pequeño pueblo', 'En una granja'], correct: 1 },
                { id: 2, question: '¿Qué encontró Tim en el bosque?', options: ['Un pájaro herido', 'Un conejo herido', 'Una mariposa'], correct: 1 },
                { id: 3, question: '¿Qué aprendió Tim?', options: ['A explorar bosques', 'A ayudar a los demás', 'A cuidar conejos'], correct: 1 }
            ]
        },
        preteen: { // 9-12 años
            text: `Los dinosaurios dominaron la Tierra hace millones de años. Algunos eran gigantes y comían plantas, como el Diplodocus, mientras que otros eran feroces cazadores, como el Tiranosaurio Rex. Aunque desaparecieron hace mucho tiempo, los científicos, llamados paleontólogos, estudian sus huesos fosilizados para entender cómo vivían. Gracias a ellos, sabemos que muchos dinosaurios tenían plumas y que las aves modernas son sus parientes más cercanos. Estudiar el pasado nos ayuda a comprender la historia de nuestro planeta.`,
            questions: [
                { id: 1, question: '¿Cómo se llaman los científicos que estudian dinosaurios?', options: ['Biólogos', 'Paleontólogos', 'Arqueólogos'], correct: 1 },
                { id: 2, question: '¿Qué sabemos gracias a los fósiles?', options: ['Que todos volaban', 'Que muchos tenían plumas', 'Que vivían en el agua'], correct: 1 },
                { id: 3, question: '¿Quiénes son los parientes cercanos de los dinosaurios?', options: ['Los cocodrilos', 'Las aves modernas', 'Los lagartos'], correct: 1 }
            ]
        },
        teen: { // 13-17 años
            text: `La tecnología ha transformado la forma en que nos comunicamos. Hace veinte años, la gente usaba teléfonos fijos y cartas para mantenerse en contacto. Hoy en día, podemos enviar mensajes instantáneos, hacer videollamadas y compartir fotos en segundos. Esta revolución digital ha acercado a las personas, pero también ha creado nuevos desafíos. Es importante aprender a usar la tecnología de manera responsable y mantener el equilibrio entre el mundo virtual y el real. La educación digital se ha convertido en una herramienta esencial para el futuro.`,
            questions: [
                { id: 1, question: '¿Cómo se comunicaba la gente hace veinte años?', options: ['Con smartphones', 'Con teléfonos fijos y cartas', 'Con videollamadas'], correct: 1 },
                { id: 2, question: '¿Cuál es uno de los desafíos de la tecnología?', options: ['Mantener el equilibrio entre mundos', 'Enviar mensajes lentos', 'Usar teléfonos fijos'], correct: 0 },
                { id: 3, question: '¿Qué se ha convertido en esencial?', options: ['Las cartas tradicionales', 'La educación digital', 'Los teléfonos fijos'], correct: 1 }
            ]
        },
        adult: { // 18+ años
            text: `La economía circular representa un cambio paradigmático en cómo concebimos la producción y el consumo de bienes. A diferencia del modelo lineal tradicional de "tomar-hacer-deshechar", la economía circular busca mantener los productos, componentes y materiales en circulación durante el mayor tiempo posible. Este enfoque no solo reduce el impacto ambiental, sino que también crea oportunidades económicas significativas. Las empresas que adoptan principios circulares reportan mejoras en la eficiencia de recursos, reducción de costos operativos y mayor innovación en el diseño de productos.`,
            questions: [
                { id: 1, question: '¿Cuál es el modelo tradicional de producción?', options: ['Circular', 'Tomar-hacer-deshechar', 'Reciclar siempre'], correct: 1 },
                { id: 2, question: '¿Qué busca mantener la economía circular?', options: ['Solo productos nuevos', 'Productos y materiales en circulación', 'Solo componentes'], correct: 1 },
                { id: 3, question: '¿Qué reportan las empresas que adoptan principios circulares?', options: ['Solo reducción de costos', 'Mejoras en eficiencia y innovación', 'Solo impacto ambiental'], correct: 1 }
            ]
        }
    };

    useEffect(() => {
        if (isOpen) {
            setCurrentStep(0);
            setTestStartTime(null);
            setTestEndTime(null);
            setReadingText('');
            setComprehensionAnswers({});
            setResults(null);
            setShowResults(false);
            setIsSpeaking(false);
            stopSpeech();
        }
        return () => stopSpeech();
    }, [isOpen]);

    // Detener voz al cambiar de paso
    useEffect(() => {
        stopSpeech();
        setIsSpeaking(false);
    }, [currentStep]);

    const getAgeGroup = (userAge) => {
        if (userAge < 9) return 'young';
        if (userAge <= 12) return 'preteen';
        if (userAge <= 17) return 'teen';
        return 'adult';
    };

    const toggleSpeech = () => {
        if (isSpeaking) {
            stopSpeech();
            setIsSpeaking(false);
            return;
        }

        let textToRead = '';
        const ageGroup = getAgeGroup(userProfile.age);

        switch (currentStep) {
            case 0: // Inicio
                textToRead = `Hola ${userProfile.name}. Bienvenido a tu prueba de lectura. Presiona Comenzar cuando estés listo.`;
                break;
            case 1: // Lectura
                textToRead = "Instrucciones: Lee el siguiente texto lo más rápido posible pero comprendiendo su contenido. Cuando termines, haz clic en Terminé de Leer. " + readingText;
                break;
            case 2: // Comprensión
                textToRead = "Preguntas de Comprensión. ";
                const questions = testTexts[ageGroup].questions;
                questions.forEach((q, index) => {
                    textToRead += `Pregunta ${index + 1}: ${q.question}. Opciones: `;
                    q.options.forEach(opt => textToRead += `${opt}. `);
                });
                break;
            case 3: // Resultados
                if (results) {
                    textToRead = `¡Test Completado! ${getPerformanceMessage()} Tu velocidad de lectura es de ${results.wpm} palabras por minuto. Tu comprensión es del ${results.comprehensionScore} por ciento. Nivel recomendado: ${results.recommendedLevel}.`;
                }
                break;
            default:
                break;
        }

        if (textToRead) {
            setIsSpeaking(true);
            speakWord(textToRead, 'es-ES', () => setIsSpeaking(false));
        }
    };

    const startReadingTest = () => {
        const ageGroup = getAgeGroup(userProfile.age);
        setReadingText(testTexts[ageGroup].text);
        setTestStartTime(Date.now());
        setCurrentStep(1);
    };

    const finishReading = () => {
        setTestEndTime(Date.now());
        setCurrentStep(2);
    };

    const calculateResults = () => {
        const timeSpent = (testEndTime - testStartTime) / 1000; // tiempo en segundos
        const wordCount = readingText.split(' ').length;
        const wpm = Math.round((wordCount / timeSpent) * 60);

        const ageGroup = getAgeGroup(userProfile.age);
        const questions = testTexts[ageGroup].questions;
        let correctAnswers = 0;

        questions.forEach(q => {
            if (comprehensionAnswers[q.id] === q.correct) {
                correctAnswers++;
            }
        });

        const comprehensionScore = (correctAnswers / questions.length) * 100;

        // Algoritmo de evaluación
        let recommendedLevel = 'Principiante';
        let performance = 'regular';

        // Basado en edad esperada
        const expectedWpm = {
            young: { beginner: 80, intermediate: 120, advanced: 150 },
            preteen: { beginner: 120, intermediate: 160, advanced: 200 },
            teen: { beginner: 200, intermediate: 300, advanced: 400 },
            adult: { beginner: 250, intermediate: 350, advanced: 450 }
        };

        const expected = expectedWpm[ageGroup];

        if (wpm >= expected.advanced && comprehensionScore >= 80) {
            recommendedLevel = 'Avanzado';
            performance = 'excelente';
        } else if (wpm >= expected.intermediate && comprehensionScore >= 70) {
            recommendedLevel = 'Intermedio';
            performance = wpm >= expected.advanced ? 'bien' : 'regular';
        } else if (wpm >= expected.beginner && comprehensionScore >= 60) {
            performance = wpm >= expected.intermediate ? 'bien' : 'regular';
        } else {
            performance = 'necesita_mejora';
        }

        setResults({
            wpm,
            comprehensionScore,
            recommendedLevel,
            performance,
            timeSpent,
            age: userProfile.age,
            ageGroup
        });

        setShowResults(true);
        setCurrentStep(3);
    };

    const getPerformanceMessage = () => {
        if (!results) return '';

        const messages = {
            excelente: '¡Excelente! Tienes un nivel avanzado de lectura.',
            bien: '¡Muy bien! Tu nivel de lectura es sólido.',
            regular: 'Buen trabajo. Con práctica puedes mejorar.',
            necesita_mejora: 'Hay oportunidades de mejora. ¡No te preocupes, todos empezamos en algún lugar!'
        };

        return messages[results.performance] || messages.regular;
    };

    const renderStepContent = () => {
        switch (currentStep) {
            case 0: // Inicio (Instrucciones)
                return (
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="text-center"
                    >
                        <UserIcon className="w-16 h-16 text-indigo-500 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-gray-800 mb-4">¡Hola {userProfile.name}!</h3>
                        <p className="text-gray-600 mb-6">
                            Vamos a descubrir qué tan rápido lees.
                            El texto está adaptado para tu edad ({userProfile.age} años).
                        </p>
                        <div className="mt-6">
                            <button
                                onClick={startReadingTest}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2 mx-auto"
                            >
                                Comenzar Test
                                <ArrowRightIcon className="w-5 h-5" />
                            </button>
                        </div>
                    </motion.div>
                );

            case 1: // Lectura
                return (
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="text-center"
                    >
                        <BookOpenIcon className="w-16 h-16 text-indigo-500 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-gray-800 mb-4">Lee el texto</h3>
                        <p className="text-gray-600 mb-6">
                            Haz clic en "Terminé de Leer" cuando hayas acabado.
                        </p>

                        <div className="bg-gray-50 p-6 rounded-lg mb-6 text-left max-h-96 overflow-y-auto">
                            <p className="text-gray-800 leading-relaxed text-lg">{readingText}</p>
                        </div>

                        <button
                            onClick={finishReading}
                            className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2 mx-auto"
                        >
                            Terminé de Leer
                            <ArrowRightIcon className="w-5 h-5" />
                        </button>
                    </motion.div>
                );

            case 2: // Comprensión
                const ageGroup = getAgeGroup(userProfile.age);
                const questions = testTexts[ageGroup].questions;

                return (
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <h3 className="text-xl font-bold text-gray-800 mb-6 text-center">Preguntas de Comprensión</h3>

                        <div className="space-y-6">
                            {questions.map((q, index) => (
                                <div key={q.id} className="bg-gray-50 p-4 rounded-lg">
                                    <p className="font-medium text-gray-800 mb-3">
                                        {index + 1}. {q.question}
                                    </p>
                                    <div className="space-y-2">
                                        {q.options.map((option, optionIndex) => (
                                            <label key={optionIndex} className="flex items-center gap-3 cursor-pointer">
                                                <input
                                                    type="radio"
                                                    name={`question-${q.id}`}
                                                    value={optionIndex}
                                                    checked={comprehensionAnswers[q.id] === optionIndex}
                                                    onChange={(e) => setComprehensionAnswers(prev => ({
                                                        ...prev,
                                                        [q.id]: parseInt(e.target.value)
                                                    }))}
                                                    className="text-indigo-600 focus:ring-indigo-500"
                                                />
                                                <span className="text-gray-700">{option}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-8 flex gap-4 justify-center">
                            <button
                                onClick={() => setCurrentStep(1)}
                                className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2"
                            >
                                <ArrowLeftIcon className="w-5 h-5" />
                                Volver
                            </button>
                            <button
                                onClick={calculateResults}
                                disabled={Object.keys(comprehensionAnswers).length !== questions.length}
                                className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white px-8 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2"
                            >
                                Ver Resultados
                                <ArrowRightIcon className="w-5 h-5" />
                            </button>
                        </div>
                    </motion.div>
                );

            case 3: // Resultados
                if (!showResults || !results) return null;

                return (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center"
                    >
                        <TrophyIcon className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                        <h3 className="text-2xl font-bold text-gray-800 mb-4">¡Test Completado!</h3>

                        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-xl mb-6">
                            <p className="text-lg text-gray-700 mb-4">{getPerformanceMessage()}</p>

                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div className="bg-white p-4 rounded-lg">
                                    <div className="text-2xl font-bold text-indigo-600">{results.wpm}</div>
                                    <div className="text-sm text-gray-600">Palabras por minuto</div>
                                </div>
                                <div className="bg-white p-4 rounded-lg">
                                    <div className="text-2xl font-bold text-green-600">{results.comprehensionScore}%</div>
                                    <div className="text-sm text-gray-600">Comprensión</div>
                                </div>
                            </div>

                            <div className="bg-white p-4 rounded-lg">
                                <div className="text-lg font-semibold text-purple-600 mb-2">
                                    Nivel Recomendado: {results.recommendedLevel}
                                </div>
                                <p className="text-sm text-gray-600">
                                    Basado en tu edad ({results.age} años) y rendimiento en el test
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-4 justify-center">
                            <button
                                onClick={() => setCurrentStep(1)}
                                className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                            >
                                Repetir Test
                            </button>
                            <button
                                onClick={() => {
                                    onComplete?.(results);
                                    onClose();
                                }}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
                            >
                                Ver Plan Recomendado
                            </button>
                        </div>
                    </motion.div>
                );

            default:
                return null;
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden"
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white flex justify-between items-center">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <ClockIcon className="w-6 h-6 text-yellow-300" />
                                Test de Evaluación
                            </h2>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={toggleSpeech}
                                    className={`p-2 rounded-full transition-colors ${isSpeaking ? 'bg-red-500 hover:bg-red-600' : 'bg-white/20 hover:bg-white/30'}`}
                                    title={isSpeaking ? "Detener lectura" : "Leer en voz alta"}
                                >
                                    {isSpeaking ? (
                                        <StopIcon className="w-5 h-5 text-white" />
                                    ) : (
                                        <SpeakerWaveIcon className="w-5 h-5 text-white" />
                                    )}
                                </button>
                                <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition">
                                    <XMarkIcon className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="px-6 py-4 bg-gray-50">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-gray-600">Paso {currentStep + 1} de {steps.length}</span>
                                <span className="text-sm text-gray-500">{steps[currentStep]}</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                    className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                                ></div>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-6 md:p-8 overflow-y-auto max-h-[60vh]">
                            {renderStepContent()}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default ReadingTestModal;

