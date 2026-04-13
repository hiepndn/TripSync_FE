import React from 'react';
import { Card, CardContent, Typography, LinearProgress, Box, Stack } from '@mui/material';
import { Activity } from '@/models/activity';

interface Props {
  pendingActivities: Activity[];
}

export default function PendingVoteWidget({ pendingActivities }: Props) {
  const count = pendingActivities.length;

  if (count === 0) {
    return (
      <Card sx={{ bgcolor: '#1a2a24', color: 'white', borderRadius: 4, boxShadow: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="caption" sx={{ color: '#4ade80', fontWeight: 700, letterSpacing: 1 }}>
            ✅ BIỂU QUYẾT
          </Typography>
          <Typography variant="h6" fontWeight={700} mt={1}>
            Tất cả đã được chốt!
          </Typography>
          <Typography variant="body2" sx={{ color: 'grey.400', mt: 0.5 }}>
            Không có hoạt động nào đang chờ bình chọn.
          </Typography>
        </CardContent>
      </Card>
    );
  }

  // Tính % theo số activity đã vote (vote_count > 0) / tổng pending
  const voted = pendingActivities.filter((a) => a.vote_count > 0).length;
  const progress = count > 0 ? Math.round((voted / count) * 100) : 0;

  return (
    <Card sx={{ bgcolor: '#1a2a24', color: 'white', borderRadius: 4, boxShadow: 3 }}>
      <CardContent sx={{ p: 3 }}>
        <Stack direction="row" alignItems="center" spacing={1} mb={1}>
          <Typography variant="caption" sx={{ color: '#4ade80', fontWeight: 700, letterSpacing: 1 }}>
            ⚖️ CẦN BIỂU QUYẾT
          </Typography>
        </Stack>

        <Typography variant="h6" fontWeight={700} mb={1}>
          {count} hoạt động đang bỏ phiếu
        </Typography>
        <Typography variant="body2" sx={{ color: 'grey.400', mb: 3 }}>
          {pendingActivities[0]?.name || 'Xem lịch trình để bình chọn'}
        </Typography>

        <Box sx={{ width: '100%', mb: 1 }}>
          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{
              height: 6,
              borderRadius: 3,
              bgcolor: 'rgba(255,255,255,0.1)',
              '& .MuiLinearProgress-bar': { bgcolor: '#4ade80' }
            }}
          />
        </Box>

        <Stack direction="row" justifyContent="space-between" sx={{ color: 'grey.500' }}>
          <Typography variant="caption">{voted}/{count} có lượt vote</Typography>
        </Stack>
      </CardContent>
    </Card>
  );
}