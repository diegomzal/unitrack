import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ApplicationDetailsDialog from './ApplicationDetailsDialog';
import type { Application } from '../types/application';

vi.mock('../hooks/useCurrencyRates', () => ({
    useCurrencyRates: () => ({ rate: 1, loading: false })
}));

describe('ApplicationDetailsDialog component', () => {
    const mockApp = {
        _id: 'app1',
        title: 'BSc Computer Science',
        university: 'MIT',
        status: 'In progress',
        links: [],
        events: [],
        requirements: []
    } as unknown as Application;

    it('renders the dialog when open', () => {
        render(
            <ApplicationDetailsDialog
                open={true}
                application={mockApp}
                onClose={() => {}}
                onEdit={() => {}}
            />
        );
        expect(screen.getByText('BSc Computer Science')).toBeInTheDocument();
    });

    it('does not render when closed', () => {
        render(
            <ApplicationDetailsDialog
                open={false}
                application={mockApp}
                onClose={() => {}}
                onEdit={() => {}}
            />
        );
        expect(screen.queryByText('BSc Computer Science')).not.toBeInTheDocument();
    });
});
