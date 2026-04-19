import { Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './features/landingPage';
import AuthPage from './features/auth';
import Dashboard from './features/dashboard';
import TripDetailIndex from './features/trip-detail';
import PublicGroupPage from './features/publicGroup';
import AdminPanel from './features/admin';
import { getTokenRole } from './config/jwt';

function ProtectedAdminRoute() {
  const role = getTokenRole();
  if (!role) return <Navigate to="/login" replace />;
  if (role !== 'SUPERADMIN') return <Navigate to="/dashboard" replace />;
  return <AdminPanel />;
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<AuthPage />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/admin" element={<ProtectedAdminRoute />} />
      <Route path="/groups/public/:id" element={<PublicGroupPage />} />
      <Route path="/groups/:id" element={<TripDetailIndex />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;