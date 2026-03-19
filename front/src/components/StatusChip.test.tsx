import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import StatusChip from './StatusChip';
import type { ApplicationStatus } from '../types/application';

describe('StatusChip', () => {
    it('renders the status text', () => {
        render(<StatusChip status="Accepted" />);
        expect(screen.getByText('Accepted')).toBeInTheDocument();
    });

    it('applies the correct config based on status', () => {
        const statuses: ApplicationStatus[] = [
            'Not started',
            'In progress',
            'Submitted',
            'Interview',
            'Accepted',
            'Rejected',
            'Waitlisted'
        ];

        statuses.forEach(status => {
            const { unmount } = render(<StatusChip status={status} />);
            expect(screen.getByText(status)).toBeInTheDocument();
            unmount();
        });
    });
});
