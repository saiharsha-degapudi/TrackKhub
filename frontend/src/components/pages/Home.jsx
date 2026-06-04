import React, { useMemo } from 'react'
import { useApp } from '../../context/AppContext'
import Avatar from '../common/Avatar'

const STATUS_COLORS = {
  'To Do':       '#64748b',
  'In Progress': '#3b82f6',
  'In Review':   '#8b5cf6',
  'Done':        '#10b981',
  'Blocked':     '#ef4444',
}

const PRIORITY_COLORS = {
  Critical: '#ef4444',
  High:     '#f97316',
  Medium:   '#f59e0b',
  Low:      '#10b981',
}

const TYPE_ICONS = {
  Feature: '⭐', Initiative: '🎯', Epic: '🔥', Story: '📖', Task: '✅', 'Sub-task': '🔹',
}

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

function formatDate(d) {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function todayStr() {
  return new Date().toISOString().slice(0, 10)
}

/* ─── Active Sprints card ─── */
function SprintOverview({ sprints, tickets, projects, openProject, setProjectTab }) {
  const activeSprints = useMemo(() => {
    return sprints
      .filter(s => s.status === 'active')
      .map(s => {
        const proj = projects.find(p => p.id === s.project)
        const spTix = tickets.filter(t => t.sprint === s.name && t.project === s.project)
        const done = spTix.filter(t => t.status === 'Done').length
        const blocked = spTix.filter(t => t.status === 'Blocked').length
        const pct = spTix.length ? Math.round(done / spTix.length * 100) : 0
        const daysLeft = s.endDate
          ? Math.max(0, Math.ceil((new Date(s.endDate) - new Date()) / 86400000))
          : null
        return { ...s, proj, spTix, done, blocked, pct, daysLeft }
      })
      .filter(s => s.proj)
  }, [sprints, tickets, projects])

  if (activeSprints.length === 0) return null

  return (
    <div style={{
      background: '#fff',
      borderRadius: 14,
      border: '1px solid rgba(37,99,235,0.10)',
      boxShadow: '0 4px 24px rgba(59,130,246,0.10)',
      padding: '20px 24px',
      borderLeft: '4px solid #2563eb',
    }}>
      <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 16, color: '#1e293b', display: 'flex', alignItems: 'center', gap: 8 }}>
        <span>⚡ Active Sprints</span>
        <span style={{ fontSize: 11, background: '#eff6ff', color: '#2563eb', borderRadius: 10, padding: '2px 9px', fontWeight: 700 }}>
          {activeSprints.length}
        </span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {activeSprints.map(s => (
          <div
            key={s.id}
            style={{
              padding: '12px 14px', borderRadius: 10,
              border: '1.5px solid #e8edf5',
              borderLeft: `3px solid ${s.proj.color || '#2563eb'}`,
              background: '#f8faff', cursor: 'pointer',
              transition: 'border-color .15s, background .15s, box-shadow .15s',
            }}
            onClick={() => { openProject(s.project); setProjectTab('board') }}
            onMouseEnter={e => {
              e.currentTarget.style.background = '#eef2ff'
              e.currentTarget.style.boxShadow = `0 2px 12px ${s.proj.color || '#2563eb'}22`
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = '#f8faff'
              e.currentTarget.style.boxShadow = 'none'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: s.proj.color || '#2563eb', flexShrink: 0 }} />
                <span style={{ fontWeight: 700, fontSize: 13, color: '#1e293b' }}>{s.name}</span>
                <span style={{ fontSize: 11, color: '#94a3b8' }}>· {s.proj.name}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {s.blocked > 0 && (
                  <span style={{ fontSize: 11, background: '#fee2e2', color: '#991b1b', borderRadius: 6, padding: '2px 7px', fontWeight: 700 }}>
                    {s.blocked} blocked
                  </span>
                )}
                {s.daysLeft !== null && (
                  <span style={{
                    fontSize: 11, fontWeight: 700, borderRadius: 6, padding: '2px 7px',
                    background: s.daysLeft <= 2 ? '#fee2e2' : s.daysLeft <= 5 ? '#fff7ed' : '#f0fdf4',
                    color: s.daysLeft <= 2 ? '#991b1b' : s.daysLeft <= 5 ? '#92400e' : '#166534',
                  }}>
                    {s.daysLeft === 0 ? 'Due today' : `${s.daysLeft}d left`}
                  </span>
                )}
                <span style={{ fontSize: 12, fontWeight: 800, color: '#2563eb' }}>{s.pct}%</span>
              </div>
            </div>
            <div style={{ height: 6, background: '#e2e8f0', borderRadius: 3, overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                width: `${s.pct}%`,
                background: s.pct === 100 ? '#10b981' : 'linear-gradient(90deg, #2563eb, #7c3aed)',
                borderRadius: 3,
                transition: 'width .4s ease',
              }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#94a3b8', marginTop: 5 }}>
              <span>{s.done} / {s.spTix.length} done</span>
              {s.spTix.filter(t => t.status === 'In Progress').length > 0 && (
                <span>{s.spTix.filter(t => t.status === 'In Progress').length} in progress</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function Home() {
  const {
    user, tickets, projects, sprints,
    openTicketView, openProject,
    nav, setStatusFilter, setProjectFilter, setProjectTab, openModal,
  } = useApp()
  const firstName = user?.name?.split(' ')[0] || 'there'

  const myTickets = useMemo(
    () => tickets.filter(t => t.assignee === user?.name),
    [tickets, user]
  )

  const openCount     = myTickets.filter(t => t.status !== 'Done').length
  const inReviewCount = myTickets.filter(t => t.status === 'In Review').length
  const blockedCount  = myTickets.filter(t => t.status === 'Blocked').length
  const today         = todayStr()
  const dueTodayCount = myTickets.filter(t => t.dueDate === today).length

  const myProjects = useMemo(() => {
    const pids = [...new Set(myTickets.map(t => t.project))]
    return pids.map(id => projects.find(p => p.id === id)).filter(Boolean)
  }, [myTickets, projects])

  const priorityOrder = { Critical: 0, High: 1, Medium: 2, Low: 3 }
  const recentTickets = useMemo(
    () => myTickets
      .filter(t => t.status !== 'Done')
      .sort((a, b) => (priorityOrder[a.priority] ?? 4) - (priorityOrder[b.priority] ?? 4))
      .slice(0, 6),
    [myTickets]
  )

  const goToTickets = (statusVal) => {
    setStatusFilter(statusVal || 'All')
    nav('alltickets')
  }

  const STAT_CARDS = [
    { label: 'Open Tickets', value: openCount, color: '#2563eb', emoji: '📋', onClick: () => goToTickets('All') },
    { label: 'In Review',    value: inReviewCount, color: '#8b5cf6', emoji: '🔍', onClick: () => goToTickets('In Review') },
    { label: 'Blocked',      value: blockedCount, color: '#ef4444', emoji: '🚫', onClick: () => goToTickets('Blocked') },
    { label: 'Due Today',    value: dueTodayCount, color: '#f59e0b', emoji: '⏰', onClick: () => goToTickets('All') },
  ]

  const QUICK_ACTIONS = [
    { label: 'Create Ticket', icon: '🎫', color: '#2563eb', bg: 'linear-gradient(135deg, #eff6ff, #dbeafe)', onClick: () => openModal && openModal('createTicket') },
    { label: 'Start Sprint',  icon: '🚀', color: '#16a34a', bg: 'linear-gradient(135deg, #f0fdf4, #dcfce7)', onClick: () => nav('projects') },
    { label: 'View Roadmap',  icon: '🗺️', color: '#7c3aed', bg: 'linear-gradient(135deg, #f5f3ff, #ede9fe)', onClick: () => nav('projects') },
    { label: 'Open Dashboard',icon: '📊', color: '#d97706', bg: 'linear-gradient(135deg, #fffbeb, #fef3c7)', onClick: () => nav('dashboards') },
  ]

  return (
    <div className="page" style={{ background: '#eef2ff', minHeight: '100%', paddingBottom: 40 }}>

      {/* ── Hero Greeting Banner ── */}
      <div style={{
        background: 'linear-gradient(135deg, #1e40af 0%, #4f46e5 60%, #7c3aed 100%)',
        borderRadius: 18,
        padding: '32px 36px',
        marginBottom: 24,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Decorative circle */}
        <div style={{
          position: 'absolute', top: -60, right: 200, width: 220, height: 220,
          borderRadius: '50%', background: 'rgba(255,255,255,0.06)', pointerEvents: 'none',
        }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: 28, fontWeight: 900, color: '#fff', letterSpacing: '-0.5px', lineHeight: 1.2 }}>
            {greeting()}, {firstName}! 👋
          </div>
          <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.78)', marginTop: 6 }}>
            Here's what's happening across your workspace today.
          </div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', marginTop: 4 }}>
            {formatDate(new Date())}
          </div>
        </div>
        {/* Project emoji icons */}
        <div style={{ display: 'flex', gap: 10, position: 'relative', zIndex: 1 }}>
          {myProjects.slice(0, 4).map(p => (
            <div
              key={p.id}
              title={p.name}
              style={{
                width: 44, height: 44, borderRadius: 12,
                background: 'rgba(255,255,255,0.18)',
                border: '1.5px solid rgba(255,255,255,0.3)',
                backdropFilter: 'blur(8px)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 20, cursor: 'pointer',
                transition: 'transform .15s, background .15s',
              }}
              onClick={() => openProject(p.id)}
              onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.12)'; e.currentTarget.style.background = 'rgba(255,255,255,0.28)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.background = 'rgba(255,255,255,0.18)' }}
            >
              {p.icon || '📁'}
            </div>
          ))}
        </div>
      </div>

      {/* ── 4 Stat Cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        {STAT_CARDS.map(({ label, value, color, emoji, onClick }) => (
          <div
            key={label}
            onClick={onClick}
            style={{
              background: '#fff',
              borderRadius: 14,
              border: '1px solid rgba(37,99,235,0.10)',
              borderLeft: `4px solid ${color}`,
              boxShadow: '0 4px 20px rgba(37,99,235,0.08)',
              padding: '18px 20px',
              cursor: 'pointer',
              position: 'relative',
              overflow: 'hidden',
              transition: 'transform .15s, box-shadow .15s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-3px)'
              e.currentTarget.style.boxShadow = `0 8px 28px ${color}22`
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 4px 20px rgba(37,99,235,0.08)'
            }}
          >
            {/* Ghost watermark emoji */}
            <div style={{ position: 'absolute', top: 10, right: 14, fontSize: 28, opacity: 0.10, userSelect: 'none' }}>{emoji}</div>
            <div style={{ fontSize: 36, fontWeight: 900, color, lineHeight: 1 }}>{value}</div>
            <div style={{ fontSize: 12, color: '#64748b', marginTop: 5, fontWeight: 500 }}>{label}</div>
            <div style={{ fontSize: 11, color, fontWeight: 700, marginTop: 6, opacity: 0.8 }}>View →</div>
          </div>
        ))}
      </div>

      {/* ── Two-column: Active Sprints + My Recent Tickets ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>

        {/* Active Sprints */}
        {sprints && (
          <SprintOverview
            sprints={sprints}
            tickets={tickets}
            projects={projects}
            openProject={openProject}
            setProjectTab={setProjectTab}
          />
        )}

        {/* My Recent Tickets */}
        <div style={{
          background: '#fff',
          borderRadius: 14,
          border: '1px solid rgba(37,99,235,0.10)',
          boxShadow: '0 4px 24px rgba(59,130,246,0.10)',
          padding: '20px 24px',
          borderLeft: '4px solid #8b5cf6',
        }}>
          <div style={{
            fontWeight: 800, fontSize: 14, marginBottom: 16, color: '#1e293b',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <span>🎫 My Recent Tickets</span>
            {openCount > 6 && (
              <span
                style={{ fontSize: 11, color: '#2563eb', cursor: 'pointer', fontWeight: 700 }}
                onClick={() => goToTickets('All')}
              >View all {openCount} →</span>
            )}
          </div>
          {recentTickets.length === 0 ? (
            <div style={{ color: '#94a3b8', fontSize: 13, padding: '20px 0', textAlign: 'center' }}>
              All clear! No open tickets.
            </div>
          ) : (
            recentTickets.map(t => {
              const proj = projects.find(p => p.id === t.project)
              const sColor = STATUS_COLORS[t.status] || '#64748b'
              return (
                <div
                  key={t.id}
                  onClick={() => openTicketView(t.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '9px 8px', borderRadius: 8,
                    borderBottom: '1px solid #f1f5f9',
                    cursor: 'pointer', transition: 'background .12s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#f8faff'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  {/* Type icon badge */}
                  <span style={{
                    fontSize: 13, flexShrink: 0,
                    width: 24, height: 24, borderRadius: 6,
                    background: `${PRIORITY_COLORS[t.priority] || '#64748b'}18`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {TYPE_ICONS[t.type] || '🔹'}
                  </span>
                  {/* Ticket ID */}
                  <span
                    style={{ fontSize: 11, fontWeight: 800, color: '#2563eb', fontFamily: 'monospace', flexShrink: 0, minWidth: 56 }}
                    onClick={e => { e.stopPropagation(); proj && openProject(proj.id) }}
                  >{t.id}</span>
                  {/* Title */}
                  <span style={{ flex: 1, fontSize: 12, fontWeight: 500, color: '#1e293b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {t.title}
                  </span>
                  {/* Status badge */}
                  <span style={{
                    fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 6, flexShrink: 0,
                    background: `${sColor}18`, color: sColor,
                  }}>{t.status}</span>
                  <span style={{ fontSize: 11, color: '#94a3b8', flexShrink: 0 }}>→</span>
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* ── Projects Grid (3 columns) ── */}
      {projects.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: '#1e293b', marginBottom: 14, letterSpacing: '-0.3px' }}>
            🗂 All Projects
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            {projects.map(p => {
              const pTix = tickets.filter(t => t.project === p.id)
              const pDone = pTix.filter(t => t.status === 'Done').length
              const pct = pTix.length ? Math.round(pDone / pTix.length * 100) : 0
              return (
                <div
                  key={p.id}
                  style={{
                    background: '#fff',
                    borderRadius: 14,
                    border: '1px solid rgba(37,99,235,0.10)',
                    boxShadow: '0 4px 20px rgba(37,99,235,0.07)',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    transition: 'transform .15s, box-shadow .15s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = `0 8px 28px ${p.color}25` }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(37,99,235,0.07)' }}
                  onClick={() => openProject(p.id)}
                >
                  {/* Colored gradient top strip */}
                  <div style={{ height: 5, background: `linear-gradient(90deg, ${p.color}, ${p.color}88)` }} />
                  <div style={{ padding: '16px 18px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                      <span style={{ fontSize: 22 }}>{p.icon || '📁'}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 800, fontSize: 14, color: '#1e293b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {p.name}
                        </div>
                        <span style={{ fontSize: 10, fontWeight: 700, color: p.color, background: `${p.color}18`, padding: '1px 7px', borderRadius: 5 }}>
                          {p.key}
                        </span>
                      </div>
                    </div>
                    {p.lead && (
                      <div style={{ fontSize: 11, color: '#64748b', marginBottom: 10 }}>
                        Lead: <span style={{ fontWeight: 600, color: '#334155' }}>{p.lead}</span>
                      </div>
                    )}
                    {/* Ticket count progress bar */}
                    <div style={{ marginBottom: 12 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#94a3b8', marginBottom: 4 }}>
                        <span>{pDone} / {pTix.length} done</span>
                        <span style={{ fontWeight: 700, color: p.color }}>{pct}%</span>
                      </div>
                      <div style={{ height: 5, background: '#e8edf5', borderRadius: 3, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${pct}%`, background: `linear-gradient(90deg, ${p.color}, #7c3aed)`, borderRadius: 3, transition: 'width .4s' }} />
                      </div>
                    </div>
                    <button
                      style={{
                        width: '100%', padding: '7px 0', borderRadius: 8,
                        background: `${p.color}12`, border: `1.5px solid ${p.color}30`,
                        color: p.color, fontSize: 12, fontWeight: 700, cursor: 'pointer',
                      }}
                      onClick={e => { e.stopPropagation(); openProject(p.id) }}
                    >
                      Open →
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── Quick Actions ── */}
      <div style={{ marginBottom: 8 }}>
        <div style={{ fontSize: 16, fontWeight: 800, color: '#1e293b', marginBottom: 14, letterSpacing: '-0.3px' }}>
          ⚡ Quick Actions
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
          {QUICK_ACTIONS.map(({ label, icon, color, bg, onClick }) => (
            <div
              key={label}
              onClick={onClick}
              style={{
                background: bg,
                borderRadius: 12,
                border: `1.5px solid ${color}22`,
                padding: '16px 18px',
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 12,
                transition: 'transform .15s, box-shadow .15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 6px 20px ${color}22` }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none' }}
            >
              <span style={{ fontSize: 22 }}>{icon}</span>
              <span style={{ fontSize: 13, fontWeight: 700, color }}>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
