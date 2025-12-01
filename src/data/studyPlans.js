import { BookOpenIcon, BoltIcon, EyeIcon, ClockIcon, TrophyIcon } from '@heroicons/react/24/outline';

export const LEVELS = {
    BEGINNER: 'Principiante',
    INTERMEDIATE: 'Intermedio',
    ADVANCED: 'Avanzado'
};

export const XP_REWARDS = {
    SESSION_COMPLETE: 100,
    READING_MINUTE: 10,
    CORRECT_ANSWER: 50,
    STREAK_BONUS: 20
};

// Helper to generate sessions
const generateSessions = (count, type, duration, baseConfig = {}) => {
    return Array.from({ length: count }, (_, i) => ({
        id: i + 1,
        title: `${type} - Sesión ${i + 1}`,
        duration: duration, // minutes
        xp: duration * 10 + 50, // Base XP
        completed: false,
        locked: i > 0,
        config: {
            speed: baseConfig.speed ? baseConfig.speed + (i * 10) : 200 + (i * 10), // Increment speed
            technique: baseConfig.technique || 'highlight',
            ...baseConfig
        }
    }));
};

export const STUDY_PLANS = {
    [LEVELS.BEGINNER]: {
        title: "Fundamentos de Lectura Ágil",
        description: "Domina las bases de la lectura rápida y elimina la subvocalización.",
        totalModules: 4,
        totalHours: 40,
        modules: [
            {
                id: 1,
                title: "Eliminación de Subvocalización",
                description: "Aprende a callar la voz interna para leer más rápido.",
                icon: BoltIcon,
                sessions: generateSessions(10, "Práctica Guiada Optimizada", 15, { technique: 'rsvp', speed: 250 })
            },
            {
                id: 2,
                title: "Expansión del Campo Visual",
                description: "Entrena tus ojos para captar más palabras de un vistazo.",
                icon: EyeIcon,
                sessions: generateSessions(10, "Ejercicios de Campo Visual", 20, { technique: 'highlight', speed: 220 })
            },
            {
                id: 3,
                title: "Ritmo y Fluidez",
                description: "Mejora la constancia en tu velocidad de lectura.",
                icon: ClockIcon,
                sessions: generateSessions(10, "Lectura Rítmica", 25, { technique: 'lineFocus', speed: 240 })
            },
            {
                id: 4,
                title: "Comprensión Básica",
                description: "Mantén la comprensión mientras aumentas la velocidad.",
                icon: BookOpenIcon,
                sessions: generateSessions(10, "Lectura y Comprensión con Contexto", 30, { technique: 'paragraphFocus', speed: 250 })
            }
        ]
    },
    [LEVELS.INTERMEDIATE]: {
        title: "Maestría en Velocidad",
        description: "Técnicas avanzadas para duplicar tu velocidad actual.",
        totalModules: 4,
        totalHours: 40,
        modules: [
            {
                id: 1,
                title: "Salto de Ojos (Saccades)",
                description: "Optimiza el movimiento de tus ojos entre líneas.",
                icon: EyeIcon,
                sessions: generateSessions(10, "Entrenamiento Saccádico", 20, { technique: 'saccade', speed: 350 })
            },
            {
                id: 2,
                title: "Lectura por Bloques",
                description: "Lee frases enteras en lugar de palabras individuales.",
                icon: BookOpenIcon,
                sessions: generateSessions(10, "Bloques de Texto", 25, { technique: 'semanticChunking', speed: 300 })
            },
            {
                id: 3,
                title: "Escaneo Rápido (Scanning)",
                description: "Encuentra información clave en segundos.",
                icon: BoltIcon,
                sessions: generateSessions(10, "Práctica de Scanning", 20, { technique: 'spritz', speed: 450 })
            },
            {
                id: 4,
                title: "Comprensión Avanzada",
                description: "Retención máxima a altas velocidades.",
                icon: TrophyIcon,
                sessions: generateSessions(10, "Retos de Comprensión", 35, { technique: 'paragraphFocus', speed: 500 })
            }
        ]
    },
    [LEVELS.ADVANCED]: {
        title: "Lectura Fotográfica",
        description: "Alcanza el máximo potencial de tu cerebro.",
        totalModules: 4,
        totalHours: 40,
        modules: [
            {
                id: 1,
                title: "Percepción Periférica Total",
                description: "Usa toda tu visión para leer páginas enteras.",
                icon: EyeIcon,
                sessions: generateSessions(10, "Visión Periférica", 30, { technique: 'highlight', speed: 600 })
            },
            {
                id: 2,
                title: "Procesamiento Paralelo",
                description: "Procesa múltiples líneas simultáneamente.",
                icon: BoltIcon,
                sessions: generateSessions(10, "Procesamiento Multilínea", 30, { technique: 'lineFocus', speed: 700 })
            },
            {
                id: 3,
                title: "Memoria Eidética",
                description: "Mejora tu capacidad de recordar detalles visuales.",
                icon: TrophyIcon,
                sessions: generateSessions(10, "Ejercicios de Memoria", 40, { technique: 'cloze', speed: 800 })
            },
            {
                id: 4,
                title: "Lectura de Alto Rendimiento",
                description: "Consolidación de todas las técnicas.",
                icon: BookOpenIcon,
                sessions: generateSessions(10, "Sesiones Intensivas", 45, { technique: 'spritz', speed: 900 })
            }
        ]
    }
};

// Practice texts for study sessions
export const PRACTICE_TEXTS = {
    [LEVELS.BEGINNER]: [
        {
            title: "Historia del Explorador",
            text: `En un pequeño pueblo vivía un niño llamado Alex. Alex amaba explorar el bosque cercano a su casa. Un día encontró un río cristalino que nunca había visto antes. El río serpenteaba entre los árboles altos y las flores coloridas. Alex siguió el río durante horas, descubriendo plantas y animales que nunca había visto. Cuando llegó la noche, encontró el camino de vuelta a casa. Desde ese día, Alex se convirtió en el mejor explorador del pueblo.`
        },
        {
            title: "La Biblioteca Mágica",
            text: `Ana amaba leer libros. Todos los días después de clases iba a la biblioteca del pueblo. La biblioteca tenía miles de libros en estanterías altas que llegaban hasta el techo. Ana leía historias de princesas, dragones y mundos lejanos. Un día encontró un libro muy antiguo con tapas doradas. Cuando lo abrió, las palabras cobraron vida en su imaginación. Desde entonces, Ana supo que los libros eran portales a mundos infinitos.`
        },
        {
            title: "El Jardín Secreto",
            text: `Detrás de la casa de María había un jardín secreto. El jardín estaba lleno de flores de todos los colores: rosas rojas, margaritas blancas y tulipanes amarillos. María cuidaba las flores todos los días. Regaba las plantas, quitaba las malas hierbas y hablaba con ellas. Las flores crecían más hermosas cada día. El jardín secreto era el lugar favorito de María, donde podía soñar y descansar en paz.`
        }
    ],
    [LEVELS.INTERMEDIATE]: [
        {
            title: "La Revolución Tecnológica",
            text: `La tecnología ha transformado completamente nuestras vidas en las últimas décadas. Hace treinta años, la comunicación se limitaba a cartas y llamadas telefónicas. Hoy en día, podemos enviar mensajes instantáneos a cualquier parte del mundo, hacer videollamadas con familiares lejanos y compartir momentos importantes en tiempo real. Esta revolución digital ha acercado a las personas como nunca antes, creando una red global de conexiones instantáneas.`
        },
        {
            title: "El Arte del Debate",
            text: `El debate es una herramienta fundamental para el desarrollo del pensamiento crítico. Cuando debatimos un tema, no solo expresamos nuestras opiniones, sino que también aprendemos a escuchar y considerar diferentes perspectivas. Un buen debate requiere preparación, respeto por el oponente y capacidad para argumentar de manera lógica. Los debates nos ayudan a fortalecer nuestras ideas y a comprender mejor los complejos matices de los temas importantes de nuestra sociedad.`
        },
        {
            title: "La Importancia del Medio Ambiente",
            text: `Nuestro planeta enfrenta desafíos ambientales sin precedentes. El cambio climático, la deforestación y la contaminación amenazan la biodiversidad y la calidad de vida humana. Es responsabilidad de cada persona contribuir a la preservación del medio ambiente mediante acciones concretas: reducir el consumo de plástico, reciclar correctamente, utilizar transporte sostenible y apoyar políticas ambientales. Pequeñas acciones individuales pueden generar grandes cambios colectivos para proteger nuestro hogar común.`
        }
    ],
    [LEVELS.ADVANCED]: [
        {
            title: "Economía Circular y Sostenibilidad",
            text: `La economía circular representa un paradigma revolucionario en la producción y consumo de bienes. A diferencia del modelo lineal tradicional de "extraer-producir-deshechar", la economía circular busca mantener los productos, componentes y materiales en circulación durante el mayor tiempo posible. Este enfoque no solo reduce el impacto ambiental, sino que también genera oportunidades económicas significativas. Las empresas que adoptan principios circulares reportan mejoras en la eficiencia de recursos, reducción de costos operativos y mayor innovación en el diseño de productos.`
        },
        {
            title: "Inteligencia Artificial y Ética",
            text: `La inteligencia artificial plantea desafíos éticos fundamentales que requieren reflexión cuidadosa. Mientras que la IA ofrece beneficios potenciales en campos como la medicina, la educación y la investigación científica, también plantea preocupaciones sobre privacidad, sesgos algorítmicos y el impacto en el empleo humano. Es crucial desarrollar marcos éticos que garanticen que los sistemas de IA se diseñen y utilicen de manera responsable, transparente y equitativa. La sociedad debe participar activamente en el debate sobre cómo integrar la IA en nuestras vidas de manera que beneficie a toda la humanidad.`
        },
        {
            title: "Neuroplasticidad y Aprendizaje",
            text: `La neuroplasticidad demuestra que el cerebro humano mantiene su capacidad de cambio y adaptación a lo largo de la vida. Contrario a la creencia tradicional de que el cerebro se "congela" después de la adultez temprana, la investigación moderna revela que podemos formar nuevas conexiones neuronales y reorganizar circuitos cerebrales en respuesta a experiencias, aprendizaje y prácticas deliberadas. Esta capacidad fundamental del cerebro sustenta la posibilidad de mejora continua en habilidades cognitivas, aprendizaje de idiomas, desarrollo de expertise y recuperación de funciones después de lesiones cerebrales.`
        }
    ]
};

// Global Paths for the new Map System
export const GLOBAL_PATHS = {
    kids: {
        id: 'kids',
        title: 'Ruta de Exploradores 🗺️',
        description: '¡Una aventura mágica para convertirte en un súper lector!',
        nodes: [
            {
                id: 'k1',
                title: 'El Bosque de los Sonidos',
                description: 'Aprende a escuchar las palabras.',
                level: LEVELS.BEGINNER,
                requirements: { xp: 0 },
                position: { x: 20, y: 80 }, // Coordinates for map
                type: 'start'
            },
            {
                id: 'k2',
                title: 'El Río de la Velocidad',
                description: 'Lee más rápido sin perderte.',
                level: LEVELS.BEGINNER,
                requirements: { xp: 500 },
                position: { x: 50, y: 50 },
                type: 'normal'
            },
            {
                id: 'k3',
                title: 'La Montaña de la Comprensión',
                description: 'Entiende todo lo que lees.',
                level: LEVELS.INTERMEDIATE,
                requirements: { xp: 1200 },
                position: { x: 80, y: 20 },
                type: 'boss'
            }
        ]
    },
    adult: {
        id: 'adult',
        title: 'Ruta de Maestría Profesional 🚀',
        description: 'Optimiza tu lectura para el éxito académico y profesional.',
        nodes: [
            {
                id: 'a1',
                title: 'Fundamentos Cognitivos',
                description: 'Elimina malos hábitos y subvocalización.',
                level: LEVELS.BEGINNER,
                requirements: { xp: 0 },
                position: { x: 10, y: 50 },
                type: 'start'
            },
            {
                id: 'a2',
                title: 'Aceleración Visual',
                description: 'Expande tu campo visual y velocidad.',
                level: LEVELS.INTERMEDIATE,
                requirements: { xp: 800 },
                position: { x: 40, y: 30 },
                type: 'normal'
            },
            {
                id: 'a3',
                title: 'Lectura Estratégica',
                description: 'Scanning, Skimming y Mapas Mentales.',
                level: LEVELS.ADVANCED,
                requirements: { xp: 2000 },
                position: { x: 70, y: 60 },
                type: 'normal'
            },
            {
                id: 'a4',
                title: 'Alto Rendimiento',
                description: 'Lectura fotográfica y memoria eidética.',
                level: LEVELS.ADVANCED,
                requirements: { xp: 4000 },
                position: { x: 90, y: 20 },
                type: 'boss'
            }
        ]
    }
};