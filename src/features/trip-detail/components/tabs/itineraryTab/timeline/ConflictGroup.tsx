import { useState } from 'react';
import {
  Box,
  Card,
  Typography,
  Chip,
  Stack,
  Button,
  Avatar,
  AvatarGroup,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Menu,
  MenuItem,
} from '@mui/material';
import HotelIcon from '@mui/icons-material/Hotel';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import AttractionsIcon from '@mui/icons-material/Attractions';
import CampingIcon from '@mui/icons-material/NightShelter';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import ThumbUpAltIcon from '@mui/icons-material/ThumbUpAlt';
import AddIcon from '@mui/icons-material/Add';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import WarningRoundedIcon from '@mui/icons-material/WarningRounded';
import DeleteForeverRoundedIcon from '@mui/icons-material/DeleteForeverRounded';
import ReplayIcon from '@mui/icons-material/Replay';
import StarRatingWidget from './StarRatingWidget';
import HowToVoteIcon from '@mui/icons-material/HowToVote';

import { Activity } from '@/models/activity';
import { useAppDispatch } from '@/app/store';
import { finalizeActivityAction, voteActivityAction, deleteActivityAction, unfinalizeActivityAction } from '@/features/trip-detail/redux/action';
import { useSnackbar } from 'notistack';
import ActivityDialog from '../AddActivityDialog';

const typeIcon: Record<string, React.ReactNode> = {
  HOTEL: <HotelIcon sx={{ fontSize: 18 }} />,
  RESTAURANT: <RestaurantIcon sx={{ fontSize: 18 }} />,
  ATTRACTION: <AttractionsIcon sx={{ fontSize: 18 }} />,
  CAMPING: <CampingIcon sx={{ fontSize: 18 }} />,
  TRANSPORT: <DirectionsBusIcon sx={{ fontSize: 18 }} />,
};

const typeLabel: Record<string, string> = {
  RESTAURANT: 'Ăn uống',
  HOTEL: 'Lưu trú',
  ATTRACTION: 'Tham quan',
  TRANSPORT: 'Di chuyển',
  CAMPING: 'Cắm trại',
};

interface OptionRowProps {
  act: Activity;
  isLeading: boolean;
  isOwner: boolean;
  groupId: number;
  selectedDate?: string;
}

const OptionRow = ({ act, isLeading, isOwner, groupId, selectedDate }: OptionRowProps) => {
  const dispatch = useAppDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);

  const handleVote = () => dispatch(voteActivityAction(groupId, act.id) as any);
  const handleFinalize = () => dispatch(finalizeActivityAction(groupId, act.id) as any);

  const executeDelete = () => {
    dispatch(
      deleteActivityAction(
        groupId,
        act.id,
        () => setOpenDeleteDialog(false),
        (err) => {
          enqueueSnackbar('Không thể xóa: ' + err, { variant: 'error' });
          setOpenDeleteDialog(false);
        }
      ) as any
    );
  };

  const isPending = act.status === 'PENDING';
  const isApproved = act.status === 'APPROVED';

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          px: 2,
          py: 1.5,
          borderRadius: 2,
          bgcolor: isLeading ? '#f0fdf4' : 'transparent',
          border: isLeading ? '1px solid #bbf7d0' : '1px solid transparent',
          transition: 'background 0.2s',
        }}
      >
        {/* Icon */}
        <Box
          sx={{
            width: 32,
            height: 32,
            borderRadius: 1.5,
            bgcolor: isApproved ? '#dcfce7' : isLeading ? '#dcfce7' : '#f1f5f9',
            color: isApproved ? '#16a34a' : isLeading ? '#16a34a' : '#64748b',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          {typeIcon[act.type] || <AttractionsIcon sx={{ fontSize: 18 }} />}
        </Box>

        {/* Info */}
        <Box flex={1} minWidth={0}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography
              variant="subtitle1"
              noWrap
              sx={{
                maxWidth: 200,
                fontWeight: 700,
              }}
            >
              {act.name || '(Chưa đặt tên)'}
            </Typography>
            {isLeading && isPending && (
              <Chip
                label="Dẫn đầu"
                size="small"
                sx={{ bgcolor: '#dcfce7', color: '#16a34a', fontSize: 10, height: 18 }}
              />
            )}
            {isApproved && (
              <Chip
                label="Đã chốt ✓"
                size="small"
                sx={{ bgcolor: '#d1fae5', color: '#047857', fontSize: 10, height: 18, fontWeight: 600 }}
              />
            )}
          </Stack>
          <Stack direction="row" spacing={1.5} mt={0.25}>
            {act.estimatedCost > 0 && (
              <Typography variant="caption" color="text.secondary">
                💰 ~{act.estimatedCost.toLocaleString('vi-VN')}đ/người
              </Typography>
            )}
            {act.location && (
              <Typography variant="caption" color="text.secondary" noWrap sx={{ maxWidth: 140 }}>
                📍 {act.location}
              </Typography>
            )}
          </Stack>
        </Box>

        {/* Voters avatars */}
        {(act.votes?.length ?? 0) > 0 && (
          <AvatarGroup max={3} sx={{ '& .MuiAvatar-root': { width: 24, height: 24, fontSize: 10 } }}>
            {(act.votes ?? []).map((v: any) => (
              <Avatar key={v.user_id} src={v.avatar} sx={{ width: 24, height: 24 }} />
            ))}
          </AvatarGroup>
        )}

        {/* Vote button */}
        {isPending && (
          <Button
            size="small"
            variant={act.has_voted ? 'contained' : 'outlined'}
            onClick={handleVote}
            startIcon={<ThumbUpAltIcon sx={{ fontSize: '0.85rem' }} />}
            sx={{
              minWidth: 52,
              height: 32,
              bgcolor: act.has_voted ? '#10b981' : 'transparent',
              borderColor: '#10b981',
              color: act.has_voted ? 'white' : '#10b981',
              borderRadius: 2,
              boxShadow: 'none',
              fontSize: 13,
              px: 1.5,
              flexShrink: 0,
              '&:hover': { bgcolor: '#059669', color: 'white' },
            }}
          >
            {act.vote_count}
          </Button>
        )}

        {/* Chốt button — admin, chỉ pending */}
        {isPending && isOwner && (
          <Button
            size="small"
            variant="contained"
            onClick={handleFinalize}
            sx={{
              bgcolor: '#19e66b',
              color: '#111',
              borderRadius: 2,
              boxShadow: 'none',
              height: 32,
              fontSize: 12,
              px: 1.5,
              flexShrink: 0,
              '&:hover': { bgcolor: '#15c95c' },
            }}
          >
            Chốt ✓
          </Button>
        )}

        {/* Menu 3 chấm */}
        <IconButton size="small" onClick={(e) => setAnchorEl(e.currentTarget)} sx={{ flexShrink: 0 }}>
          <MoreVertIcon fontSize="small" />
        </IconButton>
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={() => setAnchorEl(null)}
          PaperProps={{ sx: { borderRadius: 3, boxShadow: '0px 8px 24px rgba(0,0,0,0.08)', mt: 0.5, minWidth: 140, p: 0.5 } }}
        >
          {!isApproved && (
            <MenuItem onClick={() => { setAnchorEl(null); setOpenEditDialog(true); }}>
              <EditIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} /> Sửa
            </MenuItem>
          )}
          {isOwner && (
            <MenuItem onClick={() => { setAnchorEl(null); setOpenDeleteDialog(true); }} sx={{ color: 'error.main' }}>
              <DeleteIcon fontSize="small" sx={{ mr: 1 }} /> Xóa
            </MenuItem>
          )}
        </Menu>
      </Box>

      {/* Delete dialog */}
      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)} PaperProps={{ sx: { borderRadius: 5, p: 1.5 } }}>
        <DialogTitle sx={{ textAlign: 'center', pt: 3 }}>
          <Stack alignItems="center" spacing={2}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 72, height: 72, bgcolor: '#fee2e2', color: '#ef4444', borderRadius: '50%' }}>
              <WarningRoundedIcon sx={{ fontSize: '3rem' }} />
            </Box>
            <Typography variant="h6" sx={{ color: '#111814' }}>Xóa lựa chọn này?</Typography>
          </Stack>
        </DialogTitle>
        <DialogContent sx={{ textAlign: 'center', px: 4, pb: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Bạn đang xóa <strong>"{act.name}"</strong>. Hành động này không thể hoàn tác.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', gap: 2, px: 3, pb: 3, pt: 2 }}>
          <Button onClick={() => setOpenDeleteDialog(false)} variant="outlined" color="inherit" fullWidth sx={{ borderRadius: 3, textTransform: 'none' }}>Hủy</Button>
          <Button onClick={executeDelete} variant="contained" color="error" fullWidth disableElevation startIcon={<DeleteForeverRoundedIcon />} sx={{ borderRadius: 3, textTransform: 'none' }}>Xóa luôn</Button>
        </DialogActions>
      </Dialog>

      {openEditDialog && (
        <ActivityDialog mode="edit" open={openEditDialog} onClose={() => setOpenEditDialog(false)} groupId={groupId} activity={act} />
      )}
    </>
  );
};

interface Props {
  activities: Activity[];
  isOwner: boolean;
  groupId: number;
  selectedDate?: string;
}

export default function ConflictGroup({ activities, isOwner, groupId, selectedDate }: Props) {
  const dispatch = useAppDispatch();
  const [openAddModal, setOpenAddModal] = useState(false);
  const [approvedMenuAnchor, setApprovedMenuAnchor] = useState<null | HTMLElement>(null);

  const maxVotes = Math.max(...activities.map((a) => a.vote_count ?? 0));
  const isLeading = (a: Activity) => (a.vote_count ?? 0) === maxVotes && maxVotes > 0;

  // Nếu có activity đã APPROVED → render như card bình thường (chỉ hiện cái đã chốt)
  const approvedActivity = activities.find((a) => a.status === 'APPROVED');
  if (approvedActivity) {
    return (
      <Card
        variant="outlined"
        sx={{
          p: 2,
          borderRadius: 3,
          border: '1.5px solid #e2e8f0',
          boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
        }}
      >
        <Stack direction="row" spacing={2} alignItems="flex-start">
          <Box
            sx={{
              p: 1,
              bgcolor: '#dcfce7',
              color: '#16a34a',
              borderRadius: 2,
              flexShrink: 0,
            }}
          >
            {typeIcon[approvedActivity.type] || <AttractionsIcon />}
          </Box>
          <Box flex={1}>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  {approvedActivity.name}
                </Typography>
                {approvedActivity.location && (
                  <Typography variant="caption" color="text.secondary">
                    📍 {approvedActivity.location}
                  </Typography>
                )}
              </Box>
              {isOwner && (
                <>
                  <IconButton size="small" onClick={(e) => setApprovedMenuAnchor(e.currentTarget)}>
                    <MoreVertIcon fontSize="small" />
                  </IconButton>
                  <Menu
                    anchorEl={approvedMenuAnchor}
                    open={Boolean(approvedMenuAnchor)}
                    onClose={() => setApprovedMenuAnchor(null)}
                    PaperProps={{ sx: { borderRadius: 3, boxShadow: '0px 8px 24px rgba(0,0,0,0.08)', mt: 0.5, minWidth: 160, p: 0.5 } }}
                  >
                    <MenuItem
                      onClick={() => {
                        setApprovedMenuAnchor(null);
                        dispatch(unfinalizeActivityAction(groupId, approvedActivity.id) as any);
                      }}
                      sx={{ color: '#d97706' }}
                    >
                      <ReplayIcon fontSize="small" sx={{ mr: 1 }} /> Hủy chốt
                    </MenuItem>
                    <MenuItem
                      onClick={() => {
                        setApprovedMenuAnchor(null);
                        // Xóa activity đã chốt
                        dispatch(deleteActivityAction(
                          groupId,
                          approvedActivity.id,
                          () => {},
                          () => {}
                        ) as any);
                      }}
                      sx={{ color: 'error.main' }}
                    >
                      <DeleteIcon fontSize="small" sx={{ mr: 1 }} /> Xóa
                    </MenuItem>
                  </Menu>
                </>
              )}
            </Stack>
            {approvedActivity.description && (
              <Typography variant="body2" color="text.secondary" mt={0.5} mb={1}>
                {approvedActivity.description}
              </Typography>
            )}
            <StarRatingWidget
              groupId={groupId}
              activityId={approvedActivity.id}
              myRating={approvedActivity.my_rating ?? 0}
              averageUserRating={approvedActivity.average_user_rating ?? 0}
            />
            <Stack direction="row" spacing={1} mt={1}>
              <Chip label="Đã chốt" size="small" sx={{ bgcolor: '#d1fae5', color: '#047857', fontWeight: 600 }} />
              {approvedActivity.estimatedCost > 0 && (
                <Typography variant="caption" color="text.secondary" sx={{ alignSelf: 'center' }}>
                  💰 ~{approvedActivity.estimatedCost.toLocaleString('vi-VN')}đ/người
                </Typography>
              )}
            </Stack>
          </Box>
        </Stack>
      </Card>
    );
  }

  const isVoting = activities.some((a) => a.status === 'PENDING');

  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: 3,
        border: '1.5px solid #fcd34d',
        borderLeft: '4px solid #f59e0b',
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <Box sx={{ px: 2, pt: 2, pb: 1 }}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: 2,
              bgcolor: '#fff7ed',
              color: '#ea580c',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <HowToVoteIcon sx={{ fontSize: 20 }} />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.3 }}>
              {`${activities.length} lựa chọn cho khung giờ này`}
            </Typography>
            {isVoting && (
              <Typography variant="caption" sx={{ color: '#f59e0b', fontWeight: 600 }}>
                ● Đang bỏ phiếu
              </Typography>
            )}
          </Box>
        </Stack>
      </Box>

      {/* Options */}
      <Stack spacing={0.5} sx={{ px: 1, pb: 1 }}>
        {activities.map((act) => (
          <OptionRow
            key={act.id}
            act={act}
            isLeading={isLeading(act)}
            isOwner={isOwner}
            groupId={groupId}
            selectedDate={selectedDate}
          />
        ))}
      </Stack>

      {/* Add option */}
      <Box sx={{ px: 2, pb: 2 }}>
        <Button
          size="small"
          startIcon={<AddIcon />}
          onClick={() => setOpenAddModal(true)}
          sx={{ color: '#16a34a', textTransform: 'none', fontSize: 13, p: 0 }}
        >
          Đề xuất địa điểm khác
        </Button>
      </Box>

      {openAddModal && (
        <ActivityDialog
          mode="add"
          open={openAddModal}
          onClose={() => setOpenAddModal(false)}
          groupId={groupId}
          selectedDate={selectedDate}
        />
      )}
    </Card>
  );
}
