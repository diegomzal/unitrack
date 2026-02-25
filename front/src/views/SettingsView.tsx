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

    // Shares state
    const [shares, setShares] = useState<Share[]>([]);
    const [sharesLoading, setSharesLoading] = useState(true);

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

    useEffect(() => {
        loadShares();
    }, [loadShares]);

    // Debounced user search
    useEffect(() => {
        if (searchQuery.length < 3) {
            setSearchResults([]);
            return;
        }

        const timer = setTimeout(async () => {
            setSearching(true);
            try {
                const results = await userService.searchByEmail(searchQuery);
                // Filter out users already shared with
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
            showSnackbar(`Sharing with ${targetUser.email}`);
            setSearchQuery('');
            setSearchResults([]);
            loadShares();
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Failed to add share';
            showSnackbar(message, 'error');
        }
    };

    const handleDeleteShare = async (share: Share) => {
        try {
            await shareService.deleteShare(share._id);
            showSnackbar(`Removed sharing with ${share.sharedWithEmail}`);
            loadShares();
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

                {/* Sharing Section */}
                <Paper sx={{ p: 3, borderRadius: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                        Sharing
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        Share your applications with friends. They'll get read-only access.
                    </Typography>

                    {/* Search to add */}
                    <TextField
                        fullWidth
                        size="small"
                        placeholder="Search by email to add..."
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
                                            <IconButton
                                                edge="end"
                                                size="small"
                                                color="primary"
                                                onClick={() => handleAddShare(result)}
                                            >
                                                <PersonAddIcon fontSize="small" />
                                            </IconButton>
                                        </ListItemSecondaryAction>
                                    </ListItem>
                                ))}
                            </List>
                        </Paper>
                    )}

                    {searchQuery.length > 0 && searchQuery.length < 3 && (
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                            Type at least 3 characters to search
                        </Typography>
                    )}

                    <Divider sx={{ my: 2 }} />

                    {/* Current shares */}
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                        People you're sharing with
                    </Typography>

                    {sharesLoading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                            <CircularProgress size={24} />
                        </Box>
                    ) : shares.length === 0 ? (
                        <Alert severity="info" sx={{ borderRadius: 2 }}>
                            You haven't shared your applications with anyone yet. Search by email above to add someone.
                        </Alert>
                    ) : (
                        <List disablePadding>
                            {shares.map((share) => (
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
