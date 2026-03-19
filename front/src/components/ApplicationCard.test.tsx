import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import ApplicationCard from './ApplicationCard';
import type { Application } from '../types/application';

vi.mock('./StatusChip', () => ({
    default: ({ status }: any) => <div data-testid="status-chip">{status}</div>
}));

describe('ApplicationCard component', () => {
    const mockApp: Application = {
        _id: '123',
        userId: 'user1',
        title: 'BSc Computer Science',
        university: 'MIT',
        status: 'In progress',
        links: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    it('renders application details correctly', () => {
        render(
            <ApplicationCard 
                application={mockApp} 
                onOpenDetails={() => {}} 
            />
        );
        expect(screen.getByText('BSc Computer Science')).toBeInTheDocument();
        expect(screen.getByText('MIT')).toBeInTheDocument();
    });

    it('calls onDelete when delete button is clicked', async () => {
        const handleDelete = vi.fn();
        const user = userEvent.setup();

        render(
            <ApplicationCard 
                application={mockApp} 
                onOpenDetails={() => {}} 
                onDelete={handleDelete}
            />
        );

        const deleteButton = screen.getByLabelText('Delete');
        await user.click(deleteButton);
        expect(handleDelete).toHaveBeenCalledWith('123');
    });

    it('calls onEdit when edit button is clicked', async () => {
        const handleEdit = vi.fn();
        const user = userEvent.setup();

        render(
            <ApplicationCard 
                application={mockApp} 
                onOpenDetails={() => {}} 
                onEdit={handleEdit}
            />
        );

        const editButton = screen.getByLabelText('Edit');
        await user.click(editButton);
        expect(handleEdit).toHaveBeenCalledWith(mockApp);
    });

    it('calls onOpenDetails when info button is clicked', async () => {
        const handleOpenDetails = vi.fn();
        const user = userEvent.setup();

        render(
            <ApplicationCard 
                application={mockApp} 
                onOpenDetails={handleOpenDetails} 
            />
        );

        const infoButton = screen.getByLabelText('Details & Requirements');
        await user.click(infoButton);
        expect(handleOpenDetails).toHaveBeenCalledWith(mockApp);
    });
});
