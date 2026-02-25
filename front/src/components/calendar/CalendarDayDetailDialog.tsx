import { Dialog, DialogTitle, DialogContent, Box, Typography, Chip, Divider } from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import { format, parseISO } from 'date-fns';
import { EVENT_TYPE_LABELS } from '../../types/application';
import type { CalendarEvent } from './types';

interface CalendarDayDetailDialogProps {
    selectedDay: Date | null;
    onClose: () => void;
    selectedDayEvents: CalendarEvent[];
}

export function CalendarDayDetailDialog({
    selectedDay,
    onClose,
    selectedDayEvents,
}: CalendarDayDetailDialogProps) {
    if (!selectedDay) return null;

    return (
        <Dialog
            open={selectedDay !== null}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
            PaperProps={{ sx: { borderRadius: 3 } }}
        >
            <DialogTitle sx={{ pb: 1 }}>
                <Typography variant="h6" fontWeight={700}>
                    {format(selectedDay, 'EEEE, MMMM d, yyyy')}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    {selectedDayEvents.length} event{selectedDayEvents.length !== 1 ? 's' : ''}
                </Typography>
            </DialogTitle>
            <DialogContent sx={{ pt: '8px !important' }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    {selectedDayEvents.map((ce) => (
                        <Box key={ce.event.id}>
                            <Box
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1.5,
                                    p: 1.5,
                                    borderRadius: 2,
                                    bgcolor: `${ce.event.color}11`,
                                    border: '1px solid',
                                    borderColor: `${ce.event.color}33`,
                                }}
                            >
                                <Box
                                    sx={{
                                        width: 4,
                                        height: 40,
                                        borderRadius: 1,
                                        bgcolor: ce.event.color,
                                        flexShrink: 0,
                                    }}
                                />
                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.25, flexWrap: 'wrap' }}>
                                        <Typography variant="body1" fontWeight={600}>
                                            {ce.event.title}
                                        </Typography>
                                        <Chip
                                            label={EVENT_TYPE_LABELS[ce.event.type]}
                                            size="small"
                                            sx={{
                                                height: 22,
                                                fontSize: '0.68rem',
                                                bgcolor: `${ce.event.color}22`,
                                                color: ce.event.color,
                                                fontWeight: 600,
                                            }}
                                        />
                                        {ce.isShared && (
                                            <Chip
                                                icon={<PeopleIcon sx={{ fontSize: '14px !important' }} />}
                                                label={ce.ownerName ?? 'Shared'}
                                                size="small"
                                                variant="outlined"
                                                sx={{
                                                    height: 22,
                                                    fontSize: '0.68rem',
                                                    fontWeight: 600,
                                                }}
                                            />
                                        )}
                                    </Box>
                                    <Typography variant="body2" color="text.secondary">
                                        {ce.application.title} — {ce.application.university}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        {format(parseISO(ce.event.date), 'MMM d, yyyy')}
                                        {ce.event.endDate && ` — ${format(parseISO(ce.event.endDate), 'MMM d, yyyy')}`}
                                    </Typography>
                                </Box>
                            </Box>
                            <Divider sx={{ mt: 1.5 }} />
                        </Box>
                    ))}
                </Box>
            </DialogContent>
        </Dialog>
    );
}
