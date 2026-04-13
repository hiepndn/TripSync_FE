import React, { useEffect, useMemo, useState } from 'react';
import { Grid, Stack } from '@mui/material';
import { useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
dayjs.extend(utc);

import { useAppSelector } from '@/app/store';
import { fetchActivitiesAction } from '@/features/trip-detail/redux/action';
import { Activity } from '@/models/activity';

import DaySelector from './daySelector';
import Timeline from './timeline/timelineItem';
import MapWidget from './widgets/mapWidget';
import PendingVoteWidget from './widgets/pendingVoteWidget';

export default function ItineraryTab() {
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch();

  const { activities, activitiesLoading, groupDetail } = useAppSelector((state: any) => state.tripDetail);

  // Ngày đang được chọn (mặc định là ngày đầu tiên của trip)
  const [selectedDate, setSelectedDate] = useState<string>('');

  // Fetch activities khi mount
  useEffect(() => {
    if (id) dispatch(fetchActivitiesAction(id) as any);
  }, [id, dispatch]);

  // Sinh danh sách ngày từ start_date → end_date của group
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

  // Set ngày mặc định khi có tripDays
  useEffect(() => {
    if (tripDays.length > 0 && !selectedDate) {
      setSelectedDate(tripDays[0]);
    }
  }, [tripDays]);

  // Lọc activities theo ngày đang chọn (so sánh ngày của start_time)
  const filteredActivities: Activity[] = useMemo(() => {
    if (!selectedDate) return activities;
    return activities.filter((act: Activity) =>
      dayjs.utc(act.start_time).format('YYYY-MM-DD') === selectedDate
    );
  }, [activities, selectedDate]);

  // Lấy activities PENDING để hiện widget
  const pendingActivities: Activity[] = useMemo(
    () => activities.filter((act: Activity) => act.status === 'PENDING'),
    [activities]
  );

  return (
    <Grid container spacing={3}>

      {/* CỘT TRÁI (8/12): Timeline & Chọn ngày */}
      <Grid size={{ xs: 12, md: 8 }}>
        <Stack spacing={3}>
          <DaySelector
            days={tripDays}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
          />
          <Timeline
            activities={filteredActivities}
            loading={activitiesLoading}
            groupId={id || ''}
            currentDate={selectedDate}
          />
        </Stack>
      </Grid>

      {/* CỘT PHẢI (4/12): Map & Các block khác */}
      <Grid size={{ xs: 12, md: 4 }}>
        <Stack spacing={3}>
          <MapWidget activities={filteredActivities} />
          <PendingVoteWidget pendingActivities={pendingActivities} />
        </Stack>
      </Grid>

    </Grid>
  );
}
