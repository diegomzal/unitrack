import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import SharedWithMeSection from './SharedWithMeSection';

describe('SharedWithMeSection component', () => {
    it('renders correctly', () => {
        render(<SharedWithMeSection sharedGroups={[]} loading={false} onOpenDetails={() => {}} />);
        expect(screen.getByText('Shared with me')).toBeInTheDocument();
        expect(screen.getByText('Read-only view of applications shared by others')).toBeInTheDocument();
    });

    it('renders loading skeletons', () => {
        render(<SharedWithMeSection sharedGroups={[]} loading={true} onOpenDetails={() => {}} />);
        expect(screen.getByText('Shared with me')).toBeInTheDocument();
    });
});
