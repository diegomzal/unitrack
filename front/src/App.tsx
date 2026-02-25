import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline, Box, CircularProgress } from '@mui/material';

import theme from './theme/theme';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import MainLayout from './layouts/MainLayout';
import LoginView from './views/LoginView';
import ApplicationsView from './views/ApplicationsView';
import CalendarView from './views/CalendarView';
import SettingsView from './views/SettingsView';

import { useEffect } from 'react';
import { userService } from './services/sharingService';

function AuthenticatedApp() {
  const { user, loading } = useAuth();

  // Ensure user profile exists on login
  useEffect(() => {
    if (user) {
      userService.ensureProfile().catch(console.error);
    }
  }, [user]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!user) {
    return <LoginView />;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Navigate to="/applications" replace />} />
          <Route path="applications" element={<ApplicationsView />} />

          <Route path="calendar" element={<CalendarView />} />
          <Route path="settings" element={<SettingsView />} />
          <Route path="*" element={<Navigate to="/applications" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <AuthenticatedApp />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
