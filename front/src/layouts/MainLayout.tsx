import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Box, Tabs, Tab, Avatar, Tooltip } from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import ChecklistIcon from '@mui/icons-material/Checklist';

import SettingsIcon from '@mui/icons-material/Settings';
import { useAuth } from '../contexts/AuthContext';

export default function MainLayout() {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();

    // Map root path to applications for tab selection
    const currentTab = location.pathname === '/' ? '/applications' : location.pathname;

    const handleTabChange = (_event: React.SyntheticEvent, newValue: string) => {
        navigate(newValue);
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <AppBar position="sticky" sx={{ bgcolor: 'background.paper', color: 'text.primary', borderBottom: 1, borderColor: 'divider', boxShadow: 'none' }}>
                <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 1, sm: 2 } }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <SchoolIcon sx={{ mr: 1.5, color: 'primary.main' }} />
                        <Typography
                            variant="h6"
                            sx={{
                                fontWeight: 800,
                                background: 'linear-gradient(135deg, #3B82F6, #2563EB)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                display: { xs: 'none', md: 'block' }
                            }}
                        >
                            UniTrack
                        </Typography>
                    </Box>
                    <Tabs
                        value={currentTab}
                        onChange={handleTabChange}
                        textColor="primary"
                        indicatorColor="primary"
                        variant="scrollable"
                        scrollButtons="auto"
                        allowScrollButtonsMobile
                        sx={{ minHeight: { xs: 56, sm: 64 }, '.MuiTab-root': { minHeight: { xs: 56, sm: 64 } } }}
                    >
                        <Tab
                            key="applications"
                            icon={<ChecklistIcon />}
                            iconPosition="start"
                            label="Applications"
                            value="/applications"
                            sx={{ textTransform: 'none', fontWeight: 600 }}
                        />

                        <Tab
                            key="calendar"
                            icon={<CalendarMonthIcon />}
                            iconPosition="start"
                            label="Calendar"
                            value="/calendar"
                            sx={{ textTransform: 'none', fontWeight: 600 }}
                        />
                        <Tab
                            key="settings"
                            icon={<SettingsIcon />}
                            iconPosition="start"
                            label="Settings"
                            value="/settings"
                            sx={{ textTransform: 'none', fontWeight: 600 }}
                        />
                    </Tabs>
                    <Tooltip title={user?.email || ''}>
                        <Avatar
                            src={user?.photoURL || undefined}
                            sx={{
                                width: 32,
                                height: 32,
                                ml: 1,
                                cursor: 'pointer',
                                border: '2px solid',
                                borderColor: 'primary.main',
                            }}
                            onClick={() => navigate('/settings')}
                        >
                            {user?.displayName?.charAt(0) || user?.email?.charAt(0) || '?'}
                        </Avatar>
                    </Tooltip>
                </Toolbar>
            </AppBar>
            <Box sx={{ display: 'flex', flex: 1, flexDirection: 'column', bgcolor: 'background.default' }}>
                <Outlet />
            </Box>
        </Box>
    );
}
