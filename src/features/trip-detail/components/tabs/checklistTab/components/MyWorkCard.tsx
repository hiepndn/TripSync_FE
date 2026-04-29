import React from 'react';
import { Box, Card, Stack, Typography, Chip, Link, IconButton } from '@mui/material';
import BackpackIcon from '@mui/icons-material/Backpack';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

import { useAppSelector, useAppDispatch } from '@/app/store';
import { toggleChecklistAction } from '../../../../redux/action';
import { useParams } from 'react-router-dom';

export default function MyWorkCard() {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();

  const { checklist } = useAppSelector((state: any) => state.tripDetail);
  const { profile } = useAppSelector((state) => state.groups); 

  const myWork = checklist?.filter((item: any) => 
    item.assignee && 
    profile && 
    item.assignee.id === profile.id && 
    !item.is_completed
  ) || [];

  const cardStyle = { borderRadius: 4, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', p: 3 };

  return (
    <Card sx={cardStyle}>
       <Stack direction="row" spacing={1} alignItems="center" mb={2}>
          <Typography variant="subtitle1" fontWeight={700}>Việc của tôi</Typography>
          <Chip label={myWork.length} size="small" sx={{ bgcolor: '#dcfce7', color: '#16a34a', fontWeight: 700, borderRadius: 1.5 }} />
       </Stack>

      {myWork.length === 0 ? (
          <Typography variant="body2" color="text.secondary" py={1}>
             Tuyệt vời! Bạn không còn công việc nào bị tồn đọng.
          </Typography>
      ) : (
          <Box sx={{ maxHeight: 280, overflowY: 'auto' }}>
          <Stack divider={<BackpackIcon sx={{ color: '#e2e8f0', fontSize: '1.2rem', my: 1 }} />} spacing={0.5}>
              {myWork.map((work: any) => (
                  <Stack key={work.id} direction="row" alignItems="center" justifyContent="space-between">
                      <Box>
                         <Typography variant="subtitle2" fontWeight={700}>{work.title}</Typography>
                         <Typography variant="caption" color="text.secondary">{work.category}</Typography>
                      </Box>
                      <IconButton 
                        size="small" 
                        onClick={() => dispatch(toggleChecklistAction(id || '', work.id) as any)}
                        sx={{ color: '#cbd5e1', '&:hover': { color: '#22c55e', bgcolor: '#f0fdf4' } }}
                      >
                        <CheckCircleOutlineIcon />
                      </IconButton>
                  </Stack>
              ))}
              <Link href="#" variant="caption" color="#22c55e" fontWeight={600} sx={{ textDecoration: 'none', mt: 1, display: 'block', textAlign: 'right' }}>
                 Xem tất cả
              </Link>
          </Stack>
          </Box>
      )}
    </Card>
  );
}