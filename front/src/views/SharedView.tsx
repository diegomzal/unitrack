import { useState, useEffect, useCallback } from 'react';
import {
    Container,
    Box,
    Typography,
    CircularProgress,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Avatar,
    Chip,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PeopleIcon from '@mui/icons-material/People';
import { shareService, type Share } from '../services/sharingService';
import type { Application } from '../types/application';
import ApplicationGrid from '../components/ApplicationGrid';
import ApplicationDetailsDialog from '../components/ApplicationDetailsDialog';

interface OwnerGroup {
    share: Share;
    applications: Application[];
    loading: boolean;
}

export default function SharedView() {
    const [ownerGroups, setOwnerGroups] = useState<OwnerGroup[]>([]);
    const [loading, setLoading] = useState(true);
    const [detailsApp, setDetailsApp] = useState<Application | null>(null);

    const loadShares = useCallback(async () => {
        try {
            const shares = await shareService.getSharedWithMe();
            setOwnerGroups(shares.map(share => ({ share, applications: [], loading: true })));

            // Load applications for each share
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
            setOwnerGroups(groups);
        } catch (error) {
            console.error('Failed to load shared items:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadShares();
    }, [loadShares]);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (ownerGroups.length === 0) {
        return (
            <Container maxWidth="lg" sx={{ py: 6, textAlign: 'center' }}>
                <PeopleIcon sx={{ fontSize: 64, color: 'text.secondary', opacity: 0.4, mb: 2 }} />
                <Typography variant="h6" color="text.secondary">
                    No shared applications yet
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    When someone shares their applications with you, they'll appear here.
                </Typography>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ flex: 1, py: 3, px: { xs: 2, sm: 3 } }}>
            <Box sx={{ mb: 3 }}>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    Shared with me
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    Read-only view of applications shared by others
                </Typography>
            </Box>

            {ownerGroups.map((group) => (
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
                            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                                <CircularProgress size={28} />
                            </Box>
                        ) : group.applications.length === 0 ? (
                            <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
                                No applications shared
                            </Typography>
                        ) : (
                            <ApplicationGrid
                                applications={group.applications}
                                onOpenDetails={(app) => setDetailsApp(app)}
                                readOnly
                            />
                        )}
                    </AccordionDetails>
                </Accordion>
            ))}

            {/* Read-only details dialog */}
            <ApplicationDetailsDialog
                open={detailsApp !== null}
                application={detailsApp}
                onClose={() => setDetailsApp(null)}
                readOnly
            />
        </Container>
    );
}
