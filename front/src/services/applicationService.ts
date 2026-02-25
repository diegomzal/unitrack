import { auth } from '../config/firebase';
import type { Application, ApplicationFormData } from '../types/application';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

/**
 * Helper to get auth headers with the current user's ID token.
 */
const getAuthHeaders = async (): Promise<HeadersInit> => {
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

export const applicationService = {
    getAll: async (): Promise<Application[]> => {
        const headers = await getAuthHeaders();
        const response = await fetch(`${API_URL}/applications`, { headers });
        if (!response.ok) {
            throw new Error('Failed to fetch applications');
        }
        return response.json();
    },

    getById: async (id: string): Promise<Application | undefined> => {
        const headers = await getAuthHeaders();
        const response = await fetch(`${API_URL}/applications/${id}`, { headers });
        if (!response.ok) {
            if (response.status === 404) return undefined;
            throw new Error(`Failed to fetch application with id ${id}`);
        }
        return response.json();
    },

    create: async (data: ApplicationFormData): Promise<Application> => {
        const headers = await getAuthHeaders();
        const response = await fetch(`${API_URL}/applications`, {
            method: 'POST',
            headers,
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            throw new Error('Failed to create application');
        }
        return response.json();
    },

    update: async (id: string, data: Partial<ApplicationFormData>): Promise<Application> => {
        const headers = await getAuthHeaders();
        const response = await fetch(`${API_URL}/applications/${id}`, {
            method: 'PUT',
            headers,
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            throw new Error(`Failed to update application with id ${id}`);
        }
        return response.json();
    },

    delete: async (id: string): Promise<void> => {
        const headers = await getAuthHeaders();
        const response = await fetch(`${API_URL}/applications/${id}`, {
            method: 'DELETE',
            headers,
        });
        if (!response.ok) {
            throw new Error(`Failed to delete application with id ${id}`);
        }
    },
};
