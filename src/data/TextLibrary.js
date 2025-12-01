import { LEVELS } from './studyPlans';

export const TEXT_LIBRARY = {
    [LEVELS.BEGINNER]: [
        // --- NARRATIVA ---
        {
            id: 'b_nar_1',
            category: 'Narrativa',
            title: "Historia del Explorador",
            text: `En un pequeño pueblo vivía un niño llamado Alex. Alex amaba explorar el bosque cercano a su casa. Un día encontró un río cristalino que nunca había visto antes. El río serpenteaba entre los árboles altos y las flores coloridas. Alex siguió el río durante horas, descubriendo plantas y animales que nunca había visto. Cuando llegó la noche, encontró el camino de vuelta a casa. Desde ese día, Alex se convirtió en el mejor explorador del pueblo.`,
            questions: [{ id: 'q1', text: "¿Qué encontró Alex en el bosque?", options: ["Una cueva", "Un río cristalino", "Un tesoro"], correctAnswer: 1 }]
        },
        {
            id: 'b_nar_2',
            category: 'Narrativa',
            title: "La Biblioteca Mágica",
            text: `Ana amaba leer libros. Todos los días después de clases iba a la biblioteca del pueblo. La biblioteca tenía miles de libros en estanterías altas que llegaban hasta el techo. Ana leía historias de princesas, dragones y mundos lejanos. Un día encontró un libro muy antiguo con tapas doradas. Cuando lo abrió, las palabras cobraron vida en su imaginación. Desde entonces, Ana supo que los libros eran portales a mundos infinitos.`,
            questions: [{ id: 'q1', text: "¿Qué tenían de especial las tapas del libro?", options: ["Eran de cuero", "Eran doradas", "Estaban rotas"], correctAnswer: 1 }]
        },
        {
            id: 'b_nar_3',
            category: 'Narrativa',
            title: "El Jardín Secreto",
            text: `Detrás de la casa de María había un jardín secreto. El jardín estaba lleno de flores de todos los colores: rosas rojas, margaritas blancas y tulipanes amarillos. María cuidaba las flores todos los días. Regaba las plantas, quitaba las malas hierbas y hablaba con ellas. Las flores crecían más hermosas cada día. El jardín secreto era el lugar favorito de María, donde podía soñar y descansar en paz.`,
            questions: [{ id: 'q1', text: "¿Qué hacía María con las flores?", options: ["Las vendía", "Hablaba con ellas", "Las pintaba"], correctAnswer: 1 }]
        },
        // --- CIENCIA ---
        {
            id: 'b_sci_1',
            category: 'Ciencia',
            title: "Las Abejas",
            text: `Las abejas son insectos increíbles y muy importantes para la naturaleza. Ellas ayudan a las flores a crecer llevando polen de una planta a otra. Viven en colmenas y trabajan juntas en equipo. Hay una abeja reina que es la madre de todas las demás. Las abejas obreras buscan comida y cuidan a los bebés. Sin las abejas, muchas frutas y verduras no podrían crecer, por eso debemos protegerlas.`,
            questions: [{ id: 'q1', text: "¿Cuál es el trabajo de las abejas obreras?", options: ["Poner huevos", "Buscar comida y cuidar bebés", "Dormir"], correctAnswer: 1 }]
        },
        {
            id: 'b_sci_2',
            category: 'Ciencia',
            title: "El Ciclo del Agua",
            text: `El agua en la Tierra siempre está en movimiento. El sol calienta el agua de los mares y ríos, convirtiéndola en vapor que sube al cielo. Allí se forman las nubes. Cuando las nubes están llenas de agua, llueve o nieva sobre la tierra. El agua corre por los ríos y vuelve al mar, y el ciclo comienza de nuevo. Este proceso es vital para toda la vida en nuestro planeta.`,
            questions: [{ id: 'q1', text: "¿Qué forma las nubes?", options: ["El humo", "El vapor de agua", "El viento"], correctAnswer: 1 }]
        },
        // --- HISTORIA ---
        {
            id: 'b_his_1',
            category: 'Historia',
            title: "Las Pirámides",
            text: `Hace miles de años, en el antiguo Egipto, se construyeron grandes pirámides. Eran tumbas para los reyes, llamados faraones. Las pirámides se hacían con bloques de piedra gigantescos. Nadie sabe con certeza cómo movieron esas piedras tan pesadas sin máquinas modernas. Las pirámides son un misterio y una maravilla que todavía podemos visitar hoy en día.`,
            questions: [{ id: 'q1', text: "¿Para qué servían las pirámides?", options: ["Como casas", "Como tumbas de faraones", "Como templos"], correctAnswer: 1 }]
        }
    ],
    [LEVELS.INTERMEDIATE]: [
        {
            id: 'i_tech_1',
            category: 'Tecnología',
            title: "Inteligencia Artificial",
            text: `La Inteligencia Artificial (IA) es una rama de la informática que busca crear sistemas capaces de realizar tareas que normalmente requieren inteligencia humana. Estas tareas incluyen el reconocimiento de voz, la toma de decisiones y la traducción de idiomas. Aunque la IA ofrece grandes beneficios, como la automatización de trabajos peligrosos, también plantea desafíos éticos sobre la privacidad y el empleo.`,
            questions: [{ id: 'q1', text: "¿Qué busca imitar la IA?", options: ["La fuerza humana", "La inteligencia humana", "La velocidad de la luz"], correctAnswer: 1 }]
        },
        {
            id: 'i_env_1',
            category: 'Medio Ambiente',
            title: "Energías Renovables",
            text: `Las energías renovables provienen de fuentes naturales inagotables, como el sol, el viento y el agua. A diferencia de los combustibles fósiles, estas energías no producen gases de efecto invernadero que dañan el clima. La transición hacia un modelo energético sostenible es crucial para combatir el cambio climático y asegurar un futuro limpio para las próximas generaciones.`,
            questions: [{ id: 'q1', text: "¿Cuál es una ventaja de las energías renovables?", options: ["Son baratas", "No producen gases de efecto invernadero", "Son fáciles de transportar"], correctAnswer: 1 }]
        },
        {
            id: 'i_psy_1',
            category: 'Psicología',
            title: "El Hábito de la Lectura",
            text: `Leer regularmente no solo mejora el conocimiento, sino que también ejercita el cerebro. Estudios demuestran que la lectura reduce el estrés, mejora la memoria y aumenta la empatía al permitirnos vivir otras vidas a través de los personajes. Crear el hábito de leer 20 minutos al día puede tener un impacto profundo en nuestra salud mental y cognitiva a largo plazo.`,
            questions: [{ id: 'q1', text: "¿Qué beneficio tiene la lectura según el texto?", options: ["Aumenta el estrés", "Mejora la empatía", "Cansa la vista"], correctAnswer: 1 }]
        },
        {
            id: 'i_hist_1',
            category: 'Historia',
            title: "La Revolución Industrial",
            text: `La Revolución Industrial marcó un punto de inflexión en la historia humana. Comenzó en Gran Bretaña a finales del siglo XVIII y transformó la economía agraria en una dominada por la industria y las máquinas. Este cambio trajo consigo el crecimiento de las ciudades, nuevas clases sociales y un aumento masivo en la producción de bienes, pero también condiciones laborales difíciles y contaminación.`,
            questions: [{ id: 'q1', text: "¿Dónde comenzó la Revolución Industrial?", options: ["Francia", "Estados Unidos", "Gran Bretaña"], correctAnswer: 2 }]
        }
    ],
    [LEVELS.ADVANCED]: [
        {
            id: 'a_phil_1',
            category: 'Filosofía',
            title: "El Estoicismo",
            text: `El estoicismo es una escuela filosófica fundada en Atenas que enseña el desarrollo del autocontrol y la fortaleza como medios para superar las emociones destructivas. Según los estoicos, la virtud es el único bien y el camino hacia la felicidad radica en aceptar el momento tal como se presenta, sin dejarse dominar por el deseo de placer o el miedo al dolor.`,
            questions: [{ id: 'q1', text: "¿Qué enseña el estoicismo?", options: ["La búsqueda del placer", "El autocontrol y la fortaleza", "La negación de la realidad"], correctAnswer: 1 }]
        },
        {
            id: 'a_eco_1',
            category: 'Economía',
            title: "Globalización",
            text: `La globalización es un proceso económico, tecnológico, político y cultural a escala planetaria que consiste en la creciente comunicación e interdependencia entre los distintos países del mundo. Une sus mercados, sociedades y culturas a través de una serie de transformaciones sociales, económicas y políticas que les dan un carácter global.`,
            questions: [{ id: 'q1', text: "¿Qué caracteriza a la globalización?", options: ["El aislamiento de países", "La interdependencia entre países", "La guerra constante"], correctAnswer: 1 }]
        },
        {
            id: 'a_neuro_1',
            category: 'Neurociencia',
            title: "Neuroplasticidad",
            text: `La neuroplasticidad es la capacidad del cerebro para reorganizarse formando nuevas conexiones neuronales a lo largo de la vida. Permite a las neuronas (las células nerviosas) compensar lesiones y enfermedades y ajustar sus actividades en respuesta a nuevas situaciones o a cambios en su entorno.`,
            questions: [{ id: 'q1', text: "¿Qué permite la neuroplasticidad?", options: ["Que el cerebro se reorganice", "Que el cerebro deje de crecer", "Que las neuronas mueran"], correctAnswer: 0 }]
        },
        {
            id: 'a_lit_1',
            category: 'Literatura',
            title: "Realismo Mágico",
            text: `El realismo mágico es un movimiento literario de mediados del siglo XX que se define por su preocupación estilística y el interés de mostrar lo irreal o extraño como algo cotidiano y común. No es una expresión literaria mágica, su finalidad no es suscitar emociones, sino, más bien, expresarlas, y es, sobre todas las cosas, una actitud frente a la realidad.`,
            questions: [{ id: 'q1', text: "¿Cómo muestra lo irreal el realismo mágico?", options: ["Como algo terrorífico", "Como algo cotidiano", "Como algo imposible"], correctAnswer: 1 }]
        }
    ]
};
