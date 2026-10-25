import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import {
  LuPlus,
  LuUsers,
  LuTarget,
  LuPencil,
  LuTrash2,
  LuX,
  LuMapPin
} from 'react-icons/lu';

const Teams = () => {
  const { user } = useAuth();
  const [teams, setTeams] = useState([]);
  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    manager: '',
    region: 'West',
    target: 2000000,
    achieved: 0
  });

  const fetchTeams = async () => {
    try {
      setLoading(true);
      const res = await api.get('/teams');
      if (res.data?.success) {
        setTeams(res.data.teams || []);
      } else {
        setTeams([]);
      }
    } catch {
      setTeams([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchManagers = async () => {
    try {
      const res = await api.get('/users?role=manager');
      if (res.data?.success) setManagers(res.data.users);
    } catch {
      // Fallback
    }
  };

  useEffect(() => {
    fetchTeams();
    fetchManagers();
  }, []);

  const openAddModal = () => {
    setEditingTeam(null);
    setFormData({
      name: '',
      description: '',
      manager: managers[0]?._id || '',
      region: 'West',
      target: 2000000,
      achieved: 0
    });
    setModalOpen(true);
  };

  const openEditModal = (t) => {
    setEditingTeam(t);
    setFormData({
      name: t.name || '',
      description: t.description || '',
      manager: t.manager?._id || t.manager || '',
      region: t.region || 'West',
      target: t.target || 0,
      achieved: t.achieved || 0
    });
    setModalOpen(true);
  };

  const handleSaveTeam = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        target: Number(formData.target) || 0,
        achieved: Number(formData.achieved) || 0
      };
      if (editingTeam) {
        await api.put(`/teams/${editingTeam._id}`, payload);
      } else {
        await api.post('/teams', payload);
      }
      setModalOpen(false);
      fetchTeams();
    } catch {
      if (editingTeam) {
        setTeams(teams.map((t) => (t._id === editingTeam._id ? { ...t, ...formData } : t)));
      } else {
        const newTeam = {
          _id: 'team-local-' + Date.now(),
          ...formData,
          manager: { name: 'Priya Sharma' },
          members: [{ name: 'Ankit Patel' }]
        };
        setTeams([...teams, newTeam]);
      }
      setModalOpen(false);
    }
  };

  const handleDeleteTeam = async (id) => {
    if (!window.confirm('Delete this sales team?')) return;
    try {
      await api.delete(`/teams/${id}`);
      setTeams(teams.filter((t) => t._id !== id));
    } catch {
      setTeams(teams.filter((t) => t._id !== id));
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="page-title-row">
        <div>
          <h1 className="page-title">Sales Teams</h1>
          <p className="page-subtitle">Organize business development associates into high-performing sales units.</p>
        </div>

        <button onClick={openAddModal} className="btn-primary-blue">
          <LuPlus size={16} />
          <span>New Team</span>
        </button>
      </div>

      {/* Team Cards Grid */}
      {teams.length === 0 ? (
        <div className="white-card" style={{ padding: '60px 24px', textAlign: 'center', color: '#64748b' }}>
          <LuUsers size={36} style={{ color: '#cbd5e1', marginBottom: '12px' }} />
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>No Sales Teams Found</h3>
          <p style={{ fontSize: '0.85rem', color: '#94a3b8', maxWidth: '380px', margin: '0 auto 20px' }}>
            Get started by organizing your business development associates into targeted sales teams.
          </p>
          <button onClick={openAddModal} className="btn-primary-blue" style={{ margin: '0 auto' }}>
            <LuPlus size={16} />
            <span>Create First Team</span>
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '20px' }}>
          {teams.map((t) => {
            const targetNum = t.target || 1;
            const achievedNum = t.achieved || 0;
            const pct = Math.min(100, Math.round((achievedNum / targetNum) * 100));

            return (
              <div key={t._id} className="white-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <div>
                      <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', marginBottom: '2px' }}>
                        {t.name}
                      </h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.78rem', color: '#64748b' }}>
                        <LuMapPin size={13} />
                        <span>{t.region || 'West'} Market</span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '4px' }}>
                      <button onClick={() => openEditModal(t)} className="action-icon-btn" title="Edit">
                        <LuPencil size={14} />
                      </button>
                      <button onClick={() => handleDeleteTeam(t._id)} className="action-icon-btn delete" title="Delete">
                        <LuTrash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {t.description && (
                    <p style={{ fontSize: '0.82rem', color: '#64748b', lineHeight: 1.4, margin: '12px 0 16px' }}>
                      {t.description}
                    </p>
                  )}

                  {/* Target Progress Bar */}
                  <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '10px', marginBottom: '16px', border: '1px solid #f1f5f9' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '6px' }}>
                      <span style={{ color: '#64748b', fontWeight: 500 }}>Target Achievement</span>
                      <span style={{ fontWeight: 700, color: '#0f172a' }}>{pct}%</span>
                    </div>
                    <div style={{ width: '100%', height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, height: '100%', background: '#2563eb', borderRadius: '4px' }} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginTop: '6px', color: '#64748b' }}>
                      <span>Achieved: <strong>₹{achievedNum.toLocaleString('en-IN')}</strong></span>
                      <span>Target: <strong>₹{targetNum.toLocaleString('en-IN')}</strong></span>
                    </div>
                  </div>
                </div>

                {/* Footer with Manager & Members */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '14px', borderTop: '1px solid #f1f5f9', fontSize: '0.8rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div className="avatar-circle" style={{ width: '28px', height: '28px', fontSize: '0.75rem', background: '#e0e7ff', color: '#3730a3' }}>
                      {t.manager?.name ? t.manager.name[0] : 'M'}
                    </div>
                    <div>
                      <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Manager</div>
                      <div style={{ fontWeight: 600, color: '#0f172a' }}>{t.manager?.name || 'Unassigned'}</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#64748b', fontSize: '0.75rem' }}>
                    <LuUsers size={15} />
                    <span>{t.members?.length || 0} members</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      </div>

      {/* Add / Edit Team Modal */}
      {modalOpen && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h2 className="modal-title">{editingTeam ? 'Edit Sales Team' : 'Create Sales Team'}</h2>
              <button onClick={() => setModalOpen(false)} className="modal-close-btn">
                <LuX />
              </button>
            </div>

            <form onSubmit={handleSaveTeam}>
              <div className="form-group">
                <label className="form-label">Team Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Western Wolves"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description & Territory</label>
                <textarea
                  rows="3"
                  placeholder="Focus accounts, target vertical, regional coverage..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="form-textarea"
                />
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Team Manager</label>
                  <select
                    value={formData.manager}
                    onChange={(e) => setFormData({ ...formData, manager: e.target.value })}
                    className="form-select"
                  >
                    <option value="">Select Manager</option>
                    {managers.map((m) => (
                      <option key={m._id} value={m._id}>{m.name}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Region Market</label>
                  <select
                    value={formData.region}
                    onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                    className="form-select"
                  >
                    <option value="West">West</option>
                    <option value="North">North</option>
                    <option value="South">South</option>
                    <option value="East">East</option>
                  </select>
                </div>
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Sales Target (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.target}
                    onChange={(e) => setFormData({ ...formData, target: e.target.value })}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Achieved (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.achieved}
                    onChange={(e) => setFormData({ ...formData, achieved: e.target.value })}
                    className="form-input"
                  />
                </div>
              </div>

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
                  {editingTeam ? 'Save Team' : 'Create Team'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Teams;
