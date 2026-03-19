import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import CurrencyConverter from './CurrencyConverter';

// Mock the hook
vi.mock('../../hooks/useCurrencyRates', () => ({
    useCurrencyRates: vi.fn(() => ({
        rate: 1.1,
        loading: false,
        error: null,
        lastUpdated: '2023-10-10',
        refresh: vi.fn()
    }))
}));

describe('CurrencyConverter component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders the base converter component', () => {
        render(<CurrencyConverter countryCode="GB" totalAnnualUsd={100} />);
        expect(screen.getByText('Currency Converter')).toBeInTheDocument();
        // Since rate is 1.1 (1 GBP = 1.1 USD), inverse is 1/1.1
        // Wait, the test uses default logic.
    });

    it('expands when clicked', async () => {
        const user = userEvent.setup();
        render(<CurrencyConverter countryCode="GB" totalAnnualUsd={100} />);
        
        const header = screen.getByText('Currency Converter');
        await user.click(header);
        
        expect(screen.getByLabelText('Currency')).toBeInTheDocument();
    });
});
