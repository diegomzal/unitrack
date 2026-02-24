import { useState, useEffect, useCallback } from 'react';
import type { Application, ApplicationFormData } from '../types/application';
import { applicationService } from '../services/applicationService';

interface UseApplicationsReturn {
    applications: Application[];
    loading: boolean;
    error: string | null;
    createApplication: (data: ApplicationFormData) => Promise<void>;
    updateApplication: (id: string, data: ApplicationFormData) => Promise<void>;
    deleteApplication: (id: string) => Promise<void>;
    refresh: () => Promise<void>;
}

export const useApplications = (): UseApplicationsReturn => {
    const [applications, setApplications] = useState<Application[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchApplications = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await applicationService.getAll();
            setApplications(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch applications');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchApplications();
    }, [fetchApplications]);

    const createApplication = useCallback(async (data: ApplicationFormData) => {
        const newApp = await applicationService.create(data);
        setApplications((prev) => [...prev, newApp]);
    }, []);

    const updateApplication = useCallback(async (id: string, data: ApplicationFormData) => {
        const updated = await applicationService.update(id, data);
        setApplications((prev) => prev.map((app) => (app._id === id ? updated : app)));
    }, []);

    const deleteApplication = useCallback(async (id: string) => {
        await applicationService.delete(id);
        setApplications((prev) => prev.filter((app) => app._id !== id));
    }, []);

    return {
        applications,
        loading,
        error,
        createApplication,
        updateApplication,
        deleteApplication,
        refresh: fetchApplications,
    };
};
