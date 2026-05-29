import React, { useState, useMemo } from 'react'
import { useApp } from '../../context/AppContext'

const ISSUE_TYPES = ['Feature', 'Initiative', 'Epic', 'Story', 'Task', 'Sub-task']
const STATUSES    = ['To Do', 'In Progress', 'In Review', 'Done', 'Blocked']
const PRIORITIES  = ['Critical', 'High', 'Medium', 'Low']

export default function EditTicketModal({ data: tid }) {
  const { tickets, users, teams, sprints, projects, closeModal, doUpdateTicket } = useApp()
  const t = tickets.find(x => x.id === tid)
  if (!t) return <div style={{ padding: 20 }}>Ticket not found</div>

  const pid = t.project

  // ── Project-scoped data ────────────────────────────────────────────────────
  const projectSprints = useMemo(
    () => sprints.filter(s => s.project === pid && s.status !== 'completed').sort((a,b) => a.order - b.order),
    [sprints, pid]
  )

  // ── State ─────────────────────────────────────────────────────────────────
  const [title,     setTitle]     = useState(t.title)
  const [desc,      setDesc]      = useState(t.desc || '')
  const [type,      setType]      = useState(t.type)
  const [status,    setStatus]    = useState(t.status)
  const [priority,  setPriority]  = useState(t.priority)
  const [startDate, setStartDate] = useState(t.startDate || '')
  const [dueDate,   setDueDate]   = useState(t.dueDate   || '')
  const [sprint,    setSprint]    = useState(t.sprint    || '')
  const [storyPts,  setStoryPts]  = useState(t.storyPoints ?? '')
  const [labels,    setLabels]    = useState((t.labels || []).join(', '))

  // ── Team → Assignee cascade ────────────────────────────────────────────────
  const defaultTeamId = useMemo(() => {
    for (const team of teams) {
      if ((team.members || []).some(mid => {
        const u = users.find(u => u.id === mid)
        return u?.name === t.assignee
      })) return String(team.id)
    }
    return ''
  }, [teams, users, t.assignee])

  const [selectedTeamId, setSelectedTeamId] = useState(defaultTeamId)
  const [assignee,       setAssignee]       = useState(t.assignee || '')

  const assignableUsers = useMemo(() => {
    if (!selectedTeamId) return users.filter(u => u.active)
    const team = teams.find(tm => String(tm.id) === selectedTeamId)
    if (!team?.members?.length) return users.filter(u => u.active)
    const filtered = users.filter(u => team.members.includes(u.id) && u.active)
    return filtered.length ? filtered : users.filter(u => u.active)
  }, [selectedTeamId, teams, users])

  const handleTeamChange = (newTeamId) => {
    setSelectedTeamId(newTeamId)
    const team = teams.find(tm => String(tm.id) === newTeamId)
    if (team?.members?.length) {
      const first = users.find(u => team.members.includes(u.id) && u.active)
      if (first) setAssignee(first.name)
    }
  }

  const selectedTeam = teams.find(tm => String(tm.id) === selectedTeamId)

  // ── Save ──────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!title.trim()) { alert('Title is required'); return }
    await doUpdateTicket(t.id, {
      title:       title.trim(),
      desc,
      type,
      status,
      priority,
      assignee,
      startDate:   startDate || null,
      dueDate:     dueDate   || null,
      sprint:      sprint    || null,
      storyPoints: storyPts !== '' ? Number(storyPts) : null,
      labels:      labels.split(',').map(s => s.trim()).filter(Boolean),
    })
  }

  return (
    <div>
      <div className="modal-title">Edit: {t.id}</div>
      <button className="modal-close" onClick={closeModal}>×</button>

      {/* Title */}
      <div className="form-group">
        <label className="form-label">Title *</label>
        <input className="form-input" value={title} onChange={e => setTitle(e.target.value)} />
      </div>

      {/* Description */}
      <div className="form-group">
        <label className="form-label">Description</label>
        <textarea className="form-textarea" rows={3} value={desc} onChange={e => setDesc(e.target.value)} />
      </div>

      {/* Type + Status */}
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Issue Type</label>
          <select className="form-select" value={type} onChange={e => setType(e.target.value)}>
            {ISSUE_TYPES.map(x => <option key={x} value={x}>{x}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Status</label>
          <select className="form-select" value={status} onChange={e => setStatus(e.target.value)}>
            {STATUSES.map(x => <option key={x} value={x}>{x}</option>)}
          </select>
        </div>
      </div>

      {/* Priority + Story Points */}
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Priority</label>
          <select className="form-select" value={priority} onChange={e => setPriority(e.target.value)}>
            {PRIORITIES.map(x => <option key={x} value={x}>{x}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Story Points</label>
          <input
            className="form-input" type="number" min="0" max="100"
            placeholder="e.g. 3"
            value={storyPts}
            onChange={e => setStoryPts(e.target.value)}
          />
        </div>
      </div>

      {/* Team → filters assignees */}
      <div className="form-group">
        <label className="form-label">
          Team
          <span style={{ fontSize: 10, color: 'var(--gray-400)', marginLeft: 6, fontWeight: 400 }}>(filters assignees)</span>
        </label>
        <select className="form-select" value={selectedTeamId} onChange={e => handleTeamChange(e.target.value)}>
          <option value="">— All users —</option>
          {teams.map(tm => (
            <option key={tm.id} value={String(tm.id)}>
              {tm.name} ({(tm.members || []).length} members)
            </option>
          ))}
        </select>
      </div>

      {/* Team preview */}
      {selectedTeam && (
        <div style={{ padding: '7px 12px', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 7, marginBottom: 12, fontSize: 12, color: '#1e40af' }}>
          👥 <strong>{selectedTeam.name}</strong> — {assignableUsers.map(u => u.name).join(' · ')}
        </div>
      )}

      {/* Assignee */}
      <div className="form-group">
        <label className="form-label">Assignee</label>
        <select className="form-select" value={assignee} onChange={e => setAssignee(e.target.value)}>
          <option value="">Unassigned</option>
          {assignableUsers.map(u => <option key={u.id} value={u.name}>{u.name}</option>)}
        </select>
      </div>

      {/* Sprint (project-scoped) */}
      <div className="form-group">
        <label className="form-label">Sprint</label>
        <select className="form-select" value={sprint} onChange={e => setSprint(e.target.value)}>
          <option value="">Backlog (no sprint)</option>
          {projectSprints.map(s => (
            <option key={s.id} value={s.name}>
              {s.name}{s.status === 'active' ? ' ⚡ Active' : s.status === 'planning' ? ' · Planning' : ''}
            </option>
          ))}
        </select>
      </div>

      {/* Dates */}
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Start Date</label>
          <input className="form-input" type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">Due Date</label>
          <input className="form-input" type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} />
        </div>
      </div>

      {/* Labels */}
      <div className="form-group">
        <label className="form-label">Labels <span style={{ fontSize: 10, color: 'var(--gray-400)', fontWeight: 400 }}>(comma separated)</span></label>
        <input
          className="form-input"
          placeholder="e.g. backend, ux, priority"
          value={labels}
          onChange={e => setLabels(e.target.value)}
        />
      </div>

      {/* Project (read-only info) */}
      <div style={{ fontSize: 11, color: 'var(--gray-400)', marginBottom: 16 }}>
        Project: {projects.find(p => p.id === pid)?.name || pid} · Reporter: {t.reporter} · Created: {t.created}
      </div>

      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        <button className="btn btn-ghost" onClick={closeModal}>Cancel</button>
        <button className="btn btn-primary" onClick={handleSave}>Save Changes</button>
      </div>
    </div>
  )
}
