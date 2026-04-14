import React, { useState } from 'react';
import {
  Card, CardContent, Box, Typography, Button, Dialog, DialogTitle,
  DialogContent, DialogActions, CircularProgress, Stack,
} from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { useAppSelector, useAppDispatch } from '@/app/store';
import { deleteGroupAction } from '@/features/trip-detail/redux/action';
import { useSnackbar } from 'notistack';
import { useParams, useNavigate } from 'react-router-dom';

export default function DangerZoneCard() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { myRole } = useAppSelector((state: any) => state.tripDetail);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  if (myRole !== 'ADMIN') return null;

  const handleDelete = () => {
    setDeleting(true);
    dispatch(
      deleteGroupAction(
        id!,
        () => {
          setDeleting(false);
          setConfirmOpen(false);
          navigate('/dashboard');
        },
        (err) => {
          setDeleting(false);
          enqueueSnackbar(err, { variant: 'error' });
        },
      ) as any,
    );
  };

  return (
    <>
      <Card
        elevation={0}
        sx={{
          borderRadius: 3,
          border: '1px solid #fca5a5',
          bgcolor: '#fff5f5',
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Stack direction="row" alignItems="center" spacing={1} mb={1}>
            <WarningAmberIcon sx={{ color: '#ef4444', fontSize: '1.2rem' }} />
            <Typography fontWeight={700} color="error" fontSize="1rem">
              Khu vực nguy hiểm
            </Typography>
          </Stack>
          <Typography variant="body2" color="text.secondary" mb={2}>
            Xóa nhóm sẽ xóa vĩnh viễn toàn bộ dữ liệu chuyến đi. Hành động này không thể hoàn tác.
          </Typography>
          <Button
            variant="outlined"
            color="error"
            onClick={() => setConfirmOpen(true)}
            sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 2 }}
          >
            Xóa nhóm
          </Button>
        </CardContent>
      </Card>

      <Dialog
        open={confirmOpen}
        onClose={() => !deleting && setConfirmOpen(false)}
        PaperProps={{ sx: { borderRadius: 3, p: 1, minWidth: 340 } }}
      >
        <DialogTitle sx={{ fontWeight: 700, color: '#ef4444' }}>Xóa nhóm?</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            Toàn bộ dữ liệu chuyến đi (lịch trình, chi phí, checklist) sẽ bị xóa vĩnh viễn.
            Bạn có chắc chắn muốn tiếp tục không?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button
            onClick={() => setConfirmOpen(false)}
            disabled={deleting}
            variant="outlined"
            sx={{ textTransform: 'none', borderRadius: 2 }}
          >
            Hủy
          </Button>
          <Button
            onClick={handleDelete}
            disabled={deleting}
            variant="contained"
            color="error"
            sx={{ textTransform: 'none', borderRadius: 2, minWidth: 100 }}
          >
            {deleting ? <CircularProgress size={18} color="inherit" /> : 'Xóa nhóm'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
