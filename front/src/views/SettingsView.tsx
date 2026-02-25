import { useState, useEffect, useCallback } from 'react';
import {
    Container,
    Box,
    Typography,
    Paper,
    TextField,
    Button,
    IconButton,
    Avatar,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    ListItemSecondaryAction,
    Switch,
    Divider,
    CircularProgress,
    Chip,
    InputAdornment,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Checkbox,
    FormControlLabel,
    Alert,
    Tooltip,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import LogoutIcon from '@mui/icons-material/Logout';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import HourglassTopIcon from '@mui/icons-material/HourglassTop';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { useAuth } from '../contexts/AuthContext';
import {
    userService,
    shareService,
    type UserSearchResult,
    type Share,
} from '../services/sharingService';
import { useApplications } from '../hooks/useApplications';
import { useSnackbar } from '../hooks/useSnackbar';

export default function SettingsView() {
    const { user, signOut } = useAuth();
    const { applications } = useApplications();
    const { showSnackbar, SnackbarComponent } = useSnackbar();

    // Shares state (shares I created as owner)
    const [shares, setShares] = useState<Share[]>([]);
    const [sharesLoading, setSharesLoading] = useState(true);

    // Invitations state (pending shares addressed to me)
    const [invitations, setInvitations] = useState<Share[]>([]);
    const [invitationsLoading, setInvitationsLoading] = useState(true);

    // Received shares state (accepted shares from others)
    const [receivedShares, setReceivedShares] = useState<Share[]>([]);
    const [receivedLoading, setReceivedLoading] = useState(true);

    // Search state
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<UserSearchResult[]>([]);
    const [searching, setSearching] = useState(false);

    // Edit dialog state
    const [editingShare, setEditingShare] = useState<Share | null>(null);
    const [editShareAll, setEditShareAll] = useState(true);
    const [editAppIds, setEditAppIds] = useState<string[]>([]);

    const loadShares = useCallback(async () => {
        try {
            const data = await shareService.getMyShares();
            setShares(data);
        } catch {
            showSnackbar('Failed to load shares', 'error');
        } finally {
            setSharesLoading(false);
        }
    }, [showSnackbar]);

    const loadInvitations = useCallback(async () => {
        try {
            const data = await shareService.getInvitations();
            setInvitations(data);
        } catch {
            showSnackbar('Failed to load invitations', 'error');
        } finally {
            setInvitationsLoading(false);
        }
    }, [showSnackbar]);

    const loadReceivedShares = useCallback(async () => {
        try {
            const data = await shareService.getSharedWithMe();
            setReceivedShares(data);
        } catch {
            showSnackbar('Failed to load received shares', 'error');
        } finally {
            setReceivedLoading(false);
        }
    }, [showSnackbar]);

    useEffect(() => {
        loadShares();
        loadInvitations();
        loadReceivedShares();
    }, [loadShares, loadInvitations, loadReceivedShares]);

    // Validate email format (must be a full email like user@domain.tld)
    const isValidEmail = (email: string): boolean => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
    };

    // Search only when a full email is entered
    useEffect(() => {
        if (!isValidEmail(searchQuery)) {
            setSearchResults([]);
            return;
        }

        const timer = setTimeout(async () => {
            setSearching(true);
            try {
                const results = await userService.searchByEmail(searchQuery.trim());
                // Filter out users already shared with (any status)
                const sharedIds = new Set(shares.map(s => s.sharedWithId));
                setSearchResults(results.filter(r => !sharedIds.has(r.uid)));
            } catch {
                setSearchResults([]);
            } finally {
                setSearching(false);
            }
        }, 400);

        return () => clearTimeout(timer);
    }, [searchQuery, shares]);

    const handleAddShare = async (targetUser: UserSearchResult) => {
        try {
            await shareService.createShare({
                sharedWithId: targetUser.uid,
                sharedWithEmail: targetUser.email,
                sharedWithName: targetUser.displayName,
                shareAll: true,
            });
            showSnackbar(`Invitation sent to ${targetUser.email}`);
            setSearchQuery('');
            setSearchResults([]);
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

    const handleOpenEdit = (share: Share) => {
        setEditingShare(share);
        setEditShareAll(share.shareAll);
        setEditAppIds(share.applicationIds || []);
    };

    const handleSaveEdit = async () => {
        if (!editingShare) return;
        try {
            await shareService.updateShare(editingShare._id, {
                shareAll: editShareAll,
                applicationIds: editShareAll ? [] : editAppIds,
            });
            showSnackbar('Share settings updated');
            setEditingShare(null);
            loadShares();
        } catch {
            showSnackbar('Failed to update share', 'error');
        }
    };

    const toggleAppId = (appId: string) => {
        setEditAppIds(prev =>
            prev.includes(appId)
                ? prev.filter(id => id !== appId)
                : [...prev, appId],
        );
    };

    // Split owner shares into pending and accepted
    const pendingShares = shares.filter(s => s.status === 'pending');
    const acceptedShares = shares.filter(s => s.status === 'accepted');

    return (
        <>
            <Container maxWidth="md" sx={{ flex: 1, py: 3, px: { xs: 2, sm: 3 } }}>
                {/* Profile Section */}
                <Paper
                    sx={{
                        p: 3,
                        mb: 3,
                        borderRadius: 3,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: 2,
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar
                            src={user?.photoURL || undefined}
                            sx={{ width: 56, height: 56 }}
                        >
                            {user?.displayName?.charAt(0) || user?.email?.charAt(0) || '?'}
                        </Avatar>
                        <Box>
                            <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                                {user?.displayName || 'User'}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {user?.email}
                            </Typography>
                        </Box>
                    </Box>
                    <Button
                        variant="outlined"
                        color="error"
                        startIcon={<LogoutIcon />}
                        onClick={signOut}
                        sx={{ textTransform: 'none' }}
                    >
                        Sign out
                    </Button>
                </Paper>

                {/* Pending Invitations Section (for the recipient) */}
                {!invitationsLoading && invitations.length > 0 && (
                    <Paper
                        sx={{
                            p: 3,
                            mb: 3,
                            borderRadius: 3,
                            border: '1px solid',
                            borderColor: 'warning.main',
                            bgcolor: 'rgba(255, 152, 0, 0.04)',
                        }}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <HourglassTopIcon sx={{ color: 'warning.main', fontSize: 22 }} />
                            <Typography variant="h6" sx={{ fontWeight: 700 }}>
                                Pending Invitations
                            </Typography>
                            <Chip
                                label={invitations.length}
                                size="small"
                                color="warning"
                                sx={{ fontWeight: 700, height: 22 }}
                            />
                        </Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            Other users would like to share their applications with you.
                        </Typography>

                        <List disablePadding>
                            {invitations.map((invitation) => (
                                <ListItem
                                    key={invitation._id}
                                    sx={{
                                        py: 1.5,
                                        px: 1.5,
                                        mb: 1,
                                        borderRadius: 2,
                                        border: '1px solid',
                                        borderColor: 'divider',
                                        bgcolor: 'background.paper',
                                    }}
                                >
                                    <ListItemAvatar>
                                        <Avatar sx={{ width: 36, height: 36, bgcolor: 'primary.main' }}>
                                            {(invitation.ownerName || invitation.ownerEmail)
                                                .charAt(0)
                                                .toUpperCase()}
                                        </Avatar>
                                    </ListItemAvatar>
                                    <ListItemText
                                        primary={
                                            <Typography variant="body2" fontWeight={600}>
                                                {invitation.ownerName || invitation.ownerEmail}
                                            </Typography>
                                        }
                                        secondary={
                                            <Typography variant="caption" color="text.secondary">
                                                {invitation.ownerEmail} wants to share their applications with you
                                            </Typography>
                                        }
                                    />
                                    <ListItemSecondaryAction>
                                        <Tooltip title="Accept invitation">
                                            <IconButton
                                                size="small"
                                                color="success"
                                                onClick={() => handleRespondToInvitation(invitation, 'accept')}
                                                sx={{ mr: 0.5 }}
                                            >
                                                <CheckCircleIcon />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Decline invitation">
                                            <IconButton
                                                size="small"
                                                color="error"
                                                onClick={() => handleRespondToInvitation(invitation, 'reject')}
                                            >
                                                <CancelIcon />
                                            </IconButton>
                                        </Tooltip>
                                    </ListItemSecondaryAction>
                                </ListItem>
                            ))}
                        </List>
                    </Paper>
                )}

                {/* Sharing Section */}
                <Paper sx={{ p: 3, borderRadius: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                        Sharing
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        Share your applications with friends. They'll receive an invitation to accept.
                    </Typography>

                    {/* Search to add */}
                    <TextField
                        fullWidth
                        size="small"
                        placeholder="Enter full email address to find user..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        slotProps={{
                            input: {
                                startAdornment: (
                                    <InputAdornment position="start">
                                        {searching ? (
                                            <CircularProgress size={18} />
                                        ) : (
                                            <SearchIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                                        )}
                                    </InputAdornment>
                                ),
                            },
                        }}
                        sx={{ mb: 1 }}
                    />

                    {/* Search results */}
                    {searchResults.length > 0 && (
                        <Paper variant="outlined" sx={{ mb: 3, borderRadius: 2 }}>
                            <List dense disablePadding>
                                {searchResults.map((result) => (
                                    <ListItem key={result.uid} sx={{ py: 1 }}>
                                        <ListItemAvatar>
                                            <Avatar
                                                src={result.photoURL || undefined}
                                                sx={{ width: 32, height: 32 }}
                                            >
                                                {(result.displayName || result.email).charAt(0).toUpperCase()}
                                            </Avatar>
                                        </ListItemAvatar>
                                        <ListItemText
                                            primary={result.displayName || result.email}
                                            secondary={result.email}
                                            primaryTypographyProps={{ variant: 'body2', fontWeight: 600 }}
                                            secondaryTypographyProps={{ variant: 'caption' }}
                                        />
                                        <ListItemSecondaryAction>
                                            <Tooltip title="Send invitation">
                                                <IconButton
                                                    edge="end"
                                                    size="small"
                                                    color="primary"
                                                    onClick={() => handleAddShare(result)}
                                                >
                                                    <PersonAddIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                        </ListItemSecondaryAction>
                                    </ListItem>
                                ))}
                            </List>
                        </Paper>
                    )}

                    {searchQuery.length > 0 && !isValidEmail(searchQuery) && (
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                            Enter a complete email address (e.g. user@example.com)
                        </Typography>
                    )}

                    {/* Pending invites sent by me */}
                    {pendingShares.length > 0 && (
                        <>
                            <Divider sx={{ my: 2 }} />
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                    Pending Invitations
                                </Typography>
                                <Chip
                                    label={pendingShares.length}
                                    size="small"
                                    color="warning"
                                    sx={{ fontWeight: 700, height: 20, fontSize: '0.7rem' }}
                                />
                            </Box>

                            <List disablePadding>
                                {pendingShares.map((share) => (
                                    <ListItem
                                        key={share._id}
                                        sx={{
                                            py: 1.5,
                                            px: 1,
                                            borderRadius: 2,
                                            '&:hover': { bgcolor: 'action.hover' },
                                        }}
                                    >
                                        <ListItemAvatar>
                                            <Avatar
                                                sx={{
                                                    width: 36,
                                                    height: 36,
                                                    bgcolor: 'grey.400',
                                                }}
                                            >
                                                {(share.sharedWithName || share.sharedWithEmail)
                                                    .charAt(0)
                                                    .toUpperCase()}
                                            </Avatar>
                                        </ListItemAvatar>
                                        <ListItemText
                                            primary={share.sharedWithName || share.sharedWithEmail}
                                            secondary={
                                                <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.25 }}>
                                                    {share.sharedWithEmail}
                                                    <Chip
                                                        icon={<HourglassTopIcon sx={{ fontSize: '14px !important' }} />}
                                                        label="Awaiting response"
                                                        size="small"
                                                        color="warning"
                                                        variant="outlined"
                                                        sx={{ ml: 1, height: 20, fontSize: '0.7rem' }}
                                                    />
                                                </Box>
                                            }
                                            primaryTypographyProps={{ fontWeight: 600, variant: 'body2' }}
                                        />
                                        <ListItemSecondaryAction>
                                            <Tooltip title="Cancel invitation">
                                                <IconButton
                                                    size="small"
                                                    color="error"
                                                    onClick={() => handleDeleteShare(share)}
                                                >
                                                    <DeleteIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                        </ListItemSecondaryAction>
                                    </ListItem>
                                ))}
                            </List>
                        </>
                    )}

                    <Divider sx={{ my: 2 }} />

                    {/* Accepted shares */}
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                        People you're sharing with
                    </Typography>

                    {sharesLoading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                            <CircularProgress size={24} />
                        </Box>
                    ) : acceptedShares.length === 0 ? (
                        <Alert severity="info" sx={{ borderRadius: 2 }}>
                            You haven't shared your applications with anyone yet. Search by email above to send an invitation.
                        </Alert>
                    ) : (
                        <List disablePadding>
                            {acceptedShares.map((share) => (
                                <ListItem
                                    key={share._id}
                                    sx={{
                                        py: 1.5,
                                        px: 1,
                                        borderRadius: 2,
                                        '&:hover': { bgcolor: 'action.hover' },
                                    }}
                                >
                                    <ListItemAvatar>
                                        <Avatar sx={{ width: 36, height: 36, bgcolor: 'primary.main' }}>
                                            {(share.sharedWithName || share.sharedWithEmail)
                                                .charAt(0)
                                                .toUpperCase()}
                                        </Avatar>
                                    </ListItemAvatar>
                                    <ListItemText
                                        primary={share.sharedWithName || share.sharedWithEmail}
                                        secondary={
                                            <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.25 }}>
                                                {share.sharedWithEmail}
                                                <Chip
                                                    label={share.shareAll ? 'All apps' : `${share.applicationIds.length} app(s)`}
                                                    size="small"
                                                    variant="outlined"
                                                    sx={{ ml: 1, height: 20, fontSize: '0.7rem' }}
                                                />
                                            </Box>
                                        }
                                        primaryTypographyProps={{ fontWeight: 600, variant: 'body2' }}
                                    />
                                    <ListItemSecondaryAction>
                                        <Tooltip title="Configure sharing">
                                            <IconButton
                                                size="small"
                                                onClick={() => handleOpenEdit(share)}
                                                sx={{ mr: 0.5 }}
                                            >
                                                <EditIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Remove">
                                            <IconButton
                                                size="small"
                                                color="error"
                                                onClick={() => handleDeleteShare(share)}
                                            >
                                                <DeleteIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                    </ListItemSecondaryAction>
                                </ListItem>
                            ))}
                        </List>
                    )}
                </Paper>

                {/* People sharing with me (accepted, manageable) */}
                {!receivedLoading && receivedShares.length > 0 && (
                    <Paper sx={{ p: 3, mt: 3, borderRadius: 3 }}>
                        <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                            People sharing with you
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            These users are sharing their applications with you. Remove to stop seeing their data.
                        </Typography>

                        <List disablePadding>
                            {receivedShares.map((share) => (
                                <ListItem
                                    key={share._id}
                                    sx={{
                                        py: 1.5,
                                        px: 1,
                                        borderRadius: 2,
                                        '&:hover': { bgcolor: 'action.hover' },
                                    }}
                                >
                                    <ListItemAvatar>
                                        <Avatar sx={{ width: 36, height: 36, bgcolor: 'primary.main' }}>
                                            {(share.ownerName || share.ownerEmail)
                                                .charAt(0)
                                                .toUpperCase()}
                                        </Avatar>
                                    </ListItemAvatar>
                                    <ListItemText
                                        primary={share.ownerName || share.ownerEmail}
                                        secondary={share.ownerEmail}
                                        primaryTypographyProps={{ fontWeight: 600, variant: 'body2' }}
                                        secondaryTypographyProps={{ variant: 'caption' }}
                                    />
                                    <ListItemSecondaryAction>
                                        <Tooltip title="Stop viewing their applications">
                                            <IconButton
                                                size="small"
                                                color="error"
                                                onClick={() => handleRemoveReceivedShare(share)}
                                            >
                                                <VisibilityOffIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                    </ListItemSecondaryAction>
                                </ListItem>
                            ))}
                        </List>
                    </Paper>
                )}
            </Container>

            {/* Edit Share Dialog */}
            <Dialog
                open={editingShare !== null}
                onClose={() => setEditingShare(null)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle sx={{ fontWeight: 700 }}>
                    Configure sharing with {editingShare?.sharedWithName || editingShare?.sharedWithEmail}
                </DialogTitle>
                <DialogContent>
                    <FormControlLabel
                        control={
                            <Switch
                                checked={editShareAll}
                                onChange={(e) => setEditShareAll(e.target.checked)}
                                color="primary"
                            />
                        }
                        label="Share all applications"
                        sx={{ mb: 2 }}
                    />

                    {!editShareAll && (
                        <>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                Select which applications to share:
                            </Typography>
                            {applications.length === 0 ? (
                                <Typography variant="body2" color="text.secondary">
                                    No applications to share.
                                </Typography>
                            ) : (
                                <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
                                    {applications.map((app) => (
                                        <FormControlLabel
                                            key={app._id}
                                            control={
                                                <Checkbox
                                                    checked={editAppIds.includes(app._id)}
                                                    onChange={() => toggleAppId(app._id)}
                                                    size="small"
                                                />
                                            }
                                            label={
                                                <Box>
                                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                        {app.title}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        {app.university}
                                                    </Typography>
                                                </Box>
                                            }
                                            sx={{ display: 'flex', mb: 0.5 }}
                                        />
                                    ))}
                                </Box>
                            )}
                        </>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setEditingShare(null)} sx={{ textTransform: 'none' }}>
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleSaveEdit}
                        sx={{ textTransform: 'none' }}
                    >
                        Save
                    </Button>
                </DialogActions>
            </Dialog>

            {SnackbarComponent}
        </>
    );
}
