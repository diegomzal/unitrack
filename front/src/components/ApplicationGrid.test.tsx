import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ApplicationGrid from './ApplicationGrid';

vi.mock('./ApplicationCard', () => ({
    default: ({ application }: any) => <div data-testid="app-card">{application.title}</div>
}));

vi.mock('./UniversityGroupCard', () => ({
    default: ({ university, applications }: any) => (
        <div data-testid="uni-card">
            {university.name} - {applications.length} apps
        </div>
    )
}));

describe('ApplicationGrid component', () => {
    const mockApps: any[] = [
        { _id: 'a1', title: 'App 1', universityId: 'u1' },
        { _id: 'a2', title: 'App 2', universityId: 'u1' },
        { _id: 'a3', title: 'App 3' } // no university or not matching
    ];

    const mockUnis: any[] = [
        { _id: 'u1', name: 'Uni 1' }
    ];

    it('groups applications by university and renders correctly', () => {
        render(
            <ApplicationGrid 
                applications={mockApps} 
                universities={mockUnis} 
                onOpenDetails={() => {}} 
                onOpenUniDetails={() => {}} 
            />
        );

        expect(screen.getByTestId('uni-card')).toBeInTheDocument();
        expect(screen.getByText('Uni 1 - 2 apps')).toBeInTheDocument();

        expect(screen.getByTestId('app-card')).toBeInTheDocument();
        expect(screen.getByText('App 3')).toBeInTheDocument();
    });
});
