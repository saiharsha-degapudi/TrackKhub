import React, { useState, useMemo } from 'react'
import { useApp } from '../../context/AppContext'

// ── Constants ──────────────────────────────────────────────────────────────────
const STATUS_COLOR = {
  'To Do': '#6b7280',
  'In Progress': '#2563eb',
  'In Review': '#f59e0b',
  'Done': '#22c55e',
  'Blocked': '#ef4444',
}
const PRIORITY_COLOR = {
  Critical: '#ef4444',
  High: '#f97316',
  Medium: '#f59e0b',
  Low: '#22c55e',
}
const TYPE_CONF = {
  Story:      { bg: '#dcfce7', color: '#166534', char: 'S' },
  Task:       { bg: '#dbeafe', color: '#1e40af', char: 'T' },
  'Sub-task': { bg: '#f0f9ff', color: '#0369a1', char: '↳' },
  Epic:       { bg: '#ede9fe', color: '#5b21b6', char: 'E' },
  Feature:    { bg: '#fef3c7', color: '#92400e', char: 'F' },
  Initiative: { bg: '#fce7f3', color: '#9d174d', char: 'I' },
  Bug:        { bg: '#fee2e2', color: '#991b1b', char: 'B' },
}
const STATUSES = ['To Do', 'In Progress', 'In Review', 'Done', 'Blocked']
const PRIORITIES = ['Critical', 'High', 'Medium', 'Low']
const DATE_RANGES = ['This Week', 'This Month', 'This Quarter']

// ── Helpers ────────────────────────────────────────────────────────────────────
function fmtDate(date) {
  if (!date) return '—'
  const d = new Date(date)
  const now = new Date()
  const diff = now - d
  if (diff < 60000) return 'just now'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function fmtShort(date) {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function initials(name) {
  if (!name) return '?'
  return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
}

function Avatar({ name, size = 22 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', background: '#e5e7eb',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.4, fontWeight: 700, color: '#374151', flexShrink: 0,
    }}>
      {initials(name)}
    </div>
  )
}

function TypeBadge({ type }) {
  const c = TYPE_CONF[type] || { bg: '#f3f4f6', color: '#6b7280', char: '?' }
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      width: 16, height: 16, borderRadius: 3,
      background: c.bg, color: c.color, fontSize: 10, fontWeight: 700, flexShrink: 0,
    }}>
      {c.char}
    </span>
  )
}

// ── Sub-components ─────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, color = '#2563eb', trend }) {
  return (
    <div style={{
      background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8,
      padding: '14px 16px', flex: 1,
    }}>
      <div style={{ fontSize: 24, fontWeight: 700, color, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 11, color: '#6b7280', marginTop: 4 }}>{label}</div>
      {sub != null && (
        <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>{sub}</div>
      )}
      {trend != null && (
        <div style={{ fontSize: 11, color: trend >= 0 ? '#22c55e' : '#ef4444', marginTop: 2 }}>
          {trend >= 0 ? '▲' : '▼'} {Math.abs(trend)}%
        </div>
      )}
    </div>
  )
}

function BarRow({ label, count, total, color }) {
  const pct = total ? Math.round((count / total) * 100) : 0
  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
        <span style={{ fontSize: 12, color: '#374151' }}>{label}</span>
        <span style={{ fontSize: 12, color: '#6b7280' }}>{count} · {pct}%</span>
      </div>
      <div style={{ height: 5, background: '#f3f4f6', borderRadius: 3 }}>
        <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 3, transition: 'width 0.3s' }} />
      </div>
    </div>
  )
}

function Card({ title, children, style }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: '14px 16px', ...style }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 12 }}>{title}</div>
      {children}
    </div>
  )
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function Dashboards() {
  const { tickets = [], projects = [], sprints = [], users = [], openTicketView } = useApp()
  const [dateRange, setDateRange] = useState('This Month')

  const now = new Date()
  const rangeStart = useMemo(() => {
    const d = new Date()
    if (dateRange === 'This Week') d.setDate(d.getDate() - 7)
    else if (dateRange === 'This Month') d.setDate(1)
    else { d.setMonth(Math.floor(d.getMonth() / 3) * 3); d.setDate(1) }
    return d
  }, [dateRange])

  // Stats
  const total = tickets.length
  const inProgress = tickets.filter(t => t.status === 'In Progress').length
  const doneThisPeriod = tickets.filter(t =>
    t.status === 'Done' && t.updated && new Date(t.updated) >= rangeStart
  ).length
  const overdue = tickets.filter(t =>
    t.dueDate && new Date(t.dueDate) < now && t.status !== 'Done'
  ).length

  // By status
  const byStatus = STATUSES.map(s => ({
    label: s, count: tickets.filter(t => t.status === s).length, color: STATUS_COLOR[s],
  }))

  // Sprint velocity (last 4 completed/active sprints)
  const recentSprints = [...sprints]
    .filter(s => s.status === 'Completed' || s.status === 'Active')
    .slice(-4)
  const maxVelocity = Math.max(...recentSprints.map(s => s.velocity || 0), 1)

  // By priority
  const byPriority = PRIORITIES.map(p => ({
    label: p, count: tickets.filter(t => t.priority === p).length, color: PRIORITY_COLOR[p],
  }))

  // Team workload
  const assignees = [...new Set(tickets.map(t => t.assignee).filter(Boolean))]
  const workload = assignees.map(a => ({
    name: a,
    count: tickets.filter(t => t.assignee === a && t.status !== 'Done').length,
    total: tickets.filter(t => t.assignee === a).length,
  })).sort((a, b) => b.count - a.count).slice(0, 6)
  const maxWork = Math.max(...workload.map(w => w.count), 1)

  // Recent activity
  const recentTickets = [...tickets]
    .sort((a, b) => new Date(b.updated || b.created || 0) - new Date(a.updated || a.created || 0))
    .slice(0, 6)

  // Projects overview
  const projectsOverview = projects.map(p => {
    const pts = tickets.filter(t => t.project === p.id)
    const pDone = pts.filter(t => t.status === 'Done').length
    const pOpen = pts.filter(t => t.status !== 'Done').length
    const lastUpdated = pts.reduce((acc, t) => {
      const d = new Date(t.updated || t.created || 0)
      return d > acc ? d : acc
    }, new Date(0))
    return { ...p, total: pts.length, open: pOpen, done: pDone, lastUpdated }
  })

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#f9fafb' }}>
      {/* Page Header */}
      <div style={{
        height: 48, background: '#fff', borderBottom: '1px solid #e5e7eb',
        display: 'flex', alignItems: 'center', padding: '0 20px', gap: 12, flexShrink: 0,
      }}>
        <span style={{ fontSize: 15, fontWeight: 600, color: '#111827' }}>Dashboards</span>
        <div style={{ flex: 1 }} />
        <div style={{ display: 'flex', border: '1px solid #e5e7eb', borderRadius: 6, overflow: 'hidden' }}>
          {DATE_RANGES.map(r => (
            <button
              key={r}
              onClick={() => setDateRange(r)}
              style={{
                padding: '4px 10px', fontSize: 12, fontWeight: 500,
                background: dateRange === r ? '#2563eb' : '#fff',
                color: dateRange === r ? '#fff' : '#6b7280',
                border: 'none', cursor: 'pointer', borderRight: '1px solid #e5e7eb',
              }}
            >
              {r}
            </button>
          ))}
        </div>
        <button style={{
          padding: '6px 12px', fontSize: 12, fontWeight: 500,
          background: '#2563eb', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer',
        }}>
          + New Dashboard
        </button>
      </div>

      {/* Scrollable Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>

        {/* Row 1 — Stat Cards */}
        <div style={{ display: 'flex', gap: 12 }}>
          <StatCard label="Total Issues" value={total} color="#2563eb" />
          <StatCard label="In Progress" value={inProgress} color="#2563eb" sub={`${total ? Math.round((inProgress / total) * 100) : 0}% of total`} />
          <StatCard label={`Done (${dateRange})`} value={doneThisPeriod} color="#22c55e" />
          <StatCard label="Overdue" value={overdue} color={overdue > 0 ? '#ef4444' : '#22c55e'} />
        </div>

        {/* Row 2 — Issues by Status + Sprint Velocity */}
        <div style={{ display: 'flex', gap: 12 }}>
          <Card title="Issues by Status" style={{ flex: '0 0 55%' }}>
            {/* Stacked bar */}
            <div style={{ height: 12, borderRadius: 6, overflow: 'hidden', display: 'flex', marginBottom: 14 }}>
              {byStatus.filter(s => s.count > 0).map(s => (
                <div key={s.label} style={{ flex: s.count, background: s.color }} title={`${s.label}: ${s.count}`} />
              ))}
            </div>
            {byStatus.map(s => <BarRow key={s.label} {...s} total={total} />)}
          </Card>
          <Card title="Sprint Velocity" style={{ flex: '0 0 calc(45% - 12px)' }}>
            {recentSprints.length === 0 ? (
              <div style={{ fontSize: 12, color: '#9ca3af', textAlign: 'center', padding: '24px 0' }}>No sprint data</div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 80 }}>
                {recentSprints.map(s => {
                  const v = s.velocity || 0
                  const h = maxVelocity ? Math.round((v / maxVelocity) * 100) : 0
                  return (
                    <div key={s.id} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                      <span style={{ fontSize: 11, fontWeight: 600, color: '#374151' }}>{v}</span>
                      <div style={{ width: '100%', height: `${h}%`, background: '#2563eb', borderRadius: '3px 3px 0 0', minHeight: 4 }} />
                      <span style={{ fontSize: 10, color: '#9ca3af', textAlign: 'center', lineHeight: 1.2 }}>
                        {s.name?.replace('Sprint ', 'S') || 'Sprint'}
                      </span>
                    </div>
                  )
                })}
              </div>
            )}
            <div style={{ marginTop: 16, borderTop: '1px solid #f3f4f6', paddingTop: 12 }}>
              {recentSprints.map(s => (
                <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, padding: '3px 0' }}>
                  <span style={{ color: '#374151' }}>{s.name}</span>
                  <span style={{ color: '#6b7280' }}>{s.velocity || 0} pts</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Row 3 — By Priority + Team Workload + Recent Activity */}
        <div style={{ display: 'flex', gap: 12 }}>
          <Card title="By Priority" style={{ flex: 1 }}>
            {byPriority.map(p => <BarRow key={p.label} {...p} total={total} />)}
          </Card>
          <Card title="Team Workload" style={{ flex: 1 }}>
            {workload.length === 0 ? (
              <div style={{ fontSize: 12, color: '#9ca3af', textAlign: 'center', padding: '24px 0' }}>No assignments</div>
            ) : workload.map(w => (
              <div key={w.name} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <Avatar name={w.name} size={22} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 3 }}>
                    <span style={{ color: '#374151' }}>{w.name}</span>
                    <span style={{ color: '#6b7280' }}>{w.count} open</span>
                  </div>
                  <div style={{ height: 4, background: '#f3f4f6', borderRadius: 2 }}>
                    <div style={{
                      height: '100%',
                      width: `${maxWork ? Math.round((w.count / maxWork) * 100) : 0}%`,
                      background: w.count > 5 ? '#ef4444' : '#2563eb',
                      borderRadius: 2,
                    }} />
                  </div>
                </div>
              </div>
            ))}
          </Card>
          <Card title="Recent Activity" style={{ flex: 1 }}>
            {recentTickets.length === 0 ? (
              <div style={{ fontSize: 12, color: '#9ca3af', textAlign: 'center', padding: '24px 0' }}>No recent activity</div>
            ) : recentTickets.map(t => (
              <div
                key={t.id}
                onClick={() => openTicketView && openTicketView(t.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0',
                  borderBottom: '1px solid #f9fafb', cursor: 'pointer',
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'}
                onMouseLeave={e => e.currentTarget.style.background = 'none'}
              >
                <TypeBadge type={t.type} />
                <span style={{
                  flex: 1, fontSize: 12, color: '#374151',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {t.title}
                </span>
                <span style={{ fontSize: 11, color: '#9ca3af', flexShrink: 0 }}>
                  {fmtDate(t.updated || t.created)}
                </span>
              </div>
            ))}
          </Card>
        </div>

        {/* Row 4 — Projects Overview */}
        <Card title="Projects Overview">
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Project', 'Total', 'Open', 'Done', 'Done %', 'Lead', 'Last Activity'].map(col => (
                  <th key={col} style={{
                    padding: '6px 12px', textAlign: 'left', fontSize: 11, fontWeight: 600,
                    color: '#6b7280', borderBottom: '1px solid #e5e7eb', background: '#f9fafb',
                  }}>
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {projectsOverview.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '24px', textAlign: 'center', fontSize: 13, color: '#9ca3af' }}>
                    No projects yet.
                  </td>
                </tr>
              ) : projectsOverview.map((p, i) => {
                const pct = p.total ? Math.round((p.done / p.total) * 100) : 0
                return (
                  <tr key={p.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '8px 12px', verticalAlign: 'middle' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: p.color || '#2563eb' }} />
                        <span style={{ fontSize: 13, fontWeight: 500, color: '#111827' }}>{p.name}</span>
                        {p.key && (
                          <span style={{ fontSize: 10, fontFamily: 'monospace', color: '#9ca3af' }}>{p.key}</span>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: '8px 12px', fontSize: 13, color: '#374151' }}>{p.total}</td>
                    <td style={{ padding: '8px 12px', fontSize: 13, color: '#374151' }}>{p.open}</td>
                    <td style={{ padding: '8px 12px', fontSize: 13, color: '#22c55e', fontWeight: 500 }}>{p.done}</td>
                    <td style={{ padding: '8px 12px', verticalAlign: 'middle' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div style={{ width: 60, height: 5, background: '#f3f4f6', borderRadius: 3 }}>
                          <div style={{ height: '100%', width: `${pct}%`, background: '#22c55e', borderRadius: 3 }} />
                        </div>
                        <span style={{ fontSize: 11, color: '#6b7280' }}>{pct}%</span>
                      </div>
                    </td>
                    <td style={{ padding: '8px 12px' }}>
                      {p.lead ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <Avatar name={p.lead} size={18} />
                          <span style={{ fontSize: 12, color: '#374151' }}>{p.lead}</span>
                        </div>
                      ) : (
                        <span style={{ fontSize: 12, color: '#9ca3af' }}>—</span>
                      )}
                    </td>
                    <td style={{ padding: '8px 12px', fontSize: 12, color: '#9ca3af' }}>
                      {p.lastUpdated > new Date(0) ? fmtDate(p.lastUpdated) : '—'}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </Card>

      </div>
    </div>
  )
}
