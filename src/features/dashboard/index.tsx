import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Stack,
  Avatar,
  AppBar,
  Toolbar,
  Menu,
  MenuItem,
  BottomNavigation,
  BottomNavigationAction,
  Paper,
} from '@mui/material';
import { 
  Dashboard as DashboardIcon, 
  FlightTakeoff, 
  Explore, 
  Favorite,
  InstallMobile as InstallMobileIcon 
} from '@mui/icons-material';
import { IconButton } from '@mui/material';
import { useNavigate } from 'react-router-dom';

// Import 3 đứa con vào
import OverviewTab from './tabs/overViewTab';
import MyTripsTab from './tabs/myTripsTab';
import ExploreTab from './tabs/exploreTab';
import FavoritesTab from './tabs/favoritesTab';
import EditProfileModal from './components/EditProfileModal';
import { useDispatch } from 'react-redux';
import { getProfileAction } from './redux/action';
import { useAppSelector } from '@/app/store';
import { NotificationPanel } from '../notifications/components/NotificationPanel';
import { usePWAInstall } from '@/hooks/usePWAInstall';
import PWAInstallButton from '@/components/pwa/PWAInstallButton';
import PWAAndroidBanner from '@/components/pwa/PWAAndroidBanner';
import PWAIOSModal from '@/components/pwa/PWAIOSModal';

const Dashboard = () => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const token = localStorage.getItem('jwt');
  const dispatch = useDispatch<any>();

  // State quản lý Tab đang hiển thị (0: Dashboard, 1: Của tôi, 2: Khám phá)
  const [activeTab, setActiveTab] = useState(0);

  const { profile } = useAppSelector((state) => state.groups);

  // PWA Install
  const {
    isInstalled,
    isInstallable,
    isIOS,
    isSafari,
    showAndroidBanner,
    showIOSModal,
    triggerInstall,
    dismissAndroidBanner,
    dismissIOSModal,
    manualShowIOSModal,
  } = usePWAInstall();

  const handleLogout = () => {
    localStorage.removeItem('jwt');
    navigate('/login');
  };

  // Hàm helper để render style cho Tab đang được chọn
  const getTabStyle = (index: number) => ({
    fontWeight: activeTab === index ? 700 : 600,
    color: activeTab === index ? '#111814' : '#64748b',
    borderBottom: activeTab === index ? '2px solid #19e66b' : '2px solid transparent',
    py: 2,
    cursor: 'pointer',
    transition: 'all 0.2s',
    '&:hover': { color: '#111814' },
  });
  
  useEffect(() => {
    if (!token) {
      navigate('/login');
    }
    dispatch(getProfileAction());
  }, [token, navigate]);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f8fafc' }}>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{ bgcolor: 'white', borderBottom: '1px solid #e2e8f0' }}
      >
        <Container maxWidth="xl">
          <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 0 } }}>
            {/* Logo */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box
                component="img"
                src="/fly_logo_web.png"
                alt="TripSync logo"
                sx={{ width: 32, height: 32, borderRadius: 1, objectFit: 'cover' }}
              />
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#111814' }}>
                TripSync
              </Typography>
            </Box>

            {/* Menu Links - Bấm vào đâu thì set activeTab ở đó */}
            <Stack direction="row" spacing={4} sx={{ display: { xs: 'none', md: 'flex' } }}>
              <Typography sx={getTabStyle(0)} onClick={() => setActiveTab(0)}>
                Dashboard
              </Typography>
              <Typography sx={getTabStyle(1)} onClick={() => setActiveTab(1)}>
                Chuyến đi của tôi
              </Typography>
              <Typography sx={getTabStyle(2)} onClick={() => setActiveTab(2)}>
                Khám phá
              </Typography>
              <Typography sx={getTabStyle(3)} onClick={() => setActiveTab(3)}>
                Yêu thích
              </Typography>
            </Stack>

            {/* User Actions */}
            <Stack direction="row" spacing={1.5} alignItems="center">
              {/* Desktop install button — chỉ hiện khi có beforeinstallprompt */}
              {isInstallable && (
                <Box sx={{ display: { xs: 'none', md: 'block' } }}>
                  <PWAInstallButton onInstall={triggerInstall} />
                </Box>
              )}

              {/* iOS manual install button */}
              {isIOS && isSafari && !isInstalled && (
                <IconButton 
                  size="small" 
                  onClick={manualShowIOSModal}
                  sx={{ 
                    color: '#10b981', 
                    bgcolor: '#f0fdf4',
                    '&:hover': { bgcolor: '#dcfce7' }
                  }}
                >
                  <InstallMobileIcon fontSize="small" />
                </IconButton>
              )}

              <NotificationPanel />
              <Avatar
                src={profile?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(profile?.full_name || profile?.email || 'User')}&backgroundColor=0f766e`}
                sx={{ cursor: 'pointer', width: 36, height: 36 }}
                onClick={(e) => setAnchorEl(e.currentTarget)}
              />
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={() => setAnchorEl(null)}
                PaperProps={{ sx: { mt: 1.5, minWidth: 150 } }}
              >
                <MenuItem
                  onClick={() => {
                    setAnchorEl(null);
                    setProfileModalOpen(true);
                  }}
                >
                  Hồ sơ của tôi
                </MenuItem>
                <MenuItem onClick={handleLogout} sx={{ color: 'error.main', fontWeight: 600 }}>
                  Đăng xuất
                </MenuItem>
              </Menu>
            </Stack>
          </Toolbar>
        </Container>
      </AppBar>

      {/* ===== BODY: RENDER CON TƯƠNG ỨNG VỚI TAB ===== */}
      {/* Thêm pb cho mobile để không bị bottom nav che */}
      <Box sx={{ py: 6, pb: { xs: 10, md: 6 } }}>
        {/* Android install banner — hiện ở đầu body, trên mobile */}
        {showAndroidBanner && (
          <Container maxWidth="xl" sx={{ mb: 0 }}>
            <PWAAndroidBanner onInstall={triggerInstall} onDismiss={dismissAndroidBanner} />
          </Container>
        )}

        {activeTab === 0 && <OverviewTab />}
        {activeTab === 1 && <MyTripsTab />}
        {activeTab === 2 && <ExploreTab />}
        {activeTab === 3 && <FavoritesTab />}
      </Box>

      {/* ===== BOTTOM NAVIGATION — chỉ hiện trên mobile ===== */}
      <Paper
        sx={{
          display: { xs: 'block', md: 'none' },
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 1200,
          borderTop: '1px solid #e2e8f0',
        }}
        elevation={3}
      >
        <BottomNavigation
          value={activeTab}
          onChange={(_, newValue) => setActiveTab(newValue)}
          sx={{
            '& .MuiBottomNavigationAction-root.Mui-selected': { color: '#19e66b' },
            '& .MuiBottomNavigationAction-root': { minWidth: 0 },
          }}
        >
          <BottomNavigationAction label="Dashboard" icon={<DashboardIcon />} />
          <BottomNavigationAction label="Của tôi" icon={<FlightTakeoff />} />
          <BottomNavigationAction label="Khám phá" icon={<Explore />} />
          <BottomNavigationAction label="Yêu thích" icon={<Favorite />} />
        </BottomNavigation>
      </Paper>

      {/* ===== EDIT PROFILE MODAL ===== */}
      <EditProfileModal open={profileModalOpen} onClose={() => setProfileModalOpen(false)} />

      {/* ===== PWA iOS MODAL ===== */}
      <PWAIOSModal open={showIOSModal} onClose={dismissIOSModal} />
    </Box>
  );
};

export default Dashboard;
