import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/layout/Layout';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/Dashboard';
import Teams from './pages/Teams';
import Members from './pages/Members';
import Tasks from './pages/Tasks';
import Leads from './pages/Leads';
import Profile from './pages/Profile';
import ContactPage from './pages/public/ContactPage';
import { RiLoader4Line } from 'react-icons/ri';

// PrivateRoute wrapper for protected access
const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', width: '100vw', height: '100vh', alignItems: 'center', justifyContent: 'center', background: '#0a0a12', flexDirection: 'column', gap: '15px' }}>
        <RiLoader4Line className="spin" style={{ fontSize: '3rem', color: 'var(--accent-primary)' }} />
        <p style={{ color: 'var(--text-secondary)' }}>Verifying credentials session...</p>
      </div>
    );
  }

  return user ? children : <Navigate to="/login" replace />;
};

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Public Website Routes */}
          <Route path="/contact" element={<ContactPage />} />

          {/* Protected MERN System Workspace */}
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Layout />
              </PrivateRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            
            {/* CRUD Modules */}
            <Route path="teams" element={<Teams />} />
            <Route path="members" element={<Members />} />
            <Route path="tasks" element={<Tasks />} />
            <Route path="leads" element={<Leads />} />
            <Route path="profile" element={<Profile />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
