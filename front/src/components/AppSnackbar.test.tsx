import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import AppSnackbar from './AppSnackbar';

describe('AppSnackbar component', () => {
    it('renders the message when open is true', () => {
        render(<AppSnackbar open={true} message="Test successful" severity="success" onClose={() => {}} />);
        expect(screen.getByText('Test successful')).toBeInTheDocument();
    });

    it('does not render when open is false', () => {
        render(<AppSnackbar open={false} message="Test hidden" severity="info" onClose={() => {}} />);
        expect(screen.queryByText('Test hidden')).not.toBeInTheDocument();
    });
});
