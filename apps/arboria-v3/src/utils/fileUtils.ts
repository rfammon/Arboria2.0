/**
 * Sanitizes a filename by removing accents, special characters, and replacing spaces with underscores.
 * Ensures the filename is safe for file systems, especially on Android.
 */
export const sanitizeFilename = (filename: string): string => {
    if (!filename) return 'arquivo_sem_nome';

    // 1. Remove accents/diacritics
    const normalized = filename.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    // 2. Replace special characters and spaces with underscores
    // Keep only letters, numbers, dots, and underscores
    const sanitized = normalized
        .replace(/\s+/g, '_')
        .replace(/[^a-zA-Z0-9._-]/g, '')
        .replace(/_{2,}/g, '_') // Avoid multiple consecutive underscores
        .replace(/^[_.]+|[_.]+(?=\.[^.]+$)|[_.]+$/g, ''); // Trim leading/trailing underscores/dots

    return sanitized;
};
