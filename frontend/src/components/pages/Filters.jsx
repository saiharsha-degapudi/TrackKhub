import React from 'react'
import { useApp } from '../../context/AppContext'
import Avatar from '../common/Avatar'
import { getStatusClass } from '../common/Badge'

export default function Filters() {
  const { filters, openModal, doDeleteFilter, getFilteredTickets, openTicketView } = useApp()

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="page-title">Filters</div>
          <div className="page-sub">Saved filters — shared filters appear on Dashboards</div>
        </div>
        <button className="btn btn-primary" onClick={() => openModal('createFilter')}>+ New Filter</button>
      </div>
      <div className="grid-2">
        {filters.map(f => {
          const res = getFilteredTickets(f.id)
          return (
            <div key={f.id} className="card">
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 }}>
                <div style={{ fontSize: 15, fontWeight: 700 }}>{f.name}</div>
                <div style={{ display: 'flex', gap: 4 }}>
                  {f.shared
                    ? <span className="badge badge-blue">Shared</span>
                    : <span className="badge badge-gray">Private</span>
                  }
                  <button className="btn btn-ghost btn-sm" onClick={() => {
                    if (window.confirm('Delete?')) doDeleteFilter(f.id)
                  }}>🗑</button>
                </div>
              </div>
              <div style={{ fontSize: 12, color: 'var(--gray-500)', marginBottom: 8 }}>By {f.owner} · {f.created}</div>
              <div style={{ marginBottom: 10, display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                {Object.entries(f.conditions).map(([k, v]) => (
                  <span key={k} className="filter-chip active">
                    {k}: {Array.isArray(v) ? v.join(', ') : v}
                  </span>
                ))}
              </div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--blue)', marginBottom: 10 }}>
                {res.length} matching tickets
              </div>
              <div className="card" style={{ padding: 0, margin: 0 }}>
                <table>
                  <thead><tr><th>ID</th><th>Title</th><th>Status</th><th>Assignee</th></tr></thead>
                  <tbody>
                    {res.slice(0, 3).map(t => (
                      <tr key={t.id} onClick={() => openTicketView(t.id)} style={{ cursor: 'pointer' }}>
                        <td style={{ fontWeight: 600, color: 'var(--blue)' }}>{t.id}</td>
                        <td style={{ maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.title}</td>
                        <td><span className={`badge ${getStatusClass(t.status)}`} style={{ fontSize: 10 }}>{t.status}</span></td>
                        <td><Avatar name={t.assignee} size={22} /></td>
                      </tr>
                    ))}
                    {res.length > 3 && (
                      <tr>
                        <td colSpan={4} style={{ textAlign: 'center', fontSize: 11, color: 'var(--gray-400)', padding: 7 }}>
                          +{res.length - 3} more
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
