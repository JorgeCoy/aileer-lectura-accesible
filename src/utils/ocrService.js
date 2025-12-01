import { createWorker } from 'tesseract.js';

let worker = null;

/**
 * Inicializa el worker de Tesseract si no existe.
 * Usa 'spa' (español) por defecto.
 */
let currentProgressCallback = null;

/**
 * Inicializa el worker de Tesseract si no existe.
 * Usa 'spa' (español) por defecto.
 */
const getWorker = async () => {
    if (!worker) {
        console.warn("OCR: Creando nuevo worker Tesseract...");
        try {
            worker = await createWorker('spa', 1, {
                logger: m => {
                    if (currentProgressCallback) {
                        currentProgressCallback(m);
                    }
                }
            });
            console.warn("OCR: Worker creado exitosamente");
        } catch (e) {
            console.error("OCR: Error creando worker", e);
            throw e;
        }
    }
    return worker;
};

/**
 * Reconoce texto de una imagen (Blob, File, URL o Canvas).
 * @param {ImageLike} imageSource 
 * @param {Function} [progressCallback] - Callback para recibir actualizaciones de progreso
 * @returns {Promise<string>} Texto extraído
 */
export const recognizePage = async (imageSource, progressCallback = null) => {
    console.warn("OCR: Iniciando reconocimiento...");
    try {
        currentProgressCallback = progressCallback;
        const w = await getWorker();
        console.warn("OCR: Worker obtenido, ejecutando recognize...");
        const { data: { text } } = await w.recognize(imageSource);
        console.warn("OCR: Reconocimiento completado. Longitud texto:", text.length);
        currentProgressCallback = null;
        return text;
    } catch (error) {
        console.error("OCR Error en recognizePage:", error);
        currentProgressCallback = null;
        throw error;
    }
};

/**
 * Termina el worker para liberar memoria.
 * Útil si el usuario sale de la vista de lectura.
 */
export const terminateWorker = async () => {
    if (worker) {
        await worker.terminate();
        worker = null;
    }
};

// Exportar funciones individuales para DI
export const getWorkerInstance = () => getWorker();
export const recognizePageInstance = (imageSource, progressCallback) => recognizePage(imageSource, progressCallback);
export const terminateWorkerInstance = () => terminateWorker();
