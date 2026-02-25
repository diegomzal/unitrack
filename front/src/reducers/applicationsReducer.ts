import type { Application } from '../types/application';

type ViewState = {
    formOpen: boolean;
    editingApp: Application | null;
    deleteTarget: Application | null;
    detailsApp: Application | null;
    detailsReadOnly: boolean;
    searchQuery: string;
    statusFilter: string;
    sortOption: string;
};

type ViewAction =
    | { type: 'OPEN_CREATE' }
    | { type: 'OPEN_EDIT'; payload: Application }
    | { type: 'CLOSE_FORM' }
    | { type: 'OPEN_DETAILS'; payload: Application; readOnly?: boolean }
    | { type: 'CLOSE_DETAILS' }
    | { type: 'OPEN_DELETE_REQUEST'; payload: Application }
    | { type: 'CLOSE_DELETE_REQUEST' }
    | { type: 'SET_SEARCH_QUERY'; payload: string }
    | { type: 'SET_STATUS_FILTER'; payload: string }
    | { type: 'SET_SORT_OPTION'; payload: string };

export const initialViewState: ViewState = {
    formOpen: false,
    editingApp: null,
    deleteTarget: null,
    detailsApp: null,
    detailsReadOnly: false,
    searchQuery: '',
    statusFilter: 'All',
    sortOption: 'newest',
};

export function viewReducer(state: ViewState, action: ViewAction): ViewState {
    switch (action.type) {
        case 'OPEN_CREATE':
            return { ...state, editingApp: null, formOpen: true };
        case 'OPEN_EDIT':
            return { ...state, editingApp: action.payload, formOpen: true };
        case 'CLOSE_FORM':
            return { ...state, formOpen: false };
        case 'OPEN_DETAILS':
            return { ...state, detailsApp: action.payload, detailsReadOnly: action.readOnly ?? false };
        case 'CLOSE_DETAILS':
            return { ...state, detailsApp: null, detailsReadOnly: false };
        case 'OPEN_DELETE_REQUEST':
            return { ...state, deleteTarget: action.payload };
        case 'CLOSE_DELETE_REQUEST':
            return { ...state, deleteTarget: null };
        case 'SET_SEARCH_QUERY':
            return { ...state, searchQuery: action.payload };
        case 'SET_STATUS_FILTER':
            return { ...state, statusFilter: action.payload };
        case 'SET_SORT_OPTION':
            return { ...state, sortOption: action.payload };
        default:
            return state;
    }
}
