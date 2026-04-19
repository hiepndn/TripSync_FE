import React, { useMemo } from 'react';
import {
  Box,
  Card,
  Typography,
  Stack,
  Divider,
  Chip,
  LinearProgress,
} from '@mui/material';
import HotelIcon from '@mui/icons-material/Hotel';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import AttractionsIcon from '@mui/icons-material/Attractions';
import NightShelterIcon from '@mui/icons-material/NightShelter';
import { useAppSelector } from '@/app/store';

const typeIcon: Record<string, React.ReactNode> = {
  HOTEL: <HotelIcon sx={{ fontSize: '1rem' }} />,
  RESTAURANT: <RestaurantIcon sx={{ fontSize: '1rem' }} />,
  ATTRACTION: <AttractionsIcon sx={{ fontSize: '1rem' }} />,
  CAMPING: <NightShelterIcon sx={{ fontSize: '1rem' }} />,
};

const typeColor: Record<string, string> = {
  HOTEL: '#3b82f6',
  RESTAURANT: '#f59e0b',
  ATTRACTION: '#8b5cf6',
  CAMPING: '#22c55e',
};

const formatMoney = (val: number, currency = 'VND') =>
  `${val.toLocaleString('vi-VN')} ${currency}`;

export default function EstimatedCostCard() {
  const { activities, groupDetail } = useAppSelector((state: any) => state.tripDetail);

  // Chỉ lấy các activities có estimated_cost > 0 (cả PENDING & APPROVED)
  const activitiesWithCost = useMemo(
    () => activities.filter((a: any) => (a.estimatedCost || a.estimated_cost) > 0),
    [activities]
  );

  const totalEstimated = useMemo(
    () => activitiesWithCost.reduce((sum: number, a: any) => sum + (a.estimatedCost || a.estimated_cost || 0), 0),
    [activitiesWithCost]
  );

  const budgetPerPerson = groupDetail?.budget_per_person || 0;
  const expectedMembers = groupDetail?.expected_members || 1;
  const totalBudget = budgetPerPerson * expectedMembers;

  // Phần trăm đã "tiêu" so với ngân sách dự tính
  const usagePercent = totalBudget > 0 ? Math.min((totalEstimated / totalBudget) * 100, 100) : 0;
  const isOverBudget = totalEstimated > totalBudget && totalBudget > 0;
  const currency = activitiesWithCost[0]?.currency || 'VND';

  if (activitiesWithCost.length === 0) return null;

  return (
    <Card
      sx={{
        borderRadius: 4,
        border: 'none',
        boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
        p: 0,
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <Box sx={{ p: 3, pb: 2, borderBottom: '1px solid', borderColor: 'grey.100' }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>
              Chi phí ước lượng lịch trình
            </Typography>
            <Typography variant="h5" fontWeight={700} mt={0.5}>
              {formatMoney(totalEstimated, currency)}
            </Typography>
          </Box>
          {totalBudget > 0 && (
            <Chip
              label={isOverBudget ? '⚠️ Vượt ngân sách' : '✅ Trong ngân sách'}
              size="small"
              sx={{
                bgcolor: isOverBudget ? '#fee2e2' : '#dcfce7',
                color: isOverBudget ? '#dc2626' : '#16a34a',
                fontWeight: 700,
                fontSize: '0.7rem',
              }}
            />
          )}
        </Stack>

        {/* Thanh tiến trình so ngân sách */}
        {totalBudget > 0 && (
          <Box mt={2}>
            <Stack direction="row" justifyContent="space-between" mb={0.5}>
              <Typography variant="caption" color="text.secondary">
                Ngân sách nhóm: {formatMoney(totalBudget, currency)}
              </Typography>
              <Typography variant="caption" fontWeight={700} color={isOverBudget ? 'error.main' : 'success.main'}>
                {Math.round(usagePercent)}%
              </Typography>
            </Stack>
            <LinearProgress
              variant="determinate"
              value={usagePercent}
              sx={{
                height: 6,
                borderRadius: 3,
                bgcolor: '#f1f5f9',
                '& .MuiLinearProgress-bar': {
                  bgcolor: isOverBudget ? '#ef4444' : '#22c55e',
                  borderRadius: 3,
                },
              }}
            />
          </Box>
        )}
      </Box>

      {/* Danh sách chi tiết */}
      <Stack divider={<Divider />}>
        {activitiesWithCost.map((act: any) => {
          const cost = act.estimatedCost || act.estimated_cost;
          const color = typeColor[act.type] || '#64748b';
          const icon = typeIcon[act.type] || <AttractionsIcon sx={{ fontSize: '1rem' }} />;

          return (
            <Box
              key={act.id}
              sx={{ px: 3, py: 1.5, '&:hover': { bgcolor: '#f8fafc' }, transition: 'background 0.15s' }}
            >
              <Stack direction="row" alignItems="center" spacing={1.5}>
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    bgcolor: `${color}18`,
                    color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  {icon}
                </Box>
                <Box flex={1} minWidth={0}>
                  <Typography variant="body2" fontWeight={600} noWrap>
                    {act.name}
                  </Typography>
                  {act.location && (
                    <Typography variant="caption" color="text.secondary" noWrap>
                      📍 {act.location}
                    </Typography>
                  )}
                </Box>
                <Box textAlign="right" flexShrink={0}>
                  <Typography variant="body2" fontWeight={700}>
                    {formatMoney(cost, act.currency || currency)}
                  </Typography>
                  {act.status === 'APPROVED' ? (
                    <Chip label="Đã chốt" size="small" sx={{ height: 16, fontSize: '0.6rem', bgcolor: '#dcfce7', color: '#16a34a' }} />
                  ) : (
                    <Chip label="Đề xuất" size="small" sx={{ height: 16, fontSize: '0.6rem', bgcolor: '#fef9c3', color: '#a16207' }} />
                  )}
                </Box>
              </Stack>
            </Box>
          );
        })}
      </Stack>
    </Card>
  );
}
