import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { RiMailLine, RiLockLine, RiArrowRightLine, RiLoader4Line } from 'react-icons/ri';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      return setErr('Please enter both email and password.');
    }
    
    try {
      setLoading(true);
      setErr('');
      const res = await login(email, password);
      if (res && res.success) {
        navigate('/dashboard');
      } else {
        setErr(res?.message || 'Login failed. Invalid credentials.');
      }
    } catch (error) {
      setErr('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">Business Development Platform</div>
          <p>Login to manage teams, track potential customers, and view analytics.</p>
        </div>

        <div style={{ backgroundColor: 'rgba(255,255,255,0.05)', padding: '15px', borderRadius: '8px', marginBottom: '20px', fontSize: '0.9rem', border: '1px solid rgba(255,255,255,0.1)' }}>
          <p style={{ margin: '0 0 10px 0', color: 'var(--text-secondary)', fontWeight: 'bold' }}>For Recruiters (Demo Accounts):</p>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', color: 'var(--text-primary)' }}>
            <span><strong>Admin:</strong> admin@test.com</span>
            <span><strong>Pass:</strong> password123</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-primary)' }}>
            <span><strong>Manager:</strong> manager@test.com</span>
            <span><strong>Pass:</strong> password123</span>
          </div>
        </div>

        {err && <div className="alert alert-danger">{err}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email Address</label>
            <div style={{ position: 'relative' }}>
              <RiMailLine 
                style={{ 
                  position: 'absolute', 
                  left: '16px', 
                  top: '50%', 
                  transform: 'translateY(-50%)', 
                  color: 'var(--text-secondary)' 
                }} 
              />
              <input
                type="email"
                placeholder="email@example.com"
                className="form-control"
                style={{ paddingLeft: '45px' }}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Password</label>
            <div style={{ position: 'relative' }}>
              <RiLockLine 
                style={{ 
                  position: 'absolute', 
                  left: '16px', 
                  top: '50%', 
                  transform: 'translateY(-50%)', 
                  color: 'var(--text-secondary)' 
                }} 
              />
              <input
                type="password"
                placeholder="••••••••"
                className="form-control"
                style={{ paddingLeft: '45px' }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', marginTop: '10px', height: '48px' }}
            disabled={loading}
          >
            {loading ? (
              <RiLoader4Line className="spin" style={{ fontSize: '1.4rem' }} />
            ) : (
              <>
                <span>Sign In</span>
                <RiArrowRightLine />
              </>
            )}
          </button>
        </form>

        <div className="auth-footer">
          Don't have an account? 
          <Link to="/register" className="auth-link">Register here</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
