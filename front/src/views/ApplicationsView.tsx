import { useState, useMemo } from 'react';
import {
    Typography,
    Container,
    Box,
    Fab,
    TextField,
    MenuItem,
    InputAdornment,
    CircularProgress,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';

import { useApplications } from '../hooks/useApplications';
import { APPLICATION_STATUSES, type Application, type ApplicationFormData } from '../types/application';
import ApplicationFormDialog from '../components/ApplicationFormDialog';
import ConfirmDeleteDialog from '../components/ConfirmDeleteDialog';
import EmptyState from '../components/EmptyState';
import { useSnackbar } from '../hooks/useSnackbar';
import ApplicationGrid from '../components/ApplicationGrid';

export default function ApplicationsView() {
    const {
        applications,
        loading,
        createApplication,
        updateApplication,
        deleteApplication,
    } = useApplications();

    // Derive unique university names for autocomplete
    const existingUniversities = useMemo(
        () => [...new Set(applications.map((a) => a.university).filter(Boolean))],
        [applications],
    );

    // Dialog state
    const [formOpen, setFormOpen] = useState(false);
    const [editingApp, setEditingApp] = useState<Application | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<Application | null>(null);

    // Filter / search state
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('All');

    // Snackbar state
    const { showSnackbar, SnackbarComponent } = useSnackbar();

    // Handlers
    const handleOpenCreate = () => {
        setEditingApp(null);
        setFormOpen(true);
    };

    const handleOpenEdit = (app: Application) => {
        setEditingApp(app);
        setFormOpen(true);
    };

    const handleSave = async (data: ApplicationFormData) => {
        try {
            if (editingApp) {
                await updateApplication(editingApp._id, data);
                showSnackbar('Application updated successfully');
            } else {
                await createApplication(data);
                showSnackbar('Application created successfully');
            }
        } catch {
            showSnackbar('Something went wrong', 'error');
            throw new Error('Save failed');
        }
    };

    const handleDeleteRequest = (id: string) => {
        const app = applications.find((a) => a._id === id);
        if (app) setDeleteTarget(app);
    };

    const handleConfirmDelete = async () => {
        if (!deleteTarget) return;
        try {
            await deleteApplication(deleteTarget._id);
            showSnackbar('Application deleted');
        } catch {
            showSnackbar('Failed to delete', 'error');
        } finally {
            setDeleteTarget(null);
        }
    };

    // Filtering
    const filteredApplications = applications.filter((app) => {
        const matchesSearch =
            searchQuery === '' ||
            app.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            app.university.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (app.country && app.country.toLowerCase().includes(searchQuery.toLowerCase()));

        const matchesStatus = statusFilter === 'All' || app.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    return (
        <>
            <Container maxWidth="lg" sx={{ flex: 1, py: 3, px: { xs: 2, sm: 3 } }}>
                {/* Stats Bar */}
                {applications.length > 0 && (
                    <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                            <strong>{applications.length}</strong> application{applications.length !== 1 ? 's' : ''} tracked
                        </Typography>
                    </Box>
                )}

                {/* Search and Filter */}
                {applications.length > 0 && (
                    <Box
                        sx={{
                            display: 'flex',
                            gap: 1.5,
                            mb: 3,
                            flexDirection: { xs: 'column', sm: 'row' },
                        }}
                    >
                        <TextField
                            fullWidth
                            size="small"
                            placeholder="Search programs, universities..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            slotProps={{
                                input: {
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                                        </InputAdornment>
                                    ),
                                },
                            }}
                            sx={{ flexGrow: 1 }}
                        />
                        <TextField
                            select
                            size="small"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            slotProps={{
                                input: {
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <FilterListIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                                        </InputAdornment>
                                    ),
                                },
                            }}
                            sx={{ minWidth: 160 }}
                        >
                            <MenuItem value="All">All statuses</MenuItem>
                            {APPLICATION_STATUSES.map((status) => (
                                <MenuItem key={status} value={status}>
                                    {status}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Box>
                )}

                {/* Content */}
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
                        <CircularProgress />
                    </Box>
                ) : applications.length === 0 ? (
                    <EmptyState onAdd={handleOpenCreate} />
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
                        onEdit={handleOpenEdit}
                        onDelete={handleDeleteRequest}
                    />
                )}
            </Container>

            {/* FAB */}
            {applications.length > 0 && (
                <Fab
                    color="primary"
                    aria-label="add application"
                    onClick={handleOpenCreate}
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
                open={formOpen}
                application={editingApp}
                existingUniversities={existingUniversities}
                onClose={() => setFormOpen(false)}
                onSave={handleSave}
            />

            {/* Delete Confirmation */}
            <ConfirmDeleteDialog
                open={deleteTarget !== null}
                applicationTitle={deleteTarget?.title ?? ''}
                onClose={() => setDeleteTarget(null)}
                onConfirm={handleConfirmDelete}
            />

            {/* Snackbar */}
            {SnackbarComponent}
        </>
    );
}
