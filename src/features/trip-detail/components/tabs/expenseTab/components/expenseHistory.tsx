import React, { useEffect } from 'react';
import { Box, Typography, Button, Card, Stack, Divider, Skeleton, Chip } from '@mui/material';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import HotelIcon from '@mui/icons-material/Hotel';
import AttractionsIcon from '@mui/icons-material/Attractions';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import { useParams } from 'react-router-dom';
import dayjs from 'dayjs';

import { useAppSelector, useAppDispatch } from '@/app/store';
import { fetchExpenseListAction } from '@/features/trip-detail/redux/action';

// Icon theo loại split
const splitIcon: Record<string, React.ReactNode> = {
  EQUAL: <ReceiptLongIcon sx={{ color: '#3b82f6' }} />,
  EXACT: <ReceiptLongIcon sx={{ color: '#8b5cf6' }} />,
  PERCENTAGE: <ReceiptLongIcon sx={{ color: '#f59e0b' }} />,
};
const splitBg: Record<string, string> = {
  EQUAL: '#dbeafe',
  EXACT: '#ede9fe',
  PERCENTAGE: '#fef3c7',
};

const formatMoney = (val: number, currency = 'VND') =>
  `${val.toLocaleString('vi-VN')} ${currency}`;

export default function ExpenseHistory() {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const { expenseList, expenseListLoading, members } = useAppSelector((state: any) => state.tripDetail);

  useEffect(() => {
    if (id) dispatch(fetchExpenseListAction(id) as any);
  }, [id, dispatch]);

  // Helper lấy tên người dùng từ danh sách members
  const getMemberName = (userId: number) => {
    const m = members?.find((u: any) => u.id === userId || u.user_id === userId);
    return m?.full_name || m?.user?.full_name || `#${userId}`;
  };

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">Lịch sử chi tiêu</Typography>
        <Button
          sx={{ color: '#22c55e', textTransform: 'none', fontWeight: 600 }}
          onClick={() => id && dispatch(fetchExpenseListAction(id) as any)}
        >
          Làm mới
        </Button>
      </Stack>

      <Card sx={{ borderRadius: 4, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', p: 0 }}>
        {expenseListLoading ? (
          <Stack divider={<Divider />}>
            {[1, 2, 3].map((i) => (
              <Box key={i} sx={{ p: 3 }}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Skeleton variant="circular" width={48} height={48} />
                  <Box flex={1}>
                    <Skeleton variant="text" width="60%" />
                    <Skeleton variant="text" width="40%" />
                  </Box>
                  <Skeleton variant="text" width={80} />
                </Stack>
              </Box>
            ))}
          </Stack>
        ) : expenseList.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center', color: 'text.secondary' }}>
            <ReceiptLongIcon sx={{ fontSize: 48, mb: 1, opacity: 0.3 }} />
            <Typography>Chưa có khoản chi tiêu nào</Typography>
          </Box>
        ) : (
          <Stack divider={<Divider />}>
            {expenseList.map((item: any) => {
              const bg = splitBg[item.split_type] || '#f1f5f9';
              const icon = splitIcon[item.split_type] || <ReceiptLongIcon sx={{ color: '#64748b' }} />;
              // BE trả models.Expense (có payer_id) → lookup tên từ members trong Redux
              const payerName = getMemberName(item.payer_id);
              const createdAt = dayjs(item.created_at);

              return (
                <Box
                  key={item.id}
                  sx={{ p: 3, '&:hover': { bgcolor: '#f8fafc' }, transition: 'all 0.2s' }}
                >
                  <Stack direction="row" alignItems="center" spacing={2.5}>
                    {/* Ngày */}
                    <Box textAlign="center" minWidth={40}>
                      <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ textTransform: 'uppercase' }}>
                        {createdAt.format('MMM')}
                      </Typography>
                      <Typography variant="h6" fontWeight={700} lineHeight={1}>
                        {createdAt.format('DD')}
                      </Typography>
                    </Box>

                    {/* Icon */}
                    <Box sx={{ width: 48, height: 48, borderRadius: '50%', bgcolor: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {icon}
                    </Box>

                    {/* Nội dung */}
                    <Box flex={1} minWidth={0}>
                      <Typography variant="subtitle1" fontWeight={700} noWrap>
                        {item.description}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {payerName} trả •{' '}
                        <Chip
                          label={item.split_type === 'EQUAL' ? 'Chia đều' : item.split_type === 'EXACT' ? 'Chia chính xác' : 'Theo %'}
                          size="small"
                          sx={{ height: 18, fontSize: '0.65rem', ml: 0.5 }}
                        />
                      </Typography>
                    </Box>

                    {/* Số tiền */}
                    <Box textAlign="right" flexShrink={0}>
                      <Typography variant="subtitle1" fontWeight={700}>
                        {formatMoney(item.amount, item.currency)}
                      </Typography>
                    </Box>
                  </Stack>
                </Box>
              );
            })}
          </Stack>
        )}
      </Card>
    </Box>
  );
}