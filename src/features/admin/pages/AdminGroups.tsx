import { useEffect, useState, useCallback } from 'react';
import {
  Box,
  Typography,
  Card,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  TextField,
  InputAdornment,
  Pagination,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogActions,
  Button,
} from '@mui/material';
import { Search, Delete, Public, Lock, WarningAmberRounded } from '@mui/icons-material';
import { apiCall } from '@/config/api';
import { ENDPOINTS } from '@/config/api/endpoint';
import { useSnackbar } from 'notistack';
import dayjs from 'dayjs';

interface AdminGroup {
  id: number;
  name: string;
  description: string;
  departure_location: string;
  route_destinations: string;
  start_date: string;
  end_date: string;
  is_public: boolean;
  expected_members: number;
  budget_per_person: number;
  currency: string;
  created_at: string;
}

const PAGE_SIZE = 10;

const AdminGroups = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [groups, setGroups] = useState<AdminGroup[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<AdminGroup | null>(null);

  const fetchGroups = useCallback(async () => {
    setLoading(true);
    const { response } = await apiCall({
      method: 'GET',
      url: `${ENDPOINTS.ADMIN.GROUPS}?page=${page}&page_size=${PAGE_SIZE}&search=${encodeURIComponent(search)}`,
    });
    if (response?.status === 200) {
      setGroups(response.data.data.groups ?? []);
      setTotal(response.data.data.total ?? 0);
    }
    setLoading(false);
  }, [page, search]);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  const handleSearch = () => {
    setSearch(searchInput);
    setPage(1);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedGroup) return;
    setDeleting(true);
    const { response, error } = await apiCall({
      method: 'DELETE',
      url: ENDPOINTS.ADMIN.DELETE_GROUP(selectedGroup.id),
    });
    setDeleting(false);
    setDeleteDialog(false);

    if (response?.status === 200 || response?.status === 204) {
      enqueueSnackbar('Đã xóa nhóm', { variant: 'success' });
      fetchGroups();
    } else {
      const msg = response?.data?.error || error || 'Lỗi khi xóa nhóm';
      enqueueSnackbar(String(msg), { variant: 'error' });
    }
  };

  const getTripStatus = (start: string, end: string) => {
    const now = new Date();
    if (now > new Date(end)) return { label: 'Đã kết thúc', color: '#94a3b8', bg: '#f1f5f9' };
    if (now >= new Date(start)) return { label: 'Đang diễn ra', color: '#16a34a', bg: '#dcfce7' };
    return { label: 'Sắp diễn ra', color: '#d97706', bg: '#fef3c7' };
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="caption" color="text.secondary">
        Admin / Quản lý nhóm
      </Typography>

      <Box sx={{ mt: 1, mb: 3 }}>
        <Typography variant="h4" color="#111814">Quản lý Nhóm chuyến đi</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Xem và quản lý tất cả các nhóm chuyến đi trên nền tảng.
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <Card sx={{ px: 3, py: 2, borderRadius: 3, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
          <Typography variant="caption" color="text.secondary">Tổng nhóm</Typography>
          <Typography variant="h5">{total.toLocaleString()}</Typography>
        </Card>
      </Box>

      <Card sx={{ borderRadius: 3, boxShadow: '0 1px 4px rgba(0,0,0,0.08)', mb: 2 }}>
        <Box sx={{ p: 2, display: 'flex', gap: 2 }}>
          <TextField
            placeholder="Tìm theo tên nhóm, điểm đến..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            size="small"
            sx={{ flex: 1 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ color: '#94a3b8' }} />
                </InputAdornment>
              ),
            }}
          />
          <Button
            variant="contained"
            onClick={handleSearch}
            sx={{ bgcolor: '#19e66b', color: '#111814', textTransform: 'none', '&:hover': { bgcolor: '#16c45e' } }}
          >
            Tìm kiếm
          </Button>
        </Box>
      </Card>

      <Card sx={{ borderRadius: 3, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#f8fafc' }}>
                <TableCell sx={{ color: '#64748b', fontSize: 12 }}>NHÓM</TableCell>
                <TableCell sx={{ color: '#64748b', fontSize: 12 }}>ĐIỂM ĐẾN</TableCell>
                <TableCell sx={{ color: '#64748b', fontSize: 12 }}>TRẠNG THÁI</TableCell>
                <TableCell sx={{ color: '#64748b', fontSize: 12 }}>CHẾ ĐỘ</TableCell>
                <TableCell sx={{ color: '#64748b', fontSize: 12 }}>NGÀY TẠO</TableCell>
                <TableCell sx={{ color: '#64748b', fontSize: 12 }} align="right">THAO TÁC</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                    <CircularProgress sx={{ color: '#19e66b' }} />
                  </TableCell>
                </TableRow>
              ) : groups.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 6, color: '#94a3b8' }}>
                    Không tìm thấy nhóm nào
                  </TableCell>
                </TableRow>
              ) : (
                groups.map((group) => {
                  const status = getTripStatus(group.start_date, group.end_date);
                  return (
                    <TableRow key={group.id} hover>
                      <TableCell>
                        <Typography variant="body2">{group.name}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {dayjs(group.start_date).format('DD/MM/YY')} – {dayjs(group.end_date).format('DD/MM/YY')}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {group.route_destinations || group.departure_location || '—'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={status.label}
                          size="small"
                          sx={{ bgcolor: status.bg, color: status.color, fontSize: 11 }}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          icon={group.is_public ? <Public sx={{ fontSize: 14 }} /> : <Lock sx={{ fontSize: 14 }} />}
                          label={group.is_public ? 'Công khai' : 'Riêng tư'}
                          size="small"
                          sx={{
                            bgcolor: group.is_public ? '#eff6ff' : '#f1f5f9',
                            color: group.is_public ? '#3b82f6' : '#64748b',
                            fontSize: 11,
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {dayjs(group.created_at).format('DD/MM/YYYY')}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => { setSelectedGroup(group); setDeleteDialog(true); }}
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {totalPages > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 3, py: 2, borderTop: '1px solid #f1f5f9' }}>
            <Typography variant="caption" color="text.secondary">
              Hiển thị {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, total)} / {total} kết quả
            </Typography>
            <Pagination
              count={totalPages}
              page={page}
              onChange={(_, val) => setPage(val)}
              size="small"
              sx={{ '& .Mui-selected': { bgcolor: '#19e66b !important', color: '#111814' } }}
            />
          </Box>
        )}
      </Card>

      {/* Delete confirm dialog */}
      <Dialog
        open={deleteDialog}
        onClose={() => !deleting && setDeleteDialog(false)}
        PaperProps={{ sx: { borderRadius: 3, p: 1, maxWidth: 400 } }}
      >
        <DialogContent sx={{ textAlign: 'center', pt: 4, pb: 2 }}>
          <Box
            sx={{
              width: 56,
              height: 56,
              bgcolor: '#fff1f2',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 2,
            }}
          >
            <WarningAmberRounded sx={{ color: '#ef4444', fontSize: 28 }} />
          </Box>
          <Typography variant="h6" sx={{ mb: 1 }}>Xóa nhóm chuyến đi?</Typography>
          <Typography variant="body2" color="text.secondary">
            Bạn sắp xóa nhóm{' '}
            <strong style={{ color: '#111814' }}>{selectedGroup?.name}</strong>.
            Toàn bộ dữ liệu liên quan sẽ bị xóa vĩnh viễn.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
          <Button
            fullWidth
            variant="outlined"
            onClick={() => setDeleteDialog(false)}
            disabled={deleting}
            sx={{ textTransform: 'none', borderColor: '#e2e8f0', color: '#475569' }}
          >
            Hủy
          </Button>
          <Button
            fullWidth
            variant="contained"
            color="error"
            onClick={handleDeleteConfirm}
            disabled={deleting}
            sx={{ textTransform: 'none' }}
          >
            {deleting ? <CircularProgress size={18} color="inherit" /> : 'Xóa nhóm'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminGroups;
