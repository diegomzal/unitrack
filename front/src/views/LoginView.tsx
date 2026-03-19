import { useState } from 'react';
import {
    Box,
    Button,
    Typography,
    Paper,
    CircularProgress,
    Alert,
    useTheme,
} from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import GoogleIcon from '@mui/icons-material/Google';
import { useAuth } from '../contexts/AuthContext';

export default function LoginView() {
    const { signInWithGoogle } = useAuth();
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleGoogleSignIn = async () => {
        setLoading(true);
        setError(null);
        try {
            await signInWithGoogle();
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Failed to sign in';
            // Don't show error for popup closed by user
            if (!message.includes('popup-closed-by-user')) {
                setError(message);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: isDark
                    ? 'linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #0F172A 100%)'
                    : 'linear-gradient(135deg, #E8F0FE 0%, #F4F6FB 50%, #E8F0FE 100%)',
                p: 2,
            }}
        >
            <Paper
                elevation={0}
                sx={{
                    maxWidth: 420,
                    width: '100%',
                    p: { xs: 3, sm: 5 },
                    borderRadius: 4,
                    textAlign: 'center',
                    bgcolor: isDark ? 'rgba(30, 41, 59, 0.8)' : 'rgba(255, 255, 255, 0.85)',
                    backdropFilter: 'blur(20px)',
                    border: isDark
                        ? '1px solid rgba(148, 163, 184, 0.1)'
                        : '1px solid rgba(59, 130, 246, 0.12)',
                    boxShadow: isDark
                        ? 'none'
                        : '0 8px 32px rgba(0, 0, 0, 0.08)',
                }}
            >
                {/* Logo */}
                <Box
                    sx={{
                        width: 72,
                        height: 72,
                        borderRadius: '20px',
                        background: 'linear-gradient(135deg, #3B82F6, #2563EB)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mx: 'auto',
                        mb: 3,
                        boxShadow: '0 8px 32px rgba(59, 130, 246, 0.3)',
                    }}
                >
                    <SchoolIcon sx={{ fontSize: 36, color: '#fff' }} />
                </Box>

                <Typography
                    variant="h4"
                    sx={{
                        fontWeight: 800,
                        background: 'linear-gradient(135deg, #3B82F6, #60A5FA)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        mb: 1,
                    }}
                >
                    UniTrack
                </Typography>

                <Typography
                    variant="body1"
                    sx={{ color: 'text.secondary', mb: 4 }}
                >
                    Track your university applications, deadlines, and progress — all in one place.
                </Typography>

                {error && (
                    <Alert severity="error" sx={{ mb: 3, textAlign: 'left' }}>
                        {error}
                    </Alert>
                )}

                <Button
                    variant="contained"
                    size="large"
                    fullWidth
                    startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <GoogleIcon />}
                    onClick={handleGoogleSignIn}
                    disabled={loading}
                    sx={{
                        py: 1.5,
                        borderRadius: 2,
                        textTransform: 'none',
                        fontWeight: 600,
                        fontSize: '1rem',
                        background: 'linear-gradient(135deg, #3B82F6, #2563EB)',
                        '&:hover': {
                            background: 'linear-gradient(135deg, #60A5FA, #3B82F6)',
                        },
                    }}
                >
                    {loading ? 'Signing in...' : 'Continue with Google'}
                </Button>

                <Typography
                    variant="caption"
                    sx={{ display: 'block', mt: 3, color: 'text.secondary', opacity: 0.7 }}
                >
                    By signing in, you agree to our Terms of Service
                </Typography>
            </Paper>
        </Box>
    );
}
