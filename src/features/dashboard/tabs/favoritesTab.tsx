import { useEffect, useState, useCallback } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Chip,
  Avatar,
  IconButton,
  CircularProgress,
  Stack,
} from '@mui/material';
import {
  CalendarToday,
  ArrowForward,
  Favorite,
  FavoriteBorder,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { apiCall } from '@/config/api';
import { ENDPOINTS } from '@/config/api/endpoint';
import dayjs from 'dayjs';
import { useSnackbar } from 'notistack';

interface FavoriteGroup {
  id: number;
  name: string;
  description: string;
  departure_location: string;
  route_destinations: string;
  start_date: string;
  end_date: string;
  budget_per_person?: number;
  currency?: string;
  role: string;
}

const getTripStatus = (startDateStr: string, endDateStr: string) => {
  const now = new Date();
  const startDate = new Date(startDateStr);
  const endDate = new Date(endDateStr);
  if (now > endDate) return { label: 'Đã kết thúc', color: 'default' as const };
  if (now >= startDate && now <= endDate) return { label: 'Đang diễn ra', color: 'success' as const };
  return { label: 'Sắp diễn ra', color: 'warning' as const };
};

const FavoritesTab = () => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [groups, setGroups] = useState<FavoriteGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState<number | null>(null);

  const fetchFavorites = useCallback(async () => {
    setLoading(true);
    try {
      const { response } = await apiCall({ method: 'GET', url: ENDPOINTS.FAVORITE.LIST });
      if (response?.status === 200) {
        setGroups(response.data?.data ?? []);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  const handleUnfavorite = async (e: React.MouseEvent, groupId: number) => {
    e.stopPropagation();
    setRemovingId(groupId);
    try {
      const { response } = await apiCall({
        method: 'POST',
        url: ENDPOINTS.FAVORITE.TOGGLE(groupId),
      });
      if (response?.status === 200) {
        setGroups((prev) => prev.filter((g) => g.id !== groupId));
        enqueueSnackbar('Đã xóa khỏi yêu thích', { variant: 'info' });
      }
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" sx={{ color: '#111814', mb: 1 }}>
          Yêu thích
        </Typography>
        <Typography variant="subtitle1" sx={{ color: '#64748b' }}>
          Các chuyến đi bạn đã đánh dấu yêu thích từ cộng đồng.
        </Typography>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
          <CircularProgress sx={{ color: '#19e66b' }} />
        </Box>
      ) : groups.length === 0 ? (
        <Box sx={{ p: 10, textAlign: 'center', border: '2px dashed #cbd5e1', borderRadius: 4 }}>
          <Favorite sx={{ fontSize: 48, color: '#fca5a5', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" fontWeight={600}>
            Chưa có chuyến đi yêu thích nào
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Khám phá các chuyến đi công khai và nhấn ❤️ để lưu lại!
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {groups.map((group) => {
            const status = getTripStatus(group.start_date, group.end_date);
            const coverImage = `https://picsum.photos/seed/${group.id}/600/300`;

            return (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={group.id}>
                <Card
                  sx={{
                    borderRadius: 4,
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    transition: 'transform 0.2s',
                    '&:hover': { transform: 'translateY(-4px)', cursor: 'pointer' },
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                  onClick={() => navigate(`/groups/public/${group.id}`)}
                >
                  <Box sx={{ position: 'relative' }}>
                    <CardMedia component="img" height="180" image={coverImage} alt={group.name} />

                    {/* Unfavorite button */}
                    <IconButton
                      onClick={(e) => handleUnfavorite(e, group.id)}
                      disabled={removingId === group.id}
                      sx={{
                        position: 'absolute',
                        top: 8,
                        left: 8,
                        bgcolor: 'white',
                        width: 36,
                        height: 36,
                        '&:hover': { bgcolor: '#fff1f2' },
                        boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
                      }}
                    >
                      {removingId === group.id ? (
                        <CircularProgress size={16} sx={{ color: '#ef4444' }} />
                      ) : (
                        <Favorite sx={{ fontSize: 18, color: '#ef4444' }} />
                      )}
                    </IconButton>

                    <Chip
                      label={status.label}
                      size="small"
                      color={status.color}
                      sx={{ position: 'absolute', top: 8, right: 8, fontWeight: 700 }}
                    />
                  </Box>

                  <CardContent sx={{ flexGrow: 1, p: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5, color: '#111814' }}>
                      {group.name}
                    </Typography>

                    {group.route_destinations && (
                      <Typography variant="body2" sx={{ color: '#19e66b', fontWeight: 600, mb: 1, fontSize: '0.8rem' }}>
                        📍 {group.route_destinations}
                      </Typography>
                    )}

                    <Typography
                      variant="body2"
                      sx={{
                        color: '#64748b',
                        mb: 2,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {group.description || 'Chưa có mô tả.'}
                    </Typography>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 'auto' }}>
                      <Box>
                        <Stack direction="row" spacing={0.5} alignItems="center">
                          <CalendarToday sx={{ fontSize: 13, color: '#64748b' }} />
                          <Typography variant="caption" color="text.secondary">
                            {dayjs(group.start_date).format('DD/MM')} – {dayjs(group.end_date).format('DD/MM/YYYY')}
                          </Typography>
                        </Stack>
                        {(group.budget_per_person ?? 0) > 0 && (
                          <Typography variant="caption" sx={{ color: '#16a34a', fontWeight: 600 }}>
                            💰 ~{(group.budget_per_person ?? 0).toLocaleString('vi-VN')} {group.currency || 'VND'}/người
                          </Typography>
                        )}
                      </Box>
                      <IconButton sx={{ bgcolor: '#f1f5f9', '&:hover': { bgcolor: '#e2e8f0' } }}>
                        <ArrowForward fontSize="small" sx={{ color: '#111814' }} />
                      </IconButton>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}
    </Container>
  );
};

export default FavoritesTab;
