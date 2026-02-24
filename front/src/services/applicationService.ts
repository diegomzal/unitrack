import type { Application, ApplicationFormData } from '../types/application';

const STORAGE_KEY = 'unitrack_applications';

// Temporary local storage based service until backend API is ready
// TODO: Replace with actual API calls to the Express backend

const generateId = (): string => {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

const getStoredApplications = (): Application[] => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch {
        return [];
    }
};

const saveApplications = (applications: Application[]): void => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(applications));
};

export const applicationService = {
    getAll: async (): Promise<Application[]> => {
        return getStoredApplications();
    },

    getById: async (id: string): Promise<Application | undefined> => {
        const applications = getStoredApplications();
        return applications.find((app) => app._id === id);
    },

    create: async (data: ApplicationFormData): Promise<Application> => {
        const applications = getStoredApplications();
        const now = new Date().toISOString();
        const newApplication: Application = {
            _id: generateId(),
            userId: 'local-user',
            ...data,
            createdAt: now,
            updatedAt: now,
        };
        applications.push(newApplication);
        saveApplications(applications);
        return newApplication;
    },

    update: async (id: string, data: ApplicationFormData): Promise<Application> => {
        const applications = getStoredApplications();
        const index = applications.findIndex((app) => app._id === id);
        if (index === -1) {
            throw new Error(`Application with id ${id} not found`);
        }
        const updated: Application = {
            ...applications[index],
            ...data,
            updatedAt: new Date().toISOString(),
        };
        applications[index] = updated;
        saveApplications(applications);
        return updated;
    },

    delete: async (id: string): Promise<void> => {
        const applications = getStoredApplications();
        const filtered = applications.filter((app) => app._id !== id);
        if (filtered.length === applications.length) {
            throw new Error(`Application with id ${id} not found`);
        }
        saveApplications(filtered);
    },
};
