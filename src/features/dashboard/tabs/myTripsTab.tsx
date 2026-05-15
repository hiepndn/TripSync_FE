import React, { useState } from 'react';
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
  Tabs,
  Tab,
  Stack,
} from '@mui/material';
import {
  LocationOn,
  CalendarToday,
  ArrowForward,
  FlightTakeoff,
  CheckCircleOutline,
  AccessTime,
} from '@mui/icons-material';
import { useAppSelector } from '@/app/store';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';

type TripStatus = 'all' | 'upcoming' | 'ongoing' | 'ended';

const getTripStatus = (startDateStr: string, endDateStr: string) => {
  const now = new Date();
  const startDate = new Date(startDateStr);
  const endDate = new Date(endDateStr);

  if (now > endDate) return { label: 'Đã kết thúc', color: 'default' as const, key: 'ended' };
  if (now >= startDate && now <= endDate)
    return { label: 'Đang diễn ra', color: 'success' as const, key: 'ongoing' };
  return { label: 'Sắp diễn ra', color: 'warning' as const, key: 'upcoming' };
};

const MyTripsTab = () => {
  const navigate = useNavigate();
  const { groups, loading } = useAppSelector((state) => state.groups);
  const [filter, setFilter] = useState<TripStatus>('all');

  const filteredGroups = groups.filter((group: any) => {
    if (filter === 'all') return true;
    const status = getTripStatus(group.start_date, group.end_date);
    return status.key === filter;
  });

  const counts = {
    all: groups.length,
    upcoming: groups.filter((g: any) => getTripStatus(g.start_date, g.end_date).key === 'upcoming').length,
    ongoing: groups.filter((g: any) => getTripStatus(g.start_date, g.end_date).key === 'ongoing').length,
    ended: groups.filter((g: any) => getTripStatus(g.start_date, g.end_date).key === 'ended').length,
  };

  return (
    <Container maxWidth="xl">
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" sx={{ color: '#111814', mb: 1 }}>
          Chuyến đi của tôi
        </Typography>
        <Typography variant="subtitle1" sx={{ color: '#64748b' }}>
          Tất cả các chuyến đi bạn đã tạo hoặc tham gia.
        </Typography>
      </Box>

      {/* Filter Tabs */}
      <Tabs
        value={filter}
        onChange={(_, val) => setFilter(val)}
        variant="scrollable"
        scrollButtons="auto"
        allowScrollButtonsMobile
        sx={{
          mb: 4,
          borderBottom: '1px solid #e2e8f0',
          '& .MuiTab-root': { textTransform: 'none', fontWeight: 600, fontSize: 14 },
          '& .Mui-selected': { color: '#111814 !important' },
          '& .MuiTabs-indicator': { bgcolor: '#19e66b', height: 3 },
          '& .MuiTabScrollButton-root': { color: '#19e66b' },
        }}
      >
        <Tab
          value="all"
          label={
            <Stack direction="row" spacing={1} alignItems="center">
              <span>Tất cả</span>
              <Chip label={counts.all} size="small" sx={{ height: 20, fontSize: 11 }} />
            </Stack>
          }
        />
        <Tab
          value="upcoming"
          label={
            <Stack direction="row" spacing={1} alignItems="center">
              <AccessTime sx={{ fontSize: 16 }} />
              <span>Sắp diễn ra</span>
              {counts.upcoming > 0 && (
                <Chip label={counts.upcoming} size="small" color="warning" sx={{ height: 20, fontSize: 11 }} />
              )}
            </Stack>
          }
        />
        <Tab
          value="ongoing"
          label={
            <Stack direction="row" spacing={1} alignItems="center">
              <FlightTakeoff sx={{ fontSize: 16 }} />
              <span>Đang diễn ra</span>
              {counts.ongoing > 0 && (
                <Chip label={counts.ongoing} size="small" color="success" sx={{ height: 20, fontSize: 11 }} />
              )}
            </Stack>
          }
        />
        <Tab
          value="ended"
          label={
            <Stack direction="row" spacing={1} alignItems="center">
              <CheckCircleOutline sx={{ fontSize: 16 }} />
              <span>Đã kết thúc</span>
              {counts.ended > 0 && (
                <Chip label={counts.ended} size="small" sx={{ height: 20, fontSize: 11 }} />
              )}
            </Stack>
          }
        />
      </Tabs>

      {/* Loading */}
      {loading && groups.length === 0 ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
          <CircularProgress sx={{ color: '#19e66b' }} />
        </Box>
      ) : filteredGroups.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 10 }}>
          <Typography variant="h6" color="text.secondary">
            Không có chuyến đi nào
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {filter === 'all'
              ? 'Hãy tạo hoặc tham gia một nhóm để bắt đầu!'
              : 'Không có chuyến đi nào trong trạng thái này.'}
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {filteredGroups.map((group: any) => {
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
                  onClick={() => navigate(`/groups/${group.id}`)}
                >
                  <Box sx={{ position: 'relative' }}>
                    <CardMedia component="img" height="180" image={coverImage} alt={group.name} />

                    {/* Role badge */}
                    {group.role && (
                      <Chip
                        label={group.role === 'ADMIN' ? 'Admin' : 'Thành viên'}
                        size="small"
                        sx={{
                          position: 'absolute',
                          bottom: 12,
                          left: 12,
                          bgcolor: group.role === 'ADMIN' ? '#19e66b' : 'rgba(0,0,0,0.6)',
                          color: group.role === 'ADMIN' ? '#111814' : 'white',
                          fontWeight: 700,
                        }}
                      />
                    )}

                    <Chip
                      label={status.label}
                      size="small"
                      color={status.color}
                      sx={{
                        position: 'absolute',
                        top: 12,
                        right: 12,
                        fontWeight: 700,
                      }}
                    />
                  </Box>

                  <CardContent sx={{ flexGrow: 1, p: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5, color: '#111814' }}>
                      {group.name}
                    </Typography>

                    {/* Date range */}
                    <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mb: 1.5 }}>
                      <CalendarToday sx={{ fontSize: 14, color: '#64748b' }} />
                      <Typography variant="caption" color="text.secondary">
                        {dayjs(group.start_date).format('DD/MM/YYYY')} –{' '}
                        {dayjs(group.end_date).format('DD/MM/YYYY')}
                      </Typography>
                    </Stack>

                    <Typography
                      variant="body2"
                      sx={{
                        color: '#64748b',
                        mb: 3,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {group.description || 'Chưa có mô tả cho chuyến đi này.'}
                    </Typography>

                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        mt: 'auto',
                      }}
                    >
                      {(() => {
                        const previews = group.member_previews ?? [];
                        const total = group.member_count ?? group.expected_members ?? 1;
                        const extra = total - previews.length;
                        return (
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            {previews.map((member: any, i: number) => (
                              <Avatar
                                key={member.id}
                                src={member.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(member.full_name || 'U')}`}
                                sx={{
                                  width: 32,
                                  height: 32,
                                  border: '2px solid white',
                                  ml: i === 0 ? 0 : -1,
                                  bgcolor: '#e2e8f0',
                                }}
                              />
                            ))}
                            {extra > 0 && (
                              <Avatar
                                sx={{
                                  width: 32,
                                  height: 32,
                                  fontSize: 11,
                                  fontWeight: 700,
                                  border: '2px solid white',
                                  ml: -1,
                                  bgcolor: '#e2e8f0',
                                  color: '#475569',
                                }}
                              >
                                +{extra}
                              </Avatar>
                            )}
                          </Box>
                        );
                      })()}

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

export default MyTripsTab;
