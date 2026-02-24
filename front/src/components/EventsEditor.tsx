import { useState } from 'react';
import {
    Box,
    TextField,
    MenuItem,
    Button,
    IconButton,
    Typography,
    Chip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EventIcon from '@mui/icons-material/Event';
import DateRangeIcon from '@mui/icons-material/DateRange';
import FlagIcon from '@mui/icons-material/Flag';
import {
    EVENT_TYPES,
    EVENT_TYPE_LABELS,
    EVENT_COLORS,
    type ApplicationEvent,
    type ApplicationEventType,
} from '../types/application';

interface EventsEditorProps {
    events: ApplicationEvent[];
    onChange: (events: ApplicationEvent[]) => void;
}

const generateEventId = (): string =>
    Date.now().toString(36) + Math.random().toString(36).substring(2, 8);

const getEventIcon = (type: ApplicationEventType) => {
    switch (type) {
        case 'deadline':
            return <FlagIcon sx={{ fontSize: 16 }} />;
        case 'date-range':
            return <DateRangeIcon sx={{ fontSize: 16 }} />;
        case 'event':
            return <EventIcon sx={{ fontSize: 16 }} />;
    }
};

const formatEventDate = (date: string): string => {
    const d = new Date(date + 'T00:00:00');
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const EventsEditor: React.FC<EventsEditorProps> = ({ events, onChange }) => {
    const [title, setTitle] = useState('');
    const [type, setType] = useState<ApplicationEventType>('deadline');
    const [date, setDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [color, setColor] = useState<string>(EVENT_COLORS[4]); // default: blue

    const canAdd = title.trim() && date && (type !== 'date-range' || endDate);

    const handleAdd = () => {
        if (!canAdd) return;

        const newEvent: ApplicationEvent = {
            id: generateEventId(),
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
        <Box>
            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                Dates & Deadlines
            </Typography>

            {/* Inputs row */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 1.5 }}>
                {/* Type + Title */}
                <Box sx={{ display: 'flex', gap: 1, flexDirection: { xs: 'column', sm: 'row' } }}>
                    <TextField
                        select
                        size="small"
                        value={type}
                        onChange={(e) => {
                            setType(e.target.value as ApplicationEventType);
                            if (e.target.value !== 'date-range') setEndDate('');
                        }}
                        sx={{ minWidth: 140 }}
                    >
                        {EVENT_TYPES.map((t) => (
                            <MenuItem key={t} value={t}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    {getEventIcon(t)}
                                    {EVENT_TYPE_LABELS[t]}
                                </Box>
                            </MenuItem>
                        ))}
                    </TextField>
                    <TextField
                        size="small"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="e.g., Application deadline"
                        sx={{ flex: 1 }}
                    />
                </Box>

                {/* Dates + Color + Add */}
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
                    <TextField
                        size="small"
                        type="date"
                        label={type === 'date-range' ? 'Start date' : 'Date'}
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        onKeyDown={handleKeyDown}
                        slotProps={{ inputLabel: { shrink: true } }}
                        sx={{ flex: 1, minWidth: 140 }}
                    />
                    {type === 'date-range' && (
                        <TextField
                            size="small"
                            type="date"
                            label="End date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            onKeyDown={handleKeyDown}
                            slotProps={{
                                inputLabel: { shrink: true },
                                htmlInput: { min: date || undefined },
                            }}
                            sx={{ flex: 1, minWidth: 140 }}
                        />
                    )}

                    {/* Color picker */}
                    <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
                        {EVENT_COLORS.map((c) => (
                            <Box
                                key={c}
                                onClick={() => setColor(c)}
                                sx={{
                                    width: 20,
                                    height: 20,
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
                        variant="outlined"
                        size="small"
                        onClick={handleAdd}
                        disabled={!canAdd}
                        sx={{ minWidth: 'auto', px: 1.5 }}
                    >
                        <AddIcon />
                    </Button>
                </Box>
            </Box>

            {/* Events list */}
            {events.length > 0 && (
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 0.5,
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 2,
                        overflow: 'hidden',
                    }}
                >
                    {events.map((event, index) => (
                        <Box
                            key={event.id}
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                                px: 1.5,
                                py: 1,
                                bgcolor: index % 2 === 0 ? 'transparent' : 'action.hover',
                                '&:hover': { bgcolor: 'action.selected' },
                                transition: 'background-color 0.15s',
                            }}
                        >
                            {/* Color dot */}
                            <Box
                                sx={{
                                    width: 10,
                                    height: 10,
                                    borderRadius: '50%',
                                    bgcolor: event.color,
                                    flexShrink: 0,
                                }}
                            />

                            {/* Icon */}
                            <Box sx={{ color: 'text.secondary', flexShrink: 0, display: 'flex' }}>
                                {getEventIcon(event.type)}
                            </Box>

                            {/* Content */}
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                <Typography
                                    variant="body2"
                                    fontWeight={500}
                                    sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                                >
                                    {event.title}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    {formatEventDate(event.date)}
                                    {event.endDate && ` — ${formatEventDate(event.endDate)}`}
                                </Typography>
                            </Box>

                            {/* Type badge */}
                            <Chip
                                label={EVENT_TYPE_LABELS[event.type]}
                                size="small"
                                sx={{
                                    height: 22,
                                    fontSize: '0.68rem',
                                    bgcolor: `${event.color}22`,
                                    color: event.color,
                                    fontWeight: 600,
                                }}
                            />

                            {/* Delete */}
                            <IconButton
                                size="small"
                                onClick={() => handleRemove(event.id)}
                                sx={{ color: 'error.main', flexShrink: 0 }}
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

export default EventsEditor;
