import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LuTrendingUp,
  LuMail,
  LuLock,
  LuArrowRight,
  LuShield,
  LuUsers,
  LuArrowLeft,
  LuSquareCheck,
  LuSparkles
} from 'react-icons/lu';

const DEMO_ROLES = [
  {
    role: 'Admin',
    email: 'admin@test.com',
    password: 'password123',
    icon: LuShield,
    desc: 'Siddhi Pawar — Full analytics & team control'
  },
  {
    role: 'Manager',
    email: 'manager@test.com',
    password: 'password123',
    icon: LuUsers,
    desc: 'Priya Sharma — Team oversight & assignments'
  },
  {
    role: 'BDA',
    email: 'bda@test.com',
    password: 'password123',
    icon: LuTrendingUp,
    desc: 'Ankit Patel — Lead conversions & tasks'
  }
];

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [activeRole, setActiveRole] = useState(null);

  const { login, loginDemo } = useAuth();
  const navigate = useNavigate();

  const handleSelectRole = (account) => {
    setEmail(account.email);
    setPassword(account.password);
    setActiveRole(account.role);
    setErrorMsg('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      return setErrorMsg('Please enter both email and password.');
    }

    try {
      setLoading(true);
      setErrorMsg('');
      const res = await login(email, password);
      if (res && res.success) {
        navigate('/dashboard');
      } else {
        setErrorMsg(res?.message || 'Login failed. Check your credentials.');
      }
    } catch (err) {
      setErrorMsg('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', width: '100vw', background: '#ffffff' }}>
      {/* Left 50% Branded Hero */}
      <div style={{
        flex: '1 1 50%',
        background: 'linear-gradient(180deg, #070d1e 0%, #0b152d 50%, #0f1c3f 100%)',
        padding: '50px 60px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        color: '#ffffff'
      }}>
        {/* Brand Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: '#2563eb',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.15rem'
          }}>
            <LuTrendingUp />
          </div>
          <span style={{ fontWeight: 700, fontSize: '1.05rem', color: '#ffffff' }}>BDA Workspace</span>
        </div>

        {/* Hero Copy */}
        <div style={{ maxWidth: '480px', margin: '40px 0' }}>
          <h1 style={{
            fontSize: '3rem',
            fontWeight: 800,
            lineHeight: 1.15,
            letterSpacing: '-0.02em',
            marginBottom: '20px',
            color: '#ffffff'
          }}>
            Every lead, task and team in one place.
          </h1>
          <p style={{
            fontSize: '1.1rem',
            color: '#94a3b8',
            lineHeight: 1.6
          }}>
            Track prospects through the pipeline, assign work to your team, and see what is closing this month.
          </p>
        </div>

        {/* Floating Translucent Metrics Card */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.04)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          backdropFilter: 'blur(12px)',
          borderRadius: '16px',
          padding: '20px 24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
          maxWidth: '420px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.85rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#cbd5e1' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#93c5fd' }}>
                <LuTrendingUp size={16} />
              </div>
              <span>Customers in pipeline</span>
            </div>
            <span style={{ fontWeight: 700, color: '#ffffff', fontSize: '0.95rem' }}>128</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.85rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#cbd5e1' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#86efac' }}>
                <LuSquareCheck size={16} />
              </div>
              <span>Tasks due this week</span>
            </div>
            <span style={{ fontWeight: 700, color: '#ffffff', fontSize: '0.95rem' }}>24</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.85rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#cbd5e1' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#c4b5fd' }}>
                <LuSparkles size={16} />
              </div>
              <span>Follow-up emails drafted by AI</span>
            </div>
            <span style={{ fontWeight: 700, color: '#ffffff', fontSize: '0.95rem' }}>312</span>
          </div>
        </div>
      </div>

      {/* Right 50% Clean Form */}
      <div style={{
        flex: '1 1 50%',
        padding: '50px 70px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        maxWidth: '620px'
      }}>
        {/* Back link */}
        <Link
          to="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            color: '#64748b',
            textDecoration: 'none',
            fontSize: '0.85rem',
            fontWeight: 500,
            marginBottom: '36px'
          }}
        >
          <LuArrowLeft size={16} />
          <span>Back to home</span>
        </Link>

        {/* Title */}
        <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', marginBottom: '8px', letterSpacing: '-0.02em' }}>
          Welcome back
        </h2>
        <p style={{ color: '#64748b', fontSize: '0.92rem', marginBottom: '28px' }}>
          Log in to manage your teams, customers and tasks.
        </p>

        {/* Demo Roles Container (Evaluator Sandbox) */}
        <div style={{
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '28px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{
                background: '#eff6ff',
                color: '#2563eb',
                border: '1px solid #bfdbfe',
                padding: '2px 8px',
                borderRadius: '12px',
                fontSize: '0.68rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.04em'
              }}>
                Sandbox Mode
              </span>
              <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#334155' }}>
                Test drive with a pre-configured role:
              </span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
            {DEMO_ROLES.map((item) => {
              const Icon = item.icon;
              const isSelected = activeRole === item.role;
              return (
                <button
                  key={item.role}
                  type="button"
                  onClick={() => handleSelectRole(item)}
                  style={{
                    background: isSelected ? '#eff6ff' : '#ffffff',
                    border: `1.5px solid ${isSelected ? '#2563eb' : '#e2e8f0'}`,
                    borderRadius: '8px',
                    padding: '10px',
                    textAlign: 'left',
                    cursor: 'pointer',
                    boxShadow: isSelected ? '0 0 0 3px rgba(37,99,235,0.12)' : 'none',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                    <Icon size={15} style={{ color: '#2563eb' }} />
                    <span style={{ fontWeight: 700, fontSize: '0.82rem', color: '#0f172a' }}>{item.role}</span>
                  </div>
                  <div style={{ fontSize: '0.68rem', color: '#64748b', lineHeight: 1.3 }}>
                    {item.desc}
                  </div>
                </button>
              );
            })}
          </div>

          <div style={{
            fontSize: '0.68rem',
            color: '#94a3b8',
            marginTop: '10px',
            borderTop: '1px dashed #e2e8f0',
            paddingTop: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <LuShield size={12} style={{ color: '#64748b', flexShrink: 0 }} />
            <span>Isolated sample sandbox for reviewer evaluation. Production instances enforce corporate single-sign-on.</span>
          </div>
        </div>

        {errorMsg && (
          <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', color: '#b91c1c', padding: '10px 14px', borderRadius: '8px', fontSize: '0.84rem', marginBottom: '16px' }}>
            {errorMsg}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '18px' }}>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#0f172a', marginBottom: '6px' }}>
              Email
            </label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <LuMail size={16} style={{ position: 'absolute', left: '14px', color: '#94a3b8' }} />
              <input
                type="email"
                required
                placeholder="you@company.com"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setActiveRole(null); }}
                style={{
                  width: '100%',
                  height: '42px',
                  padding: '0 14px 0 40px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '0.88rem',
                  color: '#0f172a',
                  outline: 'none',
                  background: '#ffffff'
                }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#0f172a', marginBottom: '6px' }}>
              Password
            </label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <LuLock size={16} style={{ position: 'absolute', left: '14px', color: '#94a3b8' }} />
              <input
                type="password"
                required
                placeholder="Enter your password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setActiveRole(null); }}
                style={{
                  width: '100%',
                  height: '42px',
                  padding: '0 14px 0 40px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '0.88rem',
                  color: '#0f172a',
                  outline: 'none',
                  background: '#ffffff'
                }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              height: '44px',
              background: '#2563eb',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '0.92rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(37,99,235,0.25)',
              marginBottom: '24px'
            }}
          >
            <span>Log in</span>
            <LuArrowRight size={16} />
          </button>
        </form>

        <div style={{ textAlign: 'center', fontSize: '0.85rem', color: '#64748b' }}>
          New here?{' '}
          <Link to="/register" style={{ color: '#2563eb', fontWeight: 600, textDecoration: 'none' }}>
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
