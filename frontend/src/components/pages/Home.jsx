import React, { useMemo } from 'react'
import { useApp } from '../../context/AppContext'
import Avatar from '../common/Avatar'

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
    <div className="card" style={{ padding: 20, marginBottom: 20 }}>
      <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 14, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 8 }}>
        <span>⚡ Active Sprints</span>
        <span style={{ fontSize: 11, background: 'var(--blue-light)', color: 'var(--blue)', borderRadius: 10, padding: '1px 8px', fontWeight: 700 }}>
          {activeSprints.length}
        </span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {activeSprints.map(s => (
          <div
            key={s.id}
            style={{
              padding: '12px 14px', borderRadius: 8,
              border: '1.5px solid var(--gray-200)',
              background: 'var(--gray-50)', cursor: 'pointer',
              transition: 'border-color .15s, background .15s',
            }}
            onClick={() => { openProject(s.project); setProjectTab('board') }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = s.proj.color || 'var(--blue)'
              e.currentTarget.style.background = '#f8faff'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'var(--gray-200)'
              e.currentTarget.style.background = 'var(--gray-50)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: s.proj.color || 'var(--blue)', flexShrink: 0 }} />
                <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--text)' }}>{s.name}</span>
                <span style={{ fontSize: 11, color: 'var(--gray-500)' }}>· {s.proj.name}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
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
                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--blue)' }}>{s.pct}%</span>
              </div>
            </div>
            <div style={{ height: 6, background: 'var(--gray-200)', borderRadius: 3, overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                width: `${s.pct}%`,
                background: s.pct === 100 ? '#10b981' : s.pct >= 60 ? 'var(--blue)' : '#f59e0b',
                borderRadius: 3,
                transition: 'width .4s ease',
              }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--gray-400)', marginTop: 4 }}>
              <span>{s.done} of {s.spTix.length} tickets done</span>
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

export default function Home() {
  const {
    user, tickets, projects, sprints,
    openTicketView, openProject,
    nav, setStatusFilter, setProjectFilter, setProjectTab,
  } = useApp()
  const firstName = user?.name?.split(' ')[0] || 'there'

  // My tickets (assigned to the logged-in user)
  const myTickets = useMemo(
    () => tickets.filter(t => t.assignee === user?.name),
    [tickets, user]
  )

  // Stats
  const openCount     = myTickets.filter(t => t.status !== 'Done').length
  const inReviewCount = myTickets.filter(t => t.status === 'In Review').length
  const blockedCount  = myTickets.filter(t => t.status === 'Blocked').length
  const today         = todayStr()
  const dueTodayCount = myTickets.filter(t => t.dueDate === today).length
  const myProjects    = useMemo(() => {
    const pids = [...new Set(myTickets.map(t => t.project))]
    return pids.map(id => projects.find(p => p.id === id)).filter(Boolean)
  }, [myTickets, projects])

  // Status bar chart data
  const statusCounts = useMemo(() => {
    const counts = {}
    myTickets.forEach(t => { counts[t.status] = (counts[t.status] || 0) + 1 })
    return Object.entries(counts).sort((a, b) => b[1] - a[1])
  }, [myTickets])
  const maxCount = Math.max(...statusCounts.map(([, v]) => v), 1)

  // My open tickets (non-done), sorted by priority
  const priorityOrder = { Critical: 0, High: 1, Medium: 2, Low: 3 }
  const openTickets = useMemo(
    () => myTickets
      .filter(t => t.status !== 'Done')
      .sort((a, b) => (priorityOrder[a.priority] ?? 4) - (priorityOrder[b.priority] ?? 4))
      .slice(0, 8),
    [myTickets]
  )

  // Activity feed derived from ticket data
  const activityFeed = useMemo(() => {
    const items = []
    const recentlyUpdated = [...tickets]
      .sort((a, b) => (b.updated || '').localeCompare(a.updated || ''))
      .slice(0, 20)

    recentlyUpdated.forEach(t => {
      if (t.status === 'In Progress') {
        items.push({ icon: '🔄', text: `${t.id} moved to In Progress`, ticket: t, ts: t.updated })
      } else if (t.status === 'In Review') {
        items.push({ icon: '🔍', text: `${t.id} is now In Review`, ticket: t, ts: t.updated })
      } else if (t.status === 'Done') {
        items.push({ icon: '✅', text: `${t.id} marked Done`, ticket: t, ts: t.updated })
      } else if (t.status === 'Blocked') {
        items.push({ icon: '🚨', text: `${t.id} is now Blocked`, ticket: t, ts: t.updated })
      } else if (t.assignee === user?.name) {
        items.push({ icon: '📝', text: `${t.id} assigned to you`, ticket: t, ts: t.updated })
      }
    })

    const nextWeek = new Date()
    nextWeek.setDate(nextWeek.getDate() + 7)
    tickets
      .filter(t => t.dueDate && t.status !== 'Done' && new Date(t.dueDate) <= nextWeek)
      .slice(0, 3)
      .forEach(t => {
        items.push({ icon: '⏰', text: `${t.id} due on ${t.dueDate}`, ticket: t, ts: t.dueDate })
      })

    const seen = new Set()
    return items.filter(item => {
      const key = `${item.icon}-${item.ticket?.id}`
      if (seen.has(key)) return false
      seen.add(key)
      return true
    }).slice(0, 10)
  }, [tickets, user])

  // Navigate to All Tickets with a preset status filter
  const goToTickets = (statusVal) => {
    setStatusFilter(statusVal || 'All')
    nav('alltickets')
  }

  const statCards = [
    {
      label: 'Open Tickets',
      value: openCount,
      color: '#3b82f6',
      bg: '#eff6ff',
      onClick: () => goToTickets('All'),
    },
    {
      label: 'In Review',
      value: inReviewCount,
      color: '#8b5cf6',
      bg: '#f5f3ff',
      onClick: () => goToTickets('In Review'),
    },
    {
      label: 'Blocked',
      value: blockedCount,
      color: '#ef4444',
      bg: '#fff1f2',
      onClick: () => goToTickets('Blocked'),
    },
    {
      label: 'Due Today',
      value: dueTodayCount,
      color: '#f59e0b',
      bg: '#fffbeb',
      onClick: () => goToTickets('All'),
    },
    {
      label: `${myProjects.length} project${myProjects.length !== 1 ? 's' : ''} assigned`,
      value: null,
      color: '#10b981',
      bg: '#f0fdf4',
      onClick: () => nav('projects'),
    },
  ]

  return (
    <div className="page">
      {/* Header greeting */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 24,
      }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)' }}>
            {greeting()}, {firstName}! 👋
          </div>
          <div style={{ fontSize: 13, color: 'var(--gray-500)', marginTop: 3 }}>
            Today is {formatDate(new Date())}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {myProjects.slice(0, 4).map(p => (
            <div
              key={p.id}
              title={p.name}
              style={{
                width: 36, height: 36, borderRadius: 10,
                background: p.color, display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: 18, cursor: 'pointer',
                boxShadow: `0 2px 8px ${p.color}40`,
                transition: 'transform .15s, box-shadow .15s',
              }}
              onClick={() => openProject(p.id)}
              onMouseEnter={e => { e.currentTarget.style.transform='scale(1.12)'; e.currentTarget.style.boxShadow=`0 4px 14px ${p.color}55` }}
              onMouseLeave={e => { e.currentTarget.style.transform='scale(1)'; e.currentTarget.style.boxShadow=`0 2px 8px ${p.color}40` }}
            >
              {p.icon || '📁'}
            </div>
          ))}
        </div>
      </div>

      {/* Stat cards row */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
        {statCards.map(({ label, value, color, bg, onClick }) => (
          <div
            key={label}
            onClick={onClick}
            style={{
              flex: '1 1 120px', background: '#fff', borderRadius: 10,
              padding: '14px 18px', minWidth: 100,
              border: '1.5px solid var(--gray-200)',
              borderLeft: `4px solid ${color}`,
              boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)',
              cursor: 'pointer', transition: 'transform .15s, box-shadow .15s',
              userSelect: 'none',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.boxShadow = `0 4px 16px ${color}22`
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)'
            }}
          >
            {value !== null && (
              <div style={{ fontSize: 28, fontWeight: 800, color, lineHeight: 1 }}>{value}</div>
            )}
            <div style={{
              fontSize: 12,
              color: value !== null ? 'var(--gray-500)' : color,
              fontWeight: value !== null ? 400 : 700,
              marginTop: value !== null ? 4 : 0,
            }}>
              {label}
            </div>
            {value !== null && (
              <div style={{ fontSize: 10, color, fontWeight: 600, marginTop: 4, opacity: 0.7 }}>
                View →
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Sprint Overview */}
      {sprints && (
        <SprintOverview
          sprints={sprints}
          tickets={tickets}
          projects={projects}
          openProject={openProject}
          setProjectTab={setProjectTab}
        />
      )}

      {/* Status bar chart */}
      <div className="card" style={{ padding: 20, marginBottom: 20 }}>
        <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 14, color: 'var(--text)' }}>
          My Tickets by Status
        </div>
        {statusCounts.length === 0 ? (
          <div style={{ color: 'var(--gray-400)', fontSize: 13 }}>No tickets assigned to you yet.</div>
        ) : (
          statusCounts.map(([status, count]) => (
            <div
              key={status}
              style={{ marginBottom: 10, cursor: 'pointer' }}
              onClick={() => goToTickets(status)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{
                    width: 8, height: 8, borderRadius: '50%',
                    background: STATUS_COLORS[status] || '#64748b',
                    display: 'inline-block', flexShrink: 0,
                  }} />
                  {status}
                </span>
                <span style={{ fontWeight: 700, color: STATUS_COLORS[status] || '#64748b' }}>{count}</span>
              </div>
              <div style={{ height: 8, background: 'var(--gray-100)', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  width: `${(count / maxCount) * 100}%`,
                  background: STATUS_COLORS[status] || '#64748b',
                  borderRadius: 4,
                  transition: 'width .4s ease',
                }} />
              </div>
            </div>
          ))
        )}
      </div>

      {/* Bottom two-column layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* My Open Tickets */}
        <div className="card" style={{ padding: 20 }}>
          <div style={{
            fontWeight: 700, fontSize: 14, marginBottom: 14,
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <span>My Open Tickets</span>
            {openCount > 8 && (
              <span
                style={{ fontSize: 11, color: 'var(--blue)', cursor: 'pointer', fontWeight: 600 }}
                onClick={() => goToTickets('All')}
              >View all {openCount} →</span>
            )}
          </div>
          {openTickets.length === 0 ? (
            <div style={{ color: 'var(--gray-400)', fontSize: 13, padding: '20px 0', textAlign: 'center' }}>
              All clear! No open tickets.
            </div>
          ) : (
            openTickets.map(t => {
              const proj = projects.find(p => p.id === t.project)
              return (
                <div
                  key={t.id}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '8px 0', borderBottom: '1px solid var(--gray-100)',
                    cursor: 'pointer',
                  }}
                  onClick={() => openTicketView(t.id)}
                >
                  <span style={{
                    width: 8, height: 8, borderRadius: '50%',
                    background: PRIORITY_COLORS[t.priority] || '#64748b',
                    flexShrink: 0,
                  }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {t.title}
                    </div>
                    <div style={{ fontSize: 10, color: 'var(--gray-400)', marginTop: 2 }}>
                      <span
                        style={{ fontWeight: 700, color: proj?.color || 'var(--blue)', cursor: 'pointer' }}
                        onClick={e => { e.stopPropagation(); proj && openProject(proj.id) }}
                      >{t.id}</span>
                      {' · '}
                      <span style={{ color: STATUS_COLORS[t.status] || '#64748b' }}>{t.status}</span>
                    </div>
                  </div>
                  <span style={{
                    fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 6,
                    background: `${PRIORITY_COLORS[t.priority] || '#64748b'}18`,
                    color: PRIORITY_COLORS[t.priority] || '#64748b',
                    flexShrink: 0,
                  }}>
                    {t.priority}
                  </span>
                </div>
              )
            })
          )}
        </div>

        {/* Activity Feed */}
        <div className="card" style={{ padding: 20 }}>
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 14 }}>Activity Feed</div>
          {activityFeed.length === 0 ? (
            <div style={{ color: 'var(--gray-400)', fontSize: 13, padding: '20px 0', textAlign: 'center' }}>
              No recent activity.
            </div>
          ) : (
            activityFeed.map((item, i) => (
              <div
                key={i}
                style={{
                  display: 'flex', gap: 10, alignItems: 'flex-start',
                  padding: '8px 0', borderBottom: '1px solid var(--gray-100)',
                  cursor: item.ticket ? 'pointer' : 'default',
                }}
                onClick={() => item.ticket && openTicketView(item.ticket.id)}
              >
                <span style={{ fontSize: 15, flexShrink: 0, lineHeight: 1.4 }}>{item.icon}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, color: 'var(--text)', lineHeight: 1.4 }}>{item.text}</div>
                  {item.ticket?.title && (
                    <div style={{ fontSize: 11, color: 'var(--gray-400)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item.ticket.title}
                    </div>
                  )}
                </div>
                {item.ts && (
                  <span style={{ fontSize: 10, color: 'var(--gray-400)', flexShrink: 0, marginTop: 2 }}>
                    {item.ts.slice(0, 10)}
                  </span>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
