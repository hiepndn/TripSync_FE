import React from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  IconButton,
  Stack,
  Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import IosShareIcon from '@mui/icons-material/IosShare';
import AddBoxOutlinedIcon from '@mui/icons-material/AddBoxOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined';

interface Props {
  open: boolean;
  onClose: () => void;
}

const steps = [
  {
    icon: <IosShareIcon sx={{ fontSize: 24, color: '#007AFF' }} />,
    title: 'Bấm nút Share',
    desc: 'Nhấn vào biểu tượng chia sẻ ở thanh công cụ Safari (hình vuông có mũi tên lên)',
  },
  {
    icon: <AddBoxOutlinedIcon sx={{ fontSize: 24, color: '#007AFF' }} />,
    title: 'Chọn "Add to Home Screen"',
    desc: 'Cuộn xuống trong menu và chọn "Thêm vào Màn hình chính"',
  },
  {
    icon: <CheckCircleOutlineIcon sx={{ fontSize: 24, color: '#10b981' }} />,
    title: 'Xác nhận "Add"',
    desc: 'Nhấn "Thêm" ở góc trên bên phải để hoàn tất cài đặt',
  },
];

export default function PWAIOSModal({ open, onClose }: Props) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 4,
          mx: 2,
          overflow: 'hidden',
          boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
        },
      }}
    >
      {/* Header with subtle gradient */}
      <Box
        sx={{
          px: 3,
          pt: 3,
          pb: 2.5,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          background: 'linear-gradient(to bottom, #f0fdf4, #ffffff)',
        }}
      >
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: 2.5,
            bgcolor: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
            p: 0.5,
          }}
        >
          <Box
            component="img"
            src="/fly_logo_web.png"
            alt="TripSync"
            sx={{ width: '100%', height: '100%', borderRadius: 1.5, objectFit: 'cover' }}
          />
        </Box>
        <Box flex={1}>
          <Typography variant="h6" sx={{ fontSize: '1.1rem', fontWeight: 800, color: '#111814', lineHeight: 1.2 }}>
            Cài TripSync lên iPhone
          </Typography>
          <Typography variant="caption" sx={{ color: '#638872', fontWeight: 500 }}>
            Chỉ với 3 bước đơn giản
          </Typography>
        </Box>
        <IconButton
          size="small"
          onClick={onClose}
          sx={{
            color: '#94a3b8',
            alignSelf: 'flex-start',
            '&:hover': { bgcolor: '#f1f5f9' },
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      <DialogContent sx={{ px: 3, py: 0, pb: 3 }}>
        <Stack spacing={0} sx={{ position: 'relative', mt: 1 }}>
          {steps.map((step, index) => (
            <Box key={index} sx={{ display: 'flex', gap: 2.5, pb: index === steps.length - 1 ? 0 : 3 }}>
              {/* Stepper Logic */}
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                <Box
                  sx={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    bgcolor: index === 2 ? '#10b981' : '#19e66b',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#111814',
                    fontWeight: 800,
                    fontSize: 13,
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    zIndex: 1,
                  }}
                >
                  {index + 1}
                </Box>
                {index < steps.length - 1 && (
                  <Box
                    sx={{
                      width: 2,
                      flexGrow: 1,
                      bgcolor: '#e2e8f0',
                      my: 0.5,
                      borderRadius: 1,
                    }}
                  />
                )}
              </Box>

              {/* Step Content */}
              <Box sx={{ flex: 1, pb: 0.5 }}>
                <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 0.5 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1e293b' }}>
                    {step.title}
                  </Typography>
                  <Box
                    sx={{
                      width: 36,
                      height: 36,
                      borderRadius: 1.5,
                      bgcolor: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                    }}
                  >
                    {step.icon}
                  </Box>
                </Stack>
                <Typography variant="body2" sx={{ color: '#64748b', lineHeight: 1.6, fontSize: '0.85rem' }}>
                  {step.desc}
                </Typography>
              </Box>
            </Box>
          ))}
        </Stack>

        {/* Improved Tip Box */}
        <Box
          sx={{
            mt: 2,
            p: 2,
            borderRadius: 3,
            bgcolor: '#fffbeb',
            border: '1px solid #fde68a',
            display: 'flex',
            gap: 1.5,
          }}
        >
          <LightbulbOutlinedIcon sx={{ color: '#d97706', fontSize: 20, mt: 0.2 }} />
          <Typography variant="caption" sx={{ color: '#92400e', lineHeight: 1.5, fontWeight: 500 }}>
            Nút Share có thể nằm ở <strong>trên</strong> hoặc <strong>dưới</strong> màn hình tuỳ theo cài đặt Safari của bạn.
          </Typography>
        </Box>

        <Button
          fullWidth
          variant="contained"
          onClick={onClose}
          sx={{
            mt: 3,
            bgcolor: '#1e293b',
            color: '#ffffff',
            textTransform: 'none',
            borderRadius: 2.5,
            fontWeight: 700,
            py: 1.2,
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
            '&:hover': {
              bgcolor: '#0f172a',
              boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
            },
          }}
        >
          Đã hiểu
        </Button>
      </DialogContent>
    </Dialog>
  );
}
