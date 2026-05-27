import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import Table from '../components/ui/Table';
import Modal from '../components/ui/Modal';
import { useAuth } from '../context/AuthContext';
import { RiUserAddLine, RiLoader4Line } from 'react-icons/ri';

const Members = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState(null);

  // Filter States
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Form States
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('bda');
  const [phone, setPhone] = useState('');
  const [department, setDepartment] = useState('Business Development');
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const { user: currentUser } = useAuth();

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      if (roleFilter) queryParams.append('role', roleFilter);
      if (statusFilter) queryParams.append('isActive', statusFilter);
      if (search) queryParams.append('search', search);

      const res = await api.get(`/users?${queryParams.toString()}`);
      if (res.data.success) {
        setMembers(res.data.users);
      }
    } catch (err) {
      console.error('Failed fetching members', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Debounce search a bit
    const delayDebounceFn = setTimeout(() => {
      fetchMembers();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [search, roleFilter, statusFilter]);

  const openAddModal = () => {
    setEditingMember(null);
    setName('');
    setEmail('');
    setPassword('');
    setRole('bda');
    setPhone('');
    setDepartment('Business Development');
    setIsActive(true);
    setError('');
    setModalOpen(true);
  };

  const openEditModal = (member) => {
    setEditingMember(member);
    setName(member.name);
    setEmail(member.email);
    setPassword(''); // Leave empty for edit unless password changing is implemented differently
    setRole(member.role);
    setPhone(member.phone || '');
    setDepartment(member.department || 'Business Development');
    setIsActive(member.isActive);
    setError('');
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!name || !email) {
      return setError('Please enter a name and email.');
    }

    try {
      setSaving(true);
      setError('');
      
      const payload = { name, email, role, phone, department, isActive };
      if (!editingMember) {
        if (!password) return setError('Password is required for new users.');
        payload.password = password;
        const res = await api.post('/users', payload);
        if (res.data.success) {
          setMembers([res.data.user, ...members]);
          setModalOpen(false);
        }
      } else {
        const res = await api.put(`/users/${editingMember._id}`, payload);
        if (res.data.success) {
          setMembers(members.map((m) => (m._id === editingMember._id ? res.data.user : m)));
          setModalOpen(false);
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error occurred while saving member details.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to remove this user from the system?')) {
      try {
        const res = await api.delete(`/users/${id}`);
        if (res.data.success) {
          setMembers(members.filter((m) => m._id !== id));
        }
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to remove user.');
      }
    }
  };

  const columns = [
    {
      key: 'name',
      label: 'Representative',
      render: (val, row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div className="kanban-avatar" style={{ background: 'var(--accent-primary)' }}>
            {val[0]}
          </div>
          <div>
            <div style={{ fontWeight: 600 }}>{val}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{row.email}</div>
          </div>
        </div>
      )
    },
    {
      key: 'role',
      label: 'System Role',
      render: (val) => (
        <span className={`badge ${val === 'admin' ? 'badge-danger' : val === 'manager' ? 'badge-warning' : 'badge-primary'}`}>
          {val}
        </span>
      )
    },
    { key: 'department', label: 'Department' },
    {
      key: 'isActive',
      label: 'Status',
      render: (val) => (
        <span className={`badge ${val ? 'badge-success' : 'badge-danger'}`}>
          {val ? 'Active' : 'Deactivated'}
        </span>
      )
    },
    {
      key: 'joinedDate',
      label: 'Joined Date',
      render: (val) => new Date(val).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })
    }
  ];

  return (
    <div>
      <div className="page-header">
        <div className="page-title-area">
          <h2>Team Members</h2>
          <p>Add new Business Development executives, manage credentials and permissions, and assign departments.</p>
        </div>
        {currentUser?.role === 'admin' && (
          <button onClick={openAddModal} className="btn btn-primary">
            <RiUserAddLine />
            <span>Onboard Member</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-card filter-bar">
        <div style={{ flex: 1, minWidth: '200px' }}>
          <input
            type="text"
            placeholder="Search representatives by name..."
            className="form-control"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select className="filter-select" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
          <option value="">All Roles</option>
          <option value="admin">Administrator</option>
          <option value="manager">Manager</option>
          <option value="bda">Business Development Associate</option>
        </select>
        <select className="filter-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All Statuses</option>
          <option value="true">Active Only</option>
          <option value="false">Deactivated Only</option>
        </select>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', margin: '80px 0' }}>
          <RiLoader4Line className="spin" style={{ fontSize: '2.5rem', color: 'var(--accent-primary)' }} />
        </div>
      ) : (
        <div className="glass-card" style={{ padding: '10px' }}>
          <Table
            columns={columns}
            data={members}
            onEdit={currentUser?.role === 'admin' ? openEditModal : null}
            onDelete={currentUser?.role === 'admin' ? handleDelete : null}
          />
        </div>
      )}

      {/* Modal for User CRUD */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingMember ? 'Edit Associate Account' : 'Onboard Associate'}>
        <form onSubmit={handleSave}>
          {error && <div className="alert alert-danger" style={{ marginBottom: '15px' }}>{error}</div>}

          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              placeholder="e.g. Rahul Sharma"
              className="form-control"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                placeholder="sales.rep@company.com"
                className="form-control"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            {!editingMember && (
              <div className="form-group">
                <label>Default Password</label>
                <input
                  type="password"
                  placeholder="At least 6 chars"
                  className="form-control"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            )}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Role</label>
              <select className="form-control" value={role} onChange={(e) => setRole(e.target.value)}>
                <option value="bda">Business Development Associate</option>
                <option value="manager">Team Manager</option>
                <option value="admin">Administrator</option>
              </select>
            </div>
            <div className="form-group">
              <label>Contact Number</label>
              <input
                type="text"
                placeholder="+91 XXXXXXXXXX"
                className="form-control"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Department</label>
              <input
                type="text"
                placeholder="Business Development"
                className="form-control"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
              />
            </div>
            <div className="form-group" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <label style={{ marginBottom: '8px' }}>Account Status</label>
              <div style={{ display: 'flex', gap: '15px', alignItems: 'center', height: '100%' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.95rem' }}>
                  <input
                    type="radio"
                    name="status"
                    checked={isActive === true}
                    onChange={() => setIsActive(true)}
                  />
                  Active
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.95rem' }}>
                  <input
                    type="radio"
                    name="status"
                    checked={isActive === false}
                    onChange={() => setIsActive(false)}
                  />
                  Deactivated
                </label>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '15px', justifyContent: 'flex-end', marginTop: '25px' }}>
            <button type="button" onClick={() => setModalOpen(false)} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? <RiLoader4Line className="spin" /> : 'Save Profile'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Members;
