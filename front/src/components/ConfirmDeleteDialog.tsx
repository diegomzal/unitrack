import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
} from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

interface ConfirmDeleteDialogProps {
    open: boolean;
    applicationTitle: string;
    onClose: () => void;
    onConfirm: () => void;
}

const ConfirmDeleteDialog: React.FC<ConfirmDeleteDialogProps> = ({
    open,
    applicationTitle,
    onClose,
    onConfirm,
}) => {
    return (
        <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <WarningAmberIcon color="warning" />
                Delete Application
            </DialogTitle>
            <DialogContent>
                <Typography variant="body1">
                    Are you sure you want to delete <strong>"{applicationTitle}"</strong>? This action cannot be undone.
                </Typography>
            </DialogContent>
            <DialogActions sx={{ px: 3, py: 2 }}>
                <Button onClick={onClose} color="inherit">
                    Cancel
                </Button>
                <Button onClick={onConfirm} variant="contained" color="error">
                    Delete
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ConfirmDeleteDialog;
