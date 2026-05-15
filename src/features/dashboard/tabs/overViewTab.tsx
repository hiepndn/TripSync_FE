import { useCallback, useEffect, useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Stack,
  Chip,
  IconButton,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Avatar,
  CircularProgress,
  Tabs,
  Tab,
} from '@mui/material';
import {
  GroupAdd,
  AddLocationAlt,
  LocationOn,
  CalendarToday,
  ArrowForward,
  Add,
  AccessTime,
  FlightTakeoff,
  CheckCircleOutline,
} from '@mui/icons-material';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { useSnackbar } from 'notistack';
import AddGroupDialog from './components/addGroupDialog';
import { useAppSelector } from '@/app/store';
import { fetchGroupsAction } from '../redux/action';
import { useDispatch } from 'react-redux';
import JoinGroupDialog from './components/joinGroupDialog';
import { useNavigate } from 'react-router-dom';
import ImportItineraryDialog from '@/components/ImportItineraryDialog';

type TripFilter = 'all' | 'upcoming' | 'ongoing' | 'ended';

const OverviewTab = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [openJoinModal, setOpenJoinModal] = useState(false);
  const [openImportModal, setOpenImportModal] = useState(false);
  const [filter, setFilter] = useState<TripFilter>('all');
  const { enqueueSnackbar } = useSnackbar();

  // Lấy data thật từ Redux
  const { groups, loading } = useAppSelector((state) => state.groups);

  const onLoad = useCallback(() => {
    dispatch(fetchGroupsAction() as any);
  }, [dispatch]);

  useEffect(() => {
    onLoad();
  }, [onLoad]);

  // Hàm helper tính toán trạng thái chuyến đi dựa vào ngày
  const getTripStatus = (startDateStr: string, endDateStr: string) => {
    const now = new Date();
    const startDate = new Date(startDateStr);
    const endDate = new Date(endDateStr);

    if (now > endDate) return { label: 'Đã kết thúc', color: 'default', isActive: false, key: 'ended' };
    if (now >= startDate && now <= endDate)
      return { label: 'Đang diễn ra', color: 'success', isActive: true, key: 'ongoing' };
    return { label: 'Sắp diễn ra', color: 'warning', isActive: false, key: 'upcoming' };
  };

  const filteredGroups = groups.filter((group: any) => {
    if (filter === 'all') return true;
    return getTripStatus(group.start_date, group.end_date).key === filter;
  });

  const counts = {
    all: groups.length,
    upcoming: groups.filter((g: any) => getTripStatus(g.start_date, g.end_date).key === 'upcoming').length,
    ongoing: groups.filter((g: any) => getTripStatus(g.start_date, g.end_date).key === 'ongoing').length,
    ended: groups.filter((g: any) => getTripStatus(g.start_date, g.end_date).key === 'ended').length,
  };

  return (
    <Container maxWidth="xl">
      {/* Header Section */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          mb: 6,
          gap: 2,
        }}
      >
        <Box>
          <Typography variant="h3" sx={{ color: '#111814', mb: 1 }}>
            Quản lý Nhóm
          </Typography>
          <Typography variant="subtitle1" sx={{ color: '#64748b' }}>
            Sẵn sàng cho chuyến đi tiếp theo chưa? Tạo nhóm mới hoặc tham gia cùng bạn bè ngay.
          </Typography>
        </Box>
        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            startIcon={<GroupAdd />}
            sx={{
              color: '#111814',
              borderColor: '#cbd5e1',
              fontWeight: 600,
              textTransform: 'none',
            }}
            onClick={() => setOpenJoinModal(true)}
          >
            Tham gia nhóm
          </Button>
          <Button
            variant="outlined"
            startIcon={<FileDownloadIcon />}
            sx={{
              color: '#111814',
              borderColor: '#cbd5e1',
              fontWeight: 600,
              textTransform: 'none',
            }}
            onClick={() => setOpenImportModal(true)}
          >
            Import lịch trình
          </Button>
          <Button
            variant="contained"
            startIcon={<AddLocationAlt />}
            onClick={() => setOpenCreateModal(true)}
            sx={{ bgcolor: '#19e66b', color: '#111814', fontWeight: 700, textTransform: 'none' }}
          >
            Tạo nhóm mới
          </Button>
        </Stack>
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
        <Tab value="all" label={
          <Stack direction="row" spacing={1} alignItems="center">
            <span>Tất cả</span>
            <Chip label={counts.all} size="small" sx={{ height: 20, fontSize: 11 }} />
          </Stack>
        } />
        <Tab value="upcoming" label={
          <Stack direction="row" spacing={1} alignItems="center">
            <AccessTime sx={{ fontSize: 16 }} />
            <span>Sắp diễn ra</span>
            {counts.upcoming > 0 && <Chip label={counts.upcoming} size="small" color="warning" sx={{ height: 20, fontSize: 11 }} />}
          </Stack>
        } />
        <Tab value="ongoing" label={
          <Stack direction="row" spacing={1} alignItems="center">
            <FlightTakeoff sx={{ fontSize: 16 }} />
            <span>Đang diễn ra</span>
            {counts.ongoing > 0 && <Chip label={counts.ongoing} size="small" color="success" sx={{ height: 20, fontSize: 11 }} />}
          </Stack>
        } />
        <Tab value="ended" label={
          <Stack direction="row" spacing={1} alignItems="center">
            <CheckCircleOutline sx={{ fontSize: 16 }} />
            <span>Đã kết thúc</span>
            {counts.ended > 0 && <Chip label={counts.ended} size="small" sx={{ height: 20, fontSize: 11 }} />}
          </Stack>
        } />
      </Tabs>

      {/* Loading State */}
      {loading && groups.length === 0 ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
          <CircularProgress sx={{ color: '#19e66b' }} />
        </Box>
      ) : (
        /* ===== CARDS GRID ===== */
        <Grid container spacing={3}>
          {/* RENDER DỮ LIỆU THẬT */}
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
                    '&:hover': { transform: 'translateY(-4px)' },
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                  onClick={() => navigate(`/groups/${group.id}`)}
                >
                  <Box sx={{ position: 'relative' }}>
                    <CardMedia component="img" height="180" image={coverImage} alt={group.name} />

                    <Chip
                      icon={<LocationOn sx={{ fontSize: 14, color: 'white' }} />}
                      label="Chưa cập nhật" // Backend chưa có trường Location, tạm hardcode
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

                    <Chip
                      icon={
                        status.isActive ? (
                          <CalendarToday sx={{ fontSize: 14 }} />
                        ) : (
                          <Box
                            sx={{
                              width: 6,
                              height: 6,
                              bgcolor: '#f59e0b',
                              borderRadius: '50%',
                              mr: 0.5,
                            }}
                          />
                        )
                      }
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
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, color: '#111814' }}>
                      {group.name}
                    </Typography>
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
                      {/* Avatar members: hiện tối đa 3 avatar thực, dư thì +N */}
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
                                  fontSize: 12,
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

          {/* ===== ADD NEW TRIP CARD (LUÔN Ở CUỐI) ===== */}
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Card
              onClick={() => setOpenCreateModal(true)} // 👉 Bấm vào cái card này cũng mở Modal luôn cho tiện
              sx={{
                borderRadius: 4,
                border: '2px dashed #cbd5e1',
                boxShadow: 'none',
                bgcolor: 'transparent',
                height: '100%',
                minHeight: 380,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                '&:hover': { bgcolor: '#f8fafc', borderColor: '#94a3b8' },
              }}
            >
              <Box sx={{ textAlign: 'center', p: 3 }}>
                <Box
                  sx={{
                    width: 64,
                    height: 64,
                    bgcolor: '#f1f5f9',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 2,
                  }}
                >
                  <Add sx={{ color: '#64748b', fontSize: 32 }} />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#111814', mb: 1 }}>
                  Thêm chuyến đi mới
                </Typography>
                <Typography variant="body2" sx={{ color: '#64748b' }}>
                  Bắt đầu kế hoạch cho hành trình tiếp theo
                </Typography>
              </Box>
            </Card>
          </Grid>
        </Grid>
      )}

      <AddGroupDialog open={openCreateModal} onClose={() => setOpenCreateModal(false)} onSuccess={onLoad}/>
      <JoinGroupDialog open={openJoinModal} onClose={() => setOpenJoinModal(false)} />
      <ImportItineraryDialog
        open={openImportModal}
        onClose={() => setOpenImportModal(false)}
        onSuccess={(count) => {
          enqueueSnackbar(`Import thành công ${count} hoạt động!`, { variant: 'success' });
          onLoad();
        }}
      />
    </Container>
  );
};

export default OverviewTab;
