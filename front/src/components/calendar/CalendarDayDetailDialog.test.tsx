import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { CalendarDayDetailDialog } from './CalendarDayDetailDialog';

describe('CalendarDayDetailDialog component', () => {
    it('renders the dialog when properties provided', () => {
        render(
            <CalendarDayDetailDialog
                selectedDay={new Date(2023, 9, 10)}
                selectedDayEvents={[]}
                onClose={() => {}}
            />
        );
        expect(screen.getByText(/October 10, 2023/)).toBeInTheDocument();
    });
});
