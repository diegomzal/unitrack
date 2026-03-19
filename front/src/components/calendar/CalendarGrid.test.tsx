import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { CalendarGrid } from './CalendarGrid';

describe('CalendarGrid component', () => {
    it('renders the calendar grid correctly', () => {
        const mockWeeks = [
            [new Date(2023, 9, 1), new Date(2023, 9, 2), new Date(2023, 9, 3)]
        ];
        render(
            <CalendarGrid
                weeks={mockWeeks}
                weekSegmentsMap={new Map()}
                currentMonth={new Date(2023, 9, 10)}
                dayHasEvents={new Set()}
                onSelectDay={() => {}}
                isMobile={false}
            />
        );
        
        expect(screen.getByText('1')).toBeInTheDocument();
        expect(screen.getByText('2')).toBeInTheDocument();
    });
});
