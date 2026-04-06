import React, { useState } from 'react'
import { useApp } from '../../context/AppContext'

const ISSUE_TYPES = ['Feature', 'Initiative', 'Epic', 'Story', 'Task', 'Sub-task']
const STATUSES = ['To Do', 'In Progress', 'In Review', 'Done', 'Blocked']
const PRIORITIES = ['Critical', 'High', 'Medium', 'Low']

export default function EditTicketModal({ data: tid }) {
  const { tickets, users, closeModal, doUpdateTicket } = useApp()
  const t = tickets.find(x => x.id === tid)
  if (!t) return <div>Not found</div>

  const [title, setTitle] = useState(t.title)
  const [desc, setDesc] = useState(t.desc || '')
  const [type, setType] = useState(t.type)
  const [status, setStatus] = useState(t.status)
  const [priority, setPriority] = useState(t.priority)
  const [assignee, setAssignee] = useState(t.assignee)
  const [startDate, setStartDate] = useState(t.startDate || '')
  const [dueDate, setDueDate] = useState(t.dueDate || '')

  const handleSave = async () => {
    await doUpdateTicket(t.id, { title, desc, type, status, priority, assignee, startDate: startDate || null, dueDate: dueDate || null })
  }

  return (
    <div>
      <div className="modal-title">Edit: {t.id}</div>
      <button className="modal-close" onClick={closeModal}>×</button>

      <div className="form-group">
        <label className="form-label">Title</label>
        <input className="form-input" value={title} onChange={e => setTitle(e.target.value)} />
      </div>
      <div className="form-group">
        <label className="form-label">Description</label>
        <textarea className="form-textarea" value={desc} onChange={e => setDesc(e.target.value)} />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Type</label>
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

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Priority</label>
          <select className="form-select" value={priority} onChange={e => setPriority(e.target.value)}>
            {PRIORITIES.map(x => <option key={x} value={x}>{x}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Assignee</label>
          <select className="form-select" value={assignee} onChange={e => setAssignee(e.target.value)}>
            {users.map(u => <option key={u.id} value={u.name}>{u.name}</option>)}
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

      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 8 }}>
        <button className="btn btn-ghost" onClick={closeModal}>Cancel</button>
        <button className="btn btn-primary" onClick={handleSave}>Save Changes</button>
      </div>
    </div>
  )
}
