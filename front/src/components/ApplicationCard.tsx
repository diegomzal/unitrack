import {
    Card,
    Typography,
    IconButton,
    Box,
    Tooltip,
    Link,
    Collapse,
    Chip,
    LinearProgress,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PublicIcon from '@mui/icons-material/Public';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LinkIcon from '@mui/icons-material/Link';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SchoolIcon from '@mui/icons-material/School';
import EventIcon from '@mui/icons-material/Event';
import FlagIcon from '@mui/icons-material/Flag';
import DateRangeIcon from '@mui/icons-material/DateRange';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import ChecklistIcon from '@mui/icons-material/Checklist';
import { useState } from 'react';
import type { Application, ApplicationEvent } from '../types/application';
import { EVENT_TYPE_LABELS } from '../types/application';
import StatusChip from './StatusChip';
import { getCountryByCode } from '../data/countries';

interface ApplicationCardProps {
    application: Application;
    onEdit?: (application: Application) => void;
    onDelete?: (id: string) => void;
    onOpenDetails: (application: Application) => void;
    readOnly?: boolean;
}

const ApplicationCard: React.FC<ApplicationCardProps> = ({ application, onEdit, onDelete, onOpenDetails, readOnly }) => {
    const [expanded, setExpanded] = useState(false);

    const country = application.country ? getCountryByCode(application.country) : null;

    const durationLabel = (() => {
        const raw = application.duration as number | string | null | undefined;
        if (raw === null || raw === undefined || raw === '') return null;
        if (typeof raw === 'number') {
            return `${raw} year${raw !== 1 ? 's' : ''}`;
        }
        const num = parseInt(String(raw), 10);
        if (!isNaN(num)) return `${num} year${num !== 1 ? 's' : ''}`;
        return String(raw);
    })();

    const events: ApplicationEvent[] = application.events ?? [];
    const requirements = application.requirements ?? [];
    const completedReqs = requirements.filter((r) => r.completed).length;
    const reqProgress = requirements.length > 0 ? (completedReqs / requirements.length) * 100 : 0;

    const costs = application.costs;
    const annualCost = (costs?.tuitionFeePerYear ?? 0) + (costs?.livingCostPerYear ?? 0);
    const formattedAnnualCost = annualCost > 0
        ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(annualCost) + '/yr'
        : null;

    const getEventIcon = (type: ApplicationEvent['type']) => {
        switch (type) {
            case 'deadline': return <FlagIcon sx={{ fontSize: 14 }} />;
            case 'date-range': return <DateRangeIcon sx={{ fontSize: 14 }} />;
            case 'event': return <EventIcon sx={{ fontSize: 14 }} />;
        }
    };

    const formatDate = (d: string) => {
        const date = new Date(d + 'T00:00:00');
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

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

                        {events.length > 0 && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <EventIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                                <Typography variant="caption" color="text.secondary">
                                    {events.length} event{events.length > 1 ? 's' : ''}
                                </Typography>
                            </Box>
                        )}

                        {requirements.length > 0 && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <ChecklistIcon sx={{ fontSize: 14, color: reqProgress === 100 ? 'success.main' : 'text.secondary' }} />
                                <Typography variant="caption" color={reqProgress === 100 ? 'success.main' : 'text.secondary'} fontWeight={reqProgress === 100 ? 600 : 400}>
                                    {completedReqs}/{requirements.length}
                                </Typography>
                            </Box>
                        )}

                        {formattedAnnualCost && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <AttachMoneyIcon sx={{ fontSize: 14, color: 'primary.light' }} />
                                <Typography variant="caption" color="primary.light" fontWeight={600}>
                                    {formattedAnnualCost}
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
                    gap: 0.5,
                    mt: { xs: 1, sm: 0 },
                    pt: { xs: 1.5, sm: 0 },
                    borderTop: { xs: '1px solid', sm: 'none' },
                    borderColor: 'divider',
                    minWidth: { sm: '170px' }
                }}>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <Tooltip title="Details & Requirements">
                            <IconButton
                                size="small"
                                onClick={() => onOpenDetails(application)}
                                sx={{
                                    color: 'secondary.main',
                                    bgcolor: 'rgba(0, 229, 255, 0.08)',
                                    '&:hover': { bgcolor: 'rgba(0, 229, 255, 0.16)' },
                                }}
                            >
                                <InfoOutlinedIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                        {!readOnly && onEdit && (
                            <Tooltip title="Edit">
                                <IconButton
                                    size="small"
                                    onClick={() => onEdit(application)}
                                    sx={{ color: 'primary.light', bgcolor: 'primary.50', '&:hover': { bgcolor: 'primary.100' } }}
                                >
                                    <EditIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>
                        )}
                        {!readOnly && onDelete && (
                            <Tooltip title="Delete">
                                <IconButton
                                    size="small"
                                    onClick={() => onDelete(application._id)}
                                    sx={{ color: 'error.main', bgcolor: 'error.50', '&:hover': { bgcolor: 'error.100' } }}
                                >
                                    <DeleteIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>
                        )}
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

            {/* Requirements progress bar (compact) */}
            {requirements.length > 0 && (
                <LinearProgress
                    variant="determinate"
                    value={reqProgress}
                    sx={{
                        height: 3,
                        '& .MuiLinearProgress-bar': {
                            background: reqProgress === 100
                                ? 'linear-gradient(135deg, #22C55E, #16A34A)'
                                : 'linear-gradient(135deg, #3B82F6, #2563EB)',
                            transition: 'transform 0.4s ease',
                        },
                        bgcolor: 'rgba(59, 130, 246, 0.06)',
                    }}
                />
            )}

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
                                sx={{ mb: (application.notes || application.links.length > 0 || events.length > 0 || requirements.length > 0) ? 2 : 0 }}
                            >
                                {application.description}
                            </Typography>
                        )}

                        {application.notes && (
                            <Box sx={{ mb: (application.links.length > 0 || events.length > 0 || requirements.length > 0) ? 2 : 0 }}>
                                <Typography variant="caption" color="primary.main" fontWeight={600} sx={{ textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                                    Notes
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-line' }}>
                                    {application.notes}
                                </Typography>
                            </Box>
                        )}

                        {application.links.length > 0 && (
                            <Box sx={{ mb: (events.length > 0 || requirements.length > 0) ? 2 : 0 }}>
                                <Typography variant="caption" color="primary.main" fontWeight={600} sx={{ textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                                    Links
                                </Typography>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                    {application.links.map((link, index) => {
                                        let url = typeof link === 'string' ? link : link.url;
                                        const name = typeof link === 'string' ? link : link.name;
                                        if (!/^https?:\/\//i.test(url)) url = `https://${url}`;
                                        return (
                                            <Link
                                                key={index}
                                                href={url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                variant="body2"
                                                sx={{
                                                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                                    display: 'flex', alignItems: 'center', gap: 0.5,
                                                    color: 'primary.main', textDecoration: 'none',
                                                    '&:hover': { textDecoration: 'underline' }
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

                        {events.length > 0 && (
                            <Box sx={{ mb: requirements.length > 0 ? 2 : 0 }}>
                                <Typography variant="caption" color="primary.main" fontWeight={600} sx={{ textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                                    Dates & Deadlines
                                </Typography>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                                    {events.map((event) => (
                                        <Box
                                            key={event.id}
                                            sx={{
                                                display: 'flex', alignItems: 'center', gap: 1,
                                                py: 0.5, px: 1, borderRadius: 1.5,
                                                bgcolor: `${event.color}11`,
                                                border: '1px solid', borderColor: `${event.color}33`,
                                            }}
                                        >
                                            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: event.color, flexShrink: 0 }} />
                                            <Box sx={{ color: event.color, display: 'flex', flexShrink: 0 }}>
                                                {getEventIcon(event.type)}
                                            </Box>
                                            <Typography variant="body2" fontWeight={500} sx={{ flex: 1 }}>
                                                {event.title}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary" sx={{ flexShrink: 0 }}>
                                                {formatDate(event.date)}
                                                {event.endDate && ` — ${formatDate(event.endDate)}`}
                                            </Typography>
                                            <Chip
                                                label={EVENT_TYPE_LABELS[event.type]}
                                                size="small"
                                                sx={{
                                                    height: 20, fontSize: '0.65rem',
                                                    bgcolor: `${event.color}22`, color: event.color, fontWeight: 600,
                                                }}
                                            />
                                        </Box>
                                    ))}
                                </Box>
                            </Box>
                        )}

                        {requirements.length > 0 && (
                            <Box>
                                <Typography variant="caption" color="primary.main" fontWeight={600} sx={{ textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                                    Requirements ({completedReqs}/{requirements.length})
                                </Typography>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                    {requirements.map((req) => (
                                        <Box
                                            key={req.id}
                                            sx={{
                                                display: 'flex', alignItems: 'center', gap: 1,
                                                py: 0.5, px: 1, borderRadius: 1.5,
                                                bgcolor: req.completed ? 'rgba(34, 197, 94, 0.06)' : 'transparent',
                                            }}
                                        >
                                            <Box
                                                sx={{
                                                    width: 8, height: 8, borderRadius: '50%',
                                                    bgcolor: req.completed ? 'success.main' : 'text.secondary',
                                                    opacity: req.completed ? 1 : 0.4,
                                                    flexShrink: 0,
                                                }}
                                            />
                                            <Typography
                                                variant="body2"
                                                sx={{
                                                    flex: 1,
                                                    textDecoration: req.completed ? 'line-through' : 'none',
                                                    color: req.completed ? 'text.secondary' : 'text.primary',
                                                }}
                                            >
                                                {req.title}
                                            </Typography>
                                        </Box>
                                    ))}
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
