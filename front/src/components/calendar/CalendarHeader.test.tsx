import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { CalendarHeader } from './CalendarHeader';

describe('CalendarHeader component', () => {
    it('renders the header correctly', () => {
        render(
            <CalendarHeader
                currentMonth={new Date(2023, 9, 10)}
                onPrevMonth={() => {}}
                onNextMonth={() => {}}
                onToday={() => {}}
                onFilterClick={() => {}}
                isMobile={false}
            />
        );
        expect(screen.getByText('October 2023')).toBeInTheDocument();
    });
});
