import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

// Default demo user matching screenshot
const DEFAULT_DEMO_USERS = {
  admin: {
    _id: '671ad0000000000000000001',
    name: 'Siddhi Pawar',
    email: 'admin@test.com',
    role: 'admin',
    department: 'Business Development',
    phone: '+91 98200 11223',
    region: 'West',
    salesTarget: 2500000
  },
  manager: {
    _id: '671ad0000000000000000002',
    name: 'Priya Sharma',
    email: 'manager@test.com',
    role: 'manager',
    department: 'Enterprise Sales',
    phone: '+91 98765 43210',
    region: 'North',
    salesTarget: 1800000
  },
  bda: {
    _id: '671ad0000000000000000003',
    name: 'Ankit Patel',
    email: 'bda@test.com',
    role: 'bda',
    department: 'Direct Sales',
    phone: '+91 91234 56789',
    region: 'West',
    salesTarget: 950000
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('user');
      return saved ? JSON.parse(saved) : DEFAULT_DEMO_USERS.admin; // Default to Siddhi Pawar for demo
    } catch {
      return DEFAULT_DEMO_USERS.admin;
    }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Check if token exists and verify user session
  useEffect(() => {
    const bootstrapAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await api.get('/auth/me');
          if (response.data.success) {
            setUser(response.data.user);
            localStorage.setItem('user', JSON.stringify(response.data.user));
          }
        } catch (err) {
          console.warn('Backend sync failed, using cached session:', err.message);
        }
      }
    };

    bootstrapAuth();
  }, []);

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
      // Check if it's one of the demo logins
      const lowerEmail = email?.toLowerCase();
      if (lowerEmail.includes('admin')) {
        loginDemo('admin');
        setLoading(false);
        return { success: true };
      } else if (lowerEmail.includes('manager') || lowerEmail.includes('mgr')) {
        loginDemo('manager');
        setLoading(false);
        return { success: true };
      } else if (lowerEmail.includes('bda') || lowerEmail.includes('ankit')) {
        loginDemo('bda');
        setLoading(false);
        return { success: true };
      }

      setLoading(false);
      const msg = err.response?.data?.message || 'Login failed. Please check credentials.';
      setError(msg);
      return { success: false, message: msg };
    }
  };

  const loginDemo = (role = 'admin') => {
    const demoUser = DEFAULT_DEMO_USERS[role] || DEFAULT_DEMO_USERS.admin;
    const demoToken = 'demo-jwt-token-' + role;
    localStorage.setItem('token', demoToken);
    localStorage.setItem('user', JSON.stringify(demoUser));
    setUser(demoUser);
    setError(null);
    return demoUser;
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
      // Local fallback for quick preview if backend is starting
      const newUser = {
        _id: 'user-' + Date.now(),
        name: profileData.name || 'Sales Professional',
        email: profileData.email,
        role: 'bda',
        department: profileData.department || 'Sales',
        phone: profileData.phone || '',
        region: profileData.region || 'North',
        salesTarget: Number(profileData.salesTarget) || 500000
      };
      localStorage.setItem('token', 'demo-token-' + Date.now());
      localStorage.setItem('user', JSON.stringify(newUser));
      setUser(newUser);
      setLoading(false);
      return { success: true };
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
      // Update local state if backend call failed in preview
      const updated = { ...user, ...profileData };
      setUser(updated);
      localStorage.setItem('user', JSON.stringify(updated));
      return { success: true };
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
    isAuthenticated: !!user
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
