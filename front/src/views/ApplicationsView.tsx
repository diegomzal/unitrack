import { useReducer, useMemo, useCallback } from 'react';
import {
    Typography,
    Container,
    Box,
    Fab,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

import { useApplications } from '../hooks/useApplications';
import { useUniversities } from '../hooks/useUniversities';
import { useSharedApplications } from '../hooks/useSharedApplications';
import type { ApplicationFormData } from '../types/application';
import type { UniversityFormData } from '../types/university';
import { EMPTY_UNIVERSITY_FORM_DATA } from '../types/university';
import ApplicationFormDialog from '../components/ApplicationFormDialog';
import ApplicationDetailsDialog from '../components/ApplicationDetailsDialog';
import UniversityDetailsDialog from '../components/UniversityDetailsDialog';
import UniversityFormDialog from '../components/UniversityFormDialog';
import ConfirmDeleteDialog from '../components/ConfirmDeleteDialog';
import EmptyState from '../components/EmptyState';
import { useSnackbar } from '../hooks/useSnackbar';
import ApplicationGrid from '../components/ApplicationGrid';
import ApplicationCardSkeleton from '../components/ApplicationCardSkeleton';
import ApplicationsFilterBar from '../components/applications/ApplicationsFilterBar';
import SharedWithMeSection from '../components/applications/SharedWithMeSection';

import { viewReducer, initialViewState } from '../reducers/applicationsReducer';

export default function ApplicationsView() {
    const {
        applications,
        loading,
        createApplication,
        updateApplication,
        deleteApplication,
        refresh: refreshApplications,
    } = useApplications();

    const {
        universities,
        loading: uniLoading,
        createUniversity,
        updateUniversity,
    } = useUniversities();

    const { sharedGroups, loading: sharedLoading } = useSharedApplications();

    const [state, dispatch] = useReducer(viewReducer, initialViewState);

    // Derive unique university names for autocomplete
    const existingUniversities = useMemo(
        () => [...new Set(applications.map((a) => a.university).filter(Boolean))],
        [applications],
    );

    // Snackbar state
    const { showSnackbar, SnackbarComponent } = useSnackbar();

    // Auto-create university if needed, returns university ID
    const ensureUniversity = useCallback(async (data: ApplicationFormData): Promise<string | undefined> => {
        // If already linked to an existing university, keep it
        if (data.universityId) return data.universityId;

        // If university name is empty, no linking
        if (!data.university.trim()) return undefined;

        // Check if a university with same name already exists
        const existing = universities.find(
            (u) => u.name.toLowerCase() === data.university.trim().toLowerCase(),
        );
        if (existing) return existing._id;

        // Create a new university
        try {
            const newUni = await createUniversity({
                ...EMPTY_UNIVERSITY_FORM_DATA,
                name: data.university.trim(),
                country: data.country || '',
            });
            return newUni._id;
        } catch {
            // If university creation fails, still save the application without linking
            console.error('Failed to auto-create university');
            return undefined;
        }
    }, [universities, createUniversity]);

    // Handlers
    const handleSave = async (data: ApplicationFormData) => {
        try {
            const universityId = await ensureUniversity(data);
            const enrichedData = { ...data, universityId };

            if (state.editingApp) {
                await updateApplication(state.editingApp._id, enrichedData);
                showSnackbar('Application updated successfully');
            } else {
                await createApplication(enrichedData);
                showSnackbar('Application created successfully');
            }
        } catch {
            showSnackbar('Something went wrong', 'error');
            throw new Error('Save failed');
        }
    };

    const handleDetailsSave = async (id: string, data: ApplicationFormData) => {
        try {
            await updateApplication(id, data);
            showSnackbar('Details updated successfully');
        } catch {
            showSnackbar('Something went wrong', 'error');
            throw new Error('Save failed');
        }
    };

    const handleUniDetailsSave = async (id: string, data: Partial<UniversityFormData>) => {
        try {
            await updateUniversity(id, data);
            showSnackbar('University details updated');
        } catch {
            showSnackbar('Something went wrong', 'error');
            throw new Error('Save failed');
        }
    };

    const handleEditUniSave = async (id: string, data: Partial<UniversityFormData>) => {
        try {
            await updateUniversity(id, data);
            // Refresh applications to reflect cascaded name/country changes
            await refreshApplications();
            showSnackbar('University updated successfully');
        } catch {
            showSnackbar('Something went wrong', 'error');
            throw new Error('Save failed');
        }
    };

    const handleDeleteRequest = (id: string) => {
        const app = applications.find((a) => a._id === id);
        if (app) dispatch({ type: 'OPEN_DELETE_REQUEST', payload: app });
    };

    const handleConfirmDelete = async () => {
        if (!state.deleteTarget) return;
        try {
            await deleteApplication(state.deleteTarget._id);
            showSnackbar('Application deleted');
            dispatch({ type: 'CLOSE_DELETE_REQUEST' });
        } catch {
            showSnackbar('Failed to delete', 'error');
        }
    };

    // Filtering and Sorting
    const filteredApplications = useMemo(() => {
        return applications
            .filter((app) => {
                const searchStr = state.searchQuery.toLowerCase();
                const matchesSearch =
                    searchStr === '' ||
                    app.title.toLowerCase().includes(searchStr) ||
                    app.university.toLowerCase().includes(searchStr) ||
                    (app.country && app.country.toLowerCase().includes(searchStr));

                const matchesStatus =
                    state.statusFilter === 'All' || app.status === state.statusFilter;

                return matchesSearch && matchesStatus;
            })
            .sort((a, b) => {
                switch (state.sortOption) {
                    case 'newest':
                        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                    case 'oldest':
                        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
                    case 'title_asc':
                        return a.title.localeCompare(b.title);
                    case 'title_desc':
                        return b.title.localeCompare(a.title);
                    case 'university_asc':
                        return a.university.localeCompare(b.university);
                    case 'university_desc':
                        return b.university.localeCompare(a.university);
                    default:
                        return 0;
                }
            });
    }, [applications, state.searchQuery, state.statusFilter, state.sortOption]);

    const isLoading = loading || uniLoading;

    return (
        <>
            <Container maxWidth="lg" sx={{ flex: 1, py: 3, px: { xs: 2, sm: 3 } }}>
                {/* Stats Bar */}
                {!isLoading && applications.length > 0 && (
                    <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                            <strong>{applications.length}</strong> application{applications.length !== 1 ? 's' : ''} tracked
                            {universities.length > 0 && (
                                <> across <strong>{universities.length}</strong> universit{universities.length !== 1 ? 'ies' : 'y'}</>
                            )}
                        </Typography>
                    </Box>
                )}

                {/* Search and Filter */}
                {(isLoading || applications.length > 0) && (
                    <ApplicationsFilterBar
                        searchQuery={state.searchQuery}
                        onSearchChange={(val) => dispatch({ type: 'SET_SEARCH_QUERY', payload: val })}
                        statusFilter={state.statusFilter}
                        onStatusChange={(val) => dispatch({ type: 'SET_STATUS_FILTER', payload: val })}
                        sortOption={state.sortOption}
                        onSortChange={(val) => dispatch({ type: 'SET_SORT_OPTION', payload: val })}
                        disabled={isLoading}
                    />
                )}

                {/* Content */}
                {isLoading ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                        <ApplicationCardSkeleton count={2} />
                    </Box>
                ) : applications.length === 0 ? (
                    <EmptyState onAdd={() => dispatch({ type: 'OPEN_CREATE' })} />
                ) : filteredApplications.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 8 }}>
                        <Typography variant="h6" color="text.secondary">
                            No results found
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            Try adjusting your search or filter.
                        </Typography>
                    </Box>
                ) : (
                    <ApplicationGrid
                        applications={filteredApplications}
                        universities={universities}
                        onEdit={(app) => dispatch({ type: 'OPEN_EDIT', payload: app })}
                        onDelete={handleDeleteRequest}
                        onOpenDetails={(app) => dispatch({ type: 'OPEN_DETAILS', payload: app, readOnly: false })}
                        onOpenUniDetails={(uni) => dispatch({ type: 'OPEN_UNI_DETAILS', payload: uni })}
                        onEditUni={(uni) => dispatch({ type: 'OPEN_EDIT_UNI', payload: uni })}
                    />
                )}

                {/* Shared With Me Section */}
                <SharedWithMeSection
                    sharedGroups={sharedGroups}
                    loading={sharedLoading}
                    onOpenDetails={(app) => dispatch({ type: 'OPEN_DETAILS', payload: app, readOnly: true })}
                />
            </Container>

            {/* FAB */}
            {applications.length > 0 && (
                <Fab
                    color="primary"
                    aria-label="add application"
                    onClick={() => dispatch({ type: 'OPEN_CREATE' })}
                    sx={{
                        position: 'fixed',
                        bottom: { xs: 24, sm: 32 },
                        right: { xs: 24, sm: 32 },
                        background: 'linear-gradient(135deg, #3B82F6, #2563EB)',
                        '&:hover': {
                            background: 'linear-gradient(135deg, #60A5FA, #3B82F6)',
                        },
                    }}
                >
                    <AddIcon />
                </Fab>
            )}

            {/* Form Dialog */}
            <ApplicationFormDialog
                open={state.formOpen}
                application={state.editingApp}
                existingUniversities={existingUniversities}
                universities={universities}
                onClose={() => dispatch({ type: 'CLOSE_FORM' })}
                onSave={handleSave}
            />

            {/* Details Dialog (Events + Requirements) */}
            <ApplicationDetailsDialog
                open={state.detailsApp !== null}
                application={state.detailsApp}
                onClose={() => dispatch({ type: 'CLOSE_DETAILS' })}
                onSave={state.detailsReadOnly ? undefined : handleDetailsSave}
                readOnly={state.detailsReadOnly}
            />

            {/* University Details Dialog */}
            <UniversityDetailsDialog
                open={state.uniDetailsTarget !== null}
                university={state.uniDetailsTarget}
                onClose={() => dispatch({ type: 'CLOSE_UNI_DETAILS' })}
                onSave={handleUniDetailsSave}
            />

            {/* Delete Confirmation */}
            <ConfirmDeleteDialog
                open={state.deleteTarget !== null}
                applicationTitle={state.deleteTarget?.title ?? ''}
                onClose={() => dispatch({ type: 'CLOSE_DELETE_REQUEST' })}
                onConfirm={handleConfirmDelete}
            />

            {/* University Edit Dialog */}
            {state.editingUni && (
                <UniversityFormDialog
                    open={state.editingUni !== null}
                    university={state.editingUni}
                    onClose={() => dispatch({ type: 'CLOSE_EDIT_UNI' })}
                    onSave={handleEditUniSave}
                />
            )}

            {/* Snackbar */}
            {SnackbarComponent}
        </>
    );
}
