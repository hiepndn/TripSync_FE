import { Box, Typography, Card, CardContent, Divider, Chip } from '@mui/material';
import { Info, Security, Storage } from '@mui/icons-material';

const AdminSettings = () => {
  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="caption" color="text.secondary">
        Admin / Cài đặt
      </Typography>

      <Box sx={{ mt: 1, mb: 4 }}>
        <Typography variant="h4" fontWeight={700} color="#111814">
          Cài đặt hệ thống
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Thông tin cấu hình và trạng thái hệ thống TripSync.
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* System info */}
        <Card sx={{ borderRadius: 3, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <Info sx={{ color: '#3b82f6' }} />
              <Typography variant="h6" fontWeight={700}>Thông tin hệ thống</Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
            {[
              { label: 'Tên ứng dụng', value: 'TripSync' },
              { label: 'Phiên bản', value: 'v2.0.0' },
              { label: 'Backend', value: 'Go + Gin + GORM' },
              { label: 'Frontend', value: 'React + TypeScript + MUI' },
              { label: 'Database', value: 'PostgreSQL' },
            ].map((item) => (
              <Box key={item.label} sx={{ display: 'flex', justifyContent: 'space-between', py: 1.5, borderBottom: '1px solid #f1f5f9' }}>
                <Typography variant="body2" color="text.secondary">{item.label}</Typography>
                <Typography variant="body2" fontWeight={600}>{item.value}</Typography>
              </Box>
            ))}
          </CardContent>
        </Card>

        {/* Security */}
        <Card sx={{ borderRadius: 3, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <Security sx={{ color: '#19e66b' }} />
              <Typography variant="h6" fontWeight={700}>Bảo mật</Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
            {[
              { label: 'Xác thực', value: 'JWT Bearer Token', status: 'active' },
              { label: 'Mã hóa mật khẩu', value: 'bcrypt', status: 'active' },
              { label: 'CORS', value: 'Đã cấu hình', status: 'active' },
              { label: 'Group Membership Guard', value: 'Đã bật', status: 'active' },
              { label: 'Admin Role Guard', value: 'SUPERADMIN only', status: 'active' },
            ].map((item) => (
              <Box key={item.label} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1.5, borderBottom: '1px solid #f1f5f9' }}>
                <Typography variant="body2" color="text.secondary">{item.label}</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body2" fontWeight={600}>{item.value}</Typography>
                  <Chip label="Active" size="small" sx={{ bgcolor: '#dcfce7', color: '#16a34a', fontWeight: 700, fontSize: 10, height: 20 }} />
                </Box>
              </Box>
            ))}
          </CardContent>
        </Card>

        {/* Storage */}
        <Card sx={{ borderRadius: 3, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <Storage sx={{ color: '#f59e0b' }} />
              <Typography variant="h6" fontWeight={700}>Tích hợp</Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
            {[
              { label: 'AI Generation', value: 'Google Gemini Flash' },
              { label: 'Hotel Search', value: 'Agoda API' },
              { label: 'File Storage', value: 'Supabase Storage' },
              { label: 'Maps', value: 'Google Maps API' },
            ].map((item) => (
              <Box key={item.label} sx={{ display: 'flex', justifyContent: 'space-between', py: 1.5, borderBottom: '1px solid #f1f5f9' }}>
                <Typography variant="body2" color="text.secondary">{item.label}</Typography>
                <Typography variant="body2" fontWeight={600}>{item.value}</Typography>
              </Box>
            ))}
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default AdminSettings;
