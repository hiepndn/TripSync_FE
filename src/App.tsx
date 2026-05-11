import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { getTokenRole } from './config/jwt';

// =====================================================================
// Lazy-load từng trang — Vite sẽ tách thành các chunk riêng biệt.
// User chỉ tải chunk của trang họ đang vào, không tải toàn bộ app.
// =====================================================================
const LandingPage    = lazy(() => import('./features/landingPage'));
const AuthPage       = lazy(() => import('./features/auth'));
const Dashboard      = lazy(() => import('./features/dashboard'));
const TripDetailIndex = lazy(() => import('./features/trip-detail'));
const PublicGroupPage = lazy(() => import('./features/publicGroup'));
const DemoPage       = lazy(() => import('./features/demo'));
const AdminPanel     = lazy(() => import('./features/admin'));

// Fallback hiển thị khi chunk đang được tải về
function PageLoader() {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
      }}
    >
      <CircularProgress sx={{ color: '#19e66b' }} />
    </Box>
  );
}

function ProtectedAdminRoute() {
  const role = getTokenRole();
  if (!role) return <Navigate to="/login" replace />;
  if (role !== 'SUPERADMIN') return <Navigate to="/dashboard" replace />;
  return <AdminPanel />;
}

function App() {
  return (
    // Suspense bọc toàn bộ Routes — hiện PageLoader khi bất kỳ chunk nào đang load
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/"                   element={<LandingPage />} />
        <Route path="/login"              element={<AuthPage />} />
        <Route path="/dashboard"          element={<Dashboard />} />
        <Route path="/admin"              element={<ProtectedAdminRoute />} />
        <Route path="/groups/public/:id"  element={<PublicGroupPage />} />
        <Route path="/demo"               element={<DemoPage />} />
        <Route path="/demo/:id"           element={<DemoPage />} />
        <Route path="/groups/:id"         element={<TripDetailIndex />} />
        <Route path="*"                   element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}

export default App;
