import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { CalendarFilterMenu } from './CalendarFilterMenu';

describe('CalendarFilterMenu component', () => {
    it('renders filter menu', () => {
        render(
            <CalendarFilterMenu
                anchorEl={document.body}
                onClose={() => {}}
                showMyEvents={true}
                onToggleMyEvents={() => {}}
                sharedGroups={[]}
                hiddenShareIds={[]}
                onToggleShareGroup={() => {}}
            />
        );
        expect(screen.getByText('My Applications')).toBeInTheDocument();
    });
});
