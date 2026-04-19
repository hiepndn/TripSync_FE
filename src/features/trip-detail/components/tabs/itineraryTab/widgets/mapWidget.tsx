import React, { useEffect, useRef, useState } from 'react';
import { Card, Box, Typography, Stack, CircularProgress } from '@mui/material';
import { Activity } from '@/models/activity';
import 'leaflet/dist/leaflet.css';

interface Props {
  activities: Activity[];
}

export default function MapWidget({ activities }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapInstanceRef = useRef<any>(null);
  const [loading, setLoading] = useState(false);

  // Lọc conflict: với mỗi nhóm cùng start_time, chỉ lấy 1 đại diện
  // Ưu tiên APPROVED, nếu không có thì lấy cái nhiều vote nhất
  const deduped = (() => {
    const groups = new Map<string, Activity[]>();
    for (const act of activities) {
      const key = new Date(act.start_time).toISOString().slice(0, 16); // YYYY-MM-DDTHH:mm
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(act);
    }
    const result: Activity[] = [];
    for (const group of groups.values()) {
      const approved = group.find((a) => a.status === 'APPROVED');
      if (approved) {
        result.push(approved);
      } else {
        // Lấy cái nhiều vote nhất
        const best = group.reduce((a, b) => (b.vote_count ?? 0) > (a.vote_count ?? 0) ? b : a);
        result.push(best);
      }
    }
    return result;
  })();

  const waypoints = deduped
    .filter((a) => a.lat && a.lng && Math.abs(a.lat) > 0.001 && Math.abs(a.lng) > 0.001)
    .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());

  useEffect(() => {
    if (!mapRef.current || waypoints.length === 0) return;

    let cancelled = false;
    setLoading(true);

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    import('leaflet').then((L) => {
      if (cancelled || !mapRef.current) return;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      const map = L.map(mapRef.current!, { zoomControl: true, scrollWheelZoom: false });
      mapInstanceRef.current = map;

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 18,
      }).addTo(map);

      waypoints.forEach((act, idx) => {
        const isFirst = idx === 0;
        const isLast = idx === waypoints.length - 1;
        const bg = isFirst ? '#19e66b' : isLast ? '#ef4444' : '#3b82f6';
        const label = isFirst ? 'S' : isLast ? 'E' : String(idx);
        const icon = L.divIcon({
          html: `<div style="background:${bg};color:${isFirst ? '#111' : 'white'};width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:12px;border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3)">${label}</div>`,
          className: '',
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        });
        L.marker([act.lat, act.lng], { icon })
          .addTo(map)
          .bindPopup(`<b>${act.name}</b><br/><small>${act.location || ''}</small>`);
      });

      const bounds = L.latLngBounds(waypoints.map((a) => [a.lat, a.lng]));
      map.fitBounds(bounds, { padding: [40, 40] });

      if (waypoints.length >= 2) {
        const coords = waypoints.map((a) => `${a.lng},${a.lat}`).join(';');
        fetch(`https://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=geojson`)
          .then((r) => r.json())
          .then((data) => {
            if (cancelled) return;
            if (data.routes?.[0]) {
              L.geoJSON(data.routes[0].geometry, {
                style: { color: '#19e66b', weight: 4, opacity: 0.85 },
              }).addTo(map);
            } else {
              L.polyline(waypoints.map((a) => [a.lat, a.lng] as [number, number]), {
                color: '#19e66b', weight: 3, dashArray: '6,6',
              }).addTo(map);
            }
          })
          .catch(() => {
            if (!cancelled) {
              L.polyline(waypoints.map((a) => [a.lat, a.lng] as [number, number]), {
                color: '#19e66b', weight: 3, dashArray: '6,6',
              }).addTo(map);
            }
          })
          .finally(() => { if (!cancelled) setLoading(false); });
      } else {
        setLoading(false);
      }
    });

    return () => {
      cancelled = true;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [JSON.stringify(waypoints.map(a => a.id))]);

  return (
    <Card variant="outlined" sx={{ borderRadius: 4, borderColor: 'grey.200', overflow: 'hidden' }}>
      <Stack direction="row" alignItems="center" sx={{ p: 2, borderBottom: '1px solid', borderColor: 'grey.100' }}>
        <Typography variant="subtitle1" fontWeight={700}>Bản đồ</Typography>
        <Box sx={{ ml: 1, px: 1, py: 0.25, bgcolor: '#d1fae5', color: '#047857', borderRadius: 1, fontSize: '0.7rem', fontWeight: 600 }}>
          {waypoints.length} điểm
        </Box>
      </Stack>

      {waypoints.length === 0 ? (
        <Box sx={{ height: 250, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'grey.50' }}>
          <Typography variant="body2" color="text.secondary">
            Chưa có hoạt động nào có tọa độ trong ngày này
          </Typography>
        </Box>
      ) : (
        <Box sx={{ position: 'relative', height: 280 }}>
          <Box ref={mapRef} sx={{ height: '100%', width: '100%' }} />
          {loading && (
            <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'rgba(255,255,255,0.6)' }}>
              <CircularProgress size={28} sx={{ color: '#19e66b' }} />
            </Box>
          )}
        </Box>
      )}
    </Card>
  );
}
