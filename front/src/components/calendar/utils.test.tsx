import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { getEventIcon, WEEKDAY_LABELS } from './utils';

describe('calendar utils', () => {
    describe('WEEKDAY_LABELS', () => {
        it('has 7 days starting with Sun', () => {
            expect(WEEKDAY_LABELS).toEqual(['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']);
        });
    });

    describe('getEventIcon', () => {
        it('renders deadline icon', () => {
            const { container } = render(getEventIcon('deadline'));
            expect(container.querySelector('svg')).toBeInTheDocument();
            expect(container.querySelector('svg')?.getAttribute('data-testid')).toBe('FlagIcon');
        });

        it('renders date-range icon', () => {
            const { container } = render(getEventIcon('date-range'));
            expect(container.querySelector('svg')).toBeInTheDocument();
            expect(container.querySelector('svg')?.getAttribute('data-testid')).toBe('DateRangeIcon');
        });

        it('renders event icon', () => {
            const { container } = render(getEventIcon('event'));
            expect(container.querySelector('svg')).toBeInTheDocument();
            expect(container.querySelector('svg')?.getAttribute('data-testid')).toBe('EventIcon');
        });
    });
});
