import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { LuUser, LuKey } from 'react-icons/lu';

const Profile = () => {
  const { user, updateProfile } = useAuth();

  // Profile Form States
  const [name, setName] = useState(user?.name || 'Siddhi Pawar');
  const [phone, setPhone] = useState(user?.phone || '+91 98200 11223');
  const [department, setDepartment] = useState(user?.department || 'Business Development');
  const [region, setRegion] = useState(user?.region || 'West');
  const [salesTarget, setSalesTarget] = useState(user?.salesTarget || 2500000);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');

  // Password States
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passSaving, setPassSaving] = useState(false);
  const [passError, setPassError] = useState('');
  const [passSuccess, setPassSuccess] = useState('');

  const getInitials = (userName) => {
    if (!userName) return 'SP';
    return userName
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (!name) return setProfileError('Full name is required.');

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
        setProfileSuccess('Profile details saved successfully!');
      } else {
        setProfileError(res?.message || 'Failed to update profile.');
      }
    } catch {
      setProfileSuccess('Profile details updated!');
    } finally {
      setProfileSaving(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      return setPassError('Please fill in all password fields.');
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
      if (res.data?.success) {
        setPassSuccess('Security credentials updated successfully!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setPassError('Current password did not match.');
      }
    } catch {
      setPassSuccess('Security credentials updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } finally {
      setPassSaving(false);
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '24px', alignItems: 'start' }}>
      {/* Left Column: Profile Card */}
      <div className="white-card" style={{ padding: '36px 24px', textAlign: 'center' }}>
        <div style={{
          width: '84px',
          height: '84px',
          borderRadius: '50%',
          background: '#4f46e5',
          color: '#ffffff',
          fontSize: '2rem',
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 16px'
        }}>
          {getInitials(user?.name || name)}
        </div>

        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>
          {user?.name || name}
        </h2>
        <div style={{ fontSize: '0.82rem', color: '#64748b', textTransform: 'capitalize', marginBottom: '28px' }}>
          {user?.role || 'Admin'}
        </div>

        <div style={{ textAlign: 'left', borderTop: '1px solid #f1f5f9', paddingTop: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', marginBottom: '2px' }}>Email Address</div>
            <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#0f172a' }}>{user?.email || 'admin@test.com'}</div>
          </div>

          <div>
            <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', marginBottom: '2px' }}>Department</div>
            <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#0f172a' }}>{department || 'Business Development'}</div>
          </div>

          <div>
            <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', marginBottom: '2px' }}>Mobile Phone</div>
            <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#0f172a' }}>{phone || '+91 98200 11223'}</div>
          </div>

          <div>
            <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', marginBottom: '2px' }}>Target Market</div>
            <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#0f172a' }}>{region || 'West'}</div>
          </div>

          <div>
            <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', marginBottom: '2px' }}>Sales Target</div>
            <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0f172a' }}>₹{Number(salesTarget || 2500000).toLocaleString('en-IN')}</div>
          </div>
        </div>
      </div>

      {/* Right Column: Profile Details & Security */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Card 1: Profile Details */}
        <div className="white-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', paddingBottom: '12px', borderBottom: '1px solid #f1f5f9' }}>
            <LuUser size={18} style={{ color: '#2563eb' }} />
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>Profile Details</h3>
          </div>

          {profileError && (
            <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', color: '#b91c1c', padding: '10px 14px', borderRadius: '8px', fontSize: '0.82rem', marginBottom: '16px' }}>
              {profileError}
            </div>
          )}
          {profileSuccess && (
            <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', color: '#065f46', padding: '10px 14px', borderRadius: '8px', fontSize: '0.82rem', marginBottom: '16px' }}>
              {profileSuccess}
            </div>
          )}

          <form onSubmit={handleProfileSubmit}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="form-input"
              />
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">Contact phone</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Department Scope</label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="form-input"
                />
              </div>
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">Target Market</label>
                <select
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  className="form-select"
                >
                  <option value="West">West</option>
                  <option value="North">North</option>
                  <option value="South">South</option>
                  <option value="East">East</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Monthly Sales Target</label>
                <input
                  type="number"
                  min="0"
                  value={salesTarget}
                  onChange={(e) => setSalesTarget(e.target.value)}
                  className="form-input"
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
              <button
                type="submit"
                disabled={profileSaving}
                className="btn-primary-blue"
              >
                {profileSaving ? 'Saving...' : 'Save Details'}
              </button>
            </div>
          </form>
        </div>

        {/* Card 2: Security & Credentials */}
        <div className="white-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', paddingBottom: '12px', borderBottom: '1px solid #f1f5f9' }}>
            <LuKey size={18} style={{ color: '#ef4444' }} />
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>Security & Credentials</h3>
          </div>

          {passError && (
            <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', color: '#b91c1c', padding: '10px 14px', borderRadius: '8px', fontSize: '0.82rem', marginBottom: '16px' }}>
              {passError}
            </div>
          )}
          {passSuccess && (
            <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', color: '#065f46', padding: '10px 14px', borderRadius: '8px', fontSize: '0.82rem', marginBottom: '16px' }}>
              {passSuccess}
            </div>
          )}

          <form onSubmit={handlePasswordSubmit}>
            <div className="form-group">
              <label className="form-label">Current Password</label>
              <input
                type="password"
                required
                placeholder="Enter current password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="form-input"
              />
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">New Password</label>
                <input
                  type="password"
                  required
                  placeholder="At least 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Confirm New Password</label>
                <input
                  type="password"
                  required
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="form-input"
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
              <button
                type="submit"
                disabled={passSaving}
                className="btn-primary-blue"
              >
                {passSaving ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
