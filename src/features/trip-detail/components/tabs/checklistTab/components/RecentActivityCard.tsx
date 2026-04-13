import React from 'react';
import { Box, Card, Stack, Typography, Avatar, Link } from '@mui/material';
import { useAppSelector } from '@/app/store';

export default function RecentActivityCard() {
  // 🌟 LẤY DATA THẬT TỪ REDUX
  const { checklist } = useAppSelector((state: any) => state.tripDetail);

  // 🌟 Lọc những công việc ĐÃ XONG để làm Nhật ký hoạt động
  const recentActivities = checklist
    ?.filter((item: any) => item.is_completed && item.completed_by)
    .reverse() // Đảo ngược để việc mới xong lên đầu
    .slice(0, 5) || []; // Chỉ lấy 5 việc gần nhất cho đỡ dài

  const cardStyle = { borderRadius: 4, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', p: 3 };

  return (
    <Card sx={cardStyle}>
       <Stack direction="row" spacing={1} alignItems="center" mb={2}>
          <Typography variant="subtitle1" fontWeight={700}>Việc vừa hoàn thành</Typography>
       </Stack>

      {recentActivities.length === 0 ? (
         <Typography variant="body2" color="text.secondary" py={1}>
            Chưa có công việc nào được hoàn thành gần đây.
         </Typography>
      ) : (
        <Stack spacing={2.5}>
            {recentActivities.map((act: any) => (
                <Stack key={act.id} direction="row" alignItems="center" spacing={1.5}>
                    <Avatar src={act.completed_by.avatar} sx={{ width: 32, height: 32 }} />
                    <Box>
                       <Typography variant="body2" color="text.primary">
                          <b>{act.completed_by.full_name}</b> đã hoàn thành <b>"{act.title}"</b>
                       </Typography>
                       <Typography variant="caption" color="text.secondary">
                          Trong mục {act.category}
                       </Typography>
                    </Box>
                </Stack>
            ))}
            <Link href="#" variant="caption" color="#22c55e" fontWeight={600} sx={{ textDecoration: 'none', mt: 1, display: 'block', textAlign: 'right' }}>
               Xem tất cả
            </Link>
        </Stack>
      )}
    </Card>
  );
}