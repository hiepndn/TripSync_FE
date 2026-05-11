/**
 * Demo Mode — inject mock data vào Redux store rồi render TripDetailIndex.
 * Giao diện 100% giống thật, không gọi API, không cần đăng nhập.
 */
import { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import {
  Box, Button, Stack, Typography, Paper, IconButton, LinearProgress,
} from '@mui/material';
import {
  EmojiPeople, Login, Close, ArrowForward, ArrowBack, LightbulbOutlined,
} from '@mui/icons-material';
import { useNavigate, useParams, Navigate } from 'react-router-dom';

import TripDetailIndex from '@/features/trip-detail';
import {
  FETCH_GROUP_DETAIL_SUCCESS,
  FETCH_ACTIVITIES_SUCCESS,
  GET_CHECKLIST_SUCCESS,
  GET_EXPENSE_LIST_SUCCESS,
  GET_DEBTS_SUCCESS,
  GET_EXPENSE_SUMMARY_SUCCESS,
} from '@/features/trip-detail/redux/types';
import {
  DEMO_GROUP, DEMO_MEMBERS, DEMO_ACTIVITIES,
  DEMO_EXPENSES, DEMO_CHECKLIST,
} from './mockData';

// ─── Tour steps ───────────────────────────────────────────────────────────────

const TOUR_STEPS = [
  {
    emoji: '🗺️',
    title: 'Chào mừng đến TripSync!',
    desc: 'Đây là trang chi tiết chuyến đi. Bạn có thể xem lịch trình, chi phí, danh sách chuẩn bị và tài liệu — tất cả trong một nơi.',
  },
  {
    emoji: '📅',
    title: 'Lịch trình theo ngày',
    desc: 'Chọn từng ngày để xem hoạt động. Nhấn "+ Đề xuất" để thêm địa điểm mới vào lịch trình.',
  },
  {
    emoji: '👍',
    title: 'Bỏ phiếu dân chủ',
    desc: 'Mỗi thành viên có thể vote cho hoạt động yêu thích. Admin chốt hoạt động có nhiều vote nhất.',
  },
  {
    emoji: '💰',
    title: 'Chia sẻ chi phí',
    desc: 'Tab "Chi phí" giúp theo dõi ai đã trả gì, ai nợ ai — tự động tính toán và chia đều.',
  },
  {
    emoji: '✅',
    title: 'Danh sách chuẩn bị',
    desc: 'Tab "Chuẩn bị" để tạo checklist hành lý, phân công việc cho từng thành viên.',
  },
  {
    emoji: '🚀',
    title: 'Sẵn sàng chưa?',
    desc: 'Đăng ký miễn phí để tạo chuyến đi thật, mời bạn bè và dùng AI lên lịch trình tự động!',
  },
];

// ─── Component ───────────────────────────────────────────────────────────────

export default function DemoPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const [ready, setReady] = useState(false);
  const [tourStep, setTourStep] = useState(0);
  const [tourVisible, setTourVisible] = useState(true);

  // Redirect /demo → /demo/trip để useParams trong TripDetailIndex có id
  if (!id) return <Navigate to="/demo/trip" replace />;

  // ── Seed Redux store với mock data ──
  useEffect(() => {
    (window as any).__DEMO_MODE__ = true;

    dispatch({
      type: FETCH_GROUP_DETAIL_SUCCESS,
      payload: { group_info: DEMO_GROUP, members: DEMO_MEMBERS, my_role: 'ADMIN' },
    });
    dispatch({ type: FETCH_ACTIVITIES_SUCCESS, payload: DEMO_ACTIVITIES });
    dispatch({ type: GET_CHECKLIST_SUCCESS, payload: DEMO_CHECKLIST });
    dispatch({ type: GET_EXPENSE_LIST_SUCCESS, payload: DEMO_EXPENSES });
    dispatch({ type: GET_DEBTS_SUCCESS, payload: [] });
    dispatch({
      type: GET_EXPENSE_SUMMARY_SUCCESS,
      payload: {
        total: DEMO_EXPENSES.reduce((s, e) => s + e.amount, 0),
        per_person: Math.round(DEMO_EXPENSES.reduce((s, e) => s + e.amount, 0) / DEMO_MEMBERS.length),
        currency: 'VND',
      },
    });

    setReady(true);
    return () => { (window as any).__DEMO_MODE__ = false; };
  }, [dispatch]);

  if (!ready) return null;

  const step = TOUR_STEPS[tourStep];
  const isLast = tourStep === TOUR_STEPS.length - 1;

  return (
    <Box sx={{ position: 'relative' }}>
      {/* ── Demo Banner ── */}
      <Box sx={{
        bgcolor: '#111827', color: 'white', py: 0.75, px: 3,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'sticky', top: 0, zIndex: 1300, gap: 2,
      }}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <EmojiPeople sx={{ color: '#19e66b', fontSize: 20 }} />
          <Typography variant="body2" fontWeight={600} sx={{ display: { xs: 'none', sm: 'block' } }}>
            Chế độ Demo — Dữ liệu không được lưu.
          </Typography>
          <Typography variant="body2" fontWeight={600} sx={{ display: { xs: 'block', sm: 'none' } }}>
            Demo Mode
          </Typography>
        </Stack>
        <Stack direction="row" spacing={1} alignItems="center">
          {!tourVisible && (
            <Button
              size="small"
              startIcon={<LightbulbOutlined sx={{ fontSize: '1rem !important' }} />}
              onClick={() => setTourVisible(true)}
              sx={{ color: '#fbbf24', textTransform: 'none', fontWeight: 600, fontSize: '0.75rem' }}
            >
              Hướng dẫn
            </Button>
          )}
          <Button
            variant="contained"
            size="small"
            startIcon={<Login sx={{ fontSize: '1rem !important' }} />}
            onClick={() => navigate('/login')}
            sx={{ bgcolor: '#19e66b', color: '#111', fontWeight: 700, textTransform: 'none', borderRadius: 2, py: 0.5, px: 2, flexShrink: 0 }}
          >
            Đăng ký miễn phí
          </Button>
        </Stack>
      </Box>

      {/* ── Giao diện thật ── */}
      <TripDetailIndex />

      {/* ── Tour Guide Card (góc dưới phải) ── */}
      {tourVisible && (
        <Paper
          elevation={8}
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            width: { xs: 'calc(100vw - 48px)', sm: 340 },
            borderRadius: 4,
            overflow: 'hidden',
            zIndex: 1400,
            border: '1px solid #e5e7eb',
          }}
        >
          {/* Progress bar */}
          <LinearProgress
            variant="determinate"
            value={((tourStep + 1) / TOUR_STEPS.length) * 100}
            sx={{ height: 3, bgcolor: '#e5e7eb', '& .MuiLinearProgress-bar': { bgcolor: '#19e66b' } }}
          />

          <Box sx={{ p: 2.5 }}>
            {/* Header */}
            <Stack direction="row" alignItems="flex-start" justifyContent="space-between" mb={1.5}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Typography fontSize="1.5rem">{step.emoji}</Typography>
                <Typography variant="subtitle1" fontWeight={700} color="#111827">
                  {step.title}
                </Typography>
              </Stack>
              <IconButton size="small" onClick={() => setTourVisible(false)} sx={{ color: '#9ca3af', mt: -0.5 }}>
                <Close fontSize="small" />
              </IconButton>
            </Stack>

            {/* Description */}
            <Typography variant="body2" color="#4b5563" lineHeight={1.6} mb={2}>
              {step.desc}
            </Typography>

            {/* Step counter + buttons */}
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Typography variant="caption" color="#9ca3af" fontWeight={600}>
                {tourStep + 1} / {TOUR_STEPS.length}
              </Typography>
              <Stack direction="row" spacing={1}>
                {tourStep > 0 && (
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<ArrowBack sx={{ fontSize: '0.9rem !important' }} />}
                    onClick={() => setTourStep((s) => s - 1)}
                    sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 2, borderColor: '#e5e7eb', color: '#374151', py: 0.5 }}
                  >
                    Trước
                  </Button>
                )}
                {isLast ? (
                  <Button
                    size="small"
                    variant="contained"
                    onClick={() => navigate('/login')}
                    sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2, bgcolor: '#19e66b', color: '#111', py: 0.5, '&:hover': { bgcolor: '#16d360' } }}
                  >
                    Đăng ký ngay 🚀
                  </Button>
                ) : (
                  <Button
                    size="small"
                    variant="contained"
                    endIcon={<ArrowForward sx={{ fontSize: '0.9rem !important' }} />}
                    onClick={() => setTourStep((s) => s + 1)}
                    sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2, bgcolor: '#111827', color: 'white', py: 0.5, '&:hover': { bgcolor: '#1f2937' } }}
                  >
                    Tiếp
                  </Button>
                )}
              </Stack>
            </Stack>
          </Box>
        </Paper>
      )}
    </Box>
  );
}

