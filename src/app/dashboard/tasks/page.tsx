'use client';

import { useEffect, useState } from 'react';
import { adminFetch } from '@/lib/admin-client';

interface Task {
  id: string;
  title: string;
  description?: string;
  icon?: string;
  reward: number;
  taskType: string;
  targetUrl?: string;
  verificationType?: string;
  active: boolean;
  createdAt?: any;
}

const TASK_TYPES = [
  { value: 'telegram_channel', label: 'Telegram Channel' },
  { value: 'telegram_group', label: 'Telegram Group' },
  { value: 'website_visit', label: 'Website Visit' },
  { value: 'social_follow', label: 'Social Follow' },
  { value: 'custom', label: 'Custom / Other' },
  { value: 'promotional', label: 'Promotional' },
  { value: 'affiliate', label: 'Affiliate' },
];

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [taskType, setTaskType] = useState('telegram_channel');
  const [targetUrl, setTargetUrl] = useState('');
  const [reward, setReward] = useState('50');
  const [verificationType, setVerificationType] = useState('manual');
  const [active, setActive] = useState(true);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const res = await adminFetch('/api/admin/tasks');
      if (res.success && res.data) {
        setTasks(Array.isArray(res.data) ? res.data : (res.data as any).tasks || []);
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const openCreateModal = () => {
    setEditingTask(null);
    setTitle('');
    setDescription('');
    setTaskType('telegram_channel');
    setTargetUrl('');
    setReward('50');
    setVerificationType('manual');
    setActive(true);
    setMessage(null);
    setShowModal(true);
  };

  const openEditModal = (task: Task) => {
    setEditingTask(task);
    setTitle(task.title || '');
    setDescription(task.description || '');
    setTaskType(task.taskType || 'telegram_channel');
    setTargetUrl(task.targetUrl || '');
    setReward(task.reward?.toString() || '50');
    setVerificationType(task.verificationType || 'manual');
    setActive(task.active ?? true);
    setMessage(null);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setMessage({ type: 'error', text: 'Task title is required' });
      return;
    }

    const rewardNum = parseInt(reward, 10);
    if (isNaN(rewardNum) || rewardNum <= 0) {
      setMessage({ type: 'error', text: 'Reward points must be a positive number' });
      return;
    }

    if (targetUrl.trim()) {
      try {
        new URL(targetUrl.trim());
      } catch {
        setMessage({ type: 'error', text: 'Target URL must be a valid URL (e.g. https://t.me/yourchannel)' });
        return;
      }
    }

    setSubmitting(true);
    setMessage(null);

    const payload: any = {
      title: title.trim(),
      description: description.trim() || undefined,
      taskType,
      reward: rewardNum,
      verificationType,
      active,
    };

    if (targetUrl.trim()) {
      payload.targetUrl = targetUrl.trim();
    }

    try {
      let res;
      if (editingTask) {
        res = await adminFetch(`/api/admin/tasks/${editingTask.id}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
      } else {
        res = await adminFetch('/api/admin/tasks', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
      }

      if (res.success) {
        setShowModal(false);
        fetchTasks();
      } else {
        setMessage({ type: 'error', text: res.error || 'Failed to save task' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Network error saving task' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (task: Task) => {
    try {
      const res = await adminFetch(`/api/admin/tasks/${task.id}`, {
        method: 'PUT',
        body: JSON.stringify({ active: !task.active }),
      });
      if (res.success) {
        setTasks(tasks.map(t => (t.id === task.id ? { ...t, active: !task.active } : t)));
      } else {
        alert(res.error || 'Failed to update task status');
      }
    } catch {
      alert('Network error updating task');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to deactivate/delete this task?')) return;
    try {
      const res = await adminFetch(`/api/admin/tasks/${id}`, { method: 'DELETE' });
      if (res.success) {
        fetchTasks();
      } else {
        alert(res.error || 'Failed to delete task');
      }
    } catch {
      alert('Network error deleting task');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0, color: '#f0f6fc' }}>Task Management</h2>
          <p style={{ margin: '4px 0 0', color: '#8b949e', fontSize: '0.875rem' }}>
            Tasks configured here are instantly available to all users on the rewards app.
          </p>
        </div>
        <button onClick={openCreateModal} className="admin-button" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span>+</span> Create New Task
        </button>
      </div>

      <div className="admin-card admin-table-container">
        {loading ? (
          <div style={{ padding: '20px 16px' }}>
            <div className="skeleton-box" style={{ height: '38px', marginBottom: '8px' }} />
            <div className="skeleton-box" style={{ height: '38px', marginBottom: '8px' }} />
            <div className="skeleton-box" style={{ height: '38px', marginBottom: '8px' }} />
            <div className="skeleton-box" style={{ height: '38px' }} />
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Task</th>
                <th>Type</th>
                <th>Target URL</th>
                <th>Reward</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tasks.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: '#8b949e' }}>
                    No tasks found. Click &quot;Create New Task&quot; to add your first earning task!
                  </td>
                </tr>
              ) : (
                tasks.map(task => (
                  <tr key={task.id}>
                    <td>
                      <div style={{ fontWeight: 600, color: '#f0f6fc' }}>{task.title}</div>
                      {task.description && (
                        <div style={{ fontSize: '0.75rem', color: '#8b949e', marginTop: '2px', maxWidth: '280px' }}>
                          {task.description}
                        </div>
                      )}
                    </td>
                    <td>
                      <span style={{
                        padding: '3px 8px',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        background: '#21262d',
                        color: '#58a6ff',
                        border: '1px solid #30363d',
                        textTransform: 'capitalize'
                      }}>
                        {task.taskType?.replace('_', ' ')}
                      </span>
                    </td>
                    <td>
                      {task.targetUrl ? (
                        <a
                          href={task.targetUrl}
                          target="_blank"
                          rel="noreferrer"
                          style={{ color: '#58a6ff', fontSize: '0.8rem', textDecoration: 'none', maxWidth: '180px', display: 'inline-block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                        >
                          {task.targetUrl}
                        </a>
                      ) : (
                        <span style={{ color: '#484f58', fontSize: '0.8rem' }}>None</span>
                      )}
                    </td>
                    <td>
                      <span style={{ color: '#e3b341', fontWeight: 600 }}>+{task.reward} pts</span>
                    </td>
                    <td>
                      <button
                        onClick={() => handleToggleActive(task)}
                        title="Click to toggle status"
                        style={{
                          padding: '3px 10px',
                          borderRadius: '12px',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          border: 'none',
                          background: task.active ? '#23863620' : '#da363320',
                          color: task.active ? '#3fb950' : '#f85149',
                        }}
                      >
                        {task.active ? '● Active' : '○ Inactive'}
                      </button>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => openEditModal(task)}
                          style={{
                            background: '#21262d',
                            border: '1px solid #30363d',
                            color: '#58a6ff',
                            padding: '4px 10px',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '0.75rem',
                          }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(task.id)}
                          style={{
                            background: '#21262d',
                            border: '1px solid #da3633',
                            color: '#f85149',
                            padding: '4px 10px',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '0.75rem',
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Create / Edit Modal */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.75)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '1rem',
        }}>
          <div style={{
            background: '#161a22',
            border: '1px solid #30363d',
            borderRadius: '8px',
            width: '100%',
            maxWidth: '520px',
            padding: '1.5rem',
            maxHeight: '90vh',
            overflowY: 'auto',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 600, margin: 0, color: '#f0f6fc' }}>
                {editingTask ? 'Edit Task' : 'Create New Task'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                style={{ background: 'none', border: 'none', color: '#8b949e', fontSize: '1.25rem', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            {message && (
              <div style={{
                padding: '10px 14px',
                borderRadius: '6px',
                marginBottom: '1rem',
                fontSize: '0.85rem',
                background: message.type === 'error' ? '#da363320' : '#23863620',
                color: message.type === 'error' ? '#f85149' : '#3fb950',
                border: `1px solid ${message.type === 'error' ? '#da3633' : '#238636'}`,
              }}>
                {message.text}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#8b949e', marginBottom: '4px' }}>
                  Task Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Join Official Telegram Channel"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="admin-input"
                  style={{ marginBottom: 0 }}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#8b949e', marginBottom: '4px' }}>
                  Description (Optional)
                </label>
                <textarea
                  placeholder="Brief instructions for the user..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="admin-input"
                  style={{ marginBottom: 0, minHeight: '60px', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: '#8b949e', marginBottom: '4px' }}>
                    Task Type
                  </label>
                  <select
                    value={taskType}
                    onChange={e => setTaskType(e.target.value)}
                    className="admin-input"
                    style={{ marginBottom: 0 }}
                  >
                    {TASK_TYPES.map(t => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: '#8b949e', marginBottom: '4px' }}>
                    Reward Points *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={reward}
                    onChange={e => setReward(e.target.value)}
                    className="admin-input"
                    style={{ marginBottom: 0 }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#8b949e', marginBottom: '4px' }}>
                  Target URL (Link to join or visit)
                </label>
                <input
                  type="url"
                  placeholder="https://t.me/YourChannelName"
                  value={targetUrl}
                  onChange={e => setTargetUrl(e.target.value)}
                  className="admin-input"
                  style={{ marginBottom: 0 }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: '#8b949e', marginBottom: '4px' }}>
                    Verification
                  </label>
                  <select
                    value={verificationType}
                    onChange={e => setVerificationType(e.target.value)}
                    className="admin-input"
                    style={{ marginBottom: 0 }}
                  >
                    <option value="manual">Manual Verify Button</option>
                    <option value="auto">Auto Verify</option>
                  </select>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', paddingTop: '1.25rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: '#c9d1d9', fontSize: '0.875rem' }}>
                    <input
                      type="checkbox"
                      checked={active}
                      onChange={e => setActive(e.target.checked)}
                      style={{ width: '16px', height: '16px' }}
                    />
                    Active (Visible to users)
                  </label>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{
                    background: '#21262d',
                    border: '1px solid #30363d',
                    color: '#c9d1d9',
                    padding: '0.5rem 1rem',
                    borderRadius: '6px',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="admin-button"
                  style={{ opacity: submitting ? 0.7 : 1 }}
                >
                  {submitting ? 'Saving...' : editingTask ? 'Update Task' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

