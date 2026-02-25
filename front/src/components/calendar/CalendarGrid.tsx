import { Box, Typography } from '@mui/material';
import { format, isSameMonth, isToday, parseISO } from 'date-fns';
import { getEventIcon, WEEKDAY_LABELS } from './utils';
import type { WeekEventSegment } from './types';

interface CalendarGridProps {
    weeks: Date[][];
    weekSegmentsMap: Map<number, WeekEventSegment[]>;
    currentMonth: Date;
    dayHasEvents: Set<string>;
    onSelectDay: (day: Date) => void;
    isMobile: boolean;
}

export function CalendarGrid({
    weeks,
    weekSegmentsMap,
    currentMonth,
    dayHasEvents,
    onSelectDay,
    isMobile,
}: CalendarGridProps) {
    const DAY_MIN_HEIGHT = isMobile ? 50 : 90;
    const EVENT_ROW_HEIGHT = isMobile ? 16 : 22;
    const MAX_VISIBLE_SEGMENTS = isMobile ? 2 : 3;

    return (
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
                                        onClick={() => hasEvents && onSelectDay(day)}
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
                                const isShared = calEvent.isShared;

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
                                            // Dashed bottom border for shared events to visually distinguish
                                            borderBottom: isShared ? `1px dashed ${color}` : 'none',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 0.25,
                                            px: 0.5,
                                            overflow: 'hidden',
                                            pointerEvents: 'auto',
                                            cursor: 'pointer',
                                            transition: 'filter 0.15s',
                                            opacity: isShared ? 0.75 : 1,
                                            '&:hover': {
                                                filter: 'brightness(1.2)',
                                            },
                                        }}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            const eventStart = parseISO(calEvent.event.date);
                                            onSelectDay(eventStart);
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
    );
}
