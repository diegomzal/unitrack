import { useState, useEffect, useCallback } from 'react';
import {
    Dialog,
    DialogContent,
    Box,
    Typography,
    IconButton,
    Tabs,
    Tab,
    TextField,
    MenuItem,
    Button,
    Chip,
    Checkbox,
    LinearProgress,
    InputAdornment,
    useMediaQuery,
    useTheme,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EventIcon from '@mui/icons-material/Event';
import DateRangeIcon from '@mui/icons-material/DateRange';
import FlagIcon from '@mui/icons-material/Flag';
import ChecklistIcon from '@mui/icons-material/Checklist';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import {
    EVENT_TYPES,
    EVENT_TYPE_LABELS,
    EVENT_COLORS,
    EMPTY_COSTS,
    type Application,
    type ApplicationEvent,
    type ApplicationEventType,
    type ApplicationRequirement,
    type ApplicationCosts,
    type ApplicationFormData,
} from '../types/application';

interface ApplicationDetailsDialogProps {
    open: boolean;
    application: Application | null;
    onClose: () => void;
    onSave?: (id: string, data: ApplicationFormData) => Promise<void>;
    readOnly?: boolean;
}

const generateId = (): string =>
    Date.now().toString(36) + Math.random().toString(36).substring(2, 8);

const getEventIcon = (type: ApplicationEventType, fontSize = 16) => {
    switch (type) {
        case 'deadline':
            return <FlagIcon sx={{ fontSize }} />;
        case 'date-range':
            return <DateRangeIcon sx={{ fontSize }} />;
        case 'event':
            return <EventIcon sx={{ fontSize }} />;
    }
};

const formatEventDate = (date: string): string => {
    const d = new Date(date + 'T00:00:00');
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

// ─── Event Tab ────────────────────────────────────────────────────
interface EventsTabProps {
    events: ApplicationEvent[];
    onChange: (events: ApplicationEvent[]) => void;
}

const EventsTab: React.FC<EventsTabProps> = ({ events, onChange }) => {
    const [title, setTitle] = useState('');
    const [type, setType] = useState<ApplicationEventType>('deadline');
    const [date, setDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [color, setColor] = useState<string>(EVENT_COLORS[4]);

    const canAdd = title.trim() && date && (type !== 'date-range' || endDate);

    const handleAdd = () => {
        if (!canAdd) return;
        const newEvent: ApplicationEvent = {
            id: generateId(),
            title: title.trim(),
            type,
            date,
            ...(type === 'date-range' && endDate ? { endDate } : {}),
            color,
        };
        onChange([...events, newEvent]);
        setTitle('');
        setDate('');
        setEndDate('');
    };

    const handleRemove = (id: string) => {
        onChange(events.filter((e) => e.id !== id));
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAdd();
        }
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* Add form */}
            <Box
                sx={{
                    p: 2,
                    borderRadius: 2.5,
                    bgcolor: 'rgba(59, 130, 246, 0.04)',
                    border: '1px dashed',
                    borderColor: 'rgba(59, 130, 246, 0.2)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1.5,
                }}
            >
                <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    Add new event
                </Typography>

                <TextField
                    size="small"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Event title (e.g., Application deadline)"
                    fullWidth
                />

                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
                    <TextField
                        select
                        size="small"
                        value={type}
                        onChange={(e) => {
                            setType(e.target.value as ApplicationEventType);
                            if (e.target.value !== 'date-range') setEndDate('');
                        }}
                        sx={{ width: { xs: '100%', sm: 140 } }}
                    >
                        {EVENT_TYPES.map((t) => (
                            <MenuItem key={t} value={t}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    {getEventIcon(t, 14)}
                                    {EVENT_TYPE_LABELS[t]}
                                </Box>
                            </MenuItem>
                        ))}
                    </TextField>

                    <TextField
                        size="small"
                        type="date"
                        label={type === 'date-range' ? 'Start' : 'Date'}
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        onKeyDown={handleKeyDown}
                        slotProps={{ inputLabel: { shrink: true } }}
                        sx={{ flex: 1, minWidth: 120 }}
                    />
                    {type === 'date-range' && (
                        <TextField
                            size="small"
                            type="date"
                            label="End"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            onKeyDown={handleKeyDown}
                            slotProps={{
                                inputLabel: { shrink: true },
                                htmlInput: { min: date || undefined },
                            }}
                            sx={{ flex: 1, minWidth: 120 }}
                        />
                    )}
                    <Box sx={{ display: 'flex', gap: 0.4, alignItems: 'center' }}>
                        {EVENT_COLORS.map((c) => (
                            <Box
                                key={c}
                                onClick={() => setColor(c)}
                                sx={{
                                    width: 18,
                                    height: 18,
                                    borderRadius: '50%',
                                    bgcolor: c,
                                    cursor: 'pointer',
                                    border: color === c ? '2px solid #E8EAED' : '2px solid transparent',
                                    transition: 'border-color 0.15s, transform 0.15s',
                                    '&:hover': { transform: 'scale(1.2)' },
                                }}
                            />
                        ))}
                    </Box>
                    <Button
                        variant="contained"
                        size="small"
                        onClick={handleAdd}
                        disabled={!canAdd}
                        startIcon={<AddIcon />}
                        sx={{
                            background: 'linear-gradient(135deg, #3B82F6, #2563EB)',
                            '&:hover': { background: 'linear-gradient(135deg, #60A5FA, #3B82F6)' },
                            textTransform: 'none',
                            fontWeight: 600,
                            borderRadius: 2,
                        }}
                    >
                        Add
                    </Button>
                </Box>
            </Box>

            {/* Event list */}
            {events.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                    <CalendarMonthIcon sx={{ fontSize: 40, color: 'text.secondary', opacity: 0.3, mb: 1 }} />
                    <Typography variant="body2" color="text.secondary">
                        No events added yet
                    </Typography>
                </Box>
            ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {events.map((event) => (
                        <Box
                            key={event.id}
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1.5,
                                p: 1.5,
                                borderRadius: 2,
                                bgcolor: `${event.color}0A`,
                                border: '1px solid',
                                borderColor: `${event.color}25`,
                                transition: 'all 0.2s',
                                '&:hover': {
                                    bgcolor: `${event.color}14`,
                                    borderColor: `${event.color}40`,
                                },
                            }}
                        >
                            <Box
                                sx={{
                                    width: 4,
                                    alignSelf: 'stretch',
                                    borderRadius: 1,
                                    bgcolor: event.color,
                                    flexShrink: 0,
                                }}
                            />
                            <Box sx={{ color: event.color, display: 'flex', flexShrink: 0 }}>
                                {getEventIcon(event.type)}
                            </Box>
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                <Typography variant="body2" fontWeight={600} sx={{ mb: 0.25 }}>
                                    {event.title}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    {formatEventDate(event.date)}
                                    {event.endDate && ` — ${formatEventDate(event.endDate)}`}
                                </Typography>
                            </Box>
                            <Chip
                                label={EVENT_TYPE_LABELS[event.type]}
                                size="small"
                                sx={{
                                    height: 22,
                                    fontSize: '0.65rem',
                                    bgcolor: `${event.color}20`,
                                    color: event.color,
                                    fontWeight: 600,
                                    flexShrink: 0,
                                }}
                            />
                            <IconButton
                                size="small"
                                onClick={() => handleRemove(event.id)}
                                sx={{
                                    color: 'text.secondary',
                                    '&:hover': { color: 'error.main' },
                                    flexShrink: 0,
                                }}
                            >
                                <DeleteOutlineIcon fontSize="small" />
                            </IconButton>
                        </Box>
                    ))}
                </Box>
            )}
        </Box>
    );
};

// ─── Requirements Tab ─────────────────────────────────────────────
interface RequirementsTabProps {
    requirements: ApplicationRequirement[];
    onChange: (requirements: ApplicationRequirement[]) => void;
}

const RequirementsTab: React.FC<RequirementsTabProps> = ({ requirements, onChange }) => {
    const [newTitle, setNewTitle] = useState('');

    const completedCount = requirements.filter((r) => r.completed).length;
    const progress = requirements.length > 0 ? (completedCount / requirements.length) * 100 : 0;

    const handleAdd = () => {
        const trimmed = newTitle.trim();
        if (!trimmed) return;
        const newReq: ApplicationRequirement = {
            id: generateId(),
            title: trimmed,
            completed: false,
        };
        onChange([...requirements, newReq]);
        setNewTitle('');
    };

    const handleToggle = (id: string) => {
        onChange(
            requirements.map((r) => (r.id === id ? { ...r, completed: !r.completed } : r)),
        );
    };

    const handleRemove = (id: string) => {
        onChange(requirements.filter((r) => r.id !== id));
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAdd();
        }
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* Progress */}
            {requirements.length > 0 && (
                <Box sx={{ p: 2, borderRadius: 2.5, bgcolor: 'rgba(59, 130, 246, 0.04)', border: '1px solid', borderColor: 'divider' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                            Progress
                        </Typography>
                        <Typography variant="caption" fontWeight={700} color={progress === 100 ? 'success.main' : 'primary.main'}>
                            {completedCount}/{requirements.length} completed
                        </Typography>
                    </Box>
                    <LinearProgress
                        variant="determinate"
                        value={progress}
                        sx={{
                            height: 6,
                            borderRadius: 3,
                            bgcolor: 'rgba(59, 130, 246, 0.1)',
                            '& .MuiLinearProgress-bar': {
                                borderRadius: 3,
                                background: progress === 100
                                    ? 'linear-gradient(135deg, #22C55E, #16A34A)'
                                    : 'linear-gradient(135deg, #3B82F6, #2563EB)',
                            },
                        }}
                    />
                </Box>
            )}

            {/* Add form */}
            <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                    size="small"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="e.g., Submit transcripts, Write essay..."
                    sx={{ flex: 1 }}
                />
                <Button
                    variant="contained"
                    size="small"
                    onClick={handleAdd}
                    disabled={!newTitle.trim()}
                    startIcon={<AddIcon />}
                    sx={{
                        background: 'linear-gradient(135deg, #3B82F6, #2563EB)',
                        '&:hover': { background: 'linear-gradient(135deg, #60A5FA, #3B82F6)' },
                        textTransform: 'none',
                        fontWeight: 600,
                        borderRadius: 2,
                    }}
                >
                    Add
                </Button>
            </Box>

            {/* Requirements list */}
            {requirements.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                    <ChecklistIcon sx={{ fontSize: 40, color: 'text.secondary', opacity: 0.3, mb: 1 }} />
                    <Typography variant="body2" color="text.secondary">
                        No requirements added yet
                    </Typography>
                </Box>
            ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    {requirements.map((req) => (
                        <Box
                            key={req.id}
                            onClick={() => handleToggle(req.id)}
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                                px: 1,
                                py: 0.75,
                                borderRadius: 2,
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                border: '1px solid',
                                borderColor: req.completed ? 'rgba(34, 197, 94, 0.2)' : 'divider',
                                bgcolor: req.completed ? 'rgba(34, 197, 94, 0.06)' : 'transparent',
                                '&:hover': {
                                    bgcolor: req.completed ? 'rgba(34, 197, 94, 0.1)' : 'action.hover',
                                    borderColor: req.completed ? 'rgba(34, 197, 94, 0.35)' : 'rgba(59, 130, 246, 0.3)',
                                },
                            }}
                        >
                            <Checkbox
                                size="small"
                                checked={req.completed}
                                onChange={() => handleToggle(req.id)}
                                onClick={(e) => e.stopPropagation()}
                                sx={{
                                    color: 'text.secondary',
                                    '&.Mui-checked': { color: 'success.main' },
                                    p: 0.5,
                                }}
                            />
                            <Typography
                                variant="body2"
                                sx={{
                                    flex: 1,
                                    textDecoration: req.completed ? 'line-through' : 'none',
                                    color: req.completed ? 'text.secondary' : 'text.primary',
                                    fontWeight: req.completed ? 400 : 500,
                                    transition: 'all 0.2s',
                                }}
                            >
                                {req.title}
                            </Typography>
                            <IconButton
                                size="small"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleRemove(req.id);
                                }}
                                sx={{
                                    color: 'text.secondary',
                                    opacity: 0.5,
                                    '&:hover': { color: 'error.main', opacity: 1 },
                                    flexShrink: 0,
                                }}
                            >
                                <DeleteOutlineIcon sx={{ fontSize: 16 }} />
                            </IconButton>
                        </Box>
                    ))}
                </Box>
            )}
        </Box>
    );
};

// ─── Costs Tab ────────────────────────────────────────────────────
interface CostsTabProps {
    costs: ApplicationCosts;
    onChange: (costs: ApplicationCosts) => void;
}

const formatCurrency = (value: number | null): string => {
    if (value === null || value === 0) return '$0';
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value);
};

const CostsTab: React.FC<CostsTabProps> = ({ costs, onChange }) => {
    const tuition = costs.tuitionFeePerYear ?? 0;
    const living = costs.livingCostPerYear ?? 0;
    const totalAnnual = tuition + living;

    const handleNumberChange =
        (field: 'tuitionFeePerYear' | 'livingCostPerYear') =>
            (e: React.ChangeEvent<HTMLInputElement>) => {
                const raw = e.target.value;
                if (raw === '') {
                    onChange({ ...costs, [field]: null });
                } else {
                    const num = parseFloat(raw);
                    if (!isNaN(num) && num >= 0) {
                        onChange({ ...costs, [field]: num });
                    }
                }
            };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            {/* Annual cost summary */}
            <Box
                sx={{
                    p: 2.5,
                    borderRadius: 3,
                    background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.08), rgba(139, 92, 246, 0.08))',
                    border: '1px solid',
                    borderColor: 'rgba(59, 130, 246, 0.15)',
                }}
            >
                <Typography
                    variant="caption"
                    fontWeight={600}
                    color="text.secondary"
                    sx={{ textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', mb: 1 }}
                >
                    Estimated Annual Cost
                </Typography>
                <Typography variant="h4" fontWeight={800} sx={{ color: 'primary.main', lineHeight: 1.2 }}>
                    {formatCurrency(totalAnnual)}
                    <Typography component="span" variant="body2" color="text.secondary" sx={{ ml: 0.5 }}>
                        / year
                    </Typography>
                </Typography>
                {(tuition > 0 || living > 0) && (
                    <Box sx={{ display: 'flex', gap: 2, mt: 1.5 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#3B82F6' }} />
                            <Typography variant="caption" color="text.secondary">
                                Tuition: {formatCurrency(tuition)}
                            </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#8B5CF6' }} />
                            <Typography variant="caption" color="text.secondary">
                                Living: {formatCurrency(living)}
                            </Typography>
                        </Box>
                    </Box>
                )}
            </Box>

            {/* Tuition Fee */}
            <TextField
                label="Tuition Fee (per year)"
                type="number"
                value={costs.tuitionFeePerYear ?? ''}
                onChange={handleNumberChange('tuitionFeePerYear')}
                placeholder="e.g., 15000"
                fullWidth
                slotProps={{
                    htmlInput: { min: 0, step: 100 },
                    input: {
                        startAdornment: (
                            <InputAdornment position="start">$</InputAdornment>
                        ),
                    },
                }}
            />

            {/* Living Cost */}
            <TextField
                label="Living Cost (per year)"
                type="number"
                value={costs.livingCostPerYear ?? ''}
                onChange={handleNumberChange('livingCostPerYear')}
                placeholder="e.g., 12000"
                fullWidth
                slotProps={{
                    htmlInput: { min: 0, step: 100 },
                    input: {
                        startAdornment: (
                            <InputAdornment position="start">$</InputAdornment>
                        ),
                    },
                }}
            />

            {/* Scholarship Info */}
            <TextField
                label="Scholarships Available"
                value={costs.scholarshipInfo}
                onChange={(e) => onChange({ ...costs, scholarshipInfo: e.target.value })}
                multiline
                rows={3}
                fullWidth
                placeholder="e.g., Merit-based scholarship up to 50%, need-based aid available..."
            />
        </Box>
    );
};

// ─── Main Dialog ──────────────────────────────────────────────────
const ApplicationDetailsDialog: React.FC<ApplicationDetailsDialogProps> = ({
    open,
    application,
    onClose,
    onSave,
    readOnly,
}) => {
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

    const [tab, setTab] = useState(0);
    const [events, setEvents] = useState<ApplicationEvent[]>([]);
    const [requirements, setRequirements] = useState<ApplicationRequirement[]>([]);
    const [costs, setCosts] = useState<ApplicationCosts>({ ...EMPTY_COSTS });
    const [saving, setSaving] = useState(false);
    const [dirty, setDirty] = useState(false);

    useEffect(() => {
        if (open && application) {
            setEvents(application.events ?? []);
            setRequirements(application.requirements ?? []);
            setCosts(application.costs ?? { ...EMPTY_COSTS });
            setTab(0);
            setDirty(false);
        }
    }, [open, application]);

    const handleEventsChange = useCallback((newEvents: ApplicationEvent[]) => {
        setEvents(newEvents);
        setDirty(true);
    }, []);

    const handleRequirementsChange = useCallback((newReqs: ApplicationRequirement[]) => {
        setRequirements(newReqs);
        setDirty(true);
    }, []);

    const handleCostsChange = useCallback((newCosts: ApplicationCosts) => {
        setCosts(newCosts);
        setDirty(true);
    }, []);

    const handleSave = async () => {
        if (readOnly || !application || !dirty || !onSave) {
            onClose();
            return;
        }
        try {
            setSaving(true);
            const data: ApplicationFormData = {
                title: application.title,
                description: application.description,
                university: application.university,
                country: application.country,
                duration: application.duration,
                links: application.links,
                events,
                requirements,
                costs,
                notes: application.notes,
                status: application.status,
            };
            await onSave(application._id, data);
            onClose();
        } catch (err) {
            console.error('Failed to save details:', err);
        } finally {
            setSaving(false);
        }
    };

    if (!application) return null;

    return (
        <Dialog
            open={open}
            onClose={handleSave}
            fullScreen={fullScreen}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: fullScreen ? 0 : 3,
                    maxHeight: fullScreen ? '100vh' : '85vh',
                },
            }}
        >
            {/* Header */}
            <Box
                sx={{
                    px: 3,
                    pt: 2.5,
                    pb: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1,
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                    <Box sx={{ minWidth: 0 }}>
                        <Typography
                            variant="h6"
                            fontWeight={700}
                            sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                        >
                            {application.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {application.university}
                        </Typography>
                    </Box>
                    <IconButton onClick={handleSave} size="small" sx={{ mt: -0.5, mr: -1 }}>
                        <CloseIcon />
                    </IconButton>
                </Box>

                <Tabs
                    value={tab}
                    onChange={(_e, v) => setTab(v)}
                    textColor="primary"
                    indicatorColor="primary"
                    sx={{
                        minHeight: 40,
                        '.MuiTab-root': {
                            minHeight: 40,
                            textTransform: 'none',
                            fontWeight: 600,
                            fontSize: '0.85rem',
                        },
                    }}
                >
                    <Tab
                        icon={<CalendarMonthIcon sx={{ fontSize: 18 }} />}
                        iconPosition="start"
                        label={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                                Dates & Deadlines
                                {events.length > 0 && (
                                    <Chip label={events.length} size="small" sx={{ height: 18, fontSize: '0.65rem', fontWeight: 700, bgcolor: 'primary.main', color: '#fff' }} />
                                )}
                            </Box>
                        }
                    />
                    <Tab
                        icon={<ChecklistIcon sx={{ fontSize: 18 }} />}
                        iconPosition="start"
                        label={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                                Requirements
                                {requirements.length > 0 && (
                                    <Chip
                                        label={`${requirements.filter((r) => r.completed).length}/${requirements.length}`}
                                        size="small"
                                        sx={{
                                            height: 18,
                                            fontSize: '0.65rem',
                                            fontWeight: 700,
                                            bgcolor: requirements.every((r) => r.completed) ? 'success.main' : 'primary.main',
                                            color: '#fff',
                                        }}
                                    />
                                )}
                            </Box>
                        }
                    />
                    <Tab
                        icon={<AttachMoneyIcon sx={{ fontSize: 18 }} />}
                        iconPosition="start"
                        label={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                                Costs
                            </Box>
                        }
                    />
                </Tabs>
            </Box>

            <DialogContent sx={{ pt: '16px !important', px: 3, pb: 3 }}>
                {tab === 0 && (
                    <EventsTab events={events} onChange={handleEventsChange} />
                )}
                {tab === 1 && (
                    <RequirementsTab requirements={requirements} onChange={handleRequirementsChange} />
                )}
                {tab === 2 && (
                    <CostsTab costs={costs} onChange={handleCostsChange} />
                )}
            </DialogContent>

            {/* Auto-save indicator */}
            {saving && (
                <LinearProgress
                    sx={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: 2,
                    }}
                />
            )}
        </Dialog>
    );
};

export default ApplicationDetailsDialog;
