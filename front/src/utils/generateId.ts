/** Generate a short, unique ID suitable for client-side entities. */
export const generateId = (): string =>
    Date.now().toString(36) + Math.random().toString(36).substring(2, 8);
