import React, { useState, useMemo } from 'react';
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
import { Close, Map, EditLocationAlt, WarningAmberRounded } from '@mui/icons-material';
import { useFormik } from 'formik';
import { useSnackbar } from 'notistack';

import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import dayjs, { Dayjs } from 'dayjs';

import { Activity } from '@/models/activity';
import { addActivityAction, updateActivityAction } from '@/features/trip-detail/redux/action';
import SuggestionsPanel, { SuggestionItem } from './SuggestionsPanel';
import LocationAutocomplete from '@/components/LocationAutocomplete';
import { useAppSelector } from '@/app/store';

interface Props {
  open: boolean;
  onClose: () => void;
  groupId: string | number;
  mode: 'add' | 'edit';
  selectedDate?: string | Date | Dayjs;
  activity?: Activity;
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
  const [selectedLatLng, setSelectedLatLng] = useState<{ lat: number; lng: number } | null>(null);
  const [pendingPayload, setPendingPayload] = useState<any>(null);
  const [showBudgetWarning, setShowBudgetWarning] = useState(false);

  const { groupDetail, activities } = useAppSelector((state: any) => state.tripDetail);
  const budgetPerPerson = groupDetail?.budget_per_person ?? 0;
  const expectedMembers = groupDetail?.expected_members ?? 1;
  const totalBudget = budgetPerPerson * expectedMembers;
  const currency = groupDetail?.currency || 'VND';

  // Tính tổng chi phí hiện tại (đã xử lý conflict giống estimatedCostCard)
  const currentTotalEstimated = useMemo(() => {
    const withCost = activities.filter((a: any) => (a.estimatedCost || a.estimated_cost) > 0);
    const groups: Record<string, any[]> = {};
    for (const act of withCost) {
      const key = act.start_time
        ? new Date(act.start_time).toISOString().slice(0, 16)
        : `no-time-${act.id}`;
      if (!groups[key]) groups[key] = [];
      groups[key].push(act);
    }
    let total = 0;
    for (const group of Object.values(groups)) {
      if (group.length === 1) {
        total += group[0].estimatedCost || group[0].estimated_cost || 0;
      } else {
        const approved = group.filter((a: any) => a.status === 'APPROVED' || a.status === 'APPROVE');
        const candidates = approved.length >= 1 ? approved : group;
        const pick = candidates.reduce((max: any, a: any) =>
          (a.estimatedCost || a.estimated_cost) > (max.estimatedCost || max.estimated_cost) ? a : max
        );
        total += pick.estimatedCost || pick.estimated_cost || 0;
      }
    }
    return total;
  }, [activities]);

  const isEdit = mode === 'edit';
  const baseDate = isEdit && activity ? dayjs(activity.start_time) : dayjs(selectedDate);

  // Hàm thực sự dispatch action sau khi đã xác nhận
  const dispatchAction = (payload: any, resetForm: () => void) => {
    setLoading(true);

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

    if (isEdit && activity) {
      dispatch(updateActivityAction(groupId, activity.id, payload, onSuccess, onError) as any);
    } else {
      dispatch(addActivityAction(groupId, payload, onSuccess, onError) as any);
    }
  };

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      name: isEdit ? activity?.name : '',
      type: isEdit ? activity?.type : 'ATTRACTION',
      location: isEdit ? activity?.location : '',
      description: isEdit ? activity?.description : '',
      start_time: isEdit ? dayjs(activity?.start_time) : baseDate.hour(8).minute(0).second(0),
      end_time: isEdit ? dayjs(activity?.end_time) : baseDate.hour(10).minute(0).second(0),
      estimated_cost: isEdit ? (activity?.estimatedCost ?? 0) : 0,
      currency: isEdit ? (activity?.currency || 'VND') : 'VND',
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
    onSubmit: async (values, { resetForm }) => {
      const lat = isEdit ? (activity?.lat ?? 0) : (selectedLatLng?.lat ?? 0);
      const lng = isEdit ? (activity?.lng ?? 0) : (selectedLatLng?.lng ?? 0);

      const payload = {
        name: values.name,
        type: values.type,
        location: values.location,
        description: values.description,
        start_time: values.start_time.format(),
        end_time: values.end_time.format(),
        estimated_cost: Number(values.estimated_cost) || 0,
        currency: values.currency || 'VND',
        lat,
        lng,
        place_id: isEdit ? activity?.place_id : '',
      };

      // Kiểm tra vượt ngân sách tổng nhóm
      const cost = Number(values.estimated_cost) || 0;
      // Edit: trừ chi phí cũ của activity đang sửa ra trước khi cộng mới vào
      const oldCost = isEdit ? (activity?.estimatedCost || 0) : 0;
      const projectedTotal = currentTotalEstimated - oldCost + cost;
      if (totalBudget > 0 && projectedTotal > totalBudget) {
        setPendingPayload({ payload, resetForm });
        setShowBudgetWarning(true);
        return;
      }

      dispatchAction(payload, resetForm);
    },
  });

  const inputStyle = { '& .MuiOutlinedInput-root': { borderRadius: '12px' } };

  const handleTimeChange = (field: string, newTime: Dayjs | null) => {
    if (newTime) {
      const updatedDateTime = baseDate.hour(newTime.hour()).minute(newTime.minute());
      formik.setFieldValue(field, updatedDateTime);
    }
  };

  const uiColor = isEdit ? '#0284c7' : '#16a34a';
  const uiBgColor = isEdit ? '#e0f2fe' : '#dcfce7';
  const btnHoverColor = isEdit ? '#0284c7' : '#15c95c';
  const btnBgColor = isEdit ? '#0ea5e9' : '#19e66b';
  const btnTextColor = isEdit ? '#fff' : '#111';

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      {/* ===== DIALOG CHÍNH ===== */}
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
                  sx={{ ...inputStyle, flex: 2 }}
                >
                  <MenuItem value="ATTRACTION">Tham quan / Vui chơi</MenuItem>
                  <MenuItem value="RESTAURANT">Ăn uống</MenuItem>
                  <MenuItem value="HOTEL">Khách sạn / Lưu trú</MenuItem>
                  <MenuItem value="CAMPING">Cắm trại</MenuItem>
                  <MenuItem value="TRANSPORT">Di chuyển / Phương tiện</MenuItem>
                </TextField>
                <Box sx={{ flex: 2 }}>
                  <LocationAutocomplete
                    label="Địa điểm"
                    value={formik.values.location || ''}
                    onChange={(val) => {
                      formik.setFieldValue('location', val);
                      setSelectedLatLng(null);
                    }}
                    onSelect={(result) => {
                      formik.setFieldValue('location', result.name);
                      setSelectedLatLng({ lat: result.lat, lng: result.lng });
                    }}
                    error={Boolean(formik.errors.location)}
                    helperText={formik.errors.location as string}
                  />
                </Box>
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

              {/* Chi phí ước tính */}
              <Stack direction="row" spacing={2}>
                <TextField
                  label="Chi phí ước tính / người"
                  name="estimated_cost"
                  type="number"
                  value={formik.values.estimated_cost}
                  onChange={formik.handleChange}
                  inputProps={{ min: 0 }}
                  sx={{ ...inputStyle, flex: 3 }}
                  InputProps={{
                    endAdornment: (
                      <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: 'nowrap', pr: 1 }}>
                        {formik.values.currency}
                      </Typography>
                    ),
                  }}
                />
                <TextField
                  select
                  label="Đơn vị"
                  name="currency"
                  value={formik.values.currency}
                  onChange={formik.handleChange}
                  sx={{ ...inputStyle, flex: 1 }}
                >
                  <MenuItem value="VND">VND</MenuItem>
                  <MenuItem value="USD">USD</MenuItem>
                </TextField>
              </Stack>

              {!isEdit && (
                <SuggestionsPanel
                  groupId={groupId}
                  activityType={formik.values.type || ''}
                  location={formik.values.location || ''}
                  onSelect={(s: SuggestionItem) => {
                    formik.setFieldValue('name', s.name);
                    formik.setFieldValue('type', s.type);
                    formik.setFieldValue('location', s.location);
                    formik.setFieldValue('description', s.description || '');
                  }}
                />
              )}
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

      {/* ===== DIALOG CẢNH BÁO VƯỢT NGÂN SÁCH ===== */}
      <Dialog
        open={showBudgetWarning}
        onClose={() => setShowBudgetWarning(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 4, p: 1 } }}
      >
        <DialogTitle sx={{ textAlign: 'center', pt: 3 }}>
          <Stack alignItems="center" spacing={2}>
            <Box
              sx={{
                width: 72,
                height: 72,
                bgcolor: '#fff7ed',
                color: '#f97316',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <WarningAmberRounded sx={{ fontSize: '2.5rem' }} />
            </Box>
            <Typography variant="h6" fontWeight={700} color="#111814">
              Vượt ngân sách dự kiến
            </Typography>
          </Stack>
        </DialogTitle>

        <DialogContent sx={{ textAlign: 'center', px: 3, pb: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Sau khi {isEdit ? 'cập nhật' : 'thêm'} hoạt động này, tổng chi phí ước lượng sẽ là{' '}
            <Box component="span" fontWeight={700} color="#f97316">
              {(() => {
                const cost = Number(formik.values.estimated_cost) || 0;
                const oldCost = isEdit ? (activity?.estimatedCost || 0) : 0;
                return (currentTotalEstimated - oldCost + cost).toLocaleString('vi-VN');
              })()} {formik.values.currency}
            </Box>
            , vượt quá ngân sách nhóm (
            <Box component="span" fontWeight={700}>
              {totalBudget.toLocaleString('vi-VN')} {currency}
            </Box>
            ).
          </Typography>
          <Typography variant="body2" color="text.secondary" mt={1.5}>
            Bạn có muốn tiếp tục không?
          </Typography>
        </DialogContent>

        <DialogActions sx={{ justifyContent: 'center', gap: 1.5, px: 3, pb: 3, pt: 2 }}>
          <Button
            onClick={() => setShowBudgetWarning(false)}
            variant="outlined"
            color="inherit"
            sx={{ borderRadius: 3, fontWeight: 600, textTransform: 'none', flex: 1 }}
          >
            Quay lại sửa
          </Button>
          <Button
            onClick={() => {
              setShowBudgetWarning(false);
              if (pendingPayload) {
                dispatchAction(pendingPayload.payload, pendingPayload.resetForm);
                setPendingPayload(null);
              }
            }}
            variant="contained"
            sx={{
              borderRadius: 3,
              fontWeight: 700,
              textTransform: 'none',
              flex: 1,
              bgcolor: '#f97316',
              '&:hover': { bgcolor: '#ea6c0a' },
            }}
          >
            Tiếp tục
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
};

export default ActivityDialog;
