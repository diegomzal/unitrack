import { auth } from '../config/firebase';
import type { University, UniversityFormData } from '../types/university';

const API_URL = import.meta.env.VITE_API_URL || '/api';

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

export const universityService = {
    getAll: async (): Promise<University[]> => {
        const headers = await getAuthHeaders();
        const response = await fetch(`${API_URL}/universities`, { headers });
        if (!response.ok) {
            throw new Error('Failed to fetch universities');
        }
        return response.json();
    },

    getById: async (id: string): Promise<University | undefined> => {
        const headers = await getAuthHeaders();
        const response = await fetch(`${API_URL}/universities/${id}`, { headers });
        if (!response.ok) {
            if (response.status === 404) return undefined;
            throw new Error(`Failed to fetch university with id ${id}`);
        }
        return response.json();
    },

    create: async (data: UniversityFormData): Promise<University> => {
        const headers = await getAuthHeaders();
        const response = await fetch(`${API_URL}/universities`, {
            method: 'POST',
            headers,
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            throw new Error('Failed to create university');
        }
        return response.json();
    },

    update: async (id: string, data: Partial<UniversityFormData>): Promise<University> => {
        const headers = await getAuthHeaders();
        const response = await fetch(`${API_URL}/universities/${id}`, {
            method: 'PUT',
            headers,
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            throw new Error(`Failed to update university with id ${id}`);
        }
        return response.json();
    },

    delete: async (id: string): Promise<void> => {
        const headers = await getAuthHeaders();
        const response = await fetch(`${API_URL}/universities/${id}`, {
            method: 'DELETE',
            headers,
        });
        if (!response.ok) {
            throw new Error(`Failed to delete university with id ${id}`);
        }
    },
};
