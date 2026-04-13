import React from 'react';
import { Container, Typography, Box } from '@mui/material';

const MyTripsTab = () => {
  return (
    <Container maxWidth="xl">
      <Typography variant="h4" sx={{ mb: 2 }}>
        Chuyến đi của tôi
      </Typography>
      <Typography variant="body1" sx={{ color: '#64748b', mb: 4 }}>
        Quản lý và xem chi tiết các chuyến đi mà bạn đã tham gia. Export và import lịch trình để
        chia sẻ với bạn bè!
      </Typography>

      {/* Sau này mình sẽ thiết kế UI cho các chuyến đi Public ở đây */}
      <Box sx={{ p: 10, textAlign: 'center', border: '2px dashed #cbd5e1', borderRadius: 4 }}>
        <Typography color="text.secondary">Tính năng đang được phát triển...</Typography>
      </Box>
    </Container>
  );
};

export default MyTripsTab;
