import React from 'react';
import { Paper, Tabs, Tab } from '@mui/material';

interface Props {
  activeTab: string;
  onChange: (event: React.SyntheticEvent, newValue: string) => void;
}

export default function TripNavigation({ activeTab, onChange }: Props) {
  return (
    <Paper elevation={0} sx={{ borderBottomLeftRadius: 16, borderBottomRightRadius: 16, borderTopLeftRadius: 0, borderTopRightRadius: 0, px: 2, mb: 3 }}>
      <Tabs 
        value={activeTab} 
        onChange={onChange} 
        TabIndicatorProps={{ sx: { backgroundColor: '#19e66b', height: 3 } }} // Màu xanh lá cho active tab
        sx={{ '& .MuiTab-root.Mui-selected': { color: '#19e66b' } }}
      >
        <Tab value="overview" label="Tổng quan" sx={{ textTransform: 'none', fontWeight: 600 }} />
        <Tab value="itinerary" label="Lịch trình" sx={{ textTransform: 'none', fontWeight: 600 }} />
        <Tab value="expenses" label="Chi phí" sx={{ textTransform: 'none', fontWeight: 600 }} />
        <Tab value="checklist" label="Danh sách chuẩn bị" sx={{ textTransform: 'none', fontWeight: 600 }} />
        <Tab value="files" label="Tài liệu" sx={{ textTransform: 'none', fontWeight: 600 }} />
      </Tabs>
    </Paper>
  );
}