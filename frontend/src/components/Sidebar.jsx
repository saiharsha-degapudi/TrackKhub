import React, { useState } from 'react'
import { useApp } from '../context/AppContext'
import Avatar from './common/Avatar'

/* ── Small SVG icons ── */
const Icon = ({ d, size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
)

const ICONS = {
  home:       'M2 6.5L8 2l6 4.5V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V6.5z',
  dashboard:  'M2 2h5v5H2V2zM9 2h5v5H9V2zM2 9h5v5H2V9zM9 9h5v5H9V9z',
  issues:     'M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1zM8 5v4M8 11v.5',
  myissues:   'M1 4h14M1 8h9M1 12h6',
  filters:    'M1 3h14M4 8h8M6 13h4',
  roadmaps:   'M1 8h14M1 4l3 3M14 12l-3-3',
  members:    'M5 7a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM1 14s-1-1-.5-3C1 9 3 8 5 8s4 1 4.5 3c.5 2-.5 3-.5 3H1zM11 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM13.5 14H15s1-1 .5-3c-.3-1.2-1.2-2-2.5-2.2',
  messages:   'M14 2H2a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h3l3 2 3-2h3a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1z',
  settings:   'M8 10.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zM8 1v1.5M8 13.5V15M15 8h-1.5M2.5 8H1M12.7 3.3l-1.1 1.1M4.4 11.6l-1.1 1.1M12.7 12.7l-1.1-1.1M4.4 4.4L3.3 3.3',
  projects:   'M2 3a1 1 0 0 1 1-1h4l2 2h4a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3z',
  allissues:  'M4 4h8M4 8h8M4 12h5',
  reports:    'M2 2h12v12H2V2zM5 10l2-3 2 2 2-3',
  plus:       'M8 1v14M1 8h14',
}

export default function Sidebar() {
  const {
    page,
    projects,
    activeProject,
    recentProjects,
    projectsOpen,
    projectSearch,
    nav,
    openProject,
    openModal,
    setProjectsOpen,
    setProjectSearch,
    user,
  } = useApp()

  const [viewsOpen, setViewsOpen] = useState(true)
  const [teamOpen, setTeamOpen] = useState(true)

  const q = (projectSearch || '').toLowerCase()
  let shownProjects
  if (q) {
    shownProjects = projects.filter(p =>
      p.name.toLowerCase().includes(q) || p.key.toLowerCase().includes(q)
    )
  } else {
    const recIds = recentProjects.length
      ? recentProjects
      : projects.slice(0, 5).map(p => p.id)
    shownProjects = recIds.map(id => projects.find(p => p.id === id)).filter(Boolean)
  }

  return (
    <div className="sidebar">

      {/* ── My Work ── */}
      <div className="sidebar-section" style={{ paddingTop: 8 }}>
        <span className="sidebar-label">My Work</span>
        <NavItem page={page} pageKey="home"     label="Home"     iconD={ICONS.home}     nav={nav} />
        <NavItem page={page} pageKey="myissues" label="My Issues" iconD={ICONS.myissues} nav={nav} />
        <NavItem page={page} pageKey="dashboards" label="Dashboards" iconD={ICONS.dashboard} nav={nav} />
      </div>

      <div className="sidebar-divider" />

      {/* ── Projects ── */}
      <div className="sidebar-section">
        <SectionToggle
          label="Projects"
          open={projectsOpen}
          onToggle={() => setProjectsOpen(o => !o)}
          action={{ label: '+', onClick: () => openModal('createProject'), title: 'New project' }}
        />

        {projectsOpen && (
          <>
            {projects.length > 4 && (
              <div style={{ padding: '0 8px 4px' }}>
                <input
                  placeholder="Filter projects..."
                  value={projectSearch || ''}
                  onChange={e => setProjectSearch(e.target.value)}
                  style={{
                    width: '100%',
                    height: 26,
                    padding: '0 8px',
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 4,
                    fontSize: 12,
                    color: '#d1d5db',
                    outline: 'none',
                    fontFamily: 'inherit',
                    boxSizing: 'border-box',
                  }}
                  onFocus={e => e.target.style.borderColor = 'rgba(96,165,250,0.4)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
                />
              </div>
            )}

            {shownProjects.length === 0 && (
              <div style={{ fontSize: 12, color: '#6b7280', padding: '6px 12px' }}>No projects found</div>
            )}

            {shownProjects.map(p => (
              <div
                key={p.id}
                className={`sidebar-item ${activeProject === p.id ? 'active' : ''}`}
                onClick={() => openProject(p.id)}
                title={p.name}
              >
                <span style={{
                  width: 8,
                  height: 8,
                  borderRadius: 2,
                  background: p.color || '#2563eb',
                  flexShrink: 0,
                  display: 'inline-block',
                }} />
                <span className="sidebar-item-text">{p.name}</span>
                {p.key && (
                  <span style={{ fontSize: 10, color: '#4b5563', fontFamily: 'monospace', marginLeft: 'auto', flexShrink: 0 }}>
                    {p.key}
                  </span>
                )}
              </div>
            ))}

            {!q && projects.length > shownProjects.length && (
              <div
                onClick={() => nav('projects')}
                style={{
                  fontSize: 11,
                  color: '#60a5fa',
                  padding: '4px 12px 2px',
                  cursor: 'pointer',
                  opacity: 0.8,
                }}
              >
                View all {projects.length} projects
              </div>
            )}

            <div
              className="sidebar-item"
              onClick={() => openModal('createProject')}
              style={{ color: '#60a5fa', opacity: 0.8 }}
            >
              <span style={{ fontSize: 16, lineHeight: 1, marginTop: -1 }}>+</span>
              <span className="sidebar-item-text">New Project</span>
            </div>
          </>
        )}
      </div>

      <div className="sidebar-divider" />

      {/* ── Views ── */}
      <div className="sidebar-section">
        <SectionToggle label="Views" open={viewsOpen} onToggle={() => setViewsOpen(o => !o)} />
        {viewsOpen && (
          <>
            <NavItem page={page} pageKey="alltickets" label="All Issues"  iconD={ICONS.allissues} nav={nav} />
            <NavItem page={page} pageKey="filters"    label="Filters"     iconD={ICONS.filters}   nav={nav} />
            <NavItem page={page} pageKey="roadmaps"   label="Roadmaps"    iconD={ICONS.roadmaps}  nav={nav} />
            <NavItem page={page} pageKey="reports"    label="Reports"     iconD={ICONS.reports}   nav={nav} />
          </>
        )}
      </div>

      <div className="sidebar-divider" />

      {/* ── Team ── */}
      <div className="sidebar-section">
        <SectionToggle label="Team" open={teamOpen} onToggle={() => setTeamOpen(o => !o)} />
        {teamOpen && (
          <>
            <NavItem page={page} pageKey="members"  label="Members"  iconD={ICONS.members}  nav={nav} />
            <NavItem page={page} pageKey="hithere"  label="Messages" iconD={ICONS.messages} nav={nav} />
          </>
        )}
      </div>

      <div className="sidebar-divider" />

      {/* ── Settings ── */}
      <div className="sidebar-section">
        <NavItem page={page} pageKey="settings" label="Settings" iconD={ICONS.settings} nav={nav} />
      </div>

      {/* ── Footer ── */}
      <div className="sidebar-footer">
        <div
          className="sidebar-item"
          onClick={() => nav('settings')}
          style={{ height: 34, gap: 9, marginBottom: 0 }}
        >
          <Avatar name={user?.name} size={20} />
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <div style={{
              fontSize: 12,
              fontWeight: 500,
              color: '#d1d5db',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}>
              {user?.name || 'User'}
            </div>
            {user?.role && (
              <div style={{ fontSize: 10, color: '#4b5563', textTransform: 'capitalize' }}>
                {user.role}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── NavItem component ── */
function NavItem({ page, pageKey, label, iconD, nav }) {
  const active = page === pageKey
  return (
    <div
      className={`sidebar-item${active ? ' active' : ''}`}
      onClick={() => nav(pageKey)}
      title={label}
    >
      <span style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 14,
        flexShrink: 0,
        opacity: active ? 1 : 0.6,
        color: active ? 'var(--sidebar-active-text)' : 'var(--sidebar-text)',
      }}>
        <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d={iconD} />
        </svg>
      </span>
      <span className="sidebar-item-text">{label}</span>
    </div>
  )
}

/* ── Section toggle header ── */
function SectionToggle({ label, open, onToggle, action }) {
  const [hovered, setHovered] = useState(false)
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px 12px 4px',
        cursor: 'pointer',
        userSelect: 'none',
      }}
      onClick={onToggle}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <span style={{
        fontSize: 10,
        fontWeight: 600,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        color: '#6b7280',
      }}>
        {label}
      </span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        {action && hovered && (
          <button
            onClick={e => { e.stopPropagation(); action.onClick(); }}
            title={action.title}
            style={{
              width: 16,
              height: 16,
              border: 'none',
              background: 'rgba(255,255,255,0.08)',
              borderRadius: 3,
              color: '#9ca3af',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 13,
              lineHeight: 1,
              padding: 0,
            }}
          >
            {action.label}
          </button>
        )}
        <svg
          width="10"
          height="10"
          viewBox="0 0 10 10"
          fill="none"
          stroke="#4b5563"
          strokeWidth="1.5"
          strokeLinecap="round"
          style={{ transition: 'transform 0.15s', transform: open ? 'rotate(0deg)' : 'rotate(-90deg)' }}
        >
          <path d="M2 3.5l3 3 3-3" />
        </svg>
      </div>
    </div>
  )
}
