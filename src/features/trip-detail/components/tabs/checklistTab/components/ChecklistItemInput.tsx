import React, { useState } from 'react';
import { Box, TextField, InputAdornment } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useAppDispatch } from '@/app/store';
import { createChecklistAction } from '../../../../redux/action';

interface Props {
  groupId: string | number;
  categoryName: string;
}

export default function ChecklistItemInput({ groupId, categoryName }: Props) {
  const dispatch = useAppDispatch();
  const [title, setTitle] = useState('');

  const handleAdd = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && title.trim()) {
      // 🌟 Gọi Action tạo item mới gắn vào Category này
      dispatch(createChecklistAction(groupId, { title, category: categoryName }) as any);
      setTitle('');
    }
  };

  return (
    <Box p={2}>
      <TextField 
        fullWidth 
        placeholder={` + Thêm đồ dùng mới vào "${categoryName}"...`} 
        variant="standard" 
        value={title} 
        onChange={(e) => setTitle(e.target.value)} 
        onKeyDown={handleAdd}
        InputProps={{ 
          disableUnderline: true, 
          sx: { fontSize: '0.9rem', color: '#64748b' } 
        }}
      />
    </Box>
  );
}