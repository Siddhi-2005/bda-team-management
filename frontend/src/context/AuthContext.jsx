import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

// Demo credentials (matching the seeder.js accounts)
const DEMO_ACCOUNTS = {
  admin:   { email: 'admin@test.com',   password: 'password123', label: 'Siddhi Pawar (Admin)' },
  manager: { email: 'manager@test.com', password: 'password123', label: 'Priya Sharma (Manager)' },
  bda:     { email: 'bda@test.com',     password: 'password123', label: 'Ankit Patel (BDA)' }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // On mount, verify the stored token against the backend
  useEffect(() => {
    const bootstrapAuth = async () => {
      const token = localStorage.getItem('token');
      if (token && !token.startsWith('demo-')) {
        try {
          const response = await api.get('/auth/me');
          if (response.data.success) {
            setUser(response.data.user);
            localStorage.setItem('user', JSON.stringify(response.data.user));
          }
        } catch (err) {
          // Token expired or invalid — clear stale session
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
        }
      }
    };
    bootstrapAuth();
  }, []);

  // Real login — hits the backend API
  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.post('/auth/login', { email, password });

      if (response.data.success) {
        const { token, user: userData } = response.data;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
        setLoading(false);
        return { success: true };
      }
    } catch (err) {
      setLoading(false);
      const msg = err.response?.data?.message || 'Login failed. Please check credentials.';
      setError(msg);
      return { success: false, message: msg };
    }
  };

  // Quick demo login — logs in with real seeder credentials via the API
  const loginDemo = async (role = 'admin') => {
    const acct = DEMO_ACCOUNTS[role] || DEMO_ACCOUNTS.admin;
    return login(acct.email, acct.password);
  };

  const register = async (profileData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.post('/auth/register', profileData);

      if (response.data.success) {
        const { token, user: userData } = response.data;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
        setLoading(false);
        return { success: true };
      }
    } catch (err) {
      setLoading(false);
      const msg = err.response?.data?.message || 'Registration failed.';
      setError(msg);
      return { success: false, message: msg };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setError(null);
  };

  const updateProfile = async (profileData) => {
    try {
      const response = await api.put('/auth/profile', profileData);
      if (response.data.success) {
        setUser(response.data.user);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        return { success: true };
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Profile update failed.';
      return { success: false, message: msg };
    }
  };

  const value = {
    user,
    loading,
    error,
    login,
    loginDemo,
    register,
    logout,
    updateProfile,
    isAuthenticated: !!user,
    DEMO_ACCOUNTS
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
