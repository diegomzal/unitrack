import { Snackbar, Alert } from '@mui/material';

interface AppSnackbarProps {
    open: boolean;
    message: string;
    severity: 'success' | 'info' | 'warning' | 'error';
    onClose: () => void;
}

export default function AppSnackbar({ open, message, severity, onClose }: AppSnackbarProps) {
    return (
        <Snackbar
            open={open}
            autoHideDuration={4000}
            onClose={onClose}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
            <Alert
                onClose={onClose}
                severity={severity}
                variant="filled"
                sx={{ width: '100%' }}
            >
                {message}
            </Alert>
        </Snackbar>
    );
}
