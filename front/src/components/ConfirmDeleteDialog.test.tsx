import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import ConfirmDeleteDialog from './ConfirmDeleteDialog';

describe('ConfirmDeleteDialog component', () => {
    it('renders correctly when open', () => {
        render(
            <ConfirmDeleteDialog 
                open={true} 
                applicationTitle="Sample Application" 
                onClose={() => {}} 
                onConfirm={() => {}} 
            />
        );
        expect(screen.getByText('Delete Application')).toBeInTheDocument();
        expect(screen.getByText(/Are you sure you want to delete/i)).toBeInTheDocument();
        expect(screen.getByText('"Sample Application"')).toBeInTheDocument();
    });

    it('triggers onClose when Cancel is clicked', async () => {
        const handleClose = vi.fn();
        const user = userEvent.setup();
        
        render(
            <ConfirmDeleteDialog 
                open={true} 
                applicationTitle="App" 
                onClose={handleClose} 
                onConfirm={() => {}} 
            />
        );
        
        await user.click(screen.getByRole('button', { name: /Cancel/i }));
        expect(handleClose).toHaveBeenCalledTimes(1);
    });

    it('triggers onConfirm when Delete is clicked', async () => {
        const handleConfirm = vi.fn();
        const user = userEvent.setup();
        
        render(
            <ConfirmDeleteDialog 
                open={true} 
                applicationTitle="App" 
                onClose={() => {}} 
                onConfirm={handleConfirm} 
            />
        );
        
        await user.click(screen.getByRole('button', { name: /Delete/i }));
        expect(handleConfirm).toHaveBeenCalledTimes(1);
    });
});
