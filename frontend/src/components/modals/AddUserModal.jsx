import React, { useState } from 'react'
import { useApp } from '../../context/AppContext'

export default function AddUserModal({ data: editId }) {
  const { users, roles, groups, closeModal, doCreateUser, doUpdateUser } = useApp()
  const existing = editId ? users.find(u => u.id === editId) : null

  const [firstName, setFirstName] = useState(existing ? existing.name.split(' ')[0] : '')
  const [lastName, setLastName] = useState(existing ? existing.name.split(' ').slice(1).join(' ') : '')
  const [email, setEmail] = useState(existing?.email || '')
  const [role, setRole] = useState(existing?.role || roles[0] || 'Viewer')
  const [group, setGroup] = useState(existing?.group || groups[0] || 'Engineering')

  const isEdit = !!existing

  const handleSubmit = async () => {
    if (!firstName.trim() || !email.trim()) { alert('Name+email required'); return }
    const name = `${firstName.trim()} ${lastName.trim()}`.trim()
    if (isEdit) {
      await doUpdateUser(existing.id, { name, email: email.trim(), role, group })
    } else {
      await doCreateUser({ name, email: email.trim(), role, group })
    }
  }

  return (
    <div>
      <div className="modal-title">{isEdit ? 'Edit User' : 'Add User'}</div>
      <button className="modal-close" onClick={closeModal}>×</button>

      {isEdit ? (
        <>
          <div className="form-group">
            <label className="form-label">Name</label>
            <input className="form-input" value={`${firstName} ${lastName}`} onChange={e => {
              const parts = e.target.value.split(' ')
              setFirstName(parts[0] || '')
              setLastName(parts.slice(1).join(' '))
            }} />
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input className="form-input" type="email" value={email} onChange={e => setEmail(e.target.value)} />
          </div>
        </>
      ) : (
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">First Name *</label>
            <input className="form-input" placeholder="John" value={firstName} onChange={e => setFirstName(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Last Name</label>
            <input className="form-input" placeholder="Doe" value={lastName} onChange={e => setLastName(e.target.value)} />
          </div>
        </div>
      )}

      {!isEdit && (
        <div className="form-group">
          <label className="form-label">Email *</label>
          <input className="form-input" type="email" placeholder="john@company.com" value={email} onChange={e => setEmail(e.target.value)} />
        </div>
      )}

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Role</label>
          <select className="form-select" value={role} onChange={e => setRole(e.target.value)}>
            {roles.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Group</label>
          <select className="form-select" value={group} onChange={e => setGroup(e.target.value)}>
            {groups.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 8 }}>
        <button className="btn btn-ghost" onClick={closeModal}>Cancel</button>
        <button className="btn btn-primary" onClick={handleSubmit}>{isEdit ? 'Save' : 'Add User'}</button>
      </div>
    </div>
  )
}
