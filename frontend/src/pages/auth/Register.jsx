import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LuTrendingUp,
  LuMail,
  LuLock,
  LuUser,
  LuPhone,
  LuBuilding,
  LuArrowRight,
  LuArrowLeft,
  LuSquareCheck,
  LuSparkles
} from 'react-icons/lu';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    department: 'Business Development',
    region: 'West',
    salesTarget: '2500000'
  });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password) {
      return setErrorMsg('Please fill in all required fields.');
    }
    if (formData.password.length < 6) {
      return setErrorMsg('Password must be at least 6 characters.');
    }

    try {
      setLoading(true);
      setErrorMsg('');
      const res = await register(formData);
      if (res && res.success) {
        navigate('/dashboard');
      } else {
        setErrorMsg(res?.message || 'Registration failed.');
      }
    } catch (err) {
      navigate('/dashboard');
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

        <div style={{ maxWidth: '480px', margin: '40px 0' }}>
          <h1 style={{
            fontSize: '3rem',
            fontWeight: 800,
            lineHeight: 1.15,
            letterSpacing: '-0.02em',
            marginBottom: '20px',
            color: '#ffffff'
          }}>
            Start closing deals faster today.
          </h1>
          <p style={{
            fontSize: '1.1rem',
            color: '#94a3b8',
            lineHeight: 1.6
          }}>
            Create your account to organize sales pipelines, assign client tasks, and hit your monthly revenue targets.
          </p>
        </div>

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
              <span>7 pipeline stages out of the box</span>
            </div>
            <span style={{ fontWeight: 700, color: '#ffffff', fontSize: '0.95rem' }}>Ready</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.85rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#cbd5e1' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#86efac' }}>
                <LuSquareCheck size={16} />
              </div>
              <span>Kanban board task tracking</span>
            </div>
            <span style={{ fontWeight: 700, color: '#ffffff', fontSize: '0.95rem' }}>Included</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.85rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#cbd5e1' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#c4b5fd' }}>
                <LuSparkles size={16} />
              </div>
              <span>AI outreach email assistance</span>
            </div>
            <span style={{ fontWeight: 700, color: '#ffffff', fontSize: '0.95rem' }}>Active</span>
          </div>
        </div>
      </div>

      {/* Right 50% Clean Form */}
      <div style={{
        flex: '1 1 50%',
        padding: '40px 70px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        maxWidth: '640px',
        overflowY: 'auto'
      }}>
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
            marginBottom: '28px'
          }}
        >
          <LuArrowLeft size={16} />
          <span>Back to home</span>
        </Link>

        <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', marginBottom: '6px', letterSpacing: '-0.02em' }}>
          Create an account
        </h2>
        <p style={{ color: '#64748b', fontSize: '0.92rem', marginBottom: '24px' }}>
          Sign up to access your sales workspace.
        </p>

        {errorMsg && (
          <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', color: '#b91c1c', padding: '10px 14px', borderRadius: '8px', fontSize: '0.84rem', marginBottom: '16px' }}>
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#0f172a', marginBottom: '4px' }}>
                Full Name *
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <LuUser size={16} style={{ position: 'absolute', left: '12px', color: '#94a3b8' }} />
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="e.g. Siddhi Pawar"
                  value={formData.name}
                  onChange={handleChange}
                  className="form-input"
                  style={{ paddingLeft: '36px', height: '40px' }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#0f172a', marginBottom: '4px' }}>
                Work Email *
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <LuMail size={16} style={{ position: 'absolute', left: '12px', color: '#94a3b8' }} />
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="you@company.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="form-input"
                  style={{ paddingLeft: '36px', height: '40px' }}
                />
              </div>
            </div>
          </div>

          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#0f172a', marginBottom: '4px' }}>
              Password * (at least 6 characters)
            </label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <LuLock size={16} style={{ position: 'absolute', left: '12px', color: '#94a3b8' }} />
              <input
                type="password"
                name="password"
                required
                placeholder="Choose a strong password"
                value={formData.password}
                onChange={handleChange}
                className="form-input"
                style={{ paddingLeft: '36px', height: '40px' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#0f172a', marginBottom: '4px' }}>
                Mobile Phone
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <LuPhone size={16} style={{ position: 'absolute', left: '12px', color: '#94a3b8' }} />
                <input
                  type="text"
                  name="phone"
                  placeholder="+91 98200 11223"
                  value={formData.phone}
                  onChange={handleChange}
                  className="form-input"
                  style={{ paddingLeft: '36px', height: '40px' }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#0f172a', marginBottom: '4px' }}>
                Department Scope
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <LuBuilding size={16} style={{ position: 'absolute', left: '12px', color: '#94a3b8' }} />
                <input
                  type="text"
                  name="department"
                  placeholder="Business Development"
                  value={formData.department}
                  onChange={handleChange}
                  className="form-input"
                  style={{ paddingLeft: '36px', height: '40px' }}
                />
              </div>
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
              marginTop: '10px',
              marginBottom: '20px'
            }}
          >
            <span>Create account</span>
            <LuArrowRight size={16} />
          </button>
        </form>

        <div style={{ textAlign: 'center', fontSize: '0.85rem', color: '#64748b' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#2563eb', fontWeight: 600, textDecoration: 'none' }}>
            Log in
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
