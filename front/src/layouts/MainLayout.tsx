import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Box, Tabs, Tab, Avatar, Tooltip, Menu, MenuItem, ListItemIcon, ListItemText, Divider } from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import ChecklistIcon from '@mui/icons-material/Checklist';
import LogoutIcon from '@mui/icons-material/Logout';
import SettingsIcon from '@mui/icons-material/Settings';
import { useAuth } from '../contexts/AuthContext';

export default function MainLayout() {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, signOut } = useAuth();

    const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);

    const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorElUser(event.currentTarget);
    };

    const handleCloseUserMenu = () => {
        setAnchorElUser(null);
    };

    const handleLogout = async () => {
        handleCloseUserMenu();
        await signOut();
    };

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
                            onClick={handleOpenUserMenu}
                        >
                            {user?.displayName?.charAt(0) || user?.email?.charAt(0) || '?'}
                        </Avatar>
                    </Tooltip>
                    <Menu
                        sx={{ mt: '45px' }}
                        id="menu-appbar"
                        anchorEl={anchorElUser}
                        anchorOrigin={{
                            vertical: 'top',
                            horizontal: 'right',
                        }}
                        keepMounted
                        transformOrigin={{
                            vertical: 'top',
                            horizontal: 'right',
                        }}
                        open={Boolean(anchorElUser)}
                        onClose={handleCloseUserMenu}
                        PaperProps={{
                            sx: { minWidth: 200, borderRadius: 2, mt: 1 }
                        }}
                    >
                        <Box sx={{ px: 2, py: 1.5 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
                                {user?.displayName || 'User'}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ textOverflow: 'ellipsis', overflow: 'hidden' }}>
                                {user?.email}
                            </Typography>
                        </Box>
                        <Divider sx={{ my: 0.5 }} />
                        <MenuItem onClick={() => { handleCloseUserMenu(); navigate('/settings'); }}>
                            <ListItemIcon>
                                <SettingsIcon fontSize="small" color="action" />
                            </ListItemIcon>
                            <ListItemText>Settings</ListItemText>
                        </MenuItem>
                        <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
                            <ListItemIcon>
                                <LogoutIcon fontSize="small" color="error" />
                            </ListItemIcon>
                            <ListItemText>Sign out</ListItemText>
                        </MenuItem>
                    </Menu>
                </Toolbar>
            </AppBar>
            <Box sx={{ display: 'flex', flex: 1, flexDirection: 'column', bgcolor: 'background.default' }}>
                <Outlet />
            </Box>
        </Box>
    );
}
