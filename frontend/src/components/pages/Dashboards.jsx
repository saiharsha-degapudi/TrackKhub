import React from 'react'
import { useApp } from '../../context/AppContext'
import Avatar from '../common/Avatar'
import { getTypeColor, getStatusClass } from '../common/Badge'

const STATUSES = ['To Do', 'In Progress', 'In Review', 'Done', 'Blocked']
const ISSUE_TYPES = ['Feature', 'Initiative', 'Epic', 'Story', 'Task', 'Sub-task']
const PRIORITIES = ['Critical', 'High', 'Medium', 'Low']

const REPORT_LABELS = {
  'issue-list': '📋 Issue List',
  'pie-status': '🥧 By Status',
  'pie-priority': '🥧 By Priority',
  'pie-type': '🥧 By Issue Type',
  burndown: '📉 Burndown',
  velocity: '⚡ Velocity',
  workload: '👥 Team Workload',
  'created-resolved': '📊 Created vs Resolved'
}

const SC = { 'To Do': '#94a3b8', 'In Progress': '#1a56db', 'In Review': '#8b5cf6', Done: '#10b981', Blocked: '#ef4444' }
const PC = { Critical: '#dc2626', High: '#ea580c', Medium: '#ca8a04', Low: '#16a34a' }
const TC = { Feature: '#f59e0b', Initiative: '#7c3aed', Epic: '#9333ea', Story: '#16a34a', Task: '#3b82f6', 'Sub-task': '#ea580c' }

function SegChart({ segs, total }) {
  const bar = segs.map((s, i) => (
    <div key={i} style={{ flex: s.value, background: s.color, height: '100%' }} title={`${s.label}: ${s.value}`} />
  ))
  return (
    <>
      <div style={{ height: 16, borderRadius: 6, overflow: 'hidden', display: 'flex', marginBottom: 10 }}>{bar}</div>
      <div>
        {segs.map((s, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 0', borderBottom: '1px solid var(--gray-100)' }}>
            <span style={{ width: 10, height: 10, borderRadius: 2, background: s.color, flexShrink: 0 }} />
            <span style={{ fontSize: 12, flex: 1 }}>{s.label}</span>
            <span style={{ fontSize: 12, fontWeight: 700 }}>{s.value}</span>
            <span style={{ fontSize: 11, color: 'var(--gray-400)', minWidth: 38, textAlign: 'right' }}>
              {Math.round(s.value / total * 100)}%
            </span>
          </div>
        ))}
      </div>
    </>
  )
}

function DashboardReport({ d, res }) {
  const rt = d.reportType || 'issue-list'
  const { openTicketView } = useApp()

  if (rt === 'issue-list') {
    const rows = res.slice(0, 5)
    return (
      <div className="card" style={{ padding: 0, margin: 0 }}>
        <table>
          <thead><tr><th>ID</th><th>Title</th><th>Status</th><th>Assignee</th></tr></thead>
          <tbody>
            {rows.map(t => (
              <tr key={t.id} onClick={() => openTicketView(t.id)} style={{ cursor: 'pointer' }}>
                <td style={{ fontWeight: 600, color: 'var(--blue)' }}>{t.id}</td>
                <td style={{ maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.title}</td>
                <td><span className={`badge ${getStatusClass(t.status)}`}>{t.status}</span></td>
                <td><Avatar name={t.assignee} size={22} /></td>
              </tr>
            ))}
            {res.length > 5 && (
              <tr><td colSpan={4} style={{ textAlign: 'center', fontSize: 11, color: 'var(--gray-400)', padding: 7 }}>+{res.length - 5} more</td></tr>
            )}
          </tbody>
        </table>
      </div>
    )
  }
  if (rt === 'pie-status') {
    const segs = STATUSES.map(s => ({ label: s, value: res.filter(t => t.status === s).length, color: SC[s] })).filter(s => s.value > 0)
    return res.length ? <SegChart segs={segs} total={res.length} /> : <div className="empty-state" style={{ padding: 12 }}>No data</div>
  }
  if (rt === 'pie-priority') {
    const segs = PRIORITIES.map(p => ({ label: p, value: res.filter(t => t.priority === p).length, color: PC[p] })).filter(s => s.value > 0)
    return res.length ? <SegChart segs={segs} total={res.length} /> : <div className="empty-state" style={{ padding: 12 }}>No data</div>
  }
  if (rt === 'pie-type') {
    const segs = ISSUE_TYPES.map(t => ({ label: t, value: res.filter(x => x.type === t).length, color: TC[t] })).filter(s => s.value > 0)
    return res.length ? <SegChart segs={segs} total={res.length} /> : <div className="empty-state" style={{ padding: 12 }}>No data</div>
  }
  if (rt === 'burndown') {
    const mx = Math.max(...STATUSES.map(s => res.filter(t => t.status === s).length), 1)
    return (
      <div className="bar-chart" style={{ height: 90 }}>
        {STATUSES.map(s => {
          const c = res.filter(t => t.status === s).length
          return (
            <div key={s} className="bar-wrap">
              <div className="bar-val">{c}</div>
              <div className="bar" style={{ height: Math.round(c / mx * 70) + 5, background: SC[s] }} />
              <div className="bar-label" style={{ fontSize: 9 }}>{s.split(' ')[0]}</div>
            </div>
          )
        })}
      </div>
    )
  }
  if (rt === 'velocity') {
    const sprints = ['Sprint 1', 'Sprint 2', 'Sprint 3']
    const mx = Math.max(...sprints.map(s => res.filter(t => t.sprint === s && t.status === 'Done').length), 1)
    return (
      <>
        <div style={{ fontSize: 11, color: 'var(--gray-500)', marginBottom: 6 }}>Completed tickets per sprint</div>
        <div className="bar-chart" style={{ height: 90 }}>
          {sprints.map(s => {
            const c = res.filter(t => t.sprint === s && t.status === 'Done').length
            return (
              <div key={s} className="bar-wrap">
                <div className="bar-val">{c}</div>
                <div className="bar" style={{ height: Math.round(c / mx * 70) + 5, background: 'var(--green)' }} />
                <div className="bar-label" style={{ fontSize: 9 }}>{s}</div>
              </div>
            )
          })}
        </div>
      </>
    )
  }
  if (rt === 'workload') {
    const by = {}
    res.forEach(t => { if (!by[t.assignee]) by[t.assignee] = 0; by[t.assignee]++ })
    const mx = Math.max(...Object.values(by), 1)
    return (
      <>
        {Object.entries(by).slice(0, 5).map(([name, count]) => (
          <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <Avatar name={name} size={24} />
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 3 }}>
                <span>{name}</span><strong>{count}</strong>
              </div>
              <div className="progress-bar"><div className="progress-fill" style={{ width: `${Math.round(count / mx * 100)}%` }} /></div>
            </div>
          </div>
        ))}
      </>
    )
  }
  if (rt === 'created-resolved') {
    const total = res.length, done = res.filter(t => t.status === 'Done').length, open = total - done
    return (
      <div>
        {[['Total Created', total, 'var(--blue)', 100], ['Resolved (Done)', done, 'var(--green)', total ? Math.round(done / total * 100) : 0], ['Still Open', open, 'var(--orange)', total ? Math.round(open / total * 100) : 0]].map(([label, val, color, pct]) => (
          <div key={label} style={{ marginBottom: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 3 }}>
              <span>{label}</span><strong>{val}</strong>
            </div>
            <div className="progress-bar" style={{ height: 10 }}>
              <div className="progress-fill" style={{ width: `${pct}%`, background: color }} />
            </div>
          </div>
        ))}
      </div>
    )
  }
  return null
}

/* ─── palette helpers ─── */
const TYPE_BAR_COLOR = { Feature: '#f59e0b', Initiative: '#7c3aed', Epic: '#9333ea', Story: '#16a34a', Task: '#3b82f6', 'Sub-task': '#ea580c' }
const CUSTOM_CARD_COLORS = ['#1a56db', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4']

/* ─── Shared card style ─── */
const cardStyle = (leftColor) => ({
  background: '#fff',
  borderRadius: 14,
  border: '1px solid rgba(37,99,235,0.10)',
  boxShadow: '0 4px 20px rgba(37,99,235,0.08)',
  padding: '20px 24px',
  ...(leftColor ? { borderLeft: `4px solid ${leftColor}` } : {}),
})

const cardTitle = (icon, label) => (
  <div style={{ fontSize: 14, fontWeight: 800, color: '#1e293b', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 7 }}>
    <span>{icon}</span><span>{label}</span>
  </div>
)

export default function Dashboards() {
  const { tickets, projects, filters, customDashboards, openModal, doDeleteDashboard, getFilteredTickets, openTicketView } = useApp()

  const tks = tickets
  const total = tks.length
  const done = tks.filter(t => t.status === 'Done').length
  const inprog = tks.filter(t => t.status === 'In Progress').length
  const blocked = tks.filter(t => t.status === 'Blocked').length
  const byStatus = {}; STATUSES.forEach(s => byStatus[s] = tks.filter(t => t.status === s).length)
  const mx = Math.max(...Object.values(byStatus), 1)
  const byAssignee = {}; tks.forEach(t => { if (!byAssignee[t.assignee]) byAssignee[t.assignee] = 0; byAssignee[t.assignee]++ })
  const byType = {}; ISSUE_TYPES.forEach(t => byType[t] = tks.filter(x => x.type === t).length)
  const mxT = Math.max(...Object.values(byType), 1)

  /* SVG bar chart dimensions */
  const BAR_W = 48
  const CHART_H = 160
  const CHART_PAD_TOP = 28
  const CHART_PAD_BOT = 28
  const usableH = CHART_H - CHART_PAD_TOP - CHART_PAD_BOT

  /* stat card config */
  const statCards = [
    {
      label: 'Total Tickets', value: total, color: '#2563eb', emoji: '📋',
      extra: <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>across all projects</div>,
      borderColor: '#2563eb'
    },
    {
      label: 'Done', value: done, color: '#10b981', emoji: '✅',
      extra: total ? (
        <span style={{ display: 'inline-block', marginTop: 6, padding: '2px 10px', borderRadius: 999, background: '#d1fae5', color: '#065f46', fontSize: 11, fontWeight: 700 }}>
          {Math.round(done / total * 100)}% complete
        </span>
      ) : null,
      borderColor: '#10b981'
    },
    {
      label: 'In Progress', value: inprog, color: '#f59e0b', emoji: '⚡',
      extra: <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>currently active</div>,
      borderColor: '#f59e0b'
    },
    {
      label: 'Blocked', value: blocked, color: '#ef4444', emoji: '🚫',
      extra: blocked > 0 ? (
        <span style={{ display: 'inline-block', marginTop: 6, padding: '2px 10px', borderRadius: 999, background: '#fee2e2', color: '#991b1b', fontSize: 11, fontWeight: 700 }}>
          Needs attention
        </span>
      ) : <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>All clear</div>,
      borderColor: '#ef4444'
    }
  ]

  return (
    <div className="page" style={{ background: '#eef2ff', minHeight: '100%', paddingBottom: 40 }}>

      {/* ── Hero Banner ── */}
      <div style={{
        background: 'linear-gradient(135deg, #1e40af 0%, #4f46e5 60%, #7c3aed 100%)',
        borderRadius: 18,
        padding: '30px 36px',
        marginBottom: 24,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 16,
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Decorative circles */}
        <div style={{ position: 'absolute', top: -50, right: 280, width: 180, height: 180, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -40, right: 60, width: 140, height: 140, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: 28, fontWeight: 900, color: '#fff', letterSpacing: '-0.5px', lineHeight: 1.2 }}>📊 Dashboards</div>
          <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.75)', marginTop: 6 }}>Analytics & KPIs across your workspace</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', position: 'relative', zIndex: 1 }}>
          {filters.filter(f => f.shared).map(f => (
            <button key={f.id}
              title={Object.entries(f.conditions).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`).join(' | ')}
              style={{
                padding: '6px 16px', borderRadius: 999,
                border: '1.5px solid rgba(255,255,255,0.3)',
                background: 'rgba(255,255,255,0.15)', color: '#fff',
                fontSize: 12, fontWeight: 600, cursor: 'pointer',
                backdropFilter: 'blur(6px)',
              }}>
              {f.name} ({getFilteredTickets(f.id).length})
            </button>
          ))}
          <button
            onClick={() => openModal('createDashboard')}
            style={{
              padding: '8px 22px', borderRadius: 10, border: 'none',
              background: '#fff', color: '#2563eb',
              fontSize: 13, fontWeight: 800, cursor: 'pointer',
              boxShadow: '0 2px 10px rgba(0,0,0,0.18)', whiteSpace: 'nowrap',
            }}>
            + New Dashboard
          </button>
        </div>
      </div>

      {/* ── Summary Stat Cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        {statCards.map(card => (
          <div key={card.label} style={{
            background: '#fff',
            borderRadius: 14,
            border: '1px solid rgba(37,99,235,0.10)',
            borderLeft: `4px solid ${card.borderColor}`,
            boxShadow: '0 4px 20px rgba(37,99,235,0.08)',
            padding: '18px 20px',
            position: 'relative',
            overflow: 'hidden',
          }}>
            {/* Ghost watermark emoji */}
            <div style={{ position: 'absolute', top: 12, right: 16, fontSize: 26, opacity: 0.09, userSelect: 'none' }}>{card.emoji}</div>
            <div style={{ fontSize: 36, fontWeight: 900, color: card.color, lineHeight: 1 }}>{card.value}</div>
            <div style={{ fontSize: 12, color: '#64748b', marginTop: 5, fontWeight: 600 }}>{card.label}</div>
            {card.extra}
          </div>
        ))}
      </div>

      {/* ── Charts Row: Status Bar Chart + Team Workload ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>

        {/* SVG Bar Chart — Tickets by Status */}
        <div style={cardStyle('#2563eb')}>
          {cardTitle('📊', 'Tickets by Status')}
          <svg width="100%" height={CHART_H} viewBox={`0 0 ${STATUSES.length * 80} ${CHART_H}`} preserveAspectRatio="none" style={{ overflow: 'visible' }}>
            {/* Grid lines at 25/50/75/100% */}
            {[0.25, 0.5, 0.75, 1].map((pct, i) => (
              <line key={i}
                x1={0} y1={CHART_PAD_TOP + (1 - pct) * usableH}
                x2={STATUSES.length * 80} y2={CHART_PAD_TOP + (1 - pct) * usableH}
                stroke="#e2e8f0" strokeWidth={1} strokeDasharray="4,3" />
            ))}
            {STATUSES.map((s, i) => {
              const barH = Math.max(Math.round(byStatus[s] / mx * usableH), 4)
              const x = i * 80 + 16
              const y = CHART_PAD_TOP + usableH - barH
              return (
                <g key={s}>
                  <rect x={x} y={y} width={BAR_W} height={barH} rx={5} fill={SC[s]} />
                  <text x={x + BAR_W / 2} y={y - 7} textAnchor="middle" fontSize={13} fontWeight={800} fill="#1e293b">{byStatus[s]}</text>
                  <text x={x + BAR_W / 2} y={CHART_PAD_TOP + usableH + 17} textAnchor="middle" fontSize={10} fill="#94a3b8">{s}</text>
                </g>
              )
            })}
          </svg>
        </div>

        {/* Team Workload */}
        <div style={cardStyle('#8b5cf6')}>
          {cardTitle('👥', 'Team Workload')}
          {Object.entries(byAssignee).slice(0, 6).map(([name, count]) => {
            const pct = total ? Math.round(count / total * 100) : 0
            return (
              <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <Avatar name={name} size={28} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>{name}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: 11, padding: '1px 8px', borderRadius: 999, background: '#eff6ff', color: '#2563eb', fontWeight: 800 }}>{count}</span>
                      <span style={{ fontSize: 11, color: '#94a3b8', minWidth: 32, textAlign: 'right' }}>{pct}%</span>
                    </div>
                  </div>
                  <div style={{ height: 7, borderRadius: 999, background: '#e8edf5', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, borderRadius: 999, background: 'linear-gradient(90deg, #2563eb, #7c3aed)', transition: 'width 0.4s ease' }} />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Second Row: Issue Type + Projects Overview + Recent Activity ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 24 }}>

        {/* By Issue Type */}
        <div style={cardStyle()}>
          {cardTitle('🏷️', 'By Issue Type')}
          {ISSUE_TYPES.map(t => {
            const pct = byType[t] ? Math.round(byType[t] / mxT * 100) : 0
            const col = TYPE_BAR_COLOR[t] || '#94a3b8'
            return (
              <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ width: 9, height: 9, borderRadius: '50%', background: col, flexShrink: 0 }} />
                <span style={{ fontSize: 12, fontWeight: 500, color: '#334155', flex: 1 }}>{t}</span>
                <div style={{ width: 72, height: 6, borderRadius: 999, background: '#f1f5f9', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${pct}%`, borderRadius: 999, background: col, transition: 'width 0.4s' }} />
                </div>
                <span style={{ fontSize: 12, fontWeight: 800, color: '#1e293b', minWidth: 20, textAlign: 'right' }}>{byType[t]}</span>
              </div>
            )
          })}
        </div>

        {/* Projects Overview */}
        <div style={cardStyle()}>
          {cardTitle('🗂', 'Projects Overview')}
          {projects.map(p => {
            const pt = tks.filter(t => t.project === p.id)
            const pd = pt.filter(t => t.status === 'Done').length
            const pct = pt.length ? Math.round(pd / pt.length * 100) : 0
            return (
              <div key={p.id} style={{ padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    <span style={{ width: 9, height: 9, borderRadius: '50%', background: p.color, flexShrink: 0 }} />
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>{p.name}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 11, color: '#94a3b8' }}>{pd}/{pt.length}</span>
                    <span style={{ fontSize: 11, padding: '1px 7px', borderRadius: 999, background: p.color + '1a', color: p.color, fontWeight: 800 }}>{pct}%</span>
                  </div>
                </div>
                <div style={{ height: 5, borderRadius: 999, background: '#e8edf5', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${pct}%`, borderRadius: 999, background: p.color, transition: 'width 0.4s' }} />
                </div>
              </div>
            )
          })}
        </div>

        {/* Recent Activity */}
        <div style={cardStyle()}>
          {cardTitle('🕐', 'Recent Activity')}
          {tks.slice(0, 6).map(t => (
            <div key={t.id}
              onClick={() => openTicketView(t.id)}
              style={{
                display: 'flex', alignItems: 'flex-start', gap: 8, padding: '7px 6px',
                borderBottom: '1px solid #f1f5f9', cursor: 'pointer', borderRadius: 8,
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#f8faff'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              {/* Type badge pill */}
              <span style={{
                display: 'inline-block', padding: '2px 7px', borderRadius: 6,
                background: (TYPE_BAR_COLOR[t.type] || '#94a3b8') + '22',
                color: TYPE_BAR_COLOR[t.type] || '#94a3b8',
                fontSize: 10, fontWeight: 700, flexShrink: 0, marginTop: 1,
              }}>{t.type ? t.type[0] : '?'}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 3 }}>
                  <span style={{ fontSize: 11, fontWeight: 800, color: '#2563eb', fontFamily: 'monospace', flexShrink: 0 }}>{t.id}</span>
                  <span style={{ fontSize: 12, color: '#334155', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {t.title.length > 28 ? t.title.slice(0, 28) + '…' : t.title}
                  </span>
                </div>
                <span className={`badge ${getStatusClass(t.status)}`} style={{ fontSize: 10 }}>{t.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Custom Dashboards ── */}
      {customDashboards.length > 0 && (
        <div style={{ marginTop: 8 }}>
          <div style={{ fontSize: 17, fontWeight: 900, color: '#1e293b', marginBottom: 16, letterSpacing: '-0.3px' }}>
            Custom Dashboards
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 18 }}>
            {customDashboards.map((d, idx) => {
              const accentColor = CUSTOM_CARD_COLORS[idx % CUSTOM_CARD_COLORS.length]
              const f = filters.find(x => x.id === d.filterId)
              const res = f ? getFilteredTickets(d.filterId) : tickets
              const doneC = res.filter(t => t.status === 'Done').length
              const inprogC = res.filter(t => t.status === 'In Progress').length
              const blockedC = res.filter(t => t.status === 'Blocked').length
              const miniStats = [
                { label: 'Total', value: res.length, color: '#2563eb' },
                { label: 'Done', value: doneC, color: '#10b981' },
                { label: 'In Progress', value: inprogC, color: '#f59e0b' },
                { label: 'Blocked', value: blockedC, color: '#ef4444' }
              ]
              return (
                <div key={d.id} style={{
                  background: '#fff',
                  borderRadius: 14,
                  border: '1px solid rgba(37,99,235,0.10)',
                  boxShadow: '0 4px 24px rgba(59,130,246,0.10)',
                  overflow: 'hidden',
                }}>
                  {/* Gradient top border strip */}
                  <div style={{ height: 4, background: 'linear-gradient(90deg, #2563eb, #7c3aed)' }} />
                  <div style={{ padding: '18px 22px' }}>
                    {/* Header */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
                      <div>
                        <div style={{ fontSize: 15, fontWeight: 800, color: '#1e293b' }}>{d.name}</div>
                        <div style={{ fontSize: 12, color: '#64748b', marginTop: 3 }}>
                          Filter: <span style={{ fontWeight: 700, color: accentColor }}>{f ? f.name : 'All Tickets'}</span>
                          {' · '}{REPORT_LABELS[d.reportType || 'issue-list']}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button
                          onClick={() => openModal('editDashboard', d.id)}
                          style={{ padding: '5px 12px', borderRadius: 8, border: '1.5px solid #e2e8f0', background: '#f8faff', color: '#2563eb', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                          ✏ Edit
                        </button>
                        <button
                          onClick={() => doDeleteDashboard(d.id)}
                          style={{ padding: '5px 10px', borderRadius: 8, border: '1.5px solid #fee2e2', background: '#fff5f5', color: '#ef4444', fontSize: 13, cursor: 'pointer' }}>
                          🗑
                        </button>
                      </div>
                    </div>

                    {/* Mini stat chips */}
                    <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
                      {miniStats.map(ms => (
                        <div key={ms.label} style={{
                          flex: 1, padding: '10px 12px', borderRadius: 10,
                          background: ms.color + '0d', border: `1.5px solid ${ms.color}22`,
                          textAlign: 'center',
                        }}>
                          <div style={{ fontSize: 20, fontWeight: 900, color: ms.color }}>{ms.value}</div>
                          <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600, marginTop: 2 }}>{ms.label}</div>
                        </div>
                      ))}
                    </div>

                    {/* Report */}
                    <DashboardReport d={d} res={res} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
