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
  const { user, tickets, projects, openTicketView, openProject } = useApp()
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

    // Recently updated tickets
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

    // Due soon (within 7 days)
    const nextWeek = new Date()
    nextWeek.setDate(nextWeek.getDate() + 7)
    tickets
      .filter(t => t.dueDate && t.status !== 'Done' && new Date(t.dueDate) <= nextWeek)
      .slice(0, 3)
      .forEach(t => {
        items.push({ icon: '⏰', text: `${t.id} due on ${t.dueDate}`, ticket: t, ts: t.dueDate })
      })

    // Deduplicate by ticket id + icon, take first 10
    const seen = new Set()
    return items.filter(item => {
      const key = `${item.icon}-${item.ticket?.id}`
      if (seen.has(key)) return false
      seen.add(key)
      return true
    }).slice(0, 10)
  }, [tickets, user])

  const statCards = [
    { label: 'Open',      value: openCount,     color: '#3b82f6', bg: '#eff6ff' },
    { label: 'In Review', value: inReviewCount,  color: '#8b5cf6', bg: '#f5f3ff' },
    { label: 'Blocked',   value: blockedCount,   color: '#ef4444', bg: '#fff1f2' },
    { label: 'Due Today', value: dueTodayCount,  color: '#f59e0b', bg: '#fffbeb' },
    { label: `${myProjects.length} projects assigned`, value: null, color: '#10b981', bg: '#f0fdf4' },
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
                width: 32, height: 32, borderRadius: 8,
                background: p.color, display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: 16, cursor: 'pointer',
                boxShadow: `0 2px 8px ${p.color}40`,
              }}
              onClick={() => openProject(p.id)}
            >
              {p.icon || '📁'}
            </div>
          ))}
        </div>
      </div>

      {/* Stat cards row */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
        {statCards.map(({ label, value, color, bg }) => (
          <div key={label} style={{
            flex: '1 1 120px', background: bg, borderRadius: 12, padding: '14px 18px',
            border: `1.5px solid ${color}30`, minWidth: 100,
          }}>
            {value !== null && (
              <div style={{ fontSize: 28, fontWeight: 800, color, lineHeight: 1 }}>{value}</div>
            )}
            <div style={{ fontSize: 12, color: value !== null ? 'var(--gray-500)' : color, fontWeight: value !== null ? 400 : 700, marginTop: value !== null ? 4 : 0 }}>
              {label}
            </div>
          </div>
        ))}
      </div>

      {/* Status bar chart */}
      <div className="card" style={{ padding: 20, marginBottom: 20 }}>
        <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 14, color: 'var(--text)' }}>
          My Tickets by Status
        </div>
        {statusCounts.length === 0 ? (
          <div style={{ color: 'var(--gray-400)', fontSize: 13 }}>No tickets assigned to you yet.</div>
        ) : (
          statusCounts.map(([status, count]) => (
            <div key={status} style={{ marginBottom: 10 }}>
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
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 14 }}>My Open Tickets</div>
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
                      <span style={{ fontWeight: 700, color: proj?.color || 'var(--blue)' }}>{t.id}</span>
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
