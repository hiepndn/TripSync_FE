import React, { useState } from 'react';
import {
  Card, CardContent, Box, Typography, Avatar, Chip, IconButton,
  Stack, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  CircularProgress,
} from '@mui/material';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import { useAppSelector, useAppDispatch } from '@/app/store';
import { kickMemberAction } from '@/features/trip-detail/redux/action';
import { useSnackbar } from 'notistack';
import { useParams } from 'react-router-dom';

export default function MembersCard() {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { members, myRole } = useAppSelector((state: any) => state.tripDetail);
  const profile = useAppSelector((state: any) => state.groups.profile);
  const isAdmin = myRole === 'ADMIN';
  const currentUserId = profile?.id;

  const [kickTarget, setKickTarget] = useState<any>(null);
  const [kicking, setKicking] = useState(false);

  const handleKickConfirm = () => {
    if (!kickTarget) return;
    setKicking(true);
    dispatch(
      kickMemberAction(
        id!,
        kickTarget.id,
        () => {
          setKicking(false);
          setKickTarget(null);
          enqueueSnackbar('Đã xóa thành viên khỏi nhóm', { variant: 'success' });
        },
        (err) => {
          setKicking(false);
          enqueueSnackbar(err, { variant: 'error' });
        },
      ) as any,
    );
  };

  return (
    <>
      <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid #e5e7eb' }}>
        <CardContent sx={{ p: 3 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
            <Typography fontWeight={700} fontSize="1rem">
              Thành viên {members?.length ?? 0}
            </Typography>
          </Stack>

          <Stack spacing={1}>
            {members?.map((member: any) => {
              const isCurrentUser = member.id === currentUserId;
              const isMemberAdmin = member.role === 'ADMIN';
              const displayName = isCurrentUser ? `${member.full_name} (Bạn)` : member.full_name;

              return (
                <Box
                  key={member.id}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    p: 1,
                    borderRadius: 2,
                    '&:hover': { bgcolor: '#f9fafb' },
                    '&:hover .kick-btn': { opacity: 1 },
                  }}
                >
                  <Avatar
                    src={member.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(member.full_name)}&backgroundColor=0f766e`}
                    alt={member.full_name}
                    sx={{ width: 36, height: 36 }}
                  />
                  <Box flex={1} minWidth={0}>
                    <Typography variant="body2" fontWeight={600} noWrap>
                      {displayName}
                    </Typography>
                  </Box>
                  <Chip
                    label={isMemberAdmin ? 'Admin' : 'Thành viên'}
                    size="small"
                    sx={{
                      fontWeight: 600,
                      fontSize: '0.7rem',
                      bgcolor: isMemberAdmin ? 'rgba(25,230,107,0.12)' : '#f3f4f6',
                      color: isMemberAdmin ? '#15803d' : '#6b7280',
                    }}
                  />
                  {isAdmin && !isMemberAdmin && (
                    <IconButton
                      className="kick-btn"
                      size="small"
                      onClick={() => setKickTarget(member)}
                      sx={{
                        opacity: 0,
                        transition: 'opacity 0.15s',
                        color: '#ef4444',
                        '&:hover': { bgcolor: 'rgba(239,68,68,0.08)' },
                      }}
                    >
                      <PersonRemoveIcon fontSize="small" />
                    </IconButton>
                  )}
                </Box>
              );
            })}
          </Stack>
        </CardContent>
      </Card>

      {/* Kick confirmation dialog */}
      <Dialog
        open={!!kickTarget}
        onClose={() => !kicking && setKickTarget(null)}
        PaperProps={{ sx: { borderRadius: 3, p: 1, minWidth: 320 } }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Xóa thành viên?</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            Bạn có chắc muốn xóa <b>{kickTarget?.full_name}</b> khỏi nhóm không?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button
            onClick={() => setKickTarget(null)}
            disabled={kicking}
            variant="outlined"
            sx={{ textTransform: 'none', borderRadius: 2 }}
          >
            Hủy
          </Button>
          <Button
            onClick={handleKickConfirm}
            disabled={kicking}
            variant="contained"
            color="error"
            sx={{ textTransform: 'none', borderRadius: 2, minWidth: 80 }}
          >
            {kicking ? <CircularProgress size={18} color="inherit" /> : 'Xóa'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
