import React, { useEffect } from 'react';
import { Grid, Card, Typography, Skeleton } from '@mui/material';
import { useParams } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '@/app/store';
import { fetchExpenseSummaryAction } from '../../../../redux/action';

export default function ExpenseSummary() {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const { expenseSummary, summaryLoading } = useAppSelector((state: any) => state.tripDetail);

  useEffect(() => {
    if (id) {
      dispatch(fetchExpenseSummaryAction(id) as any);
    }
  }, [id, dispatch]);

  const cardStyle = { borderRadius: 4, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', p: 2.5 };

  const totalSpent = expenseSummary?.total_group_spent || 0;
  const userPaid = expenseSummary?.user_paid || 0;
  const userDebt = expenseSummary?.user_debt || 0;
  const currency = expenseSummary?.currency || 'VND';

  const formatMoney = (val: number) => {
    return val.toLocaleString('vi-VN');
  };

  return (
    <Grid container spacing={2}>
      <Grid size={{ xs: 4 }}>
        <Card sx={cardStyle}>
          <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ textTransform: 'uppercase', letterSpacing: 1, fontSize: { xs: '0.6rem', sm: '0.75rem' } }}>Tổng chi tiêu</Typography>
          {summaryLoading ? <Skeleton variant="text" width="60%" height={40} /> : (
            <Typography variant="h5" fontWeight={700} mt={1} sx={{ fontSize: { xs: '1rem', sm: '1.5rem' } }}>{formatMoney(totalSpent)} <Typography component="span" variant="body2" color="text.secondary" fontWeight={600}>{currency}</Typography></Typography>
          )}
        </Card>
      </Grid>
      <Grid size={{ xs: 4 }}>
        <Card sx={cardStyle}>
          <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ textTransform: 'uppercase', letterSpacing: 1, fontSize: { xs: '0.6rem', sm: '0.75rem' } }}>Bạn đã chi</Typography>
          {summaryLoading ? <Skeleton variant="text" width="60%" height={40} /> : (
            <Typography variant="h5" fontWeight={700} mt={1} color="#22c55e" sx={{ fontSize: { xs: '1rem', sm: '1.5rem' } }}>{formatMoney(userPaid)} <Typography component="span" variant="body2" color="text.secondary" fontWeight={600}>{currency}</Typography></Typography>
          )}
        </Card>
      </Grid>
      <Grid size={{ xs: 4 }}>
        <Card sx={{ ...cardStyle, border: '1px solid #fee2e2' }}>
          <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ textTransform: 'uppercase', letterSpacing: 1, fontSize: { xs: '0.6rem', sm: '0.75rem' } }}>Bạn còn nợ</Typography>
          {summaryLoading ? <Skeleton variant="text" width="60%" height={40} /> : (
            <Typography variant="h5" fontWeight={700} mt={1} color="#ef4444" sx={{ fontSize: { xs: '1rem', sm: '1.5rem' } }}>{formatMoney(userDebt)} <Typography component="span" variant="body2" color="text.secondary" fontWeight={600}>{currency}</Typography></Typography>
          )}
        </Card>
      </Grid>
    </Grid>
  );
}