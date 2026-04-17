import { useEffect, useState, useMemo, useCallback } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Chip,
  CircularProgress,
  IconButton,
  TextField,
  InputAdornment,
  Stack,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Collapse,
  Button,
} from '@mui/material';
import { LocationOn, CalendarToday, ArrowForward, Explore, Search, FilterList, Clear, Favorite, FavoriteBorder } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { apiCall } from '@/config/api';
import { ENDPOINTS } from '@/config/api/endpoint';
import dayjs from 'dayjs';
import { useSnackbar } from 'notistack';

interface PublicGroup {
  id: number;
  name: string;
  description: string;
  departure_location: string;
  route_destinations: string;
  start_date: string;
  end_date: string;
  is_public: boolean;
  budget_per_person?: number;
  currency?: string;
}

const BUDGET_OPTIONS = [
  { label: 'Tất cả', value: 'all' },
  { label: 'Dưới 1 triệu', value: '0-1000000' },
  { label: '1 – 3 triệu', value: '1000000-3000000' },
  { label: '3 – 5 triệu', value: '3000000-5000000' },
  { label: '5 – 10 triệu', value: '5000000-10000000' },
  { label: 'Trên 10 triệu', value: '10000000-999999999' },
];

const ExploreTab = () => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [groups, setGroups] = useState<PublicGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [favoritedIds, setFavoritedIds] = useState<Set<number>>(new Set());
  const [togglingId, setTogglingId] = useState<number | null>(null);

  // Filter states
  const [searchName, setSearchName] = useState('');
  const [filterDeparture, setFilterDeparture] = useState('');
  const [filterDestination, setFilterDestination] = useState('');
  const [filterBudget, setFilterBudget] = useState('all');

  useEffect(() => {
    const fetchPublicGroups = async () => {
      setLoading(true);
      setError(null);
      try {
        const { response, error: apiError } = await apiCall({
          method: 'GET',
          url: ENDPOINTS.GROUP.PUBLIC_LIST,
        });
        if (response?.status === 200) {
          setGroups(response.data?.data ?? []);
        } else {
          setError(apiError || 'Không thể tải danh sách nhóm công khai');
        }
      } catch {
        setError('Lỗi kết nối. Vui lòng thử lại.');
      } finally {
        setLoading(false);
      }
    };

    fetchPublicGroups();
  }, []);

  // Load danh sách đã yêu thích để hiển thị đúng trạng thái tim
  useEffect(() => {
    const fetchFavorites = async () => {
      const { response } = await apiCall({ method: 'GET', url: ENDPOINTS.FAVORITE.LIST });
      if (response?.status === 200) {
        const ids = new Set<number>((response.data?.data ?? []).map((g: any) => g.id as number));
        setFavoritedIds(ids);
      }
    };
    fetchFavorites();
  }, []);

  const handleToggleFavorite = useCallback(async (e: React.MouseEvent, groupId: number) => {
    e.stopPropagation();
    setTogglingId(groupId);
    try {
      const { response } = await apiCall({ method: 'POST', url: ENDPOINTS.FAVORITE.TOGGLE(groupId) });
      if (response?.status === 200) {
        const isFav = response.data?.is_favorited as boolean;
        setFavoritedIds((prev) => {
          const next = new Set(prev);
          isFav ? next.add(groupId) : next.delete(groupId);
          return next;
        });
        enqueueSnackbar(isFav ? 'Đã thêm vào yêu thích' : 'Đã xóa khỏi yêu thích', {
          variant: isFav ? 'success' : 'info',
        });
      }
    } finally {
      setTogglingId(null);
    }
  }, [enqueueSnackbar]);

  const filteredGroups = useMemo(() => {
    return groups.filter((g) => {
      if (searchName && !g.name.toLowerCase().includes(searchName.toLowerCase())) return false;
      if (filterDeparture && !g.departure_location?.toLowerCase().includes(filterDeparture.toLowerCase())) return false;
      if (filterDestination && !g.route_destinations?.toLowerCase().includes(filterDestination.toLowerCase())) return false;
      if (filterBudget !== 'all') {
        const [min, max] = filterBudget.split('-').map(Number);
        const budget = g.budget_per_person ?? 0;
        if (budget < min || budget > max) return false;
      }
      return true;
    });
  }, [groups, searchName, filterDeparture, filterDestination, filterBudget]);

  const hasActiveFilters = searchName || filterDeparture || filterDestination || filterBudget !== 'all';

  const clearFilters = () => {
    setSearchName('');
    setFilterDeparture('');
    setFilterDestination('');
    setFilterBudget('all');
  };

  const getTripStatus = (startDateStr: string, endDateStr: string) => {
    const now = new Date();
    const startDate = new Date(startDateStr);
    const endDate = new Date(endDateStr);
    if (now > endDate) return { label: 'Đã kết thúc', color: 'default' as const, isActive: false };
    if (now >= startDate && now <= endDate)
      return { label: 'Đang diễn ra', color: 'success' as const, isActive: true };
    return { label: 'Sắp diễn ra', color: 'warning' as const, isActive: false };
  };

  return (
    <Container maxWidth="xl">
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ mb: 0.5, fontWeight: 700, color: '#111814' }}>
            Khám phá hành trình
          </Typography>
          <Typography variant="body1" sx={{ color: '#64748b' }}>
            Tìm kiếm cảm hứng từ các chuyến đi của cộng đồng.
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<FilterList />}
          onClick={() => setShowFilters(!showFilters)}
          sx={{
            borderColor: hasActiveFilters ? '#19e66b' : '#cbd5e1',
            color: hasActiveFilters ? '#16a34a' : '#111814',
            fontWeight: 600,
            textTransform: 'none',
          }}
        >
          Bộ lọc {hasActiveFilters && `(đang lọc)`}
        </Button>
      </Box>

      {/* Search bar */}
      <TextField
        fullWidth
        placeholder="Tìm kiếm theo tên chuyến đi..."
        value={searchName}
        onChange={(e) => setSearchName(e.target.value)}
        size="small"
        sx={{ mb: 2 }}
        InputProps={{
          startAdornment: <InputAdornment position="start"><Search sx={{ color: '#94a3b8' }} /></InputAdornment>,
          endAdornment: searchName ? (
            <InputAdornment position="end">
              <IconButton size="small" onClick={() => setSearchName('')}><Clear fontSize="small" /></IconButton>
            </InputAdornment>
          ) : null,
        }}
      />

      {/* Expandable filters */}
      <Collapse in={showFilters}>
        <Box sx={{ p: 3, bgcolor: '#f8fafc', borderRadius: 3, mb: 3, border: '1px solid #e2e8f0' }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="flex-end">
            <TextField
              label="Điểm xuất phát"
              placeholder="VD: Hà Nội"
              value={filterDeparture}
              onChange={(e) => setFilterDeparture(e.target.value)}
              size="small"
              sx={{ flex: 1 }}
              InputProps={{
                startAdornment: <InputAdornment position="start"><LocationOn sx={{ fontSize: 18, color: '#94a3b8' }} /></InputAdornment>,
              }}
            />
            <TextField
              label="Điểm đến"
              placeholder="VD: Đà Nẵng"
              value={filterDestination}
              onChange={(e) => setFilterDestination(e.target.value)}
              size="small"
              sx={{ flex: 1 }}
              InputProps={{
                startAdornment: <InputAdornment position="start"><LocationOn sx={{ fontSize: 18, color: '#19e66b' }} /></InputAdornment>,
              }}
            />
            <FormControl size="small" sx={{ flex: 1 }}>
              <InputLabel>Chi phí ước lượng / người</InputLabel>
              <Select
                value={filterBudget}
                label="Chi phí ước lượng / người"
                onChange={(e) => setFilterBudget(e.target.value)}
              >
                {BUDGET_OPTIONS.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
            {hasActiveFilters && (
              <Button
                variant="text"
                startIcon={<Clear />}
                onClick={clearFilters}
                sx={{ color: '#64748b', textTransform: 'none', whiteSpace: 'nowrap' }}
              >
                Xóa bộ lọc
              </Button>
            )}
          </Stack>
        </Box>
      </Collapse>

      {/* Result count */}
      {!loading && !error && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          {hasActiveFilters
            ? `Tìm thấy ${filteredGroups.length} / ${groups.length} chuyến đi`
            : `${groups.length} chuyến đi công khai`}
        </Typography>
      )}

      {/* Loading */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
          <CircularProgress sx={{ color: '#19e66b' }} />
        </Box>
      )}

      {/* Error */}
      {!loading && error && (
        <Box sx={{ p: 6, textAlign: 'center', border: '2px dashed #fca5a5', borderRadius: 4 }}>
          <Typography color="error" fontWeight={600}>{error}</Typography>
        </Box>
      )}

      {/* Empty state */}
      {!loading && !error && filteredGroups.length === 0 && (
        <Box sx={{ p: 10, textAlign: 'center', border: '2px dashed #cbd5e1', borderRadius: 4 }}>
          <Explore sx={{ fontSize: 48, color: '#cbd5e1', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" fontWeight={600}>
            {hasActiveFilters ? 'Không tìm thấy chuyến đi phù hợp' : 'Chưa có chuyến đi công khai nào'}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {hasActiveFilters ? 'Thử thay đổi bộ lọc để xem thêm kết quả.' : 'Hãy là người đầu tiên chia sẻ hành trình của bạn!'}
          </Typography>
          {hasActiveFilters && (
            <Button variant="outlined" onClick={clearFilters} sx={{ mt: 2, textTransform: 'none' }}>
              Xóa bộ lọc
            </Button>
          )}
        </Box>
      )}

      {/* Grid of cards */}
      {!loading && !error && filteredGroups.length > 0 && (
        <Grid container spacing={3}>
          {filteredGroups.map((group) => {
            const status = getTripStatus(group.start_date, group.end_date);
            const coverImage = `https://picsum.photos/seed/${group.id}/600/300`;
            const dateStr = `${dayjs(group.start_date).format('DD/MM')} – ${dayjs(group.end_date).format('DD/MM/YYYY')}`;

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

                    {/* Favorite button */}
                    <IconButton
                      onClick={(e) => handleToggleFavorite(e, group.id)}
                      disabled={togglingId === group.id}
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
                      {togglingId === group.id ? (
                        <CircularProgress size={16} sx={{ color: '#ef4444' }} />
                      ) : favoritedIds.has(group.id) ? (
                        <Favorite sx={{ fontSize: 18, color: '#ef4444' }} />
                      ) : (
                        <FavoriteBorder sx={{ fontSize: 18, color: '#ef4444' }} />
                      )}
                    </IconButton>

                    {/* Departure chip */}
                    <Chip
                      icon={<LocationOn sx={{ fontSize: 14, color: 'white' }} />}
                      label={group.departure_location || 'Chưa cập nhật'}
                      size="small"
                      sx={{
                        position: 'absolute',
                        bottom: 12,
                        left: 12,
                        bgcolor: 'rgba(0,0,0,0.6)',
                        color: 'white',
                        backdropFilter: 'blur(4px)',
                        fontWeight: 600,
                      }}
                    />

                    {/* Status chip */}
                    <Chip
                      icon={status.isActive ? <CalendarToday sx={{ fontSize: 14 }} /> : <Box sx={{ width: 6, height: 6, bgcolor: '#f59e0b', borderRadius: '50%', mr: 0.5 }} />}
                      label={status.label}
                      size="small"
                      sx={{
                        position: 'absolute',
                        top: 12,
                        right: 12,
                        bgcolor: status.isActive ? 'white' : '#fef3c7',
                        color: status.isActive ? '#111814' : '#b45309',
                        fontWeight: 700,
                      }}
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
                      {group.description || 'Chưa có mô tả cho chuyến đi này.'}
                    </Typography>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 'auto' }}>
                      <Box>
                        <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, display: 'block' }}>
                          🗓 {dateStr}
                        </Typography>
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

export default ExploreTab;
