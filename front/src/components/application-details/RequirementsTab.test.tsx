import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import RequirementsTab from './RequirementsTab';

describe('RequirementsTab component', () => {
    const mockColumns = [{ id: '1', title: 'Column 1' as any, order: 0 }];

    it('renders requirements correctly', () => {
        const mockRequirements = [
            { id: 'r1', title: 'Transcript', required: true, completed: false, column: '1' }
        ];
        render(<RequirementsTab requirements={mockRequirements as any} columns={mockColumns} onChange={() => {}} />);
        expect(screen.getByText('Transcript')).toBeInTheDocument();
    });

    it('renders empty state if no requirements', () => {
        render(<RequirementsTab requirements={[]} columns={mockColumns} onChange={() => {}} />);
        expect(screen.getByText('Column 1')).toBeInTheDocument();
        expect(screen.queryByText('Transcript')).not.toBeInTheDocument();
    });
});
