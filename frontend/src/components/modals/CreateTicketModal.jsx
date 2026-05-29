import React, { useState, useMemo } from 'react'
import { useApp } from '../../context/AppContext'

const ISSUE_TYPES = ['Feature', 'Initiative', 'Epic', 'Story', 'Task', 'Sub-task']
const ISSUE_TYPE_PARENT = { Initiative: 'Feature', Epic: 'Initiative', Story: 'Epic', Task: 'Story', 'Sub-task': 'Task' }
const PRIORITIES = ['Critical', 'High', 'Medium', 'Low']
const SPRINTS = ['Sprint 1', 'Sprint 2', 'Sprint 3', 'Sprint 4', 'Sprint 5']

export default function CreateTicketModal({ data, extra }) {
  const { projects, tickets, users, teams, activeProject, user, closeModal, doCreateTicket } = useApp()

  const parentId    = extra || null
  const pTicket     = parentId ? tickets.find(t => t.id === parentId) : null
  const defType     = pTicket
    ? (Object.entries(ISSUE_TYPE_PARENT).find(([child, par]) => par === pTicket.type)?.[0] || 'Task')
    : 'Feature'
  const defaultPid  = activeProject || projects[0]?.id

  const [pid,       setPid]       = useState(defaultPid)
  const [type,      setType]      = useState(data?.type || defType)
  const [title,     setTitle]     = useState('')
  const [desc,      setDesc]      = useState('')
  const [priority,  setPriority]  = useState('Medium')
  const [startDate, setStartDate] = useState('')
  const [dueDate,   setDueDate]   = useState('')
  const [parent,    setParent]    = useState(parentId || '')
  const [sprint,    setSprint]    = useState('Sprint 2')
  const [labels,    setLabels]    = useState('')

  // ── Team selection (drives assignee list) ──────────────────────────────────
  // Pre-select the team linked to the project (if any)
  const defaultTeamId = useMemo(() => {
    const numPid = parseInt(pid)
    const proj = projects.find(p => p.id === numPid)
    if (proj?.team) {
      const t = teams.find(t => t.id === proj.team)
      if (t) return String(t.id)
    }
    const byProject = teams.find(t => t.project === numPid)
    if (byProject) return String(byProject.id)
    return ''
  }, [pid, projects, teams])

  const [selectedTeamId, setSelectedTeamId] = useState(defaultTeamId)

  // Assignable users = members of selected team, or everyone if no team chosen
  const assignableUsers = useMemo(() => {
    if (!selectedTeamId) return users
    const team = teams.find(t => String(t.id) === selectedTeamId)
    if (!team?.members?.length) return users
    const filtered = users.filter(u => team.members.includes(u.id))
    return filtered.length ? filtered : users
  }, [selectedTeamId, teams, users])

  const [assignee, setAssignee] = useState(assignableUsers[0]?.name || '')

  // When team changes, reset assignee to first available
  const handleTeamChange = (newTeamId) => {
    setSelectedTeamId(newTeamId)
    const team = teams.find(t => String(t.id) === newTeamId)
    if (team?.members?.length) {
      const first = users.find(u => team.members.includes(u.id))
      setAssignee(first?.name || users[0]?.name || '')
    } else {
      setAssignee(users[0]?.name || '')
    }
  }

  const projectTickets = tickets.filter(t => t.project === parseInt(pid))

  const handleSubmit = async () => {
    if (!title.trim()) { alert('Title required'); return }
    await doCreateTicket({
      project:   parseInt(pid),
      type,
      title:     title.trim(),
      desc,
      priority,
      assignee:  assignee || assignableUsers[0]?.name || '',
      reporter:  user?.name || '',
      startDate: startDate || null,
      dueDate:   dueDate   || null,
      parent:    parent    || null,
      sprint,
      labels:    labels.split(',').map(s => s.trim()).filter(Boolean),
    })
  }

  const selectedTeam = teams.find(t => String(t.id) === selectedTeamId)

  return (
    <div>
      <div className="modal-title">{parentId ? `Create Child of ${parentId}` : 'Create Ticket'}</div>
      <button className="modal-close" onClick={closeModal}>×</button>

      {/* Project + Issue Type */}
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Project *</label>
          <select className="form-select" value={pid} onChange={e => setPid(e.target.value)}>
            {projects.map(p => <option key={p.id} value={p.id}>{p.name} ({p.key})</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Issue Type *</label>
          <select className="form-select" value={type} onChange={e => setType(e.target.value)}>
            {ISSUE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      </div>

      {/* Title */}
      <div className="form-group">
        <label className="form-label">Title *</label>
        <input className="form-input" placeholder="Enter ticket title..." value={title} onChange={e => setTitle(e.target.value)} />
      </div>

      {/* Description */}
      <div className="form-group">
        <label className="form-label">Description</label>
        <textarea className="form-textarea" placeholder="Describe the issue..." value={desc} onChange={e => setDesc(e.target.value)} />
      </div>

      {/* Priority + Team */}
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Priority</label>
          <select className="form-select" value={priority} onChange={e => setPriority(e.target.value)}>
            {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">
            Team
            <span style={{ fontSize: 10, color: 'var(--gray-400)', marginLeft: 6, fontWeight: 400 }}>
              (filters assignees)
            </span>
          </label>
          <select
            className="form-select"
            value={selectedTeamId}
            onChange={e => handleTeamChange(e.target.value)}
          >
            <option value="">— All Users —</option>
            {teams.map(t => (
              <option key={t.id} value={String(t.id)}>
                {t.name} ({(t.members || []).length} members)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Team members preview + Assignee */}
      {selectedTeam && (
        <div style={{
          padding: '8px 12px', background: '#eff6ff', borderRadius: 7,
          border: '1px solid #bfdbfe', marginBottom: 12,
          display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap'
        }}>
          <span style={{ fontSize: 12, color: '#1e40af', fontWeight: 600 }}>
            👥 {selectedTeam.name}
          </span>
          <span style={{ fontSize: 11, color: '#3b82f6' }}>
            {assignableUsers.map(u => u.name).join(' · ')}
          </span>
        </div>
      )}

      <div className="form-group">
        <label className="form-label">Assignee</label>
        <select className="form-select" value={assignee} onChange={e => setAssignee(e.target.value)}>
          {assignableUsers.map(u => <option key={u.id} value={u.name}>{u.name}</option>)}
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

      {/* Parent + Sprint */}
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Parent Ticket{parentId ? ` (${parentId})` : ''}</label>
          <select className="form-select" value={parent} onChange={e => setParent(e.target.value)}>
            <option value="">None</option>
            {projectTickets.map(t => (
              <option key={t.id} value={t.id}>{t.id}: {t.title.slice(0, 32)}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Sprint</label>
          <select className="form-select" value={sprint} onChange={e => setSprint(e.target.value)}>
            {SPRINTS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {/* Labels */}
      <div className="form-group">
        <label className="form-label">Labels (comma separated)</label>
        <input className="form-input" placeholder="e.g. bug, ux" value={labels} onChange={e => setLabels(e.target.value)} />
      </div>

      <div style={{ padding: '10px 12px', background: '#f0fdf4', borderRadius: 7, border: '1px solid #bbf7d0', fontSize: 12, color: '#166534', marginBottom: 12 }}>
        ✅ Ticket will be created with status <strong>To Do</strong> and placed in the <strong>Backlog</strong>
      </div>

      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        <button className="btn btn-ghost" onClick={closeModal}>Cancel</button>
        <button className="btn btn-primary" onClick={handleSubmit}>Create Ticket</button>
      </div>
    </div>
  )
}
