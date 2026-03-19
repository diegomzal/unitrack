import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import EditShareDialog from './EditShareDialog';

describe('EditShareDialog component', () => {
    it('renders settings sharing dialog', () => {
        const mockShare = { id: 'r1', sharedWithEmail: 'test@example.com', shareAll: true, applicationIds: [] } as any;
        render(
            <EditShareDialog
                open={true}
                share={mockShare}
                applications={[]}
                onClose={() => {}}
                onSave={async () => {}}
            />
        );
        expect(screen.getByText('Configure sharing with test@example.com')).toBeInTheDocument();
    });
});
