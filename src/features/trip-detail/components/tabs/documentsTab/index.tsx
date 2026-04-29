import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import { useParams } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { v4 as uuidv4 } from 'uuid';

import { useAppDispatch, useAppSelector } from '@/app/store';
import { deleteDocumentAction, fetchDocumentsAction } from '@/features/trip-detail/redux/action';
import { supabase } from '@/config/supabase';
import { apiCall } from '@/config/api';
import { ENDPOINTS } from '@/config/api/endpoint';

// Icons
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import ImageIcon from '@mui/icons-material/Image';
import TableChartIcon from '@mui/icons-material/TableChart';
import ArticleIcon from '@mui/icons-material/Article';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';

// ─── Constants ────────────────────────────────────────────────────────────────

const ACCEPTED_TYPES = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'image/gif',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword'];

const ACCEPTED_EXTENSIONS = '.pdf,.jpg,.jpeg,.png,.gif,.xlsx,.xls,.docx,.doc';
const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB

const CATEGORIES = ['Vé máy bay', 'Khách sạn', 'Visa', 'Bảo hiểm', 'Khác'];

const CATEGORY_COLORS: Record<string, string> = {
  'Vé máy bay': '#dbeafe',
  'Khách sạn': '#dcfce7',
  'Visa': '#fef9c3',
  'Bảo hiểm': '#fce7f3',
  'Khác': '#f1f5f9',
};

const CATEGORY_TEXT_COLORS: Record<string, string> = {
  'Vé máy bay': '#1d4ed8',
  'Khách sạn': '#15803d',
  'Visa': '#a16207',
  'Bảo hiểm': '#be185d',
  'Khác': '#475569',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function getFileIcon(fileType: string) {
  const t = fileType?.toLowerCase() ?? '';
  if (t.includes('pdf')) return <PictureAsPdfIcon sx={{ fontSize: 36, color: '#ef4444' }} />;
  if (t.includes('image') || t.includes('jpg') || t.includes('jpeg') || t.includes('png') || t.includes('gif'))
    return <ImageIcon sx={{ fontSize: 36, color: '#3b82f6' }} />;
  if (t.includes('excel') || t.includes('xlsx') || t.includes('xls') || t.includes('spreadsheet'))
    return <TableChartIcon sx={{ fontSize: 36, color: '#22c55e' }} />;
  if (t.includes('word') || t.includes('docx') || t.includes('doc') || t.includes('wordprocessing'))
    return <ArticleIcon sx={{ fontSize: 36, color: '#60a5fa' }} />;
  return <InsertDriveFileIcon sx={{ fontSize: 36, color: '#94a3b8' }} />;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function DocumentsTab() {
  const { id: groupId } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const { enqueueSnackbar } = useSnackbar();

  const { documents, documentsLoading, documentsError, myRole } = useAppSelector((state: any) => state.tripDetail);
  const { profile } = useAppSelector((state: any) => state.groups);

  // Upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filter state
  const [filterCategory, setFilterCategory] = useState<string>('Tất cả');

  // Delete confirm state
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; docId: number | null; docName: string }>({
    open: false,
    docId: null,
    docName: '',
  });

  // Fetch on mount
  useEffect(() => {
    if (groupId) dispatch(fetchDocumentsAction(groupId) as any);
  }, [groupId, dispatch]);

  // ─── File validation ────────────────────────────────────────────────────────

  const validateFile = (file: File): string | null => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      return `Định dạng file không được hỗ trợ. Chấp nhận: PDF, JPG, PNG, GIF, XLSX, XLS, DOCX, DOC`;
    }
    if (file.size > MAX_FILE_SIZE) {
      return `File quá lớn. Kích thước tối đa là 20MB (file của bạn: ${formatFileSize(file.size)})`;
    }
    return null;
  };

  const handleFileSelect = (file: File) => {
    const err = validateFile(file);
    if (err) {
      enqueueSnackbar(err, { variant: 'error', autoHideDuration: 4000 });
      return;
    }
    setSelectedFile(file);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
    // Reset input so same file can be re-selected
    e.target.value = '';
  };

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileSelect(file);
  }, []);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => setDragOver(false);

  // ─── Upload ─────────────────────────────────────────────────────────────────

  const handleUpload = async () => {
    if (!selectedFile || !selectedCategory || !groupId) return;

    setUploading(true);
    try {
      // 1. Build file path — dùng UUID prefix để tránh trùng tên, giữ nguyên tên gốc tiếng Việt
      const filePath = `groups/${groupId}/${uuidv4()}_${selectedFile.name}`;

      // 2. Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('trip_sync_storage')
        .upload(filePath, selectedFile, { upsert: false });

      if (uploadError) {
        enqueueSnackbar(`Lỗi khi tải file lên: ${uploadError.message}`, { variant: 'error', autoHideDuration: 4000 });
        return;
      }

      // 3. Get public URL
      const { data: urlData } = supabase.storage.from('trip_sync_storage').getPublicUrl(filePath);
      const publicUrl = urlData.publicUrl;

      // Lấy extension từ tên file
      const ext = selectedFile.name.split('.').pop()?.toLowerCase() ?? '';

      // 4. Save metadata to BE
      const { response, error: apiError } = await apiCall({
        method: 'POST',
        url: ENDPOINTS.DOCUMENT.CREATE(groupId),
        payload: {
          file_name: selectedFile.name,
          file_url: publicUrl,
          file_type: ext?.toUpperCase() ?? selectedFile.type,
          file_size: selectedFile.size,
          category: selectedCategory,
        },
      });

      if (response?.status === 201) {
        enqueueSnackbar('Tải tài liệu lên thành công!', { variant: 'success', autoHideDuration: 3000 });
        setSelectedFile(null);
        setSelectedCategory('');
        dispatch(fetchDocumentsAction(groupId) as any);
      } else {
        enqueueSnackbar(apiError || 'Lỗi khi lưu thông tin tài liệu', { variant: 'error', autoHideDuration: 4000 });
      }
    } catch (err: any) {
      enqueueSnackbar(err.message || 'Lỗi hệ thống', { variant: 'error', autoHideDuration: 4000 });
    } finally {
      setUploading(false);
    }
  };

  // ─── Delete ──────────────────────────────────────────────────────────────────

  const handleDeleteConfirm = () => {
    if (!deleteConfirm.docId || !groupId) return;
    dispatch(
      deleteDocumentAction(
        groupId,
        deleteConfirm.docId,
        () => {
          enqueueSnackbar('Đã xóa tài liệu thành công', { variant: 'success', autoHideDuration: 3000 });
          setDeleteConfirm({ open: false, docId: null, docName: '' });
        },
        (msg) => {
          enqueueSnackbar(msg, { variant: 'error', autoHideDuration: 4000 });
          setDeleteConfirm({ open: false, docId: null, docName: '' });
        },
      ) as any,
    );
  };

  // ─── Derived data ────────────────────────────────────────────────────────────

  const filteredDocs = filterCategory === 'Tất cả'
    ? documents
    : documents.filter((d: any) => d.category === filterCategory);

  const availableCategories = ['Tất cả', ...Array.from(new Set(documents.map((d: any) => d.category as string))) as string[]];

  const canDelete = (doc: any) =>
    profile?.id === doc.uploaded_by_id || myRole === 'ADMIN';

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <Box>
      {/* ── Upload Area ── */}
      <Card
        sx={{
          borderRadius: 4,
          border: 'none',
          boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
          p: 3,
          mb: 3,
        }}
      >
        <Typography variant="h6" fontWeight={700} mb={2}>
          Tải tài liệu lên
        </Typography>

        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="flex-start">
          {/* DropZone */}
          <Box
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
            sx={{
              flex: 1,
              border: `2px dashed ${dragOver ? '#22c55e' : selectedFile ? '#22c55e' : '#cbd5e1'}`,
              borderRadius: 3,
              p: 3,
              textAlign: 'center',
              cursor: 'pointer',
              bgcolor: dragOver ? '#f0fdf4' : selectedFile ? '#f0fdf4' : '#f8fafc',
              transition: 'all 0.2s',
              '&:hover': { borderColor: '#22c55e', bgcolor: '#f0fdf4' },
              minHeight: 100,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1,
            }}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPTED_EXTENSIONS}
              style={{ display: 'none' }}
              onChange={handleInputChange}
            />
            <CloudUploadIcon sx={{ fontSize: 36, color: selectedFile ? '#22c55e' : '#94a3b8' }} />
            {selectedFile ? (
              <Box>
                <Typography variant="body2" fontWeight={700} color="#16a34a">
                  {selectedFile.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {formatFileSize(selectedFile.size)}
                </Typography>
              </Box>
            ) : (
              <Box>
                <Typography variant="body2" fontWeight={600} color="text.secondary">
                  Kéo thả file vào đây hoặc click để chọn
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  PDF, JPG, PNG, GIF, XLSX, DOCX — tối đa 20MB
                </Typography>
              </Box>
            )}
          </Box>

          {/* Category + Upload button */}
          <Stack spacing={2} sx={{ minWidth: 200 }}>
            <FormControl size="small" fullWidth>
              <InputLabel>Danh mục</InputLabel>
              <Select
                value={selectedCategory}
                label="Danh mục"
                onChange={(e) => setSelectedCategory(e.target.value)}
                sx={{ borderRadius: 2 }}
              >
                {CATEGORIES.map((cat) => (
                  <MenuItem key={cat} value={cat}>
                    {cat}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Button
              variant="contained"
              disabled={!selectedFile || !selectedCategory || uploading}
              onClick={handleUpload}
              disableElevation
              startIcon={uploading ? <CircularProgress size={16} sx={{ color: '#fff' }} /> : <CloudUploadIcon />}
              sx={{
                bgcolor: '#22c55e',
                color: '#fff',
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 700,
                py: 1,
                '&:hover': { bgcolor: '#16a34a' },
                '&:disabled': { bgcolor: '#e2e8f0', color: '#94a3b8' },
              }}
            >
              {uploading ? 'Đang tải lên...' : 'Tải lên'}
            </Button>
          </Stack>
        </Stack>
      </Card>

      {/* ── Filter chips ── */}
      {documents.length > 0 && (
        <Stack direction="row" spacing={1} flexWrap="wrap" mb={3} useFlexGap>
          {availableCategories.map((cat) => (
            <Chip
              key={cat}
              label={cat}
              onClick={() => setFilterCategory(cat)}
              variant={filterCategory === cat ? 'filled' : 'outlined'}
              sx={{
                borderRadius: 2,
                fontWeight: 600,
                bgcolor: filterCategory === cat ? '#22c55e' : 'transparent',
                color: filterCategory === cat ? '#fff' : '#475569',
                borderColor: '#e2e8f0',
                '&:hover': { bgcolor: filterCategory === cat ? '#16a34a' : '#f1f5f9' },
              }}
            />
          ))}
        </Stack>
      )}

      {/* ── Loading ── */}
      {documentsLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress sx={{ color: '#22c55e' }} />
        </Box>
      )}

      {/* ── Error ── */}
      {documentsError && !documentsLoading && (
        <Alert severity="error" sx={{ borderRadius: 3, mb: 2 }}>
          {documentsError}
        </Alert>
      )}

      {/* ── Empty state ── */}
      {!documentsLoading && !documentsError && documents.length === 0 && (
        <Card
          sx={{
            borderRadius: 4,
            border: 'none',
            boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
            p: 8,
            textAlign: 'center',
            bgcolor: '#f8fafc',
          }}
        >
          <Stack alignItems="center" spacing={2}>
            <FolderOpenIcon sx={{ fontSize: 80, color: '#cbd5e1' }} />
            <Box>
              <Typography variant="h6" color="text.primary">
                Chưa có tài liệu nào
              </Typography>
              <Typography variant="body2" color="text.secondary" mt={0.5}>
                Hãy tải lên vé máy bay, xác nhận khách sạn, visa hoặc các tài liệu chuyến đi khác.
              </Typography>
            </Box>
          </Stack>
        </Card>
      )}

      {/* ── Document grid ── */}
      {!documentsLoading && filteredDocs.length > 0 && (
        <Box sx={{ maxHeight: 600, overflowY: 'auto', pr: 0.5 }}>
        <Grid container spacing={2}>
          {filteredDocs.map((doc: any) => (
            <Grid key={doc.id} size={{ xs: 12, sm: 6, md: 4 }}>
              <Card
                sx={{
                  borderRadius: 3,
                  border: 'none',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                  p: 2.5,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1.5,
                  transition: 'box-shadow 0.2s',
                  '&:hover': { boxShadow: '0 4px 20px rgba(0,0,0,0.1)' },
                }}
              >
                {/* Icon + Name */}
                <Stack direction="row" alignItems="flex-start" spacing={1.5}>
                  <Box sx={{ flexShrink: 0, mt: 0.25 }}>{getFileIcon(doc.file_type)}</Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Tooltip title={doc.file_name} placement="top">
                      <Typography
                        variant="subtitle2"
                        fontWeight={700}
                        sx={{
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          color: '#0f172a',
                        }}
                      >
                        {doc.file_name}
                      </Typography>
                    </Tooltip>
                    <Chip
                      label={doc.category}
                      size="small"
                      sx={{
                        mt: 0.5,
                        borderRadius: 1.5,
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        bgcolor: CATEGORY_COLORS[doc.category] ?? '#f1f5f9',
                        color: CATEGORY_TEXT_COLORS[doc.category] ?? '#475569',
                      }}
                    />
                  </Box>
                </Stack>

                {/* Uploader */}
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Avatar
                    src={doc.uploaded_by?.avatar}
                    sx={{ width: 24, height: 24, fontSize: '0.7rem' }}
                  >
                    {doc.uploaded_by?.full_name?.[0]}
                  </Avatar>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    {doc.uploaded_by?.full_name ?? 'Không rõ'}
                  </Typography>
                </Stack>

                {/* Meta */}
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="caption" color="text.secondary">
                    {formatFileSize(doc.file_size)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {formatDate(doc.created_at)}
                  </Typography>
                </Stack>

                {/* Actions */}
                <Stack direction="row" spacing={1} mt="auto">
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<OpenInNewIcon />}
                    href={doc.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{
                      flex: 1,
                      borderRadius: 2,
                      textTransform: 'none',
                      fontWeight: 600,
                      color: '#3b82f6',
                      borderColor: '#bfdbfe',
                      '&:hover': { bgcolor: '#eff6ff', borderColor: '#93c5fd' },
                    }}
                  >
                    Mở
                  </Button>

                  {canDelete(doc) && (
                    <IconButton
                      size="small"
                      onClick={() =>
                        setDeleteConfirm({ open: true, docId: doc.id, docName: doc.file_name })
                      }
                      sx={{
                        color: '#ef4444',
                        border: '1px solid #fecaca',
                        borderRadius: 2,
                        '&:hover': { bgcolor: '#fef2f2', borderColor: '#fca5a5' },
                      }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  )}
                </Stack>
              </Card>
            </Grid>
          ))}
        </Grid>
        </Box>
      )}

      {/* ── Delete confirm dialog ── */}
      <Dialog
        open={deleteConfirm.open}
        onClose={() => setDeleteConfirm({ open: false, docId: null, docName: '' })}
        sx={{ '& .MuiDialog-paper': { borderRadius: 4, minWidth: { xs: 300, sm: 400 } } }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Xác nhận xóa</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: 'text.secondary' }}>
            Bạn có chắc chắn muốn xóa tài liệu{' '}
            <b>"{deleteConfirm.docName}"</b>? Hành động này không thể hoàn tác.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button
            onClick={() => setDeleteConfirm({ open: false, docId: null, docName: '' })}
            sx={{ color: '#64748b', fontWeight: 600, textTransform: 'none' }}
          >
            Hủy
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            variant="contained"
            disableElevation
            sx={{
              bgcolor: '#ef4444',
              color: '#fff',
              borderRadius: 2,
              fontWeight: 700,
              textTransform: 'none',
              '&:hover': { bgcolor: '#dc2626' },
            }}
          >
            Xóa ngay
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
