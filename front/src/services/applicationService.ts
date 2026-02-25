import type { Application, ApplicationFormData } from '../types/application';

// We use the local API URL, assuming that backend is running on 3000.
// Use environment variables in production.
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const applicationService = {
    getAll: async (): Promise<Application[]> => {
        const response = await fetch(`${API_URL}/applications`);
        if (!response.ok) {
            throw new Error('Failed to fetch applications');
        }
        return response.json();
    },

    getById: async (id: string): Promise<Application | undefined> => {
        const response = await fetch(`${API_URL}/applications/${id}`);
        if (!response.ok) {
            if (response.status === 404) return undefined;
            throw new Error(`Failed to fetch application with id ${id}`);
        }
        return response.json();
    },

    create: async (data: ApplicationFormData): Promise<Application> => {
        const response = await fetch(`${API_URL}/applications`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            throw new Error('Failed to create application');
        }
        return response.json();
    },

    update: async (id: string, data: Partial<ApplicationFormData>): Promise<Application> => {
        const response = await fetch(`${API_URL}/applications/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            throw new Error(`Failed to update application with id ${id}`);
        }
        return response.json();
    },

    delete: async (id: string): Promise<void> => {
        const response = await fetch(`${API_URL}/applications/${id}`, {
            method: 'DELETE',
        });
        if (!response.ok) {
            throw new Error(`Failed to delete application with id ${id}`);
        }
    },
};
