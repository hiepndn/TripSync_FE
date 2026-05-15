import { Box, Button, IconButton, Stack, Typography, Slide, Paper } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import GetAppIcon from '@mui/icons-material/GetApp';

interface Props {
  onInstall: () => void;
  onDismiss: () => void;
}

/**
 * Banner mời cài đặt PWA cho Android.
 * Hiển thị dạng popup nổi ở dưới màn hình.
 */
export default function PWAAndroidBanner({ onInstall, onDismiss }: Props) {
  return (
    <Slide direction="up" in={true} mountOnEnter unmountOnExit>
      <Paper
        elevation={10}
        sx={{
          position: 'fixed',
          bottom: { xs: 16, sm: 24 },
          left: '50%',
          transform: 'translateX(-50%) !important',
          width: '90%',
          maxWidth: 450,
          borderRadius: 4,
          p: 2,
          bgcolor: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          zIndex: 2000,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        <Stack direction="row" spacing={2} alignItems="center">
          {/* Logo */}
          <Box
            component="img"
            src="/fly_logo_web.png"
            alt="TripSync"
            sx={{
              width: 56,
              height: 56,
              borderRadius: 2,
              objectFit: 'cover',
              flexShrink: 0,
              boxShadow: '0 4px 12px rgba(25, 230, 107, 0.3)',
            }}
          />

          {/* Text */}
          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#111814', lineHeight: 1.2 }}>
              Cài đặt TripSync
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748b', fontSize: 13, mt: 0.5 }}>
              Trải nghiệm mượt mà hơn, dùng được offline và nhận thông báo.
            </Typography>
          </Box>

          {/* Close Button */}
          <IconButton
            size="small"
            onClick={onDismiss}
            sx={{
              alignSelf: 'flex-start',
              color: '#94a3b8',
              '&:hover': { color: '#64748b' },
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Stack>

        <Stack direction="row" spacing={1.5}>
          <Button
            fullWidth
            variant="outlined"
            onClick={onDismiss}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              color: '#64748b',
              borderColor: '#e2e8f0',
              '&:hover': { borderColor: '#cbd5e1', bgcolor: '#f8fafc' },
            }}
          >
            Để sau
          </Button>
          <Button
            fullWidth
            variant="contained"
            startIcon={<GetAppIcon />}
            onClick={onInstall}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 700,
              bgcolor: '#19e66b',
              color: '#111814',
              '&:hover': { bgcolor: '#16cf61' },
              boxShadow: '0 4px 12px rgba(25, 230, 107, 0.2)',
            }}
          >
            Cài đặt ngay
          </Button>
        </Stack>
      </Paper>
    </Slide>
  );
}
