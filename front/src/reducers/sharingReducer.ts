import { type Share } from '../services/sharingService';

interface SharingState {
    shares: Share[];
    sharesLoading: boolean;
    invitations: Share[];
    invitationsLoading: boolean;
    receivedShares: Share[];
    receivedLoading: boolean;
}

export const initialSharingState: SharingState = {
    shares: [],
    sharesLoading: true,
    invitations: [],
    invitationsLoading: true,
    receivedShares: [],
    receivedLoading: true,
};

type SharingAction =
    | { type: 'FETCH_START'; payload: 'shares' | 'invitations' | 'received' }
    | { type: 'FETCH_SUCCESS'; payload: { kind: 'shares' | 'invitations' | 'received'; data: Share[] } }
    | { type: 'FETCH_ERROR'; payload: 'shares' | 'invitations' | 'received' };

export function sharingReducer(state: SharingState, action: SharingAction): SharingState {
    switch (action.type) {
        case 'FETCH_START':
            switch (action.payload) {
                case 'shares': return { ...state, sharesLoading: true };
                case 'invitations': return { ...state, invitationsLoading: true };
                case 'received': return { ...state, receivedLoading: true };
                default: return state;
            }
        case 'FETCH_SUCCESS':
            switch (action.payload.kind) {
                case 'shares': return { ...state, shares: action.payload.data, sharesLoading: false };
                case 'invitations': return { ...state, invitations: action.payload.data, invitationsLoading: false };
                case 'received': return { ...state, receivedShares: action.payload.data, receivedLoading: false };
                default: return state;
            }
        case 'FETCH_ERROR':
            switch (action.payload) {
                case 'shares': return { ...state, sharesLoading: false };
                case 'invitations': return { ...state, invitationsLoading: false };
                case 'received': return { ...state, receivedLoading: false };
                default: return state;
            }
        default:
            return state;
    }
}
