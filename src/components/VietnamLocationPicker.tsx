import { useState, useRef, useEffect, useMemo } from 'react';
import {
  Box,
  TextField,
  Paper,
  Typography,
  Chip,
  IconButton,
  Collapse,
  InputAdornment,
  Divider,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import CheckIcon from '@mui/icons-material/Check';
import { VIETNAM_LOCATIONS, Province, District } from '@/data/vietnamLocations';

export interface SelectedLocation {
  id: string;
  label: string; // "Quận 1, TP. Hồ Chí Minh" hoặc "Đà Nẵng"
}

interface Props {
  value: SelectedLocation[];
  onChange: (locations: SelectedLocation[]) => void;
  error?: boolean;
  helperText?: string;
  label?: string;
}

export default function VietnamLocationPicker({
  value,
  onChange,
  error,
  helperText,
  label = 'Hành trình (Các điểm đến)',
}: Props) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [expandedProvinces, setExpandedProvinces] = useState<Set<string>>(new Set());
  const containerRef = useRef<HTMLDivElement>(null);

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter theo search
  const filteredLocations = useMemo(() => {
    if (!search.trim()) return VIETNAM_LOCATIONS;
    const q = search.toLowerCase();
    return VIETNAM_LOCATIONS
      .map((province) => ({
        ...province,
        // Lọc districts khớp
        districts: province.districts.filter((d) =>
          d.name.toLowerCase().includes(q)
        ),
        // Province khớp thì giữ nguyên districts
        matchProvince: province.name.toLowerCase().includes(q),
      }))
      .filter((p) => p.matchProvince || p.districts.length > 0);
  }, [search]);

  const selectedIds = new Set(value.map((v) => v.id));

  const isSelected = (id: string) => selectedIds.has(id);

  const toggleProvince = (province: Province) => {
    const id = province.id;
    if (isSelected(id)) {
      // Bỏ chọn tỉnh + tất cả quận của nó
      const districtIds = new Set(province.districts.map((d) => d.id));
      onChange(value.filter((v) => v.id !== id && !districtIds.has(v.id)));
    } else {
      onChange([...value, { id, label: province.name }]);
    }
  };

  const toggleDistrict = (province: Province, district: District) => {
    const id = district.id;
    if (isSelected(id)) {
      onChange(value.filter((v) => v.id !== id));
    } else {
      onChange([
        ...value,
        { id, label: `${district.name}, ${province.name}` },
      ]);
    }
  };

  const toggleExpand = (provinceId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedProvinces((prev) => {
      const next = new Set(prev);
      next.has(provinceId) ? next.delete(provinceId) : next.add(provinceId);
      return next;
    });
  };

  const removeLocation = (id: string) => {
    onChange(value.filter((v) => v.id !== id));
  };

  return (
    <Box ref={containerRef} sx={{ position: 'relative' }}>
      {/* Input hiển thị chips đã chọn */}
      <Box
        onClick={() => setOpen(true)}
        sx={{
          border: `1px solid ${error ? '#ef4444' : open ? '#19e66b' : '#cbd5e1'}`,
          borderRadius: '12px',
          p: '8px 12px',
          minHeight: 56,
          cursor: 'pointer',
          display: 'flex',
          flexWrap: 'wrap',
          gap: 0.5,
          alignItems: 'center',
          bgcolor: 'white',
          transition: 'border-color 0.2s',
          '&:hover': { borderColor: open ? '#19e66b' : '#94a3b8' },
        }}
      >
        {/* Label */}
        <Typography
          variant="caption"
          sx={{
            position: 'absolute',
            top: value.length > 0 ? -10 : 16,
            left: 12,
            bgcolor: 'white',
            px: 0.5,
            color: error ? '#ef4444' : open ? '#0f766e' : '#64748b',
            fontSize: value.length > 0 ? '0.75rem' : '1rem',
            transition: 'all 0.2s',
            pointerEvents: 'none',
          }}
        >
          {label}
        </Typography>

        {value.length === 0 && (
          <Typography variant="body2" color="text.disabled" sx={{ ml: 0.5 }}>
            Chọn điểm đến...
          </Typography>
        )}

        {value.map((loc) => (
          <Chip
            key={loc.id}
            label={loc.label}
            size="small"
            onDelete={(e) => { e.stopPropagation(); removeLocation(loc.id); }}
            deleteIcon={<CloseIcon sx={{ fontSize: '0.9rem !important' }} />}
            sx={{
              bgcolor: '#dcfce7',
              color: '#15803d',
              fontWeight: 600,
              fontSize: '0.75rem',
              '& .MuiChip-deleteIcon': { color: '#16a34a' },
            }}
          />
        ))}

        <LocationOnIcon
          sx={{ ml: 'auto', color: open ? '#19e66b' : '#94a3b8', fontSize: 20, flexShrink: 0 }}
        />
      </Box>

      {/* Helper text */}
      {helperText && (
        <Typography
          variant="caption"
          sx={{ ml: 1.5, mt: 0.5, display: 'block', color: error ? '#ef4444' : '#64748b' }}
        >
          {helperText}
        </Typography>
      )}

      {/* Dropdown */}
      {open && (
        <Paper
          elevation={8}
          sx={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            zIndex: 1300,
            mt: 0.5,
            borderRadius: 3,
            maxHeight: 380,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            border: '1px solid #e2e8f0',
          }}
        >
          {/* Search bar */}
          <Box sx={{ p: 1.5, borderBottom: '1px solid #f1f5f9' }}>
            <TextField
              size="small"
              fullWidth
              placeholder="Tìm tỉnh/thành phố, quận/huyện..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              autoFocus
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ fontSize: 18, color: '#94a3b8' }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': { borderRadius: 2 },
              }}
            />
          </Box>

          {/* List */}
          <Box sx={{ overflowY: 'auto', flex: 1 }}>
            {filteredLocations.length === 0 ? (
              <Box sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  Không tìm thấy địa điểm
                </Typography>
              </Box>
            ) : (
              filteredLocations.map((province) => {
                const isProvinceSelected = isSelected(province.id);
                const isExpanded = expandedProvinces.has(province.id) || search.trim() !== '';

                return (
                  <Box key={province.id}>
                    {/* Province row */}
                    <Box
                      onClick={() => toggleProvince(province)}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        px: 2,
                        py: 1.2,
                        cursor: 'pointer',
                        bgcolor: isProvinceSelected ? '#f0fdf4' : 'transparent',
                        '&:hover': { bgcolor: isProvinceSelected ? '#dcfce7' : '#f8fafc' },
                        transition: 'background 0.15s',
                      }}
                    >
                      {/* Check icon */}
                      <Box
                        sx={{
                          width: 20,
                          height: 20,
                          borderRadius: 1,
                          border: `2px solid ${isProvinceSelected ? '#19e66b' : '#cbd5e1'}`,
                          bgcolor: isProvinceSelected ? '#19e66b' : 'transparent',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mr: 1.5,
                          flexShrink: 0,
                          transition: 'all 0.15s',
                        }}
                      >
                        {isProvinceSelected && <CheckIcon sx={{ fontSize: 14, color: 'white' }} />}
                      </Box>

                      <Typography variant="body2" fontWeight={700} flex={1} color="#111814">
                        {province.name}
                      </Typography>

                      {/* Expand button */}
                      <IconButton
                        size="small"
                        onClick={(e) => toggleExpand(province.id, e)}
                        sx={{ color: '#94a3b8', p: 0.5 }}
                      >
                        {isExpanded ? (
                          <ExpandLessIcon fontSize="small" />
                        ) : (
                          <ExpandMoreIcon fontSize="small" />
                        )}
                      </IconButton>
                    </Box>

                    {/* Districts */}
                    <Collapse in={isExpanded}>
                      {province.districts.map((district) => {
                        const isDistrictSelected = isSelected(district.id);
                        return (
                          <Box
                            key={district.id}
                            onClick={(e) => { e.stopPropagation(); toggleDistrict(province, district); }}
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              pl: 5,
                              pr: 2,
                              py: 0.9,
                              cursor: 'pointer',
                              bgcolor: isDistrictSelected ? '#f0fdf4' : 'transparent',
                              '&:hover': { bgcolor: isDistrictSelected ? '#dcfce7' : '#f8fafc' },
                              borderLeft: '2px solid #e2e8f0',
                              ml: 4,
                              transition: 'background 0.15s',
                            }}
                          >
                            <Box
                              sx={{
                                width: 16,
                                height: 16,
                                borderRadius: 0.5,
                                border: `2px solid ${isDistrictSelected ? '#19e66b' : '#cbd5e1'}`,
                                bgcolor: isDistrictSelected ? '#19e66b' : 'transparent',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                mr: 1.5,
                                flexShrink: 0,
                                transition: 'all 0.15s',
                              }}
                            >
                              {isDistrictSelected && <CheckIcon sx={{ fontSize: 11, color: 'white' }} />}
                            </Box>
                            <Typography variant="body2" color="#374151">
                              {district.name}
                            </Typography>
                          </Box>
                        );
                      })}
                    </Collapse>

                    <Divider />
                  </Box>
                );
              })
            )}
          </Box>

          {/* Footer */}
          {value.length > 0 && (
            <Box
              sx={{
                p: 1.5,
                borderTop: '1px solid #f1f5f9',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Typography variant="caption" color="text.secondary">
                Đã chọn {value.length} điểm đến
              </Typography>
              <Typography
                variant="caption"
                sx={{ color: '#19e66b', fontWeight: 700, cursor: 'pointer' }}
                onClick={() => setOpen(false)}
              >
                Xong ✓
              </Typography>
            </Box>
          )}
        </Paper>
      )}
    </Box>
  );
}
