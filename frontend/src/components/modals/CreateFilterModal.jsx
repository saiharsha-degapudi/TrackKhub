import React, { useState } from 'react'
import { useApp } from '../../context/AppContext'

const STATUSES = ['To Do', 'In Progress', 'In Review', 'Done', 'Blocked']
const PRIORITIES = ['Critical', 'High', 'Medium', 'Low']
const ISSUE_TYPES = ['Feature', 'Initiative', 'Epic', 'Story', 'Task', 'Sub-task']
const SPRINTS = ['Sprint 1', 'Sprint 2', 'Sprint 3']

export default function CreateFilterModal() {
  const { users, user, closeModal, doCreateFilter } = useApp()
  const [name, setName] = useState('')
  const [assignee, setAssignee] = useState('')
  const [priority, setPriority] = useState('')
  const [status, setStatus] = useState('')
  const [type, setType] = useState('')
  const [sprint, setSprint] = useState('')
  const [shared, setShared] = useState(true)

  const handleCreate = async () => {
    if (!name.trim()) { alert('Name required'); return }
    const cond = {}
    if (assignee) cond.assignee = assignee
    if (priority) cond.priority = priority
    if (status) cond.status = [status]
    if (type) cond.type = [type]
    if (sprint) cond.sprint = sprint
    await doCreateFilter({ name: name.trim(), conditions: cond, owner: user?.name || '', shared })
  }

  return (
    <div>
      <div className="modal-title">Create Filter</div>
      <button className="modal-close" onClick={closeModal}>×</button>

      <div className="form-group">
        <label className="form-label">Name *</label>
        <input className="form-input" placeholder="My Sprint Tasks" value={name} onChange={e => setName(e.target.value)} />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Assignee</label>
          <select className="form-select" value={assignee} onChange={e => setAssignee(e.target.value)}>
            <option value="">Any</option>
            {users.map(u => <option key={u.id} value={u.name}>{u.name}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Priority</label>
          <select className="form-select" value={priority} onChange={e => setPriority(e.target.value)}>
            <option value="">Any</option>
            {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Status</label>
          <select className="form-select" value={status} onChange={e => setStatus(e.target.value)}>
            <option value="">Any</option>
            {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Type</label>
          <select className="form-select" value={type} onChange={e => setType(e.target.value)}>
            <option value="">Any</option>
            {ISSUE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Sprint</label>
        <select className="form-select" value={sprint} onChange={e => setSprint(e.target.value)}>
          <option value="">Any</option>
          {SPRINTS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="form-group">
        <div className="toggle-wrap">
          <div className={`toggle ${shared ? 'on' : ''}`} onClick={() => setShared(s => !s)}>
            <div className="toggle-knob" />
          </div>
          <label className="form-label" style={{ margin: 0 }}>Share with team</label>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 8 }}>
        <button className="btn btn-ghost" onClick={closeModal}>Cancel</button>
        <button className="btn btn-primary" onClick={handleCreate}>Create Filter</button>
      </div>
    </div>
  )
}
