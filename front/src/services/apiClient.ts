import { auth } from '../config/firebase';

/**
 * Build auth headers with the current user's Firebase ID token.
 * Shared across all service modules.
 */
export const getAuthHeaders = async (): Promise<HeadersInit> => {
    const user = auth.currentUser;
    if (!user) {
        throw new Error('Not authenticated');
    }
    const token = await user.getIdToken();
    return {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
    };
};

/** Base API URL resolved from env. */
export const API_URL = import.meta.env.VITE_API_URL || '/api';
