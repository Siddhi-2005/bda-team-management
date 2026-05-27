import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  RiUserLine,
  RiMailLine,
  RiLockLine,
  RiShieldUserLine,
  RiLoader4Line,
  RiPhoneLine,
  RiBuilding2Line,
  RiMapPinLine,
  RiMoneyDollarCircleLine,
  RiGroupLine,
  RiTaskLine,
  RiLineChartLine
} from 'react-icons/ri';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('bda');
  const [phone, setPhone] = useState('');
  const [department, setDepartment] = useState('Business Development');
  const [region, setRegion] = useState('North');
  const [salesTarget, setSalesTarget] = useState('');
  const [teamName, setTeamName] = useState('');
  const [activeTaskCount, setActiveTaskCount] = useState('0');
  const [openLeadCount, setOpenLeadCount] = useState('0');
  const [pipelineValue, setPipelineValue] = useState('');
  const [wonRevenue, setWonRevenue] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password || !department || !region) {
      return setErr('Please fill in all fields.');
    }
    
    try {
      setLoading(true);
      setErr('');
      const res = await register({
        name,
        email,
        password,
        role,
        phone,
        department,
        region,
        salesTarget: Number(salesTarget) || 0,
        teamName,
        activeTaskCount: Number(activeTaskCount) || 0,
        openLeadCount: Number(openLeadCount) || 0,
        pipelineValue: Number(pipelineValue) || 0,
        wonRevenue: Number(wonRevenue) || 0
      });
      if (res && res.success) {
        navigate('/dashboard');
      } else {
        setErr(res?.message || 'Registration failed.');
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
          <div className="auth-logo">Create Account</div>
          <p>Register a new Business Development Associate profile or team manager account.</p>
        </div>

        {err && <div className="alert alert-danger">{err}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name</label>
            <div style={{ position: 'relative' }}>
              <RiUserLine 
                style={{ 
                  position: 'absolute', 
                  left: '16px', 
                  top: '50%', 
                  transform: 'translateY(-50%)', 
                  color: 'var(--text-secondary)' 
                }} 
              />
              <input
                type="text"
                placeholder="John Doe"
                className="form-control"
                style={{ paddingLeft: '45px' }}
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          </div>

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
                placeholder="At least 6 characters"
                className="form-control"
                style={{ paddingLeft: '45px' }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>System Role</label>
            <div style={{ position: 'relative' }}>
              <RiShieldUserLine 
                style={{ 
                  position: 'absolute', 
                  left: '16px', 
                  top: '50%', 
                  transform: 'translateY(-50%)', 
                  color: 'var(--text-secondary)' 
                }} 
              />
              <select
                className="form-control"
                style={{ paddingLeft: '45px' }}
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="bda">Business Development Associate (BDA)</option>
                <option value="manager">Team Manager</option>
                <option value="admin">System Administrator</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Phone</label>
              <div style={{ position: 'relative' }}>
                <RiPhoneLine 
                  style={{ 
                    position: 'absolute', 
                    left: '16px', 
                    top: '50%', 
                    transform: 'translateY(-50%)', 
                    color: 'var(--text-secondary)' 
                  }} 
                />
                <input
                  type="text"
                  placeholder="+91 XXXXXXXXXX"
                  className="form-control"
                  style={{ paddingLeft: '45px' }}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Department</label>
              <div style={{ position: 'relative' }}>
                <RiBuilding2Line 
                  style={{ 
                    position: 'absolute', 
                    left: '16px', 
                    top: '50%', 
                    transform: 'translateY(-50%)', 
                    color: 'var(--text-secondary)' 
                  }} 
                />
                <input
                  type="text"
                  placeholder="Enterprise Sales"
                  className="form-control"
                  style={{ paddingLeft: '45px' }}
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          {role !== 'admin' && (
            <div className="form-row">
            <div className="form-group">
              <label>Target Market</label>
              <div style={{ position: 'relative' }}>
                <RiMapPinLine 
                  style={{ 
                    position: 'absolute', 
                    left: '16px', 
                    top: '50%', 
                    transform: 'translateY(-50%)', 
                    color: 'var(--text-secondary)' 
                  }} 
                />
                <select
                  className="form-control"
                  style={{ paddingLeft: '45px' }}
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                >
                  <option value="North">North</option>
                  <option value="South">South</option>
                  <option value="East">East</option>
                  <option value="West">West</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Monthly Sales Target</label>
              <div style={{ position: 'relative' }}>
                <RiMoneyDollarCircleLine 
                  style={{ 
                    position: 'absolute', 
                    left: '16px', 
                    top: '50%', 
                    transform: 'translateY(-50%)', 
                    color: 'var(--text-secondary)' 
                  }} 
                />
                <input
                  type="number"
                  min="0"
                  placeholder="500000"
                  className="form-control"
                  style={{ paddingLeft: '45px' }}
                  value={salesTarget}
                  onChange={(e) => setSalesTarget(e.target.value)}
                />
              </div>
            </div>
          </div>

          )}

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', marginTop: '10px', height: '48px' }}
            disabled={loading}
          >
            {loading ? (
              <RiLoader4Line className="spin" style={{ fontSize: '1.4rem' }} />
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account? 
          <Link to="/login" className="auth-link">Login here</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
