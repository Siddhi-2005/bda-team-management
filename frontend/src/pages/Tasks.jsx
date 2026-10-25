import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import {
  LuPlus,
  LuSearch,
  LuTable,
  LuKanban,
  LuPencil,
  LuTrash2,
  LuX,
  LuCalendar,
  LuArrowRight
} from 'react-icons/lu';

const TASK_STATUSES = [
  { key: 'todo', label: 'To Do', color: '#64748b' },
  { key: 'inprogress', label: 'In Progress', color: '#2563eb' },
  { key: 'review', label: 'In Review', color: '#d97706' },
  { key: 'done', label: 'Done', color: '#059669' }
];

const Tasks = () => {
  const { user } = useAuth();
  const isBda = user?.role === 'bda';
  const canAssign = user?.role === 'admin' || user?.role === 'manager';
  const [error, setError] = useState('');
  const [tasks, setTasks] = useState([]);
  const [associates, setAssociates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState('kanban'); // 'kanban' | 'table'

  // Filters
  const [search, setSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'todo',
    priority: 'medium',
    assignedTo: '',
    dueDate: ''
  });

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (priorityFilter) params.append('priority', priorityFilter);
      if (statusFilter) params.append('status', statusFilter);

      const res = await api.get(`/tasks?${params.toString()}`);
      setError('');
      setTasks(res.data?.success ? res.data.tasks : []);
    } catch (err) {
      setTasks([]);
      setError(err.response?.data?.message || 'Could not load tasks. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchDropdowns = async () => {
    if (!canAssign) return; // BDAs only ever create/edit their own tasks
    try {
      const res = await api.get('/users?role=bda&isActive=true');
      if (res.data?.success) {
        // Only people who belong to a team can receive tasks
        const list = res.data.users.filter((u) => u.team);
        setAssociates(user.role === 'manager' ? list.filter((u) => (u.team?._id || u.team) === (user.team?._id || user.team)) : list);
      }
    } catch {
      setAssociates([]);
    }
  };

  useEffect(() => {
    fetchTasks();
    fetchDropdowns();
  }, [priorityFilter, statusFilter]);

  const openAddModal = () => {
    setEditingTask(null);
    setFormData({
      title: '',
      description: '',
      status: 'todo',
      priority: 'medium',
      assignedTo: '',
      dueDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0]
    });
    setModalOpen(true);
  };

  const openEditModal = (task) => {
    setEditingTask(task);
    setFormData({
      title: task.title || '',
      description: task.description || '',
      status: task.status || 'todo',
      priority: task.priority || 'medium',
      assignedTo: task.assignedTo?._id || task.assignedTo || '',
      dueDate: task.dueDate ? task.dueDate.split('T')[0] : ''
    });
    setModalOpen(true);
  };

  const handleSaveTask = async (e) => {
    e.preventDefault();
    try {
      if (editingTask) {
        await api.put(`/tasks/${editingTask._id}`, formData);
      } else {
        await api.post('/tasks', formData);
      }
      setModalOpen(false);
      fetchTasks();
    } catch (err) {
      alert(err.response?.data?.message || 'Could not save the task.');
    }
  };

  const handleDeleteTask = async (id) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await api.delete(`/tasks/${id}`);
      setTasks(tasks.filter((t) => t._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Could not delete the task.');
    }
  };

  const handleQuickAdvance = async (e, task) => {
    e.stopPropagation();
    const sequence = ['todo', 'inprogress', 'review', 'done'];
    const currIndex = sequence.indexOf(task.status);
    if (currIndex < sequence.length - 1) {
      const nextStatus = sequence[currIndex + 1];
      try {
        await api.put(`/tasks/${task._id}`, { status: nextStatus });
        setTasks(tasks.map((t) => (t._id === task._id ? { ...t, status: nextStatus } : t)));
      } catch (err) {
        alert(err.response?.data?.message || 'Could not update the task.');
      }
    }
  };

  const filteredTasks = tasks.filter((t) => {
    if (search && !t.title.toLowerCase().includes(search.toLowerCase()) && !t.description?.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    return true;
  });

  const formatDate = (dateStr) => {
    if (!dateStr) return 'No due date';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
    } catch {
      return dateStr;
    }
  };

  return (
    <div>
      {/* Page Header */}
      <div className="page-title-row">
        <div>
          <h1 className="page-title">Tasks & Activities</h1>
          <p className="page-subtitle">
            {isBda && 'Tasks assigned to you. The "Assigned by" line shows who gave you each task.'}
            {user?.role === 'manager' && (user.team ? 'Tasks for your team. Assign work to your team members.' : 'You are not managing a team yet, so you only see tasks you created.')}
            {user?.role === 'admin' && 'All tasks across every team.'}
          </p>
          {isBda && !user.team && (
            <p style={{ color: '#b45309', fontSize: '0.82rem', marginTop: 6 }}>
              You are not in a team yet. A manager or admin will add you; until then you only see tasks you create for yourself.
            </p>
          )}
        </div>

        <button onClick={openAddModal} className="btn-primary-blue">
          <LuPlus size={16} />
          <span>New Task</span>
        </button>
      </div>

      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: '10px 14px', borderRadius: 8, marginBottom: 12, fontSize: '0.85rem' }}>
          {error}
        </div>
      )}
      {!error && !loading && tasks.length === 0 && (
        <div style={{ background: '#f8fafc', border: '1px dashed #cbd5e1', color: '#64748b', padding: '14px', borderRadius: 8, marginBottom: 12, fontSize: '0.85rem' }}>
          No tasks to show for your role yet.
        </div>
      )}

      {/* Filter Row */}
      <div className="filter-bar-card">
        <div style={{ position: 'relative', flex: '1', minWidth: '240px' }}>
          <LuSearch size={16} style={{ position: 'absolute', left: '12px', top: '11px', color: '#94a3b8' }} />
          <input
            type="text"
            placeholder="Search tasks by title or details..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="filter-input-search"
          />
        </div>

        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="filter-select"
        >
          <option value="">All Priorities</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="filter-select"
        >
          <option value="">All Statuses</option>
          {TASK_STATUSES.map((s) => (
            <option key={s.key} value={s.key}>{s.label}</option>
          ))}
        </select>

        <div style={{ display: 'flex', border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
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
          <button
            onClick={() => setViewMode('table')}
            style={{
              background: viewMode === 'table' ? '#eff6ff' : '#ffffff',
              color: viewMode === 'table' ? '#2563eb' : '#64748b',
              border: 'none',
              padding: '8px 12px',
              cursor: 'pointer'
            }}
            title="List View"
          >
            <LuTable size={16} />
          </button>
        </div>
      </div>

      {/* Kanban Board View */}
      {viewMode === 'kanban' ? (
        <div className="kanban-board-grid">
          {TASK_STATUSES.map((st) => {
            const colTasks = filteredTasks.filter((t) => t.status === st.key);
            return (
              <div key={st.key} className="kanban-column" style={{ minWidth: '300px' }}>
                <div className="kanban-col-header">
                  <div className="kanban-col-title">
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: st.color }} />
                    <span>{st.label}</span>
                  </div>
                  <span className="kanban-count-badge">{colTasks.length}</span>
                </div>

                <div style={{ flex: 1, overflowY: 'auto' }}>
                  {colTasks.map((task) => (
                    <div key={task._id} className="kanban-card" onClick={() => openEditModal(task)}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <span className={`status-pill priority-${task.priority?.toLowerCase() || 'medium'}`} style={{ fontSize: '0.7rem' }}>
                          {task.priority || 'Medium'}
                        </span>
                        {task.status !== 'done' && (
                          <button
                            onClick={(e) => handleQuickAdvance(e, task)}
                            title="Advance status"
                            style={{
                              background: '#f1f5f9',
                              border: 'none',
                              borderRadius: '4px',
                              padding: '2px 6px',
                              cursor: 'pointer',
                              fontSize: '0.7rem',
                              color: '#475569',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '2px'
                            }}
                          >
                            <span>Advance</span>
                            <LuArrowRight size={10} />
                          </button>
                        )}
                      </div>

                      <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#0f172a', marginBottom: '4px' }}>
                        {task.title}
                      </div>

                      {task.description && (
                        <p style={{ fontSize: '0.78rem', color: '#64748b', lineHeight: 1.4, marginBottom: '12px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {task.description}
                        </p>
                      )}

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '8px', borderTop: '1px solid #f1f5f9', fontSize: '0.75rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <div className="avatar-circle" style={{ width: '22px', height: '22px', fontSize: '0.65rem', background: '#eff6ff', color: '#1d4ed8' }}>
                            {task.assignedTo?.name ? task.assignedTo.name[0] : 'U'}
                          </div>
                          <span style={{ color: '#475569', fontWeight: 500 }}>
                            {task.assignedTo?.name || 'Unassigned'}
                          </span>
                          <span style={{ color: '#94a3b8' }}>
                            · by {task.assignedBy?.name || '—'}
                          </span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#94a3b8' }}>
                          <LuCalendar size={13} />
                          <span>{formatDate(task.dueDate)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="white-card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="clean-data-table">
            <thead>
              <tr>
                <th style={{ paddingLeft: '24px' }}>Task Title</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Assigned To</th>
                <th>Assigned By</th>
                <th>Team</th>
                <th>Due Date</th>
                <th style={{ textAlign: 'right', paddingRight: '24px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTasks.map((task) => (
                <tr key={task._id}>
                  <td style={{ paddingLeft: '24px' }}>
                    <div className="cell-bold-main">{task.title}</div>
                    <div className="cell-sub-muted">{task.description || 'No description'}</div>
                  </td>
                  <td>
                    <span className={`status-pill priority-${task.priority?.toLowerCase() || 'medium'}`}>
                      {task.priority || 'Medium'}
                    </span>
                  </td>
                  <td>
                    <span style={{ textTransform: 'capitalize', fontWeight: 600, fontSize: '0.8rem', color: '#475569' }}>
                      {task.status}
                    </span>
                  </td>
                  <td>{task.assignedTo?.name || 'Unassigned'}</td>
                  <td>{task.assignedBy?.name || '—'}</td>
                  <td>{task.team?.name || '—'}</td>
                  <td>{formatDate(task.dueDate)}</td>
                  <td style={{ textAlign: 'right', paddingRight: '24px' }}>
                    <button onClick={() => openEditModal(task)} className="action-icon-btn" title="Edit">
                      <LuPencil size={14} />
                    </button>
                    {canAssign && (
                      <button onClick={() => handleDeleteTask(task._id)} className="action-icon-btn delete" title="Delete">
                        <LuTrash2 size={14} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add / Edit Task Modal */}
      {modalOpen && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h2 className="modal-title">{editingTask ? 'Edit Task' : 'Add New Task'}</h2>
              <button onClick={() => setModalOpen(false)} className="modal-close-btn">
                <LuX />
              </button>
            </div>

            <form onSubmit={handleSaveTask}>
              <div className="form-group">
                <label className="form-label">Task Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Follow up on proposal"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description & Instructions</label>
                <textarea
                  rows="3"
                  placeholder="Details, client background, call points..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="form-textarea"
                />
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Priority Level</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="form-select"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Current Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="form-select"
                  >
                    {TASK_STATUSES.map((s) => (
                      <option key={s.key} value={s.key}>{s.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-grid-2">
                {canAssign ? (
                  <div className="form-group">
                    <label className="form-label">Assign To</label>
                    <select
                      value={formData.assignedTo}
                      onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                      className="form-select"
                    >
                      <option value="">{user.role === 'manager' ? 'Myself' : 'Select Representative'}</option>
                      {associates.map((u) => (
                        <option key={u._id} value={u._id}>{u.name}</option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div className="form-group">
                    <label className="form-label">Assigned To</label>
                    <input className="form-input" value={`${user?.name} (you)`} disabled />
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">Due Date</label>
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
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
                <button
                  type="submit"
                  className="btn-primary-blue"
                >
                  {editingTask ? 'Save Changes' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tasks;
