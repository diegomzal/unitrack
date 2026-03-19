import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import EmptyState from './EmptyState';

describe('EmptyState component', () => {
    it('renders the empty state text properly', () => {
        render(<EmptyState onAdd={() => {}} />);
        expect(screen.getByText('No Applications Yet')).toBeInTheDocument();
        expect(screen.getByText(/Start tracking your university applications/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Add Your First Application/i })).toBeInTheDocument();
    });

    it('triggers onAdd callback when the add button is clicked', async () => {
        const handleAdd = vi.fn();
        const user = userEvent.setup();
        
        render(<EmptyState onAdd={handleAdd} />);
        
        const addButton = screen.getByRole('button', { name: /Add Your First Application/i });
        await user.click(addButton);
        
        expect(handleAdd).toHaveBeenCalledTimes(1);
    });
});
