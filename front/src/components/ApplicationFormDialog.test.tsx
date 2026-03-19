import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ApplicationFormDialog from './ApplicationFormDialog';
import type { Application } from '../types/application';
import type { University } from '../types/university';

vi.mock('../contexts/AuthContext', () => ({
    useAuth: () => ({ currentUser: { uid: 'u1' } })
}));

describe('ApplicationFormDialog component', () => {
    const mockUnis: University[] = [];

    it('renders the add application dialog when open', () => {
        render(
            <ApplicationFormDialog
                open={true}
                onClose={() => {}}
                onSave={() => Promise.resolve()}
                existingUniversities={['u1']}
                universities={mockUnis}
                application={null}
            />
        );
        expect(screen.getByText('New Application')).toBeInTheDocument();
    });

    it('renders the edit application dialog when editing', () => {
        const mockApp = { _id: '1', title: 'Test App', universityId: 'u1', links: [] } as unknown as Application;
        render(
            <ApplicationFormDialog
                open={true}
                application={mockApp}
                onClose={() => {}}
                onSave={() => Promise.resolve()}
                existingUniversities={['u1']}
                universities={mockUnis}
            />
        );
        expect(screen.getByText('Edit Application')).toBeInTheDocument();
    });
});
