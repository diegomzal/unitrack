import {
    Box,
    Typography,
    Divider,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Avatar,
    Chip,
} from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import type { Application } from '../../types/application';
import type { SharedGroup } from '../../hooks/useSharedApplications';
import ApplicationGrid from '../ApplicationGrid';
import SharedGroupSkeleton from '../SharedGroupSkeleton';
import ApplicationCardSkeleton from '../ApplicationCardSkeleton';

interface SharedWithMeSectionProps {
    sharedGroups: SharedGroup[];
    loading: boolean;
    onOpenDetails: (app: Application) => void;
}

export default function SharedWithMeSection({
    sharedGroups,
    loading,
    onOpenDetails,
}: SharedWithMeSectionProps) {
    const hasSharedContent = sharedGroups.length > 0;

    return (
        <>
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

            {loading ? (
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
                                    onOpenDetails={onOpenDetails}
                                    readOnly
                                />
                            )}
                        </AccordionDetails>
                    </Accordion>
                ))
            )}
        </>
    );
}
