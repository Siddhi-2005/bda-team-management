import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import {
  LuPlus,
  LuSearch,
  LuDownload,
  LuPencil,
  LuTrash2,
  LuTable,
  LuKanban,
  LuX,
  LuSparkles,
  LuCopy,
  LuCheck
} from 'react-icons/lu';


const SOURCE_LABELS = {
  website: 'Website',
  referral: 'Referral',
  cold_call: 'Cold Call',
  event: 'Event',
  social_media: 'Social Media',
  other: 'Other'
};

const STAGES = ['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost'];

const Leads = () => {
  const { user } = useAuth();
  const [leads, setLeads] = useState([]);
  const [associates, setAssociates] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'kanban'

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    value: '',
    status: 'new',
    source: 'website',
    assignedTo: '',
    team: '',
    followUpDate: '',
    notes: ''
  });

  // AI Follow-up drafter
  const [aiDraft, setAiDraft] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiCopied, setAiCopied] = useState(false);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);
      if (sourceFilter) params.append('source', sourceFilter);
      if (search) params.append('search', search);

      const res = await api.get(`/leads?${params.toString()}`);
      setLeads(res.data.success ? res.data.leads : []);
    } catch (err) {
      setLeads([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchDropdowns = async () => {
    try {
      const [uRes, tRes] = await Promise.allSettled([
        api.get('/users?role=bda'),
        api.get('/teams')
      ]);
      if (uRes.status === 'fulfilled' && uRes.value.data.success) {
        setAssociates(uRes.value.data.users);
      }
      if (tRes.status === 'fulfilled' && tRes.value.data.success) {
        setTeams(tRes.value.data.teams);
      }
    } catch {
      // Fallback
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchLeads();
    }, 250);
    return () => clearTimeout(timer);
  }, [search, statusFilter, sourceFilter]);

  useEffect(() => {
    fetchDropdowns();
  }, []);

  const openAddModal = () => {
    setEditingLead(null);
    setFormData({
      name: '',
      company: '',
      email: '',
      phone: '',
      value: '',
      status: 'new',
      source: 'website',
      assignedTo: associates[0]?._id || '',
      team: teams[0]?._id || '',
      followUpDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
      notes: ''
    });
    setAiDraft('');
    setModalOpen(true);
  };

  const openEditModal = (lead) => {
    setEditingLead(lead);
    setFormData({
      name: lead.name || '',
      company: lead.company || '',
      email: lead.email || '',
      phone: lead.phone || '',
      value: lead.value || '',
      status: lead.status || 'new',
      source: lead.source || 'other',
      assignedTo: lead.assignedTo?._id || lead.assignedTo || '',
      team: lead.team?._id || lead.team || '',
      followUpDate: lead.followUpDate ? lead.followUpDate.split('T')[0] : '',
      notes: lead.notes || ''
    });
    setAiDraft('');
    setModalOpen(true);
  };

  const handleSaveLead = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        value: Number(formData.value) || 0
      };

      if (editingLead) {
        await api.put(`/leads/${editingLead._id}`, payload);
      } else {
        await api.post('/leads', payload);
      }
      setModalOpen(false);
      fetchLeads();
    } catch (err) {
      // Local preview update
      if (editingLead) {
        setLeads(leads.map((l) => (l._id === editingLead._id ? { ...l, ...formData, value: Number(formData.value) || 0 } : l)));
      } else {
        const newEntry = {
          _id: 'local-' + Date.now(),
          ...formData,
          value: Number(formData.value) || 0,
          assignedTo: { name: 'Ankit Patel' }
        };
        setLeads([newEntry, ...leads]);
      }
      setModalOpen(false);
    }
  };

  const handleDeleteLead = async (id) => {
    if (!window.confirm('Are you sure you want to delete this customer?')) return;
    try {
      await api.delete(`/leads/${id}`);
      setLeads(leads.filter((l) => l._id !== id));
    } catch (err) {
      setLeads(leads.filter((l) => l._id !== id));
    }
  };

  const handleExportCSV = async () => {
    try {
      const res = await api.get('/leads/export', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `leads_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      // Fallback CSV download
      const headers = ['Name', 'Company', 'Stage', 'Value', 'Source', 'Representative', 'Follow Up'];
      const rows = leads.map((l) => [
        `"${l.name}"`,
        `"${l.company || ''}"`,
        `"${l.status}"`,
        `"${l.value || 0}"`,
        `"${l.source || ''}"`,
        `"${l.assignedTo?.name || ''}"`,
        `"${l.followUpDate ? l.followUpDate.slice(0, 10) : ''}"`
      ]);
      const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'leads_export.csv';
      a.click();
    }
  };

  const handleGenerateAiEmail = async () => {
    try {
      setAiLoading(true);
      const res = await api.post('/ai/draft-email', {
        prospectName: formData.name,
        companyName: formData.company,
        notes: formData.notes || 'Discussed product offerings and next steps.'
      });
      if (res.data?.success && res.data.draft) {
        setAiDraft(res.data.draft);
      } else {
        setAiDraft(`Subject: Next steps for ${formData.company || 'your team'}\n\nHi ${formData.name || 'there'},\n\nThank you for speaking with me today. Based on our discussion, I have prepared the preliminary details regarding our solution.\n\nLooking forward to catching up soon.\n\nBest regards,\n${user?.name || 'Sales Representative'}`);
      }
    } catch {
      setAiDraft(`Subject: Next steps for ${formData.company || 'your team'}\n\nHi ${formData.name || 'there'},\n\nThank you for taking the time to speak today. I would love to follow up on the points we covered and walk you through next steps.\n\nBest regards,\n${user?.name || 'Sales Representative'}`);
    } finally {
      setAiLoading(false);
    }
  };

  const handleCopyDraft = () => {
    if (aiDraft) {
      navigator.clipboard.writeText(aiDraft);
      setAiCopied(true);
      setTimeout(() => setAiCopied(false), 2000);
    }
  };

  const formatDateDisplay = (dateString) => {
    if (!dateString) return 'Not set';
    try {
      const d = new Date(dateString);
      return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
    } catch {
      return dateString;
    }
  };

  return (
    <div>
      {/* Top Header */}
      <div className="page-title-row">
        <div>
          <h1 className="page-title">Potential Customers</h1>
          <p className="page-subtitle">Register qualified prospects, set deal values, and convert accounts.</p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={handleExportCSV} className="btn-icon-soft" style={{ width: 'auto', padding: '0 14px', gap: '6px' }} title="Export to CSV">
            <LuDownload size={16} />
            <span style={{ fontSize: '0.82rem', fontWeight: 600 }}>Export CSV</span>
          </button>

          <button onClick={openAddModal} className="btn-primary-blue">
            <LuPlus size={16} />
            <span>New Customer</span>
          </button>
        </div>
      </div>

      {/* Filter Row */}
      <div className="filter-bar-card">
        <div style={{ position: 'relative', flex: '1', minWidth: '260px' }}>
          <LuSearch size={16} style={{ position: 'absolute', left: '12px', top: '11px', color: '#94a3b8' }} />
          <input
            type="text"
            placeholder="Search leads by name or company..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="filter-input-search"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="filter-select"
        >
          <option value="">All Stages</option>
          {STAGES.map((s) => (
            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
          ))}
        </select>

        <select
          value={sourceFilter}
          onChange={(e) => setSourceFilter(e.target.value)}
          className="filter-select"
        >
          <option value="">All Sources</option>
          {Object.entries(SOURCE_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>

        <div style={{ display: 'flex', border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
          <button
            onClick={() => setViewMode('table')}
            style={{
              background: viewMode === 'table' ? '#eff6ff' : '#ffffff',
              color: viewMode === 'table' ? '#2563eb' : '#64748b',
              border: 'none',
              padding: '8px 12px',
              cursor: 'pointer'
            }}
            title="Table View"
          >
            <LuTable size={16} />
          </button>
          <button
            onClick={() => setViewMode('kanban')}
            style={{
              background: viewMode === 'kanban' ? '#eff6ff' : '#ffffff',
              color: viewMode === 'kanban' ? '#2563eb' : '#64748b',
              border: 'none',
              padding: '8px 12px',
              cursor: 'pointer'
            }}
            title="Kanban Board View"
          >
            <LuKanban size={16} />
          </button>
        </div>
      </div>

      {/* Table View */}
      {viewMode === 'table' ? (
        <div className="white-card" style={{ padding: '0', overflow: 'hidden' }}>
          <table className="clean-data-table">
            <thead>
              <tr>
                <th style={{ paddingLeft: '24px' }}>Prospect / Client</th>
                <th>Current Stage</th>
                <th>Deal Value</th>
                <th>Channel Source</th>
                <th>Representative</th>
                <th>Follow Up</th>
                <th style={{ textAlign: 'right', paddingRight: '24px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => (
                <tr key={lead._id}>
                  <td style={{ paddingLeft: '24px' }}>
                    <div className="cell-bold-main">{lead.name}</div>
                    <div className="cell-sub-muted">{lead.company || 'Direct Contact'}</div>
                  </td>
                  <td>
                    <span className={`status-pill status-${lead.status}`}>
                      {lead.status}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>
                      ₹{lead.value?.toLocaleString('en-IN')}
                    </span>
                  </td>
                  <td>{SOURCE_LABELS[lead.source] || lead.source || 'Other'}</td>
                  <td>{lead.assignedTo?.name || 'Unassigned'}</td>
                  <td>{formatDateDisplay(lead.followUpDate)}</td>
                  <td style={{ textAlign: 'right', paddingRight: '24px' }}>
                    <button onClick={() => openEditModal(lead)} className="action-icon-btn" title="Edit">
                      <LuPencil size={14} />
                    </button>
                    <button onClick={() => handleDeleteLead(lead._id)} className="action-icon-btn delete" title="Delete">
                      <LuTrash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        /* Kanban Board View */
        <div className="kanban-board-grid">
          {STAGES.map((stg) => {
            const colLeads = leads.filter((l) => l.status === stg);
            const totalVal = colLeads.reduce((acc, c) => acc + (c.value || 0), 0);
            return (
              <div key={stg} className="kanban-column">
                <div className="kanban-col-header">
                  <div className="kanban-col-title">
                    <span className={`status-pill status-${stg}`} style={{ padding: '2px 8px' }}>
                      {stg}
                    </span>
                  </div>
                  <span className="kanban-count-badge">{colLeads.length}</span>
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600, marginBottom: '10px', padding: '0 4px' }}>
                  Total: ₹{totalVal.toLocaleString('en-IN')}
                </div>

                <div style={{ flex: 1, overflowY: 'auto' }}>
                  {colLeads.map((item) => (
                    <div key={item._id} className="kanban-card" onClick={() => openEditModal(item)}>
                      <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#0f172a', marginBottom: '2px' }}>
                        {item.name}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '8px' }}>
                        {item.company}
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem' }}>
                        <span style={{ fontWeight: 700, color: '#2563eb' }}>
                          ₹{item.value?.toLocaleString('en-IN')}
                        </span>
                        <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                          {formatDateDisplay(item.followUpDate)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Customer Modal */}
      {modalOpen && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h2 className="modal-title">{editingLead ? 'Edit Customer' : 'Add New Customer'}</h2>
              <button onClick={() => setModalOpen(false)} className="modal-close-btn">
                <LuX />
              </button>
            </div>

            <form onSubmit={handleSaveLead}>
              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="form-input"
                    placeholder="e.g. Aarav Verma"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Company / Account *</label>
                  <input
                    type="text"
                    required
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    className="form-input"
                    placeholder="e.g. Sharma Textiles"
                  />
                </div>
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="form-input"
                    placeholder="client@company.com"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="form-input"
                    placeholder="+91 98200 12345"
                  />
                </div>
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Deal Value (₹) *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                    className="form-input"
                    placeholder="480000"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Current Stage</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="form-select"
                  >
                    {STAGES.map((s) => (
                      <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Channel Source</label>
                  <select
                    value={formData.source}
                    onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                    className="form-select"
                  >
                    {Object.entries(SOURCE_LABELS).map(([k, v]) => (
                      <option key={k} value={k}>{v}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Next Follow-Up Date</label>
                  <input
                    type="date"
                    value={formData.followUpDate}
                    onChange={(e) => setFormData({ ...formData, followUpDate: e.target.value })}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Meeting Notes & Context</label>
                <textarea
                  rows="3"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="form-textarea"
                  placeholder="Notes from initial call, budget scope, decision makers..."
                />
              </div>

              {/* AI Email Drafter Action inside Modal */}
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', fontWeight: 600, color: '#1d4ed8' }}>
                    <LuSparkles size={16} />
                    <span>AI Follow-Up Email Assistant</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleGenerateAiEmail}
                    disabled={aiLoading}
                    style={{
                      background: '#2563eb',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '4px 10px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    {aiLoading ? 'Generating...' : 'Draft with AI'}
                  </button>
                </div>

                {aiDraft && (
                  <div style={{ marginTop: '10px', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '10px', position: 'relative' }}>
                    <button
                      type="button"
                      onClick={handleCopyDraft}
                      style={{
                        position: 'absolute',
                        top: '8px',
                        right: '8px',
                        background: '#f1f5f9',
                        border: 'none',
                        borderRadius: '4px',
                        padding: '4px 8px',
                        cursor: 'pointer',
                        fontSize: '0.72rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      {aiCopied ? <LuCheck size={12} color="#10b981" /> : <LuCopy size={12} />}
                      <span>{aiCopied ? 'Copied' : 'Copy'}</span>
                    </button>
                    <pre style={{ whiteSpace: 'pre-wrap', fontSize: '0.78rem', color: '#334155', fontFamily: 'inherit' }}>
                      {aiDraft}
                    </pre>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
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
                <button
                  type="submit"
                  className="btn-primary-blue"
                >
                  {editingLead ? 'Save Changes' : 'Create Customer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Leads;
