import React, { useEffect } from 'react';
import { Box, Grid, CircularProgress } from '@mui/material';
import { useParams } from 'react-router-dom';

import { useAppSelector, useAppDispatch } from '@/app/store';

// Import các sub-components vừa tạo
import ExpenseSummary from './components/expenseSummary';
import ExpenseHistory from './components/expenseHistory';
import AddExpenseForm from './components/addExpenseForm';
import DebtBalances from './components/debtBalances';
import EstimatedCostCard from './components/estimatedCostCard';
import { fetchOptimalDebtsAction } from '@/features/trip-detail/redux/action';

export default function ExpenseTab() {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();

  const { debts, debtsLoading, members } = useAppSelector((state: any) => state.tripDetail);

  useEffect(() => {
    if (id) {
      dispatch(fetchOptimalDebtsAction(id) as any);
    }
  }, [id, dispatch]);

  if (debtsLoading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress sx={{ color: '#22c55e' }} /></Box>;
  }

  return (
    <Box>
      <Grid container spacing={4}>
        {/* CỘT TRÁI: ƯỚC LƯỢNG + THỐNG KÊ + LỊCH SỬ */}
        <Grid size={{ xs: 12, md: 7 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {/* 🌟 Card chi phí ước lượng từ lịch trình */}
            <EstimatedCostCard />
            <ExpenseSummary />
            <ExpenseHistory />
          </Box>
        </Grid>

        {/* CỘT PHẢI: FORM & CÂN ĐỐI NỢ */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <AddExpenseForm members={members} />
            <DebtBalances debts={debts} members={members} />
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}