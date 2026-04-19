import React, { useState, useRef, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  TextField,
  Button,
  Avatar,
  IconButton,
  Tabs,
  Tab,
  CircularProgress,
  InputAdornment,
  Stack,
  Divider,
} from '@mui/material';
import {
  Close,
  CameraAlt,
  Visibility,
  VisibilityOff,
  Person,
  Lock,
  CheckCircle,
} from '@mui/icons-material';
import { useDispatch } from 'react-redux';
import { useSnackbar } from 'notistack';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { supabase } from '@/config/supabase';
import { updateProfileAction, changePasswordAction } from '../redux/action';
import { useAppSelector } from '@/app/store';
import { Profile } from '@/models/profile';

// ─── Props ───────────────────────────────────────────────────────────────────
interface EditProfileModalProps {
  open: boolean;
  onClose: () => void;
}

// ─── Component ───────────────────────────────────────────────────────────────
const EditProfileModal: React.FC<EditProfileModalProps> = ({ open, onClose }) => {
  const dispatch = useDispatch<any>();
  const { enqueueSnackbar } = useSnackbar();
  const { profile, loading } = useAppSelector((state) => state.groups) as {
    profile: Profile | null;
    loading: boolean;
  };

  const [activeTab, setActiveTab] = useState(0);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [showOldPass, setShowOldPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Profile form ────────────────────────────────────────────────────────────
  const profileSchema = yup.object({
    fullName: yup.string().required('Vui lòng nhập họ tên').min(2, 'Tên quá ngắn'),
  });

  const profileFormik = useFormik({
    enableReinitialize: true,
    initialValues: {
      fullName: profile?.full_name || '',
    },
    validationSchema: profileSchema,
    onSubmit: async (values) => {
      let avatarUrl = '';

      // Upload avatar lên Supabase nếu người dùng chọn file mới
      if (avatarFile) {
        setUploadingAvatar(true);
        try {
          const ext = avatarFile.name.split('.').pop();
          const fileName = `avatars/${profile?.id ?? 'user'}_${Date.now()}.${ext}`;
          const { error: uploadError } = await supabase.storage
            .from('trip_sync_storage')
            .upload(fileName, avatarFile, { upsert: true });

          if (uploadError) throw new Error(uploadError.message);

          const { data: urlData } = supabase.storage
            .from('trip_sync_storage')
            .getPublicUrl(fileName);
          avatarUrl = urlData.publicUrl;
        } catch (err: any) {
          enqueueSnackbar('Lỗi khi tải ảnh lên: ' + err.message, { variant: 'error' });
          setUploadingAvatar(false);
          return;
        } finally {
          setUploadingAvatar(false);
        }
      }

      dispatch(
        updateProfileAction(
          { fullName: values.fullName, ...(avatarUrl ? { avatarUrl } : {}) },
          () => {
            enqueueSnackbar('Cập nhật hồ sơ thành công! 🎉', { variant: 'success' });
            setAvatarFile(null);
            setAvatarPreview(null);
            onClose();
          },
          (msg) => enqueueSnackbar('Lỗi: ' + msg, { variant: 'error' })
        )
      );
    },
  });

  // ── Password form ───────────────────────────────────────────────────────────
  const passwordSchema = yup.object({
    oldPassword: yup.string().required('Nhập mật khẩu cũ').min(6, 'Tối thiểu 6 ký tự'),
    newPassword: yup
      .string()
      .required('Nhập mật khẩu mới')
      .min(6, 'Tối thiểu 6 ký tự')
      .notOneOf([yup.ref('oldPassword')], 'Mật khẩu mới không được giống mật khẩu cũ'),
    confirmPassword: yup
      .string()
      .required('Xác nhận mật khẩu mới')
      .oneOf([yup.ref('newPassword')], 'Mật khẩu xác nhận không khớp'),
  });

  const passwordFormik = useFormik({
    initialValues: {
      oldPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
    validationSchema: passwordSchema,
    onSubmit: (values, { resetForm }) => {
      dispatch(
        changePasswordAction(
          { oldPassword: values.oldPassword, newPassword: values.newPassword },
          () => {
            enqueueSnackbar('Đổi mật khẩu thành công! 🔐', { variant: 'success' });
            resetForm();
            onClose();
          },
          (msg) => enqueueSnackbar('Lỗi: ' + msg, { variant: 'error' })
        )
      );
    },
  });

  // ── Xử lý chọn file avatar ──────────────────────────────────────────────────
  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      enqueueSnackbar('Vui lòng chọn file ảnh!', { variant: 'warning' });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      enqueueSnackbar('Ảnh không được vượt quá 5MB!', { variant: 'warning' });
      return;
    }
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  }, [enqueueSnackbar]);

  const handleClose = () => {
    setAvatarFile(null);
    setAvatarPreview(null);
    profileFormik.resetForm();
    passwordFormik.resetForm();
    setActiveTab(0);
    onClose();
  };

  // ── currentAvatar để hiển thị ───────────────────────────────────────────────
  const currentAvatar =
    avatarPreview ||
    profile?.avatar ||
    `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
      profile?.full_name || profile?.email || 'User'
    )}&backgroundColor=0f766e`;

  const isProfileLoading = loading && activeTab === 0;
  const isPasswordLoading = loading && activeTab === 1;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          overflow: 'hidden',
        },
      }}
    >
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <DialogTitle
        sx={{
          background: 'linear-gradient(135deg, #0f766e 0%, #19e66b 100%)',
          color: 'white',
          py: 2.5,
          px: 3,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Typography variant="h6" fontWeight={700}>
          Chỉnh sửa hồ sơ
        </Typography>
        <IconButton onClick={handleClose} sx={{ color: 'white' }} size="small">
          <Close />
        </IconButton>
      </DialogTitle>

      {/* ── Tabs ───────────────────────────────────────────────────────────── */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: '#f8fafc' }}>
        <Tabs
          value={activeTab}
          onChange={(_, v) => setActiveTab(v)}
          TabIndicatorProps={{ style: { backgroundColor: '#19e66b', height: 3 } }}
          sx={{ px: 2 }}
        >
          <Tab
            icon={<Person fontSize="small" />}
            iconPosition="start"
            label="Thông tin"
            sx={{ textTransform: 'none', fontWeight: 600, '&.Mui-selected': { color: '#0f766e' } }}
          />
          <Tab
            icon={<Lock fontSize="small" />}
            iconPosition="start"
            label="Mật khẩu"
            sx={{ textTransform: 'none', fontWeight: 600, '&.Mui-selected': { color: '#0f766e' } }}
          />
        </Tabs>
      </Box>

      <DialogContent sx={{ p: 3, bgcolor: 'white' }}>
        {/* ══════════════════ TAB 0: THÔNG TIN ══════════════════════════════ */}
        {activeTab === 0 && (
          <form id="profile-form" onSubmit={profileFormik.handleSubmit}>
            <Stack spacing={3}>
              {/* Avatar picker */}
              <Box display="flex" flexDirection="column" alignItems="center" gap={1.5}>
                <Box position="relative" sx={{ cursor: 'pointer' }} onClick={() => fileInputRef.current?.click()}>
                  <Avatar
                    src={currentAvatar}
                    sx={{
                      width: 100,
                      height: 100,
                      border: '4px solid',
                      borderColor: avatarPreview ? '#19e66b' : '#e2e8f0',
                      transition: 'border-color 0.2s',
                      boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
                    }}
                  />
                  {/* Overlay camera icon */}
                  <Box
                    sx={{
                      position: 'absolute',
                      inset: 0,
                      borderRadius: '50%',
                      bgcolor: 'rgba(0,0,0,0.45)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      opacity: 0,
                      transition: 'opacity 0.2s',
                      '&:hover': { opacity: 1 },
                    }}
                  >
                    <CameraAlt sx={{ color: 'white', fontSize: 28 }} />
                  </Box>
                  {/* Badge "đã chọn" */}
                  {avatarPreview && (
                    <Box
                      sx={{
                        position: 'absolute',
                        bottom: 2,
                        right: 2,
                        bgcolor: '#19e66b',
                        borderRadius: '50%',
                        width: 22,
                        height: 22,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                      }}
                    >
                      <CheckCircle sx={{ color: 'white', fontSize: 16 }} />
                    </Box>
                  )}
                </Box>
                <Typography variant="caption" color="text.secondary">
                  Nhấp vào ảnh để thay đổi · Tối đa 5MB
                </Typography>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={handleFileChange}
                />
              </Box>

              <Divider />

              {/* Email — chỉ đọc */}
              <Box>
                <Typography variant="subtitle2" fontWeight={600} mb={0.5} color="text.secondary">
                  Email (không thể thay đổi)
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  value={profile?.email || ''}
                  disabled
                  sx={{ '& .MuiInputBase-root': { bgcolor: '#f1f5f9' } }}
                />
              </Box>

              {/* Họ tên */}
              <Box>
                <Typography variant="subtitle2" fontWeight={600} mb={0.5}>
                  Họ và tên
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  id="fullName"
                  name="fullName"
                  placeholder="Nhập họ và tên"
                  value={profileFormik.values.fullName}
                  onChange={profileFormik.handleChange}
                  onBlur={profileFormik.handleBlur}
                  error={profileFormik.touched.fullName && Boolean(profileFormik.errors.fullName)}
                  helperText={profileFormik.touched.fullName && profileFormik.errors.fullName}
                />
              </Box>
            </Stack>
          </form>
        )}

        {/* ══════════════════ TAB 1: MẬT KHẨU ══════════════════════════════ */}
        {activeTab === 1 && (
          <form id="password-form" onSubmit={passwordFormik.handleSubmit}>
            <Stack spacing={2.5}>
              <Box
                sx={{
                  p: 2,
                  bgcolor: '#f0fdf4',
                  borderRadius: 2,
                  border: '1px solid #86efac',
                }}
              >
                <Typography variant="body2" color="#166534">
                  💡 Mật khẩu mới phải có ít nhất <strong>6 ký tự</strong> và khác mật khẩu cũ.
                </Typography>
              </Box>

              {/* Mật khẩu cũ */}
              <Box>
                <Typography variant="subtitle2" fontWeight={600} mb={0.5}>
                  Mật khẩu hiện tại
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  id="oldPassword"
                  name="oldPassword"
                  type={showOldPass ? 'text' : 'password'}
                  placeholder="Nhập mật khẩu hiện tại"
                  value={passwordFormik.values.oldPassword}
                  onChange={passwordFormik.handleChange}
                  onBlur={passwordFormik.handleBlur}
                  error={passwordFormik.touched.oldPassword && Boolean(passwordFormik.errors.oldPassword)}
                  helperText={passwordFormik.touched.oldPassword && passwordFormik.errors.oldPassword}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton size="small" onClick={() => setShowOldPass((v) => !v)}>
                          {showOldPass ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>

              {/* Mật khẩu mới */}
              <Box>
                <Typography variant="subtitle2" fontWeight={600} mb={0.5}>
                  Mật khẩu mới
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  id="newPassword"
                  name="newPassword"
                  type={showNewPass ? 'text' : 'password'}
                  placeholder="Nhập mật khẩu mới"
                  value={passwordFormik.values.newPassword}
                  onChange={passwordFormik.handleChange}
                  onBlur={passwordFormik.handleBlur}
                  error={passwordFormik.touched.newPassword && Boolean(passwordFormik.errors.newPassword)}
                  helperText={passwordFormik.touched.newPassword && passwordFormik.errors.newPassword}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton size="small" onClick={() => setShowNewPass((v) => !v)}>
                          {showNewPass ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>

              {/* Xác nhận mật khẩu mới */}
              <Box>
                <Typography variant="subtitle2" fontWeight={600} mb={0.5}>
                  Xác nhận mật khẩu mới
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPass ? 'text' : 'password'}
                  placeholder="Nhập lại mật khẩu mới"
                  value={passwordFormik.values.confirmPassword}
                  onChange={passwordFormik.handleChange}
                  onBlur={passwordFormik.handleBlur}
                  error={passwordFormik.touched.confirmPassword && Boolean(passwordFormik.errors.confirmPassword)}
                  helperText={passwordFormik.touched.confirmPassword && passwordFormik.errors.confirmPassword}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton size="small" onClick={() => setShowConfirmPass((v) => !v)}>
                          {showConfirmPass ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>
            </Stack>
          </form>
        )}
      </DialogContent>

      {/* ── Actions ────────────────────────────────────────────────────────── */}
      <DialogActions
        sx={{ px: 3, pb: 2.5, gap: 1, bgcolor: '#f8fafc', borderTop: '1px solid #e2e8f0' }}
      >
        <Button
          onClick={handleClose}
          variant="outlined"
          sx={{ borderColor: '#e2e8f0', color: '#64748b', textTransform: 'none', fontWeight: 600 }}
        >
          Huỷ
        </Button>
        <Button
          type="submit"
          form={activeTab === 0 ? 'profile-form' : 'password-form'}
          variant="contained"
          disabled={isProfileLoading || isPasswordLoading || uploadingAvatar}
          sx={{
            bgcolor: '#19e66b',
            color: '#111814',
            textTransform: 'none',
            fontWeight: 700,
            minWidth: 120,
            '&:hover': { bgcolor: '#16d360' },
            '&.Mui-disabled': { bgcolor: '#a7f3c9', color: '#fff' },
          }}
          startIcon={
            (isProfileLoading || isPasswordLoading || uploadingAvatar) ? (
              <CircularProgress size={16} sx={{ color: 'inherit' }} />
            ) : null
          }
        >
          {uploadingAvatar
            ? 'Đang tải ảnh...'
            : isProfileLoading || isPasswordLoading
            ? 'Đang lưu...'
            : activeTab === 0
            ? 'Lưu thay đổi'
            : 'Đổi mật khẩu'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditProfileModal;
