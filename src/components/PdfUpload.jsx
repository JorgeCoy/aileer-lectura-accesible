import React from "react";

const PdfUpload = ({ handlePdfUpload, pdfPages, selectedPage, setSelectedPage }) => {
  return (
    <>
      <div className="mb-4">
        <input
          type="file"
          id="pdf-upload"
          accept=".pdf"
          onChange={handlePdfUpload}
          className="hidden"
        />
        <label
          htmlFor="pdf-upload"
          className="cursor-pointer bg-secondary px-4 py-2 rounded inline-block text-sm"
        >
          📄 Subir PDF
        </label>
      </div>

      {pdfPages.length > 0 && (
        <div className="mb-4">
          <label htmlFor="page-select" className="block text-sm mb-1">Leer:</label>
          <select
            id="page-select"
            value={selectedPage}
            onChange={(e) => setSelectedPage(e.target.value)}
            className="w-full p-2 bg-secondary rounded text-white"
          >
            <option value="all">Todo el PDF</option>
            {pdfPages.map((_, i) => (
              <option key={i} value={i + 1}>
                Página {i + 1}
              </option>
            ))}
          </select>
        </div>
      )}
    </>
  );
};

export default PdfUpload;