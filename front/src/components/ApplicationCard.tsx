import {
    Card,
    Typography,
    IconButton,
    Box,
    Tooltip,
    Link,
    Collapse,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PublicIcon from '@mui/icons-material/Public';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LinkIcon from '@mui/icons-material/Link';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SchoolIcon from '@mui/icons-material/School';
import { useState } from 'react';
import type { Application } from '../types/application';
import StatusChip from './StatusChip';
import { getCountryByCode } from '../data/countries';

interface ApplicationCardProps {
    application: Application;
    onEdit: (application: Application) => void;
    onDelete: (id: string) => void;
}

const ApplicationCard: React.FC<ApplicationCardProps> = ({ application, onEdit, onDelete }) => {
    const [expanded, setExpanded] = useState(false);

    const country = application.country ? getCountryByCode(application.country) : null;

    const durationLabel = (() => {
        const raw = application.duration as number | string | null | undefined;
        if (raw === null || raw === undefined || raw === '') return null;
        if (typeof raw === 'number') {
            return `${raw} year${raw !== 1 ? 's' : ''}`;
        }
        // Backward compat: old string data (e.g. "2 years")
        const num = parseInt(String(raw), 10);
        if (!isNaN(num)) return `${num} year${num !== 1 ? 's' : ''}`;
        return String(raw);
    })();

    return (
        <Card sx={{
            transition: 'box-shadow 0.2s, transform 0.2s',
            '&:hover': {
                boxShadow: (theme) => theme.shadows[4],
                transform: 'translateY(-2px)'
            }
        }}>
            <Box sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                alignItems: { xs: 'stretch', sm: 'center' },
                p: 2,
                gap: 2,
            }}>
                {/* Left side: Main Info */}
                <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5, flexWrap: 'wrap' }}>
                        <Typography
                            variant="h6"
                            sx={{
                                fontSize: { xs: '1rem', sm: '1.15rem' },
                                lineHeight: 1.3,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: { xs: 'normal', sm: 'nowrap' },
                                display: { xs: '-webkit-box', sm: 'block' },
                                WebkitLineClamp: { xs: 2, sm: 'unset' },
                                WebkitBoxOrient: { xs: 'vertical', sm: 'unset' },
                            }}
                        >
                            {application.title}
                        </Typography>
                        <StatusChip status={application.status} />
                    </Box>

                    <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 2, mt: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <SchoolIcon sx={{ fontSize: 16, color: 'primary.light' }} />
                            <Typography variant="body2" color="text.secondary" fontWeight={500}>
                                {application.university}
                            </Typography>
                        </Box>

                        {country && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <Typography component="span" sx={{ fontSize: '1rem', lineHeight: 1 }}>
                                    {country.flag}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    {country.name}
                                </Typography>
                            </Box>
                        )}

                        {/* Fallback for old data with location instead of country code */}
                        {!country && application.country && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <PublicIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                                <Typography variant="caption" color="text.secondary">
                                    {application.country}
                                </Typography>
                            </Box>
                        )}

                        {durationLabel && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <AccessTimeIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                                <Typography variant="caption" color="text.secondary">
                                    {durationLabel}
                                </Typography>
                            </Box>
                        )}

                        {application.links.length > 0 && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <LinkIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                                <Typography variant="caption" color="text.secondary">
                                    {application.links.length} link{application.links.length > 1 ? 's' : ''}
                                </Typography>
                            </Box>
                        )}
                    </Box>
                </Box>

                {/* Right side: Actions */}
                <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: { xs: 'space-between', sm: 'flex-end' },
                    gap: 1,
                    mt: { xs: 1, sm: 0 },
                    pt: { xs: 1.5, sm: 0 },
                    borderTop: { xs: '1px solid', sm: 'none' },
                    borderColor: 'divider',
                    minWidth: { sm: '140px' }
                }}>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <Tooltip title="Edit">
                            <IconButton
                                size="small"
                                onClick={() => onEdit(application)}
                                sx={{ color: 'primary.light', bgcolor: 'primary.50', '&:hover': { bgcolor: 'primary.100' } }}
                            >
                                <EditIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                            <IconButton
                                size="small"
                                onClick={() => onDelete(application._id)}
                                sx={{ color: 'error.main', bgcolor: 'error.50', '&:hover': { bgcolor: 'error.100' } }}
                            >
                                <DeleteIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    </Box>
                    <IconButton
                        size="small"
                        onClick={() => setExpanded(!expanded)}
                        aria-label={expanded ? 'show less' : 'show more'}
                        sx={{
                            color: 'text.secondary',
                            transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
                            transition: 'transform 0.3s'
                        }}
                    >
                        <ExpandMoreIcon />
                    </IconButton>
                </Box>
            </Box>

            <Collapse in={expanded}>
                <Box sx={{ px: { xs: 2, sm: 3 }, pb: 2, pt: 0 }}>
                    <Box sx={{
                        p: 2,
                        bgcolor: 'background.default',
                        borderRadius: 2,
                        border: '1px solid',
                        borderColor: 'divider',
                    }}>
                        {application.description && (
                            <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ mb: (application.notes || application.links.length > 0) ? 2 : 0 }}
                            >
                                {application.description}
                            </Typography>
                        )}

                        {application.notes && (
                            <Box sx={{ mb: application.links.length > 0 ? 2 : 0 }}>
                                <Typography variant="caption" color="primary.main" fontWeight={600} sx={{ textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                                    Notes
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-line' }}>
                                    {application.notes}
                                </Typography>
                            </Box>
                        )}

                        {application.links.length > 0 && (
                            <Box>
                                <Typography variant="caption" color="primary.main" fontWeight={600} sx={{ textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                                    Links
                                </Typography>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                    {application.links.map((link, index) => {
                                        // Support both old string format and new object format
                                        let url = typeof link === 'string' ? link : link.url;
                                        const name = typeof link === 'string' ? link : link.name;

                                        if (!/^https?:\/\//i.test(url)) {
                                            url = `https://${url}`;
                                        }

                                        return (
                                            <Link
                                                key={index}
                                                href={url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                variant="body2"
                                                sx={{
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    whiteSpace: 'nowrap',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 0.5,
                                                    color: 'primary.main',
                                                    textDecoration: 'none',
                                                    '&:hover': {
                                                        textDecoration: 'underline'
                                                    }
                                                }}
                                            >
                                                <LinkIcon fontSize="small" sx={{ opacity: 0.7 }} />
                                                {name}
                                            </Link>
                                        );
                                    })}
                                </Box>
                            </Box>
                        )}
                    </Box>
                </Box>
            </Collapse>
        </Card>
    );
};

export default ApplicationCard;
