import React, { useState } from 'react';
import { Box, Rating, Typography } from '@mui/material';
import { useAppDispatch } from '@/app/store';
import { rateActivityAction } from '@/features/trip-detail/redux/action';
import { useSnackbar } from 'notistack';

interface StarRatingWidgetProps {
  groupId: number;
  activityId: number;
  myRating: number;
  averageUserRating: number;
}

const StarRatingWidget: React.FC<StarRatingWidgetProps> = ({
  groupId,
  activityId,
  myRating,
  averageUserRating,
}) => {
  const dispatch = useAppDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);
  const [localRating, setLocalRating] = useState<number>(myRating);

  const handleChange = (_: React.SyntheticEvent, value: number | null) => {
    if (value === null || loading) return;
    const prev = localRating;
    setLocalRating(value);
    setLoading(true);
    dispatch(
      rateActivityAction(
        groupId,
        activityId,
        value,
        () => {
          setLoading(false);
        },
        (err) => {
          setLocalRating(prev);
          setLoading(false);
          enqueueSnackbar(err || 'Lỗi khi đánh giá', { variant: 'error' });
        },
      ) as any,
    );
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
      <Rating
        value={localRating}
        precision={1}
        size="small"
        onChange={handleChange}
        disabled={loading}
      />
      {averageUserRating > 0 && (
        <Typography variant="caption" color="text.secondary">
          {averageUserRating.toFixed(1)} ★ (avg)
        </Typography>
      )}
    </Box>
  );
};

export default StarRatingWidget;
