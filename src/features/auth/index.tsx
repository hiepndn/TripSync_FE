import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Card,
  Typography,
  TextField,
  Button,
  Stack,
  IconButton,
  InputAdornment,
  Divider,
  Tabs,
  Tab,
  AppBar,
  Toolbar,
} from '@mui/material';
import { Visibility, VisibilityOff, Google, Facebook, Flight } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import travelImg from '../../assets/travel-cover.jpg';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { useDispatch } from 'react-redux';
import { loginAction, registerAction } from './redux/actions';
import { useSnackbar } from 'notistack';
import { getTokenRole } from '@/config/jwt';
import { useAppSelector } from '@/app/store';
import { CircularProgress } from '@mui/material';

const AuthPage = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('jwt');
  const [tabIndex, setTabIndex] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch<any>();
  const { enqueueSnackbar } = useSnackbar();
  const { loading } = useAppSelector((state) => state.auth);

  const handleClickShowPassword = () => setShowPassword((show) => !show);

  const validationSchema = yup.object({
    fullName: tabIndex === 1 
        ? yup.string().required('Vui lòng nhập họ tên của bạn') 
        : yup.string().notRequired(),
    email: yup.string().email('Email không đúng định dạng').required('Vui lòng nhập email của bạn'),
    password: yup
      .string()
      .min(6, 'Mật khẩu phải có ít nhất 6 ký tự')
      .required('Vui lòng nhập mật khẩu'),
  });

  const formik = useFormik({
    initialValues: {
      fullName: '',
      email: '',
      password: '',
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      if (tabIndex === 0) {
        const result = await dispatch(loginAction({
          email: values.email,
          password: values.password
        }));

        if (result.success) {
          enqueueSnackbar('Đăng nhập thành công', { variant: 'success' });
          const role = getTokenRole();
          navigate(role === 'SUPERADMIN' ? '/admin' : '/dashboard');
        } else {
          const errMsg = typeof result.message === 'string' ? result.message : 'Sai email hoặc mật khẩu!';
          enqueueSnackbar('Lỗi đăng nhập: ' + errMsg, { variant: 'error' });
        }

      } else {
        const result = await dispatch(registerAction({
          fullName: values.fullName,
          email: values.email,
          password: values.password
        }));

        if (result.success) {
          enqueueSnackbar('Đăng ký thành công! Đăng nhập ngay nhé.', { variant: 'success' });
          setTabIndex(0); 
          formik.resetForm();
        } else {
          const errMsg = typeof result.message === 'string' ? result.message : 'Lỗi khi đăng ký!';
          enqueueSnackbar('Lỗi đăng ký: ' + errMsg, { variant: 'error' });
        }
      }
    },
  });

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabIndex(newValue);
    formik.resetForm();
  };
  useEffect(() => {
    if (token) {
      const role = getTokenRole();
      navigate(role === 'SUPERADMIN' ? '/admin' : '/dashboard');
    }
  }, [token, navigate]);
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f8fafc', display: 'flex', flexDirection: 'column' }}>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          bgcolor: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(25, 230, 107, 0.1)',
        }}
      >
        <Container maxWidth="lg">
          <Toolbar sx={{ height: 64 }}>
            <Box
              sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer' }}
              onClick={() => navigate('/')}
            >
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
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#111814' }}>
                TripSync
              </Typography>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Main Content */}
      <Container maxWidth="lg" sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', py: 4 }}>
        <Card
          elevation={4}
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            width: '100%',
            minHeight: { md: 600 },
            borderRadius: 4,
            overflow: 'hidden',
          }}
        >
          {/* Cột trái: Ảnh Cover — ẩn trên mobile */}
          <Box
            sx={{
              display: { xs: 'none', md: 'flex' },
              flex: 1,
              backgroundImage: `url(${travelImg})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              position: 'relative',
              p: 6,
              flexDirection: 'column',
              justifyContent: 'flex-end',
            }}
          >
            {/* Lớp phủ mờ màu gradient đen dưới đáy ảnh để chữ dễ đọc */}
            <Box
              sx={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 50%)',
              }}
            />

            <Box sx={{ position: 'relative', zIndex: 1 }}>
              <Typography variant="h3" fontWeight={700} color="white" gutterBottom>
                Khám phá thế giới cùng nhau
              </Typography>
              <Typography variant="body1" color="#e2e8f0">
                Lên kế hoạch, chia sẻ và tận hưởng những chuyến đi đáng nhớ bên bạn bè và người
                thân.
              </Typography>
            </Box>
          </Box>

          {/* Cột phải: Form Đăng nhập / Đăng ký */}
          <Box sx={{ flex: 1, p: { xs: 3, sm: 5, md: 8 }, bgcolor: 'white' }}>
            <Typography variant="h4" color="#111814" mb={1}>
              Chào mừng trở lại!
            </Typography>
            <Typography variant="body2" color="#64748b" mb={4}>
              Nhập thông tin chi tiết của bạn để tiếp tục.
            </Typography>

            <Tabs
              value={tabIndex}
              onChange={handleTabChange}
              sx={{ mb: 4, borderBottom: 1, borderColor: 'divider' }}
              TabIndicatorProps={{ style: { backgroundColor: '#19e66b' } }}
            >
              <Tab
                label="Đăng nhập"
                sx={{
                  textTransform: 'none',
                  fontWeight: 600,
                  '&.Mui-selected': { color: '#19e66b' },
                }}
              />
              <Tab
                label="Đăng ký"
                sx={{
                  textTransform: 'none',
                  fontWeight: 600,
                  '&.Mui-selected': { color: '#19e66b' },
                }}
              />
            </Tabs>

            <form onSubmit={formik.handleSubmit}>
              <Stack spacing={1}>
                {tabIndex === 1 && (
                  <Box>
                  <Typography variant="subtitle2" fontWeight={600} mb={1}>
                    Họ tên
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    name="fullName"
                    id="fullName"
                    value={formik.values.fullName}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.fullName && Boolean(formik.errors.fullName)}
                    helperText={formik.touched.fullName && formik.errors.fullName}
                  />
                </Box>
                )}

                <Box>
                  <Typography variant="subtitle2" fontWeight={600} mb={1}>
                    Email
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="vidu@tripsync.com"
                    id="email"
                    name="email"
                    // Gắn value, onChange và hiển thị lỗi từ formik
                    value={formik.values.email}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.email && Boolean(formik.errors.email)}
                    helperText={formik.touched.email && formik.errors.email}
                  />
                </Box>

                <Box>
                  <Typography variant="subtitle2" fontWeight={600} mb={1}>
                    Mật khẩu
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Nhập mật khẩu"
                    value={formik.values.password}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.password && Boolean(formik.errors.password)}
                    helperText={formik.touched.password && formik.errors.password}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={handleClickShowPassword} edge="end">
                            {!showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& input::-ms-reveal': {
                        display: 'none', // Ẩn icon con mắt của Edge
                      },
                      '& input::-webkit-credentials-auto-fill-button': {
                        display: 'none !important', // Ẩn icon gợi ý mật khẩu/chìa khóa của Chrome
                      },
                    }}
                  />
                </Box>

                <Box textAlign="right">
                  <Typography
                    variant="body2"
                    sx={{
                      color: tabIndex === 0 ? '#19e66b' : '#ffffff',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Quên mật khẩu?
                  </Typography>
                </Box>

                <Button
                  variant="contained"
                  fullWidth
                  size="large"
                  sx={{
                    bgcolor: '#19e66b',
                    color: '#111814',
                    '&:hover': { bgcolor: '#16d360' },
                  }}
                  type="submit"
                  disabled={loading}
                >
                  {loading ? (
                    <CircularProgress size={22} sx={{ color: '#111814' }} />
                  ) : tabIndex === 0 ? 'Đăng nhập' : 'Đăng ký'}
                </Button>
              </Stack>
            </form>
          </Box>
        </Card>
      </Container>
    </Box>
  );
};

export default AuthPage;
