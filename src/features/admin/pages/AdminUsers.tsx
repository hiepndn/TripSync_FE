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
  Avatar,
  Chip,
  IconButton,
  TextField,
  InputAdornment,
  Pagination,
  CircularProgress,
  Menu,
  MenuItem,
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  Stack,
} from '@mui/material';
import {
  Search,
  MoreVert,
  Delete,
  AdminPanelSettings,
  PersonOutline,
  WarningAmberRounded,
} from '@mui/icons-material';
import { apiCall } from '@/config/api';
import { ENDPOINTS } from '@/config/api/endpoint';
import { useSnackbar } from 'notistack';
import dayjs from 'dayjs';

interface AdminUser {
  id: number;
  full_name: string;
  email: string;
  avatar: string;
  role: string;
  created_at: string;
}

const PAGE_SIZE = 10;

const AdminUsers = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [deleteDialog, setDeleteDialog] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    const { response } = await apiCall({
      method: 'GET',
      url: `${ENDPOINTS.ADMIN.USERS}?page=${page}&page_size=${PAGE_SIZE}&search=${encodeURIComponent(search)}`,
    });
    if (response?.status === 200) {
      setUsers(response.data.data.users ?? []);
      setTotal(response.data.data.total ?? 0);
    }
    setLoading(false);
  }, [page, search]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSearch = () => {
    setSearch(searchInput);
    setPage(1);
  };

  const handleMenuOpen = (e: React.MouseEvent<HTMLElement>, user: AdminUser) => {
    setAnchorEl(e.currentTarget);
    setSelectedUser(user);
  };

  const handleMenuClose = () => setAnchorEl(null);

  const handleToggleRole = async () => {
    if (!selectedUser) return;
    handleMenuClose();
    const newRole = selectedUser.role === 'SUPERADMIN' ? 'USER' : 'SUPERADMIN';
    const { response } = await apiCall({
      method: 'PUT',
      url: ENDPOINTS.ADMIN.UPDATE_USER_ROLE(selectedUser.id),
      payload: { role: newRole },
    });
    if (response?.status === 200) {
      enqueueSnackbar(`Đã cập nhật role thành ${newRole}`, { variant: 'success' });
      fetchUsers();
    } else {
      enqueueSnackbar('Lỗi khi cập nhật role', { variant: 'error' });
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedUser) return;
    setDeleting(true);
    const { response, error } = await apiCall({
      method: 'DELETE',
      url: ENDPOINTS.ADMIN.DELETE_USER(selectedUser.id),
    });
    setDeleting(false);
    setDeleteDialog(false);

    if (response?.status === 200 || response?.status === 204) {
      enqueueSnackbar('Đã xóa người dùng', { variant: 'success' });
      fetchUsers();
    } else {
      const msg = response?.data?.error || error || 'Lỗi khi xóa người dùng';
      enqueueSnackbar(String(msg), { variant: 'error' });
    }
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="caption" color="text.secondary">
        Admin / Quản lý người dùng
      </Typography>

      <Box sx={{ mt: 1, mb: 3 }}>
        <Typography variant="h4" color="#111814">Quản lý Người dùng</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Quản lý tài khoản, phân quyền người dùng trên nền tảng.
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <Card sx={{ px: 3, py: 2, borderRadius: 3, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
          <Typography variant="caption" color="text.secondary">Tổng người dùng</Typography>
          <Typography variant="h5">{total.toLocaleString()}</Typography>
        </Card>
      </Box>

      <Card sx={{ borderRadius: 3, boxShadow: '0 1px 4px rgba(0,0,0,0.08)', mb: 2 }}>
        <Box sx={{ p: 2, display: 'flex', gap: 2 }}>
          <TextField
            placeholder="Tìm theo tên, email..."
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
                <TableCell sx={{ color: '#64748b', fontSize: 12 }}>NGƯỜI DÙNG</TableCell>
                <TableCell sx={{ color: '#64748b', fontSize: 12 }}>ROLE</TableCell>
                <TableCell sx={{ color: '#64748b', fontSize: 12 }}>NGÀY THAM GIA</TableCell>
                <TableCell sx={{ color: '#64748b', fontSize: 12 }} align="right">THAO TÁC</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 6 }}>
                    <CircularProgress sx={{ color: '#19e66b' }} />
                  </TableCell>
                </TableRow>
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 6, color: '#94a3b8' }}>
                    Không tìm thấy người dùng nào
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar
                          src={user.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.full_name || 'U')}`}
                          sx={{ width: 36, height: 36 }}
                        />
                        <Box>
                          <Typography variant="body2">{user.full_name || '—'}</Typography>
                          <Typography variant="caption" color="text.secondary">{user.email}</Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={user.role === 'SUPERADMIN' ? 'Administrator' : 'Member'}
                        size="small"
                        sx={{
                          bgcolor: user.role === 'SUPERADMIN' ? '#dcfce7' : '#eff6ff',
                          color: user.role === 'SUPERADMIN' ? '#16a34a' : '#3b82f6',
                          fontSize: 11,
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {dayjs(user.created_at).format('DD/MM/YYYY')}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <IconButton size="small" onClick={(e) => handleMenuOpen(e, user)}>
                        <MoreVert fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
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

      {/* Action menu */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuItem onClick={handleToggleRole}>
          {selectedUser?.role === 'SUPERADMIN' ? (
            <><PersonOutline fontSize="small" sx={{ mr: 1 }} /> Hạ xuống Member</>
          ) : (
            <><AdminPanelSettings fontSize="small" sx={{ mr: 1 }} /> Nâng lên Admin</>
          )}
        </MenuItem>
        <MenuItem
          onClick={() => { handleMenuClose(); setDeleteDialog(true); }}
          sx={{ color: 'error.main' }}
        >
          <Delete fontSize="small" sx={{ mr: 1 }} /> Xóa người dùng
        </MenuItem>
      </Menu>

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
          <Typography variant="h6" sx={{ mb: 1 }}>Xóa người dùng?</Typography>
          <Typography variant="body2" color="text.secondary">
            Bạn sắp xóa tài khoản{' '}
            <strong style={{ color: '#111814' }}>{selectedUser?.full_name || selectedUser?.email}</strong>.
            Hành động này không thể hoàn tác.
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
            {deleting ? <CircularProgress size={18} color="inherit" /> : 'Xóa'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminUsers;
