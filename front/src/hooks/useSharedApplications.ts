import { useState, useEffect, useCallback } from 'react';
import { shareService, type Share } from '../services/sharingService';
import type { Application } from '../types/application';

export interface SharedGroup {
    share: Share;
    applications: Application[];
    loading: boolean;
}

/**
 * Hook to load applications shared with the current user.
 * Returns grouped data by owner, plus a flat list of all shared applications.
 */
export function useSharedApplications() {
    const [sharedGroups, setSharedGroups] = useState<SharedGroup[]>([]);
    const [loading, setLoading] = useState(true);

    const loadSharedApplications = useCallback(async () => {
        setLoading(true);
        try {
            const shares = await shareService.getSharedWithMe();
            setSharedGroups(shares.map(share => ({ share, applications: [], loading: true })));

            const groups = await Promise.all(
                shares.map(async (share) => {
                    try {
                        const apps = await shareService.getSharedApplications(share._id);
                        return { share, applications: apps, loading: false };
                    } catch {
                        return { share, applications: [], loading: false };
                    }
                }),
            );
            setSharedGroups(groups);
        } catch (error) {
            console.error('Failed to load shared items:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadSharedApplications();
    }, [loadSharedApplications]);

    // Flat list of all shared applications (useful for calendar)
    const allSharedApplications: Application[] = sharedGroups.flatMap(g => g.applications);

    return { sharedGroups, allSharedApplications, loading, reload: loadSharedApplications };
}
