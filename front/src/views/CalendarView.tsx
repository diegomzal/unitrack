import { useState, useMemo } from 'react';
import { Container, Box, Typography, useMediaQuery, useTheme } from '@mui/material';
import {
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
    format,
    isSameDay,
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
import { useSharedApplications } from '../hooks/useSharedApplications';
import type { ApplicationEventType } from '../types/application';
import { EVENT_TYPE_LABELS } from '../types/application';
import { CalendarHeader } from '../components/calendar/CalendarHeader';
import { CalendarGrid } from '../components/calendar/CalendarGrid';
import { CalendarDayDetailDialog } from '../components/calendar/CalendarDayDetailDialog';
import { CalendarFilterMenu } from '../components/calendar/CalendarFilterMenu';
import { getEventIcon } from '../components/calendar/utils';
import type { CalendarEvent, WeekEventSegment } from '../components/calendar/types';

export default function CalendarView() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const { applications } = useApplications();
    const { sharedGroups } = useSharedApplications();

    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDay, setSelectedDay] = useState<Date | null>(null);
    const [showMyEvents, setShowMyEvents] = useState(true);
    const [hiddenShareIds, setHiddenShareIds] = useState<string[]>([]);
    const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(null);

    // Flatten all events from all applications (own + shared), applying filters
    const allCalendarEvents: CalendarEvent[] = useMemo(() => {
        const ownEvents: CalendarEvent[] = showMyEvents
            ? applications.flatMap((app) =>
                (app.events ?? []).map((event) => ({ event, application: app, isShared: false })),
            )
            : [];

        const sharedEvents: CalendarEvent[] = sharedGroups
            .filter((g) => !hiddenShareIds.includes(g.share._id))
            .flatMap((g) =>
                g.applications.flatMap((app) =>
                    (app.events ?? []).map((event) => ({
                        event,
                        application: app,
                        isShared: true,
                        ownerName: g.share.ownerName || g.share.ownerEmail,
                    })),
                ),
            );

        return [...ownEvents, ...sharedEvents];
    }, [applications, sharedGroups, showMyEvents, hiddenShareIds]);

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

    const handleToggleShareGroup = (id: string) => {
        setHiddenShareIds((prev) =>
            prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
        );
    };

    return (
        <Container maxWidth="lg" sx={{ py: 3, px: { xs: 1.5, sm: 3 } }}>
            <CalendarHeader
                currentMonth={currentMonth}
                onPrevMonth={handlePrevMonth}
                onNextMonth={handleNextMonth}
                onToday={handleToday}
                onFilterClick={(e) => setFilterAnchorEl(e.currentTarget)}
                isMobile={isMobile}
            />

            <CalendarGrid
                weeks={weeks}
                weekSegmentsMap={weekSegmentsMap}
                currentMonth={currentMonth}
                dayHasEvents={dayHasEvents}
                onSelectDay={setSelectedDay}
                isMobile={isMobile}
            />

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

            <CalendarDayDetailDialog
                selectedDay={selectedDay}
                selectedDayEvents={selectedDayEvents}
                onClose={() => setSelectedDay(null)}
            />

            <CalendarFilterMenu
                anchorEl={filterAnchorEl}
                onClose={() => setFilterAnchorEl(null)}
                showMyEvents={showMyEvents}
                onToggleMyEvents={() => setShowMyEvents((prev) => !prev)}
                sharedGroups={sharedGroups}
                hiddenShareIds={hiddenShareIds}
                onToggleShareGroup={handleToggleShareGroup}
            />
        </Container>
    );
}
