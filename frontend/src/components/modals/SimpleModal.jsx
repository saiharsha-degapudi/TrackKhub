import React, { useState } from 'react'
import { useApp } from '../../context/AppContext'

export default function SimpleModal({ type }) {
  const { closeModal, doAddGroup, doAddRole } = useApp()
  const [val, setVal] = useState('')

  const isGroup = type === 'addGroup'
  const title = isGroup ? 'Add Group' : 'Add Role'
  const placeholder = isGroup ? 'Group Name' : 'Role Name'

  const handleCreate = async () => {
    if (!val.trim()) return
    if (isGroup) await doAddGroup(val.trim())
    else await doAddRole(val.trim())
  }

  return (
    <div>
      <div className="modal-title">{title}</div>
      <button className="modal-close" onClick={closeModal}>×</button>
      <div className="form-group">
        <label className="form-label">{placeholder} *</label>
        <input className="form-input" placeholder={placeholder} value={val} onChange={e => setVal(e.target.value)} />
      </div>
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 8 }}>
        <button className="btn btn-ghost" onClick={closeModal}>Cancel</button>
        <button className="btn btn-primary" onClick={handleCreate}>Create</button>
      </div>
    </div>
  )
}
