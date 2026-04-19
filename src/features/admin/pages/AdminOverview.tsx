import { useEffect, useState, useCallback } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  ToggleButtonGroup,
  ToggleButton,
} from '@mui/material';
import { People, Groups, PersonAdd } from '@mui/icons-material';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { apiCall } from '@/config/api';
import { ENDPOINTS } from '@/config/api/endpoint';

interface Stats {
  total_users: number;
  new_users_today: number;
  total_groups: number;
}

interface GrowthPoint {
  label: string;
  count: number;
  total: number;
}

type Period = '1' | '30' | '90' | '180' | '365' | '0';

const PERIOD_OPTIONS: { value: Period; label: string }[] = [
  { value: '1', label: 'Hôm nay' },
  { value: '30', label: '1 tháng' },
  { value: '90', label: '3 tháng' },
  { value: '180', label: '6 tháng' },
  { value: '365', label: '1 năm' },
  { value: '0', label: 'Tất cả' },
];

const StatCard = ({
  title,
  value,
  icon,
  color,
  sub,
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  sub?: string;
}) => (
  <Card sx={{ borderRadius: 3, boxShadow: '0 1px 4px rgba(0,0,0,0.08)', height: '100%' }}>
    <CardContent sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Typography variant="body2" color="text.secondary" fontWeight={500} sx={{ mb: 1 }}>
            {title}
          </Typography>
          <Typography variant="h4" fontWeight={700} color="#111814">
            {value}
          </Typography>
          {sub && (
            <Typography variant="caption" color="#16a34a" fontWeight={600}>
              {sub}
            </Typography>
          )}
        </Box>
        <Box
          sx={{
            width: 48,
            height: 48,
            bgcolor: color + '20',
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color,
          }}
        >
          {icon}
        </Box>
      </Box>
    </CardContent>
  </Card>
);

const GrowthChart = ({
  entity,
  color,
  title,
  icon,
}: {
  entity: 'users' | 'groups';
  color: string;
  title: string;
  icon: React.ReactNode;
}) => {
  const [period, setPeriod] = useState<Period>('30');
  const [data, setData] = useState<GrowthPoint[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(async (p: Period) => {
    setLoading(true);
    const { response } = await apiCall({
      method: 'GET',
      url: `${ENDPOINTS.ADMIN.STATS_GROWTH}?period=${p}&entity=${entity}`,
    });
    if (response?.status === 200) {
      setData(response.data.data ?? []);
    }
    setLoading(false);
  }, [entity]);

  useEffect(() => {
    fetchData(period);
  }, [fetchData, period]);

  const totalInPeriod = data.reduce((sum, d) => sum + d.count, 0);
  const grandTotal = data.length > 0 ? data[data.length - 1].total : 0;

  return (
    <Card sx={{ borderRadius: 3, boxShadow: '0 1px 4px rgba(0,0,0,0.08)', p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2, flexWrap: 'wrap', gap: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ color }}>{icon}</Box>
          <Box>
            <Typography variant="h6" fontWeight={700}>{title}</Typography>
            <Typography variant="caption" color="text.secondary">
              Tổng tích lũy:{' '}
              <strong style={{ color }}>{grandTotal.toLocaleString()}</strong>
              {' · '}Trong kỳ:{' '}
              <strong>+{totalInPeriod.toLocaleString()}</strong>
            </Typography>
          </Box>
        </Box>

        {/* Period filter */}
        <ToggleButtonGroup
          value={period}
          exclusive
          onChange={(_, val) => val && setPeriod(val)}
          size="small"
          sx={{
            '& .MuiToggleButton-root': {
              textTransform: 'none',
              fontSize: 12,
              px: 1.5,
              py: 0.5,
              border: '1px solid #e2e8f0',
              color: '#64748b',
            },
            '& .Mui-selected': {
              bgcolor: color + '15 !important',
              color: color + ' !important',
              fontWeight: 700,
              borderColor: color + ' !important',
            },
          }}
        >
          {PERIOD_OPTIONS.map((opt) => (
            <ToggleButton key={opt.value} value={opt.value}>
              {opt.label}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </Box>

      {/* Chart */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress size={32} sx={{ color }} />
        </Box>
      ) : data.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 6 }}>
          <Typography variant="body2" color="text.secondary">
            Chưa có dữ liệu trong khoảng thời gian này
          </Typography>
        </Box>
      ) : (
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id={`grad-${entity}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.25} />
                <stop offset="95%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 11, fill: '#94a3b8' }}
              interval="preserveStartEnd"
            />
            <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} allowDecimals={false} />
            <Tooltip
              contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }}
              formatter={(value: any, name: any) => [
                (value ?? 0).toLocaleString(),
                name === 'total' ? 'Tổng tích lũy' : 'Mới trong kỳ',
              ]}
            />
            {/* Đường tổng tích lũy */}
            <Area
              type="monotone"
              dataKey="total"
              stroke={color}
              strokeWidth={2.5}
              fill={`url(#grad-${entity})`}
              dot={false}
              activeDot={{ r: 5, fill: color }}
            />
            {/* Bar mới trong kỳ — dùng area mỏng */}
            <Area
              type="monotone"
              dataKey="count"
              stroke={color + '80'}
              strokeWidth={1}
              fill="none"
              strokeDasharray="4 2"
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}

      {/* Legend */}
      <Box sx={{ display: 'flex', gap: 3, mt: 1.5, pl: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Box sx={{ width: 16, height: 3, bgcolor: color, borderRadius: 1 }} />
          <Typography variant="caption" color="text.secondary">Tổng tích lũy</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Box sx={{ width: 16, height: 2, bgcolor: color + '80', borderRadius: 1, borderTop: `2px dashed ${color}80` }} />
          <Typography variant="caption" color="text.secondary">Mới trong kỳ</Typography>
        </Box>
      </Box>
    </Card>
  );
};

const AdminOverview = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      const { response } = await apiCall({ method: 'GET', url: ENDPOINTS.ADMIN.STATS });
      if (response?.status === 200) setStats(response.data.data);
      setLoading(false);
    };
    fetchStats();
  }, []);

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="caption" color="text.secondary">
        Admin / Tổng quan
      </Typography>

      <Box sx={{ mt: 1, mb: 4 }}>
        <Typography variant="h4" fontWeight={700} color="#111814">
          Tổng quan hệ thống
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Thống kê và theo dõi tăng trưởng của nền tảng TripSync.
        </Typography>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress sx={{ color: '#19e66b' }} />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {/* Stat cards */}
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <StatCard
              title="Tổng người dùng"
              value={stats?.total_users.toLocaleString() ?? 0}
              icon={<People />}
              color="#3b82f6"
              sub="Tất cả tài khoản đã đăng ký"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <StatCard
              title="Người dùng mới hôm nay"
              value={`+${stats?.new_users_today ?? 0}`}
              icon={<PersonAdd />}
              color="#19e66b"
              sub="Đăng ký trong ngày"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <StatCard
              title="Tổng nhóm chuyến đi"
              value={stats?.total_groups.toLocaleString() ?? 0}
              icon={<Groups />}
              color="#f59e0b"
              sub="Tất cả nhóm đã tạo"
            />
          </Grid>

          {/* Growth charts */}
          <Grid size={{ xs: 12, lg: 6 }}>
            <GrowthChart
              entity="users"
              color="#3b82f6"
              title="Tăng trưởng người dùng"
              icon={<People />}
            />
          </Grid>
          <Grid size={{ xs: 12, lg: 6 }}>
            <GrowthChart
              entity="groups"
              color="#f59e0b"
              title="Tăng trưởng nhóm chuyến đi"
              icon={<Groups />}
            />
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default AdminOverview;
