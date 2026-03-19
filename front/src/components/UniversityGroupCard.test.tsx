import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import UniversityGroupCard from './UniversityGroupCard';
import type { University } from '../types/university';
import type { Application } from '../types/application';

// Mock ApplicationCard to simplify test
vi.mock('./ApplicationCard', () => ({
    default: ({ application }: any) => <div data-testid="app-card">{application.title}</div>
}));

describe('UniversityGroupCard component', () => {
    const mockUni: University = {
        _id: 'u1',
        userId: 'u1',
        name: 'Stanford University',
        country: 'US',
        events: [],
        requirements: [],
        requirementColumns: [],
        costs: { tuitionFeePerYear: 0, livingCostPerYear: 0, scholarshipInfo: '' },
        notes: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    } as unknown as University;

    const mockApps: Application[] = [
        { _id: 'a1', title: 'App 1', universityId: 'u1', userId: 'u1', status: 'In progress', links: [], createdAt: '', updatedAt: '', university: 'Stanford University' } as any,
        { _id: 'a2', title: 'App 2', universityId: 'u1', userId: 'u1', status: 'In progress', links: [], createdAt: '', updatedAt: '', university: 'Stanford University' } as any
    ];

    it('renders university details correctly', () => {
        render(
            <UniversityGroupCard 
                university={mockUni} 
                applications={mockApps} 
                onOpenAppDetails={() => {}} 
                onOpenUniDetails={() => {}} 
            />
        );
        expect(screen.getByText('Stanford University')).toBeInTheDocument();
        expect(screen.getByText('2 programs')).toBeInTheDocument();
        expect(screen.getAllByTestId('app-card')).toHaveLength(2);
    });

    it('calls onOpenUniDetails when info button is clicked', async () => {
        const handleOpen = vi.fn();
        const user = userEvent.setup();

        render(
            <UniversityGroupCard 
                university={mockUni} 
                applications={mockApps} 
                onOpenAppDetails={() => {}} 
                onOpenUniDetails={handleOpen} 
            />
        );

        const infoButton = screen.getByLabelText('University Details');
        await user.click(infoButton);
        expect(handleOpen).toHaveBeenCalledWith(mockUni);
    });
});
