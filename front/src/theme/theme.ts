import { createTheme } from '@mui/material/styles';

const theme = createTheme({
    palette: {
        mode: 'dark',
        primary: {
            main: '#3B82F6',
            light: '#60A5FA',
            dark: '#2563EB',
        },
        secondary: {
            main: '#00E5FF',
            light: '#6EFFFF',
            dark: '#00B8D4',
        },
        background: {
            default: '#0D0F1A',
            paper: '#151729',
        },
        text: {
            primary: '#E8EAED',
            secondary: '#9AA0A6',
        },
        divider: 'rgba(59, 130, 246, 0.12)',
        error: {
            main: '#FF5252',
        },
        warning: {
            main: '#FFD740',
        },
        success: {
            main: '#69F0AE',
        },
        info: {
            main: '#40C4FF',
        },
    },
    typography: {
        fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
        h4: {
            fontWeight: 700,
            letterSpacing: '-0.02em',
        },
        h5: {
            fontWeight: 600,
            letterSpacing: '-0.01em',
        },
        h6: {
            fontWeight: 600,
        },
        subtitle1: {
            fontWeight: 500,
        },
        button: {
            textTransform: 'none',
            fontWeight: 600,
        },
    },
    shape: {
        borderRadius: 12,
    },
    components: {
        MuiCard: {
            styleOverrides: {
                root: {
                    backgroundImage: 'none',
                    border: '1px solid rgba(59, 130, 246, 0.12)',
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
                    '&:hover': {
                        transform: 'translateY(-2px)',
                        borderColor: 'rgba(59, 130, 246, 0.3)',
                        boxShadow: '0 8px 32px rgba(59, 130, 246, 0.15)',
                    },
                },
            },
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 10,
                    padding: '8px 20px',
                },
                contained: {
                    boxShadow: 'none',
                    '&:hover': {
                        boxShadow: '0 4px 20px rgba(59, 130, 246, 0.4)',
                    },
                },
            },
        },
        MuiFab: {
            styleOverrides: {
                root: {
                    boxShadow: '0 4px 20px rgba(59, 130, 246, 0.4)',
                },
            },
        },
        MuiDialog: {
            styleOverrides: {
                paper: {
                    backgroundImage: 'none',
                    border: '1px solid rgba(59, 130, 246, 0.15)',
                },
            },
        },
        MuiChip: {
            styleOverrides: {
                root: {
                    fontWeight: 600,
                    fontSize: '0.75rem',
                },
            },
        },
        MuiAppBar: {
            styleOverrides: {
                root: {
                    backgroundImage: 'none',
                    backgroundColor: 'rgba(13, 15, 26, 0.8)',
                    backdropFilter: 'blur(12px)',
                    borderBottom: '1px solid rgba(59, 130, 246, 0.12)',
                    boxShadow: 'none',
                },
            },
        },
        MuiTextField: {
            defaultProps: {
                variant: 'outlined',
                fullWidth: true,
            },
        },
    },
});

export default theme;
