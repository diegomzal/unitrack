import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import ApplicationCardSkeleton from './ApplicationCardSkeleton';

describe('ApplicationCardSkeleton component', () => {
    it('renders the correct number of skeletons by default', () => {
        const { container } = render(<ApplicationCardSkeleton />);
        // By default it renders 6 items, each is wrapped in a Card
        const cards = container.querySelectorAll('.MuiCard-root');
        expect(cards.length).toBe(6);
    });

    it('renders the specific count of skeletons when provided', () => {
        const { container } = render(<ApplicationCardSkeleton count={3} />);
        const cards = container.querySelectorAll('.MuiCard-root');
        expect(cards.length).toBe(3);
    });
});
