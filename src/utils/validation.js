/**
 * Helper utilities for input validation and sanitization.
 */

/**
 * Validates email format.
 */
export const isValidEmail = (email) => {
    if (!email || typeof email !== 'string') return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
};

/**
 * Clamps WPM (Words Per Minute) between safe minimum and maximum bounds.
 * Default range: 30 to 1200 WPM.
 */
export const clampWpm = (wpm, min = 30, max = 1200) => {
    const parsed = parseInt(wpm, 10);
    if (isNaN(parsed)) return min;
    return Math.max(min, Math.min(max, parsed));
};

/**
 * Sanitizes generic text strings by trimming and constraining length.
 */
export const sanitizeString = (input, maxLength = 255) => {
    if (!input || typeof input !== 'string') return '';
    return input.trim().slice(0, maxLength);
};

/**
 * Validates 6-character alphanumeric class invite code.
 */
export const isValidClassCode = (code) => {
    if (!code || typeof code !== 'string') return false;
    const cleanCode = code.trim().toUpperCase();
    return /^[A-Z0-9]{6}$/.test(cleanCode);
};

/**
 * Validates role input strictly.
 */
export const isValidRole = (role) => {
    return ['student', 'teacher'].includes(role);
};
