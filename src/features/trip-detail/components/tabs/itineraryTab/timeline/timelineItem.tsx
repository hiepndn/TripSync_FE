import React, { useState } from 'react';
import {
  Box,
  Card,
  Typography,
  Chip,
  Stack,
  IconButton,
  Button,
  CircularProgress,
  Menu,
  MenuItem,
  // 🌟 Import thêm UI Dialog
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import Timeline from '@mui/lab/Timeline';
import TimelineItem, { timelineItemClasses } from '@mui/lab/TimelineItem';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineDot from '@mui/lab/TimelineDot';

import HotelIcon from '@mui/icons-material/Hotel';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import AttractionsIcon from '@mui/icons-material/Attractions';
import CampingIcon from '@mui/icons-material/NightShelter';
import ThumbUpAltIcon from '@mui/icons-material/ThumbUpAlt';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
dayjs.extend(utc);

import { Activity } from '@/models/activity';
import { useAppDispatch } from '@/app/store';
// 🌟 Nhớ import deleteActivityAction
import { finalizeActivityAction, voteActivityAction, deleteActivityAction } from '@/features/trip-detail/redux/action';
import { useAppSelector } from '@/app/store';
import ActivityDialog from '../AddActivityDialog';
import WarningRoundedIcon from '@mui/icons-material/WarningRounded';
import DeleteForeverRoundedIcon from '@mui/icons-material/DeleteForeverRounded';
import { useSnackbar } from 'notistack';
import StarRatingWidget from './StarRatingWidget';

const typeIcon: Record<string, React.ReactNode> = {
  HOTEL: <HotelIcon />,
  RESTAURANT: <RestaurantIcon />,
  ATTRACTION: <AttractionsIcon />,
  CAMPING: <CampingIcon />,
};

// =====================================================================
// 🌟 SUB-COMPONENT: Đảm nhiệm render TỪNG THẺ để quản lý Menu riêng biệt
// =====================================================================
const ActivityTimelineItem = ({
  act,
  isLast,
  isOwner,
  groupId,
}: {
  act: Activity;
  isLast: boolean;
  isOwner: boolean;
  groupId: number;
}) => {
  const dispatch = useAppDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const openMenu = Boolean(anchorEl);
  
  // 🌟 State quản lý mở/đóng Dialog Xóa
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);

  const isApproved = act.status === 'APPROVED';
  const isPending = act.status === 'PENDING';
  const icon = typeIcon[act.type] || <AttractionsIcon />;
  const timeStr = dayjs(act.start_time).format('HH:mm');

  // Handle Menu
  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  // 🌟 Handle Dialog Xóa
  const handleOpenDeleteDialog = () => {
    setOpenDeleteDialog(true);
    handleCloseMenu();
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
  };

  const handleOpenEditDialog = () => {
    setOpenEditDialog(true);
    handleCloseMenu(); // Bấm Sửa xong là đóng cái menu 3 chấm lại
  };

  const handleCloseEditDialog = () => {
    setOpenEditDialog(false);
  };

  const executeDelete = () => {
    dispatch(
      deleteActivityAction(
        groupId,
        act.id,
        () => handleCloseDeleteDialog(),
        (err) => {
          enqueueSnackbar('Không thể xóa: ' + err, { variant: 'error' });
          handleCloseDeleteDialog();
        }
      ) as any
    );
  };

  const handleVote = () => {
    dispatch(voteActivityAction(groupId, act.id) as any);
  };

  const handleFinalize = () => {
    dispatch(finalizeActivityAction(groupId, act.id) as any);
  };

  return (
    <TimelineItem>
      <TimelineSeparator>
        <TimelineDot sx={{ bgcolor: isApproved ? '#19e66b' : '#f59e0b', boxShadow: 'none' }} />
        {!isLast && (
          <TimelineConnector sx={{ bgcolor: isApproved ? '#19e66b' : 'grey.200', width: 2 }} />
        )}
      </TimelineSeparator>

      <TimelineContent sx={{ pb: 4, pr: 0 }}>
        {/* Giờ */}
        <Stack direction="row" spacing={1} mb={1}>
          <Typography variant="subtitle2" fontWeight={700} sx={{ mt: 0.5 }}>
            {timeStr}
          </Typography>
        </Stack>

        {/* Card */}
        <Card
          variant="outlined"
          sx={{
            p: 2,
            borderRadius: 3,
            borderColor: isApproved ? 'grey.200' : '#fcd34d',
            ...(isPending && { borderLeft: '4px solid #f59e0b' }),
            ...(act.imageURL && { overflow: 'hidden' }),
          }}
        >
          {act.imageURL && (
            <Box
              component="img"
              src={act.imageURL}
              alt={act.name}
              sx={{ width: '100%', height: 140, objectFit: 'cover', borderRadius: 2, mb: 1.5 }}
            />
          )}

          <Stack direction="row" spacing={2} alignItems="flex-start">
            <Box
              sx={{
                p: 1,
                bgcolor: isApproved ? '#dcfce7' : '#fef3c7',
                color: isApproved ? '#16a34a' : '#d97706',
                borderRadius: 2,
              }}
            >
              {icon}
            </Box>
            <Box flex={1}>
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                <Box>
                  <Typography variant="subtitle1" fontWeight={700}>
                    {act.name || '(Chưa đặt tên)'}
                  </Typography>
                  {act.location && (
                    <Typography variant="caption" color="text.secondary">
                      📍 {act.location}
                    </Typography>
                  )}
                  {isPending && (
                    <Typography
                      variant="caption"
                      sx={{ color: '#d97706', fontWeight: 600, display: 'block' }}
                    >
                      ● Đang bỏ phiếu
                    </Typography>
                  )}
                </Box>

                {/* 🌟 Nút 3 chấm mở Menu */}
                <Box>
                  <IconButton size="small" onClick={handleOpenMenu}>
                    <MoreVertIcon fontSize="small" />
                  </IconButton>
                  <Menu
                    anchorEl={anchorEl}
                    open={openMenu}
                    onClose={handleCloseMenu}
                    transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                    anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                    PaperProps={{
                      sx: {
                        borderRadius: 3, // Bo tròn góc xịn xò
                        boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.08)', // Đổ bóng viền siêu mịn
                        mt: 0.5, // Cách cái nút 3 chấm ra một tí cho thoáng
                        minWidth: 140, // Định hình chiều rộng cho menu
                        p: 0.5, // Thêm tí padding bên trong cho các nút không sát mép
                      },
                    }}
                  >
                    {!isApproved && (
                      <MenuItem onClick={handleOpenEditDialog}>
                        <EditIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} /> Sửa
                      </MenuItem>
                    )}
                    {/* Chỉ Owner (ADMIN) hoặc người tạo mới được xóa */}
                    {isOwner && (
                      <MenuItem onClick={handleOpenDeleteDialog} sx={{ color: 'error.main' }}>
                        <DeleteIcon fontSize="small" sx={{ mr: 1 }} /> Xóa
                      </MenuItem>
                    )}
                  </Menu>
                </Box>
              </Stack>

              {act.description && (
                <Typography variant="body2" color="text.secondary" mt={0.5} mb={1}>
                  {act.description}
                </Typography>
              )}

              {act.rating > 0 && (
                <Typography variant="caption" color="text.secondary">
                  ⭐ {act.rating}
                </Typography>
              )}

              <StarRatingWidget
                groupId={groupId}
                activityId={act.id}
                myRating={act.my_rating ?? 0}
                averageUserRating={act.average_user_rating ?? 0}
              />

              <Stack direction="row" spacing={1} alignItems="center" mt={1.5}>
                {isApproved && (
                  <Chip
                    label="Đã chốt"
                    size="small"
                    sx={{ bgcolor: '#d1fae5', color: '#047857', fontWeight: 600 }}
                  />
                )}

                {isPending && (
                  <>
                    <Button
                      size="small"
                      variant={act.has_voted ? 'contained' : 'outlined'}
                      onClick={handleVote}
                      startIcon={<ThumbUpAltIcon sx={{ fontSize: '0.9rem' }} />}
                      sx={{
                        bgcolor: act.has_voted ? '#10b981' : 'transparent',
                        borderColor: '#10b981',
                        color: act.has_voted ? 'white' : '#10b981',
                        borderRadius: 2,
                        boxShadow: 'none',
                        '&:hover': { bgcolor: '#059669', color: 'white' },
                      }}
                    >
                      {act.vote_count}
                    </Button>

                    {isOwner && (
                      <Button
                        size="small"
                        variant="contained"
                        onClick={handleFinalize}
                        sx={{
                          bgcolor: '#19e66b',
                          color: '#111',
                          fontWeight: 700,
                          borderRadius: 2,
                          boxShadow: 'none',
                          '&:hover': { bgcolor: '#15c95c' },
                        }}
                      >
                        Chốt ✓
                      </Button>
                    )}
                  </>
                )}

                {act.externalLink && (
                  <Button
                    size="small"
                    href={act.externalLink}
                    target="_blank"
                    sx={{ color: '#19e66b', fontWeight: 500 }}
                  >
                    Đặt ngay →
                  </Button>
                )}
              </Stack>
            </Box>
          </Stack>
        </Card>
      </TimelineContent>

      {/* ===== DIALOG XÓA (ĐÃ MÔNG MÁ) ===== */}
      <Dialog
        open={openDeleteDialog}
        onClose={handleCloseDeleteDialog}
        PaperProps={{
          sx: {
            borderRadius: 5, // Thêm góc bo tròn mềm mại
            p: 1.5, // Thêm padding chung cho sang
          },
        }}
      >
        {/* Tiêu đề căn giữa, có Icon to vật vã */}
        <DialogTitle sx={{ textAlign: 'center', pt: 3 }}>
          <Stack alignItems="center" spacing={2}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 80,
                height: 80,
                bgcolor: '#fee2e2', // Màu nền đỏ nhạt (error lighter)
                color: '#ef4444', // Màu icon đỏ đậm (error main)
                borderRadius: '50%',
              }}
            >
              <WarningRoundedIcon sx={{ fontSize: '3.5rem' }} />
            </Box>
            <Typography variant="h5" fontWeight={700} sx={{ color: '#111814' }}>
              Xác nhận xóa hoạt động?
            </Typography>
          </Stack>
        </DialogTitle>

        {/* Nội dung căn giữa, làm nổi bật tên hoạt động */}
        <DialogContent sx={{ textAlign: 'center', px: 4, pb: 1 }}>
          <Stack spacing={2}>
            <Typography variant="body1" color="text.secondary">
              Bạn đang thực hiện xóa hoạt động:
            </Typography>
            {/* Làm nổi bật cái tên, có background */}
            <Typography
              variant="subtitle1"
              fontWeight={700}
              sx={{
                bgcolor: 'grey.100',
                p: 2,
                borderRadius: 3,
                border: '1px solid',
                borderColor: 'grey.200',
              }}
            >
              "{act.name}"
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Hành động này <b>không thể hoàn tác</b> và hoạt động sẽ biến mất khỏi lịch trình. Bạn có chắc chắn chứ?
            </Typography>
          </Stack>
        </DialogContent>

        {/* Nút bấm căn giữa, full width cho nó máu */}
        <DialogActions sx={{ justifyContent: 'center', gap: 2, px: 3, pb: 3, pt: 2 }}>
          <Button
            onClick={handleCloseDeleteDialog}
            variant="outlined"
            color="inherit"
            fullWidth
            sx={{
              borderRadius: 3,
              color: '#64748b',
              borderColor: '#e2e8f0',
              textTransform: 'none',
              fontWeight: 600,
            }}
          >
            Hủy, giữ lại
          </Button>
          <Button
            onClick={executeDelete}
            variant="contained"
            color="error"
            fullWidth
            disableElevation
            startIcon={<DeleteForeverRoundedIcon />}
            sx={{
              borderRadius: 3,
              textTransform: 'none',
              fontWeight: 700,
              bgcolor: '#ef4444',
              '&:hover': { bgcolor: '#dc2626' },
            }}
            autoFocus
          >
            Xóa luôn
          </Button>
        </DialogActions>
      </Dialog>

      {openEditDialog && (
        <ActivityDialog
          mode="edit" // 🌟 Truyền chữ 'edit'
          open={openEditDialog}
          onClose={handleCloseEditDialog}
          groupId={groupId}
          activity={act} // 🌟 Bắt buộc phải truyền cục 'act' vào để nó fill data
        />
      )}
    </TimelineItem>
  );
};

// =====================================================================
// 🌟 COMPONENT CHÍNH
// =====================================================================
interface Props {
  activities: Activity[];
  loading: boolean;
  groupId: string;
  currentDate: any;
  hideAddButton?: boolean;
}

export default function TripTimeline({ activities, loading, groupId, currentDate, hideAddButton = false }: Props) {
  const [openAddModal, setOpenAddModal] = useState(false);
  const { myRole } = useAppSelector((state: any) => state.tripDetail);
  const isOwner = myRole === 'ADMIN';

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
        <CircularProgress sx={{ color: '#19e66b' }} />
      </Box>
    );
  }

  // 🌟 GỘP CHUNG VÀO 1 RETURN DUY NHẤT ĐỂ DIALOG LUÔN TỒN TẠI TRONG DOM
  return (
    <Box>
      {/* NẾU RỖNG THÌ HIỆN CÁI NÀY */}
      {activities.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 6, color: 'grey.400' }}>
          <Typography variant="h6">Chưa có hoạt động nào trong ngày này</Typography>
          <Typography variant="body2" mt={1}>
            Bấm "+ Đề xuất" để thêm hoạt động đầu tiên!
          </Typography>

          <Button
            variant="outlined"
            sx={{ mt: 3, color: '#16a34a', borderColor: '#16a34a', borderStyle: 'dashed' }}
            onClick={() => setOpenAddModal(true)}
          >
            + Đề xuất hoạt động mới
          </Button>
        </Box>
      ) : (
        /* NẾU CÓ DATA THÌ HIỆN TIMELINE */
        <>
          <Timeline sx={{ [`& .${timelineItemClasses.root}:before`]: { flex: 0, padding: 0 }, p: 0 }}>
            {activities.map((act, idx) => (
              <ActivityTimelineItem
                key={act.id}
                act={act}
                isLast={idx === activities.length - 1}
                isOwner={isOwner}
                groupId={Number(groupId)}
              />
            ))}
          </Timeline>

          {!hideAddButton && (
            <Button
              variant="outlined"
              fullWidth
              sx={{
                mt: 2,
                color: '#16a34a',
                borderColor: '#16a34a',
                borderStyle: 'dashed',
                borderRadius: 3,
              }}
              onClick={() => setOpenAddModal(true)}
            >
              + Đề xuất hoạt động mới
            </Button>
          )}
        </>
      )}

      {openAddModal && (
        <ActivityDialog
          mode="add" // 🌟 Truyền chữ 'add'
          open={openAddModal}
          onClose={() => setOpenAddModal(false)}
          groupId={groupId}
          selectedDate={currentDate} // 🌟 Ở mode add thì phải truyền ngày vào
        />
      )}
    </Box>
  );
}