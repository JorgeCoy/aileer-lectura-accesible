export const exportToPDF = (title, author, content, questions) => {
    // Crear una nueva ventana para imprimir
    const printWindow = window.open('', '_blank');
    
    if (!printWindow) {
        alert('Por favor, permite las ventanas emergentes (pop-ups) para generar el PDF.');
        return;
    }

    // Preparar el HTML del documento
    const htmlContent = `
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${title} - aLeer</title>
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
                
                body {
                    font-family: 'Inter', sans-serif;
                    line-height: 1.6;
                    color: #333;
                    max-width: 800px;
                    margin: 0 auto;
                    padding: 40px;
                }
                
                .header {
                    text-align: center;
                    border-bottom: 2px solid #ea580c;
                    padding-bottom: 20px;
                    margin-bottom: 30px;
                }
                
                .header h1 {
                    color: #ea580c;
                    margin: 0 0 10px 0;
                    font-size: 28px;
                }
                
                .header p {
                    margin: 0;
                    color: #666;
                    font-size: 16px;
                }
                
                .content {
                    text-align: justify;
                    font-size: 16px;
                    margin-bottom: 50px;
                    white-space: pre-wrap;
                }
                
                .evaluation-section {
                    page-break-before: always;
                }
                
                .evaluation-header {
                    background-color: #f3f4f6;
                    padding: 15px;
                    border-radius: 8px;
                    margin-bottom: 30px;
                }
                
                .evaluation-header h2 {
                    margin: 0 0 10px 0;
                    color: #1f2937;
                }
                
                .student-info {
                    display: flex;
                    justify-content: space-between;
                    margin-top: 15px;
                    font-weight: 600;
                }
                
                .student-line {
                    border-bottom: 1px solid #9ca3af;
                    flex-grow: 1;
                    margin-left: 10px;
                }
                
                .question {
                    margin-bottom: 30px;
                    break-inside: avoid;
                }
                
                .question h3 {
                    font-size: 16px;
                    margin: 0 0 15px 0;
                }
                
                .options {
                    list-style-type: upper-alpha;
                    padding-left: 20px;
                }
                
                .options li {
                    margin-bottom: 10px;
                }
                
                .open-answer {
                    height: 150px;
                    border: 1px solid #d1d5db;
                    border-radius: 8px;
                    margin-top: 15px;
                }
                
                @media print {
                    body {
                        padding: 0;
                    }
                    button {
                        display: none;
                    }
                    @page {
                        margin: 2cm;
                    }
                }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>${title}</h1>
                <p>Autor: ${author || 'Anónimo'}</p>
            </div>
            
            <div class="content">
                ${content}
            </div>
            
            ${questions && questions.length > 0 ? `
            <div class="evaluation-section">
                <div class="evaluation-header">
                    <h2>Evaluación de Comprensión Lectora</h2>
                    <div style="display: flex; margin-bottom: 10px;">
                        <span>Estudiante:</span>
                        <div class="student-line"></div>
                    </div>
                    <div style="display: flex; gap: 20px;">
                        <div style="display: flex; flex: 1;">
                            <span>Fecha:</span>
                            <div class="student-line"></div>
                        </div>
                        <div style="display: flex; flex: 1;">
                            <span>Nota:</span>
                            <div class="student-line"></div>
                        </div>
                    </div>
                </div>
                
                ${questions.map((q, index) => `
                    <div class="question">
                        <h3>${index + 1}. ${q.question}</h3>
                        ${q.type === 'open_ended' ? `
                            <div class="open-answer"></div>
                        ` : `
                            <ul class="options">
                                ${q.options ? q.options.map(opt => `<li>${opt}</li>`).join('') : ''}
                            </ul>
                        `}
                    </div>
                `).join('')}
            </div>
            ` : ''}
            
            <script>
                // Ejecutar impresión automáticamente cuando la ventana cargue
                window.onload = () => {
                    setTimeout(() => {
                        window.print();
                    }, 500);
                };
            </script>
        </body>
        </html>
    `;

    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
};
