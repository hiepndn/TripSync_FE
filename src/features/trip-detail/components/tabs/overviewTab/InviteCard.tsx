import React, { useState } from 'react';
import {
  Card, CardContent, Box, Typography, IconButton, Tooltip, Button, Stack,
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import SendIcon from '@mui/icons-material/Send';
import { useAppSelector } from '@/app/store';

export default function InviteCard() {
  const { groupDetail } = useAppSelector((state: any) => state.tripDetail);
  const [copyTooltip, setCopyTooltip] = useState('Sao chép');

  if (!groupDetail) return null;

  const handleCopy = () => {
    if (groupDetail.invite_code) {
      navigator.clipboard.writeText(groupDetail.invite_code);
      setCopyTooltip('Đã sao chép!');
      setTimeout(() => setCopyTooltip('Sao chép'), 2000);
    }
  };

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 3,
        bgcolor: '#111827',
        color: 'white',
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Typography fontWeight={700} fontSize="1rem" mb={0.5}>
          Mời thành viên
        </Typography>
        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
          Chia sẻ mã nhóm để bạn bè cùng tham gia
        </Typography>

        {/* Invite code box */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            bgcolor: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: 2,
            px: 2,
            py: 1.5,
            mt: 2,
            mb: 2,
          }}
        >
          <Typography
            fontFamily="monospace"
            fontWeight={700}
            fontSize="1.3rem"
            letterSpacing={3}
          >
            {groupDetail.invite_code || '—'}
          </Typography>
          <Tooltip title={copyTooltip} placement="top">
            <IconButton
              onClick={handleCopy}
              size="small"
              sx={{ color: '#19e66b', '&:hover': { bgcolor: 'rgba(25,230,107,0.1)' } }}
            >
              <ContentCopyIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>

        <Button
          fullWidth
          variant="contained"
          startIcon={<SendIcon />}
          onClick={handleCopy}
          sx={{
            bgcolor: 'rgba(255,255,255,0.12)',
            color: 'white',
            textTransform: 'none',
            fontWeight: 600,
            borderRadius: 2,
            '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' },
          }}
        >
          Gửi lời mời
        </Button>
      </CardContent>
    </Card>
  );
}
