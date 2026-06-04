import React, { useMemo } from 'react'
import { useApp } from '../context/AppContext'
import Avatar from './common/Avatar'

export default function Sidebar() {
  const {
    page, projects,
    activeProject, recentProjects, projectsOpen,
    projectSearch, nav, openProject, openModal,
    setProjectsOpen, setProjectSearch,
    user,
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
      : projects.slice(0, 4).map(p => p.id)
    shownProjects = recIds.map(id => projects.find(p => p.id === id)).filter(Boolean)
  }

  const NavItem = ({ pageKey, label, icon }) => (
    <div
      className={`sidebar-item ${page === pageKey ? 'active' : ''}`}
      onClick={() => nav(pageKey)}
    >
      <span className="sidebar-icon">{icon}</span>
      <span>{label}</span>
    </div>
  )

  return (
    <div className="sidebar">
      {/* Logo area */}
      <div style={{
        height: 52, display: 'flex', alignItems: 'center',
        padding: '0 16px', gap: 10, flexShrink: 0,
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        marginBottom: 4,
      }}>
        <div style={{
          width: 28, height: 28,
          background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
          borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontSize: 14, fontWeight: 900,
          boxShadow: '0 2px 8px rgba(37,99,235,0.40)', flexShrink: 0,
        }}>H</div>
        <span style={{ fontSize: 16, fontWeight: 800, color: '#f1f5f9', letterSpacing: '-.4px' }}>Hub</span>
      </div>

      {/* WORKSPACE */}
      <div className="sidebar-section">
        <div className="sidebar-label">Workspace</div>
        <NavItem pageKey="home"       label="Home"       icon="🏠" />
        <NavItem pageKey="dashboards" label="Dashboards"  icon="📊" />
        <NavItem pageKey="myissues"   label="My Issues"   icon="👁️" />
      </div>

      {/* PROJECTS */}
      <div className="sidebar-section">
        <div
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '10px 8px 4px', cursor: 'pointer', userSelect: 'none',
          }}
          onClick={() => setProjectsOpen(o => !o)}
        >
          <div className="sidebar-label" style={{ padding: 0, margin: 0 }}>Projects</div>
          <span style={{ fontSize: 11, color: '#475569' }}>{projectsOpen ? '▾' : '▸'}</span>
        </div>

        {projectsOpen && (
          <>
            <div style={{ padding: '0 4px 6px' }}>
              <input
                placeholder="Search projects…"
                value={projectSearch || ''}
                onChange={e => setProjectSearch(e.target.value)}
                style={{
                  width: '100%', padding: '6px 10px',
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.10)',
                  borderRadius: 7, fontSize: 12,
                  color: '#cbd5e1', outline: 'none',
                  fontFamily: 'inherit',
                }}
              />
            </div>
            {shownProjects.map(p => (
              <div
                key={p.id}
                className={`sidebar-item ${activeProject === p.id ? 'active' : ''}`}
                onClick={() => openProject(p.id)}
              >
                <span style={{
                  width: 8, height: 8, borderRadius: '50%',
                  background: p.color || '#2563eb', flexShrink: 0,
                  display: 'inline-block',
                }} />
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {p.name}
                </span>
              </div>
            ))}
            {!q && (
              <div style={{
                fontSize: 10, color: '#475569', padding: '2px 10px 4px',
                display: 'flex', justifyContent: 'space-between',
              }}>
                <span>Recent</span>
                <span
                  style={{ color: '#60a5fa', cursor: 'pointer' }}
                  onClick={() => nav('projects')}
                >View all →</span>
              </div>
            )}
            <div
              className="sidebar-item"
              onClick={() => openModal('createProject')}
              style={{ color: '#60a5fa' }}
            >
              <span className="sidebar-icon" style={{ fontSize: 16 }}>＋</span>
              <span>New Project</span>
            </div>
          </>
        )}
      </div>

      {/* TEAM */}
      <div className="sidebar-section">
        <div className="sidebar-label">Team</div>
        <NavItem pageKey="members"  label="Members"   icon="👥" />
        <NavItem pageKey="hithere"  label="Hi There"  icon="💬" />
      </div>

      {/* EXPLORE */}
      <div className="sidebar-section">
        <div className="sidebar-label">Explore</div>
        <NavItem pageKey="alltickets" label="All Issues" icon="🎫" />
        <NavItem pageKey="filters"    label="Filters"    icon="🔍" />
        <NavItem pageKey="roadmaps"   label="Roadmaps"   icon="🗺️" />
      </div>

      {/* SETTINGS */}
      <div className="sidebar-section">
        <div className="sidebar-label">Settings</div>
        <NavItem pageKey="settings" label="Settings" icon="⚙️" />
      </div>

      {/* Bottom: user + version */}
      <div style={{ marginTop: 'auto', padding: '12px 14px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <Avatar name={user?.name} size={28} />
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <div style={{
              fontSize: 12, fontWeight: 600, color: '#cbd5e1',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {user?.name || 'User'}
            </div>
            <div style={{ fontSize: 10, color: '#475569' }}>v1.0</div>
          </div>
        </div>
      </div>
    </div>
  )
}
