import { Routes, Route, Navigate } from 'react-router-dom';
import { Box } from '@mui/material';
import LandingPage from './features/landingPage';

// Placeholder components
// const LandingPage = () => <Box>Landing Page</Box>;
const LoginPage = () => <Box>Login Page</Box>;
const RegisterPage = () => <Box>Register Page</Box>;
const DashboardPage = () => <Box>Dashboard Page</Box>;

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;