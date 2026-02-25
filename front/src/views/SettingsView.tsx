import { useEffect, useCallback, useReducer, useState } from 'react';
import { Container } from '@mui/material';
import { shareService, type UserSearchResult, type Share } from '../services/sharingService';
import { useApplications } from '../hooks/useApplications';
import { useSnackbar } from '../hooks/useSnackbar';
import { sharingReducer, initialSharingState } from '../components/settings/sharingReducer';
import SharingSection from '../components/settings/SharingSection';
import EditShareDialog from '../components/settings/EditShareDialog';

export default function SettingsView() {
    const { applications } = useApplications();
    const { showSnackbar, SnackbarComponent } = useSnackbar();

    const [sharingState, sharingDispatch] = useReducer(sharingReducer, initialSharingState);
    const [editingShare, setEditingShare] = useState<Share | null>(null);

    const loadShares = useCallback(async () => {
        sharingDispatch({ type: 'FETCH_START', payload: 'shares' });
        try {
            const data = await shareService.getMyShares();
            sharingDispatch({ type: 'FETCH_SUCCESS', payload: { kind: 'shares', data } });
        } catch {
            showSnackbar('Failed to load shares', 'error');
            sharingDispatch({ type: 'FETCH_ERROR', payload: 'shares' });
        }
    }, [showSnackbar]);

    const loadInvitations = useCallback(async () => {
        sharingDispatch({ type: 'FETCH_START', payload: 'invitations' });
        try {
            const data = await shareService.getInvitations();
            sharingDispatch({ type: 'FETCH_SUCCESS', payload: { kind: 'invitations', data } });
        } catch {
            showSnackbar('Failed to load invitations', 'error');
            sharingDispatch({ type: 'FETCH_ERROR', payload: 'invitations' });
        }
    }, [showSnackbar]);

    const loadReceivedShares = useCallback(async () => {
        sharingDispatch({ type: 'FETCH_START', payload: 'received' });
        try {
            const data = await shareService.getSharedWithMe();
            sharingDispatch({ type: 'FETCH_SUCCESS', payload: { kind: 'received', data } });
        } catch {
            showSnackbar('Failed to load received shares', 'error');
            sharingDispatch({ type: 'FETCH_ERROR', payload: 'received' });
        }
    }, [showSnackbar]);

    useEffect(() => {
        loadShares();
        loadInvitations();
        loadReceivedShares();
    }, [loadShares, loadInvitations, loadReceivedShares]);

    const handleAddShare = async (targetUser: UserSearchResult) => {
        try {
            await shareService.createShare({
                sharedWithId: targetUser.uid,
                sharedWithEmail: targetUser.email,
                sharedWithName: targetUser.displayName,
                shareAll: true,
            });
            showSnackbar(`Invitation sent to ${targetUser.email}`);
            loadShares();
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Failed to send invitation';
            showSnackbar(message, 'error');
        }
    };

    const handleDeleteShare = async (share: Share) => {
        try {
            await shareService.deleteShare(share._id);
            const msg = share.status === 'pending'
                ? `Invitation to ${share.sharedWithEmail} cancelled`
                : `Removed sharing with ${share.sharedWithEmail}`;
            showSnackbar(msg);
            loadShares();
        } catch {
            showSnackbar('Failed to remove share', 'error');
        }
    };

    const handleRespondToInvitation = async (invitation: Share, action: 'accept' | 'reject') => {
        try {
            await shareService.respondToShare(invitation._id, action);
            if (action === 'accept') {
                showSnackbar(`You are now viewing ${invitation.ownerName || invitation.ownerEmail}'s applications`);
            } else {
                showSnackbar('Invitation declined');
            }
            loadInvitations();
            loadReceivedShares();
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Failed to respond';
            showSnackbar(message, 'error');
        }
    };

    const handleRemoveReceivedShare = async (share: Share) => {
        try {
            await shareService.deleteShare(share._id);
            showSnackbar(`Stopped viewing ${share.ownerName || share.ownerEmail}'s applications`);
            loadReceivedShares();
        } catch {
            showSnackbar('Failed to remove share', 'error');
        }
    };

    const handleSaveEdit = async (share: Share, shareAll: boolean, applicationIds: string[]) => {
        try {
            await shareService.updateShare(share._id, {
                shareAll,
                applicationIds: shareAll ? [] : applicationIds,
            });
            showSnackbar('Share settings updated');
            setEditingShare(null);
            loadShares();
        } catch {
            showSnackbar('Failed to update share', 'error');
        }
    };

    return (
        <>
            <Container maxWidth="md" sx={{ flex: 1, py: 3, px: { xs: 2, sm: 3 } }}>
                <SharingSection
                    shares={sharingState.shares}
                    sharesLoading={sharingState.sharesLoading}
                    receivedShares={sharingState.receivedShares}
                    receivedLoading={sharingState.receivedLoading}
                    invitations={sharingState.invitations}
                    invitationsLoading={sharingState.invitationsLoading}
                    onRespond={handleRespondToInvitation}
                    onAddShare={handleAddShare}
                    onDeleteShare={handleDeleteShare}
                    onRemoveReceivedShare={handleRemoveReceivedShare}
                    onOpenEdit={setEditingShare}
                />
            </Container>

            <EditShareDialog
                open={editingShare !== null}
                share={editingShare}
                applications={applications}
                onClose={() => setEditingShare(null)}
                onSave={handleSaveEdit}
            />

            {SnackbarComponent}
        </>
    );
}
