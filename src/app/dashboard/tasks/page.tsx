'use client';

import { useEffect, useState, useMemo } from 'react';
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
  order?: number;
  isRecurring?: boolean;
  active: boolean;
  createdAt?: any;
}

const TASK_TYPES = [
  { value: 'telegram_channel', label: 'Telegram Channel', defaultIcon: '📢' },
  { value: 'telegram_group', label: 'Telegram Group', defaultIcon: '💬' },
  { value: 'website_visit', label: 'Website Visit', defaultIcon: '🌐' },
  { value: 'social_follow', label: 'Social Follow (Twitter/Insta)', defaultIcon: '🐦' },
  { value: 'social', label: 'Social Media Quest', defaultIcon: '📱' },
  { value: 'promotional', label: 'Promotional Task', defaultIcon: '🎁' },
  { value: 'affiliate', label: 'Affiliate Partner', defaultIcon: '🤝' },
  { value: 'custom', label: 'Custom / Other', defaultIcon: '⚡' },
];

const PRESET_ICONS = ['📢', '💬', '🌐', '🐦', '📸', '📺', '🎁', '⚡', '🔥', '💎', '🚀', '⭐'];

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'telegram' | 'social' | 'recurring' | 'inactive'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('📢');
  const [taskType, setTaskType] = useState('telegram_channel');
  const [targetUrl, setTargetUrl] = useState('');
  const [reward, setReward] = useState('5000');
  const [verificationType, setVerificationType] = useState('manual');
  const [order, setOrder] = useState('1');
  const [isRecurring, setIsRecurring] = useState(false);
  const [active, setActive] = useState(true);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const res = await adminFetch('/api/admin/tasks?refresh=true');
      if (res.success && res.data) {
        setTasks(Array.isArray(res.data) ? res.data : (res.data as any).tasks || []);
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handleTypeChange = (newType: string) => {
    setTaskType(newType);
    const matched = TASK_TYPES.find(t => t.value === newType);
    if (matched && (!icon || PRESET_ICONS.includes(icon))) {
      setIcon(matched.defaultIcon);
    }
  };

  const openCreateModal = () => {
    setEditingTask(null);
    setTitle('');
    setDescription('');
    setIcon('📢');
    setTaskType('telegram_channel');
    setTargetUrl('');
    setReward('5000');
    setVerificationType('manual');
    setOrder((tasks.length + 1).toString());
    setIsRecurring(false);
    setActive(true);
    setMessage(null);
    setShowModal(true);
  };

  const openEditModal = (task: Task) => {
    setEditingTask(task);
    setTitle(task.title || '');
    setDescription(task.description || '');
    setIcon(task.icon || '⚡');
    setTaskType(task.taskType || 'telegram_channel');
    setTargetUrl(task.targetUrl || '');
    setReward(task.reward?.toString() || '5000');
    setVerificationType(task.verificationType || 'manual');
    setOrder(task.order?.toString() || '1');
    setIsRecurring(Boolean(task.isRecurring));
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

    let cleanUrl = targetUrl.trim();
    if (cleanUrl) {
      if (cleanUrl.startsWith('@')) {
        cleanUrl = `https://t.me/${cleanUrl.slice(1)}`;
      } else if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
        cleanUrl = `https://${cleanUrl}`;
      }
      try {
        new URL(cleanUrl);
      } catch {
        setMessage({ type: 'error', text: 'Target URL must be a valid URL (e.g. https://t.me/yourchannel or @channel)' });
        return;
      }
    }

    setSubmitting(true);
    setMessage(null);

    const payload: any = {
      title: title.trim(),
      description: description.trim() || undefined,
      icon: icon.trim() || undefined,
      taskType,
      reward: rewardNum,
      verificationType,
      order: parseInt(order, 10) || 1,
      isRecurring,
      active,
      targetUrl: cleanUrl || '',
    };

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

  const filteredTasks = useMemo(() => {
    return tasks.filter(t => {
      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = t.title?.toLowerCase().includes(q);
        const matchesDesc = t.description?.toLowerCase().includes(q);
        const matchesType = t.taskType?.toLowerCase().includes(q);
        if (!matchesTitle && !matchesDesc && !matchesType) return false;
      }

      // Tab filter
      if (filter === 'telegram') {
        return t.taskType === 'telegram' || t.taskType.startsWith('telegram_');
      }
      if (filter === 'social') {
        return ['social', 'social_follow', 'website_visit', 'promotional', 'affiliate', 'custom'].includes(t.taskType);
      }
      if (filter === 'recurring') {
        return Boolean(t.isRecurring);
      }
      if (filter === 'inactive') {
        return !t.active;
      }
      return true;
    }).sort((a, b) => (a.order || 999) - (b.order || 999));
  }, [tasks, filter, searchQuery]);

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

      {/* Filter Tabs & Search Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setFilter('all')}
            style={{
              padding: '6px 12px',
              borderRadius: '6px',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
              border: '1px solid #30363d',
              background: filter === 'all' ? '#1f6feb' : '#21262d',
              color: filter === 'all' ? '#ffffff' : '#c9d1d9',
            }}
          >
            All Quests ({tasks.length})
          </button>
          <button
            onClick={() => setFilter('telegram')}
            style={{
              padding: '6px 12px',
              borderRadius: '6px',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
              border: '1px solid #30363d',
              background: filter === 'telegram' ? '#1f6feb' : '#21262d',
              color: filter === 'telegram' ? '#ffffff' : '#c9d1d9',
            }}
          >
            📢 Telegram ({tasks.filter(t => t.taskType === 'telegram' || t.taskType?.startsWith('telegram_')).length})
          </button>
          <button
            onClick={() => setFilter('social')}
            style={{
              padding: '6px 12px',
              borderRadius: '6px',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
              border: '1px solid #30363d',
              background: filter === 'social' ? '#1f6feb' : '#21262d',
              color: filter === 'social' ? '#ffffff' : '#c9d1d9',
            }}
          >
            📱 Social ({tasks.filter(t => ['social', 'social_follow', 'website_visit', 'promotional', 'affiliate', 'custom'].includes(t.taskType)).length})
          </button>
          <button
            onClick={() => setFilter('recurring')}
            style={{
              padding: '6px 12px',
              borderRadius: '6px',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
              border: '1px solid #30363d',
              background: filter === 'recurring' ? '#1f6feb' : '#21262d',
              color: filter === 'recurring' ? '#ffffff' : '#c9d1d9',
            }}
          >
            🔄 Daily ({tasks.filter(t => t.isRecurring).length})
          </button>
          <button
            onClick={() => setFilter('inactive')}
            style={{
              padding: '6px 12px',
              borderRadius: '6px',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
              border: '1px solid #30363d',
              background: filter === 'inactive' ? '#da3633' : '#21262d',
              color: filter === 'inactive' ? '#ffffff' : '#c9d1d9',
            }}
          >
            Inactive ({tasks.filter(t => !t.active).length})
          </button>
        </div>

        <input
          type="text"
          placeholder="🔍 Search quests..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="admin-input"
          style={{ width: '220px', marginBottom: 0, padding: '6px 10px', fontSize: '0.85rem' }}
        />
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
                <th style={{ width: '48px' }}>Order</th>
                <th>Task</th>
                <th>Type</th>
                <th>Target URL</th>
                <th>Reward</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTasks.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: '#8b949e' }}>
                    No tasks found matching filter. Click &quot;Create New Task&quot; to add one!
                  </td>
                </tr>
              ) : (
                filteredTasks.map(task => (
                  <tr key={task.id}>
                    <td>
                      <span style={{
                        display: 'inline-block',
                        padding: '2px 6px',
                        background: '#161b22',
                        border: '1px solid #30363d',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        color: '#8b949e',
                      }}>
                        #{task.order || 1}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                          fontSize: '1.25rem',
                          width: '32px',
                          height: '32px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: '#21262d',
                          borderRadius: '8px',
                          flexShrink: 0,
                        }}>
                          {task.icon || '⚡'}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: '#f0f6fc', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span>{task.title}</span>
                            {task.isRecurring && (
                              <span style={{ fontSize: '0.65rem', padding: '1px 5px', borderRadius: '4px', background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', fontWeight: 700 }}>
                                🔄 Daily
                              </span>
                            )}
                          </div>
                          {task.description && (
                            <div style={{ fontSize: '0.75rem', color: '#8b949e', marginTop: '2px', maxWidth: '280px' }}>
                              {task.description}
                            </div>
                          )}
                        </div>
                      </div>
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
                      <span style={{ color: '#e3b341', fontWeight: 700 }}>+{task.reward?.toLocaleString()} pts</span>
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
            borderRadius: '12px',
            width: '100%',
            maxWidth: '560px',
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
              {/* Task Title */}
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

              {/* Icon Selector with Quick Presets */}
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#8b949e', marginBottom: '4px' }}>
                  Task Icon (Emoji or Icon)
                </label>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
                  <input
                    type="text"
                    placeholder="e.g. 📢, 🌐, 🚀"
                    value={icon}
                    onChange={e => setIcon(e.target.value)}
                    className="admin-input"
                    style={{ width: '80px', textAlign: 'center', fontSize: '1.25rem', marginBottom: 0 }}
                  />
                  <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', flex: 1 }}>
                    {PRESET_ICONS.map(p => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setIcon(p)}
                        style={{
                          background: icon === p ? '#1f6feb' : '#21262d',
                          border: '1px solid #30363d',
                          borderRadius: '6px',
                          padding: '4px 8px',
                          cursor: 'pointer',
                          fontSize: '1rem',
                        }}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Description */}
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#8b949e', marginBottom: '4px' }}>
                  Description (Optional)
                </label>
                <textarea
                  placeholder="Brief instructions for the user..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="admin-input"
                  style={{ marginBottom: 0, minHeight: '54px', resize: 'vertical' }}
                />
              </div>

              {/* Task Type & Reward */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: '#8b949e', marginBottom: '4px' }}>
                    Task Type
                  </label>
                  <select
                    value={taskType}
                    onChange={e => handleTypeChange(e.target.value)}
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

              {/* Target URL */}
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#8b949e', marginBottom: '4px' }}>
                  Target URL (Link to join or visit)
                </label>
                <input
                  type="text"
                  placeholder="https://t.me/YourChannel or @YourChannel"
                  value={targetUrl}
                  onChange={e => setTargetUrl(e.target.value)}
                  className="admin-input"
                  style={{ marginBottom: 0 }}
                />
                <span style={{ fontSize: '0.75rem', color: '#6e7681', marginTop: '4px', display: 'block' }}>
                  Supports @channelName (auto-formatted to https://t.me/channelName)
                </span>
              </div>

              {/* Verification & Display Order */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: '#8b949e', marginBottom: '4px' }}>
                    Verification Method
                  </label>
                  <select
                    value={verificationType}
                    onChange={e => setVerificationType(e.target.value)}
                    className="admin-input"
                    style={{ marginBottom: 0 }}
                  >
                    <option value="manual">Manual Verify Button (Timer)</option>
                    <option value="auto">Auto Verify (Instant on click)</option>
                    <option value="telegram">Telegram Membership Check</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: '#8b949e', marginBottom: '4px' }}>
                    Display Order (Priority)
                  </label>
                  <input
                    type="number"
                    min="1"
                    placeholder="1"
                    value={order}
                    onChange={e => setOrder(e.target.value)}
                    className="admin-input"
                    style={{ marginBottom: 0 }}
                  />
                </div>
              </div>

              {/* Toggles: Recurring & Active */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem', background: '#0d1117', padding: '12px', borderRadius: '8px', border: '1px solid #30363d' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: '#c9d1d9', fontSize: '0.85rem' }}>
                  <input
                    type="checkbox"
                    checked={isRecurring}
                    onChange={e => setIsRecurring(e.target.checked)}
                    style={{ width: '16px', height: '16px' }}
                  />
                  <span>🔄 Daily Quest (Repeatable every 24h)</span>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: '#c9d1d9', fontSize: '0.85rem' }}>
                  <input
                    type="checkbox"
                    checked={active}
                    onChange={e => setActive(e.target.checked)}
                    style={{ width: '16px', height: '16px' }}
                  />
                  <span>Visible to Users (Active)</span>
                </label>
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
