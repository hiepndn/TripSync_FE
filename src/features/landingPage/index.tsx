// src/pages/LandingPage.tsx
import {
  AppBar,
  Toolbar,
  Button,
  Container,
  Typography,
  Box,
  Stack,
  Card,
  CardContent,
  Avatar,
  AvatarGroup,
  IconButton,
} from '@mui/material';
import {
  AttachMoney,
  HowToVote,
  CalendarMonth,
  FolderShared,
  Menu,
  Flight,
  Language,
  Share,
} from '@mui/icons-material';
import coverImg from '../../assets/landing-page-cover.jpg';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

const features = [
  {
    id: 1,
    icon: AttachMoney,
    color: '#10b981',
    bgColor: '#dcfce7',
    title: 'Chia sẻ chi phí',
    description: 'Theo dõi và tự động chia tiền nhóm minh bạch, không còn tranh cãi ai nợ ai.',
  },
  {
    id: 2,
    icon: HowToVote,
    color: '#3b82f6',
    bgColor: '#dbeafe',
    title: 'Bỏ phiếu dân chủ',
    description: 'Cả nhóm cùng biểu quyết điểm đến, nhà hàng và hoạt động vui chơi.',
  },
  {
    id: 3,
    icon: CalendarMonth,
    color: '#a855f7',
    bgColor: '#f3e8ff',
    title: 'Lịch trình thông minh',
    description: 'Sắp xếp thời gian hợp lý với giao diện kéo thả trực quan.',
  },
  {
    id: 4,
    icon: FolderShared,
    color: '#f59e0b',
    bgColor: '#fef3c7',
    title: 'Lưu trữ tài liệu',
    description: 'Vé máy bay, booking khách sạn đều được lưu trữ an toàn một nơi.',
  },
];

const steps = [
  {
    step: '1',
    title: 'Tạo nhóm & Mời bạn bè',
    description: 'Tạo chuyến đi mới và gửi link mời bạn bè tham gia chỉ trong vài giây.',
  },
  {
    step: '2',
    icon: 'edit_calendar',
    title: 'Lên kế hoạch & Bỏ phiếu',
    description: 'Đề xuất địa điểm, chốt ngày đi và thống nhất chi phí dự kiến.',
  },
  {
    step: '3',
    title: 'Xách ba lô lên và đi',
    description: 'Tận hưởng chuyến đi, mọi thông tin và chi phí đã có TripSync lo.',
  },
];

const LandingPage = () => {
  const token = localStorage.getItem('jwt');
  const navigate = useNavigate();
  const handleClick = () => {
    navigate('/login');
  };
  const handleDemo = () => {
    navigate('/demo');
  };
  useEffect(() => {
    if (token) {
      navigate('/dashboard');
    }
  }, [token, navigate]);
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#F0FDF4' }}>
      {/* Header */}
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          bgcolor: 'rgba(255, 255, 255, 0.8)', // Làm trong suốt hơn một chút
          backdropFilter: 'blur(12px)', // Tăng độ mờ layer sau
          borderBottom: '1px solid rgba(25, 230, 107, 0.1)', // Đổi viền sang màu xanh nhạt
        }}
      >
        <Container maxWidth="lg">
          <Toolbar sx={{ height: 64 }}>
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

            {/* Desktop Menu */}
            <Stack
              direction="row"
              spacing={4}
              sx={{ ml: 'auto', display: { xs: 'none', md: 'flex' } }}
            >
              <Button sx={{ color: '#111814', fontWeight: 500 }}>Tính năng</Button>
              <Button sx={{ color: '#111814', fontWeight: 500 }}>Cách hoạt động</Button>
              <Button sx={{ color: '#111814', fontWeight: 500 }}>Hỗ trợ</Button>
              <Button
                variant="contained"
                sx={{
                  bgcolor: '#19e66b',
                  color: '#111814',
                  fontWeight: 700,
                  '&:hover': { bgcolor: '#16d360' },
                }}
                onClick={handleClick}
              >
                Đăng nhập
              </Button>
            </Stack>

            {/* Mobile Menu Button */}
            <IconButton sx={{ ml: 'auto', display: { xs: 'flex', md: 'none' } }}>
              <Menu />
            </IconButton>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Hero Section */}
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
            gap: 4,
            alignItems: 'center',
          }}
        >
          {/* Left - Text */}
          <Stack spacing={3}>
            {/* <Typography
              variant="h1"
              sx={{
                fontSize: { xs: '2.5rem', md: '3.5rem' },
                fontWeight: 900,
                lineHeight: 1.1,
                color: '#111814',
              }}
            >
              Du lịch cùng nhau,{' '}
              <Box component="span" sx={{ color: '#19e66b' }}>
                dễ dàng hơn bao giờ hết
              </Box>
            </Typography> */}
            <Box sx={{}}>
              {/* Phần chữ đen bình thường */}
              <Typography
                variant="h1"
                sx={{
                  fontWeight: 'bold',
                  color: '#000',
                  lineHeight: 1.2,
                  fontSize: 70,
                }}
              >
                Du lịch cùng nhau,
              </Typography>

              {/* Phần chữ có Gradient xanh */}
              <Typography
                variant="h1"
                sx={{
                  fontSize: 70,
                  fontWeight: 'bold',
                  lineHeight: 1.2,
                  // Tạo màu gradient từ trái sang phải
                  background: 'linear-gradient(to right, #4ade80, #22c55e)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  display: 'inline-block', // Quan trọng để gradient bao phủ đúng diện tích chữ
                }}
              >
                dễ dàng hơn bao giờ hết
              </Typography>
            </Box>

            <Typography variant="body1" sx={{ fontSize: '1.125rem', color: '#638872' }}>
              Lên kế hoạch, chia sẻ chi phí và thống nhất lịch trình chỉ trong một ứng dụng. Không
              còn những cuộc tranh luận, chỉ còn những chuyến đi tuyệt vời.
            </Typography>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <Button
                variant="contained"
                size="large"
                sx={{
                  bgcolor: '#19e66b',
                  color: '#111814',
                  fontWeight: 700,
                  py: 1.5,
                  px: 3,
                  '&:hover': {
                    bgcolor: '#16d360',
                    transform: 'scale(1.05)',
                  },
                  transition: 'all 0.2s',
                }}
                onClick={handleClick}
              >
                Bắt đầu ngay
              </Button>
              <Button
                variant="outlined"
                size="large"
                onClick={handleDemo}
                sx={{
                  borderColor: '#dce5df',
                  color: '#111814',
                  fontWeight: 700,
                  py: 1.5,
                  px: 3,
                  '&:hover': { borderColor: '#19e66b', color: '#19e66b' },
                }}
              >
                Xem demo
              </Button>
            </Stack>
          </Stack>

          {/* Right - Hero Image Card */}
          <Box sx={{ position: 'relative' }}>
            <Card
              elevation={3}
              sx={{
                borderRadius: 4,
                overflow: 'hidden',
                aspectRatio: '4/3',
              }}
            >
              <Box
                sx={{
                  height: '100%',
                  backgroundImage: `url(${coverImg})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  display: 'flex',
                  alignItems: 'flex-end',
                  p: 3,
                }}
              >
                {/* Floating Card */}
                <Card
                  sx={{
                    width: '100%',
                    bgcolor: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(10px)',
                    p: 2,
                  }}
                >
                  <Stack direction="row" justifyContent="space-between" mb={1}>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: '#638872' }}>
                      CHUYẾN ĐI ĐÀ NẴNG
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        bgcolor: '#dcfce7',
                        color: '#19e66b',
                        px: 1,
                        py: 0.5,
                        borderRadius: 1,
                        fontWeight: 700,
                      }}
                    >
                      Đã xác nhận
                    </Typography>
                  </Stack>

                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        bgcolor: '#dcfce7',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Flight sx={{ color: '#19e66b' }} />
                    </Box>
                    <Box flex={1}>
                      <Typography variant="body2" fontWeight={700}>
                        Vé máy bay khứ hồi
                      </Typography>
                      <Typography variant="caption" color="#638872">
                        15 tháng 11, 08:30 AM
                      </Typography>
                    </Box>
                    <Box textAlign="right">
                      <Typography variant="body2" fontWeight={700}>
                        2.500k
                      </Typography>
                      <Typography variant="caption" color="#638872">
                        Chia đều 4 người
                      </Typography>
                    </Box>
                  </Stack>
                </Card>
              </Box>
            </Card>
          </Box>
        </Box>
      </Container>

      {/* Social Proof */}
      <Box
        sx={{
          py: 5,
          bgcolor: '#ffffff', // Màu trắng để làm nổi bật logo đối tác
          borderTop: '1px solid rgba(25, 230, 107, 0.1)',
          borderBottom: '1px solid rgba(25, 230, 107, 0.1)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.02)', // Đổ bóng nhẹ
        }}
      >
        <Container maxWidth="lg">
          <Typography
            variant="h4"
            textAlign="center"
            sx={{ fontWeight: 'bold' }}
            color="#111814"
            mb={4}
          >
            Đồng hành cùng những chuyến đi đáng nhớ
          </Typography>
          <Stack
            direction="row"
            justifyContent="center"
            flexWrap="wrap"
            gap={{ xs: 4, md: 8 }}
            sx={{ opacity: 0.6 }}
          >
            <Typography variant="h6" fontWeight={700} color="#638872">
              TravelMate
            </Typography>
            <Typography variant="h6" fontWeight={700} color="#638872">
              GoWild
            </Typography>
            <Typography variant="h6" fontWeight={700} color="#638872">
              SkyHigh
            </Typography>
            <Typography variant="h6" fontWeight={700} color="#638872">
              PackUp
            </Typography>
          </Stack>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: { xs: 8, md: 12 } }}>
        <Stack spacing={6}>
          {/* Header */}
          <Box textAlign="center">
            <Typography
              variant="overline"
              sx={{ color: '#19e66b', fontWeight: 700, fontSize: '0.875rem' }}
            >
              TÍNH NĂNG NỔI BẬT
            </Typography>
            <Typography variant="h3" fontWeight={700} color="#111814" mt={2} mb={2}>
              Tại sao nên chọn TripSync?
            </Typography>
            <Typography variant="body1" color="#638872" fontSize="1.125rem">
              Mọi công cụ bạn cần để tổ chức một chuyến đi nhóm hoàn hảo.
            </Typography>
          </Box>

          {/* Feature Cards */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, 1fr)',
                lg: 'repeat(4, 1fr)',
              },
              gap: 3,
            }}
          >
            {features.map((feature) => (
              <Card
                key={feature.id}
                sx={{
                  height: '100%',
                  border: '1px solid #dce5df',
                  borderRadius: 3,
                  transition: 'all 0.3s',
                  '&:hover': {
                    boxShadow: 3,
                    borderColor: '#19e66b',
                    transform: 'translateY(-4px)',
                  },
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: 2,
                      bgcolor: feature.bgColor,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mb: 2,
                    }}
                  >
                    <feature.icon sx={{ color: feature.color, fontSize: 28 }} />
                  </Box>
                  <Typography variant="h6" fontWeight={700} mb={1}>
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" color="#638872">
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </Box>
        </Stack>
      </Container>
      <Box
        sx={{
          py: { xs: 8, md: 12 },
          bgcolor: '#ffffff',
          borderRadius: { md: '80px 80px 0 0' }, // Bo cong nhẹ phần đỉnh để tạo hiệu ứng lớp chồng lớp
          position: 'relative',
          mt: -4, // Đè nhẹ lên section trước
        }}
      >
        <Container maxWidth="lg">
          <Box textAlign="center" mb={8}>
            <Typography variant="h3" fontWeight={700} color="#111814" mb={2}>
              Dễ dàng như đếm 1, 2, 3
            </Typography>
            <Typography variant="body1" color="#638872">
              Quy trình đơn giản để bắt đầu chuyến đi trong mơ của bạn.
            </Typography>
          </Box>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
              gap: 6,
              position: 'relative',
            }}
          >
            {steps.map((step, index) => (
              <Stack key={index} alignItems="center" textAlign="center" spacing={3}>
                <Box
                  sx={{
                    width: 96,
                    height: 96,
                    borderRadius: '50%',
                    bgcolor: 'white',
                    border: '4px solid #19e66b',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: index === 1 ? '0 8px 20px rgba(25, 230, 107, 0.2)' : 1,
                  }}
                >
                  {step.icon ? (
                    <CalendarMonth sx={{ fontSize: 40, color: '#19e66b' }} />
                  ) : (
                    <Typography variant="h3" fontWeight={900} color="#19e66b">
                      {step.step}
                    </Typography>
                  )}
                </Box>
                <Typography variant="h6" fontWeight={700} color="#111814">
                  {step.title}
                </Typography>
                <Typography variant="body2" color="#638872" px={2}>
                  {step.description}
                </Typography>
              </Stack>
            ))}
          </Box>
        </Container>
      </Box>

      {/* Big CTA */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Box
          sx={{
            bgcolor: '#1c2e24',
            borderRadius: 4,
            p: { xs: 4, md: 8 },
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 4,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <Stack spacing={2} flex={1}>
            <Typography variant="h3" fontWeight={700} color="white">
              Sẵn sàng cho chuyến đi tiếp theo?
            </Typography>
            <Typography variant="body1" color="#9ca3af" fontSize="1.125rem">
              Đừng để việc lên kế hoạch làm hỏng niềm vui. Bắt đầu miễn phí ngay hôm nay.
            </Typography>
          </Stack>
          <Button
            variant="contained"
            size="large"
            sx={{
              bgcolor: '#19e66b',
              color: '#111814',
              fontWeight: 700,
              py: 2,
              px: 4,
              fontSize: '1.125rem',
              '&:hover': {
                bgcolor: '#16d360',
                transform: 'scale(1.05)',
              },
            }}
            onClick={handleClick}
          >
            Tham gia TripSync
          </Button>
        </Box>
      </Container>

      {/* Footer */}
      <Box sx={{ borderTop: '1px solid #f0f4f2', bgcolor: 'white', pt: 8, pb: 6 }}>
        <Container maxWidth="lg">
          <Box
            sx={{
              display: 'grid',
              // gridTemplateColumns: {
              //   xs: 'repeat(2, 1fr)',
              //   md: 'repeat(4, 1fr)',
              // },
              gap: 6,
              mb: 8,
            }}
          >
            {/* Brand */}
            <Stack spacing={2} sx={{ gridColumn: { xs: 'span 2', md: 'span 1' } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box
                  component="img"
                  src="/fly_logo_web.png"
                  alt="TripSync logo"
                  sx={{ width: 24, height: 24, borderRadius: 0.5, objectFit: 'cover' }}
                />
                <Typography variant="h6" fontWeight={700}>
                  TripSync
                </Typography>
              </Box>
              <Typography variant="body2" color="#638872">
                Ứng dụng lập kế hoạch du lịch nhóm số một. Kết nối, chia sẻ và tận hưởng.
              </Typography>
            </Stack>
          </Box>

          {/* Bottom */}
          <Box
            sx={{
              borderTop: '1px solid #f0f4f2',
              pt: 4,
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 2,
            }}
          >
            <Typography variant="caption" color="#638872">
              © Đồ án tốt nghiệp - 2251161995
            </Typography>
            <Stack direction="row" spacing={2}>
              <IconButton size="small" sx={{ color: '#638872' }}>
                <Language fontSize="small" />
              </IconButton>
              <IconButton size="small" sx={{ color: '#638872' }}>
                <Share fontSize="small" />
              </IconButton>
            </Stack>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default LandingPage;
