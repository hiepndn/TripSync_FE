import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  Stack,
  Avatar,
  TextField,
  Select,
  MenuItem,
  Checkbox,
  InputAdornment,
  Tabs,
  Tab,
  CircularProgress,
} from '@mui/material';
import { useParams } from 'react-router-dom';

import SaveIcon from '@mui/icons-material/Save';
import CloseIcon from '@mui/icons-material/Close';

import { useAppDispatch } from '@/app/store';
// 🌟 Nhớ import action tạo expense vào nhé
import { createExpenseAction } from '../../../../redux/action';
import { useSnackbar } from 'notistack';

interface Props {
  members: any[];
}

export default function AddExpenseForm({ members }: Props) {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const { enqueueSnackbar } = useSnackbar();

  // --- FORM STATE ---
  const [amount, setAmount] = useState<string>('');
  const [currency, setCurrency] = useState('VND');
  const [description, setDescription] = useState('');
  const [payerId, setPayerId] = useState<number>(members?.[0]?.id || 0); // Mặc định người đầu tiên trả
  const [loading, setLoading] = useState(false);

  // --- SPLIT LOGIC STATE ---
  // 0: Chia đều (EQUAL), 1: Theo % (PERCENTAGES), 2: Số tiền (EXACT)
  const [splitTab, setSplitTab] = useState(0);

  // Lưu danh sách ID những người tham gia chia tiền (Dùng cho Tab Chia đều)
  const [selectedMembers, setSelectedMembers] = useState<number[]>(members?.map((m) => m.id) || []);

  // Lưu giá trị nhập tay (Số tiền hoặc %) của từng người (Dùng cho Tab 1 & 2)
  const [manualValues, setManualValues] = useState<Record<number, string>>({});

  // --- LIVE CALCULATION ---
  const totalAmount = parseFloat(amount) || 0;

  // Tính toán nhẩm số tiền hiển thị trên UI
  const calculatedSplits = useMemo(() => {
    const splits: Record<number, number> = {};

    if (splitTab === 0) {
      // CHIA ĐỀU
      const activeCount = selectedMembers.length;
      const amountPerPerson = activeCount > 0 ? totalAmount / activeCount : 0;
      members?.forEach((m) => {
        splits[m.id] = selectedMembers.includes(m.id) ? amountPerPerson : 0;
      });
    } else if (splitTab === 1) {
      // THEO %
      members?.forEach((m) => {
        const percent = parseFloat(manualValues[m.id]) || 0;
        splits[m.id] = (percent / 100) * totalAmount;
      });
    } else {
      // SỐ TIỀN CHÍNH XÁC
      members?.forEach((m) => {
        splits[m.id] = parseFloat(manualValues[m.id]) || 0;
      });
    }
    return splits;
  }, [splitTab, selectedMembers, manualValues, totalAmount, members]);

  // --- HANDLERS ---
  const handleToggleMember = (memberId: number) => {
    setSelectedMembers((prev) =>
      prev.includes(memberId) ? prev.filter((id) => id !== memberId) : [...prev, memberId]
    );
  };

  const handleManualValueChange = (memberId: number, val: string) => {
    setManualValues((prev) => ({ ...prev, [memberId]: val }));
  };

  const handleSubmit = () => {
    if (totalAmount <= 0 || !description || !payerId) {
      enqueueSnackbar('Vui lòng nhập đủ số tiền, mô tả và người trả!', { variant: 'warning' });
      return;
    }

    // Validate tổng tiền khớp nhau trước khi gửi BE
    const totalSplit = Object.values(calculatedSplits).reduce((sum, val) => sum + val, 0);
    if (Math.abs(totalSplit - totalAmount) > 0.01) {
      enqueueSnackbar(
        `Tổng số tiền chia ra (${totalSplit}) chưa khớp với tổng hóa đơn (${totalAmount})! Vui lòng kiểm tra lại.`,
        { variant: 'warning' }
      );
      return;
    }

    setLoading(true);

    const splitTypeStr = splitTab === 0 ? 'EQUAL' : splitTab === 1 ? 'PERCENTAGES' : 'EXACT';

    // Lọc ra những người thực sự nợ tiền (> 0) để gửi lên BE
    const finalSplits = Object.entries(calculatedSplits)
      .filter(([_, amountOwed]) => amountOwed > 0)
      .map(([userId, amountOwed]) => ({
        user_id: parseInt(userId),
        amount_owed: amountOwed,
      }));

    const payload = {
      amount: totalAmount,
      currency,
      description,
      split_type: splitTypeStr,
      splits: finalSplits,
    };

    dispatch(
      createExpenseAction(
        id || '',
        payload,
        () => {
          setLoading(false);
          // Reset form
          setAmount('');
          setDescription('');
          setManualValues({});
        },
        (err) => {
          setLoading(false);
          enqueueSnackbar(err || 'Có lỗi xảy ra', { variant: 'error' });
        }
      ) as any
    );
  };

  const inputStyle = { bgcolor: '#f8fafc', borderRadius: 3, '& fieldset': { border: 'none' } };

  return (
    <Card
      sx={{
        borderRadius: 4,
        border: 'none',
        boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
        p: 3,
        borderTop: '4px solid #22c55e',
      }}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Stack direction="row" spacing={1} alignItems="center">
          <Box sx={{ p: 0.5, bgcolor: '#dcfce7', borderRadius: 1 }}>
            <SaveIcon sx={{ color: '#22c55e', fontSize: 20 }} />
          </Box>
          <Typography variant="h6" >
            Thêm khoản chi mới
          </Typography>
        </Stack>
      </Stack>

      <Stack spacing={2.5}>
        {/* SỐ TIỀN & TIỀN TỆ */}
        <Stack direction="row" spacing={2}>
          <TextField
            fullWidth
            placeholder="0.00"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            InputProps={{
              sx: { fontSize: '1.25rem', fontWeight: 700, ...inputStyle },
            }}
          />
          <Select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            sx={{ minWidth: 100, fontWeight: 700, ...inputStyle }}
          >
            <MenuItem value="VND">VND</MenuItem>
            <MenuItem value="USD">USD</MenuItem>
          </Select>
        </Stack>

        {/* MÔ TẢ */}
        <TextField
          fullWidth
          placeholder="Mô tả khoản chi (VD: Ăn sáng, Vé xe...)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          InputProps={{
            sx: {
              bgcolor: '#f8fafc',
              borderRadius: 3,
              '& fieldset': { border: '1px solid #f1f5f9' },
            },
          }}
        />

        {/* NGƯỜI TRẢ TIỀN */}
        <Stack direction="row" alignItems="center" spacing={1}>
          <Typography variant="body2" color="text.secondary" fontWeight={600}>
            Người trả tiền:
          </Typography>
          <Select
            value={payerId}
            onChange={(e) => setPayerId(Number(e.target.value))}
            variant="standard"
            disableUnderline
            sx={{
              bgcolor: '#dcfce7',
              color: '#16a34a',
              fontWeight: 700,
              borderRadius: 2,
              px: 1,
              py: 0.5,
              '& .MuiSelect-select': { py: 0 },
            }}
          >
            {members?.map((m) => (
              <MenuItem key={m.id} value={m.id}>
                {m.full_name}
              </MenuItem>
            ))}
          </Select>
        </Stack>

        {/* LOGIC CHIA TIỀN */}
        <Box>
          <Typography
            variant="caption"
            color="text.secondary"
            fontWeight={700}
            sx={{ textTransform: 'uppercase', mb: 1, display: 'block' }}
          >
            Chia tiền cho ai?
          </Typography>
          <Tabs
            value={splitTab}
            onChange={(e, v) => setSplitTab(v)}
            variant="fullWidth"
            sx={{
              minHeight: 36,
              bgcolor: '#f8fafc',
              borderRadius: 2,
              p: 0.5,
              '& .MuiTab-root': {
                minHeight: 32,
                borderRadius: 1.5,
                fontWeight: 600,
                textTransform: 'none',
                color: '#64748b',
              },
              '& .Mui-selected': {
                bgcolor: 'white',
                color: '#10b981 !important',
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
              },
              '& .MuiTabs-indicator': { display: 'none' },
            }}
          >
            <Tab label="Chia đều" />
            <Tab label="Theo %" />
            <Tab label="Số tiền" />
          </Tabs>

          <Stack mt={2} spacing={1}>
            {members?.map((m: any) => (
              <Stack
                key={m.id}
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                sx={{ py: 0.5 }}
              >
                <Stack direction="row" alignItems="center" spacing={1}>
                  {splitTab === 0 && (
                    <Checkbox
                      checked={selectedMembers.includes(m.id)}
                      onChange={() => handleToggleMember(m.id)}
                      sx={{ color: '#22c55e', '&.Mui-checked': { color: '#22c55e' } }}
                    />
                  )}
                  <Avatar src={m.avatar} sx={{ width: 32, height: 32 }} />
                  <Typography variant="body2" fontWeight={600}>
                    {m.full_name}
                  </Typography>
                </Stack>

                {/* Ô NHẬP LIỆU BÊN PHẢI DỰA THEO TAB */}
                {splitTab === 0 ? (
                  <Typography variant="body2" color="text.secondary" fontWeight={600}>
                    {calculatedSplits[m.id] > 0
                      ? calculatedSplits[m.id].toLocaleString('vi-VN')
                      : '0'}{' '}
                    đ
                  </Typography>
                ) : (
                  <TextField
                    size="small"
                    placeholder={splitTab === 1 ? '0%' : '0 đ'}
                    value={manualValues[m.id] || ''}
                    onChange={(e) => handleManualValueChange(m.id, e.target.value)}
                    sx={{ width: 100, ...inputStyle }}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">{splitTab === 1 ? '%' : 'đ'}</InputAdornment>
                      ),
                    }}
                  />
                )}
              </Stack>
            ))}
          </Stack>
        </Box>

        <Button
          variant="contained"
          fullWidth
          onClick={handleSubmit}
          disabled={loading}
          sx={{
            bgcolor: '#22c55e',
            color: 'white',
            py: 1.5,
            borderRadius: 3,
            fontWeight: 700,
            fontSize: '1rem',
            textTransform: 'none',
            '&:hover': { bgcolor: '#16a34a' },
          }}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : 'Lưu khoản chi'}
        </Button>
      </Stack>
    </Card>
  );
}
