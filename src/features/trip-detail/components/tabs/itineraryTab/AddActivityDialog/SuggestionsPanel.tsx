import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Skeleton,
  Card,
  CardActionArea,
  CardContent,
  Rating,
  Stack,
} from '@mui/material';
import { useAppDispatch } from '@/app/store';
import { fetchSuggestionsAction } from '@/features/trip-detail/redux/action';

export interface SuggestionItem {
  id: number;
  name: string;
  type: string;
  location: string;
  description: string;
  average_user_rating: number;
  estimated_cost?: number;
  currency?: string;
  image_url?: string;
  external_link?: string;
}

interface SuggestionsPanelProps {
  groupId: number | string;
  activityType: string;
  location: string;
  onSelect: (suggestion: SuggestionItem) => void;
}

const SuggestionsPanel: React.FC<SuggestionsPanelProps> = ({
  groupId,
  activityType,
  location,
  onSelect,
}) => {
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<SuggestionItem[]>([]);

  useEffect(() => {
    if (!activityType || !location) {
      setSuggestions([]);
      return;
    }

    let cancelled = false;

    const timer = setTimeout(() => {
      setLoading(true);
      dispatch(fetchSuggestionsAction(groupId, activityType, location) as any).then(
        (data: SuggestionItem[]) => {
          if (!cancelled) {
            setSuggestions(Array.isArray(data) ? data : []);
            setLoading(false);
          }
        },
      );
    }, 600);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [activityType, location, groupId]);

  if (!activityType || !location) return null;

  return (
    <Box>
      <Typography variant="subtitle2" fontWeight={700} mb={1} color="text.secondary">
        💡 Gợi ý hoạt động phổ biến
      </Typography>

      {loading ? (
        <Stack spacing={1}>
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} variant="rounded" height={64} />
          ))}
        </Stack>
      ) : suggestions.length === 0 ? (
        <Typography variant="body2" color="text.secondary" sx={{ py: 1 }}>
          Chưa có gợi ý nào phù hợp
        </Typography>
      ) : (
        <Stack spacing={1}>
          {suggestions.map((s) => (
            <Card key={s.id} variant="outlined" sx={{ borderRadius: 2 }}>
              <CardActionArea onClick={() => onSelect(s)}>
                <CardContent sx={{ py: 1, px: 1.5, '&:last-child': { pb: 1 } }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography variant="body2" fontWeight={700} noWrap>
                        {s.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {s.type} · {s.location}
                      </Typography>
                    </Box>
                    {s.average_user_rating > 0 && (
                      <Stack alignItems="flex-end">
                        <Rating
                          value={s.average_user_rating}
                          precision={0.1}
                          size="small"
                          readOnly
                        />
                        <Typography variant="caption" color="text.secondary">
                          {s.average_user_rating.toFixed(1)} ★
                        </Typography>
                      </Stack>
                    )}
                  </Stack>
                </CardContent>
              </CardActionArea>
            </Card>
          ))}
        </Stack>
      )}
    </Box>
  );
};

export default SuggestionsPanel;
