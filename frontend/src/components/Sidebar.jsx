import React from 'react'
import { useApp } from '../context/AppContext'

export default function Sidebar() {
  const {
    page, projects, activeProject, recentProjects, projectsOpen,
    projectSearch, nav, openProject, openModal,
    setProjectsOpen, setProjectSearch
  } = useApp()

  const q = (projectSearch || '').toLowerCase()
  let shownProjects
  if (q) {
    shownProjects = projects.filter(p =>
      p.name.toLowerCase().includes(q) || p.key.toLowerCase().includes(q)
    )
  } else {
    const recIds = recentProjects.length
      ? recentProjects
      : projects.slice(0, 3).map(p => p.id)
    shownProjects = recIds.map(id => projects.find(p => p.id === id)).filter(Boolean)
  }

  return (
    <div className="sidebar">
      <div className="sidebar-section">
        <div className="sidebar-label">Navigation</div>
        <div
          className={`sidebar-item ${page === 'projects' ? 'active' : ''}`}
          onClick={() => nav('projects')}
        >🏠 Home</div>
        <div
          className={`sidebar-item ${page === 'dashboards' ? 'active' : ''}`}
          onClick={() => nav('dashboards')}
        >📊 Dashboards</div>
        <div
          className={`sidebar-item ${page === 'alltickets' ? 'active' : ''}`}
          onClick={() => nav('alltickets')}
        >🎫 All Tickets</div>
        <div
          className={`sidebar-item ${page === 'filters' ? 'active' : ''}`}
          onClick={() => nav('filters')}
        >🔍 Filters</div>
        <div
          className={`sidebar-item ${page === 'roadmaps' ? 'active' : ''}`}
          onClick={() => nav('roadmaps')}
        >🗺 Roadmaps</div>
        <div
          className={`sidebar-item ${page === 'webconnectors' ? 'active' : ''}`}
          onClick={() => nav('webconnectors')}
        >🔗 Connectors</div>
      </div>

      <div className="sidebar-section">
        <div
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '10px 8px 4px', cursor: 'pointer', userSelect: 'none'
          }}
          onClick={() => setProjectsOpen(o => !o)}
        >
          <div className="sidebar-label" style={{ padding: 0, margin: 0 }}>Projects</div>
          <span style={{ fontSize: 11, color: 'var(--gray-400)' }}>{projectsOpen ? '▾' : '▸'}</span>
        </div>

        {projectsOpen && (
          <>
            <div style={{ padding: '0 6px 6px' }}>
              <input
                className="form-input"
                placeholder="🔍 Search projects..."
                value={projectSearch || ''}
                onChange={e => setProjectSearch(e.target.value)}
                style={{ fontSize: 12, padding: '5px 9px', width: '100%' }}
              />
            </div>
            {shownProjects.map(p => (
              <div
                key={p.id}
                className={`sidebar-item ${activeProject === p.id ? 'active' : ''}`}
                onClick={() => openProject(p.id)}
              >
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: p.color, flexShrink: 0 }} />
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {p.name}
                </span>
              </div>
            ))}
            {!q && (
              <div style={{ fontSize: 10, color: 'var(--gray-400)', padding: '2px 10px 6px', display: 'flex', justifyContent: 'space-between' }}>
                <span>Recent</span>
                <span style={{ color: 'var(--blue)', cursor: 'pointer' }} onClick={() => nav('projects')}>View all →</span>
              </div>
            )}
            <div
              className="sidebar-item"
              onClick={() => openModal('createProject')}
              style={{ color: 'var(--blue)' }}
            >
              + New Project
            </div>
          </>
        )}
      </div>
    </div>
  )
}
