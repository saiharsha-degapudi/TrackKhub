import React, { useState } from 'react'
import { useApp } from '../../context/AppContext'

export default function CreateProjectModal() {
  const { users, projects, closeModal, doCreateProject } = useApp()
  const [name, setName] = useState('')
  const [key, setKey] = useState('')
  const [desc, setDesc] = useState('')
  const [lead, setLead] = useState(users[0]?.name || '')
  const [color, setColor] = useState('#1a56db')

  const handleCreate = async () => {
    if (!name.trim() || !key.trim()) { alert('Name+Key required'); return }
    const k = key.trim().toUpperCase()
    if (projects.find(p => p.key === k)) { alert('Key exists'); return }
    await doCreateProject({ name: name.trim(), key: k, description: desc || 'No description', color, lead })
  }

  return (
    <div>
      <div className="modal-title">Create Project</div>
      <button className="modal-close" onClick={closeModal}>×</button>

      <div className="form-group">
        <label className="form-label">Name *</label>
        <input className="form-input" placeholder="e.g. Mobile App v2" value={name} onChange={e => setName(e.target.value)} />
      </div>
      <div className="form-group">
        <label className="form-label">Key * (3-5 letters)</label>
        <input className="form-input" placeholder="MOB" maxLength={5} value={key} onChange={e => setKey(e.target.value)} />
      </div>
      <div className="form-group">
        <label className="form-label">Description</label>
        <textarea className="form-textarea" style={{ minHeight: 55 }} value={desc} onChange={e => setDesc(e.target.value)} />
      </div>
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Lead</label>
          <select className="form-select" value={lead} onChange={e => setLead(e.target.value)}>
            {users.map(u => <option key={u.id} value={u.name}>{u.name}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Color</label>
          <input className="form-input" type="color" value={color} onChange={e => setColor(e.target.value)} style={{ height: 40, padding: '4px 8px' }} />
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 8 }}>
        <button className="btn btn-ghost" onClick={closeModal}>Cancel</button>
        <button className="btn btn-primary" onClick={handleCreate}>Create</button>
      </div>
    </div>
  )
}
