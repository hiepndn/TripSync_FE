import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Stack, 
  AvatarGroup, 
  Avatar, 
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  IconButton,
  Tooltip
} from '@mui/material';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import FileUploadIcon from '@mui/icons-material/FileUpload';

import { useNavigate } from 'react-router-dom';

import { useAppSelector, useAppDispatch } from '@/app/store';
// 🌟 Import Action Regenerate
import { regenerateAiAction } from '@/features/trip-detail/redux/action';
import dayjs from 'dayjs';
import { useSnackbar } from 'notistack';
import { apiCall } from '@/config/api';
import { ENDPOINTS } from '@/config/api/endpoint';

export default function TripHeader() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { groupDetail, members, myRole } = useAppSelector((state: any) => state.tripDetail);
  
  const isOwner = myRole === 'ADMIN';

  // 🌟 State quản lý Dialog AI và Mời bạn bè
  const [openAiDialog, setOpenAiDialog] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [openInviteDialog, setOpenInviteDialog] = useState(false);
  const [copyTooltip, setCopyTooltip] = useState('Sao chép');
  const [isExporting, setIsExporting] = useState(false);

  if (!groupDetail) return null;

  const dateStr = `${dayjs(groupDetail.start_date).format('DD/MM')} - ${dayjs(groupDetail.end_date).format('DD/MM/YYYY')}`;

  const handleCopyInviteCode = () => {
    if (groupDetail.invite_code) {
      navigator.clipboard.writeText(groupDetail.invite_code);
      setCopyTooltip('Đã sao chép!');
      setTimeout(() => setCopyTooltip('Sao chép'), 2000);
    }
  };

  // 🌟 Hàm xử lý gọi API AI
  const handleRegenerate = () => {
    setIsRegenerating(true);
    dispatch(regenerateAiAction(groupDetail.id, () => {
      setIsRegenerating(false);
      setOpenAiDialog(false);
    }, (err: any) => {
      setIsRegenerating(false);
      enqueueSnackbar('Lỗi: ' + err, { variant: 'error' });
    }) as any);
  };

  // 🌟 Hàm xuất lịch trình ra file JSON
  const handleExport = async () => {
    setIsExporting(true);
    try {
      const { response } = await apiCall({
        method: 'GET',
        url: ENDPOINTS.ACTIVITY.EXPORT(groupDetail.id),
      });
      if (response?.status === 200) {
        const blob = new Blob([JSON.stringify(response.data, null, 2)], {
          type: 'application/json',
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${groupDetail.name}_itinerary.json`;
        a.click();
        URL.revokeObjectURL(url);
        enqueueSnackbar('Xuất lịch trình thành công!', { variant: 'success' });
      } else {
        enqueueSnackbar(response?.data?.error ?? 'Xuất lịch trình thất bại', { variant: 'error' });
      }
    } catch {
      enqueueSnackbar('Lỗi kết nối khi xuất lịch trình', { variant: 'error' });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <>
      <Box
        sx={{
          position: 'relative',
          height: 280, // Chiều cao banner
          borderRadius: 4,
          overflow: 'hidden',
          mb: 3,
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        }}
      >
        {/* Ảnh nền */}
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `url(https://picsum.photos/seed/${groupDetail.id}/1200/400)`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        {/* Lớp gradient đen mờ để nổi chữ */}
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.1) 60%, rgba(0,0,0,0.4) 100%)',
          }}
        />

        {/* ========================================== */}
        {/* 🌟 GÓC TRÊN TRÁI: Nút Quay Lại */}
        {/* ========================================== */}
        <Tooltip title="Quay lại danh sách nhóm" placement="right">
          <IconButton 
            onClick={() => navigate('/dashboard')}
            sx={{
              position: 'absolute',
              top: 24,
              left: 24,
              bgcolor: 'rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(8px)',
              color: 'white',
              '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.3)' }
            }}
          >
            <ArrowBackIcon />
          </IconButton>
        </Tooltip>

        {/* ========================================== */}
        {/* 🌟 GÓC TRÊN PHẢI: Avatar Thành Viên & Nút Mời */}
        {/* ========================================== */}
        <Stack
          direction="row"
          spacing={2}
          sx={{
            position: 'absolute',
            top: 24,
            right: 24,
            alignItems: 'center',
          }}
        >
          <AvatarGroup max={4} sx={{ '& .MuiAvatar-root': { width: 32, height: 32, fontSize: '0.875rem', borderColor: 'rgba(255,255,255,0.2)' } }}>
            {members?.map((m: any) => (
              <Avatar
                key={m.id}
                src={m.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(m.full_name)}&backgroundColor=0f766e`}
                alt={m.full_name}
              />
            ))}
          </AvatarGroup>
          <Button
            variant="contained"
            onClick={() => setOpenInviteDialog(true)}
            sx={{
              bgcolor: 'white',
              color: '#111',
              fontWeight: 700,
              borderRadius: 8,
              textTransform: 'none',
              px: 3,
              '&:hover': { bgcolor: '#f3f4f6' },
            }}
          >
            Mời bạn bè
          </Button>
        </Stack>

        {/* ========================================== */}
        {/* 🌟 GÓC DƯỚI TRÁI: Thông tin cơ bản */}
        {/* ========================================== */}
        <Box sx={{ position: 'absolute', bottom: 24, left: 24, color: 'white' }}>
          <Typography variant="h3" fontWeight={700} sx={{ textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}>
            {groupDetail.name}
          </Typography>
          <Typography variant="subtitle1" sx={{ mt: 0.5, opacity: 0.9, textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}>
            {groupDetail.description || 'Chuyến đi tuyệt vời cùng những người bạn'}
          </Typography>
          
          <Chip
            icon={<CalendarMonthIcon fontSize="small" sx={{ color: '#a78bfa !important' }} />}
            label={dateStr}
            sx={{
              mt: 2,
              bgcolor: 'rgba(255, 255, 255, 0.15)',
              color: 'white',
              backdropFilter: 'blur(8px)',
              fontWeight: 600,
              borderRadius: 2,
            }}
          />
        </Box>

        {/* ========================================== */}
        {/* 🌟 GÓC DƯỚI PHẢI: Nút Xuất lịch trình + Nút Chạy Lại AI (Đất vàng) */}
        {/* ========================================== */}
        <Stack
          direction="row"
          spacing={1.5}
          sx={{ position: 'absolute', bottom: 24, right: 24 }}
        >
          {/* Xuất lịch trình — visible to ALL members */}
          <Button
            variant="contained"
            onClick={handleExport}
            disabled={isExporting}
            startIcon={isExporting ? <CircularProgress size={16} color="inherit" /> : <FileUploadIcon />}
            sx={{
              bgcolor: 'rgba(255,255,255,0.15)',
              backdropFilter: 'blur(12px)',
              color: '#fff',
              py: 1.2,
              px: 2.5,
              borderRadius: 3,
              fontWeight: 700,
              textTransform: 'none',
              border: '1px solid rgba(255,255,255,0.2)',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.25)' },
              '&.Mui-disabled': { opacity: 0.6, color: '#fff' },
            }}
          >
            Xuất lịch trình
          </Button>

          {/* Gợi ý lại AI — ADMIN only */}
          {isOwner && (
            <Button
              variant="contained"
              onClick={() => setOpenAiDialog(true)}
              startIcon={<AutoAwesomeIcon sx={{ color: '#fbbf24' }} />}
              sx={{
                bgcolor: 'rgba(17, 24, 39, 0.8)',
                backdropFilter: 'blur(12px)',
                color: '#fff',
                py: 1.2,
                px: 3,
                borderRadius: 3,
                fontWeight: 700,
                textTransform: 'none',
                border: '1px solid rgba(255,255,255,0.1)',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)',
                '&:hover': { bgcolor: 'rgba(17, 24, 39, 1)' },
              }}
            >
              Gợi ý lại lịch trình AI
            </Button>
          )}
        </Stack>
      </Box>

      {/* ========================================== */}
      {/* 🌟 DIALOG MỜI BẠN BÈ */}
      {/* ========================================== */}
      <Dialog 
        open={openInviteDialog} 
        onClose={() => setOpenInviteDialog(false)}
        PaperProps={{ sx: { borderRadius: 4, p: 2, minWidth: 350 } }}
      >
        <DialogTitle sx={{ textAlign: 'center', fontSize: '1.5rem', pb: 1 }}>
          Mời bạn bè
        </DialogTitle>
        <DialogContent sx={{ textAlign: 'center', pb: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Chia sẻ mã này cho bạn bè để họ có thể tham gia vào chuyến đi của bạn.
          </Typography>
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              bgcolor: '#f3f4f6', 
              p: 2, 
              borderRadius: 3,
              border: '1px dashed #d1d5db'
            }}
          >
            <Typography variant="h5" fontWeight={700} sx={{ letterSpacing: 2, color: '#111' }}>
              {groupDetail.invite_code || 'Chưa có mã'}
            </Typography>
            <Tooltip title={copyTooltip} placement="top">
              <IconButton 
                onClick={handleCopyInviteCode} 
                disabled={!groupDetail.invite_code}
                sx={{
                  color: '#19e66b',
                  borderRadius: 2,
                  p: 1,
                  '&:hover': {
                    bgcolor: 'rgba(25, 230, 107, 0.08)'
                  },
                  '&.Mui-disabled': {
                    color: '#9ca3af',
                    borderColor: '#d1d5db'
                  }
                }}
              >
                <ContentCopyIcon fontSize="medium" />
              </IconButton>
            </Tooltip>
          </Box>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 2 }}>
          <Button 
            onClick={() => setOpenInviteDialog(false)} 
            variant="contained" 
            sx={{ 
              borderRadius: 3, 
              fontWeight: 700, 
              textTransform: 'none', 
              bgcolor: '#111827', 
              px: 4,
              '&:hover': { bgcolor: '#1f2937' } 
            }}
          >
            Đóng
          </Button>
        </DialogActions>
      </Dialog>

      {/* ========================================== */}
      {/* 🌟 DIALOG XÁC NHẬN CHẠY LẠI AI */}
      {/* ========================================== */}
      <Dialog 
        open={openAiDialog} 
        onClose={() => !isRegenerating && setOpenAiDialog(false)}
        PaperProps={{ sx: { borderRadius: 5, p: 1 } }}
      >
        <DialogTitle sx={{ textAlign: 'center', pt: 3 }}>
          <Stack alignItems="center" spacing={2}>
            <Box sx={{ width: 70, height: 70, bgcolor: '#fef3c7', color: '#d97706', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <AutoAwesomeIcon sx={{ fontSize: '3rem' }} />
            </Box>
            <Typography variant="h5" fontWeight={700}>
              Làm mới đề xuất AI?
            </Typography>
          </Stack>
        </DialogTitle>
        <DialogContent sx={{ textAlign: 'center', px: 4, pb: 1 }}>
          <Typography variant="body1" color="text.secondary">
            Hành động này sẽ <b>xóa toàn bộ</b> các hoạt động đang trong quá trình bỏ phiếu do AI đề xuất cũ (Lịch trình & Chi phí dự kiến). 
            AI sẽ tiến hành thu thập lại dữ liệu khách sạn và lên một kế hoạch hoàn toàn mới.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', gap: 2, px: 3, pb: 3, pt: 2 }}>
          <Button 
            onClick={() => setOpenAiDialog(false)} 
            variant="outlined" 
            color="inherit" 
            disabled={isRegenerating}
            sx={{ borderRadius: 3, fontWeight: 600, textTransform: 'none' }}
          >
            Giữ nguyên
          </Button>
          <Button 
            onClick={handleRegenerate} 
            variant="contained" 
            disabled={isRegenerating}
            sx={{ borderRadius: 3, fontWeight: 700, textTransform: 'none', bgcolor: '#111827', '&:hover': { bgcolor: '#1f2937' } }}
          >
            {isRegenerating ? <CircularProgress size={24} color="inherit" /> : 'Chạy lại AI'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}