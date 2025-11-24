import React, { useEffect, useRef, useState } from 'react';

const PdfRenderer = ({ file, pageNumber }) => {
    const canvasRef = useRef(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let isMounted = true;
        let renderTask = null;

        const renderPage = async () => {
            if (!file || !pageNumber) {
                console.warn("PdfRenderer: Falta archivo o número de página", { file, pageNumber });
                if (isMounted) setLoading(false);
                return;
            }

            try {
                if (isMounted) setLoading(true);
                setError(null);

                console.log("PdfRenderer: Iniciando renderizado...", { pageNumber });

                const pdfjsLib = await import("pdfjs-dist");
                // Asegurar que usamos la versión correcta del worker
                if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
                    pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
                }

                console.log("PdfRenderer: Cargando documento...");
                const arrayBuffer = await file.arrayBuffer();
                const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
                const pdf = await loadingTask.promise;

                if (!isMounted) return;

                console.log("PdfRenderer: Documento cargado. Obteniendo página...");
                const page = await pdf.getPage(pageNumber);

                // Calcular escala para ajustar al ancho del contenedor
                const canvas = canvasRef.current;
                if (!canvas) {
                    console.error("PdfRenderer: Canvas no encontrado");
                    return;
                }

                const context = canvas.getContext('2d');

                // Obtener dimensiones del contenedor padre
                const containerWidth = canvas.parentElement?.clientWidth || 600;
                const viewport = page.getViewport({ scale: 1.0 });
                const scale = (containerWidth - 32) / viewport.width; // -32 para padding
                const scaledViewport = page.getViewport({ scale });

                canvas.height = scaledViewport.height;
                canvas.width = scaledViewport.width;

                const renderContext = {
                    canvasContext: context,
                    viewport: scaledViewport
                };

                console.log("PdfRenderer: Renderizando en canvas...");
                renderTask = page.render(renderContext);
                await renderTask.promise;
                console.log("PdfRenderer: Renderizado completado");

                if (isMounted) setLoading(false);
            } catch (err) {
                if (isMounted) {
                    console.error("Error rendering PDF page:", err);
                    setError(`Error al visualizar: ${err.message}`);
                    setLoading(false);
                }
            }
        };

        renderPage();

        return () => {
            isMounted = false;
            if (renderTask) {
                renderTask.cancel();
            }
        };
    }, [file, pageNumber]);

    return (
        <div className="w-full flex flex-col items-center justify-center bg-gray-900 rounded-lg overflow-hidden min-h-[300px]">
            {loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-900/50 z-10">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                </div>
            )}
            {error ? (
                <div className="text-red-400 p-4 text-center">
                    <p>{error}</p>
                </div>
            ) : (
                <canvas ref={canvasRef} className="shadow-lg max-w-full" />
            )}
        </div>
    );
};

export default PdfRenderer;
