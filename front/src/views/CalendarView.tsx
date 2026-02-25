import { useState, useMemo } from 'react';
import {
    Container,
    Box,
    Typography,
    IconButton,
    Chip,
    useMediaQuery,
    useTheme,
    Dialog,
    DialogTitle,
    DialogContent,
    Divider,
} from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import TodayIcon from '@mui/icons-material/Today';
import FlagIcon from '@mui/icons-material/Flag';
import DateRangeIcon from '@mui/icons-material/DateRange';
import EventIcon from '@mui/icons-material/Event';
import {
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
    format,
    isSameMonth,
    isSameDay,
    isToday,
    addMonths,
    subMonths,
    parseISO,
    differenceInCalendarDays,
    max as dateMax,
    min as dateMin,
    getDay,
    isWithinInterval,
} from 'date-fns';

import { useApplications } from '../hooks/useApplications';
import type { Application, ApplicationEvent, ApplicationEventType } from '../types/application';
import { EVENT_TYPE_LABELS } from '../types/application';

/** Event with parent application info attached */
interface CalendarEvent {
    event: ApplicationEvent;
    application: Application;
}

/** A visual segment for a multi-day or single-day event within a specific week row */
interface WeekEventSegment {
    calEvent: CalendarEvent;
    startCol: number;   // 0-indexed column (day of week)
    span: number;       // number of columns to span
    isStart: boolean;   // is this the beginning of the event?
    isEnd: boolean;     // is this the end of the event?
}

const getEventIcon = (type: ApplicationEventType, fontSize = 12) => {
    switch (type) {
        case 'deadline':
            return <FlagIcon sx={{ fontSize }} />;
        case 'date-range':
            return <DateRangeIcon sx={{ fontSize }} />;
        case 'event':
            return <EventIcon sx={{ fontSize }} />;
    }
};

const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function CalendarView() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const { applications } = useApplications();

    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDay, setSelectedDay] = useState<Date | null>(null);

    // Flatten all events from all applications
    const allCalendarEvents: CalendarEvent[] = useMemo(() => {
        return applications.flatMap((app) =>
            (app.events ?? []).map((event) => ({ event, application: app })),
        );
    }, [applications]);

    // Calendar grid info
    const { weeks } = useMemo(() => {
        const monthStart = startOfMonth(currentMonth);
        const monthEnd = endOfMonth(currentMonth);
        const gridStart = startOfWeek(monthStart);
        const gridEnd = endOfWeek(monthEnd);
        const days = eachDayOfInterval({ start: gridStart, end: gridEnd });

        // Split into weeks
        const wks: Date[][] = [];
        for (let i = 0; i < days.length; i += 7) {
            wks.push(days.slice(i, i + 7));
        }
        return { weeks: wks };
    }, [currentMonth]);

    // Compute event segments for each week (for continuous date-range rendering)
    const weekSegmentsMap = useMemo(() => {
        const map = new Map<number, WeekEventSegment[]>();

        weeks.forEach((weekDays, weekIndex) => {
            const weekStart = weekDays[0];
            const weekEnd = weekDays[6];
            const segments: WeekEventSegment[] = [];

            allCalendarEvents.forEach((ce) => {
                const eventStart = parseISO(ce.event.date);
                const eventEnd = ce.event.type === 'date-range' && ce.event.endDate
                    ? parseISO(ce.event.endDate)
                    : eventStart;

                // Check if this event overlaps with this week
                if (eventEnd < weekStart || eventStart > weekEnd) return;

                // Clamp to this week
                const clampedStart = dateMax([eventStart, weekStart]);
                const clampedEnd = dateMin([eventEnd, weekEnd]);

                const startCol = getDay(clampedStart);
                const span = differenceInCalendarDays(clampedEnd, clampedStart) + 1;

                segments.push({
                    calEvent: ce,
                    startCol,
                    span,
                    isStart: isSameDay(clampedStart, eventStart),
                    isEnd: isSameDay(clampedEnd, eventEnd),
                });
            });

            // Sort: multi-day events first, then by start column
            segments.sort((a, b) => {
                const aMulti = a.span > 1 ? 0 : 1;
                const bMulti = b.span > 1 ? 0 : 1;
                if (aMulti !== bMulti) return aMulti - bMulti;
                return a.startCol - b.startCol;
            });

            map.set(weekIndex, segments);
        });

        return map;
    }, [weeks, allCalendarEvents]);

    // Day events for the detail dialog
    const selectedDayEvents = useMemo(() => {
        if (!selectedDay) return [];
        return allCalendarEvents.filter((ce) => {
            const eventStart = parseISO(ce.event.date);
            const eventEnd = ce.event.type === 'date-range' && ce.event.endDate
                ? parseISO(ce.event.endDate)
                : eventStart;
            return isWithinInterval(selectedDay, { start: eventStart, end: eventEnd })
                || isSameDay(selectedDay, eventStart);
        });
    }, [selectedDay, allCalendarEvents]);

    // Day has events check (for click cursor)
    const dayHasEvents = useMemo(() => {
        const set = new Set<string>();
        allCalendarEvents.forEach((ce) => {
            const eventStart = parseISO(ce.event.date);
            const eventEnd = ce.event.type === 'date-range' && ce.event.endDate
                ? parseISO(ce.event.endDate)
                : eventStart;
            const days = eachDayOfInterval({ start: eventStart, end: eventEnd });
            days.forEach((d) => set.add(format(d, 'yyyy-MM-dd')));
        });
        return set;
    }, [allCalendarEvents]);

    const handlePrevMonth = () => setCurrentMonth((m) => subMonths(m, 1));
    const handleNextMonth = () => setCurrentMonth((m) => addMonths(m, 1));
    const handleToday = () => setCurrentMonth(new Date());

    const DAY_MIN_HEIGHT = isMobile ? 50 : 90;
    const EVENT_ROW_HEIGHT = isMobile ? 16 : 22;
    const MAX_VISIBLE_SEGMENTS = isMobile ? 2 : 3;

    return (
        <Container maxWidth="lg" sx={{ py: 3, px: { xs: 1.5, sm: 3 } }}>
            {/* Header */}
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    mb: 3,
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <IconButton onClick={handlePrevMonth} size="small">
                        <ChevronLeftIcon />
                    </IconButton>
                    <Typography
                        variant="h5"
                        sx={{
                            fontWeight: 700,
                            minWidth: { xs: 160, sm: 220 },
                            textAlign: 'center',
                        }}
                    >
                        {format(currentMonth, 'MMMM yyyy')}
                    </Typography>
                    <IconButton onClick={handleNextMonth} size="small">
                        <ChevronRightIcon />
                    </IconButton>
                </Box>
                <IconButton
                    onClick={handleToday}
                    size="small"
                    sx={{
                        color: 'primary.main',
                        border: '1px solid',
                        borderColor: 'primary.main',
                        borderRadius: 2,
                        px: 1.5,
                        gap: 0.5,
                    }}
                >
                    <TodayIcon sx={{ fontSize: 18 }} />
                    {!isMobile && (
                        <Typography variant="caption" fontWeight={600}>
                            Today
                        </Typography>
                    )}
                </IconButton>
            </Box>

            {/* Calendar */}
            <Box
                sx={{
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 3,
                    overflow: 'hidden',
                    bgcolor: 'background.paper',
                }}
            >
                {/* Weekday Headers */}
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
                    {WEEKDAY_LABELS.map((label) => (
                        <Box
                            key={label}
                            sx={{
                                py: 1.5,
                                textAlign: 'center',
                                bgcolor: 'rgba(59, 130, 246, 0.06)',
                                borderBottom: '1px solid',
                                borderColor: 'divider',
                            }}
                        >
                            <Typography
                                variant="caption"
                                fontWeight={700}
                                color="text.secondary"
                                sx={{ textTransform: 'uppercase', letterSpacing: '0.08em' }}
                            >
                                {isMobile ? label.charAt(0) : label}
                            </Typography>
                        </Box>
                    ))}
                </Box>

                {/* Week rows */}
                {weeks.map((weekDays, weekIndex) => {
                    const segments = weekSegmentsMap.get(weekIndex) ?? [];
                    const visibleSegments = segments.slice(0, MAX_VISIBLE_SEGMENTS);
                    const overflow = segments.length - MAX_VISIBLE_SEGMENTS;

                    return (
                        <Box key={weekIndex} sx={{ position: 'relative' }}>
                            {/* Day number row + cells */}
                            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
                                {weekDays.map((day) => {
                                    const key = format(day, 'yyyy-MM-dd');
                                    const inCurrentMonth = isSameMonth(day, currentMonth);
                                    const today = isToday(day);
                                    const hasEvents = dayHasEvents.has(key);

                                    return (
                                        <Box
                                            key={key}
                                            onClick={() => hasEvents && setSelectedDay(day)}
                                            sx={{
                                                minHeight: DAY_MIN_HEIGHT,
                                                borderBottom: '1px solid',
                                                borderRight: '1px solid',
                                                borderColor: 'divider',
                                                opacity: inCurrentMonth ? 1 : 0.35,
                                                cursor: hasEvents ? 'pointer' : 'default',
                                                transition: 'background-color 0.15s',
                                                '&:hover': hasEvents
                                                    ? { bgcolor: 'rgba(59, 130, 246, 0.05)' }
                                                    : {},
                                                display: 'flex',
                                                flexDirection: 'column',
                                                p: { xs: 0.25, sm: 0.5 },
                                            }}
                                        >
                                            {/* Day number */}
                                            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                                                <Typography
                                                    variant="caption"
                                                    sx={{
                                                        width: today ? 24 : 'auto',
                                                        height: today ? 24 : 'auto',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        borderRadius: '50%',
                                                        fontWeight: today ? 700 : 400,
                                                        bgcolor: today ? 'primary.main' : 'transparent',
                                                        color: today
                                                            ? '#fff'
                                                            : inCurrentMonth
                                                                ? 'text.primary'
                                                                : 'text.secondary',
                                                    }}
                                                >
                                                    {format(day, 'd')}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    );
                                })}
                            </Box>

                            {/* Event segments overlay */}
                            <Box
                                sx={{
                                    position: 'absolute',
                                    top: { xs: 26, sm: 30 },
                                    left: 0,
                                    right: 0,
                                    pointerEvents: 'none',
                                }}
                            >
                                {visibleSegments.map((seg, segIndex) => {
                                    const { calEvent, startCol, span, isStart, isEnd } = seg;
                                    const color = calEvent.event.color;
                                    const isMultiDay = calEvent.event.type === 'date-range';

                                    return (
                                        <Box
                                            key={`${calEvent.event.id}-${weekIndex}-${segIndex}`}
                                            sx={{
                                                position: 'absolute',
                                                top: segIndex * (EVENT_ROW_HEIGHT + 2),
                                                left: `calc(${(startCol / 7) * 100}% + 2px)`,
                                                width: `calc(${(span / 7) * 100}% - 4px)`,
                                                height: EVENT_ROW_HEIGHT,
                                                bgcolor: isMultiDay ? `${color}30` : `${color}22`,
                                                borderRadius: isMultiDay
                                                    ? `${isStart ? 6 : 0}px ${isEnd ? 6 : 0}px ${isEnd ? 6 : 0}px ${isStart ? 6 : 0}px`
                                                    : '4px',
                                                borderLeft: isStart ? `3px solid ${color}` : 'none',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 0.25,
                                                px: 0.5,
                                                overflow: 'hidden',
                                                pointerEvents: 'auto',
                                                cursor: 'pointer',
                                                transition: 'filter 0.15s',
                                                '&:hover': {
                                                    filter: 'brightness(1.2)',
                                                },
                                            }}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                const eventStart = parseISO(calEvent.event.date);
                                                setSelectedDay(eventStart);
                                            }}
                                        >
                                            {isStart && !isMobile && getEventIcon(calEvent.event.type)}
                                            <Typography
                                                variant="caption"
                                                sx={{
                                                    fontSize: isMobile ? '0.5rem' : '0.68rem',
                                                    fontWeight: 600,
                                                    color,
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    whiteSpace: 'nowrap',
                                                    lineHeight: 1.3,
                                                }}
                                            >
                                                {isStart ? calEvent.event.title : ''}
                                            </Typography>
                                        </Box>
                                    );
                                })}
                                {overflow > 0 && (
                                    <Typography
                                        variant="caption"
                                        color="text.secondary"
                                        sx={{
                                            position: 'absolute',
                                            top: MAX_VISIBLE_SEGMENTS * (EVENT_ROW_HEIGHT + 2),
                                            left: 4,
                                            fontSize: '0.55rem',
                                            fontWeight: 600,
                                        }}
                                    >
                                        +{overflow} more
                                    </Typography>
                                )}
                            </Box>
                        </Box>
                    );
                })}
            </Box>

            {/* Legend */}
            {allCalendarEvents.length > 0 && (
                <Box sx={{ mt: 2, display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
                    {(['deadline', 'date-range', 'event'] as ApplicationEventType[]).map((type) => (
                        <Box key={type} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            {getEventIcon(type)}
                            <Typography variant="caption" color="text.secondary">
                                {EVENT_TYPE_LABELS[type]}
                            </Typography>
                        </Box>
                    ))}
                </Box>
            )}

            {/* Empty state */}
            {allCalendarEvents.length === 0 && (
                <Box sx={{ textAlign: 'center', py: 6 }}>
                    <EventIcon sx={{ fontSize: 48, color: 'text.secondary', opacity: 0.4, mb: 2 }} />
                    <Typography variant="h6" color="text.secondary">
                        No events yet
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Add deadlines, date ranges, or events to your applications to see them here.
                    </Typography>
                </Box>
            )}

            {/* Day Detail Dialog */}
            <Dialog
                open={selectedDay !== null}
                onClose={() => setSelectedDay(null)}
                maxWidth="sm"
                fullWidth
                PaperProps={{ sx: { borderRadius: 3 } }}
            >
                {selectedDay && (
                    <>
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
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.25 }}>
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
                    </>
                )}
            </Dialog>
        </Container>
    );
}
