import React, { useState } from 'react';
import {
    Box,
    Typography,
    TextField,
    MenuItem,
    Button,
    Chip,
    IconButton,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EventIcon from '@mui/icons-material/Event';
import DateRangeIcon from '@mui/icons-material/DateRange';
import FlagIcon from '@mui/icons-material/Flag';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';

import {
    EVENT_TYPES,
    EVENT_TYPE_LABELS,
    EVENT_COLORS,
    type ApplicationEvent,
    type ApplicationEventType,
} from '../../types/application';

// Helper for generating IDs
export const generateId = (): string =>
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

interface EventsTabProps {
    events: ApplicationEvent[];
    onChange: (events: ApplicationEvent[]) => void;
    readOnly?: boolean;
}

const EventsTab: React.FC<EventsTabProps> = ({ events, onChange, readOnly }) => {
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
            {!readOnly && (
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
            )}

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
                            {!readOnly && (
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
                            )}
                        </Box>
                    ))}
                </Box>
            )}
        </Box>
    );
};

export default EventsTab;
