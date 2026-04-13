import React from 'react';
import { useDispatch } from 'react-redux';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  CircularProgress,
  Typography,
  IconButton,
  MenuItem, // 🌟 Nhớ import thêm MenuItem cho Select
} from '@mui/material';
import { FlightTakeoff, Close } from '@mui/icons-material';
import { useFormik } from 'formik';
import { useSnackbar } from 'notistack';
import { useAppSelector } from '../../../../app/store';
import { createGroupAction } from '../../redux/action';

import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const AddGroupDialog: React.FC<Props> = ({ open, onClose, onSuccess }) => {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { loading } = useAppSelector((state) => state.groups);

  const formik = useFormik({
    initialValues: {
      name: '',
      description: '',
      start_date: '',
      end_date: '',
      // 🌟 5 TRƯỜNG DỮ LIỆU MỚI CHO AI
      departure_location: '',
      route_destinations: '',
      accommodation_pref: 'HOTEL',
      expected_members: 2,
      budget_per_person: 1000000,
      currency: 'VND'
    },
    validate: (values) => {
      const errors: any = {};
      if (!values.name) errors.name = 'Vui lòng nhập tên chuyến đi!';
      if (!values.start_date) errors.start_date = 'Vui lòng chọn ngày đi!';
      if (!values.end_date) errors.end_date = 'Vui lòng chọn ngày về!';
      else if (values.start_date && new Date(values.end_date) < new Date(values.start_date)) {
        errors.end_date = 'Ngày về không được trước ngày đi!';
      }
      if (!values.departure_location) errors.departure_location = 'Vui lòng nhập điểm xuất phát!';
      if (!values.route_destinations) errors.route_destinations = 'Vui lòng nhập điểm đến!';
      if (values.expected_members < 1) errors.expected_members = 'Số người phải lớn hơn 0!';
      if (values.budget_per_person < 0) errors.budget_per_person = 'Ngân sách không hợp lệ!';
      return errors;
    },
    onSubmit: (values, { resetForm }) => {
      const payloadToSend = {
        ...values,
        start_date: values.start_date ? `${values.start_date}T00:00:00+07:00` : '',
        end_date: values.end_date ? `${values.end_date}T23:59:59+07:00` : '',
      };
      dispatch(
        createGroupAction(
          payloadToSend,
          () => {
            enqueueSnackbar('Tạo chuyến đi thành công!', {
              variant: 'success',
              autoHideDuration: 3000,
            });
            resetForm();
            onClose();
            onSuccess();
          },
          (result: any) => {
            const errMsg = typeof result.response === 'string' ? result.response : 'Có lỗi xảy ra, vui lòng thử lại!';
            console.log('Lỗi khi tạo chuyến đi:', result);
            enqueueSnackbar(errMsg || 'Có lỗi xảy ra, vui lòng thử lại!', { variant: 'error' });
          }
        ) as any
      );
    },
  });

  const inputStyle = {
    '& .MuiOutlinedInput-root': {
      borderRadius: '12px',
      '&.Mui-focused fieldset': {
        borderColor: '#19e66b',
      },
    },
    '& .MuiInputLabel-root.Mui-focused': {
      color: '#0f766e',
    },
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '20px',
            boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
            backgroundImage: 'none',
          },
        }}
      >
        <form onSubmit={formik.handleSubmit}>
          {/* HEADER */}
          <DialogTitle
            sx={{ m: 0, p: 3, pb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{ bgcolor: '#dcfce7', p: 1, borderRadius: '12px', display: 'flex' }}>
                <FlightTakeoff sx={{ color: '#16a34a' }} />
              </Box>
              <Typography variant="h5" sx={{ color: '#111814' }}>
                Tạo chuyến đi mới
              </Typography>
            </Box>
            <IconButton onClick={onClose} sx={{ color: '#94a3b8', '&:hover': { bgcolor: '#f1f5f9' } }}>
              <Close />
            </IconButton>
          </DialogTitle>

          {/* BODY */}
          <DialogContent sx={{ px: 3, pb: 2 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mt: 1 }}>
              <TextField
                label="Tên chuyến đi"
                placeholder="VD: Vi vu Đà Lạt 2024..."
                name="name"
                value={formik.values.name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.name && Boolean(formik.errors.name)}
                helperText={formik.touched.name && (formik.errors.name as string)}
                fullWidth
                sx={inputStyle}
              />

              {/* 🌟 THÊM: ĐIỂM XUẤT PHÁT */}
              <TextField
                label="Điểm xuất phát"
                placeholder="VD: Hà Nội"
                name="departure_location"
                value={formik.values.departure_location}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.departure_location && Boolean(formik.errors.departure_location)}
                helperText={
                  (formik.touched.departure_location && formik.errors.departure_location) ||
                  "🚀 Bạn đang xuất phát từ đâu? VD: Hà Nội"
                }
                fullWidth
                sx={inputStyle}
              />

              {/* 🌟 THÊM: HÀNH TRÌNH */}
              <TextField
                label="Hành trình (Các điểm đến)"
                placeholder="VD: Sóc Sơn, Hà Nội; Huế; Đà Nẵng"
                name="route_destinations"
                value={formik.values.route_destinations}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.route_destinations && Boolean(formik.errors.route_destinations)}
                helperText={
                  (formik.touched.route_destinations && formik.errors.route_destinations) || 
                  "🌟 Nhập định dạng 'Huyện, Tỉnh' để AI gợi ý khách sạn chuẩn nhất"
                }
                fullWidth
                sx={inputStyle}
              />

              {/* NGÀY ĐI - NGÀY VỀ */}
              <Box sx={{ display: 'flex', gap: 2 }}>
                <DatePicker
                  label="Ngày đi"
                  format="DD/MM/YYYY"
                  value={formik.values.start_date ? dayjs(formik.values.start_date) : null}
                  onChange={(newValue) => {
                    // 🌟 SỬA FORMAT Ở ĐÂY: Thêm T00:00:00Z
                    formik.setFieldValue(
                      'start_date', 
                      newValue ? newValue.format('YYYY-MM-DD') : ''
                    );
                  }}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      onBlur: formik.handleBlur,
                      name: 'start_date',
                      error: formik.touched.start_date && Boolean(formik.errors.start_date),
                      helperText: formik.touched.start_date && (formik.errors.start_date as string),
                      sx: inputStyle,
                    },
                  }}
                />

                <DatePicker
                  label="Ngày về"
                  format="DD/MM/YYYY"
                  value={formik.values.end_date ? dayjs(formik.values.end_date) : null}
                  onChange={(newValue) => {
                    // 🌟 SỬA FORMAT Ở ĐÂY: Thêm T23:59:59Z (cuối ngày)
                    formik.setFieldValue(
                      'end_date', 
                      newValue ? newValue.format('YYYY-MM-DD') : ''
                    );
                  }}
                  minDate={formik.values.start_date ? dayjs(formik.values.start_date) : undefined}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      onBlur: formik.handleBlur,
                      name: 'end_date',
                      error: formik.touched.end_date && Boolean(formik.errors.end_date),
                      helperText: formik.touched.end_date && (formik.errors.end_date as string),
                      sx: inputStyle,
                    },
                  }}
                />
              </Box>

              {/* 🌟 THÊM: SỐ NGƯỜI & GU LƯU TRÚ */}
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  label="Số người dự kiến"
                  type="number"
                  name="expected_members"
                  value={formik.values.expected_members}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.expected_members && Boolean(formik.errors.expected_members)}
                  helperText={formik.touched.expected_members && (formik.errors.expected_members as string)}
                  fullWidth
                  sx={inputStyle}
                />
                <TextField
                  select
                  label="Gu lưu trú"
                  name="accommodation_pref"
                  value={formik.values.accommodation_pref}
                  onChange={formik.handleChange}
                  fullWidth
                  sx={inputStyle}
                >
                  <MenuItem value="HOTEL">Khách sạn (Agoda)</MenuItem>
                  <MenuItem value="CAMPING">Cắm trại</MenuItem>
                  <MenuItem value="MIXED">Linh hoạt</MenuItem>
                </TextField>
              </Box>

              {/* 🌟 THÊM: NGÂN SÁCH & TIỀN TỆ */}
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  label="Ngân sách/Người"
                  type="number"
                  name="budget_per_person"
                  value={formik.values.budget_per_person}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.budget_per_person && Boolean(formik.errors.budget_per_person)}
                  helperText={formik.touched.budget_per_person && (formik.errors.budget_per_person as string)}
                  fullWidth
                  sx={inputStyle}
                />
                <TextField
                  select
                  label="Tiền tệ"
                  name="currency"
                  value={formik.values.currency}
                  onChange={formik.handleChange}
                  sx={{ ...inputStyle, width: '30%' }}
                >
                  <MenuItem value="VND">VND</MenuItem>
                  <MenuItem value="USD">USD</MenuItem>
                </TextField>
              </Box>

              <TextField
                label="Mô tả chuyến đi (Tuỳ chọn)"
                placeholder="Mục tiêu chuyến đi này là gì? Ăn sập chợ đêm hay săn mây?"
                name="description"
                value={formik.values.description}
                onChange={formik.handleChange}
                fullWidth
                multiline
                rows={2}
                sx={inputStyle}
              />

            </Box>
          </DialogContent>

          {/* FOOTER */}
          <DialogActions sx={{ px: 3, pb: 3, pt: 1, justifyContent: 'flex-end', gap: 1 }}>
            <Button
              onClick={onClose}
              disabled={loading}
              sx={{
                color: '#64748b', fontWeight: 600, textTransform: 'none', borderRadius: '10px', px: 3,
                '&:hover': { bgcolor: '#f1f5f9' },
              }}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              sx={{
                bgcolor: '#19e66b', color: '#111814', fontWeight: 700, textTransform: 'none', borderRadius: '10px', px: 4,
                boxShadow: '0 4px 6px -1px rgba(25, 230, 107, 0.3)',
                '&:hover': { bgcolor: '#15c95c', boxShadow: '0 6px 8px -1px rgba(25, 230, 107, 0.4)' },
              }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Tạo ngay'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </LocalizationProvider>
  );
};

export default AddGroupDialog;