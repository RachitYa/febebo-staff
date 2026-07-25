import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Login from './pages/Login';
import StaffDashboard from './pages/StaffDashboard';
import CustomerDashboard from './pages/CustomerDashboard';
import StaffWork from './pages/StaffWork';
import StaffWorkDetails from './pages/StaffWorkDetails';
import Inventory from './pages/Inventory';
import Leave from './pages/Leave';
import StaffApp from './pages/StaffApp';

// Redirect helper
const RootRedirect = () => {
  const { user, logout } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'staff' && user.role !== 'customer') {
    logout();
    return <Navigate to="/login" replace />;
  }
  return <Navigate to="/staff-app" replace />;
};



// Android hardware back button fix
function AndroidBackFix() {
  const navigate = useNavigate();
  useEffect(() => {
    // Push a state so the back button has something to pop
    window.history.pushState({ page: 'app' }, '');
    const handler = (e) => {
      e.preventDefault();
      navigate(-1);
      // Re-push so next back press also works
      setTimeout(() => window.history.pushState({ page: 'app' }, ''), 0);
    };
    window.addEventListener('popstate', handler);
    return () => window.removeEventListener('popstate', handler);
  }, [navigate]);
  return null;
}

function AppRoutes() {
  return (
    <>
      <AndroidBackFix />
      <Routes>
      <Route path="/" element={<RootRedirect />} />
      <Route path="/login" element={<Login />} />

      {/* Admin Routes Removed */}
      <Route path="/staff-work" element={<ProtectedRoute allowedRoles={['staff']}><StaffWork /></ProtectedRoute>} />
      <Route path="/staff-work/:id" element={<ProtectedRoute allowedRoles={['staff']}><StaffWorkDetails /></ProtectedRoute>} />
      <Route path="/inventory" element={<ProtectedRoute allowedRoles={['customer']}><Inventory /></ProtectedRoute>} />
      <Route path="/leave" element={<ProtectedRoute allowedRoles={['staff']}><Leave /></ProtectedRoute>} />

      {/* Staff Routes */}
      <Route path="/staff-dashboard" element={<ProtectedRoute allowedRoles={['staff']}><StaffDashboard /></ProtectedRoute>} />
      <Route path="/staff-app" element={<ProtectedRoute allowedRoles={['staff']}><StaffApp /></ProtectedRoute>} />

      {/* Customer Routes */}
      <Route path="/customer-dashboard" element={<ProtectedRoute allowedRoles={['customer']}><CustomerDashboard /></ProtectedRoute>} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
