import React, { useState, useEffect } from 'react';
import {
  Card, CardContent, Box, Typography, Grid, TextField,
  Button, CircularProgress, Stack,
} from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import { useAppSelector, useAppDispatch } from '@/app/store';
import { updateGroupAction } from '@/features/trip-detail/redux/action';
import { useSnackbar } from 'notistack';
import { useParams } from 'react-router-dom';
import dayjs from 'dayjs';

export default function GroupInfoCard() {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { groupDetail, myRole } = useAppSelector((state: any) => state.tripDetail);
  const isAdmin = myRole === 'ADMIN';

  const [formData, setFormData] = useState({
    name: '',
    route_destinations: '',
    departure_location: '',
    start_date: '',
    end_date: '',
    description: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (groupDetail) {
      setFormData({
        name: groupDetail.name ?? '',
        route_destinations: groupDetail.route_destinations ?? '',
        departure_location: groupDetail.departure_location ?? '',
        start_date: groupDetail.start_date ? dayjs(groupDetail.start_date).format('YYYY-MM-DD') : '',
        end_date: groupDetail.end_date ? dayjs(groupDetail.end_date).format('YYYY-MM-DD') : '',
        description: groupDetail.description ?? '',
      });
    }
  }, [groupDetail]);

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleCancel = () => {
    if (!groupDetail) return;
    setFormData({
      name: groupDetail.name ?? '',
      route_destinations: groupDetail.route_destinations ?? '',
      departure_location: groupDetail.departure_location ?? '',
      start_date: groupDetail.start_date ? dayjs(groupDetail.start_date).format('YYYY-MM-DD') : '',
      end_date: groupDetail.end_date ? dayjs(groupDetail.end_date).format('YYYY-MM-DD') : '',
      description: groupDetail.description ?? '',
    });
  };

  const handleSave = () => {
    setSaving(true);
    const payload = {
      name: formData.name,
      description: formData.description,
      start_date: formData.start_date ? new Date(formData.start_date).toISOString() : undefined,
      end_date: formData.end_date ? new Date(formData.end_date).toISOString() : undefined,
      departure_location: formData.departure_location,
      route_destinations: formData.route_destinations,
    };
    dispatch(
      updateGroupAction(
        id!,
        payload,
        () => {
          setSaving(false);
          enqueueSnackbar('Cập nhật thành công!', { variant: 'success' });
        },
        (err) => {
          setSaving(false);
          enqueueSnackbar(err, { variant: 'error' });
        },
      ) as any,
    );
  };

  if (!groupDetail) return null;

  return (
    <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid #e5e7eb' }}>
      <CardContent sx={{ p: 3 }}>
        {/* Header */}
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={3}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <SettingsIcon sx={{ color: '#6b7280' }} />
            <Box>
              <Typography fontWeight={700} fontSize="1.1rem">Thông tin chung</Typography>
              <Typography variant="caption" color="text.secondary">Thông tin cơ bản của chuyến đi</Typography>
            </Box>
          </Stack>
          {isAdmin && (
            <Stack direction="row" spacing={1}>
              <Button
                variant="outlined"
                size="small"
                onClick={handleCancel}
                disabled={saving}
                color="error"
                sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 600 }}
              >
                Hủy thay đổi
              </Button>
              <Button
                variant="contained"
                size="small"
                onClick={handleSave}
                disabled={saving}
                sx={{
                  textTransform: 'none',
                  borderRadius: 2,
                  fontWeight: 600,
                  bgcolor: '#19e66b',
                  color: '#111',
                  '&:hover': { bgcolor: '#15c95e' },
                  minWidth: 110,
                }}
              >
                {saving ? <CircularProgress size={18} sx={{ color: '#111' }} /> : 'Lưu thay đổi'}
              </Button>
            </Stack>
          )}
        </Stack>

        {/* Form fields */}
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Tên nhóm"
              fullWidth
              size="small"
              value={formData.name}
              onChange={handleChange('name')}
              disabled={!isAdmin}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Điểm đến"
              fullWidth
              size="small"
              value={formData.route_destinations}
              onChange={handleChange('route_destinations')}
              disabled={!isAdmin}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Ngày bắt đầu"
              type="date"
              fullWidth
              size="small"
              value={formData.start_date}
              onChange={handleChange('start_date')}
              disabled={!isAdmin}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Ngày kết thúc"
              type="date"
              fullWidth
              size="small"
              value={formData.end_date}
              onChange={handleChange('end_date')}
              disabled={!isAdmin}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <TextField
              label="Điểm xuất phát"
              fullWidth
              size="small"
              value={formData.departure_location}
              onChange={handleChange('departure_location')}
              disabled={!isAdmin}
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <TextField
              label="Mô tả"
              fullWidth
              multiline
              minRows={3}
              size="small"
              value={formData.description}
              onChange={handleChange('description')}
              disabled={!isAdmin}
            />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}
