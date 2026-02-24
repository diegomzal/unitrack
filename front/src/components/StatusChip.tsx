import { Chip, type ChipProps } from '@mui/material';
import type { ApplicationStatus } from '../types/application';

const STATUS_CONFIG: Record<ApplicationStatus, { color: ChipProps['color']; variant: ChipProps['variant'] }> = {
    'Not started': { color: 'default', variant: 'outlined' },
    'In progress': { color: 'info', variant: 'filled' },
    'Submitted': { color: 'primary', variant: 'filled' },
    'Interview': { color: 'warning', variant: 'filled' },
    'Accepted': { color: 'success', variant: 'filled' },
    'Rejected': { color: 'error', variant: 'filled' },
    'Waitlisted': { color: 'warning', variant: 'outlined' },
};

interface StatusChipProps {
    status: ApplicationStatus;
    size?: 'small' | 'medium';
}

const StatusChip: React.FC<StatusChipProps> = ({ status, size = 'small' }) => {
    const config = STATUS_CONFIG[status];

    return (
        <Chip
            label={status}
            color={config.color}
            variant={config.variant}
            size={size}
        />
    );
};

export default StatusChip;
