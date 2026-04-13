import React from 'react';
import { Card, Box, Typography, Stack, Button } from '@mui/material';
import OpenInFullIcon from '@mui/icons-material/OpenInFull';
import { Activity } from '@/models/activity';

interface Props {
  activities: Activity[];
}

export default function MapWidget({ activities }: Props) {
  return (
    <Card variant="outlined" sx={{ borderRadius: 4, borderColor: 'grey.200', overflow: 'hidden' }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ p: 2, borderBottom: '1px solid', borderColor: 'grey.100' }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <Typography variant="subtitle1" fontWeight={700}>Bản đồ</Typography>
          <Box sx={{ px: 1, py: 0.25, bgcolor: '#d1fae5', color: '#047857', borderRadius: 1, fontSize: '0.7rem', fontWeight: 600 }}>
            {activities.length} Locations
          </Box>
        </Stack>
        <Button size="small" color="inherit" startIcon={<OpenInFullIcon sx={{ fontSize: '1rem' }} />} sx={{ textTransform: 'none', color: 'grey.600' }}>
          Mở rộng
        </Button>
      </Stack>
      
      {/* Box này mô phỏng khu vực hiển thị Map */}
      <Box sx={{ 
        height: 250, 
        bgcolor: 'grey.50', 
        position: 'relative',
        backgroundImage: 'radial-gradient(#e5e7eb 1px, transparent 1px)',
        backgroundSize: '16px 16px'
      }}>
        {/* Box Khoảng cách đè lên map */}
        <Box sx={{ 
          position: 'absolute', 
          bottom: 16, 
          left: 16, 
          right: 16, 
          bgcolor: 'white', 
          p: 1.5, 
          borderRadius: 2, 
          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' 
        }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Box sx={{ width: 24, height: 24, bgcolor: '#d1fae5', color: '#047857', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Typography variant="caption" fontWeight="bold">▲</Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary" display="block">KHOẢNG CÁCH</Typography>
              <Typography variant="subtitle2" fontWeight={700}>~4.2 km • 15 phút</Typography>
            </Box>
          </Stack>
        </Box>
      </Box>
    </Card>
  );
}