import React from 'react';
import { Container, Typography, Box } from '@mui/material';

const ExploreTab = () => {
  return (
    <Container maxWidth="xl">
      <Typography variant="h4" sx={{ mb: 2 }}>
        Khám phá hành trình
      </Typography>
      <Typography variant="body1" sx={{ color: '#64748b', mb: 4 }}>
        Tìm kiếm cảm hứng từ các chuyến đi đã hoàn thành của cộng đồng. Xem chi tiết lịch trình,
        export và import thành chuyến đi của riêng bạn!
      </Typography>

      {/* Sau này mình sẽ thiết kế UI cho các chuyến đi Public ở đây */}
      <Box sx={{ p: 10, textAlign: 'center', border: '2px dashed #cbd5e1', borderRadius: 4 }}>
        <Typography color="text.secondary">Tính năng đang được phát triển...</Typography>
      </Box>
    </Container>
  );
};

export default ExploreTab;
