import { useState, useEffect, useCallback } from 'react';
import type { University, UniversityFormData } from '../types/university';
import { universityService } from '../services/universityService';

interface UseUniversitiesReturn {
    universities: University[];
    loading: boolean;
    error: string | null;
    createUniversity: (data: UniversityFormData) => Promise<University>;
    updateUniversity: (id: string, data: Partial<UniversityFormData>) => Promise<void>;
    deleteUniversity: (id: string) => Promise<void>;
    refresh: () => Promise<void>;
}

export const useUniversities = (): UseUniversitiesReturn => {
    const [universities, setUniversities] = useState<University[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchUniversities = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await universityService.getAll();
            setUniversities(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch universities');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUniversities();
    }, [fetchUniversities]);

    const createUniversity = useCallback(async (data: UniversityFormData): Promise<University> => {
        const newUni = await universityService.create(data);
        setUniversities((prev) => [...prev, newUni]);
        return newUni;
    }, []);

    const updateUniversity = useCallback(async (id: string, data: Partial<UniversityFormData>) => {
        const updated = await universityService.update(id, data);
        setUniversities((prev) => prev.map((uni) => (uni._id === id ? updated : uni)));
    }, []);

    const deleteUniversity = useCallback(async (id: string) => {
        await universityService.delete(id);
        setUniversities((prev) => prev.filter((uni) => uni._id !== id));
    }, []);

    return {
        universities,
        loading,
        error,
        createUniversity,
        updateUniversity,
        deleteUniversity,
        refresh: fetchUniversities,
    };
};
