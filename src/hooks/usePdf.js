import { useState } from "react";

const usePdf = ({ enablePdf, setText }) => {
    const [pdfPages, setPdfPages] = useState([]);
    const [selectedPage, setSelectedPage] = useState(0);

    const handlePdfUpload = (pdfText, pages) => {
        if (!enablePdf) return; // ✅ No permitir PDF si no está habilitado
        setText(pdfText);
        setPdfPages(pages);
    };

    return {
        pdfPages,
        selectedPage,
        setSelectedPage,
        handlePdfUpload
    };
};

export default usePdf;
