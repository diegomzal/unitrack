import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';

import theme from './theme/theme';
import MainLayout from './layouts/MainLayout';
import ApplicationsView from './views/ApplicationsView';
import CalendarView from './views/CalendarView';
import SettingsView from './views/SettingsView';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
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
    </ThemeProvider>
  );
}

export default App;
