import React, { useCallback, useEffect, useState } from 'react';
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
  AvatarGroup,
  Avatar,
  CircularProgress,
} from '@mui/material';
import {
  GroupAdd,
  AddLocationAlt,
  LocationOn,
  CalendarToday,
  ArrowForward,
  Add,
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import AddGroupDialog from './components/addGroupDialog';
import { useAppSelector } from '@/app/store';
import { fetchGroupsAction } from '../redux/action';
import { useDispatch } from 'react-redux';
import JoinGroupDialog from './components/joinGroupDialog';
import { useNavigate } from 'react-router-dom';

const OverviewTab = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [openJoinModal, setOpenJoinModal] = useState(false);
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

    if (now > endDate) return { label: 'Đã kết thúc', color: 'default', isActive: false };
    if (now >= startDate && now <= endDate)
      return { label: 'Đang diễn ra', color: 'success', isActive: true };
    return { label: 'Sắp diễn ra', color: 'warning', isActive: false };
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
            variant="contained"
            startIcon={<AddLocationAlt />}
            onClick={() => setOpenCreateModal(true)}
            sx={{ bgcolor: '#19e66b', color: '#111814', fontWeight: 700, textTransform: 'none' }}
          >
            Tạo nhóm mới
          </Button>
        </Stack>
      </Box>

      {/* Loading State */}
      {loading && groups.length === 0 ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
          <CircularProgress sx={{ color: '#19e66b' }} />
        </Box>
      ) : (
        /* ===== CARDS GRID ===== */
        <Grid container spacing={3}>
          {/* RENDER DỮ LIỆU THẬT */}
          {groups.map((group: any) => {
            const status = getTripStatus(group.start_date, group.end_date);
            // Tạm dùng 1 mảng ảnh tĩnh để random theo ID cho UI đỡ trống
            const defaultImages = [
              'https://images.unsplash.com/photo-1596422846543-74c6e271a9ee?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
              'https://images.unsplash.com/photo-1583417311718-c287bd5798aa?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
              'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
              'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
            ];
            const coverImage = defaultImages[(group.id || 0) % defaultImages.length];

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
                      {/* Tạm thời hiển thị Avatar tĩnh, sau này có API user detail sẽ lấy thật */}
                      <AvatarGroup
                        max={4}
                        sx={{
                          '& .MuiAvatar-root': {
                            width: 32,
                            height: 32,
                            fontSize: 12,
                            border: '2px solid white',
                          },
                        }}
                      >
                        <Avatar sx={{ bgcolor: '#e2e8f0', color: '#334155' }}>M</Avatar>
                      </AvatarGroup>

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
    </Container>
  );
};

export default OverviewTab;
