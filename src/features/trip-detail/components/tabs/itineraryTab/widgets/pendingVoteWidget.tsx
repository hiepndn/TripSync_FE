import React from 'react';
import { Card, CardContent, Typography, LinearProgress, Box, Stack } from '@mui/material';
import { Activity } from '@/models/activity';

interface Props {
  pendingActivities: Activity[];
}

export default function PendingVoteWidget({ pendingActivities }: Props) {
  // Chỉ lấy PENDING (lọc bỏ APPROVED bị lọt vào)
  const onlyPending = pendingActivities.filter((a) => a.status === 'PENDING');

  // Nhóm theo start_time — mỗi nhóm = 1 quyết định
  const decisionGroups = React.useMemo(() => {
    const map = new Map<string, Activity[]>();
    for (const act of onlyPending) {
      const key = new Date(act.start_time).toISOString().slice(0, 16);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(act);
    }
    return Array.from(map.values());
  }, [onlyPending]);

  const count = decisionGroups.length;

  if (count === 0) {
    return (
      <Card sx={{ bgcolor: '#1a2a24', color: 'white', borderRadius: 4, boxShadow: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="caption" sx={{ color: '#4ade80', letterSpacing: 1 }}>
            ✅ BIỂU QUYẾT
          </Typography>
          <Typography variant="h6" sx={{ mt: 1 }}>
            Tất cả đã được chốt!
          </Typography>
          <Typography variant="body2" sx={{ color: 'grey.400', mt: 0.5 }}>
            Không có hoạt động nào đang chờ bình chọn.
          </Typography>
        </CardContent>
      </Card>
    );
  }

  // Tính theo USER: một quyết định "tôi đã vote" khi ít nhất 1 activity trong nhóm có has_voted = true
  const myVoted = decisionGroups.filter((group) => group.some((a) => a.has_voted)).length;
  const progress = count > 0 ? Math.round((myVoted / count) * 100) : 0;

  // Tìm nhóm đầu tiên mà user chưa vote
  const firstUnvotedGroup = decisionGroups.find((g) => !g.some((a) => a.has_voted));
  const representativeName = firstUnvotedGroup
    ? (firstUnvotedGroup.length > 1
        ? `${firstUnvotedGroup.length} lựa chọn đang chờ vote`
        : firstUnvotedGroup[0]?.name)
    : 'Bạn đã vote tất cả!';

  return (
    <Card sx={{ bgcolor: '#1a2a24', color: 'white', borderRadius: 4, boxShadow: 3 }}>
      <CardContent sx={{ p: 3 }}>
        <Stack direction="row" alignItems="center" spacing={1} mb={1}>
          <Typography variant="caption" sx={{ color: '#4ade80', letterSpacing: 1 }}>
            ⚖️ CẦN BIỂU QUYẾT
          </Typography>
        </Stack>

        <Typography variant="h6" sx={{ mb: 1 }}>
          {count} {count === 1 ? 'hoạt động' : 'khung giờ'} đang bỏ phiếu
        </Typography>
        <Typography variant="body2" sx={{ color: 'grey.400', mb: 3 }}>
          {representativeName}
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

        <Typography variant="caption" sx={{ color: 'grey.500' }}>
          Bạn đã vote {myVoted}/{count} khung giờ
        </Typography>
      </CardContent>
    </Card>
  );
}
