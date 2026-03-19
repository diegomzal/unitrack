import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import ShareListSkeleton from './ShareListSkeleton';

describe('ShareListSkeleton component', () => {
    it('renders the correct number of skeletons by default', () => {
        const { container } = render(<ShareListSkeleton />);
        // By default it renders 3 items (ListItem)
        const listItems = container.querySelectorAll('.MuiListItem-root');
        expect(listItems.length).toBe(3);
    });

    it('renders the specific count of skeletons when provided', () => {
        const { container } = render(<ShareListSkeleton count={5} actions={2} />);
        const listItems = container.querySelectorAll('.MuiListItem-root');
        expect(listItems.length).toBe(5);
    });
});
