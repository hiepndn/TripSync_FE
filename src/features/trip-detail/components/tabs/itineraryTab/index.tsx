import React, { useEffect, useMemo, useState } from 'react';
import {
  Box, Grid, Stack, Button, Dialog, DialogTitle, DialogContent,
  DialogActions, Typography, CircularProgress,
} from '@mui/material';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import { useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
dayjs.extend(utc);

import { useAppSelector } from '@/app/store';
import { fetchActivitiesAction, deleteAllActivitiesAction } from '@/features/trip-detail/redux/action';
import { Activity } from '@/models/activity';

import DaySelector from './daySelector';
import TripTimeline from './timeline/timelineItem';
import MapWidget from './widgets/mapWidget';
import PendingVoteWidget from './widgets/pendingVoteWidget';
import ActivityDialog from './AddActivityDialog';
import { useSnackbar } from 'notistack';

export default function ItineraryTab() {
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();

  const { activities, activitiesLoading, groupDetail, myRole } = useAppSelector((state: any) => state.tripDetail);
  const isOwner = myRole === 'ADMIN';

  const [selectedDate, setSelectedDate] = useState<string>('');
  const [openAddModal, setOpenAddModal] = useState(false);
  const [openDeleteAllDialog, setOpenDeleteAllDialog] = useState(false);
  const [deletingAll, setDeletingAll] = useState(false);

  useEffect(() => {
    if (id) dispatch(fetchActivitiesAction(id) as any);
  }, [id, dispatch]);

  const tripDays = useMemo(() => {
    if (!groupDetail?.start_date || !groupDetail?.end_date) return [];
    const days: string[] = [];
    let cur = dayjs(groupDetail.start_date);
    const end = dayjs(groupDetail.end_date);
    while (cur.isBefore(end, 'day') || cur.isSame(end, 'day')) {
      days.push(cur.format('YYYY-MM-DD'));
      cur = cur.add(1, 'day');
    }
    return days;
  }, [groupDetail]);

  useEffect(() => {
    if (tripDays.length > 0 && !selectedDate) {
      setSelectedDate(tripDays[0]);
    }
  }, [tripDays]);

  const filteredActivities: Activity[] = useMemo(() => {
    if (!selectedDate) return activities;
    return activities.filter((act: Activity) =>
      dayjs(act.start_time).format('YYYY-MM-DD') === selectedDate
    );
  }, [activities, selectedDate]);

  const pendingActivities: Activity[] = useMemo(
    () => activities.filter((act: Activity) => act.status === 'PENDING'),
    [activities]
  );

  const handleDeleteAll = () => {
    setDeletingAll(true);
    dispatch(deleteAllActivitiesAction(
      id!,
      () => {
        setDeletingAll(false);
        setOpenDeleteAllDialog(false);
        enqueueSnackbar('Đã xóa toàn bộ lịch trình', { variant: 'success' });
      },
      (err) => {
        setDeletingAll(false);
        enqueueSnackbar(err, { variant: 'error' });
      }
    ) as any);
  };

  return (
    <Grid container spacing={3}>
      {/* CỘT TRÁI (8/12) */}
      <Grid size={{ xs: 12, md: 8 }}>
        <Stack spacing={2}>
          {/* Day selector + action buttons */}
          <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
            <Box flex={1} overflow="hidden">
              <DaySelector
                days={tripDays}
                selectedDate={selectedDate}
                onSelectDate={setSelectedDate}
              />
            </Box>
            <Stack direction="row" spacing={1} flexShrink={0}>
              <Button
                variant="outlined"
                size="small"
                onClick={() => setOpenAddModal(true)}
                sx={{
                  color: '#16a34a',
                  borderColor: '#16a34a',
                  borderStyle: 'dashed',
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                }}
              >
                + Đề xuất
              </Button>
              {isOwner && (
                <Button
                  variant="outlined"
                  size="small"
                  color="error"
                  startIcon={<DeleteSweepIcon />}
                  onClick={() => setOpenDeleteAllDialog(true)}
                  sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600, whiteSpace: 'nowrap' }}
                >
                  Xóa tất cả
                </Button>
              )}
            </Stack>
          </Stack>

          {/* Timeline scrollable */}
          <Box sx={{ maxHeight: '65vh', overflowY: 'auto', pr: 1 }}>
            <TripTimeline
              activities={filteredActivities}
              loading={activitiesLoading}
              groupId={id || ''}
              currentDate={selectedDate}
              hideAddButton
            />
          </Box>
        </Stack>
      </Grid>

      {/* CỘT PHẢI (4/12) */}
      <Grid size={{ xs: 12, md: 4 }}>
        <Stack spacing={3}>
          <MapWidget activities={filteredActivities} />
          <PendingVoteWidget pendingActivities={pendingActivities} />
        </Stack>
      </Grid>

      {/* Dialog add */}
      {openAddModal && (
        <ActivityDialog
          mode="add"
          open={openAddModal}
          onClose={() => setOpenAddModal(false)}
          groupId={id || ''}
          selectedDate={selectedDate}
        />
      )}

      {/* Dialog xóa tất cả */}
      <Dialog
        open={openDeleteAllDialog}
        onClose={() => !deletingAll && setOpenDeleteAllDialog(false)}
        PaperProps={{ sx: { borderRadius: 4, p: 1, minWidth: 340 } }}
      >
        <DialogTitle sx={{ fontWeight: 700, color: '#ef4444' }}>Xóa toàn bộ lịch trình?</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            Tất cả hoạt động trong chuyến đi này sẽ bị xóa vĩnh viễn. Hành động này không thể hoàn tác.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button
            onClick={() => setOpenDeleteAllDialog(false)}
            disabled={deletingAll}
            variant="outlined"
            sx={{ textTransform: 'none', borderRadius: 2 }}
          >
            Hủy
          </Button>
          <Button
            onClick={handleDeleteAll}
            disabled={deletingAll}
            variant="contained"
            color="error"
            sx={{ textTransform: 'none', borderRadius: 2, minWidth: 100 }}
          >
            {deletingAll ? <CircularProgress size={18} color="inherit" /> : 'Xóa tất cả'}
          </Button>
        </DialogActions>
      </Dialog>
    </Grid>
  );
}
