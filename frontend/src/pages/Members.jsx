import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import {
  LuPlus,
  LuSearch,
  LuPencil,
  LuTrash2,
  LuX,
  LuShield,
  LuUserCheck,
  LuUser
} from 'react-icons/lu';

const Members = () => {
  const { user } = useAuth();
  const [members, setMembers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(false);

  // Filters
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'bda',
    phone: '',
    department: 'Business Development',
    region: 'West',
    salesTarget: 0,
    team: '',
    isActive: true
  });

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (roleFilter) params.append('role', roleFilter);
      if (statusFilter) params.append('isActive', statusFilter);

      const res = await api.get(`/users?${params.toString()}`);
      if (res.data?.success) {
        setMembers(res.data.users || []);
      } else {
        setMembers([]);
      }
    } catch {
      setMembers([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchTeams = async () => {
    try {
      const res = await api.get('/teams');
      if (res.data?.success) setTeams(res.data.teams);
    } catch {
      // Fallback
    }
  };

  useEffect(() => {
    fetchMembers();
    fetchTeams();
  }, [roleFilter, statusFilter]);

  const openAddModal = () => {
    setEditingMember(null);
    setFormData({
      name: '',
      email: '',
      password: 'password123',
      role: 'bda',
      phone: '',
      department: 'Business Development',
      region: 'West',
      salesTarget: 850000,
      team: teams[0]?._id || '',
      isActive: true
    });
    setModalOpen(true);
  };

  const openEditModal = (m) => {
    setEditingMember(m);
    setFormData({
      name: m.name || '',
      email: m.email || '',
      password: '',
      role: m.role || 'bda',
      phone: m.phone || '',
      department: m.department || 'Business Development',
      region: m.region || 'West',
      salesTarget: m.salesTarget || 850000,
      team: m.team?._id || m.team || '',
      isActive: m.isActive !== undefined ? m.isActive : true
    });
    setModalOpen(true);
  };

  const handleSaveMember = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData };
      if (!payload.password) delete payload.password;

      if (editingMember) {
        await api.put(`/users/${editingMember._id}`, payload);
      } else {
        await api.post('/users', payload);
      }
      setModalOpen(false);
      fetchMembers();
    } catch {
      if (editingMember) {
        setMembers(members.map((m) => (m._id === editingMember._id ? { ...m, ...formData } : m)));
      } else {
        const newM = {
          _id: 'mem-local-' + Date.now(),
          ...formData,
          team: { name: 'Western Wolves' }
        };
        setMembers([...members, newM]);
      }
      setModalOpen(false);
    }
  };

  const handleDeleteMember = async (id) => {
    if (!window.confirm('Delete this team member account?')) return;
    try {
      await api.delete(`/users/${id}`);
      setMembers(members.filter((m) => m._id !== id));
    } catch {
      setMembers(members.filter((m) => m._id !== id));
    }
  };

  const filteredMembers = members.filter((m) => {
    if (search) {
      const q = search.toLowerCase();
      return m.name?.toLowerCase().includes(q) || m.email?.toLowerCase().includes(q);
    }
    return true;
  });

  const getRoleBadge = (role) => {
    switch (role) {
      case 'admin':
        return <span className="status-pill" style={{ background: '#f3e8ff', color: '#7c3aed' }}>Admin</span>;
      case 'manager':
        return <span className="status-pill" style={{ background: '#eff6ff', color: '#2563eb' }}>Manager</span>;
      default:
        return <span className="status-pill" style={{ background: '#ecfdf5', color: '#059669' }}>Associate</span>;
    }
  };

  return (
    <div>
      {/* Page Header */}
      <div className="page-title-row">
        <div>
          <h1 className="page-title">Team Members</h1>
          <p className="page-subtitle">Manage sales representatives, team managers, and administrator accounts.</p>
        </div>

        <button onClick={openAddModal} className="btn-primary-blue">
          <LuPlus size={16} />
          <span>New Member</span>
        </button>
      </div>

      {/* Filter Row */}
      <div className="filter-bar-card">
        <div style={{ position: 'relative', flex: '1', minWidth: '240px' }}>
          <LuSearch size={16} style={{ position: 'absolute', left: '12px', top: '11px', color: '#94a3b8' }} />
          <input
            type="text"
            placeholder="Search members by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="filter-input-search"
          />
        </div>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="filter-select"
        >
          <option value="">All Roles</option>
          <option value="admin">Administrators</option>
          <option value="manager">Managers</option>
          <option value="bda">Associates (BDA)</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="filter-select"
        >
          <option value="">All Statuses</option>
          <option value="true">Active Only</option>
          <option value="false">Inactive</option>
        </select>
      </div>

      {/* Members Table */}
      <div className="white-card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="clean-data-table">
          <thead>
            <tr>
              <th style={{ paddingLeft: '24px' }}>Member Profile</th>
              <th>Role</th>
              <th>Assigned Team</th>
              <th>Contact Phone</th>
              <th>Status</th>
              <th>Monthly Target</th>
              <th style={{ textAlign: 'right', paddingRight: '24px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredMembers.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: '#94a3b8', fontSize: '0.85rem' }}>
                  No members found matching your filter criteria. Click '+ New Member' to onboard sales reps.
                </td>
              </tr>
            ) : (
              filteredMembers.map((m) => (
                <tr key={m._id}>
                  <td style={{ paddingLeft: '24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div className="avatar-circle" style={{ width: '32px', height: '32px', fontSize: '0.8rem', background: '#e0e7ff', color: '#3730a3' }}>
                        {m.name ? m.name[0] : 'U'}
                      </div>
                      <div>
                        <div className="cell-bold-main">{m.name}</div>
                        <div className="cell-sub-muted">{m.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>{getRoleBadge(m.role)}</td>
                  <td>{m.team?.name || 'Unassigned'}</td>
                  <td>{m.phone || '—'}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: m.isActive ? '#10b981' : '#ef4444' }} />
                      <span style={{ fontSize: '0.78rem', color: m.isActive ? '#059669' : '#dc2626', fontWeight: 600 }}>
                        {m.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </td>
                  <td>
                    <span style={{ fontWeight: 700, color: '#0f172a' }}>
                      ₹{Number(m.salesTarget || 0).toLocaleString('en-IN')}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right', paddingRight: '24px' }}>
                    <button onClick={() => openEditModal(m)} className="action-icon-btn" title="Edit">
                      <LuPencil size={14} />
                    </button>
                    <button onClick={() => handleDeleteMember(m._id)} className="action-icon-btn delete" title="Delete">
                      <LuTrash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Member Modal */}
      {modalOpen && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h2 className="modal-title">{editingMember ? 'Edit Team Member' : 'Add New Member'}</h2>
              <button onClick={() => setModalOpen(false)} className="modal-close-btn">
                <LuX />
              </button>
            </div>

            <form onSubmit={handleSaveMember}>
              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rahul Verma"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="member@company.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">System Role</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="form-select"
                  >
                    <option value="bda">Business Development Associate</option>
                    <option value="manager">Team Manager</option>
                    {user?.role === 'admin' && <option value="admin">Administrator</option>}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Assigned Team</label>
                  <select
                    value={formData.team}
                    onChange={(e) => setFormData({ ...formData, team: e.target.value })}
                    className="form-select"
                  >
                    <option value="">No Team Assigned</option>
                    {teams.map((t) => (
                      <option key={t._id} value={t._id}>{t.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Mobile Phone</label>
                  <input
                    type="text"
                    placeholder="+91 98200 11223"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Monthly Target (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.salesTarget}
                    onChange={(e) => setFormData({ ...formData, salesTarget: e.target.value })}
                    className="form-input"
                  />
                </div>
              </div>

              {!editingMember && (
                <div className="form-group">
                  <label className="form-label">Initial Password *</label>
                  <input
                    type="password"
                    required
                    placeholder="At least 6 characters"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="form-input"
                  />
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  style={{
                    background: '#ffffff',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    padding: '8px 16px',
                    fontSize: '0.84rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary-blue">
                  {editingMember ? 'Save Member' : 'Create Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Members;
