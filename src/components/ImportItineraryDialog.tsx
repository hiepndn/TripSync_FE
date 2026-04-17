import { useEffect, useRef, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  CircularProgress,
  Box,
  Stack,
  Tabs,
  Tab,
} from '@mui/material';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import { apiCall } from '@/config/api';
import { ENDPOINTS } from '@/config/api/endpoint';
import { useSnackbar } from 'notistack';

// ─── Types ───────────────────────────────────────────────────────────────────

interface Group {
  id: number;
  name: string;
  role?: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  sourceGroupId?: number;
  onSuccess: (count: number) => void;
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function ImportItineraryDialog({ open, onClose, sourceGroupId, onSuccess }: Props) {
  const { enqueueSnackbar } = useSnackbar();

  // Tab: 0 = chọn nhóm nguồn, 1 = import file JSON
  const [activeTab, setActiveTab] = useState(0);

  // Groups
  const [groups, setGroups] = useState<Group[]>([]);
  const [loadingGroups, setLoadingGroups] = useState(false);

  // Tab 0 state
  const [selectedSource, setSelectedSource] = useState<number | ''>('');
  const [selectedTarget, setSelectedTarget] = useState<number | ''>('');

  // Tab 1 state
  const [jsonFile, setJsonFile] = useState<File | null>(null);
  const [jsonTarget, setJsonTarget] = useState<number | ''>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);

  // Fetch groups on open
  useEffect(() => {
    if (!open) return;
    const fetchGroups = async () => {
      setLoadingGroups(true);
      try {
        const { response } = await apiCall({ method: 'GET', url: ENDPOINTS.GROUP.CREATE });
        if (response?.status === 200) setGroups(response.data?.data ?? []);
      } finally {
        setLoadingGroups(false);
      }
    };
    fetchGroups();
  }, [open]);

  // Reset on open
  useEffect(() => {
    if (open) {
      setActiveTab(0);
      setSelectedSource(sourceGroupId ?? '');
      setSelectedTarget('');
      setJsonFile(null);
      setJsonTarget('');
      setImportError(null);
    }
  }, [open, sourceGroupId]);

  // Derived
  const effectiveSourceId = sourceGroupId ?? (selectedSource !== '' ? selectedSource : undefined);
  const adminGroups = groups.filter((g) => g.role === 'ADMIN');
  const targetOptions0 = adminGroups.filter((g) => g.id !== effectiveSourceId);
  const sourceOptions = groups.filter((g) => g.id !== (selectedTarget !== '' ? selectedTarget : undefined));
  const targetOptions1 = adminGroups;

  const canConfirmTab0 =
    !importing &&
    effectiveSourceId !== undefined &&
    selectedTarget !== '' &&
    effectiveSourceId !== selectedTarget;

  const canConfirmTab1 = !importing && jsonFile !== null && jsonTarget !== '';

  // ── Handlers ──

  const handleConfirmTab0 = async () => {
    if (!canConfirmTab0) return;
    setImporting(true);
    setImportError(null);
    try {
      const { response } = await apiCall({
        method: 'POST',
        url: ENDPOINTS.ACTIVITY.IMPORT(selectedTarget as number),
        payload: { source_group_id: effectiveSourceId },
      });
      if (response?.status === 200) {
        onSuccess(response.data?.imported_count ?? 0);
        onClose();
      } else {
        const msg = response?.data?.error ?? 'Import thất bại.';
        setImportError(msg);
      }
    } catch {
      setImportError('Lỗi kết nối.');
    } finally {
      setImporting(false);
    }
  };

  const handleConfirmTab1 = async () => {
    if (!canConfirmTab1 || !jsonFile) return;
    setImporting(true);
    setImportError(null);
    try {
      const text = await jsonFile.text();
      const parsed = JSON.parse(text);
      // Support both { activities: [...] } and [...] directly
      const activities = Array.isArray(parsed)
        ? parsed
        : parsed?.data?.activities ?? parsed?.activities ?? [];

      if (!Array.isArray(activities) || activities.length === 0) {
        setImportError('File JSON không hợp lệ hoặc không có hoạt động nào.');
        setImporting(false);
        return;
      }

      const { response } = await apiCall({
        method: 'POST',
        url: ENDPOINTS.ACTIVITY.IMPORT_JSON(jsonTarget as number),
        payload: { activities },
      });
      if (response?.status === 200) {
        onSuccess(response.data?.imported_count ?? 0);
        onClose();
      } else {
        const msg = response?.data?.error ?? 'Import thất bại.';
        setImportError(msg);
      }
    } catch {
      setImportError('File JSON không hợp lệ hoặc lỗi kết nối.');
    } finally {
      setImporting(false);
    }
  };

  const canConfirm = activeTab === 0 ? canConfirmTab0 : canConfirmTab1;
  const handleConfirm = activeTab === 0 ? handleConfirmTab0 : handleConfirmTab1;

  return (
    <Dialog
      open={open}
      onClose={() => !importing && onClose()}
      maxWidth="sm"
      fullWidth
      slotProps={{ paper: { sx: { borderRadius: 4, p: 1 } } }}
    >
      <DialogTitle>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Box sx={{ width: 40, height: 40, bgcolor: '#f0fdf4', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FileDownloadIcon sx={{ color: '#16a34a' }} />
          </Box>
          <Typography variant="h6" fontWeight={700}>Import lịch trình</Typography>
        </Stack>
      </DialogTitle>

      <DialogContent sx={{ pt: 0 }}>
        {/* Tabs */}
        <Tabs
          value={activeTab}
          onChange={(_, v) => { setActiveTab(v); setImportError(null); }}
          sx={{
            mb: 2,
            '& .MuiTab-root': { textTransform: 'none', fontWeight: 600 },
            '& .Mui-selected': { color: '#19e66b !important' },
            '& .MuiTabs-indicator': { bgcolor: '#19e66b' },
          }}
        >
          <Tab label="Chọn nhóm nguồn" />
          <Tab label="Import từ file JSON" />
        </Tabs>

        {loadingGroups ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress size={32} sx={{ color: '#19e66b' }} />
          </Box>
        ) : (
          <>
            {/* ── Tab 0: chọn nhóm nguồn ── */}
            {activeTab === 0 && (
              <Stack spacing={2.5}>
                <Typography variant="body2" color="text.secondary">
                  Sao chép toàn bộ hoạt động từ nhóm nguồn vào nhóm đích. Thời gian tự động điều chỉnh theo ngày bắt đầu của nhóm đích.
                </Typography>

                {sourceGroupId === undefined ? (
                  <FormControl fullWidth>
                    <InputLabel>Nhóm nguồn</InputLabel>
                    <Select
                      value={selectedSource}
                      label="Nhóm nguồn"
                      onChange={(e) => { setSelectedSource(e.target.value as number); setImportError(null); }}
                      disabled={importing}
                    >
                      {sourceOptions.map((g) => <MenuItem key={g.id} value={g.id}>{g.name}</MenuItem>)}
                    </Select>
                  </FormControl>
                ) : (
                  <Box sx={{ p: 1.5, bgcolor: '#f0fdf4', borderRadius: 2, border: '1px solid #bbf7d0' }}>
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>NHÓM NGUỒN</Typography>
                    <Typography fontWeight={600} mt={0.25}>
                      {groups.find((g) => g.id === sourceGroupId)?.name ?? `Nhóm #${sourceGroupId}`}
                    </Typography>
                  </Box>
                )}

                <FormControl fullWidth>
                  <InputLabel>Nhóm đích (bạn là Admin)</InputLabel>
                  <Select
                    value={selectedTarget}
                    label="Nhóm đích (bạn là Admin)"
                    onChange={(e) => { setSelectedTarget(e.target.value as number); setImportError(null); }}
                    disabled={importing}
                  >
                    {targetOptions0.length === 0
                      ? <MenuItem disabled value="">Không có nhóm nào bạn là Admin</MenuItem>
                      : targetOptions0.map((g) => <MenuItem key={g.id} value={g.id}>{g.name}</MenuItem>)
                    }
                  </Select>
                </FormControl>
              </Stack>
            )}

            {/* ── Tab 1: import file JSON ── */}
            {activeTab === 1 && (
              <Stack spacing={2.5}>
                <Typography variant="body2" color="text.secondary">
                  Chọn file JSON đã xuất từ TripSync để import vào nhóm đích.
                </Typography>

                {/* File picker */}
                <Box
                  onClick={() => fileInputRef.current?.click()}
                  sx={{
                    border: `2px dashed ${jsonFile ? '#19e66b' : '#cbd5e1'}`,
                    borderRadius: 3,
                    p: 3,
                    textAlign: 'center',
                    cursor: 'pointer',
                    bgcolor: jsonFile ? '#f0fdf4' : '#f8fafc',
                    transition: 'all 0.2s',
                    '&:hover': { borderColor: '#19e66b', bgcolor: '#f0fdf4' },
                  }}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json,application/json"
                    style={{ display: 'none' }}
                    onChange={(e) => {
                      const f = e.target.files?.[0] ?? null;
                      setJsonFile(f);
                      setImportError(null);
                      e.target.value = '';
                    }}
                  />
                  <UploadFileIcon sx={{ fontSize: 36, color: jsonFile ? '#19e66b' : '#94a3b8', mb: 1 }} />
                  {jsonFile ? (
                    <Typography variant="body2" fontWeight={700} color="#16a34a">{jsonFile.name}</Typography>
                  ) : (
                    <Typography variant="body2" color="text.secondary">Click để chọn file JSON</Typography>
                  )}
                </Box>

                <FormControl fullWidth>
                  <InputLabel>Nhóm đích (bạn là Admin)</InputLabel>
                  <Select
                    value={jsonTarget}
                    label="Nhóm đích (bạn là Admin)"
                    onChange={(e) => { setJsonTarget(e.target.value as number); setImportError(null); }}
                    disabled={importing}
                  >
                    {targetOptions1.length === 0
                      ? <MenuItem disabled value="">Không có nhóm nào bạn là Admin</MenuItem>
                      : targetOptions1.map((g) => <MenuItem key={g.id} value={g.id}>{g.name}</MenuItem>)
                    }
                  </Select>
                </FormControl>
              </Stack>
            )}

            {importError && (
              <Typography variant="body2" color="error" sx={{ mt: 1.5 }}>{importError}</Typography>
            )}
          </>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
        <Button onClick={onClose} disabled={importing} variant="outlined" color="inherit" sx={{ borderRadius: 3, fontWeight: 600, textTransform: 'none' }}>
          Hủy
        </Button>
        <Button
          onClick={handleConfirm}
          disabled={!canConfirm}
          variant="contained"
          sx={{ borderRadius: 3, fontWeight: 700, textTransform: 'none', bgcolor: '#111827', '&:hover': { bgcolor: '#1f2937' }, minWidth: 120 }}
        >
          {importing ? <CircularProgress size={22} color="inherit" /> : 'Import'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
