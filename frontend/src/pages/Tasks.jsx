import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import Modal from '../components/ui/Modal';
import { useAuth } from '../context/AuthContext';
import { RiAddLine, RiFolderInfoLine, RiLoader4Line, RiCalendarLine } from 'react-icons/ri';

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [associates, setAssociates] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  // Filters
  const [priorityFilter, setPriorityFilter] = useState('');
  const [teamFilter, setTeamFilter] = useState('');

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('todo');
  const [priority, setPriority] = useState('medium');
  const [assignedTo, setAssignedTo] = useState('');
  const [team, setTeam] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const { user } = useAuth();
  const userTeamId = typeof user?.team === 'object' ? user.team?._id : user?.team;

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      if (priorityFilter) queryParams.append('priority', priorityFilter);
      if (teamFilter) queryParams.append('team', teamFilter);
      
      const res = await api.get(`/tasks?${queryParams.toString()}`);
      if (res.data.success) {
        setTasks(res.data.tasks);
      }
    } catch (err) {
      console.error('Failed fetching tasks', err);
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
    fetchTasks();
  }, [priorityFilter, teamFilter]);

  useEffect(() => {
    fetchDropdownData();
  }, []);

  const openAddModal = () => {
    setEditingTask(null);
    setTitle('');
    setDescription('');
    setStatus('todo');
    setPriority('medium');
    setAssignedTo(user?.role === 'bda' ? user?._id : associates[0]?._id || '');
    setTeam(user?.role === 'bda' ? userTeamId || '' : teams[0]?._id || '');
    setDueDate('');
    setTagsInput('');
    setError('');
    setModalOpen(true);
  };

  const openEditModal = (task) => {
    setEditingTask(task);
    setTitle(task.title);
    setDescription(task.description || '');
    setStatus(task.status || 'todo');
    setPriority(task.priority || 'medium');
    setAssignedTo(task.assignedTo?._id || '');
    setTeam(task.team?._id || '');
    setDueDate(task.dueDate ? new Date(task.dueDate).toISOString().substring(0, 10) : '');
    setTagsInput(task.tags ? task.tags.join(', ') : '');
    setError('');
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!title || (user?.role !== 'bda' && !assignedTo)) {
      return setError('Please enter a task title and assign to a representative.');
    }

    try {
      setSaving(true);
      setError('');
      
      const tags = tagsInput
        ? tagsInput.split(',').map((t) => t.trim()).filter((t) => t !== '')
        : [];

      const payload = {
        title,
        description,
        status,
        priority,
        assignedTo: user?.role === 'bda' ? user?._id : assignedTo,
        team: user?.role === 'bda' ? userTeamId || undefined : team || undefined,
        dueDate: dueDate || undefined,
        tags
      };

      if (editingTask) {
        const res = await api.put(`/tasks/${editingTask._id}`, payload);
        if (res.data.success) {
          setTasks(tasks.map((t) => (t._id === editingTask._id ? res.data.task : t)));
          setModalOpen(false);
        }
      } else {
        const res = await api.post('/tasks', payload);
        if (res.data.success) {
          setTasks([res.data.task, ...tasks]);
          setModalOpen(false);
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error occurred while saving task.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (editingTask && window.confirm('Are you sure you want to delete this task?')) {
      try {
        setSaving(true);
        const res = await api.delete(`/tasks/${editingTask._id}`);
        if (res.data.success) {
          setTasks(tasks.filter((t) => t._id !== editingTask._id));
          setModalOpen(false);
        }
      } catch (err) {
        alert('Failed to delete task');
      } finally {
        setSaving(false);
      }
    }
  };

  const handleQuickStatusChange = async (task, nextStatus) => {
    try {
      const res = await api.put(`/tasks/${task._id}`, { status: nextStatus });
      if (res.data.success) {
        setTasks(tasks.map((t) => (t._id === task._id ? res.data.task : t)));
      }
    } catch (err) {
      console.error('Failed updating task status', err);
    }
  };

  const renderKanbanColumn = (colStatus, colTitle) => {
    const colTasks = tasks.filter((t) => t.status === colStatus);
    return (
      <div className="kanban-column">
        <div className="kanban-column-header">
          <div className="kanban-column-title">
            <span 
              style={{ 
                width: '10px', 
                height: '10px', 
                borderRadius: '50%', 
                background: colStatus === 'todo' ? '#00b0ff' : colStatus === 'inprogress' ? '#ffb300' : colStatus === 'review' ? '#6c63ff' : '#00e676'
              }}
            ></span>
            <span>{colTitle}</span>
          </div>
          <span className="kanban-card-count">{colTasks.length}</span>
        </div>
        <div className="kanban-cards">
          {colTasks.map((task) => (
            <div key={task._id} className="kanban-card" onClick={() => openEditModal(task)}>
              <div className="kanban-card-header">
                <span className={`badge ${
                  task.priority === 'critical' ? 'badge-danger' : 
                  task.priority === 'high' ? 'badge-warning' : 
                  task.priority === 'medium' ? 'badge-info' : 'badge-primary'
                }`} style={{ fontSize: '0.65rem', padding: '2px 8px' }}>
                  {task.priority}
                </span>
              </div>
              <h4 className="kanban-card-title">{task.title}</h4>
              <p className="kanban-card-desc">{task.description}</p>
              
              {task.tags && task.tags.length > 0 && (
                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: '12px' }}>
                  {task.tags.map((tag, i) => (
                    <span 
                      key={i} 
                      style={{ 
                        fontSize: '0.65rem', 
                        padding: '2px 6px', 
                        background: 'rgba(255,255,255,0.04)', 
                        border: '1px solid rgba(255,255,255,0.06)',
                        borderRadius: '4px',
                        color: 'var(--text-secondary)'
                      }}
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              <div className="kanban-card-footer">
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <RiCalendarLine style={{ fontSize: '0.9rem' }} />
                  <span>
                    {task.dueDate ? new Date(task.dueDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }) : 'No Due'}
                  </span>
                </div>
                <div className="kanban-card-assignee">
                  <div className="kanban-avatar">
                    {task.assignedTo?.name ? task.assignedTo.name[0].toUpperCase() : 'U'}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-title-area">
          <h2>Task Management</h2>
          <p>Collaboratively track activities, sales deliverables, and critical client follow-ups.</p>
        </div>
        <button onClick={openAddModal} className="btn btn-primary">
          <RiAddLine />
          <span>{user?.role === 'bda' ? 'Add My Task' : 'Create Task'}</span>
        </button>
      </div>

      {/* Filter bar */}
      <div className="glass-card filter-bar">
        <select className="filter-select" value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
          <option value="">All Priorities</option>
          <option value="critical">Critical Only</option>
          <option value="high">High Only</option>
          <option value="medium">Medium Only</option>
          <option value="low">Low Only</option>
        </select>
        <select className="filter-select" value={teamFilter} onChange={(e) => setTeamFilter(e.target.value)}>
          <option value="">All Teams</option>
          {teams.map((t) => (
            <option key={t._id} value={t._id}>
              {t.name}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', margin: '80px 0' }}>
          <RiLoader4Line className="spin" style={{ fontSize: '2.5rem', color: 'var(--accent-primary)' }} />
        </div>
      ) : tasks.length === 0 ? (
        <div className="glass-card empty-state">
          <RiFolderInfoLine />
          <h3>No Tasks Found</h3>
          <p>
            {user?.role === 'bda'
              ? 'No work is assigned yet. Use Add My Task to track your own follow-ups, calls, demos, or proposals.'
              : 'Create a task and assign it to a Business Development Associate.'}
          </p>
          <button onClick={openAddModal} className="btn btn-primary" style={{ marginTop: '18px' }}>
            <RiAddLine />
            <span>{user?.role === 'bda' ? 'Add My Task' : 'Create Task'}</span>
          </button>
        </div>
      ) : (
        <div className="kanban-board">
          {renderKanbanColumn('todo', 'Todo')}
          {renderKanbanColumn('inprogress', 'In Progress')}
          {renderKanbanColumn('review', 'In Review')}
          {renderKanbanColumn('done', 'Done')}
        </div>
      )}

      {/* Modal for Task Creation/Edit */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingTask ? 'Modify Task Details' : 'Create Sales Task'}>
        <form onSubmit={handleSave}>
          {error && <div className="alert alert-danger" style={{ marginBottom: '15px' }}>{error}</div>}

          <div className="form-group">
            <label>Task Title</label>
            <input
              type="text"
              placeholder="e.g. Schedule Enterprise pitch demo"
              className="form-control"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Description / Instructions</label>
            <textarea
              placeholder="Explain expected outputs, deliverables, and guidelines..."
              className="form-control"
              style={{ minHeight: '80px', resize: 'vertical' }}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Status</label>
              <select className="form-control" value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="todo">Todo</option>
                <option value="inprogress">In Progress</option>
                <option value="review">In Review</option>
                <option value="done">Completed</option>
              </select>
            </div>

            <div className="form-group">
              <label>Priority</label>
              <select className="form-control" value={priority} onChange={(e) => setPriority(e.target.value)}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
          </div>

          {user?.role === 'bda' ? (
            <div className="alert alert-info" style={{ marginBottom: '15px' }}>
              This task will be assigned to you automatically.
            </div>
          ) : (
            <div className="form-row">
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

              <div className="form-group">
                <label>Sales Team</label>
                <select className="form-control" value={team} onChange={(e) => setTeam(e.target.value)}>
                  <option value="">Select Team</option>
                  {teams.map((t) => (
                    <option key={t._id} value={t._id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          <div className="form-row">
            <div className="form-group">
              <label>Due Date</label>
              <input
                type="date"
                className="form-control"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Tags (Comma separated)</label>
              <input
                type="text"
                placeholder="pitch, contract, client-meet"
                className="form-control"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '15px', justifyContent: 'space-between', marginTop: '25px' }}>
            {editingTask && user?.role !== 'bda' ? (
              <button type="button" onClick={handleDelete} className="btn btn-danger" disabled={saving}>
                Delete Task
              </button>
            ) : (
              <div></div>
            )}
            <div style={{ display: 'flex', gap: '15px' }}>
              <button type="button" onClick={() => setModalOpen(false)} className="btn btn-secondary">
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? <RiLoader4Line className="spin" /> : 'Save Task'}
              </button>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Tasks;
