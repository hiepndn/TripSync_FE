import React from 'react';
import { Stack, Typography, Button, IconButton } from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import IosShareIcon from '@mui/icons-material/IosShare';
import dayjs from 'dayjs';

interface Props {
  days: string[];
  selectedDate: string;
  onSelectDate: (date: string) => void;
}

export default function DaySelector({ days, selectedDate, onSelectDate }: Props) {
  return (
    <Stack direction="row" justifyContent="space-between" alignItems="center">
      
      {/* 🌟 SCROLL BAR CHO CÁC NGÀY (nếu chuyến đi dài) */}
      <Stack 
        direction="row" 
        spacing={1.5} 
        sx={{ 
          overflowX: 'auto', 
          pb: 1, // Padding bottom để thanh scroll không đè vào nút
          '&::-webkit-scrollbar': { height: 6 },
          '&::-webkit-scrollbar-thumb': { bgcolor: 'grey.300', borderRadius: 4 }
        }}
      >
        {days.map((day, index) => {
          const isActive = day === selectedDate;
          const displayDate = dayjs(day).format('DD/MM'); // Format thành 20/03

          return (
            <Button
              key={day}
              variant={isActive ? "contained" : "outlined"}
              onClick={() => onSelectDate(day)} // 🌟 Bắt sự kiện bấm chọn ngày
              sx={{
                bgcolor: isActive ? '#19e66b' : 'transparent',
                color: isActive ? 'white' : 'grey.600',
                borderColor: isActive ? 'transparent' : 'grey.300',
                borderRadius: 3,
                minWidth: 80,
                display: 'flex',
                flexDirection: 'column',
                py: 1,
                boxShadow: isActive ? '0 4px 10px rgba(25, 230, 107, 0.3)' : 'none',
                '&:hover': { 
                  bgcolor: isActive ? '#15c95c' : 'rgba(25, 230, 107, 0.05)',
                  borderColor: isActive ? 'transparent' : '#19e66b',
                  color: isActive ? 'white' : '#19e66b'
                },
              }}
            >
              <Typography variant="caption" sx={{ opacity: 0.9 }}>
                Ngày {index + 1}
              </Typography>
              <Typography variant="h6" fontWeight={700} lineHeight={1}>
                {displayDate}
              </Typography>
            </Button>
          );
        })}
      </Stack>

      {/* Hành động: Filter & Export */}
      <Stack direction="row" spacing={1} sx={{ pl: 2 }}>
        <IconButton sx={{ color: 'grey.500' }}>
          <FilterListIcon />
        </IconButton>
        <Button 
          variant="text" 
          startIcon={<IosShareIcon />}
          sx={{ 
            bgcolor: '#d1fae5', 
            color: '#047857', 
            fontWeight: 600,
            borderRadius: 2,
            px: 2,
            whiteSpace: 'nowrap',
            '&:hover': { bgcolor: '#bbf7d0' }
          }}
        >
          Export
        </Button>
      </Stack>
    </Stack>
  );
}