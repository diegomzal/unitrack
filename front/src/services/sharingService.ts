import { auth } from '../config/firebase';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const getAuthHeaders = async (): Promise<HeadersInit> => {
    const user = auth.currentUser;
    if (!user) throw new Error('Not authenticated');
    const token = await user.getIdToken();
    return {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
    };
};

export interface UserSearchResult {
    uid: string;
    email: string;
    displayName: string;
    photoURL: string;
}

type ShareStatus = 'pending' | 'accepted' | 'rejected';

export interface Share {
    _id: string;
    ownerId: string;
    ownerEmail: string;
    ownerName: string;
    sharedWithId: string;
    sharedWithEmail: string;
    sharedWithName: string;
    shareAll: boolean;
    applicationIds: string[];
    status: ShareStatus;
    createdAt: string;
    updatedAt: string;
}

export const userService = {
    /** Ensure user profile exists in Firestore */
    ensureProfile: async (): Promise<void> => {
        const headers = await getAuthHeaders();
        await fetch(`${API_URL}/users/me`, { method: 'POST', headers });
    },

    /** Search users by exact email for sharing */
    searchByEmail: async (email: string): Promise<UserSearchResult[]> => {
        const headers = await getAuthHeaders();
        const response = await fetch(
            `${API_URL}/users/search?email=${encodeURIComponent(email)}`,
            { headers },
        );
        if (!response.ok) throw new Error('Failed to search users');
        return response.json();
    },
};

export const shareService = {
    /** Get shares I created (people I'm sharing with) — includes pending and accepted */
    getMyShares: async (): Promise<Share[]> => {
        const headers = await getAuthHeaders();
        const response = await fetch(`${API_URL}/shares`, { headers });
        if (!response.ok) throw new Error('Failed to fetch shares');
        return response.json();
    },

    /** Get accepted shares where others share with me */
    getSharedWithMe: async (): Promise<Share[]> => {
        const headers = await getAuthHeaders();
        const response = await fetch(`${API_URL}/shares/with-me`, { headers });
        if (!response.ok) throw new Error('Failed to fetch shared items');
        return response.json();
    },

    /** Get pending invitations addressed to me */
    getInvitations: async (): Promise<Share[]> => {
        const headers = await getAuthHeaders();
        const response = await fetch(`${API_URL}/shares/invitations`, { headers });
        if (!response.ok) throw new Error('Failed to fetch invitations');
        return response.json();
    },

    /** Respond to a share invitation */
    respondToShare: async (id: string, action: 'accept' | 'reject'): Promise<void> => {
        const headers = await getAuthHeaders();
        const response = await fetch(`${API_URL}/shares/${id}/respond`, {
            method: 'PUT',
            headers,
            body: JSON.stringify({ action }),
        });
        if (!response.ok) {
            const err = await response.json().catch(() => ({ error: 'Failed to respond' }));
            throw new Error(err.error);
        }
    },

    /** Create a new share invitation */
    createShare: async (data: {
        sharedWithId: string;
        sharedWithEmail: string;
        sharedWithName: string;
        shareAll?: boolean;
        applicationIds?: string[];
    }): Promise<Share> => {
        const headers = await getAuthHeaders();
        const response = await fetch(`${API_URL}/shares`, {
            method: 'POST',
            headers,
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            const err = await response.json().catch(() => ({ error: 'Failed to create share' }));
            throw new Error(err.error);
        }
        return response.json();
    },

    /** Update share settings */
    updateShare: async (id: string, data: {
        shareAll?: boolean;
        applicationIds?: string[];
    }): Promise<Share> => {
        const headers = await getAuthHeaders();
        const response = await fetch(`${API_URL}/shares/${id}`, {
            method: 'PUT',
            headers,
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Failed to update share');
        return response.json();
    },

    /** Delete a share */
    deleteShare: async (id: string): Promise<void> => {
        const headers = await getAuthHeaders();
        const response = await fetch(`${API_URL}/shares/${id}`, {
            method: 'DELETE',
            headers,
        });
        if (!response.ok) throw new Error('Failed to delete share');
    },

    /** Get applications shared from a specific share */
    getSharedApplications: async (shareId: string) => {
        const headers = await getAuthHeaders();
        const response = await fetch(`${API_URL}/shares/${shareId}/applications`, { headers });
        if (!response.ok) throw new Error('Failed to fetch shared applications');
        return response.json();
    },
};
