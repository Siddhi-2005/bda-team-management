import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import Modal from '../components/ui/Modal';
import { useAuth } from '../context/AuthContext';
import { RiAddLine, RiFolderUserLine, RiLoader4Line } from 'react-icons/ri';

const Teams = () => {
  const [teams, setTeams] = useState([]);
  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState(null);
  
  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [manager, setManager] = useState('');
  const [region, setRegion] = useState('North');
  const [target, setTarget] = useState(0);
  const [achieved, setAchieved] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const { user } = useAuth();

  const fetchTeams = async () => {
    try {
      setLoading(true);
      const res = await api.get('/teams');
      if (res.data.success) {
        setTeams(res.data.teams);
      }
    } catch (err) {
      console.error('Failed fetching teams', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchManagers = async () => {
    try {
      const res = await api.get('/users?role=manager');
      if (res.data.success) {
        setManagers(res.data.users);
      }
    } catch (err) {
      console.error('Failed fetching managers', err);
    }
  };

  useEffect(() => {
    fetchTeams();
    fetchManagers();
  }, []);

  const openAddModal = () => {
    setEditingTeam(null);
    setName('');
    setDescription('');
    setManager(managers[0]?._id || '');
    setRegion('North');
    setTarget(0);
    setAchieved(0);
    setError('');
    setModalOpen(true);
  };

  const openEditModal = (team) => {
    setEditingTeam(team);
    setName(team.name);
    setDescription(team.description || '');
    setManager(team.manager?._id || '');
    setRegion(team.region || 'North');
    setTarget(team.target || 0);
    setAchieved(team.achieved || 0);
    setError('');
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!name || !manager) {
      return setError('Please enter a team name and select a manager.');
    }

    try {
      setSaving(true);
      setError('');
      const payload = { name, description, manager, region, target, achieved };
      
      if (editingTeam) {
        const res = await api.put(`/teams/${editingTeam._id}`, payload);
        if (res.data.success) {
          setTeams(teams.map((t) => (t._id === editingTeam._id ? res.data.team : t)));
          setModalOpen(false);
        }
      } else {
        const res = await api.post('/teams', payload);
        if (res.data.success) {
          setTeams([res.data.team, ...teams]);
          setModalOpen(false);
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error occurred while saving team details.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this team?')) {
      try {
        const res = await api.delete(`/teams/${id}`);
        if (res.data.success) {
          setTeams(teams.filter((t) => t._id !== id));
        }
      } catch (err) {
        alert(err.response?.data?.message || 'Error occurred while deleting team.');
      }
    }
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-title-area">
          <h2>Team Management</h2>
          <p>Create sales units, assign team heads, and view overall region targets.</p>
        </div>
        {user?.role !== 'bda' && (
          <button onClick={openAddModal} className="btn btn-primary">
            <RiAddLine />
            <span>Create Team</span>
          </button>
        )}
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', margin: '80px 0' }}>
          <RiLoader4Line className="spin" style={{ fontSize: '2.5rem', color: 'var(--accent-primary)' }} />
        </div>
      ) : teams.length === 0 ? (
        <div className="glass-card empty-state">
          <RiFolderUserLine />
          <h3>No Teams Configured</h3>
          <p>Get started by creating a new Business Development team.</p>
        </div>
      ) : (
        <div className="teams-grid">
          {teams.map((team) => {
            const pct = team.target > 0 ? Math.round((team.achieved / team.target) * 100) : 0;
            return (
              <div key={team._id} className="glass-card team-card">
                <div className="team-card-header">
                  <div>
                    <h3 className="team-name">{team.name}</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '4px' }}>
                      Lead: {team.manager?.name || 'Unassigned'}
                    </p>
                  </div>
                  <span className="team-region">{team.region} Market</span>
                </div>

                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', minHeight: '40px' }}>
                  {team.description || 'No description provided.'}
                </p>

                <div className="team-stats">
                  <div className="team-stat-item">
                    <span className="team-stat-label">Target (₹)</span>
                    <span className="team-stat-val">₹{team.target.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="team-stat-item">
                    <span className="team-stat-label">Achieved (₹)</span>
                    <span className="team-stat-val" style={{ color: 'var(--success)' }}>
                      ₹{team.achieved.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '8px' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Target Completion</span>
                    <span style={{ fontWeight: 'bold' }}>{pct}%</span>
                  </div>
                  <div className="progress-bar-container">
                    <div className="progress-bar" style={{ width: `${Math.min(pct, 100)}%` }}></div>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '15px' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    {team.members?.length || 0} Members
                  </span>
                  {user?.role !== 'bda' && (
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button onClick={() => openEditModal(team)} className="btn btn-sm btn-secondary">
                        Edit
                      </button>
                      <button onClick={() => handleDelete(team._id)} className="btn btn-sm btn-danger">
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Team Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingTeam ? 'Edit Sales Team' : 'Create Sales Team'}>
        <form onSubmit={handleSave}>
          {error && <div className="alert alert-danger" style={{ marginBottom: '15px' }}>{error}</div>}

          <div className="form-group">
            <label>Team Name</label>
            <input
              type="text"
              placeholder="e.g. Enterprise Sales North"
              className="form-control"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              placeholder="Provide context or regional scope of the team..."
              className="form-control"
              style={{ minHeight: '80px', resize: 'vertical' }}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Team Manager / Head</label>
              <select className="form-control" value={manager} onChange={(e) => setManager(e.target.value)}>
                {managers.map((m) => (
                  <option key={m._id} value={m._id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Operating Market</label>
              <select className="form-control" value={region} onChange={(e) => setRegion(e.target.value)}>
                <option value="North">North</option>
                <option value="South">South</option>
                <option value="East">East</option>
                <option value="West">West</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Target Value (₹)</label>
              <input
                type="number"
                placeholder="100000"
                className="form-control"
                value={target}
                onChange={(e) => setTarget(parseInt(e.target.value) || 0)}
              />
            </div>
            <div className="form-group">
              <label>Achieved Value (₹)</label>
              <input
                type="number"
                placeholder="0"
                className="form-control"
                value={achieved}
                onChange={(e) => setAchieved(parseInt(e.target.value) || 0)}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '15px', justifyContent: 'flex-end', marginTop: '20px' }}>
            <button type="button" onClick={() => setModalOpen(false)} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? <RiLoader4Line className="spin" /> : 'Save Team'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Teams;
