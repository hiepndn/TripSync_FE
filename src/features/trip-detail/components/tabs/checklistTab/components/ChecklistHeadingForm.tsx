import React, { useState } from 'react';
import { Box, TextField, Button, Dialog, DialogTitle, DialogContent, DialogActions, Alert } from '@mui/material';
import BackpackIcon from '@mui/icons-material/Backpack';
import { useAppDispatch } from '@/app/store';
import { createChecklistAction } from '../../../../redux/action';

interface Props {
  groupId: string | number;
  open: boolean;
  onClose: () => void;
}

export default function ChecklistHeadingForm({ groupId, open, onClose }: Props) {
  const dispatch = useAppDispatch();
  const [headingName, setHeadingName] = useState('');
  const [error, setError] = useState('');

  const handleCreate = () => {
    if (!headingName.trim()) {
      setError('Vui lòng nhập tên đề mục!');
      return;
    }
    setError('');
    
    // 🌟 BE cần sửa API để hỗ trợ tạo Category rỗng hoặc tạo một Item nháp.
    // Conceptually, tui sẽ tạo một Item nháp để Backend sinh ra Category này.
    const payload = { title: "Công việc nháp", category: headingName };

    dispatch(createChecklistAction(groupId, payload) as any);
    setHeadingName('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" sx={{ '& .MuiDialog-paper': { borderRadius: 4 } }}>
      <DialogTitle>Tạo đề mục công việc mới</DialogTitle>
      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}
        <Box sx={{ mt: 1 }}>
          <TextField
            fullWidth
            label="Tên đề mục (VD: Đồ công nghệ, Thuốc men...)"
            value={headingName}
            onChange={(e) => setHeadingName(e.target.value)}
            variant="outlined"
            InputProps={{ startAdornment: <BackpackIcon sx={{ color: '#94a3b8', mr: 1 }} /> }}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 3 }}>
        <Button onClick={onClose} sx={{ color: '#64748b', fontWeight: 600 }}>Hủy</Button>
        <Button onClick={handleCreate} variant="contained" sx={{ bgcolor: '#22c55e', color: '#fff', borderRadius: 2, fontWeight: 700, px: 3, '&:hover': { bgcolor: '#16a34a' } }}>Tạo đề mục</Button>
      </DialogActions>
    </Dialog>
  );
}