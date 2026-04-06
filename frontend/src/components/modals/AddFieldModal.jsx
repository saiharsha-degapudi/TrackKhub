import React, { useState } from 'react'
import { useApp } from '../../context/AppContext'

const ISSUE_TYPES = ['Feature', 'Initiative', 'Epic', 'Story', 'Task', 'Sub-task']

export default function AddFieldModal() {
  const { closeModal, doCreateCustomField } = useApp()
  const [name, setName] = useState('')
  const [type, setType] = useState('Text')
  const [required, setRequired] = useState(false)
  const [applyTo, setApplyTo] = useState(new Set(ISSUE_TYPES))

  const toggleApplyTo = (t) => {
    setApplyTo(prev => {
      const next = new Set(prev)
      if (next.has(t)) next.delete(t); else next.add(t)
      return next
    })
  }

  const handleCreate = async () => {
    if (!name.trim()) { alert('Name required'); return }
    await doCreateCustomField({ name: name.trim(), type, required, applyTo: Array.from(applyTo) })
  }

  return (
    <div>
      <div className="modal-title">Add Custom Field</div>
      <button className="modal-close" onClick={closeModal}>×</button>

      <div className="form-group">
        <label className="form-label">Name *</label>
        <input className="form-input" placeholder="e.g. Customer Impact" value={name} onChange={e => setName(e.target.value)} />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Type</label>
          <select className="form-select" value={type} onChange={e => setType(e.target.value)}>
            {['Text', 'Number', 'Date', 'Select', 'Checkbox'].map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Required</label>
          <select className="form-select" value={required ? 'true' : 'false'} onChange={e => setRequired(e.target.value === 'true')}>
            <option value="false">Optional</option>
            <option value="true">Required</option>
          </select>
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Apply to</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, padding: '6px 0' }}>
          {ISSUE_TYPES.map(t => (
            <label key={t} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, cursor: 'pointer' }}>
              <input type="checkbox" checked={applyTo.has(t)} onChange={() => toggleApplyTo(t)} />
              {t}
            </label>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 8 }}>
        <button className="btn btn-ghost" onClick={closeModal}>Cancel</button>
        <button className="btn btn-primary" onClick={handleCreate}>Add Field</button>
      </div>
    </div>
  )
}
