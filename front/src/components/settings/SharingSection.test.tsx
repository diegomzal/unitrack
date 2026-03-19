import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import SharingSection from './SharingSection';

describe('SharingSection component', () => {
    it('renders sharing section properly', () => {
        render(<SharingSection 
            shares={[]} 
            sharesLoading={false} 
            receivedShares={[]} 
            receivedLoading={false} 
            onAddShare={async () => {}} 
            onDeleteShare={async () => {}} 
            onRemoveReceivedShare={async () => {}} 
            onOpenEdit={() => {}} 
            invitations={[]} 
            invitationsLoading={false} 
            onRespond={async () => {}} 
        />);
        expect(screen.getByText("You haven't shared your applications with anyone yet. Search by email above to send an invitation.")).toBeInTheDocument();
    });

    it('renders skeletons when loading', () => {
        render(<SharingSection 
            shares={[]} 
            sharesLoading={true} 
            receivedShares={[]} 
            receivedLoading={false} 
            onAddShare={async () => {}} 
            onDeleteShare={async () => {}} 
            onRemoveReceivedShare={async () => {}} 
            onOpenEdit={() => {}} 
            invitations={[]} 
            invitationsLoading={false} 
            onRespond={async () => {}} 
        />);
        expect(screen.queryByText("You haven't shared your applications with anyone yet. Search by email above to send an invitation.")).not.toBeInTheDocument();
    });
});
