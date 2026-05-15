import React from 'react';
import { Box, Button, IconButton, Stack, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import GetAppIcon from '@mui/icons-material/GetApp';

interface Props {
  onInstall: () => void;
  onDismiss: () => void;
}

/**
 * Banner mời cài đặt PWA cho Android.
 * Hiển thị ở đầu nội dung chính, có nút "Cài ngay" và "Đóng".
 */
export default function PWAAndroidBanner({ onInstall, onDismiss }: Props) {
  return (
    <Box
      sx={{
        mx: { xs: 2, sm: 0 },
        mb: 2,
        p: 2,
        borderRadius: 3,
        bgcolor: '#f0fdf4',
        border: '1px solid #bbf7d0',
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        boxShadow: '0 2px 8px rgba(25, 230, 107, 0.12)',
      }}
    >
      {/* Logo nhỏ */}
      <Box
        component="img"
        src="/fly_logo.jpeg"
        alt="TripSync"
        sx={{ width: 40, height: 40, borderRadius: 1.5, objectFit: 'cover', flexShrink: 0 }}
      />

      {/* Text */}
      <Stack spacing={0.2} flex={1} minWidth={0}>
        <Typography variant="body2" fontWeight={700} color="#111814" noWrap>
          Cài TripSync về máy
        </Typography>
        <Typography variant="caption" color="#638872">
          Truy cập nhanh hơn, dùng được offline
        </Typography>
      </Stack>

      {/* Actions */}
      <Stack direction="row" spacing={1} alignItems="center" flexShrink={0}>
        <Button
          variant="contained"
          size="small"
          startIcon={<GetAppIcon sx={{ fontSize: 15 }} />}
          onClick={onInstall}
          sx={{
            bgcolor: '#19e66b',
            color: '#111814',
            fontWeight: 700,
            textTransform: 'none',
            borderRadius: 2,
            fontSize: '0.78rem',
            px: 1.5,
            '&:hover': { bgcolor: '#16c45e' },
          }}
        >
          Cài ngay
        </Button>
        <IconButton size="small" onClick={onDismiss} sx={{ color: '#94a3b8' }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </Stack>
    </Box>
  );
}
