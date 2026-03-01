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
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import {
    EVENT_TYPES,
    EVENT_TYPE_LABELS,
    EVENT_COLORS,
    EMPTY_COSTS,
    DEFAULT_REQUIREMENT_COLUMNS,
    type Application,
    type ApplicationEvent,
    type ApplicationEventType,
    type ApplicationRequirement,
    type RequirementColumn,
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

// ─── Requirements Tab (Mini Kanban) ───────────────────────────────
interface RequirementsTabProps {
    requirements: ApplicationRequirement[];
    columns: RequirementColumn[];
    onChange: (requirements: ApplicationRequirement[], columns: RequirementColumn[]) => void;
    readOnly?: boolean;
}

const RequirementsTab: React.FC<RequirementsTabProps> = ({ requirements, columns, onChange, readOnly }) => {
    const [addingToColumn, setAddingToColumn] = useState<string | null>(null);
    const [newTitle, setNewTitle] = useState('');
    const [editingColumnId, setEditingColumnId] = useState<string | null>(null);
    const [editingColumnTitle, setEditingColumnTitle] = useState('');
    const [dragItemId, setDragItemId] = useState<string | null>(null);
    const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);

    const lastColumnId = columns.length > 0 ? columns[columns.length - 1].id : null;
    const doneCount = requirements.filter((r) => r.column === lastColumnId).length;
    const progress = requirements.length > 0 ? (doneCount / requirements.length) * 100 : 0;

    // ── Column management ──
    const handleAddColumn = () => {
        const newCol: RequirementColumn = {
            id: generateId(),
            title: 'New Column',
        };
        onChange(requirements, [...columns, newCol]);
    };

    const handleRenameColumn = (colId: string) => {
        const trimmed = editingColumnTitle.trim();
        if (!trimmed) {
            setEditingColumnId(null);
            return;
        }
        const updated = columns.map((c) => (c.id === colId ? { ...c, title: trimmed } : c));
        onChange(requirements, updated);
        setEditingColumnId(null);
    };

    const handleRemoveColumn = (colId: string) => {
        if (columns.length <= 1) return;
        const firstRemainingCol = columns.find((c) => c.id !== colId);
        if (!firstRemainingCol) return;
        // Move items from deleted column to first remaining column
        const updatedReqs = requirements.map((r) =>
            r.column === colId ? { ...r, column: firstRemainingCol.id } : r,
        );
        onChange(updatedReqs, columns.filter((c) => c.id !== colId));
    };

    // ── Item management ──
    const handleAddItem = (columnId: string) => {
        const trimmed = newTitle.trim();
        if (!trimmed) return;
        const newReq: ApplicationRequirement = {
            id: generateId(),
            title: trimmed,
            column: columnId,
        };
        onChange([...requirements, newReq], columns);
        setNewTitle('');
        setAddingToColumn(null);
    };

    const handleRemoveItem = (id: string) => {
        onChange(requirements.filter((r) => r.id !== id), columns);
    };

    const handleAddKeyDown = (e: React.KeyboardEvent, columnId: string) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAddItem(columnId);
        } else if (e.key === 'Escape') {
            setAddingToColumn(null);
            setNewTitle('');
        }
    };

    // ── Drag and Drop ──
    const handleDragStart = (e: React.DragEvent, itemId: string) => {
        setDragItemId(itemId);
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', itemId);
    };

    const handleDragOver = (e: React.DragEvent, columnId: string) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        setDragOverColumn(columnId);
    };

    const handleDragLeave = () => {
        setDragOverColumn(null);
    };

    const handleDrop = (e: React.DragEvent, columnId: string) => {
        e.preventDefault();
        setDragOverColumn(null);
        if (!dragItemId) return;
        const updatedReqs = requirements.map((r) =>
            r.id === dragItemId ? { ...r, column: columnId } : r,
        );
        onChange(updatedReqs, columns);
        setDragItemId(null);
    };

    const handleDragEnd = () => {
        setDragItemId(null);
        setDragOverColumn(null);
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* Progress */}
            {requirements.length > 0 && (
                <Box
                    sx={{
                        p: 2,
                        borderRadius: 3,
                        background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.06), rgba(139, 92, 246, 0.04))',
                        border: '1px solid',
                        borderColor: 'rgba(59, 130, 246, 0.12)',
                    }}
                >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                            Progress
                        </Typography>
                        <Typography variant="caption" fontWeight={700} color={progress === 100 ? 'success.main' : 'primary.main'}>
                            {doneCount}/{requirements.length} completed
                        </Typography>
                    </Box>
                    <LinearProgress
                        variant="determinate"
                        value={progress}
                        sx={{
                            height: 6,
                            borderRadius: 3,
                            bgcolor: 'rgba(59, 130, 246, 0.08)',
                            '& .MuiLinearProgress-bar': {
                                borderRadius: 3,
                                background: progress === 100
                                    ? 'linear-gradient(135deg, #22C55E, #16A34A)'
                                    : 'linear-gradient(135deg, #3B82F6, #8B5CF6)',
                                transition: 'transform 0.6s ease',
                            },
                        }}
                    />
                </Box>
            )}

            {/* Kanban board */}
            <Box
                sx={{
                    display: 'flex',
                    gap: 2,
                    overflowX: 'auto',
                    pb: 1,
                    minHeight: 240,
                    '&::-webkit-scrollbar': { height: 6 },
                    '&::-webkit-scrollbar-track': { bgcolor: 'transparent' },
                    '&::-webkit-scrollbar-thumb': {
                        borderRadius: 3,
                        bgcolor: 'rgba(0,0,0,0.12)',
                        '&:hover': { bgcolor: 'rgba(0,0,0,0.2)' },
                    },
                }}
            >
                {columns.map((col, colIndex) => {
                    const colItems = requirements.filter((r) => r.column === col.id);
                    const isOver = dragOverColumn === col.id;
                    const isLast = col.id === lastColumnId;

                    // Assign a subtle accent color per column position
                    const colAccents = ['#3B82F6', '#8B5CF6', '#F59E0B', '#22C55E', '#EC4899', '#06B6D4'];
                    const accent = colAccents[colIndex % colAccents.length];

                    return (
                        <Box
                            key={col.id}
                            onDragOver={(e) => handleDragOver(e, col.id)}
                            onDragLeave={handleDragLeave}
                            onDrop={(e) => handleDrop(e, col.id)}
                            sx={{
                                flex: '1 1 0',
                                minWidth: 200,
                                display: 'flex',
                                flexDirection: 'column',
                                borderRadius: 3,
                                bgcolor: isOver ? `${accent}0C` : 'rgba(0, 0, 0, 0.015)',
                                border: '1px solid',
                                borderColor: isOver ? `${accent}40` : 'divider',
                                transition: 'all 0.25s ease',
                                overflow: 'hidden',
                                boxShadow: isOver ? `0 0 0 1px ${accent}20` : 'none',
                            }}
                        >
                            {/* Color accent line */}
                            <Box sx={{ height: 3, background: `linear-gradient(90deg, ${accent}, ${accent}80)`, flexShrink: 0 }} />

                            {/* Column header */}
                            <Box
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 0.75,
                                    px: 1.5,
                                    py: 1.25,
                                    borderBottom: '1px solid',
                                    borderColor: 'divider',
                                }}
                            >
                                {editingColumnId === col.id ? (
                                    <TextField
                                        size="small"
                                        value={editingColumnTitle}
                                        onChange={(e) => setEditingColumnTitle(e.target.value)}
                                        onBlur={() => handleRenameColumn(col.id)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') handleRenameColumn(col.id);
                                            if (e.key === 'Escape') setEditingColumnId(null);
                                        }}
                                        autoFocus
                                        sx={{
                                            flex: 1,
                                            '& .MuiInputBase-input': {
                                                py: 0.25,
                                                px: 0.5,
                                                fontSize: '0.75rem',
                                                fontWeight: 700,
                                            },
                                        }}
                                    />
                                ) : (
                                    <Box
                                        onClick={() => {
                                            if (readOnly) return;
                                            setEditingColumnId(col.id);
                                            setEditingColumnTitle(col.title);
                                        }}
                                        sx={{
                                            flex: 1,
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 1,
                                            cursor: readOnly ? 'default' : 'pointer',
                                            '&:hover .col-title': readOnly ? {} : { color: accent },
                                            transition: 'all 0.15s',
                                        }}
                                    >
                                        <Typography
                                            className="col-title"
                                            variant="caption"
                                            fontWeight={700}
                                            color="text.secondary"
                                            sx={{
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.08em',
                                                transition: 'color 0.15s',
                                            }}
                                        >
                                            {col.title}
                                        </Typography>
                                        <Chip
                                            label={colItems.length}
                                            size="small"
                                            sx={{
                                                height: 20,
                                                minWidth: 20,
                                                fontSize: '0.65rem',
                                                fontWeight: 700,
                                                bgcolor: `${accent}18`,
                                                color: accent,
                                            }}
                                        />
                                    </Box>
                                )}
                                {!readOnly && columns.length > 1 && (
                                    <IconButton
                                        size="small"
                                        onClick={() => handleRemoveColumn(col.id)}
                                        sx={{
                                            p: 0.25,
                                            color: 'text.secondary',
                                            opacity: 0,
                                            transition: 'opacity 0.15s, color 0.15s',
                                            '.MuiBox-root:hover > .MuiBox-root > &, &:focus': { opacity: 1 },
                                            '&:hover': { color: 'error.main' },
                                        }}
                                    >
                                        <DeleteOutlineIcon sx={{ fontSize: 15 }} />
                                    </IconButton>
                                )}
                            </Box>

                            {/* Column items */}
                            <Box
                                sx={{
                                    flex: 1,
                                    p: 1,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 0.75,
                                    overflowY: 'auto',
                                    minHeight: 80,
                                    '&::-webkit-scrollbar': { width: 4 },
                                    '&::-webkit-scrollbar-thumb': { borderRadius: 2, bgcolor: 'rgba(0,0,0,0.1)' },
                                }}
                            >
                                {colItems.length === 0 && (
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            flex: 1,
                                            py: 3,
                                            opacity: isOver ? 0.7 : 0.3,
                                            transition: 'opacity 0.2s',
                                        }}
                                    >
                                        <ChecklistIcon sx={{ fontSize: 28, color: 'text.secondary', mb: 0.5 }} />
                                        <Typography variant="caption" color="text.secondary" fontStyle="italic">
                                            {isOver ? 'Drop here' : 'No tasks yet'}
                                        </Typography>
                                    </Box>
                                )}
                                {colItems.map((req) => (
                                    <Box
                                        key={req.id}
                                        draggable={!readOnly}
                                        onDragStart={(e) => handleDragStart(e, req.id)}
                                        onDragEnd={handleDragEnd}
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 0.5,
                                            pl: 0.5,
                                            pr: 1,
                                            py: 0.75,
                                            borderRadius: 2,
                                            bgcolor: 'background.paper',
                                            border: '1px solid',
                                            borderColor: dragItemId === req.id ? accent : 'rgba(0,0,0,0.06)',
                                            cursor: readOnly ? 'default' : 'grab',
                                            opacity: dragItemId === req.id ? 0.4 : 1,
                                            transition: 'all 0.2s ease',
                                            boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                                            '&:hover': {
                                                borderColor: readOnly ? 'rgba(0,0,0,0.06)' : `${accent}50`,
                                                boxShadow: readOnly ? '0 1px 2px rgba(0,0,0,0.04)' : `0 2px 8px ${accent}14`,
                                                transform: readOnly ? 'none' : 'translateY(-1px)',
                                            },
                                            '&:hover .drag-handle': { opacity: 0.4 },
                                            '&:active': readOnly ? {} : { cursor: 'grabbing', transform: 'scale(0.98)' },
                                        }}
                                    >
                                        {/* Drag handle */}
                                        {!readOnly && (
                                            <DragIndicatorIcon
                                                className="drag-handle"
                                                sx={{
                                                    fontSize: 16,
                                                    color: 'text.secondary',
                                                    opacity: 0.15,
                                                    transition: 'opacity 0.15s',
                                                    flexShrink: 0,
                                                }}
                                            />
                                        )}
                                        <Box
                                            sx={{
                                                width: 4,
                                                minHeight: 18,
                                                alignSelf: 'stretch',
                                                borderRadius: 1,
                                                bgcolor: isLast ? '#22C55E' : accent,
                                                opacity: isLast ? 0.7 : 0.4,
                                                flexShrink: 0,
                                            }}
                                        />
                                        <Typography
                                            variant="body2"
                                            sx={{
                                                flex: 1,
                                                fontSize: '0.82rem',
                                                fontWeight: isLast ? 400 : 500,
                                                color: isLast ? 'text.secondary' : 'text.primary',
                                                textDecoration: isLast ? 'line-through' : 'none',
                                                wordBreak: 'break-word',
                                                pl: 0.5,
                                                lineHeight: 1.4,
                                            }}
                                        >
                                            {req.title}
                                        </Typography>
                                        {!readOnly && (
                                            <IconButton
                                                size="small"
                                                onClick={() => handleRemoveItem(req.id)}
                                                sx={{
                                                    p: 0.25,
                                                    color: 'text.secondary',
                                                    opacity: 0,
                                                    transition: 'opacity 0.15s, color 0.15s',
                                                    '.MuiBox-root:hover > &': { opacity: 0.5 },
                                                    '&:hover': { opacity: '1 !important', color: 'error.main' },
                                                    flexShrink: 0,
                                                }}
                                            >
                                                <DeleteOutlineIcon sx={{ fontSize: 14 }} />
                                            </IconButton>
                                        )}
                                    </Box>
                                ))}
                            </Box>

                            {/* Add item to column */}
                            {!readOnly && (
                                <Box sx={{ px: 1, pb: 1, pt: 0.5, borderTop: '1px solid', borderColor: colItems.length > 0 ? 'divider' : 'transparent' }}>
                                    {addingToColumn === col.id ? (
                                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                                            <TextField
                                                size="small"
                                                value={newTitle}
                                                onChange={(e) => setNewTitle(e.target.value)}
                                                onKeyDown={(e) => handleAddKeyDown(e, col.id)}
                                                onBlur={() => {
                                                    if (!newTitle.trim()) {
                                                        setAddingToColumn(null);
                                                        setNewTitle('');
                                                    }
                                                }}
                                                placeholder="Task name..."
                                                autoFocus
                                                sx={{
                                                    flex: 1,
                                                    '& .MuiInputBase-input': {
                                                        py: 0.5,
                                                        px: 0.75,
                                                        fontSize: '0.8rem',
                                                    },
                                                }}
                                            />
                                            <Button
                                                size="small"
                                                variant="contained"
                                                onClick={() => handleAddItem(col.id)}
                                                disabled={!newTitle.trim()}
                                                sx={{
                                                    minWidth: 'auto',
                                                    px: 1.5,
                                                    py: 0.25,
                                                    background: `linear-gradient(135deg, ${accent}, ${accent}CC)`,
                                                    '&:hover': { background: `linear-gradient(135deg, ${accent}DD, ${accent})` },
                                                    textTransform: 'none',
                                                    fontWeight: 600,
                                                    fontSize: '0.75rem',
                                                    borderRadius: 1.5,
                                                    boxShadow: 'none',
                                                }}
                                            >
                                                Add
                                            </Button>
                                        </Box>
                                    ) : (
                                        <Button
                                            size="small"
                                            startIcon={<AddIcon sx={{ fontSize: '14px !important' }} />}
                                            onClick={() => {
                                                setAddingToColumn(col.id);
                                                setNewTitle('');
                                            }}
                                            sx={{
                                                width: '100%',
                                                textTransform: 'none',
                                                fontWeight: 500,
                                                fontSize: '0.75rem',
                                                color: 'text.secondary',
                                                justifyContent: 'flex-start',
                                                borderRadius: 2,
                                                py: 0.5,
                                                border: '1px dashed',
                                                borderColor: 'transparent',
                                                '&:hover': {
                                                    bgcolor: `${accent}08`,
                                                    color: accent,
                                                    borderColor: `${accent}25`,
                                                },
                                            }}
                                        >
                                            Add task
                                        </Button>
                                    )}
                                </Box>
                            )}
                        </Box>
                    );
                })}

                {/* Add column button */}
                {!readOnly && (
                    <Box
                        onClick={handleAddColumn}
                        sx={{
                            minWidth: 100,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: 3,
                            border: '2px dashed',
                            borderColor: 'rgba(0,0,0,0.08)',
                            cursor: 'pointer',
                            transition: 'all 0.25s ease',
                            color: 'text.secondary',
                            opacity: 0.5,
                            '&:hover': {
                                opacity: 1,
                                borderColor: 'primary.main',
                                color: 'primary.main',
                                bgcolor: 'rgba(59, 130, 246, 0.04)',
                                transform: 'scale(1.02)',
                            },
                        }}
                    >
                        <AddIcon sx={{ fontSize: 20, mb: 0.25 }} />
                        <Typography variant="caption" fontWeight={600} fontSize="0.7rem">
                            Column
                        </Typography>
                    </Box>
                )}
            </Box>
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
    const [requirementColumns, setRequirementColumns] = useState<RequirementColumn[]>([...DEFAULT_REQUIREMENT_COLUMNS]);
    const [costs, setCosts] = useState<ApplicationCosts>({ ...EMPTY_COSTS });
    const [saving, setSaving] = useState(false);
    const [dirty, setDirty] = useState(false);

    useEffect(() => {
        if (open && application) {
            setEvents(application.events ?? []);

            // Load columns (or use defaults)
            const cols = application.requirementColumns?.length
                ? application.requirementColumns
                : [...DEFAULT_REQUIREMENT_COLUMNS];
            setRequirementColumns(cols);

            // Migrate legacy requirements that have `completed` but no `column`
            const rawReqs = application.requirements ?? [];
            const migratedReqs = rawReqs.map((r) => {
                if (r.column) return r;
                // Legacy: completed → last column, else → first column
                const targetCol = r.completed ? cols[cols.length - 1].id : cols[0].id;
                return { ...r, column: targetCol };
            });
            setRequirements(migratedReqs);

            setCosts(application.costs ?? { ...EMPTY_COSTS });
            setTab(0);
            setDirty(false);
        }
    }, [open, application]);

    const handleEventsChange = useCallback((newEvents: ApplicationEvent[]) => {
        setEvents(newEvents);
        setDirty(true);
    }, []);

    const handleRequirementsChange = useCallback((newReqs: ApplicationRequirement[], newCols: RequirementColumn[]) => {
        setRequirements(newReqs);
        setRequirementColumns(newCols);
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
                requirementColumns,
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
            maxWidth="md"
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
                    variant="scrollable"
                    scrollButtons="auto"
                    allowScrollButtonsMobile
                    sx={{
                        minHeight: 40,
                        '.MuiTab-root': {
                            minHeight: 40,
                            textTransform: 'none',
                            fontWeight: 600,
                            fontSize: { xs: '0.75rem', sm: '0.85rem' },
                            px: { xs: 1, sm: 2 },
                            minWidth: 'auto',
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
                                        label={`${requirements.filter((r) => r.column === (requirementColumns[requirementColumns.length - 1]?.id)).length}/${requirements.length}`}
                                        size="small"
                                        sx={{
                                            height: 18,
                                            fontSize: '0.65rem',
                                            fontWeight: 700,
                                            bgcolor: requirements.every((r) => r.column === (requirementColumns[requirementColumns.length - 1]?.id)) ? 'success.main' : 'primary.main',
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
                    <RequirementsTab requirements={requirements} columns={requirementColumns} onChange={handleRequirementsChange} readOnly={readOnly} />
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
