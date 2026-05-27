import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import Table from '../components/ui/Table';
import Modal from '../components/ui/Modal';
import { useAuth } from '../context/AuthContext';
import { RiUserSharedLine, RiAddLine, RiLoader4Line, RiMailSendLine, RiFileCopyLine } from 'react-icons/ri';

const Leads = () => {
  const [leads, setLeads] = useState([]);
  const [associates, setAssociates] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState(null);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');
  const [status, setStatus] = useState('new');
  const [source, setSource] = useState('other');
  const [value, setValue] = useState(0);
  const [assignedTo, setAssignedTo] = useState('');
  const [team, setTeam] = useState('');
  const [notes, setNotes] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // AI Email Drafter State
  const [aiDraft, setAiDraft] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiCopied, setAiCopied] = useState(false);

  const { user } = useAuth();
  const userTeamId = typeof user?.team === 'object' ? user.team?._id : user?.team;

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      if (statusFilter) queryParams.append('status', statusFilter);
      if (sourceFilter) queryParams.append('source', sourceFilter);
      if (search) queryParams.append('search', search);

      const res = await api.get(`/leads?${queryParams.toString()}`);
      if (res.data.success) {
        setLeads(res.data.leads);
      }
    } catch (err) {
      console.error('Failed fetching leads', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDropdownData = async () => {
    try {
      const [userRes, teamRes] = await Promise.all([
        api.get('/users?role=bda'),
        api.get('/teams')
      ]);
      if (userRes.data.success) setAssociates(userRes.data.users);
      if (teamRes.data.success) setTeams(teamRes.data.teams);
    } catch (err) {
      console.error('Dropdown fetch error', err);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchLeads();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [search, statusFilter, sourceFilter]);

  useEffect(() => {
    fetchDropdownData();
  }, []);

  const openAddModal = () => {
    setEditingLead(null);
    setName('');
    setEmail('');
    setPhone('');
    setCompany('');
    setStatus('new');
    setSource('other');
    setValue(0);
    setAssignedTo(user?.role === 'bda' ? user?._id : associates[0]?._id || '');
    setTeam(user?.role === 'bda' ? userTeamId || '' : teams[0]?._id || '');
    setNotes('');
    setFollowUpDate('');
    setError('');
    setAiDraft('');
    setAiCopied(false);
    setModalOpen(true);
  };

  const handleDraftEmail = async () => {
    if (!name) return setError('Please enter a customer name first.');
    try {
      setAiLoading(true);
      setAiDraft('');
      setAiCopied(false);
      const res = await api.post('/ai/draft-email', {
        name,
        company: company || 'their company',
        notes: notes || 'Initial outreach, no prior conversation yet.'
      });
      if (res.data.success) {
        setAiDraft(res.data.emailDraft);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'AI drafting failed. Check your API key.');
    } finally {
      setAiLoading(false);
    }
  };

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(aiDraft);
    setAiCopied(true);
    setTimeout(() => setAiCopied(false), 2000);
  };

  const openEditModal = (lead) => {
    setEditingLead(lead);
    setName(lead.name);
    setEmail(lead.email || '');
    setPhone(lead.phone || '');
    setCompany(lead.company || '');
    setStatus(lead.status || 'new');
    setSource(lead.source || 'other');
    setValue(lead.value || 0);
    setAssignedTo(lead.assignedTo?._id || '');
    setTeam(lead.team?._id || '');
    setNotes(lead.notes || '');
    setFollowUpDate(lead.followUpDate ? new Date(lead.followUpDate).toISOString().substring(0, 10) : '');
    setError('');
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!name || (user?.role !== 'bda' && !assignedTo)) {
      return setError('Please enter a lead name and assign to a representative.');
    }

    try {
      setSaving(true);
      setError('');
      
      const payload = {
        name,
        email,
        phone,
        company,
        status,
        source,
        value,
        assignedTo: user?.role === 'bda' ? user?._id : assignedTo,
        team: user?.role === 'bda' ? userTeamId || undefined : team || undefined,
        notes,
        followUpDate: followUpDate || undefined
      };

      if (editingLead) {
        const res = await api.put(`/leads/${editingLead._id}`, payload);
        if (res.data.success) {
          setLeads(leads.map((l) => (l._id === editingLead._id ? res.data.lead : l)));
          setModalOpen(false);
        }
      } else {
        const res = await api.post('/leads', payload);
        if (res.data.success) {
          setLeads([res.data.lead, ...leads]);
          setModalOpen(false);
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error occurred while saving lead pipeline info.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this lead?')) {
      try {
        const res = await api.delete(`/leads/${id}`);
        if (res.data.success) {
          setLeads(leads.filter((l) => l._id !== id));
        }
      } catch (err) {
        alert('Failed to delete lead.');
      }
    }
  };

  const columns = [
    {
      key: 'name',
      label: 'Prospect / Client',
      render: (val, row) => (
        <div>
          <div style={{ fontWeight: 600 }}>{val}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            {row.company || 'Individual Client'}
          </div>
        </div>
      )
    },
    {
      key: 'status',
      label: 'Current Stage',
      render: (val) => {
        let badgeClass = 'badge-primary';
        if (val === 'won') badgeClass = 'badge-success';
        if (val === 'lost') badgeClass = 'badge-danger';
        if (val === 'negotiation') badgeClass = 'badge-info';
        if (val === 'proposal') badgeClass = 'badge-warning';
        return <span className={`badge ${badgeClass}`}>{val}</span>;
      }
    },
    {
      key: 'value',
      label: 'Deal Value',
      render: (val) => <span style={{ fontWeight: 600 }}>₹{val.toLocaleString('en-IN')}</span>
    },
    {
      key: 'source',
      label: 'Channel Source',
      render: (val) => <span style={{ textTransform: 'capitalize' }}>{val.replace('_', ' ')}</span>
    },
    {
      key: 'assignedTo',
      label: 'Representative',
      render: (val) => <span>{val?.name || 'Unassigned'}</span>
    },
    {
      key: 'followUpDate',
      label: 'Follow Up',
      render: (val) => val ? new Date(val).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }) : '-'
    }
  ];

  return (
    <div>
      <div className="page-header">
        <div className="page-title-area">
          <h2>Potential Customers</h2>
          <p>Register qualified prospects, set deal values, and convert accounts.</p>
        </div>
        <button onClick={openAddModal} className="btn btn-primary">
          <RiAddLine />
          <span>New Customer</span>
        </button>
      </div>

      {/* Filter bar */}
      <div className="glass-card filter-bar">
        <div style={{ flex: 1, minWidth: '200px' }}>
          <input
            type="text"
            placeholder="Search leads by name or company..."
            className="form-control"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select className="filter-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All Stages</option>
          <option value="new">New</option>
          <option value="contacted">Contacted</option>
          <option value="qualified">Qualified</option>
          <option value="proposal">Proposal</option>
          <option value="negotiation">Negotiation</option>
          <option value="won">Won Deals</option>
          <option value="lost">Lost Deals</option>
        </select>
        <select className="filter-select" value={sourceFilter} onChange={(e) => setSourceFilter(e.target.value)}>
          <option value="">All Sources</option>
          <option value="website">Website</option>
          <option value="referral">Referral</option>
          <option value="cold_call">Cold Call</option>
          <option value="social_media">Social Media</option>
          <option value="event">Event</option>
          <option value="other">Other</option>
        </select>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', margin: '80px 0' }}>
          <RiLoader4Line className="spin" style={{ fontSize: '2.5rem', color: 'var(--accent-primary)' }} />
        </div>
      ) : leads.length === 0 ? (
        <div className="glass-card empty-state">
          <RiUserSharedLine />
          <h3>No Customers Found</h3>
          <p>Add your first prospect here. Dashboard charts and revenue cards update from these lead records.</p>
          <button onClick={openAddModal} className="btn btn-primary" style={{ marginTop: '18px' }}>
            <RiAddLine />
            <span>New Customer</span>
          </button>
        </div>
      ) : (
        <div className="glass-card" style={{ padding: '10px' }}>
          <Table
            columns={columns}
            data={leads}
            onEdit={openEditModal}
            onDelete={user?.role !== 'bda' ? handleDelete : null}
          />
        </div>
      )}

      {/* Lead Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingLead ? 'Update Customer Details' : 'Onboard New Prospect'}>
        <form onSubmit={handleSave}>
          {error && <div className="alert alert-danger" style={{ marginBottom: '15px' }}>{error}</div>}

          <div className="form-group">
            <label>Prospect Name / Point of Contact</label>
            <input
              type="text"
              placeholder="e.g. Ramesh Kumar"
              className="form-control"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Company / Organization Name</label>
              <input
                type="text"
                placeholder="e.g. Acme Corp"
                className="form-control"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Estimated Deal Value (₹)</label>
              <input
                type="number"
                placeholder="0"
                className="form-control"
                value={value}
                onChange={(e) => setValue(parseInt(e.target.value) || 0)}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                placeholder="poc@company.com"
                className="form-control"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Phone Number</label>
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
              <label>Pipeline Status</label>
              <select className="form-control" value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="new">New / Discovery</option>
                <option value="contacted">Contacted</option>
                <option value="qualified">Qualified Partner</option>
                <option value="proposal">Proposal Submitted</option>
                <option value="negotiation">Price Negotiation</option>
                <option value="won">Deal Won</option>
                <option value="lost">Deal Lost</option>
              </select>
            </div>

            <div className="form-group">
              <label>Lead Capture Source</label>
              <select className="form-control" value={source} onChange={(e) => setSource(e.target.value)}>
                <option value="website">Website Form</option>
                <option value="referral">Partner Referral</option>
                <option value="cold_call">Cold Pitch / Outreach</option>
                <option value="social_media">Social Networks</option>
                <option value="event">Expo / Event</option>
                <option value="other">Other Channels</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            {user?.role === 'bda' ? (
              <div className="form-group">
                <label>Assigned Representative</label>
                <input className="form-control" value={user?.name || 'Me'} disabled />
              </div>
            ) : (
              <div className="form-group">
                <label>Assigned Representative (Associate)</label>
                <select className="form-control" value={assignedTo} onChange={(e) => setAssignedTo(e.target.value)}>
                  <option value="">Select Associate</option>
                  {associates.map((a) => (
                    <option key={a._id} value={a._id}>
                      {a.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="form-group">
              <label>Next Follow Up Date</label>
              <input
                type="date"
                className="form-control"
                value={followUpDate}
                onChange={(e) => setFollowUpDate(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Discussion Notes & Next Steps</label>
            <textarea
              placeholder="Record details of conversation, feature requirements, or contract conditions..."
              className="form-control"
              style={{ minHeight: '80px', resize: 'vertical' }}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          {/* AI Email Drafter Section */}
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '20px', marginTop: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <label style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700, color: 'var(--accent-primary)' }}>✨ AI Email Drafter</label>
              <button
                type="button"
                onClick={handleDraftEmail}
                className="btn btn-secondary btn-sm"
                disabled={aiLoading}
                style={{ gap: '6px' }}
              >
                {aiLoading ? <RiLoader4Line className="spin" /> : <RiMailSendLine />}
                {aiLoading ? 'Generating...' : 'Draft Email'}
              </button>
            </div>
            {aiDraft && (
              <div style={{ position: 'relative' }}>
                <textarea
                  className="form-control"
                  style={{ minHeight: '140px', resize: 'vertical', fontSize: '0.88rem', lineHeight: '1.6' }}
                  value={aiDraft}
                  onChange={(e) => setAiDraft(e.target.value)}
                />
                <button
                  type="button"
                  onClick={handleCopyEmail}
                  className="btn btn-sm"
                  style={{
                    position: 'absolute', top: '8px', right: '8px',
                    background: aiCopied ? 'var(--success)' : 'rgba(255,255,255,0.1)',
                    color: aiCopied ? '#000' : 'var(--text-primary)',
                    padding: '4px 10px', fontSize: '0.75rem'
                  }}
                >
                  <RiFileCopyLine /> {aiCopied ? 'Copied!' : 'Copy'}
                </button>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '15px', justifyContent: 'flex-end', marginTop: '20px' }}>
            <button type="button" onClick={() => setModalOpen(false)} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? <RiLoader4Line className="spin" /> : 'Save Lead'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Leads;
