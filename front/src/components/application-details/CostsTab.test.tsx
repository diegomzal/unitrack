import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import CostsTab from './CostsTab';

vi.mock('./CurrencyConverter', () => ({
    default: () => <div data-testid="currency-converter" />
}));

describe('CostsTab component', () => {
    const defaultCosts = { tuitionFeePerYear: null, livingCostPerYear: null, scholarshipInfo: '' };

    it('renders the costs correcty when provided', () => {
        render(
            <CostsTab
                costs={{ tuitionFeePerYear: 10000, livingCostPerYear: 5000, scholarshipInfo: 'test info' }}
                onChange={() => {}}
                countryCode="US"
            />
        );
        // Total should be 15000
        expect(screen.getByText(/15,000/)).toBeInTheDocument();
        // Breakdowns
        expect(screen.getByText(/Tuition:.*10,000/)).toBeInTheDocument();
        expect(screen.getByText(/Living:.*5,000/)).toBeInTheDocument();
    });

    it('renders with empty costs and onChange handler', () => {
        render(<CostsTab costs={defaultCosts} onChange={() => {}} />);
        expect(screen.getByText('Estimated Annual Cost')).toBeInTheDocument();
    });
});
