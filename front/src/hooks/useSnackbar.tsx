import { useState, useCallback } from 'react';
import AppSnackbar from '../components/AppSnackbar';

export function useSnackbar() {
    const [snackbar, setSnackbar] = useState<{
        open: boolean;
        message: string;
        severity: 'success' | 'info' | 'warning' | 'error'
    }>({
        open: false,
        message: '',
        severity: 'success',
    });

    const showSnackbar = useCallback((message: string, severity: 'success' | 'info' | 'warning' | 'error' = 'success') => {
        setSnackbar({ open: true, message, severity });
    }, []);

    const hideSnackbar = useCallback(() => {
        setSnackbar((prev) => ({ ...prev, open: false }));
    }, []);

    const SnackbarComponent = (
        <AppSnackbar
            open={snackbar.open}
            message={snackbar.message}
            severity={snackbar.severity}
            onClose={hideSnackbar}
        />
    );

    return { showSnackbar, SnackbarComponent };
}
