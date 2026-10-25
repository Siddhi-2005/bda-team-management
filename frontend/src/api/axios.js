import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://bda-team-management.onrender.com/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

let activeRequests = 0;
let wakeupTimer = null;
let wakeupToast = null;

const showWakeupMessage = () => {
  if (wakeupToast || typeof document === 'undefined') return;
  wakeupToast = document.createElement('div');
  wakeupToast.id = 'server-wakeup-toast';
  wakeupToast.textContent = 'Server is waking up, please wait...';
  Object.assign(wakeupToast.style, {
    position: 'fixed',
    bottom: '20px',
    right: '20px',
    background: '#1e293b',
    color: '#f8fafc',
    padding: '10px 16px',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    fontSize: '0.82rem',
    fontWeight: '500',
    zIndex: '99999',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  });
  document.body.appendChild(wakeupToast);
};

const hideWakeupMessage = () => {
  if (wakeupToast) {
    wakeupToast.remove();
    wakeupToast = null;
  }
};

const onRequestStart = () => {
  activeRequests++;
  if (activeRequests === 1) {
    wakeupTimer = setTimeout(() => {
      showWakeupMessage();
    }, 8000);
  }
};

const onRequestEnd = () => {
  activeRequests = Math.max(0, activeRequests - 1);
  if (activeRequests === 0) {
    if (wakeupTimer) clearTimeout(wakeupTimer);
    hideWakeupMessage();
  }
};

// Request interceptor: add JWT token to headers if it exists
api.interceptors.request.use(
  (config) => {
    onRequestStart();
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    onRequestEnd();
    return Promise.reject(error);
  }
);

// Response interceptor: handle token expiration / unauthorized responses
api.interceptors.response.use(
  (response) => {
    onRequestEnd();
    return response;
  },
  (error) => {
    onRequestEnd();
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Only redirect if not already on the login or public pages
      const publicPaths = ['/login', '/register', '/landing', '/contact'];
      if (!publicPaths.some((p) => window.location.pathname.startsWith(p)) && window.location.pathname !== '/') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
