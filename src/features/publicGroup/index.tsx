import { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Typography,
  CircularProgress,
  Tabs,
  Tab,
  Button,
  Chip,
  Stack,
  Card,
  CardContent,
  Grid,
  IconButton,
  Tooltip,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { useNavigate, useParams } from 'react-router-dom';
import { apiCall } from '@/config/api';
import { ENDPOINTS } from '@/config/api/endpoint';
import { useSnackbar } from 'notistack';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import ImportItineraryDialog from '@/components/ImportItineraryDialog';
dayjs.extend(utc);

// ─── Types ───────────────────────────────────────────────────────────────────

interface PublicGroupInfo {
  id: number;
  name: string;
  description: string;
  departure_location: string;
  route_destinations: string;
  start_date: string;
  end_date: string;
  is_public: boolean;
}

interface PublicActivity {
  id: number;
  name: string;
  type: string;
  location: string;
  description: string;
  start_time: string;
  end_time: string;
  estimated_cost: number;
  currency: string;
  status: string;
}

interface PublicExpenseSummary {
  total_amount: number;
  expense_count: number;
}

interface PublicGroupDetail {
  group_info: PublicGroupInfo;
  activities: PublicActivity[];
  expense_summary: PublicExpenseSummary;
}

// ─── Activity type label map ──────────────────────────────────────────────────

const TYPE_LABELS: Record<string, string> = {
  HOTEL: '🏨 Khách sạn',
  ATTRACTION: '🎡 Tham quan',
  RESTAURANT: '🍜 Ăn uống',
  CAMPING: '⛺ Cắm trại',
  TRANSPORT: '🚌 Di chuyển',
};

// ─── Component ───────────────────────────────────────────────────────────────

export default function PublicGroupPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const [data, setData] = useState<PublicGroupDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorType, setErrorType] = useState<'not_found' | 'forbidden' | 'error' | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [openImportDialog, setOpenImportDialog] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetchDetail = async () => {
      setLoading(true);
      setErrorType(null);
      try {
        const { response } = await apiCall({
          method: 'GET',
          url: ENDPOINTS.GROUP.PUBLIC_DETAIL(id),
        });
        if (response?.status === 200) {
          setData(response.data?.data ?? null);
        } else if (response?.status === 403) {
          setErrorType('forbidden');
        } else if (response?.status === 404) {
          setErrorType('not_found');
        } else {
          setErrorType('error');
        }
      } catch {
        setErrorType('error');
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  const handleImport = () => {
    // Check if user is logged in
    const jwt = localStorage.getItem('jwt');
    if (!jwt) {
      navigate('/login');
      return;
    }
    setOpenImportDialog(true);
  };

  // ── Loading ──
  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          gap: 2,
        }}
      >
        <CircularProgress sx={{ color: '#19e66b' }} size={56} />
        <Typography color="text.secondary">Đang tải thông tin chuyến đi...</Typography>
      </Box>
    );
  }

  // ── Error states ──
  if (errorType) {
    const messages: Record<string, { title: string; body: string }> = {
      forbidden: {
        title: 'Nhóm này không công khai',
        body: 'Chuyến đi này đã được đặt ở chế độ riêng tư và không thể xem.',
      },
      not_found: {
        title: 'Không tìm thấy chuyến đi',
        body: 'Chuyến đi này không tồn tại hoặc đã bị xóa.',
      },
      error: {
        title: 'Đã xảy ra lỗi',
        body: 'Không thể tải thông tin chuyến đi. Vui lòng thử lại sau.',
      },
    };
    const msg = messages[errorType];
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          gap: 3,
          p: 4,
          textAlign: 'center',
        }}
      >
        <Typography variant="h4" fontWeight={700}>
          {msg.title}
        </Typography>
        <Typography color="text.secondary" maxWidth={400}>
          {msg.body}
        </Typography>
        <Button
          variant="contained"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/dashboard')}
          sx={{
            bgcolor: '#111827',
            color: 'white',
            borderRadius: 3,
            textTransform: 'none',
            fontWeight: 700,
            px: 4,
            '&:hover': { bgcolor: '#1f2937' },
          }}
        >
          Về trang chủ
        </Button>
      </Box>
    );
  }

  if (!data) return null;

  const { group_info, activities, expense_summary } = data;
  const dateStr = `${dayjs(group_info.start_date).format('DD/MM/YYYY')} – ${dayjs(group_info.end_date).format('DD/MM/YYYY')}`;

  // Group activities by day
  const activitiesByDay: Record<string, PublicActivity[]> = {};
  (activities ?? []).forEach((act) => {
    const day = dayjs(act.start_time).format('YYYY-MM-DD');
    if (!activitiesByDay[day]) activitiesByDay[day] = [];
    activitiesByDay[day].push(act);
  });
  const sortedDays = Object.keys(activitiesByDay).sort();

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f9fafb', pb: 6 }}>
      {/* ── Cover Banner ── */}
      <Box
        sx={{
          position: 'relative',
          height: 300,
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `url(https://picsum.photos/seed/${group_info.id}/1400/400)`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.1) 60%, rgba(0,0,0,0.4) 100%)',
          }}
        />

        {/* Back button */}
        <Tooltip title="Về trang khám phá" placement="right">
          <IconButton
            onClick={() => navigate('/dashboard')}
            sx={{
              position: 'absolute',
              top: 24,
              left: 24,
              bgcolor: 'rgba(255,255,255,0.2)',
              backdropFilter: 'blur(8px)',
              color: 'white',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' },
            }}
          >
            <ArrowBackIcon />
          </IconButton>
        </Tooltip>

        {/* Import button */}
        <Button
          variant="contained"
          startIcon={<FileDownloadIcon />}
          onClick={handleImport}
          sx={{
            position: 'absolute',
            top: 24,
            right: 24,
            bgcolor: '#19e66b',
            color: '#111',
            fontWeight: 700,
            borderRadius: 3,
            textTransform: 'none',
            '&:hover': { bgcolor: '#15c95e' },
          }}
        >
          Import lịch trình
        </Button>

        {/* Group info overlay */}
        <Box sx={{ position: 'absolute', bottom: 24, left: 24, color: 'white' }}>
          <Typography variant="h3" fontWeight={800} sx={{ textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}>
            {group_info.name}
          </Typography>
          {group_info.description && (
            <Typography
              variant="subtitle1"
              sx={{ mt: 0.5, opacity: 0.9, textShadow: '0 1px 4px rgba(0,0,0,0.5)', maxWidth: 600 }}
            >
              {group_info.description}
            </Typography>
          )}
          <Stack direction="row" spacing={1} mt={2} flexWrap="wrap">
            <Chip
              icon={<CalendarMonthIcon fontSize="small" sx={{ color: '#a78bfa !important' }} />}
              label={dateStr}
              sx={{
                bgcolor: 'rgba(255,255,255,0.15)',
                color: 'white',
                backdropFilter: 'blur(8px)',
                fontWeight: 600,
                borderRadius: 2,
              }}
            />
            {group_info.departure_location && (
              <Chip
                icon={<LocationOnIcon fontSize="small" sx={{ color: '#34d399 !important' }} />}
                label={group_info.departure_location}
                sx={{
                  bgcolor: 'rgba(255,255,255,0.15)',
                  color: 'white',
                  backdropFilter: 'blur(8px)',
                  fontWeight: 600,
                  borderRadius: 2,
                }}
              />
            )}
          </Stack>
        </Box>
      </Box>

      {/* ── Tabs ── */}
      <Container maxWidth="lg" sx={{ mt: 3 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs
            value={activeTab}
            onChange={(_, v) => setActiveTab(v)}
            sx={{
              '& .MuiTab-root': { textTransform: 'none', fontWeight: 600 },
              '& .Mui-selected': { color: '#19e66b !important' },
              '& .MuiTabs-indicator': { bgcolor: '#19e66b' },
            }}
          >
            <Tab label="Thông tin" />
            <Tab label="Lịch trình" />
            <Tab label="Chi phí" />
          </Tabs>
        </Box>

        {/* ── Tab 0: Thông tin ── */}
        {activeTab === 0 && (
          <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid #e5e7eb' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={700} mb={2}>
                Thông tin chuyến đi
              </Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>
                    Tên nhóm
                  </Typography>
                  <Typography fontWeight={600} mt={0.5}>
                    {group_info.name}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>
                    Điểm xuất phát
                  </Typography>
                  <Typography fontWeight={600} mt={0.5}>
                    {group_info.departure_location || '—'}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>
                    Tuyến đường
                  </Typography>
                  <Typography fontWeight={600} mt={0.5}>
                    {group_info.route_destinations || '—'}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>
                    Thời gian
                  </Typography>
                  <Typography fontWeight={600} mt={0.5}>
                    {dateStr}
                  </Typography>
                </Grid>
                {group_info.description && (
                  <Grid size={{ xs: 12 }}>
                    <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>
                      Mô tả
                    </Typography>
                    <Typography mt={0.5} color="text.secondary">
                      {group_info.description}
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>
        )}

        {/* ── Tab 1: Lịch trình ── */}
        {activeTab === 1 && (
          <Box>
            {sortedDays.length === 0 ? (
              <Box sx={{ p: 6, textAlign: 'center', border: '2px dashed #cbd5e1', borderRadius: 4 }}>
                <Typography color="text.secondary">Chưa có hoạt động nào trong lịch trình.</Typography>
              </Box>
            ) : (
              sortedDays.map((day, dayIndex) => (
                <Box key={day} mb={4}>
                  <Typography variant="h6" fontWeight={700} mb={2} sx={{ color: '#111814' }}>
                    Ngày {dayIndex + 1} — {dayjs(day).format('DD/MM/YYYY')}
                  </Typography>
                  <Stack spacing={2}>
                    {activitiesByDay[day].map((act) => (
                      <Card
                        key={act.id}
                        elevation={0}
                        sx={{ borderRadius: 3, border: '1px solid #e5e7eb' }}
                      >
                        <CardContent sx={{ p: 2.5 }}>
                          <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={2}>
                            <Box flex={1}>
                              <Stack direction="row" alignItems="center" spacing={1} mb={0.5}>
                                <Chip
                                  label={TYPE_LABELS[act.type] ?? act.type}
                                  size="small"
                                  sx={{
                                    bgcolor: '#f0fdf4',
                                    color: '#16a34a',
                                    fontWeight: 600,
                                    fontSize: '0.75rem',
                                  }}
                                />
                                {act.status === 'APPROVE' && (
                                  <Chip
                                    label="Đã chốt"
                                    size="small"
                                    sx={{ bgcolor: '#eff6ff', color: '#2563eb', fontWeight: 600, fontSize: '0.75rem' }}
                                  />
                                )}
                              </Stack>
                              <Typography fontWeight={700} fontSize="1rem">
                                {act.name}
                              </Typography>
                              {act.location && (
                                <Typography variant="body2" color="text.secondary" mt={0.25}>
                                  📍 {act.location}
                                </Typography>
                              )}
                              {act.description && (
                                <Typography variant="body2" color="text.secondary" mt={0.5}>
                                  {act.description}
                                </Typography>
                              )}
                            </Box>
                            <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
                              <Typography variant="body2" fontWeight={600} color="text.secondary">
                                {dayjs(act.start_time).format('HH:mm')} –{' '}
                                {dayjs(act.end_time).format('HH:mm')}
                              </Typography>
                              {act.estimated_cost > 0 && (
                                <Typography variant="caption" color="#16a34a" fontWeight={600}>
                                  ~{act.estimated_cost.toLocaleString('vi-VN')} {act.currency || 'VND'}
                                </Typography>
                              )}
                            </Box>
                          </Stack>
                        </CardContent>
                      </Card>
                    ))}
                  </Stack>
                </Box>
              ))
            )}
          </Box>
        )}

        {/* ── Tab 2: Chi phí ── */}
        {activeTab === 2 && (
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid #e5e7eb', p: 1 }}>
                <CardContent>
                  <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>
                    Tổng chi tiêu
                  </Typography>
                  <Typography variant="h4" fontWeight={800} mt={1}>
                    {(expense_summary?.total_amount ?? 0).toLocaleString('vi-VN')}
                    <Typography component="span" variant="body2" color="text.secondary" fontWeight={600} ml={1}>
                      VND
                    </Typography>
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid #e5e7eb', p: 1 }}>
                <CardContent>
                  <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>
                    Số khoản chi
                  </Typography>
                  <Typography variant="h4" fontWeight={800} mt={1}>
                    {expense_summary?.expense_count ?? 0}
                    <Typography component="span" variant="body2" color="text.secondary" fontWeight={600} ml={1}>
                      khoản
                    </Typography>
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            {(expense_summary?.expense_count ?? 0) === 0 && (
              <Grid size={{ xs: 12 }}>
                <Box sx={{ p: 4, textAlign: 'center', border: '2px dashed #cbd5e1', borderRadius: 4 }}>
                  <Typography color="text.secondary">Nhóm này chưa có khoản chi tiêu nào.</Typography>
                </Box>
              </Grid>
            )}
          </Grid>
        )}
      </Container>

      {/* ── Import Dialog ── */}
      <ImportItineraryDialog
        open={openImportDialog}
        onClose={() => setOpenImportDialog(false)}
        sourceGroupId={group_info.id}
        onSuccess={(count) => {
          enqueueSnackbar(`Import thành công ${count} hoạt động!`, { variant: 'success' });
        }}
      />
    </Box>
  );
}
