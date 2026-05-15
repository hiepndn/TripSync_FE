import React from 'react';
import { Button, Tooltip } from '@mui/material';
import GetAppIcon from '@mui/icons-material/GetApp';

interface Props {
  onInstall: () => void;
}

/**
 * Nút cài đặt PWA nhỏ gọn trên Desktop navbar.
 * Chỉ render khi trình duyệt hỗ trợ (Chrome/Edge).
 */
export default function PWAInstallButton({ onInstall }: Props) {
  return (
    <Tooltip title="Cài đặt ứng dụng TripSync" placement="bottom">
      <Button
        variant="outlined"
        size="small"
        startIcon={<GetAppIcon sx={{ fontSize: 16 }} />}
        onClick={onInstall}
        sx={{
          borderColor: '#19e66b',
          color: '#16a34a',
          textTransform: 'none',
          fontWeight: 600,
          fontSize: '0.8rem',
          borderRadius: 2,
          px: 1.5,
          py: 0.5,
          '&:hover': {
            borderColor: '#16a34a',
            bgcolor: '#f0fdf4',
          },
        }}
      >
        Cài đặt App
      </Button>
    </Tooltip>
  );
}
