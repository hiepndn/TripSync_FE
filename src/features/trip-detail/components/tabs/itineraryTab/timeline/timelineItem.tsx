import React, { useState, useMemo } from 'react';
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
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import ThumbUpAltIcon from '@mui/icons-material/ThumbUpAlt';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import WarningRoundedIcon from '@mui/icons-material/WarningRounded';
import DeleteForeverRoundedIcon from '@mui/icons-material/DeleteForeverRounded';
import ReplayIcon from '@mui/icons-material/Replay';

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
dayjs.extend(utc);

import { Activity } from '@/models/activity';
import { useAppDispatch, useAppSelector } from '@/app/store';
import {
  finalizeActivityAction,
  voteActivityAction,
  deleteActivityAction,
  unfinalizeActivityAction,
} from '@/features/trip-detail/redux/action';
import ActivityDialog from '../AddActivityDialog';
import { useSnackbar } from 'notistack';
import StarRatingWidget from './StarRatingWidget';
import ConflictGroup from './ConflictGroup';

const typeIcon: Record<string, React.ReactNode> = {
  HOTEL: <HotelIcon />,
  RESTAURANT: <RestaurantIcon />,
  ATTRACTION: <AttractionsIcon />,
  CAMPING: <CampingIcon />,
  TRANSPORT: <DirectionsBusIcon />,
};

// =====================================================================
// SUB-COMPONENT: Render từng thẻ — chỉ giữ Menu (3 chấm)
// Dialog xóa + edit đã được lift lên TripTimeline (1 dialog duy nhất)
// =====================================================================
const ActivityTimelineItem = ({
  act,
  isLast,
  isOwner,
  groupId,
  onDeleteRequest,
  onEditRequest,
}: {
  act: Activity;
  isLast: boolean;
  isOwner: boolean;
  groupId: number;
  onDeleteRequest: (act: Activity) => void;
  onEditRequest: (act: Activity) => void;
}) => {
  const dispatch = useAppDispatch();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const openMenu = Boolean(anchorEl);

  const isApproved = act.status === 'APPROVED';
  const isPending = act.status === 'PENDING';
  const icon = typeIcon[act.type] || <AttractionsIcon />;
  const timeStr = dayjs(act.start_time).format('HH:mm');

  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget);
  const handleCloseMenu = () => setAnchorEl(null);

  const handleVote = () => dispatch(voteActivityAction(groupId, act.id) as any);
  const handleFinalize = () => dispatch(finalizeActivityAction(groupId, act.id) as any);

  return (
    <TimelineItem>
      <TimelineSeparator>
        <TimelineDot sx={{ bgcolor: isApproved ? '#19e66b' : '#f59e0b', boxShadow: 'none' }} />
        {!isLast && (
          <TimelineConnector sx={{ bgcolor: isApproved ? '#19e66b' : 'grey.200', width: 2 }} />
        )}
      </TimelineSeparator>

      <TimelineContent sx={{ pb: 4, pr: 0 }}>
        <Stack direction="row" spacing={1} mb={1}>
          <Typography variant="subtitle2" fontWeight={700} sx={{ mt: 0.5 }}>
            {timeStr}
          </Typography>
        </Stack>

        <Card
          variant="outlined"
          sx={{
            p: 2,
            borderRadius: 3,
            border: isPending ? '1.5px solid #fcd34d' : '1.5px solid #e2e8f0',
            borderLeft: isPending ? '4px solid #f59e0b' : '1.5px solid #e2e8f0',
            boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
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
                    <Typography variant="caption" sx={{ color: '#d97706', fontWeight: 600, display: 'block' }}>
                      ● Đang bỏ phiếu
                    </Typography>
                  )}
                </Box>

                {/* Menu 3 chấm — giữ nguyên ở đây vì cần anchorEl riêng từng thẻ */}
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
                        borderRadius: 3,
                        boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.08)',
                        mt: 0.5,
                        minWidth: 140,
                        p: 0.5,
                      },
                    }}
                  >
                    {!isApproved && (
                      <MenuItem onClick={() => { handleCloseMenu(); onEditRequest(act); }}>
                        <EditIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} /> Sửa
                      </MenuItem>
                    )}
                    {isApproved && isOwner && (
                      <MenuItem
                        onClick={() => {
                          handleCloseMenu();
                          dispatch(unfinalizeActivityAction(groupId, act.id) as any);
                        }}
                        sx={{ color: '#d97706' }}
                      >
                        <ReplayIcon fontSize="small" sx={{ mr: 1 }} /> Hủy chốt
                      </MenuItem>
                    )}
                    {isOwner && (
                      <MenuItem onClick={() => { handleCloseMenu(); onDeleteRequest(act); }} sx={{ color: 'error.main' }}>
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
                  <Chip label="Đã chốt" size="small" sx={{ bgcolor: '#d1fae5', color: '#047857', fontWeight: 600 }} />
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
                  <Button size="small" href={act.externalLink} target="_blank" sx={{ color: '#19e66b', fontWeight: 500 }}>
                    Đặt ngay →
                  </Button>
                )}
              </Stack>
            </Box>
          </Stack>
        </Card>
      </TimelineContent>
    </TimelineItem>
  );
};

// =====================================================================
// COMPONENT CHÍNH: TripTimeline
// Chỉ render 1 Dialog xóa + 1 Dialog edit duy nhất cho toàn bộ timeline
// =====================================================================
interface Props {
  activities: Activity[];
  loading: boolean;
  groupId: string;
  currentDate: any;
  hideAddButton?: boolean;
}

export default function TripTimeline({ activities, loading, groupId, currentDate, hideAddButton = false }: Props) {
  const dispatch = useAppDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { myRole } = useAppSelector((state: any) => state.tripDetail);
  const isOwner = myRole === 'ADMIN';

  const [openAddModal, setOpenAddModal] = useState(false);

  // ===== 1 STATE DUY NHẤT cho cả 2 dialog =====
  const [activityToDelete, setActivityToDelete] = useState<Activity | null>(null);
  const [activityToEdit, setActivityToEdit] = useState<Activity | null>(null);

  const handleDeleteRequest = (act: Activity) => setActivityToDelete(act);
  const handleEditRequest = (act: Activity) => setActivityToEdit(act);

  const handleCloseDelete = () => setActivityToDelete(null);
  const handleCloseEdit = () => setActivityToEdit(null);

  const executeDelete = () => {
    if (!activityToDelete) return;
    dispatch(
      deleteActivityAction(
        Number(groupId),
        activityToDelete.id,
        () => handleCloseDelete(),
        (err) => {
          enqueueSnackbar('Không thể xóa: ' + err, { variant: 'error' });
          handleCloseDelete();
        }
      ) as any
    );
  };

  // Group activities cùng start_time thành conflict groups
  const timelineGroups = useMemo(() => {
    const sorted = [...activities].sort((a, b) =>
      dayjs(a.start_time).valueOf() - dayjs(b.start_time).valueOf()
    );
    const groups: Activity[][] = [];
    const seen = new Map<string, number>();
    for (const act of sorted) {
      const key = dayjs(act.start_time).format('YYYY-MM-DD HH:mm');
      if (seen.has(key)) {
        groups[seen.get(key)!].push(act);
      } else {
        seen.set(key, groups.length);
        groups.push([act]);
      }
    }
    return groups;
  }, [activities]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
        <CircularProgress sx={{ color: '#19e66b' }} />
      </Box>
    );
  }

  return (
    <Box>
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
        <>
          <Timeline sx={{ [`& .${timelineItemClasses.root}:before`]: { flex: 0, padding: 0 }, p: 0 }}>
            {timelineGroups.map((group, idx) => {
              const isLast = idx === timelineGroups.length - 1;
              if (group.length === 1) {
                return (
                  <ActivityTimelineItem
                    key={group[0].id}
                    act={group[0]}
                    isLast={isLast}
                    isOwner={isOwner}
                    groupId={Number(groupId)}
                    onDeleteRequest={handleDeleteRequest}
                    onEditRequest={handleEditRequest}
                  />
                );
              }
              const isConflictApproved = group.some((a) => a.status === 'APPROVED');
              return (
                <TimelineItem key={`conflict-${group[0].id}`}>
                  <TimelineSeparator>
                    <TimelineDot sx={{ bgcolor: isConflictApproved ? '#19e66b' : '#f59e0b', boxShadow: 'none' }} />
                    {!isLast && (
                      <TimelineConnector sx={{ bgcolor: isConflictApproved ? '#19e66b' : 'grey.200', width: 2 }} />
                    )}
                  </TimelineSeparator>
                  <TimelineContent sx={{ pb: 4, pr: 0 }}>
                    <Stack direction="row" spacing={1} mb={1}>
                      <Typography
                        variant="subtitle2"
                        sx={{ mt: 0.5, fontWeight: 700, color: isConflictApproved ? '#16a34a' : 'inherit' }}
                      >
                        {dayjs(group[0].start_time).format('HH:mm')}
                      </Typography>
                    </Stack>
                    <ConflictGroup
                      activities={group}
                      isOwner={isOwner}
                      groupId={Number(groupId)}
                      selectedDate={currentDate}
                    />
                  </TimelineContent>
                </TimelineItem>
              );
            })}
          </Timeline>

          {!hideAddButton && (
            <Button
              variant="outlined"
              fullWidth
              sx={{ mt: 2, color: '#16a34a', borderColor: '#16a34a', borderStyle: 'dashed', borderRadius: 3 }}
              onClick={() => setOpenAddModal(true)}
            >
              + Đề xuất hoạt động mới
            </Button>
          )}
        </>
      )}

      {/* ===== ADD DIALOG ===== */}
      {openAddModal && (
        <ActivityDialog
          mode="add"
          open={openAddModal}
          onClose={() => setOpenAddModal(false)}
          groupId={groupId}
          selectedDate={currentDate}
        />
      )}

      {/* ===== EDIT DIALOG — 1 instance duy nhất cho toàn timeline ===== */}
      {activityToEdit && (
        <ActivityDialog
          mode="edit"
          open={Boolean(activityToEdit)}
          onClose={handleCloseEdit}
          groupId={groupId}
          activity={activityToEdit}
        />
      )}

      {/* ===== DELETE DIALOG — 1 instance duy nhất cho toàn timeline ===== */}
      <Dialog
        open={Boolean(activityToDelete)}
        onClose={handleCloseDelete}
        PaperProps={{ sx: { borderRadius: 5, p: 1.5 } }}
      >
        <DialogTitle sx={{ textAlign: 'center', pt: 3 }}>
          <Stack alignItems="center" spacing={2}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 80,
                height: 80,
                bgcolor: '#fee2e2',
                color: '#ef4444',
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

        <DialogContent sx={{ textAlign: 'center', px: 4, pb: 1 }}>
          <Stack spacing={2}>
            <Typography variant="body1" color="text.secondary">
              Bạn đang thực hiện xóa hoạt động:
            </Typography>
            <Typography
              variant="subtitle1"
              fontWeight={700}
              sx={{ bgcolor: 'grey.100', p: 2, borderRadius: 3, border: '1px solid', borderColor: 'grey.200' }}
            >
              "{activityToDelete?.name}"
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Hành động này <b>không thể hoàn tác</b> và hoạt động sẽ biến mất khỏi lịch trình. Bạn có chắc chắn chứ?
            </Typography>
          </Stack>
        </DialogContent>

        <DialogActions sx={{ justifyContent: 'center', gap: 2, px: 3, pb: 3, pt: 2 }}>
          <Button
            onClick={handleCloseDelete}
            variant="outlined"
            color="inherit"
            fullWidth
            sx={{ borderRadius: 3, color: '#64748b', borderColor: '#e2e8f0', textTransform: 'none', fontWeight: 600 }}
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
            sx={{ borderRadius: 3, textTransform: 'none', fontWeight: 700, bgcolor: '#ef4444', '&:hover': { bgcolor: '#dc2626' } }}
            autoFocus
          >
            Xóa luôn
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
