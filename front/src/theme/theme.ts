import { createTheme, type PaletteMode } from '@mui/material/styles';

export function getTheme(mode: PaletteMode) {
    const isDark = mode === 'dark';

    return createTheme({
        palette: {
            mode,
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
                default: isDark ? '#0D0F1A' : '#F4F6FB',
                paper: isDark ? '#151729' : '#FFFFFF',
            },
            text: {
                primary: isDark ? '#E8EAED' : '#1A1A2E',
                secondary: isDark ? '#9AA0A6' : '#5F6368',
            },
            divider: isDark
                ? 'rgba(59, 130, 246, 0.12)'
                : 'rgba(59, 130, 246, 0.10)',
            error: {
                main: isDark ? '#FF5252' : '#D32F2F',
            },
            warning: {
                main: isDark ? '#FFD740' : '#ED6C02',
            },
            success: {
                main: isDark ? '#69F0AE' : '#2E7D32',
            },
            info: {
                main: isDark ? '#40C4FF' : '#0288D1',
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
                        border: `1px solid ${isDark ? 'rgba(59, 130, 246, 0.12)' : 'rgba(59, 130, 246, 0.08)'}`,
                        transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
                        '&:hover': {
                            transform: 'translateY(-2px)',
                            borderColor: isDark
                                ? 'rgba(59, 130, 246, 0.3)'
                                : 'rgba(59, 130, 246, 0.25)',
                            boxShadow: isDark
                                ? '0 8px 32px rgba(59, 130, 246, 0.15)'
                                : '0 8px 32px rgba(59, 130, 246, 0.10)',
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
                        border: `1px solid ${isDark ? 'rgba(59, 130, 246, 0.15)' : 'rgba(59, 130, 246, 0.10)'}`,
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
                        backgroundColor: isDark
                            ? 'rgba(13, 15, 26, 0.8)'
                            : 'rgba(255, 255, 255, 0.85)',
                        backdropFilter: 'blur(12px)',
                        borderBottom: `1px solid ${isDark ? 'rgba(59, 130, 246, 0.12)' : 'rgba(59, 130, 246, 0.08)'}`,
                        boxShadow: isDark
                            ? 'none'
                            : '0 1px 3px rgba(0, 0, 0, 0.04)',
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
}

// Keep a default export for backwards compat if anything imports it directly
const theme = getTheme('dark');
export default theme;
