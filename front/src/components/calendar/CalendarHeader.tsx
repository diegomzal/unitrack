import { Box, IconButton, Typography } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import FilterListIcon from '@mui/icons-material/FilterList';
import TodayIcon from '@mui/icons-material/Today';
import { format } from 'date-fns';

interface CalendarHeaderProps {
    currentMonth: Date;
    onPrevMonth: () => void;
    onNextMonth: () => void;
    onToday: () => void;
    onFilterClick: (e: React.MouseEvent<HTMLElement>) => void;
    isMobile: boolean;
}

export function CalendarHeader({
    currentMonth,
    onPrevMonth,
    onNextMonth,
    onToday,
    onFilterClick,
    isMobile,
}: CalendarHeaderProps) {
    return (
        <Box
            sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                mb: 3,
                flexWrap: 'wrap',
                gap: 1,
            }}
        >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <IconButton onClick={onPrevMonth} size="small">
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
                <IconButton onClick={onNextMonth} size="small">
                    <ChevronRightIcon />
                </IconButton>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <IconButton
                    onClick={onFilterClick}
                    size="small"
                    sx={{
                        color: 'text.secondary',
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 2,
                        px: 1.5,
                        gap: 0.5,
                    }}
                >
                    <FilterListIcon sx={{ fontSize: 18 }} />
                    {!isMobile && (
                        <Typography variant="caption" fontWeight={600}>
                            Filter
                        </Typography>
                    )}
                </IconButton>
                <IconButton
                    onClick={onToday}
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
        </Box>
    );
}
