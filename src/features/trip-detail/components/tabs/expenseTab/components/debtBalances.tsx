import React, { useState } from 'react';
import { Box, Typography, Button, Card, Stack, Avatar, Divider, Chip, Dialog, DialogTitle, DialogContent, DialogActions, CircularProgress } from '@mui/material';
import ArrowRightAltIcon from '@mui/icons-material/ArrowRightAlt';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/app/store';
import { useSnackbar } from 'notistack';
import { settleDebtAction } from '../../../../redux/action';

interface Props {
  debts: any[];
  members: any[];
}

export default function DebtBalances({ debts, members }: Props) {
  const { id: groupId } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const { enqueueSnackbar } = useSnackbar();

  // Lấy myRole và profile để phân quyền
  const { myRole } = useAppSelector((state: any) => state.tripDetail);
  const { profile } = useAppSelector((state: any) => state.groups);
  const myId = profile?.id;

  const [selectedDebt, setSelectedDebt] = useState<any>(null);
  const [isSettling, setIsSettling] = useState(false);

  const getUserInfo = (userId: number) => {
    return members?.find((m: any) => m.id === userId) || { full_name: 'Unknown', avatar: '' };
  };

  const handleConfirmSettle = () => {
    if (!groupId || !selectedDebt) return;
    setIsSettling(true);
    
    dispatch(settleDebtAction(
      groupId,
      {
        from_user_id: selectedDebt.from_user_id,
        to_user_id: selectedDebt.to_user_id,
        amount: selectedDebt.amount,
      },
      () => {
        setIsSettling(false);
        setSelectedDebt(null);
        enqueueSnackbar('Đã ghi nhận thanh toán thành công!', { variant: 'success' });
      },
      (err: string) => {
        setIsSettling(false);
        enqueueSnackbar(err || 'Có lỗi xảy ra', { variant: 'error' });
      }
    ) as any);
  };

  return (
    <Card sx={{ borderRadius: 4, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', p: 3 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h6">Bảng cân đối nợ</Typography>
        <Chip label="Tự động cấn trừ" size="small" sx={{ bgcolor: '#dcfce7', color: '#16a34a', fontWeight: 700, borderRadius: 1.5 }} />
      </Stack>

      {!debts || debts.length === 0 ? (
        <Typography textAlign="center" color="text.secondary" py={3}>Mọi người đã hòa tiền, không ai nợ ai!</Typography>
      ) : (
        <Stack spacing={2.5}>
          {debts.filter((debt: any) => debt.amount > 0).map((debt: any, index: number) => {
            const fromUser = getUserInfo(debt.from_user_id);
            const toUser = getUserInfo(debt.to_user_id);
            return (
              <Box key={index} sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 3, border: '1px solid #f1f5f9' }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Avatar src={fromUser.avatar} sx={{ width: 32, height: 32 }} />
                    <ArrowRightAltIcon sx={{ color: '#94a3b8' }} />
                    <Avatar src={toUser.avatar} sx={{ width: 32, height: 32 }} />
                  </Stack>
                  <Typography variant="subtitle1" fontWeight={700} color="#ef4444">
                    {debt.amount.toLocaleString('vi-VN')} đ
                  </Typography>
                </Stack>
                
                <Typography variant="body2" color="text.secondary" mb={1.5}>
                  <b>{fromUser.full_name}</b> cần chuyển trả cho <b>{toUser.full_name}</b>
                </Typography>

                {/* NÚT XÁC NHẬN TRẢ NỢ (Chỉ Admin, Người chuyển, hoặc Người nhận mới thấy) */}
                {(myRole === 'ADMIN' || myId === debt.from_user_id || myId === debt.to_user_id) && (
                  <Button 
                    size="small" 
                    fullWidth
                    variant="outlined" 
                    startIcon={<CheckCircleOutlineIcon />}
                    onClick={() => setSelectedDebt({ ...debt, fromUser, toUser })}
                    sx={{ color: '#22c55e', borderColor: '#22c55e', borderRadius: 2, fontWeight: 700, textTransform: 'none', '&:hover': { bgcolor: '#f0fdf4' } }}
                  >
                    Ghi nhận đã chuyển khoản
                  </Button>
                )}
              </Box>
            );
          })}
        </Stack>
      )}

      {/* DIALOG XÁC NHẬN THANH TOÁN */}
      <Dialog
        open={Boolean(selectedDebt)}
        onClose={() => !isSettling && setSelectedDebt(null)}
        PaperProps={{ sx: { borderRadius: 3, p: 1, minWidth: 350 } }}
      >
        <DialogTitle sx={{ textAlign: 'center', fontWeight: 700 }}>Xác nhận thanh toán</DialogTitle>
        <DialogContent sx={{ textAlign: 'center' }}>
          <Typography variant="body1" mb={2}>
            Ghi nhận <b>{selectedDebt?.fromUser?.full_name}</b> đã trả cho <b>{selectedDebt?.toUser?.full_name}</b> đúng không?
          </Typography>
          <Typography variant="h4" fontWeight={700} color="#22c55e">
            {selectedDebt?.amount?.toLocaleString('vi-VN')} đ
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 2, gap: 1 }}>
          <Button
            onClick={() => setSelectedDebt(null)}
            color="inherit"
            disabled={isSettling}
            sx={{ borderRadius: 2, fontWeight: 600, textTransform: 'none' }}
          >
            Hủy
          </Button>
          <Button
            variant="contained"
            onClick={handleConfirmSettle}
            disabled={isSettling}
            sx={{ bgcolor: '#22c55e', color: 'white', borderRadius: 2, fontWeight: 700, textTransform: 'none', '&:hover': { bgcolor: '#16a34a' } }}
          >
            {isSettling ? <CircularProgress size={24} color="inherit" /> : 'Chốt luôn'}
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
}