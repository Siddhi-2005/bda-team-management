import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/layout/Layout';
import LandingPage from './pages/public/LandingPage';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/Dashboard';
import Teams from './pages/Teams';
import Members from './pages/Members';
import Tasks from './pages/Tasks';
import Leads from './pages/Leads';
import Profile from './pages/Profile';
import ContactPage from './pages/public/ContactPage';

// PrivateRoute wrapper for protected workspace access
const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        width: '100vw',
        height: '100vh',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f8fafc',
        flexDirection: 'column',
        gap: '12px'
      }}>
        <div className="spin" style={{
          width: '36px',
          height: '36px',
          border: '3px solid #e2e8f0',
          borderTopColor: '#2563eb',
          borderRadius: '50%'
        }} />
        <p style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 500 }}>
          Loading workspace...
        </p>
      </div>
    );
  }

  return user ? children : <Navigate to="/login" replace />;
};

// RoleRoute wrapper: only allows specific roles, others navigate to /dashboard
const RoleRoute = ({ roles, children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
};

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Website & Auth Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/landing" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/contact" element={<ContactPage />} />

          {/* Protected MERN System Workspace */}
          <Route
            element={
              <PrivateRoute>
                <Layout />
              </PrivateRoute>
            }
          >
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/leads" element={<Leads />} />
            <Route path="/tasks" element={<Tasks />} />
            <Route
              path="/teams"
              element={
                <RoleRoute roles={['admin', 'manager']}>
                  <Teams />
                </RoleRoute>
              }
            />
            <Route
              path="/members"
              element={
                <RoleRoute roles={['admin', 'manager']}>
                  <Members />
                </RoleRoute>
              }
            />
            <Route path="/profile" element={<Profile />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
