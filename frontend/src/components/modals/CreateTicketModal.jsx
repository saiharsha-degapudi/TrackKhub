import React, { useState, useMemo } from 'react'
import { useApp } from '../../context/AppContext'

const ISSUE_TYPES = ['Feature', 'Initiative', 'Epic', 'Story', 'Task', 'Sub-task']
const ISSUE_TYPE_PARENT = { Initiative: 'Feature', Epic: 'Initiative', Story: 'Epic', Task: 'Story', 'Sub-task': 'Task' }
const PRIORITIES = ['Critical', 'High', 'Medium', 'Low']
const SPRINTS = ['Sprint 1', 'Sprint 2', 'Sprint 3', 'Sprint 4', 'Sprint 5']

export default function CreateTicketModal({ data, extra }) {
  const { projects, tickets, users, teams, activeProject, user, closeModal, doCreateTicket } = useApp()
  const parentId = extra || null
  const pTicket = parentId ? tickets.find(t => t.id === parentId) : null
  const defType = pTicket
    ? (Object.entries(ISSUE_TYPE_PARENT).find(([child, par]) => par === pTicket.type)?.[0] || 'Task')
    : 'Feature'
  const defaultPid = activeProject || projects[0]?.id

  const [pid, setPid] = useState(defaultPid)
  const [type, setType] = useState(data?.type || defType)
  const [title, setTitle] = useState('')
  const [desc, setDesc] = useState('')
  const [priority, setPriority] = useState('Medium')
  const [startDate, setStartDate] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [parent, setParent] = useState(parentId || '')
  const [sprint, setSprint] = useState('Sprint 2')
  const [labels, setLabels] = useState('')

  // Resolve assignable users based on the team linked to the selected project
  const assignableUsers = useMemo(() => {
    const numPid = parseInt(pid)
    // Try to find a team whose project matches, or project has a team field
    const selectedProject = projects.find(p => p.id === numPid)
    let team = null
    if (selectedProject?.team) {
      team = teams.find(t => t.id === selectedProject.team)
    }
    if (!team) {
      team = teams.find(t => t.project === numPid)
    }
    if (team && team.members && team.members.length > 0) {
      const teamUsers = users.filter(u => team.members.includes(u.id))
      return teamUsers.length > 0 ? teamUsers : users
    }
    return users
  }, [pid, projects, teams, users])

  const [assignee, setAssignee] = useState(assignableUsers[0]?.name || '')

  // Reset assignee when project changes
  const handleProjectChange = (newPid) => {
    setPid(newPid)
  }

  const projectTickets = tickets.filter(t => t.project === parseInt(pid))

  const handleSubmit = async () => {
    if (!title.trim()) { alert('Title required'); return }
    await doCreateTicket({
      project: parseInt(pid),
      type,
      title: title.trim(),
      desc,
      priority,
      assignee: assignee || assignableUsers[0]?.name || '',
      reporter: user?.name || '',
      startDate: startDate || null,
      dueDate: dueDate || null,
      parent: parent || null,
      sprint,
      labels: labels.split(',').map(s => s.trim()).filter(Boolean),
    })
  }

  return (
    <div>
      <div className="modal-title">{parentId ? `Create Child of ${parentId}` : 'Create Ticket → goes to Backlog'}</div>
      <button className="modal-close" onClick={closeModal}>×</button>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Project *</label>
          <select className="form-select" value={pid} onChange={e => handleProjectChange(e.target.value)}>
            {projects.map(p => <option key={p.id} value={p.id}>{p.name} ({p.key})</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">
            Issue Type * <span style={{ fontSize: 10, color: 'var(--gray-400)' }}>(Feature→Initiative→Epic→Story→Task→Sub-task)</span>
          </label>
          <select className="form-select" value={type} onChange={e => setType(e.target.value)}>
            {ISSUE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Title *</label>
        <input className="form-input" placeholder="Enter ticket title..." value={title} onChange={e => setTitle(e.target.value)} />
      </div>
      <div className="form-group">
        <label className="form-label">Description</label>
        <textarea className="form-textarea" placeholder="Describe the issue..." value={desc} onChange={e => setDesc(e.target.value)} />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Priority</label>
          <select className="form-select" value={priority} onChange={e => setPriority(e.target.value)}>
            {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">
            Assignee
            {assignableUsers.length < users.length && (
              <span style={{ fontSize: 10, color: 'var(--blue)', marginLeft: 6 }}>
                (team members only)
              </span>
            )}
          </label>
          <select className="form-select" value={assignee} onChange={e => setAssignee(e.target.value)}>
            {assignableUsers.map(u => <option key={u.id} value={u.name}>{u.name}</option>)}
          </select>
        </div>
      </div>

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

      <div className="form-group">
        <label className="form-label">Labels (comma separated)</label>
        <input className="form-input" placeholder="e.g. bug, ux" value={labels} onChange={e => setLabels(e.target.value)} />
      </div>

      <div style={{ padding: '10px 12px', background: '#f0fdf4', borderRadius: 7, border: '1px solid #bbf7d0', fontSize: 12, color: '#166534', marginBottom: 12 }}>
        ✅ Ticket will be created with status <strong>To Do</strong> and placed in the <strong>Backlog</strong>
      </div>

      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        <button className="btn btn-ghost" onClick={closeModal}>Cancel</button>
        <button className="btn btn-primary" onClick={handleSubmit}>Create & Add to Backlog</button>
      </div>
    </div>
  )
}
