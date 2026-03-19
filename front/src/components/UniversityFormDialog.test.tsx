import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import UniversityFormDialog from './UniversityFormDialog';
import type { University } from '../types/university';

vi.mock('../contexts/AuthContext', () => ({
    useAuth: () => ({ currentUser: { uid: 'u1' } })
}));

describe('UniversityFormDialog component', () => {


    it('renders the edit university dialog', () => {
        const mockUni = { _id: 'u1', name: 'MIT' } as unknown as University;
        render(
            <UniversityFormDialog
                open={true}
                university={mockUni}
                onClose={() => {}}
                onSave={() => Promise.resolve()}
            />
        );
        expect(screen.getByText('Edit University')).toBeInTheDocument();
    });
});
