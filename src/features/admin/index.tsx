import { useState } from 'react';
import {
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Avatar,
  Divider,
  Tooltip,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People,
  Groups,
  Settings,
  Logout,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import AdminOverview from './pages/AdminOverview';
import AdminUsers from './pages/AdminUsers';
import AdminGroups from './pages/AdminGroups';
import AdminSettings from './pages/AdminSettings';

const SIDEBAR_WIDTH = 240;

type AdminPage = 'overview' | 'users' | 'groups' | 'settings';

const NAV_ITEMS: { key: AdminPage; label: string; icon: React.ReactNode }[] = [
  { key: 'overview', label: 'Tổng quan', icon: <DashboardIcon /> },
  { key: 'users', label: 'Quản lý người dùng', icon: <People /> },
  { key: 'groups', label: 'Quản lý nhóm', icon: <Groups /> },
  { key: 'settings', label: 'Cài đặt', icon: <Settings /> },
];

const AdminPanel = () => {
  const navigate = useNavigate();
  const [activePage, setActivePage] = useState<AdminPage>('overview');

  const handleLogout = () => {
    localStorage.removeItem('jwt');
    navigate('/login');
  };

  const renderPage = () => {
    switch (activePage) {
      case 'overview': return <AdminOverview />;
      case 'users': return <AdminUsers />;
      case 'groups': return <AdminGroups />;
      case 'settings': return <AdminSettings />;
    }
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f0fdf4' }}>
      {/* Sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          width: SIDEBAR_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: SIDEBAR_WIDTH,
            boxSizing: 'border-box',
            bgcolor: 'white',
            borderRight: '1px solid #e2e8f0',
            display: 'flex',
            flexDirection: 'column',
          },
        }}
      >
        {/* Logo */}
        <Box sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            component="img"
            src="/fly_logo_web.png"
            alt="TripSync logo"
            sx={{ width: 36, height: 36, borderRadius: 1.5, objectFit: 'cover' }}
          />
          <Box>
            <Typography variant="subtitle1" fontWeight={700} color="#111814" lineHeight={1.2}>
              TripSync
            </Typography>
            <Typography variant="caption" color="#64748b">
              Admin Panel
            </Typography>
          </Box>
        </Box>

        <Divider />

        {/* Admin info */}
        <Box sx={{ px: 2, py: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar sx={{ bgcolor: '#19e66b', color: '#111814', width: 38, height: 38, fontWeight: 700 }}>
            A
          </Avatar>
          <Box>
            <Typography variant="body2" fontWeight={700} color="#111814">
              TripSync Admin
            </Typography>
            <Typography variant="caption" color="#64748b">
              Administrator
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ mb: 1 }} />

        {/* Nav items */}
        <List sx={{ px: 1, flexGrow: 1 }}>
          {NAV_ITEMS.map((item) => {
            const isActive = activePage === item.key;
            return (
              <ListItemButton
                key={item.key}
                onClick={() => setActivePage(item.key)}
                sx={{
                  borderRadius: 2,
                  mb: 0.5,
                  bgcolor: isActive ? '#f0fdf4' : 'transparent',
                  color: isActive ? '#16a34a' : '#475569',
                  '&:hover': { bgcolor: '#f0fdf4', color: '#16a34a' },
                  '& .MuiListItemIcon-root': {
                    color: isActive ? '#19e66b' : '#94a3b8',
                    minWidth: 36,
                  },
                }}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{ fontSize: 14, fontWeight: isActive ? 700 : 500 }}
                />
                {isActive && (
                  <Box
                    sx={{
                      width: 3,
                      height: 20,
                      bgcolor: '#19e66b',
                      borderRadius: 2,
                      ml: 1,
                    }}
                  />
                )}
              </ListItemButton>
            );
          })}
        </List>

        {/* Logout */}
        <Divider />
        <Box sx={{ p: 1 }}>
          <Tooltip title="Đăng xuất" placement="right">
            <ListItemButton
              onClick={handleLogout}
              sx={{
                borderRadius: 2,
                color: '#ef4444',
                '&:hover': { bgcolor: '#fff1f2' },
                '& .MuiListItemIcon-root': { color: '#ef4444', minWidth: 36 },
              }}
            >
              <ListItemIcon><Logout /></ListItemIcon>
              <ListItemText
                primary="Đăng xuất"
                primaryTypographyProps={{ fontSize: 14, fontWeight: 600 }}
              />
            </ListItemButton>
          </Tooltip>
        </Box>
      </Drawer>

      {/* Main content */}
      <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
        {renderPage()}
      </Box>
    </Box>
  );
};

export default AdminPanel;
