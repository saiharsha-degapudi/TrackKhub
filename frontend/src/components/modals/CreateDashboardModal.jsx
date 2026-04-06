import React, { useState } from 'react'
import { useApp } from '../../context/AppContext'

export default function CreateDashboardModal() {
  const { filters, closeModal, doCreateDashboard, getFilteredTickets } = useApp()
  const [name, setName] = useState('')
  const [filterId, setFilterId] = useState('')

  const handleCreate = async () => {
    if (!name.trim()) { alert('Name required'); return }
    await doCreateDashboard({ name: name.trim(), filterId: filterId ? parseInt(filterId) : null, reportType: 'issue-list' })
  }

  return (
    <div>
      <div className="modal-title">Create Dashboard</div>
      <button className="modal-close" onClick={closeModal}>×</button>

      <div className="form-group">
        <label className="form-label">Dashboard Name *</label>
        <input className="form-input" placeholder="e.g. My Sprint Dashboard" value={name} onChange={e => setName(e.target.value)} />
      </div>

      <div className="form-group">
        <label className="form-label">Based on Filter</label>
        <select className="form-select" value={filterId} onChange={e => setFilterId(e.target.value)}>
          <option value="">All Tickets (no filter)</option>
          {filters.map(f => (
            <option key={f.id} value={f.id}>{f.name} — {getFilteredTickets(f.id).length} tickets</option>
          ))}
        </select>
      </div>

      <div style={{ padding: '10px 12px', background: 'var(--blue-light)', borderRadius: 7, fontSize: 12, color: 'var(--blue)', marginBottom: 12 }}>
        💡 The dashboard will show live stats for tickets matching the selected filter.
      </div>

      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 8 }}>
        <button className="btn btn-ghost" onClick={closeModal}>Cancel</button>
        <button className="btn btn-primary" onClick={handleCreate}>Create Dashboard</button>
      </div>
    </div>
  )
}
