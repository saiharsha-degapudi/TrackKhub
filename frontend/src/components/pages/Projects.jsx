import React from 'react'
import { useApp } from '../../context/AppContext'
import Avatar from '../common/Avatar'

export default function Projects() {
  const { projects, openProject, openModal } = useApp()

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="page-title">Projects</div>
          <div className="page-sub">{projects.length} projects</div>
        </div>
        <button className="btn btn-primary" onClick={() => openModal('createProject')}>+ New Project</button>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <table>
          <thead>
            <tr>
              <th style={{ width: '45%' }}>Project Name</th>
              <th style={{ width: '20%' }}>Key</th>
              <th style={{ width: '35%' }}>Lead</th>
            </tr>
          </thead>
          <tbody>
            {projects.map(p => (
              <tr
                key={p.id}
                style={{ cursor: 'pointer' }}
                onClick={() => openProject(p.id)}
              >
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{
                      width: 10, height: 10, borderRadius: '50%',
                      background: p.color, flexShrink: 0, display: 'inline-block'
                    }} />
                    <span style={{ fontWeight: 600, fontSize: 13 }}>{p.name}</span>
                  </div>
                </td>
                <td>
                  <span style={{
                    fontFamily: 'monospace', fontSize: 12,
                    color: 'var(--blue)', fontWeight: 700,
                    background: 'var(--gray-50)', padding: '2px 8px',
                    borderRadius: 4, border: '1px solid var(--gray-200)'
                  }}>
                    {p.key}
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Avatar name={p.lead} size={26} />
                    <span style={{ fontSize: 13 }}>{p.lead}</span>
                  </div>
                </td>
              </tr>
            ))}
            {!projects.length && (
              <tr>
                <td colSpan={3}>
                  <div className="empty-state">
                    <div style={{ fontSize: 28, marginBottom: 8 }}>📁</div>
                    <div>No projects yet. Click + New Project to get started.</div>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
