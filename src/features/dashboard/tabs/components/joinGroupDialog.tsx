import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { 
  Dialog, DialogTitle, DialogContent, DialogActions, 
  Button, TextField, Box, CircularProgress, Typography, IconButton
} from '@mui/material';
import { GroupAdd, Close } from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { useAppSelector } from '../../../../app/store';
import { joinGroupAction } from '../../redux/action';

interface Props {
  open: boolean;
  onClose: () => void;
}

const JoinGroupDialog: React.FC<Props> = ({ open, onClose }) => {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { loading } = useAppSelector((state) => state.groups); 

  const [inviteCode, setInviteCode] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteCode.trim()) {
      enqueueSnackbar('Vui lòng nhập mã mời!', { variant: 'warning' });
      return;
    }

    dispatch(joinGroupAction(inviteCode.trim(), 
      () => {
        enqueueSnackbar('Tham gia nhóm thành công!', { variant: 'success' });
        setInviteCode(''); // Xóa trắng ô input
        onClose(); // Đóng Modal
      },
      (errMsg: string) => {
        enqueueSnackbar(errMsg, { variant: 'error' });
      }
    ) as any);
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="xs" 
      fullWidth
      PaperProps={{
        sx: { borderRadius: '20px', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', backgroundImage: 'none' }
      }}
    >
      <form onSubmit={handleSubmit}>
        <DialogTitle sx={{ m: 0, p: 3, pb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ bgcolor: '#eff6ff', p: 1, borderRadius: '12px', display: 'flex' }}>
              <GroupAdd sx={{ color: '#19e66b' }} /> {/* Màu xanh dương cho khác biệt với Tạo Nhóm */}
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#111814' }}>
              Tham gia nhóm
            </Typography>
          </Box>
          <IconButton onClick={onClose} sx={{ color: '#94a3b8', '&:hover': { bgcolor: '#f1f5f9' } }}>
            <Close />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ px: 3, pb: 2 }}>
          <Typography variant="body2" sx={{ color: '#64748b', mb: 3 }}>
            Nhập mã mời gồm 10 ký tự do trưởng nhóm cung cấp để cùng nhau lên kế hoạch nhé!
          </Typography>
          <TextField 
            label="Mã mời (Invite Code)" 
            placeholder="VD: TRIP123456"
            value={inviteCode} 
            onChange={(e) => setInviteCode(e.target.value.toUpperCase())} // Tự động viết hoa cho chuẩn
            fullWidth 
            autoFocus
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '12px',
                '&.Mui-focused fieldset': { borderColor: '#3b82f6' }
              },
              '& .MuiInputLabel-root.Mui-focused': { color: '#1e40af' }
            }}
          />
        </DialogContent>
        
        <DialogActions sx={{ px: 3, pb: 3, pt: 1, justifyContent: 'flex-end', gap: 1 }}>
          <Button onClick={onClose} disabled={loading} sx={{ color: '#64748b', fontWeight: 600, textTransform: 'none', borderRadius: '10px', px: 3 }}>
            Hủy
          </Button>
          <Button 
            type="submit" 
            variant="contained" 
            disabled={loading} 
            sx={{ 
              bgcolor: '#19e66b', color: 'white', fontWeight: 700, textTransform: 'none', borderRadius: '10px', px: 4,
              boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.3)',
              '&:hover': { bgcolor: '#0d9744', boxShadow: '0 6px 8px -1px rgba(59, 130, 246, 0.4)' }
            }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Tham gia'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default JoinGroupDialog;