import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { RiMailLine, RiLockLine, RiArrowRightLine, RiLoader4Line, RiShieldCheckLine, RiTeamLine, RiSparklingLine } from 'react-icons/ri';

const DEMO_ACCOUNTS = [
  {
    role: 'Admin',
    email: 'admin@test.com',
    password: 'password123',
    icon: RiShieldCheckLine,
    description: 'Full system access, analytics & team management',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    border: 'rgba(102, 126, 234, 0.4)',
  },
  {
    role: 'Manager',
    email: 'manager@test.com',
    password: 'password123',
    icon: RiTeamLine,
    description: 'Team oversight, lead assignments & reports',
    gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    border: 'rgba(240, 147, 251, 0.4)',
  },
];

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const [activeDemo, setActiveDemo] = useState(null);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleDemoClick = (account) => {
    setEmail(account.email);
    setPassword(account.password);
    setActiveDemo(account.role);
    setErr('');
  };

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

        {/* Demo Credentials Section */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.08) 0%, rgba(240, 147, 251, 0.08) 100%)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '24px',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '4px',
          }}>
            <RiSparklingLine style={{ color: '#f5a623', fontSize: '1.1rem' }} />
            <span style={{
              fontSize: '0.8rem',
              fontWeight: '600',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: 'var(--text-secondary)',
            }}>
              Portfolio Demo
            </span>
          </div>
          <p style={{
            margin: '0 0 12px 0',
            fontSize: '0.75rem',
            color: 'var(--text-secondary)',
            opacity: 0.7,
            lineHeight: '1.4',
          }}>
            This is a portfolio project by Siddhi. Click a role below to explore the app with pre-configured demo credentials.
          </p>

          <div style={{ display: 'flex', gap: '10px' }}>
            {DEMO_ACCOUNTS.map((account) => {
              const Icon = account.icon;
              const isActive = activeDemo === account.role;
              return (
                <button
                  key={account.role}
                  type="button"
                  onClick={() => handleDemoClick(account)}
                  style={{
                    flex: 1,
                    background: isActive
                      ? account.gradient
                      : 'rgba(255, 255, 255, 0.04)',
                    border: `1px solid ${isActive ? account.border : 'rgba(255, 255, 255, 0.08)'}`,
                    borderRadius: '10px',
                    padding: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    textAlign: 'left',
                    transform: isActive ? 'scale(1.02)' : 'scale(1)',
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.border = `1px solid ${account.border}`;
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.07)';
                      e.currentTarget.style.transform = 'scale(1.02)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.border = '1px solid rgba(255, 255, 255, 0.08)';
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
                      e.currentTarget.style.transform = 'scale(1)';
                    }
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <Icon style={{
                      fontSize: '1.2rem',
                      color: isActive ? '#fff' : account.border.replace('0.4', '1'),
                    }} />
                    <span style={{
                      fontWeight: '700',
                      fontSize: '0.9rem',
                      color: isActive ? '#fff' : 'var(--text-primary)',
                    }}>
                      {account.role}
                    </span>
                  </div>
                  <p style={{
                    margin: 0,
                    fontSize: '0.72rem',
                    color: isActive ? 'rgba(255,255,255,0.85)' : 'var(--text-secondary)',
                    lineHeight: '1.3',
                  }}>
                    {account.description}
                  </p>
                </button>
              );
            })}
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
                id="login-email"
                type="email"
                placeholder="email@example.com"
                className="form-control"
                style={{ paddingLeft: '45px' }}
                value={email}
                onChange={(e) => { setEmail(e.target.value); setActiveDemo(null); }}
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
                id="login-password"
                type="password"
                placeholder="••••••••"
                className="form-control"
                style={{ paddingLeft: '45px' }}
                value={password}
                onChange={(e) => { setPassword(e.target.value); setActiveDemo(null); }}
                required
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            id="login-submit"
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
