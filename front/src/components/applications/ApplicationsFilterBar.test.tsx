import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import ApplicationsFilterBar from './ApplicationsFilterBar';

describe('ApplicationsFilterBar component', () => {
    it('renders properly and allows text input', async () => {
        const handleSearchChange = vi.fn();
        const user = userEvent.setup();
        
        render(
            <ApplicationsFilterBar
                searchQuery=""
                onSearchChange={handleSearchChange}
                statusFilter="all"
                onStatusChange={() => {}}
                sortOption="createdAt"
                onSortChange={() => {}}
                disabled={false}
            />
        );
        
        const input = screen.getByPlaceholderText('Search programs, universities...');
        expect(input).toBeInTheDocument();
        
        await user.type(input, 'MIT');
        expect(handleSearchChange).toHaveBeenCalled();
    });
});
