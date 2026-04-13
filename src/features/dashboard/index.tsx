import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Stack,
  Avatar,
  IconButton,
  AppBar,
  Toolbar,
  Badge,
  Menu,
  MenuItem,
} from '@mui/material';
import { Notifications, Flight } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

// Import 3 đứa con vào
import OverviewTab from './tabs/overViewTab';
import MyTripsTab from './tabs/myTripsTab';
import ExploreTab from './tabs/exploreTab';
import { useDispatch } from 'react-redux';
import { getProfileAction } from './redux/action';
import { useAppSelector } from '@/app/store';

const Dashboard = () => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const token = localStorage.getItem('jwt');
  const dispatch = useDispatch<any>();

  // State quản lý Tab đang hiển thị (0: Dashboard, 1: Của tôi, 2: Khám phá)
  const [activeTab, setActiveTab] = useState(0);

  const { profile } = useAppSelector((state) => state.groups);

  console.log('Profile từ Redux:', profile);

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
                sx={{
                  width: 32,
                  height: 32,
                  bgcolor: '#19e66b',
                  borderRadius: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Flight sx={{ color: 'white', fontSize: 20 }} />
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#111814' }}>
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
            </Stack>

            {/* User Actions */}
            <Stack direction="row" spacing={2} alignItems="center">
              <IconButton>
                <Badge color="error" variant="dot">
                  <Notifications sx={{ color: '#64748b' }} />
                </Badge>
              </IconButton>
              <Avatar
                sx={{ bgcolor: '#0f766e', cursor: 'pointer', width: 36, height: 36 }}
                onClick={(e) => setAnchorEl(e.currentTarget)}
              >
                H
              </Avatar>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={() => setAnchorEl(null)}
                PaperProps={{ sx: { mt: 1.5, minWidth: 150 } }}
              >
                <MenuItem onClick={() => setAnchorEl(null)}>Hồ sơ của tôi</MenuItem>
                <MenuItem onClick={handleLogout} sx={{ color: 'error.main', fontWeight: 600 }}>
                  Đăng xuất
                </MenuItem>
              </Menu>
            </Stack>
          </Toolbar>
        </Container>
      </AppBar>

      {/* ===== BODY: RENDER CON TƯƠNG ỨNG VỚI TAB ===== */}
      <Box sx={{ py: 6 }}>
        {activeTab === 0 && <OverviewTab />}
        {activeTab === 1 && <MyTripsTab />}
        {activeTab === 2 && <ExploreTab />}
      </Box>
    </Box>
  );
};

export default Dashboard;
