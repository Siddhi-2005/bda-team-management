import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { RiUser3Line, RiLockPasswordLine, RiLoader4Line } from 'react-icons/ri';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  
  // Profile Form States
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [department, setDepartment] = useState(user?.department || '');
  const [region, setRegion] = useState(user?.region || 'North');
  const [salesTarget, setSalesTarget] = useState(user?.salesTarget || 0);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');

  // Password Change States
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passSaving, setPassSaving] = useState(false);
  const [passError, setPassError] = useState('');
  const [passSuccess, setPassSuccess] = useState('');

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (!name) return setProfileError('Name is required.');

    try {
      setProfileSaving(true);
      setProfileError('');
      setProfileSuccess('');
      
      const res = await updateProfile({
        name,
        phone,
        department,
        region,
        salesTarget: Number(salesTarget) || 0
      });
      if (res && res.success) {
        setProfileSuccess('Profile details updated successfully!');
      } else {
        setProfileError(res?.message || 'Failed to update profile details.');
      }
    } catch (err) {
      setProfileError('Failed updating profile. Try again.');
    } finally {
      setProfileSaving(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      return setPassError('Please enter all password fields.');
    }
    if (newPassword !== confirmPassword) {
      return setPassError('New passwords do not match.');
    }
    if (newPassword.length < 6) {
      return setPassError('New password must be at least 6 characters.');
    }

    try {
      setPassSaving(true);
      setPassError('');
      setPassSuccess('');
      
      const res = await api.put('/auth/password', { currentPassword, newPassword });
      if (res.data.success) {
        setPassSuccess('Security credentials updated successfully!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err) {
      setPassError(err.response?.data?.message || 'Password update failed. Verify current credentials.');
    } finally {
      setPassSaving(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '30px' }}>
      {/* Left side: Profile Summary Card */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div className="glass-card" style={{ textAlign: 'center', padding: '40px 20px' }}>
          <div 
            className="navbar-profile-avatar" 
            style={{ 
              width: '90px', 
              height: '90px', 
              fontSize: '2.5rem', 
              margin: '0 auto 20px',
              borderRadius: '50%',
              background: 'var(--accent-gradient)',
              color: 'white',
              boxShadow: '0 10px 25px rgba(108,99,255,0.3)'
            }}
          >
            {getInitials(user?.name)}
          </div>
          <h3 style={{ fontSize: '1.3rem', fontWeight: 700 }}>{user?.name}</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px', marginTop: '6px' }}>
            {user?.role}
          </p>

          <div style={{ textAlign: 'left', marginTop: '35px', display: 'flex', flexDirection: 'column', gap: '15px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '25px' }}>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Email Address</span>
              <p style={{ fontSize: '0.95rem', fontWeight: 500, marginTop: '2px' }}>{user?.email}</p>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Department</span>
              <p style={{ fontSize: '0.95rem', fontWeight: 500, marginTop: '2px' }}>{user?.department || 'Business Development'}</p>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Mobile Phone</span>
              <p style={{ fontSize: '0.95rem', fontWeight: 500, marginTop: '2px' }}>{user?.phone || 'Not Configured'}</p>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Target Market</span>
              <p style={{ fontSize: '0.95rem', fontWeight: 500, marginTop: '2px' }}>{user?.region || 'North'}</p>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Sales Target</span>
              <p style={{ fontSize: '0.95rem', fontWeight: 500, marginTop: '2px' }}>
                â‚¹{Number(user?.salesTarget || 0).toLocaleString('en-IN')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right side: Forms */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
        {/* Profile details editor */}
        <div className="glass-card">
          <h3 className="chart-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <RiUser3Line style={{ color: 'var(--accent-primary)' }} />
            Profile Details
          </h3>
          
          <form onSubmit={handleProfileSubmit}>
            {profileError && <div className="alert alert-danger">{profileError}</div>}
            {profileSuccess && <div className="alert alert-success">{profileSuccess}</div>}

            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                className="form-control"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Contact phone</label>
                <input
                  type="text"
                  placeholder="+91 XXXXXXXXXX"
                  className="form-control"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Department Scope</label>
                <input
                  type="text"
                  placeholder="Enterprise Growth"
                  className="form-control"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Target Market</label>
                <select
                  className="form-control"
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                >
                  <option value="North">North</option>
                  <option value="South">South</option>
                  <option value="East">East</option>
                  <option value="West">West</option>
                </select>
              </div>
              <div className="form-group">
                <label>Monthly Sales Target</label>
                <input
                  type="number"
                  min="0"
                  placeholder="500000"
                  className="form-control"
                  value={salesTarget}
                  onChange={(e) => setSalesTarget(e.target.value)}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
              <button type="submit" className="btn btn-primary" disabled={profileSaving}>
                {profileSaving ? <RiLoader4Line className="spin" /> : 'Save Details'}
              </button>
            </div>
          </form>
        </div>

        {/* Password Security section */}
        <div className="glass-card">
          <h3 className="chart-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <RiLockPasswordLine style={{ color: 'var(--accent-secondary)' }} />
            Security & Credentials
          </h3>
          
          <form onSubmit={handlePasswordSubmit}>
            {passError && <div className="alert alert-danger">{passError}</div>}
            {passSuccess && <div className="alert alert-success">{passSuccess}</div>}

            <div className="form-group">
              <label>Current Password</label>
              <input
                type="password"
                placeholder="Enter current password"
                className="form-control"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>New Password</label>
                <input
                  type="password"
                  placeholder="At least 6 characters"
                  className="form-control"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Confirm New Password</label>
                <input
                  type="password"
                  placeholder="Confirm new password"
                  className="form-control"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
              <button type="submit" className="btn btn-primary" disabled={passSaving}>
                {passSaving ? <RiLoader4Line className="spin" /> : 'Update Password'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
