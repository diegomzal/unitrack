import type { ApplicationEventType } from '../../types/application';
import FlagIcon from '@mui/icons-material/Flag';
import DateRangeIcon from '@mui/icons-material/DateRange';
import EventIcon from '@mui/icons-material/Event';

export const getEventIcon = (type: ApplicationEventType, fontSize = 12) => {
    switch (type) {
        case 'deadline':
            return <FlagIcon sx={{ fontSize }} />;
        case 'date-range':
            return <DateRangeIcon sx={{ fontSize }} />;
        case 'event':
            return <EventIcon sx={{ fontSize }} />;
    }
};

export const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
