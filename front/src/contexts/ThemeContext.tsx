import { createContext, useContext, useState, useMemo, useCallback, type ReactNode } from 'react';
import { ThemeProvider as MuiThemeProvider, CssBaseline } from '@mui/material';
import { type PaletteMode } from '@mui/material';
import { getTheme } from '../theme/theme';

const STORAGE_KEY = 'unitrack-theme-mode';

function getStoredMode(): PaletteMode {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored === 'light' || stored === 'dark') return stored;
    } catch {
        // localStorage may be unavailable
    }
    return 'dark';
}

interface ThemeContextValue {
    mode: PaletteMode;
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
    mode: 'dark',
    toggleTheme: () => {},
});

export function useThemeMode(): ThemeContextValue {
    return useContext(ThemeContext);
}

interface ThemeProviderProps {
    children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
    const [mode, setMode] = useState<PaletteMode>(getStoredMode);

    const toggleTheme = useCallback(() => {
        setMode((prev) => {
            const next = prev === 'dark' ? 'light' : 'dark';
            try {
                localStorage.setItem(STORAGE_KEY, next);
            } catch {
                // localStorage may be unavailable
            }
            return next;
        });
    }, []);

    const theme = useMemo(() => getTheme(mode), [mode]);

    const contextValue = useMemo(() => ({ mode, toggleTheme }), [mode, toggleTheme]);

    return (
        <ThemeContext.Provider value={contextValue}>
            <MuiThemeProvider theme={theme}>
                <CssBaseline />
                {children}
            </MuiThemeProvider>
        </ThemeContext.Provider>
    );
}
