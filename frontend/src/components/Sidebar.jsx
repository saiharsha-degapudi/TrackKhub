import React, { useMemo } from 'react'
import { useApp } from '../context/AppContext'

const NAV_ICONS = {
  home:       '🏠',
  dashboards: '📊',
  alltickets: '🎫',
  filters:    '🔍',
  roadmaps:   '🗺',
  hithere:    '💬',
  settings:   '⚙',
}

export default function Sidebar() {
  const {
    page, projects, tickets, sprints,
    activeProject, recentProjects, projectsOpen,
    projectSearch, nav, openProject, openModal,
    setProjectsOpen, setProjectSearch,
    projectTab, setProjectTab,
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

  const activeProj = activeProject ? projects.find(p => p.id === activeProject) : null

  const goTab = (tab) => {
    setProjectTab(tab)
    if (page !== 'projectdetail') nav('projectdetail')
  }

  // Active sprints across all projects the user can see
  const activeSprints = useMemo(() => {
    if (!sprints) return []
    return sprints
      .filter(s => s.status === 'active')
      .map(s => {
        const proj = projects.find(p => p.id === s.project)
        const spTickets = tickets ? tickets.filter(t => t.sprint === s.name && t.project === s.project) : []
        const done = spTickets.filter(t => t.status === 'Done').length
        const pct = spTickets.length ? Math.round(done / spTickets.length * 100) : 0
        const daysLeft = s.endDate
          ? Math.max(0, Math.ceil((new Date(s.endDate) - new Date()) / 86400000))
          : null
        return { ...s, proj, spTickets, done, pct, daysLeft }
      })
      .filter(s => s.proj)
  }, [sprints, projects, tickets])

  const NavItem = ({ pageKey, label }) => (
    <div
      className={`sidebar-item ${page === pageKey ? 'active' : ''}`}
      onClick={() => nav(pageKey)}
    >
      <span style={{ fontSize: 14, flexShrink: 0 }}>{NAV_ICONS[pageKey]}</span>
      <span>{label}</span>
    </div>
  )

  return (
    <div className="sidebar">
      {/* Main Navigation */}
      <div className="sidebar-section">
        <div className="sidebar-label">Navigation</div>
        <NavItem pageKey="home"       label="Home" />
        <NavItem pageKey="dashboards" label="Dashboards" />
        <NavItem pageKey="alltickets" label="All Tickets" />
        <NavItem pageKey="filters"    label="Filters" />
        <NavItem pageKey="roadmaps"   label="Roadmaps" />
        <NavItem pageKey="hithere"    label="Hi There" />
      </div>

      {/* Projects section */}
      <div className="sidebar-section">
        <div
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '10px 8px 4px', cursor: 'pointer', userSelect: 'none',
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
                placeholder="Search projects..."
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
                <span style={{
                  width: 8, height: 8, borderRadius: '50%',
                  background: p.color, flexShrink: 0,
                }} />
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {p.name}
                </span>
              </div>
            ))}
            {!q && (
              <div style={{
                fontSize: 10, color: 'var(--gray-400)', padding: '2px 10px 6px',
                display: 'flex', justifyContent: 'space-between',
              }}>
                <span>Recent</span>
                <span
                  style={{ color: 'var(--blue)', cursor: 'pointer' }}
                  onClick={() => nav('projects')}
                >View all →</span>
              </div>
            )}
            <div
              className="sidebar-item"
              onClick={() => openModal('createProject')}
              style={{ color: 'var(--blue)' }}
            >
              <span style={{ fontSize: 14 }}>＋</span>
              <span>New Project</span>
            </div>
          </>
        )}
      </div>

      {/* Active Sprints section */}
      {activeSprints.length > 0 && (
        <div className="sidebar-section">
          <div className="sidebar-label">Active Sprints</div>
          {activeSprints.map(s => (
            <div
              key={s.id}
              style={{
                padding: '8px 10px', borderRadius: 7, cursor: 'pointer',
                margin: '1px 0', transition: 'background .15s',
              }}
              onClick={() => { openProject(s.project); setProjectTab('board') }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--blue-light)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                <span style={{
                  width: 6, height: 6, borderRadius: '50%',
                  background: s.proj?.color || 'var(--blue)', flexShrink: 0,
                }} />
                  <div style={{ flex: 1, overflow: 'hidden' }}>
                  <div style={{
                    fontSize: 11, fontWeight: 700, color: 'var(--gray-700)',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {s.proj?.name || s.name}
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--gray-400)', marginTop: 1 }}>
                    {s.name}
                  </div>
                </div>
                <span style={{ fontSize: 10, color: 'var(--gray-400)', flexShrink: 0 }}>
                  {s.daysLeft !== null ? `${s.daysLeft}d` : ''}
                </span>
              </div>
              <div style={{ height: 3, background: 'var(--gray-200)', borderRadius: 2, overflow: 'hidden' }}>
                <div style={{
                  height: '100%', width: `${s.pct}%`,
                  background: s.pct === 100 ? '#10b981' : 'var(--blue)',
                  borderRadius: 2, transition: 'width .3s',
                }} />
              </div>
              <div style={{ fontSize: 10, color: 'var(--gray-400)', marginTop: 2 }}>
                {s.done}/{s.spTickets.length} done · {s.pct}%
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Current project sub-nav */}
      {activeProj && (
        <div className="sidebar-section">
          <div className="sidebar-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{
              width: 8, height: 8, borderRadius: '50%',
              background: activeProj.color, flexShrink: 0, display: 'inline-block',
            }} />
            <span style={{
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              maxWidth: 130,
            }}>
              {activeProj.name}
            </span>
          </div>

          <div
            className={`sidebar-item ${page === 'projectdetail' && projectTab === 'settings' ? 'active' : ''}`}
            onClick={() => goTab('settings')}
          >
            <span style={{ fontSize: 14 }}>⚙</span>
            <span>Project Settings</span>
          </div>
        </div>
      )}

      {/* Subtle footer */}
      <div style={{
        marginTop: 'auto', padding: '12px 14px',
        fontSize: 10, color: 'var(--gray-300)', userSelect: 'none',
      }}>
        Hub v1.0
      </div>
    </div>
  )
}
