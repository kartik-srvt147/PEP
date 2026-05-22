import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import useAuthStore from './store/useAuthStore';

// Components
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import DashboardPage from './pages/DashboardPage';

function App() {
  const { checkAuth } = useAuthStore();

  useEffect(() => {
    // Check if user is already logged in via HTTP-only cookie on app load
    checkAuth();
  }, [checkAuth]);

  return (
    <Router>
      <Navbar />
      <Routes>
        {/* Public routes (accessible to everyone) */}
        <Route path="/" element={<LandingPage />} />

        {/* Public routes (only for unauthenticated users) */}
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
        </Route>

        {/* Protected routes (only for authenticated users) */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardPage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
