import { useState, useEffect } from 'react';
import {
    Paper,
    Typography,
    TextField,
    InputAdornment,
    Box,
    CircularProgress,
    Tooltip,
    IconButton,
    Avatar,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    ListItemSecondaryAction,
    Divider,
    Chip,
    Alert
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import HourglassTopIcon from '@mui/icons-material/HourglassTop';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { userService, type Share, type UserSearchResult } from '../../services/sharingService';
import ShareListSkeleton from './ShareListSkeleton';

interface SharingSectionProps {
    shares: Share[];
    sharesLoading: boolean;
    receivedShares: Share[];
    receivedLoading: boolean;
    onAddShare: (user: UserSearchResult) => Promise<void>;
    onDeleteShare: (share: Share) => Promise<void>;
    onRemoveReceivedShare: (share: Share) => Promise<void>;
    onOpenEdit: (share: Share) => void;
    invitations: Share[];
    invitationsLoading: boolean;
    onRespond: (invitation: Share, action: 'accept' | 'reject') => Promise<void>;
}

export default function SharingSection({
    shares,
    sharesLoading,
    receivedShares,
    receivedLoading,
    onAddShare,
    onDeleteShare,
    onRemoveReceivedShare,
    onOpenEdit,
    invitations,
    invitationsLoading,
    onRespond,
}: SharingSectionProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<UserSearchResult[]>([]);
    const [searching, setSearching] = useState(false);

    const isValidEmail = (email: string): boolean => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
    };

    useEffect(() => {
        if (!isValidEmail(searchQuery)) {
            setSearchResults([]);
            return;
        }

        const timer = setTimeout(async () => {
            setSearching(true);
            try {
                const results = await userService.searchByEmail(searchQuery.trim());
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

    const handleAdd = async (user: UserSearchResult) => {
        await onAddShare(user);
        setSearchQuery('');
        setSearchResults([]);
    };

    const pendingShares = shares.filter(s => s.status === 'pending');
    const acceptedShares = shares.filter(s => s.status === 'accepted');

    return (
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
                                    <Avatar src={result.photoURL || undefined} sx={{ width: 32, height: 32 }}>
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
                                        <IconButton edge="end" size="small" color="primary" onClick={() => handleAdd(result)}>
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

            <Divider sx={{ my: 3 }} />

            {/* Accepted shares */}
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                People you're sharing with
            </Typography>

            {sharesLoading ? (
                <List disablePadding>
                    <ShareListSkeleton count={3} actions={2} />
                </List>
            ) : acceptedShares.length === 0 ? (
                <Alert severity="info" sx={{ borderRadius: 2 }}>
                    You haven't shared your applications with anyone yet. Search by email above to send an invitation.
                </Alert>
            ) : (
                <List disablePadding>
                    {acceptedShares.map((share) => (
                        <ListItem key={share._id} sx={{ py: 1.5, px: 1, borderRadius: 2, '&:hover': { bgcolor: 'action.hover' } }}>
                            <ListItemAvatar>
                                <Avatar sx={{ width: 36, height: 36, bgcolor: 'primary.main' }}>
                                    {(share.sharedWithName || share.sharedWithEmail).charAt(0).toUpperCase()}
                                </Avatar>
                            </ListItemAvatar>
                            <ListItemText
                                primary={share.sharedWithName || share.sharedWithEmail}
                                secondary={
                                    <Box component="div" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.25 }}>
                                        {share.sharedWithEmail}
                                        <Chip component="span" label={share.shareAll ? 'All apps' : `${share.applicationIds.length} app(s)`} size="small" variant="outlined" sx={{ ml: 1, height: 20, fontSize: '0.7rem' }} />
                                    </Box>
                                }
                                primaryTypographyProps={{ fontWeight: 600, variant: 'body2' }}
                                secondaryTypographyProps={{ component: 'div' }}
                            />
                            <ListItemSecondaryAction>
                                <Tooltip title="Configure sharing">
                                    <IconButton size="small" onClick={() => onOpenEdit(share)} sx={{ mr: 0.5 }}>
                                        <EditIcon fontSize="small" />
                                    </IconButton>
                                </Tooltip>
                                <Tooltip title="Remove">
                                    <IconButton size="small" color="error" onClick={() => onDeleteShare(share)}>
                                        <DeleteIcon fontSize="small" />
                                    </IconButton>
                                </Tooltip>
                            </ListItemSecondaryAction>
                        </ListItem>
                    ))}
                </List>
            )}

            {/* People sharing with me section inside Sharing block */}
            <>
                <Divider sx={{ my: 3 }} />
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                    People sharing with you
                </Typography>

                {receivedLoading ? (
                    <>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            These users are sharing their applications with you. Remove to stop seeing their data.
                        </Typography>
                        <List disablePadding>
                            <ShareListSkeleton count={2} actions={1} />
                        </List>
                    </>
                ) : receivedShares.length === 0 ? (
                    <Alert severity="info" sx={{ borderRadius: 2 }}>
                        No one is sharing their applications with you yet.
                    </Alert>
                ) : (
                    <>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            These users are sharing their applications with you. Remove to stop seeing their data.
                        </Typography>
                        <List disablePadding>
                            {receivedShares.map((share) => (
                                <ListItem key={share._id} sx={{ py: 1.5, px: 1, borderRadius: 2, '&:hover': { bgcolor: 'action.hover' } }}>
                                    <ListItemAvatar>
                                        <Avatar sx={{ width: 36, height: 36, bgcolor: 'primary.main' }}>
                                            {(share.ownerName || share.ownerEmail).charAt(0).toUpperCase()}
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
                                            <IconButton size="small" color="error" onClick={() => onRemoveReceivedShare(share)}>
                                                <VisibilityOffIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                    </ListItemSecondaryAction>
                                </ListItem>
                            ))}
                        </List>
                    </>
                )}
            </>

            {/* Pending INVITATIONS to me */}
            {(!invitationsLoading && invitations.length > 0) || invitationsLoading ? (
                <>
                    <Divider sx={{ my: 3 }} />
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                            Pending Invitations
                        </Typography>
                        {!invitationsLoading && (
                            <Chip
                                label={invitations.length}
                                size="small"
                                color="warning"
                                sx={{ fontWeight: 700, height: 20, fontSize: '0.7rem' }}
                            />
                        )}
                    </Box>

                    {invitationsLoading ? (
                        <>
                            <List disablePadding>
                                <ShareListSkeleton count={2} actions={2} />
                            </List>
                        </>
                    ) : (
                        <>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                Other users would like to share their applications with you.
                            </Typography>
                            <List disablePadding>
                                {invitations.map((invitation) => (
                                    <ListItem
                                        key={invitation._id}
                                        sx={{
                                            py: 1.5,
                                            px: 1,
                                            mb: 1,
                                            borderRadius: 2,
                                            border: '1px solid',
                                            borderColor: 'warning.main',
                                            bgcolor: 'rgba(255, 152, 0, 0.04)',
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
                                            primary={invitation.ownerName || invitation.ownerEmail}
                                            secondary={`${invitation.ownerEmail} wants to share their applications with you`}
                                            primaryTypographyProps={{ variant: 'body2', fontWeight: 600 }}
                                            secondaryTypographyProps={{ variant: 'caption', color: 'text.secondary' }}
                                        />
                                        <ListItemSecondaryAction>
                                            <Tooltip title="Accept invitation">
                                                <IconButton
                                                    size="small"
                                                    color="success"
                                                    onClick={() => onRespond(invitation, 'accept')}
                                                    sx={{ mr: 0.5 }}
                                                >
                                                    <CheckCircleIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Decline invitation">
                                                <IconButton
                                                    size="small"
                                                    color="error"
                                                    onClick={() => onRespond(invitation, 'reject')}
                                                >
                                                    <CancelIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                        </ListItemSecondaryAction>
                                    </ListItem>
                                ))}
                            </List>
                        </>
                    )}
                </>
            ) : null}

            {/* Pending invites sent by me */}
            {!sharesLoading && pendingShares.length > 0 && (
                <>
                    <Divider sx={{ my: 3 }} />
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                            Invitations you've sent
                        </Typography>
                        <Chip label={pendingShares.length} size="small" color="warning" sx={{ fontWeight: 700, height: 20, fontSize: '0.7rem' }} />
                    </Box>

                    <List disablePadding>
                        {pendingShares.map((share) => (
                            <ListItem key={share._id} sx={{ py: 1.5, px: 1, borderRadius: 2, '&:hover': { bgcolor: 'action.hover' } }}>
                                <ListItemAvatar>
                                    <Avatar sx={{ width: 36, height: 36, bgcolor: 'grey.400' }}>
                                        {(share.sharedWithName || share.sharedWithEmail).charAt(0).toUpperCase()}
                                    </Avatar>
                                </ListItemAvatar>
                                <ListItemText
                                    primary={share.sharedWithName || share.sharedWithEmail}
                                    secondary={
                                        <Box component="div" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.25 }}>
                                            {share.sharedWithEmail}
                                            <Chip component="span" icon={<HourglassTopIcon sx={{ fontSize: '14px !important' }} />} label="Awaiting response" size="small" color="warning" variant="outlined" sx={{ ml: 1, height: 20, fontSize: '0.7rem' }} />
                                        </Box>
                                    }
                                    primaryTypographyProps={{ fontWeight: 600, variant: 'body2' }}
                                    secondaryTypographyProps={{ component: 'div' }}
                                />
                                <ListItemSecondaryAction>
                                    <Tooltip title="Cancel invitation">
                                        <IconButton size="small" color="error" onClick={() => onDeleteShare(share)}>
                                            <DeleteIcon fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                </ListItemSecondaryAction>
                            </ListItem>
                        ))}
                    </List>
                </>
            )}
        </Paper>
    );
}
