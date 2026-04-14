import React, { useState, useEffect } from 'react';
import { Box, CircularProgress, Container } from '@mui/material';
import { useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';

import { useAppSelector } from '../../app/store';
import { fetchGroupDetailAction } from './redux/action';

import TripHeader from './components/tripHeader';
import TripNavigation from './components/tripNavigation';
import ItineraryTab from './components/tabs/itineraryTab';
import AiGeneratingBanner from './components/aiGeneratingBanner';
import ExpenseTab from './components/tabs/expenseTab';
import ChecklistTab from './components/tabs/checklistTab';
import OverviewTab from './components/tabs/overviewTab';

export default function TripDetailIndex() {
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState('itinerary');

  const { groupDetail, loading } = useAppSelector((state: any) => state.tripDetail);

  // useEffect 1: Fetch lần đầu khi vào trang
  useEffect(() => {
    if (!id) return;
    dispatch(fetchGroupDetailAction(id) as any);
  }, [id, dispatch]);

  // useEffect 2: Bật/tắt interval polling khi is_ai_generating thay đổi
  // Chỉ chạy sau khi đã có groupDetail từ lần fetch đầu
  useEffect(() => {
    if (!id || !groupDetail) return;

    if (!groupDetail.is_ai_generating) return; // AI đã xong, không cần poll

    const intervalId = setInterval(() => {
      dispatch(fetchGroupDetailAction(id) as any);
    }, 5000);

    return () => clearInterval(intervalId);
  }, [id, dispatch, groupDetail?.is_ai_generating]);

  const handleChangeTab = (event: React.SyntheticEvent, newValue: string) => {
    setActiveTab(newValue);
  };

  // Đang fetch lần đầu: chưa có groupDetail → show spinner
  if (loading && !groupDetail) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          gap: 2,
        }}
      >
        <Box
          sx={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* Vòng ngoài mờ */}
          <CircularProgress
            size={64}
            thickness={2}
            sx={{ color: '#d1fae5', position: 'absolute' }}
            variant="determinate"
            value={100}
          />
          {/* Vòng trong chạy */}
          <CircularProgress
            size={64}
            thickness={3}
            sx={{
              color: '#19e66b',
              animationDuration: '900ms',
            }}
          />
        </Box>
        <Box sx={{ textAlign: 'center' }}>
          <Box
            sx={{
              fontSize: '0.9rem',
              fontWeight: 600,
              color: '#374151',
              letterSpacing: '0.02em',
            }}
          >
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
          {groupDetail?.is_ai_generating ? (
            // AI đang chạy ngầm → hiện Banner loading
            <AiGeneratingBanner />
          ) : (
            // AI xong → hiện nội dung Tab bình thường
            <>
              {activeTab === 'itinerary' && <ItineraryTab />}
              {activeTab === 'expenses' && <ExpenseTab />}
              {activeTab === 'checklist' && <ChecklistTab />}
              {activeTab === 'overview' && <OverviewTab />}
            </>
          )}
        </Box>

      </Container>
    </Box>
  );
}