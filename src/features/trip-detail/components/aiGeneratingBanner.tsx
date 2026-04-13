import React from 'react';
import { Box, Typography, LinearProgress, Paper } from '@mui/material';
import { AutoAwesome } from '@mui/icons-material';

const AiGeneratingBanner = () => {
  return (
    <Paper 
      elevation={0} 
      sx={{ 
        p: 3, 
        mb: 4, 
        bgcolor: '#f0fdf4', // Nền xanh nhạt
        border: '1px solid #bbf7d0', 
        borderRadius: '16px' 
      }}
    >
      <Box display="flex" alignItems="center" gap={1.5} mb={2}>
        {/* Icon lấp lánh để thể hiện AI đang làm việc */}
        <AutoAwesome sx={{ color: '#16a34a' }} />
        <Typography variant="h6" sx={{ color: '#16a34a', fontWeight: 'bold' }}>
          AI đang thiết kế lịch trình & tìm kiếm khách sạn...
        </Typography>
      </Box>
      
      <Typography variant="body2" color="text.secondary" mb={3}>
        TripSync đang liên hệ với hệ thống của Agoda để chọn ra những khách sạn thực tế tốt nhất, 
        khớp với ngân sách của đoàn bạn. Vui lòng đợi trong giây lát nhé!
      </Typography>
      
      {/* Thanh Progress chạy liên tục */}
      <LinearProgress 
        sx={{ 
          borderRadius: 5, 
          height: 8, 
          bgcolor: '#dcfce7', 
          '& .MuiLinearProgress-bar': { bgcolor: '#16a34a' } 
        }} 
      />
    </Paper>
  );
};

export default AiGeneratingBanner;