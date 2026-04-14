import React, { useState, useRef, useEffect } from 'react';
import {
  TextField,
  Box,
  Paper,
  List,
  ListItemButton,
  ListItemText,
  CircularProgress,
} from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';

export interface LocationResult {
  name: string;
  lat: number;
  lng: number;
}

interface Props {
  value: string;
  onChange: (value: string) => void;
  onSelect: (result: LocationResult) => void;
  error?: boolean;
  helperText?: string;
  label?: string;
  sx?: object;
}

export default function LocationAutocomplete({
  value,
  onChange,
  onSelect,
  error,
  helperText,
  label = 'Địa điểm',
  sx,
}: Props) {
  const [suggestions, setSuggestions] = useState<LocationResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    onChange(val);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!val.trim() || val.length < 2) {
      setSuggestions([]);
      setOpen(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const apiKey = import.meta.env.VITE_GEOAPIFY_API_KEY;
        const res = await fetch(
          `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(val)}&limit=5&lang=vi&apiKey=${apiKey}`
        );
        const data = await res.json();
        const results: LocationResult[] = (data.features || []).map((f: any) => {
          const props = f.properties;
          // Build display name ngắn gọn: tên + quận/huyện + tỉnh/thành
          const parts = [
            props.name || props.street,
            props.district || props.suburb,
            props.city || props.county || props.state,
            props.country,
          ].filter(Boolean);
          return {
            name: parts.slice(0, 3).join(', '),
            lat: f.geometry.coordinates[1],
            lng: f.geometry.coordinates[0],
          };
        });
        setSuggestions(results);
        setOpen(results.length > 0);
      } catch (_) {
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 400);
  };

  const handleSelect = (result: LocationResult) => {
    onChange(result.name);
    onSelect(result);
    setSuggestions([]);
    setOpen(false);
  };

  return (
    <Box ref={containerRef} sx={{ position: 'relative', ...sx }}>
      <TextField
        label={label}
        value={value}
        onChange={handleInputChange}
        onFocus={() => suggestions.length > 0 && setOpen(true)}
        error={error}
        helperText={helperText}
        fullWidth
        autoComplete="off"
        InputProps={{
          endAdornment: loading ? <CircularProgress size={16} /> : undefined,
        }}
        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
      />
      {open && suggestions.length > 0 && (
        <Paper
          elevation={4}
          sx={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            zIndex: 1300,
            maxHeight: 240,
            overflowY: 'auto',
            borderRadius: 2,
            mt: 0.5,
          }}
        >
          <List dense disablePadding>
            {suggestions.map((s, idx) => (
              <ListItemButton
                key={idx}
                onClick={() => handleSelect(s)}
                sx={{
                  py: 1.2,
                  px: 2,
                  alignItems: 'flex-start',
                  '&:hover': { bgcolor: '#f0fdf4' },
                  borderBottom: idx < suggestions.length - 1 ? '1px solid #f1f5f9' : 'none',
                }}
              >
                <LocationOnIcon sx={{ fontSize: 18, color: '#19e66b', mr: 1.5, mt: 0.2, flexShrink: 0 }} />
                <ListItemText
                  primary={s.name}
                  primaryTypographyProps={{
                    variant: 'body2',
                    sx: {
                      whiteSpace: 'normal',
                      wordBreak: 'break-word',
                      lineHeight: 1.4,
                      color: '#111827',
                      fontWeight: 500,
                    },
                  }}
                />
              </ListItemButton>
            ))}
          </List>
        </Paper>
      )}
    </Box>
  );
}
