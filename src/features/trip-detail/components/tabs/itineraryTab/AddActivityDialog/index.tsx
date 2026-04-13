import React, { useState } from 'react';
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
  MenuItem,
  Stack,
} from '@mui/material';
import { Close, Map, EditLocationAlt } from '@mui/icons-material';
import { useFormik } from 'formik';
import { useSnackbar } from 'notistack';

import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import dayjs, { Dayjs } from 'dayjs';

import { Activity } from '@/models/activity';
// 🌟 Import cả 2 action Add và Update
import { addActivityAction, updateActivityAction } from '@/features/trip-detail/redux/action';

// 🌟 Định nghĩa Props siêu chặt chẽ
interface Props {
  open: boolean;
  onClose: () => void;
  groupId: string | number;
  mode: 'add' | 'edit'; // Bắt buộc truyền mode
  selectedDate?: string | Date | Dayjs; // Dùng cho chế độ 'add'
  activity?: Activity; // Dùng cho chế độ 'edit'
}

const ActivityDialog: React.FC<Props> = ({
  open,
  onClose,
  groupId,
  mode,
  selectedDate,
  activity,
}) => {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);

  const isEdit = mode === 'edit';

  // 🌟 Xác định ngày gốc dựa vào mode
  const baseDate = isEdit && activity ? dayjs(activity.start_time) : dayjs(selectedDate);

  const formik = useFormik({
    enableReinitialize: true,
    // 🌟 Gắn logic ternary (isEdit ? A : B) cho initialValues
    initialValues: {
      name: isEdit ? activity?.name : '',
      type: isEdit ? activity?.type : 'ATTRACTION',
      location: isEdit ? activity?.location : '',
      description: isEdit ? activity?.description : '',
      start_time: isEdit ? dayjs(activity?.start_time) : baseDate.hour(8).minute(0).second(0),
      end_time: isEdit ? dayjs(activity?.end_time) : baseDate.hour(10).minute(0).second(0),
    },
    validate: (values) => {
      const errors: any = {};
      if (!values.name) errors.name = 'Vui lòng nhập tên hoạt động!';
      if (!values.location) errors.location = 'Vui lòng nhập địa điểm!';
      if (values.start_time && values.end_time && values.end_time.isBefore(values.start_time)) {
        errors.end_time = 'Giờ kết thúc không được trước giờ bắt đầu!';
      }
      return errors;
    },
    onSubmit: (values, { resetForm }) => {
      setLoading(true);

      const payload = {
        name: values.name,
        type: values.type,
        location: values.location,
        description: values.description,
        start_time: values.start_time.format(),
        end_time: values.end_time.format(),
        lat: isEdit ? activity?.lat : 0,
        lng: isEdit ? activity?.lng : 0,
        place_id: isEdit ? activity?.place_id : '',
      };

      const onSuccess = () => {
        enqueueSnackbar(isEdit ? 'Cập nhật thành công!' : 'Thêm hoạt động thành công!', {
          variant: 'success',
        });
        setLoading(false);
        resetForm();
        onClose();
      };

      const onError = (err: any) => {
        setLoading(false);
        enqueueSnackbar(err || 'Có lỗi xảy ra, thử lại sau!', { variant: 'error' });
      };

      // 🌟 Dựa vào mode để gọi đúng Action
      if (isEdit && activity) {
        dispatch(updateActivityAction(groupId, activity.id, payload, onSuccess, onError) as any);
      } else {
        dispatch(addActivityAction(groupId, payload, onSuccess, onError) as any);
      }
    },
  });

  const inputStyle = { '& .MuiOutlinedInput-root': { borderRadius: '12px' } };

  const handleTimeChange = (field: string, newTime: Dayjs | null) => {
    if (newTime) {
      const updatedDateTime = baseDate.hour(newTime.hour()).minute(newTime.minute());
      formik.setFieldValue(field, updatedDateTime);
    }
  };

  // 🌟 Các biến phụ trợ cho UI đổi màu theo mode
  const uiColor = isEdit ? '#0284c7' : '#16a34a';
  const uiBgColor = isEdit ? '#e0f2fe' : '#dcfce7';
  const btnHoverColor = isEdit ? '#0284c7' : '#15c95c';
  const btnBgColor = isEdit ? '#0ea5e9' : '#19e66b';
  const btnTextColor = isEdit ? '#fff' : '#111';

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: '20px' } }}
      >
        <form onSubmit={formik.handleSubmit}>
          <DialogTitle
            sx={{
              m: 0,
              p: 3,
              pb: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{ bgcolor: uiBgColor, p: 1, borderRadius: '12px', display: 'flex' }}>
                {isEdit ? (
                  <EditLocationAlt sx={{ color: uiColor }} />
                ) : (
                  <Map sx={{ color: uiColor }} />
                )}
              </Box>
              <Typography variant="h5" sx={{ color: '#111814' }}>
                {isEdit ? 'Sửa thông tin hoạt động' : 'Đề xuất hoạt động'}
              </Typography>
            </Box>
            <IconButton onClick={onClose}>
              <Close />
            </IconButton>
          </DialogTitle>

          <DialogContent sx={{ px: 3, pb: 2 }}>
            <Stack spacing={2.5} mt={1}>
              <Typography
                variant="body2"
                sx={{
                  color: uiColor,
                  bgcolor: uiBgColor,
                  p: 1.5,
                  borderRadius: 2,
                  fontWeight: 600,
                }}
              >
                📅 {isEdit ? 'Ngày đang sửa:' : 'Thêm lịch trình cho ngày:'}{' '}
                {baseDate.format('DD/MM/YYYY')}
              </Typography>

              {/* ... CÁC TEXTFIELD VÀ TIMEPICKER GIỮ NGUYÊN NHƯ CŨ ... */}
              <TextField
                label="Tên hoạt động"
                name="name"
                value={formik.values.name}
                onChange={formik.handleChange}
                error={Boolean(formik.errors.name)}
                helperText={formik.errors.name as string}
                fullWidth
                sx={inputStyle}
              />
              <Stack direction="row" spacing={2}>
                <TextField
                  select
                  label="Loại hoạt động"
                  name="type"
                  value={formik.values.type}
                  onChange={formik.handleChange}
                  fullWidth
                  sx={inputStyle}
                >
                  <MenuItem value="ATTRACTION">Tham quan / Vui chơi</MenuItem>
                  <MenuItem value="RESTAURANT">Ăn uống</MenuItem>
                  <MenuItem value="HOTEL">Khách sạn / Lưu trú</MenuItem>
                  <MenuItem value="CAMPING">Cắm trại</MenuItem>
                </TextField>
                <TextField
                  label="Địa điểm"
                  name="location"
                  value={formik.values.location}
                  onChange={formik.handleChange}
                  error={Boolean(formik.errors.location)}
                  helperText={formik.errors.location as string}
                  fullWidth
                  sx={inputStyle}
                />
              </Stack>
              <Stack direction="row" spacing={2}>
                <TimePicker
                  label="Giờ bắt đầu"
                  format="HH:mm"
                  value={formik.values.start_time}
                  onChange={(val) => handleTimeChange('start_time', val)}
                  slotProps={{ textField: { fullWidth: true, sx: inputStyle } }}
                />
                <TimePicker
                  label="Giờ kết thúc"
                  format="HH:mm"
                  value={formik.values.end_time}
                  onChange={(val) => handleTimeChange('end_time', val)}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      error: Boolean(formik.errors.end_time),
                      helperText: formik.errors.end_time as string,
                      sx: inputStyle,
                    },
                  }}
                />
              </Stack>
              <TextField
                label="Mô tả chi tiết (Tuỳ chọn)"
                name="description"
                value={formik.values.description}
                onChange={formik.handleChange}
                fullWidth
                multiline
                rows={3}
                sx={inputStyle}
              />
            </Stack>
          </DialogContent>

          <DialogActions sx={{ px: 3, pb: 3, pt: 1, gap: 1 }}>
            <Button
              onClick={onClose}
              disabled={loading}
              sx={{ color: '#64748b', fontWeight: 600, borderRadius: '10px' }}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              sx={{
                bgcolor: btnBgColor,
                color: btnTextColor,
                fontWeight: 700,
                borderRadius: '10px',
                '&:hover': { bgcolor: btnHoverColor },
              }}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : isEdit ? (
                'Lưu thay đổi'
              ) : (
                'Gửi đề xuất'
              )}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </LocalizationProvider>
  );
};

export default ActivityDialog;
