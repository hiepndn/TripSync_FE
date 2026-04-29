import React, { useMemo, useState } from 'react';
import {
  Box,
  Card,
  Typography,
  Stack,
  Divider,
  Chip,
  LinearProgress,
  Collapse,
  IconButton,
} from '@mui/material';
import HotelIcon from '@mui/icons-material/Hotel';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import AttractionsIcon from '@mui/icons-material/Attractions';
import NightShelterIcon from '@mui/icons-material/NightShelter';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
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
  const [expanded, setExpanded] = useState(false);

  // Chỉ lấy các activities có estimated_cost > 0 (cả PENDING & APPROVED)
  const activitiesWithCost = useMemo(
    () => activities.filter((a: any) => (a.estimatedCost || a.estimated_cost) > 0),
    [activities]
  );

  // Xử lý conflict: nhóm theo start_time, mỗi nhóm chỉ lấy 1 đại diện
  // - Nếu trong nhóm có APPROVED → lấy cái APPROVED (đã chốt, không còn conflict)
  // - Nếu toàn PENDING (conflict chưa giải quyết) → lấy cái đắt nhất (worst case)
  const deduplicatedActivities = useMemo(() => {
    const groups = new Map<string, any[]>();
    for (const act of activitiesWithCost) {
      // Group key: ngày + giờ (YYYY-MM-DD HH:mm)
      const key = act.start_time
        ? new Date(act.start_time).toISOString().slice(0, 16)
        : `no-time-${act.id}`;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(act);
    }

    const result: any[] = [];
    for (const group of groups.values()) {
      if (group.length === 1) {
        result.push(group[0]);
        continue;
      }
      // Có conflict — ưu tiên APPROVED
      const approved = group.filter((a) => a.status === 'APPROVED');
      if (approved.length === 1) {
        // Đã chốt 1 cái, lấy cái đó
        result.push(approved[0]);
      } else if (approved.length > 1) {
        // Nhiều cái APPROVED cùng giờ (hiếm) → lấy đắt nhất
        result.push(approved.reduce((max: any, a: any) =>
          (a.estimatedCost || a.estimated_cost) > (max.estimatedCost || max.estimated_cost) ? a : max
        ));
      } else {
        // Toàn PENDING → ưu tiên theo vote_count, bằng nhau thì lấy đắt nhất
        const hasVotes = group.some((a: any) => (a.vote_count ?? 0) > 0);
        if (hasVotes) {
          result.push(group.reduce((best: any, a: any) => {
            const aVotes = a.vote_count ?? 0;
            const bVotes = best.vote_count ?? 0;
            if (aVotes !== bVotes) return aVotes > bVotes ? a : best;
            // vote bằng nhau → lấy đắt hơn
            return (a.estimatedCost || a.estimated_cost) > (best.estimatedCost || best.estimated_cost) ? a : best;
          }));
        } else {
          // Chưa ai vote → lấy đắt nhất làm worst case
          result.push(group.reduce((max: any, a: any) =>
            (a.estimatedCost || a.estimated_cost) > (max.estimatedCost || max.estimated_cost) ? a : max
          ));
        }
      }
    }
    return result;
  }, [activitiesWithCost]);

  const totalEstimated = useMemo(
    () => deduplicatedActivities.reduce((sum: number, a: any) => sum + (a.estimatedCost || a.estimated_cost || 0), 0),
    [deduplicatedActivities]
  );

  const budgetPerPerson = groupDetail?.budget_per_person || 0;
  const expectedMembers = groupDetail?.expected_members || 1;
  const totalBudget = budgetPerPerson * expectedMembers;

  // Phần trăm đã "tiêu" so với ngân sách dự tính
  const usagePercent = totalBudget > 0 ? Math.min((totalEstimated / totalBudget) * 100, 100) : 0;
  const isOverBudget = totalEstimated > totalBudget && totalBudget > 0;
  const currency = deduplicatedActivities[0]?.currency || 'VND';

  if (deduplicatedActivities.length === 0) return null;

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
      <Box
        sx={{ p: 3, pb: 2, borderBottom: expanded ? '1px solid' : 'none', borderColor: 'grey.100', cursor: 'pointer' }}
        onClick={() => setExpanded((v) => !v)}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>
              Chi phí ước lượng lịch trình
            </Typography>
            <Typography variant="h5" fontWeight={700} mt={0.5}>
              {formatMoney(totalEstimated, currency)}
            </Typography>
          </Box>
          <Stack direction="row" alignItems="center" spacing={1}>
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
            <IconButton size="small" sx={{ color: '#94a3b8' }}>
              {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          </Stack>
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

      {/* Danh sách chi tiết — đóng/mở */}
      <Collapse in={expanded}>
        <Box sx={{ maxHeight: 320, overflowY: 'auto' }}>
        <Stack divider={<Divider />}>
        {deduplicatedActivities.map((act: any) => {
          const cost = act.estimatedCost || act.estimated_cost;
          const color = typeColor[act.type] || '#64748b';
          const icon = typeIcon[act.type] || <AttractionsIcon sx={{ fontSize: '1rem' }} />;
          // Kiểm tra xem act này có bị conflict với act khác không (cùng start_time)
          const conflictPeers = activitiesWithCost.filter((a: any) =>
            a.id !== act.id &&
            a.start_time &&
            act.start_time &&
            new Date(a.start_time).toISOString().slice(0, 16) === new Date(act.start_time).toISOString().slice(0, 16)
          );
          const wasConflict = conflictPeers.length > 0;
          const isApproved = act.status === 'APPROVED';
          // Xác định lý do được chọn trong conflict
          const hasVotesInGroup = wasConflict && (act.vote_count ?? 0) > 0;
          const conflictBadgeLabel = hasVotesInGroup ? 'Nhiều vote nhất' : 'Cao nhất';

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
                  {isApproved ? (
                    <Chip label="Đã chốt" size="small" sx={{ height: 16, fontSize: '0.6rem', bgcolor: '#dcfce7', color: '#16a34a' }} />
                  ) : wasConflict ? (
                    <Chip label={conflictBadgeLabel} size="small" sx={{ height: 16, fontSize: '0.6rem', bgcolor: '#fff7ed', color: '#c2410c' }} />
                  ) : (
                    <Chip label="Đề xuất" size="small" sx={{ height: 16, fontSize: '0.6rem', bgcolor: '#fef9c3', color: '#a16207' }} />
                  )}
                </Box>
              </Stack>
            </Box>
          );
        })}
        </Stack>
      </Box>
      </Collapse>
    </Card>
  );
}
