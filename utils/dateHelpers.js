export const parseDateString = (str) => {
    if (!str) return null;
    if (str instanceof Date) return str;
    
    // Check for "DD.MM.YYYY"
    const parts = str.split('.');
    if (parts.length === 3) {
        return new Date(parts[2], parseInt(parts[1], 10) - 1, parts[0]);
    }

    // Fallback to JS standard parsing
    const date = new Date(str);
    if (!isNaN(date.getTime())) return date;
    
    return null;
};

export const formatDateString = (date) => {
    if (!date) return '';
    if (typeof date === 'string') {
        const parsed = parseDateString(date);
        if (!parsed) return date; // return as is if invalid
        date = parsed;
    }
    const d = String(date.getDate()).padStart(2, '0');
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const y = date.getFullYear();
    return `${d}.${m}.${y}`;
};
