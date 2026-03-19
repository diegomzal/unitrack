import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import UniversityDetailsDialog from './UniversityDetailsDialog';
import type { University } from '../types/university';


vi.mock('../hooks/useCurrencyRates', () => ({
    useCurrencyRates: () => ({ rate: 1, loading: false })
}));

describe('UniversityDetailsDialog component', () => {
    const mockUni = {
        _id: 'u1',
        name: 'MIT',
        country: 'US',
        events: [],
        requirements: []
    } as unknown as University;

    it('renders the dialog when open', () => {
        render(
            <UniversityDetailsDialog
                open={true}
                university={mockUni}
                onClose={() => {}}
            />
        );
        expect(screen.getByText('MIT')).toBeInTheDocument();
    });
});
