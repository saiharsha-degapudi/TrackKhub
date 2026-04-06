import React from 'react'
import { useApp } from '../../context/AppContext'
import ProgressBar from '../common/ProgressBar'
import Avatar from '../common/Avatar'
import { getStatusClass } from '../common/Badge'

const STATUSES = ['To Do', 'In Progress', 'In Review', 'Done', 'Blocked']

function statusBadgeClass(s) {
  const m = { 'To Do': 's-todo', 'In Progress': 's-inprogress', 'In Review': 's-review', Done: 's-done', Blocked: 's-blocked' }
  return m[s] || 's-todo'
}

export default function Projects() {
  const { projects, tickets, openProject, openModal } = useApp()

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="page-title">Projects</div>
          <div className="page-sub">{projects.length} projects</div>
        </div>
        <button className="btn btn-primary" onClick={() => openModal('createProject')}>+ New Project</button>
      </div>
      <div className="grid-3">
        {projects.map(p => {
          const tks = tickets.filter(t => t.project === p.id)
          const done = tks.filter(t => t.status === 'Done').length
          const pct = tks.length ? Math.round(done / tks.length * 100) : 0
          return (
            <div
              key={p.id}
              className="card"
              style={{ cursor: 'pointer', borderLeft: `4px solid ${p.color}` }}
              onClick={() => openProject(p.id)}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 700 }}>{p.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--blue)', fontWeight: 600, marginTop: 2 }}>{p.key}</div>
                </div>
                <span className={`badge ${p.status === 'Active' ? 'badge-green' : 'badge-orange'}`}>{p.status}</span>
              </div>
              <div style={{ fontSize: 12, color: 'var(--gray-500)', marginBottom: 12 }}>{p.description}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <Avatar name={p.lead} size={24} />
                <span style={{ fontSize: 12, color: 'var(--gray-500)' }}>{p.lead}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--gray-500)', marginBottom: 4 }}>
                <span>{tks.length} tickets</span>
                <span>{pct}% done</span>
              </div>
              <ProgressBar pct={pct} />
              <div style={{ marginTop: 10, display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                {STATUSES.map(s => {
                  const c = tks.filter(t => t.status === s).length
                  return c ? (
                    <span key={s} className={`badge ${statusBadgeClass(s)}`} style={{ fontSize: 10 }}>
                      {s}: {c}
                    </span>
                  ) : null
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
