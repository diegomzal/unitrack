import { useState, useMemo } from 'react';
import {
    Typography,
    Container,
    Box,
    Fab,
    TextField,
    MenuItem,
    InputAdornment,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Avatar,
    Chip,
    Divider,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import SortIcon from '@mui/icons-material/Sort';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PeopleIcon from '@mui/icons-material/People';

import { useApplications } from '../hooks/useApplications';
import { useSharedApplications } from '../hooks/useSharedApplications';
import { APPLICATION_STATUSES, type Application, type ApplicationFormData } from '../types/application';
import ApplicationFormDialog from '../components/ApplicationFormDialog';
import ApplicationDetailsDialog from '../components/ApplicationDetailsDialog';
import ConfirmDeleteDialog from '../components/ConfirmDeleteDialog';
import EmptyState from '../components/EmptyState';
import { useSnackbar } from '../hooks/useSnackbar';
import ApplicationGrid from '../components/ApplicationGrid';
import ApplicationCardSkeleton from '../components/ApplicationCardSkeleton';
import SharedGroupSkeleton from '../components/SharedGroupSkeleton';

export default function ApplicationsView() {
    const {
        applications,
        loading,
        createApplication,
        updateApplication,
        deleteApplication,
    } = useApplications();

    const { sharedGroups, loading: sharedLoading } = useSharedApplications();

    // Derive unique university names for autocomplete
    const existingUniversities = useMemo(
        () => [...new Set(applications.map((a) => a.university).filter(Boolean))],
        [applications],
    );

    // Dialog state
    const [formOpen, setFormOpen] = useState(false);
    const [editingApp, setEditingApp] = useState<Application | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<Application | null>(null);
    const [detailsApp, setDetailsApp] = useState<Application | null>(null);
    const [detailsReadOnly, setDetailsReadOnly] = useState(false);

    // Filter / search state
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('All');
    const [sortOption, setSortOption] = useState<string>('newest');

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

    const handleOpenDetails = (app: Application) => {
        setDetailsReadOnly(false);
        setDetailsApp(app);
    };

    const handleOpenSharedDetails = (app: Application) => {
        setDetailsReadOnly(true);
        setDetailsApp(app);
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

    const handleDetailsSave = async (id: string, data: ApplicationFormData) => {
        try {
            await updateApplication(id, data);
            showSnackbar('Details updated successfully');
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

    // Filtering and Sorting
    const filteredApplications = applications.filter((app) => {
        const matchesSearch =
            searchQuery === '' ||
            app.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            app.university.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (app.country && app.country.toLowerCase().includes(searchQuery.toLowerCase()));

        const matchesStatus = statusFilter === 'All' || app.status === statusFilter;

        return matchesSearch && matchesStatus;
    }).sort((a, b) => {
        switch (sortOption) {
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

    const hasSharedContent = sharedGroups.length > 0;

    return (
        <>
            <Container maxWidth="lg" sx={{ flex: 1, py: 3, px: { xs: 2, sm: 3 } }}>
                {/* Stats Bar */}
                {!loading && applications.length > 0 && (
                    <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                            <strong>{applications.length}</strong> application{applications.length !== 1 ? 's' : ''} tracked
                        </Typography>
                    </Box>
                )}

                {/* Search and Filter — always visible so UI doesn't shift */}
                {(loading || applications.length > 0) && (
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
                            disabled={loading}
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
                            disabled={loading}
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
                        <TextField
                            select
                            size="small"
                            value={sortOption}
                            onChange={(e) => setSortOption(e.target.value)}
                            disabled={loading}
                            slotProps={{
                                input: {
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SortIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                                        </InputAdornment>
                                    ),
                                },
                            }}
                            sx={{ minWidth: 160 }}
                        >
                            <MenuItem value="newest">Newest first</MenuItem>
                            <MenuItem value="oldest">Oldest first</MenuItem>
                            <MenuItem value="title_asc">Title (A-Z)</MenuItem>
                            <MenuItem value="title_desc">Title (Z-A)</MenuItem>
                            <MenuItem value="university_asc">University (A-Z)</MenuItem>
                            <MenuItem value="university_desc">University (Z-A)</MenuItem>
                        </TextField>
                    </Box>
                )}

                {/* Content */}
                {loading ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                        <ApplicationCardSkeleton count={2} />
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
                        onOpenDetails={handleOpenDetails}
                    />
                )}

                {/* Shared With Me Section — always visible */}
                <Divider sx={{ my: 4 }} />
                <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PeopleIcon sx={{ color: 'primary.main' }} />
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        Shared with me
                    </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Read-only view of applications shared by others
                </Typography>

                {sharedLoading ? (
                    <SharedGroupSkeleton count={1} />
                ) : !hasSharedContent ? (
                    <Typography variant="body2" color="text.secondary" sx={{ py: 3, textAlign: 'center' }}>
                        No one is sharing their applications with you yet.
                    </Typography>
                ) : (
                    sharedGroups.map((group) => (
                        <Accordion
                            key={group.share._id}
                            defaultExpanded
                            sx={{
                                mb: 2,
                                bgcolor: 'background.paper',
                                borderRadius: 2,
                                '&:before': { display: 'none' },
                                border: '1px solid',
                                borderColor: 'divider',
                            }}
                        >
                            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                    <Avatar
                                        sx={{
                                            width: 32,
                                            height: 32,
                                            bgcolor: 'primary.main',
                                            fontSize: '0.875rem',
                                        }}
                                    >
                                        {(group.share.ownerName || group.share.ownerEmail).charAt(0).toUpperCase()}
                                    </Avatar>
                                    <Box>
                                        <Typography variant="subtitle1" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
                                            {group.share.ownerName || group.share.ownerEmail}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            {group.share.ownerEmail}
                                        </Typography>
                                    </Box>
                                    <Chip
                                        label={`${group.applications.length} app${group.applications.length !== 1 ? 's' : ''}`}
                                        size="small"
                                        sx={{ ml: 1 }}
                                    />
                                </Box>
                            </AccordionSummary>
                            <AccordionDetails>
                                {group.loading ? (
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                        <ApplicationCardSkeleton count={1} />
                                    </Box>
                                ) : group.applications.length === 0 ? (
                                    <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
                                        No applications shared
                                    </Typography>
                                ) : (
                                    <ApplicationGrid
                                        applications={group.applications}
                                        onOpenDetails={handleOpenSharedDetails}
                                        readOnly
                                    />
                                )}
                            </AccordionDetails>
                        </Accordion>
                    ))
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

            {/* Details Dialog (Events + Requirements) */}
            <ApplicationDetailsDialog
                open={detailsApp !== null}
                application={detailsApp}
                onClose={() => setDetailsApp(null)}
                onSave={detailsReadOnly ? undefined : handleDetailsSave}
                readOnly={detailsReadOnly}
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
