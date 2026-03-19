import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import EventsTab from './EventsTab';

describe('EventsTab component', () => {
    it('renders events correctly', () => {
        const mockEvents = [
            { id: 'e1', title: 'Interview', type: 'event' as const, date: '2023-10-10', color: '#ff0000' }
        ];
        render(<EventsTab events={mockEvents as any} onChange={() => {}} />);
        expect(screen.getByText('Interview')).toBeInTheDocument();
        expect(screen.getByText(/Oct 10, 2023/)).toBeInTheDocument();
    });

    it('renders empty state if no events', () => {
        render(<EventsTab events={[]} onChange={() => {}} />);
        expect(screen.getByText('No events added yet')).toBeInTheDocument();
    });
});
