import React, { useState } from 'react';
import {
    Box,
    Typography,
    TextField,
    Button,
    Chip,
    IconButton,
    LinearProgress,
} from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import ChecklistIcon from '@mui/icons-material/Checklist';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import AddIcon from '@mui/icons-material/Add';

import {
    type ApplicationRequirement,
    type RequirementColumn,
} from '../../types/application';

import { generateId } from './EventsTab';

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
                                boxShadow: isOver ? `0 0 0 1px ${accent}20` : 'none',
                            }}
                        >

                            {/* Column header */}
                            <Box
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 0.75,
                                    px: 2,
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
                                                flexShrink: 0,
                                                '& .MuiChip-label': {
                                                    px: 0.75,
                                                    overflow: 'visible',
                                                },
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

export default RequirementsTab;
