/**
 * Transforma una palabra en formato "Bionic Reading" (resaltando las primeras letras).
 * Retorna un objeto con { bold: string, normal: string }
 */
export const transformToBionic = (word) => {
    if (!word || word.length === 0) return { bold: "", normal: "" };

    const length = word.length;
    let boldLength = 1;

    if (length <= 3) boldLength = 1;
    else if (length <= 5) boldLength = 2;
    else if (length <= 8) boldLength = 3;
    else boldLength = Math.ceil(length * 0.4);

    return {
        bold: word.substring(0, boldLength),
        normal: word.substring(boldLength)
    };
};
