import { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    FormControlLabel,
    Switch,
    Typography,
    Box,
    Checkbox,
    DialogActions,
    Button
} from '@mui/material';
import type { Share } from '../../services/sharingService';
import type { Application } from '../../types/application';

interface EditShareDialogProps {
    open: boolean;
    share: Share | null;
    applications: Application[];
    onClose: () => void;
    onSave: (share: Share, shareAll: boolean, applicationIds: string[]) => Promise<void>;
}

export default function EditShareDialog({
    open,
    share,
    applications,
    onClose,
    onSave
}: EditShareDialogProps) {
    const [editShareAll, setEditShareAll] = useState(true);
    const [editAppIds, setEditAppIds] = useState<string[]>([]);
    const [prevOpen, setPrevOpen] = useState(open);

    if (open !== prevOpen) {
        setPrevOpen(open);
        if (open && share) {
            setEditShareAll(share.shareAll);
            setEditAppIds(share.applicationIds || []);
        }
    }

    const toggleAppId = (appId: string) => {
        setEditAppIds(prev =>
            prev.includes(appId)
                ? prev.filter(id => id !== appId)
                : [...prev, appId],
        );
    };

    const handleSave = async () => {
        if (!share) return;
        await onSave(share, editShareAll, editAppIds);
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
        >
            <DialogTitle sx={{ fontWeight: 700 }}>
                Configure sharing with {share?.sharedWithName || share?.sharedWithEmail}
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
                <Button onClick={onClose} sx={{ textTransform: 'none' }}>
                    Cancel
                </Button>
                <Button
                    variant="contained"
                    onClick={handleSave}
                    sx={{ textTransform: 'none' }}
                >
                    Save
                </Button>
            </DialogActions>
        </Dialog>
    );
}
