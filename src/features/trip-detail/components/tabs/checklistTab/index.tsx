import React, { useEffect, useMemo, useState } from 'react';
import { 
  Box, Typography, Button, Card, Stack, Avatar, Checkbox, 
  LinearProgress, Chip, Grid, CircularProgress, Alert, IconButton, Menu, MenuItem,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from '@mui/material';
import { useParams } from 'react-router-dom';

// Icons
import AddIcon from '@mui/icons-material/Add';
import BackpackIcon from '@mui/icons-material/Backpack';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import PersonAddAltIcon from '@mui/icons-material/PersonAddAlt';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import FilterListIcon from '@mui/icons-material/FilterList';
import DeleteIcon from '@mui/icons-material/Delete';

import { useAppSelector, useAppDispatch } from '@/app/store';

import ChecklistItemInput from './components/ChecklistItemInput';
import ChecklistHeadingForm from './components/ChecklistHeadingForm';
import MyWorkCard from './components/MyWorkCard';
import RecentActivityCard from './components/RecentActivityCard';
import { assignChecklistAction, deleteChecklistAction, fetchChecklistAction, toggleChecklistAction } from '@/features/trip-detail/redux/action';
import { useSnackbar } from 'notistack';

export default function ChecklistTab() {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const { enqueueSnackbar } = useSnackbar();
  
  const { checklist, checklistLoading, groupDetail } = useAppSelector((state: any) => state.tripDetail);
  
  const [openHeadingForm, setOpenHeadingForm] = useState(false);
  
  // 🌟 STATE CHO TÍNH NĂNG LỌC
  const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const { profile } = useAppSelector((state) => state.groups);
  const { members } = useAppSelector((state: any) => state.tripDetail);

  // 🌟 STATE CHO MENU GIAO VIỆC
  const [assignAnchorEl, setAssignAnchorEl] = useState<null | HTMLElement>(null);
  const [activeAssignItem, setActiveAssignItem] = useState<number | null>(null);

  const handleOpenAssign = (e: React.MouseEvent<HTMLElement>, itemId: number) => {
    setAssignAnchorEl(e.currentTarget);
    setActiveAssignItem(itemId);
  };

  const handleCloseAssign = () => {
    setAssignAnchorEl(null);
    setActiveAssignItem(null);
  };

  const handleSelectAssignee = (assigneeId: number | null) => {
    if (activeAssignItem) {
      dispatch(assignChecklistAction(id || '', activeAssignItem, assigneeId) as any);
    }
    handleCloseAssign();
  };

  useEffect(() => {
    if (id) dispatch(fetchChecklistAction(id) as any);
  }, [id, dispatch]);

  const groupedChecklist = useMemo(() => {
    if (!checklist) return {};
    return checklist.reduce((acc: any, item: any) => {
      const cat = item.category || 'Khác';
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(item);
      return acc;
    }, {});
  }, [checklist]);

  // 🌟 LẤY DANH SÁCH CÁC ĐẦU MỤC ĐỂ HIỆN TRONG MENU LỌC
  const categoriesList = Object.keys(groupedChecklist);

  const progress = useMemo(() => {
    if (!checklist || checklist.length === 0) return 0;
    const completed = checklist.filter((i: any) => i.is_completed).length;
    return Math.round((completed / checklist.length) * 100);
  }, [checklist]);

  // 🌟 HÀM XÓA TOÀN BỘ ĐẦU MỤC CHÍNH (Xóa tất cả việc con bên trong)
  // 🌟 STATE QUẢN LÝ DIALOG XÓA
  const [deleteConfirm, setDeleteConfirm] = useState<{ 
    isOpen: boolean; 
    type: 'category' | 'item'; 
    targetName: string; 
    itemId?: number; 
    categoryItems?: any[] 
  }>({
    isOpen: false,
    type: 'item',
    targetName: ''
  });

  // Mở Dialog
  const openDeleteConfirm = (type: 'category' | 'item', targetName: string, itemId?: number, categoryItems?: any[]) => {
    setDeleteConfirm({ isOpen: true, type, targetName, itemId, categoryItems });
  };

  // Xác nhận Xóa
  const handleConfirmDelete = async () => {
    if (deleteConfirm.type === 'category' && deleteConfirm.categoryItems) {
      // Xóa nguyên cục Category
      await Promise.all(deleteConfirm.categoryItems.map(item => 
        dispatch(deleteChecklistAction(id || '', item.id, enqueueSnackbar) as any)
      ));
      if (selectedCategory === deleteConfirm.targetName) {
        setSelectedCategory('All');
      }
    } else if (deleteConfirm.type === 'item' && deleteConfirm.itemId) {
      // Xóa 1 Item lẻ
      dispatch(deleteChecklistAction(id || '', deleteConfirm.itemId, enqueueSnackbar) as any);
    }
    // Đóng Dialog sau khi xóa xong
    setDeleteConfirm({ ...deleteConfirm, isOpen: false });
  };

  if (checklistLoading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress sx={{ color: '#22c55e' }} /></Box>;
  }

  const renderEmptyState = () => (
    <Card sx={{ borderRadius: 4, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', p: 8, mt: 4, textAlign: 'center', bgcolor: '#f8fafc' }}>
      <Stack alignItems="center" justifyContent="center" spacing={3}>
        <BackpackIcon sx={{ fontSize: 80, color: '#cbd5e1' }} />
        <Box>
          <Typography variant="h6"  color="text.primary">Cùng lên danh sách chuẩn bị nào!</Typography>
          <Typography variant="body2" color="text.secondary" mt={0.5} sx={{ maxWidth: 400, mx: 'auto' }}>
            Hành lý của chuyến đi tới {groupDetail?.route_destinations?.split(',')[0]} vẫn còn trống. Hãy bấm "Thêm việc" để tạo đề mục và thêm đồ dùng nhé!
          </Typography>
        </Box>
        <Button 
          variant="contained" startIcon={<AddIcon />} 
          onClick={() => setOpenHeadingForm(true)}
          sx={{ bgcolor: '#22c55e', color: '#fff', borderRadius: 2.5, px: 3, py: 1, textTransform: 'none', '&:hover': { bgcolor: '#16a34a' } }}
        >
          Tạo đề mục đầu tiên
        </Button>
      </Stack>
    </Card>
  );

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
        <Box sx={{width: 1}}>
          <Typography variant="h5" color="text.primary">Checklist hành lý và chuẩn bị</Typography>
          <Stack direction="row" alignItems="center" spacing={2} mt={1}>
            <LinearProgress 
              variant="determinate" value={progress} 
              sx={{ width: 200, height: 8, borderRadius: 4, bgcolor: '#e2e8f0', '& .MuiLinearProgress-bar': { bgcolor: '#22c55e' } }} 
            />
            <Typography variant="body2" color="#22c55e" fontWeight={700}>{progress}% hoàn thành</Typography>
          </Stack>
        </Box>

        <Stack direction="row" spacing={2}>
          {/* 🌟 NÚT LỌC (FILTER) */}
          <Button 
            variant="outlined" 
            startIcon={<FilterListIcon sx={{ fontSize: '1.2rem !important' }} />} 
            onClick={(e) => setFilterAnchorEl(e.currentTarget)}
            sx={{ 
              color: '#475569', 
              borderColor: '#e2e8f0', 
              borderRadius: 2,           // Bo góc vừa phải
              textTransform: 'none', 
              fontWeight: 600, 
              bgcolor: '#fff',
              whiteSpace: 'nowrap',
              minWidth: 'max-content',
              px: 2,                     // Ép padding ngang
              py: 0.75,                  // 🌟 Ép chiều cao xuống
              '&:hover': { bgcolor: '#f8fafc', borderColor: '#cbd5e1' }
            }}
          >
            {selectedCategory === 'All' ? 'Lọc đề mục' : selectedCategory}
          </Button>
          <Menu 
            anchorEl={filterAnchorEl} 
            open={Boolean(filterAnchorEl)} 
            onClose={() => setFilterAnchorEl(null)}
            sx={{ '& .MuiPaper-root': { borderRadius: 3, mt: 1, minWidth: 180, boxShadow: '0 10px 30px rgba(0,0,0,0.1)' } }}
          >
            <MenuItem onClick={() => { setSelectedCategory('All'); setFilterAnchorEl(null); }} selected={selectedCategory === 'All'}>
              <Typography variant="body2">Tất cả đề mục</Typography>
            </MenuItem>
            {categoriesList.map(cat => (
              <MenuItem key={cat} onClick={() => { setSelectedCategory(cat); setFilterAnchorEl(null); }} selected={selectedCategory === cat}>
                <Typography variant="body2">{cat}</Typography>
              </MenuItem>
            ))}
          </Menu>

          <Button 
            variant="contained" 
            startIcon={<AddIcon sx={{ fontSize: '1.2rem !important' }}/>} 
            onClick={() => setOpenHeadingForm(true)}
            disableElevation               // 🌟 Tắt bóng (shadow) mặc định của MUI
            sx={{ 
              bgcolor: '#dcfce7',          // Nền xanh nhạt
              color: '#16a34a',            // Chữ & Icon xanh đậm
              borderRadius: 2,             // Bo góc đồng bộ với nút Lọc
              px: 2.5, 
              py: 0.75,                    // 🌟 Ép chiều cao cho bằng nút Lọc
              textTransform: 'none', 
              fontWeight: 700, 
              '&:hover': { 
                bgcolor: '#bbf7d0',        // Đậm lên một chút khi hover
              },
              whiteSpace: 'nowrap',   
              minWidth: 'max-content',
            }}
          >
            Thêm việc
          </Button>
        </Stack>
      </Stack>

      <Grid container spacing={4}>
        <Grid size={{ xs: 12, md: 7.5 }}>
          {checklist.length === 0 ? renderEmptyState() : (
            Object.entries(groupedChecklist)
              // 🌟 ÁP DỤNG BỘ LỌC VÀO LIST RENDER
              .filter(([category]) => selectedCategory === 'All' || category === selectedCategory)
              .map(([category, items]: [string, any]) => (
                <Box key={category} mb={4}>
                  <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2} px={1}>
                    <Stack direction="row" alignItems="center" spacing={1.5}>
                      {category === 'Đồ dùng chung' ? <BackpackIcon sx={{ color: '#f59e0b' }} /> : category.includes('Ăn uống') ? <RestaurantIcon sx={{ color: '#3b82f6' }} /> : <BackpackIcon sx={{ color: '#cbd5e1' }} />}
                      <Typography variant="h6" >{category}</Typography>
                    </Stack>
                    
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Typography variant="body2" color="text.secondary" mr={1}>
                        {items.filter((i:any) => i.is_completed).length}/{items.length} xong
                      </Typography>
                      {/* 🌟 NÚT XÓA ĐẦU MỤC CHÍNH */}
                      <IconButton 
                        size="small" 
                        onClick={() => openDeleteConfirm('category', category, undefined, items)}
                        sx={{ color: '#ef4444', '&:hover': { bgcolor: '#fef2f2' } }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Stack>
                  </Stack>

                  <Card sx={{ borderRadius: 4, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', p: 1 }}>
                    <Stack divider={<BackpackIcon sx={{ color: '#e2e8f0', fontSize: '1.2rem', my: 1, opacity: 0 }} />}>
                      {items.map((item: any) => (
                        <Stack key={item.id} direction="row" alignItems="center" justifyContent="space-between" sx={{ p: 2, '&:hover': { bgcolor: '#f8fafc' }, borderRadius: 3, transition: 'all 0.2s' }}>
                          <Stack direction="row" alignItems="center" spacing={2}>
                            <Checkbox 
                              checked={item.is_completed} 
                              onChange={() => dispatch(toggleChecklistAction(id || '', item.id) as any)}
                              sx={{ color: '#cbd5e1', '&.Mui-checked': { color: '#22c55e' } }} 
                            />
                            <Box>
                              <Typography variant="subtitle1" sx={{ textDecoration: item.is_completed ? 'line-through' : 'none', color: item.is_completed ? '#94a3b8' : '#0f172a' }}>
                                {item.title}
                              </Typography>
                              {item.is_completed && item.completed_by && (
                                <Typography variant="caption" color="text.secondary">Đã xong bởi {item.completed_by.full_name}</Typography>
                              )}
                            </Box>
                          </Stack>

                          <Stack direction="row" alignItems="center" spacing={1}>
                            {item.is_completed && <Chip icon={<CheckCircleIcon sx={{ fontSize: '1rem !important' }}/>} label="Xong" size="small" sx={{ bgcolor: '#dcfce7', color: '#16a34a', borderRadius: 1.5 }} />}
                            
                            <Box onClick={(e) => handleOpenAssign(e, item.id)} sx={{ display: 'inline-block' }}>
                              {item.assignee ? (
                                <Avatar src={item.assignee.avatar} sx={{ width: 32, height: 32, cursor: 'pointer' }} />
                              ) : (
                                <Button size="small" variant="outlined" startIcon={<PersonAddAltIcon />} sx={{ borderRadius: 2, textTransform: 'none', color: '#64748b', borderColor: '#e2e8f0', px: 1.5 }}>
                                  Nhận việc
                                </Button>
                              )}
                            </Box>

                            {/* 🌟 NÚT XÓA CÔNG VIỆC CON */}
                            {/* 🌟 Thay thế nút IconButton cũ bằng nút này */}
                            <IconButton 
                              size="small" 
                              onClick={() => openDeleteConfirm('item', item.title, item.id)}
                              sx={{ color: '#ef4444', '&:hover': { bgcolor: '#fef2f2' }, ml: 1 }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Stack>
                        </Stack>
                      ))}
                    </Stack>
                    
                    <ChecklistItemInput groupId={id || ''} categoryName={category} />
                  </Card>
                </Box>
              ))
          )}
        </Grid>

        <Grid size={{ xs: 12, md: 4.5 }}>
          <Stack spacing={4}>
             <MyWorkCard />
             <RecentActivityCard />
          </Stack>
        </Grid>
      </Grid>

      <ChecklistHeadingForm groupId={id || ''} open={openHeadingForm} onClose={() => setOpenHeadingForm(false)} />

    {/* 🌟 MENU GIAO VIỆC (Hiển thị danh sách members) */}
      <Menu 
        anchorEl={assignAnchorEl} 
        open={Boolean(assignAnchorEl)} 
        onClose={handleCloseAssign}
        sx={{ '& .MuiPaper-root': { borderRadius: 3, mt: 1, minWidth: 200, boxShadow: '0 10px 30px rgba(0,0,0,0.1)' } }}
      >
        <MenuItem onClick={() => handleSelectAssignee(profile?.id)}>
          <Typography fontWeight={700} color="#22c55e">Nhận việc (Tôi)</Typography>
        </MenuItem>
        
        {/* Render danh sách thành viên nhóm */}
        {members?.filter((m: any) => m.id !== profile?.id).map((m: any) => (
          <MenuItem key={m.id} onClick={() => handleSelectAssignee(m.id)}>
            <Avatar src={m.avatar} sx={{ width: 24, height: 24, mr: 1.5 }} />
            <Typography variant="body2" fontWeight={600}>Giao cho {m.full_name}</Typography>
          </MenuItem>
        ))}
        
        <Box sx={{ borderBottom: '1px solid #e2e8f0', my: 1 }} />
        
        <MenuItem onClick={() => handleSelectAssignee(null)}>
          <Typography variant="body2" color="error">Bỏ gán việc</Typography>
        </MenuItem>
      </Menu>

    {/* 🌟 MUI DIALOG XÁC NHẬN XÓA */}
      <Dialog 
        open={deleteConfirm.isOpen} 
        onClose={() => setDeleteConfirm({ ...deleteConfirm, isOpen: false })}
        sx={{ '& .MuiDialog-paper': { borderRadius: 4, minWidth: { xs: 300, sm: 400 } } }}
      >
        <DialogTitle sx={{ fontWeight: 800 }}>Xác nhận xóa</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: 'text.secondary' }}>
            Bạn có chắc chắn muốn xóa {deleteConfirm.type === 'category' 
              ? <b>toàn bộ mục "{deleteConfirm.targetName}"</b> 
              : <b>công việc "{deleteConfirm.targetName}"</b>
            }? Hành động này không thể hoàn tác.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button 
            onClick={() => setDeleteConfirm({ ...deleteConfirm, isOpen: false })} 
            sx={{ color: '#64748b', fontWeight: 600, textTransform: 'none' }}
          >
            Hủy
          </Button>
          <Button 
            onClick={handleConfirmDelete} 
            variant="contained" 
            sx={{ bgcolor: '#ef4444', color: '#fff', borderRadius: 2, fontWeight: 700, textTransform: 'none', '&:hover': { bgcolor: '#dc2626' } }}
          >
            Xóa ngay
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}