import React, { useState, useEffect, useRef } from 'react';
import { Box, CircularProgress, Container } from '@mui/material';
import { useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useSnackbar } from 'notistack';

import { useAppSelector } from '../../app/store';
import { fetchGroupDetailAction, fetchActivitiesAction } from './redux/action';
import { useGroupWebSocket } from '@/hooks/useGroupWebSocket';

import TripHeader from './components/tripHeader';
import TripNavigation from './components/tripNavigation';
import ItineraryTab from './components/tabs/itineraryTab';
import AiGeneratingBanner from './components/aiGeneratingBanner';
import ExpenseTab from './components/tabs/expenseTab';
import ChecklistTab from './components/tabs/checklistTab';
import OverviewTab from './components/tabs/overviewTab';
import DocumentsTab from './components/tabs/documentsTab';

export default function TripDetailIndex() {
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const [activeTab, setActiveTab] = useState('itinerary');

  const { groupDetail, loading } = useAppSelector((state: any) => state.tripDetail);
  const isAIGenerating = groupDetail?.is_ai_generating ?? false;

  const prevAiError = useRef<string>('');

  // ===== Fetch lần đầu khi vào trang =====
  useEffect(() => {
    if (!id) return;
    dispatch(fetchGroupDetailAction(id) as any);
  }, [id, dispatch]);

  // ===== WebSocket: lắng nghe event AI từ BE =====
  // Chỉ kết nối khi AI đang generating — tự động ngắt khi xong
  useGroupWebSocket(id, isAIGenerating, {
    onAIDone: () => {
      // Fetch lại group detail để cập nhật is_ai_generating = false
      dispatch(fetchGroupDetailAction(id!) as any);
      // Fetch luôn activities để hiện lịch trình mới
      dispatch(fetchActivitiesAction(id!) as any);
    },
    onAIError: (payload) => {
      const msg = payload?.message || 'AI gặp sự cố khi tạo lịch trình. Vui lòng thử lại sau.';
      enqueueSnackbar(msg, {
        variant: 'error',
        autoHideDuration: 8000,
        anchorOrigin: { vertical: 'top', horizontal: 'center' },
      });
      dispatch(fetchGroupDetailAction(id!) as any);
    },
  });

  // ===== Fallback polling (5s) — dự phòng nếu WS bị block/proxy =====
  // Chỉ chạy khi AI đang generating VÀ WebSocket không available
  useEffect(() => {
    if (!id || !isAIGenerating) return;

    // Kiểm tra WebSocket có available không
    const wsSupported = typeof WebSocket !== 'undefined';
    if (wsSupported) return; // WS đang handle, không cần poll

    const intervalId = setInterval(() => {
      dispatch(fetchGroupDetailAction(id) as any);
    }, 5000);

    return () => clearInterval(intervalId);
  }, [id, dispatch, isAIGenerating]);

  // ===== Hiển thị lỗi AI từ field ai_error =====
  useEffect(() => {
    if (!groupDetail) return;
    const currentError = groupDetail.ai_error || '';
    if (currentError && currentError !== prevAiError.current) {
      enqueueSnackbar(currentError, {
        variant: 'error',
        autoHideDuration: 8000,
        anchorOrigin: { vertical: 'top', horizontal: 'center' },
      });
    }
    prevAiError.current = currentError;
  }, [groupDetail?.ai_error]);

  const handleChangeTab = (_: React.SyntheticEvent, newValue: string) => {
    setActiveTab(newValue);
  };

  // Loading lần đầu
  if (loading && !groupDetail) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          gap: 2,
        }}
      >
        <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <CircularProgress size={64} thickness={2} sx={{ color: '#d1fae5', position: 'absolute' }} variant="determinate" value={100} />
          <CircularProgress size={64} thickness={3} sx={{ color: '#19e66b', animationDuration: '900ms' }} />
        </Box>
        <Box sx={{ textAlign: 'center' }}>
          <Box sx={{ fontSize: '0.9rem', fontWeight: 600, color: '#374151', letterSpacing: '0.02em' }}>
            Đang tải chuyến đi...
          </Box>
          <Box sx={{ fontSize: '0.78rem', color: '#9ca3af', mt: 0.5 }}>
            Vui lòng chờ trong giây lát
          </Box>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f9fafb', pb: 4 }}>
      <Container maxWidth="lg" sx={{ pt: 3 }}>
        <TripHeader />
        <TripNavigation activeTab={activeTab} onChange={handleChangeTab} />

        <Box sx={{ mt: 3 }}>
          {isAIGenerating ? (
            <AiGeneratingBanner />
          ) : (
            <>
              {activeTab === 'itinerary' && <ItineraryTab />}
              {activeTab === 'expenses' && <ExpenseTab />}
              {activeTab === 'checklist' && <ChecklistTab />}
              {activeTab === 'overview' && <OverviewTab />}
              {activeTab === 'files' && <DocumentsTab />}
            </>
          )}
        </Box>
      </Container>
    </Box>
  );
}
