import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import SharedGroupSkeleton from './SharedGroupSkeleton';

describe('SharedGroupSkeleton component', () => {
    it('renders the correct number of skeletons by default', () => {
        const { container } = render(<SharedGroupSkeleton />);
        // By default it renders 2 items
        expect(container.children.length).toBe(2);
    });

    it('renders the specific count of skeletons when provided', () => {
        const { container } = render(<SharedGroupSkeleton count={4} />);
        expect(container.children.length).toBe(4);
    });
});
