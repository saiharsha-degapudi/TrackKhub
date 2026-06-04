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
  const totalBarsW = STATUSES.length * BAR_W
  const gapW = (statusChartWidth => statusChartWidth)(totalBarsW) // placeholder; we'll use % in SVG viewBox

  /* stat card config */
  const statCards = [
    { label: 'Total Tickets', value: total, color: '#1a56db', icon: '📋', extra: null, borderColor: '#1a56db' },
    {
      label: 'Done', value: done, color: '#10b981', icon: '✅',
      extra: total ? (
        <span style={{ display: 'inline-block', marginTop: 6, padding: '2px 10px', borderRadius: 999, background: '#d1fae5', color: '#065f46', fontSize: 11, fontWeight: 600 }}>
          {Math.round(done / total * 100)}% complete
        </span>
      ) : null,
      borderColor: '#10b981'
    },
    { label: 'In Progress', value: inprog, color: '#f59e0b', icon: '⚡', extra: null, borderColor: '#f59e0b' },
    {
      label: 'Blocked', value: blocked, color: '#ef4444', icon: '🚫',
      extra: blocked > 0 ? (
        <span style={{ display: 'inline-block', marginTop: 6, padding: '2px 10px', borderRadius: 999, background: '#fee2e2', color: '#991b1b', fontSize: 11, fontWeight: 600 }}>
          Needs attention
        </span>
      ) : null,
      borderColor: '#ef4444'
    }
  ]

  return (
    <div className="page" style={{ paddingBottom: 40 }}>

      {/* ── Hero Header ── */}
      <div style={{
        background: 'linear-gradient(135deg, #1a56db 0%, #4f46e5 100%)',
        borderRadius: 16,
        padding: '28px 32px',
        marginBottom: 24,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 16
      }}>
        <div>
          <div style={{ fontSize: 26, fontWeight: 800, color: '#fff', letterSpacing: '-0.5px', lineHeight: 1.2 }}>Dashboards</div>
          <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.75)', marginTop: 4 }}>Analytics & KPIs across all projects</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          {filters.filter(f => f.shared).map(f => (
            <button key={f.id}
              title={Object.entries(f.conditions).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`).join(' | ')}
              style={{
                padding: '5px 14px', borderRadius: 999, border: '1.5px solid rgba(255,255,255,0.35)',
                background: 'rgba(255,255,255,0.15)', color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer',
                backdropFilter: 'blur(4px)'
              }}>
              {f.name} ({getFilteredTickets(f.id).length})
            </button>
          ))}
          <button
            onClick={() => openModal('createDashboard')}
            style={{
              padding: '8px 20px', borderRadius: 10, border: 'none',
              background: '#fff', color: '#1a56db', fontSize: 13, fontWeight: 700, cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)', whiteSpace: 'nowrap'
            }}>
            + New Dashboard
          </button>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        {statCards.map(card => (
          <div key={card.label} style={{
            background: '#fff',
            borderRadius: 14,
            border: `1.5px solid #e8edf5`,
            borderLeft: `4px solid ${card.borderColor}`,
            boxShadow: '0 2px 8px rgba(26,86,219,0.10)',
            padding: '18px 20px',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{ position: 'absolute', top: 14, right: 16, fontSize: 20, opacity: 0.85 }}>{card.icon}</div>
            <div style={{ fontSize: 32, fontWeight: 800, color: card.color, lineHeight: 1 }}>{card.value}</div>
            <div style={{ fontSize: 12, color: '#64748b', marginTop: 5, fontWeight: 500 }}>{card.label}</div>
            {card.extra}
          </div>
        ))}
      </div>

      {/* ── Row 2: Status Chart + Team Workload ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>

        {/* SVG Bar Chart */}
        <div style={{ background: '#fff', borderRadius: 14, border: '1.5px solid #e8edf5', boxShadow: '0 2px 8px rgba(26,86,219,0.08)', padding: '20px 24px' }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#1e293b', marginBottom: 16 }}>Tickets by Status</div>
          <svg width="100%" height={CHART_H} viewBox={`0 0 ${STATUSES.length * 80} ${CHART_H}`} preserveAspectRatio="none" style={{ overflow: 'visible' }}>
            {/* grid lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => (
              <line key={i}
                x1={0} y1={CHART_PAD_TOP + (1 - pct) * usableH}
                x2={STATUSES.length * 80} y2={CHART_PAD_TOP + (1 - pct) * usableH}
                stroke="#f1f5f9" strokeWidth={1} />
            ))}
            {STATUSES.map((s, i) => {
              const barH = Math.max(Math.round(byStatus[s] / mx * usableH), 4)
              const x = i * 80 + 16
              const y = CHART_PAD_TOP + usableH - barH
              return (
                <g key={s}>
                  <rect x={x} y={y} width={48} height={barH} rx={4} fill={SC[s]} />
                  <text x={x + 24} y={y - 6} textAnchor="middle" fontSize={13} fontWeight={700} fill="#1e293b">{byStatus[s]}</text>
                  <text x={x + 24} y={CHART_PAD_TOP + usableH + 16} textAnchor="middle" fontSize={10} fill="#94a3b8">{s}</text>
                </g>
              )
            })}
          </svg>
        </div>

        {/* Team Workload */}
        <div style={{ background: '#fff', borderRadius: 14, border: '1.5px solid #e8edf5', boxShadow: '0 2px 8px rgba(26,86,219,0.08)', padding: '20px 24px' }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#1e293b', marginBottom: 16 }}>Team Workload</div>
          {Object.entries(byAssignee).slice(0, 6).map(([name, count]) => {
            const pct = total ? Math.round(count / total * 100) : 0
            return (
              <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <Avatar name={name} size={28} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>{name}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: 11, padding: '1px 8px', borderRadius: 999, background: '#eff6ff', color: '#1a56db', fontWeight: 700 }}>{count}</span>
                      <span style={{ fontSize: 11, color: '#94a3b8', minWidth: 32, textAlign: 'right' }}>{pct}%</span>
                    </div>
                  </div>
                  <div style={{ height: 8, borderRadius: 999, background: '#f1f5f9', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, borderRadius: 999, background: 'linear-gradient(90deg, #1a56db, #6366f1)', transition: 'width 0.4s ease' }} />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Row 3: Issue Type + Projects + Recent Activity ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 20 }}>

        {/* By Issue Type */}
        <div style={{ background: '#fff', borderRadius: 14, border: '1.5px solid #e8edf5', boxShadow: '0 2px 8px rgba(26,86,219,0.08)', padding: '20px 24px' }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#1e293b', marginBottom: 14 }}>By Issue Type</div>
          {ISSUE_TYPES.map(t => {
            const pct = byType[t] ? Math.round(byType[t] / mxT * 100) : 0
            const col = TYPE_BAR_COLOR[t] || '#94a3b8'
            return (
              <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 0', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: col, flexShrink: 0 }} />
                <span style={{ fontSize: 12, fontWeight: 500, color: '#334155', flex: 1 }}>{t}</span>
                <div style={{ width: 80, height: 6, borderRadius: 999, background: '#f1f5f9', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${pct}%`, borderRadius: 999, background: col, transition: 'width 0.4s' }} />
                </div>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#1e293b', minWidth: 20, textAlign: 'right' }}>{byType[t]}</span>
              </div>
            )
          })}
        </div>

        {/* Projects Overview */}
        <div style={{ background: '#fff', borderRadius: 14, border: '1.5px solid #e8edf5', boxShadow: '0 2px 8px rgba(26,86,219,0.08)', padding: '20px 24px' }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#1e293b', marginBottom: 14 }}>Projects Overview</div>
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
                    <span style={{ fontSize: 11, padding: '1px 7px', borderRadius: 999, background: p.color + '1a', color: p.color, fontWeight: 700 }}>{pct}%</span>
                  </div>
                </div>
                <div style={{ height: 6, borderRadius: 999, background: '#f1f5f9', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${pct}%`, borderRadius: 999, background: p.color, transition: 'width 0.4s' }} />
                </div>
              </div>
            )
          })}
        </div>

        {/* Recent Activity */}
        <div style={{ background: '#fff', borderRadius: 14, border: '1.5px solid #e8edf5', boxShadow: '0 2px 8px rgba(26,86,219,0.08)', padding: '20px 24px' }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#1e293b', marginBottom: 14 }}>Recent Activity</div>
          {tks.slice(0, 6).map(t => (
            <div key={t.id}
              onClick={() => openTicketView(t.id)}
              style={{
                display: 'flex', alignItems: 'flex-start', gap: 8, padding: '7px 6px',
                borderBottom: '1px solid #f1f5f9', cursor: 'pointer', borderRadius: 8,
                transition: 'background 0.15s'
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#f8faff'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              <span style={{
                display: 'inline-block', padding: '2px 7px', borderRadius: 6,
                background: (TYPE_BAR_COLOR[t.type] || '#94a3b8') + '22',
                color: TYPE_BAR_COLOR[t.type] || '#94a3b8',
                fontSize: 10, fontWeight: 700, flexShrink: 0, marginTop: 1
              }}>{t.type[0]}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 3 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#1a56db', fontFamily: 'monospace', flexShrink: 0 }}>{t.id}</span>
                  <span style={{ fontSize: 12, color: '#334155', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {t.title.length > 30 ? t.title.slice(0, 30) + '…' : t.title}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span className={`badge ${getStatusClass(t.status)}`} style={{ fontSize: 10 }}>{t.status}</span>
                  <span style={{ fontSize: 10, color: '#94a3b8' }}>just now</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Custom Dashboards ── */}
      {customDashboards.length > 0 && (
        <div style={{ marginTop: 28 }}>
          <div style={{ fontSize: 17, fontWeight: 800, color: '#1e293b', marginBottom: 16, letterSpacing: '-0.3px' }}>Custom Dashboards</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 18 }}>
            {customDashboards.map((d, idx) => {
              const accentColor = CUSTOM_CARD_COLORS[idx % CUSTOM_CARD_COLORS.length]
              const f = filters.find(x => x.id === d.filterId)
              const res = f ? getFilteredTickets(d.filterId) : tickets
              const doneC = res.filter(t => t.status === 'Done').length
              const inprogC = res.filter(t => t.status === 'In Progress').length
              const blockedC = res.filter(t => t.status === 'Blocked').length
              const miniStats = [
                { label: 'Total', value: res.length, color: '#1a56db' },
                { label: 'Done', value: doneC, color: '#10b981' },
                { label: 'In Progress', value: inprogC, color: '#f59e0b' },
                { label: 'Blocked', value: blockedC, color: '#ef4444' }
              ]
              return (
                <div key={d.id} style={{
                  background: '#fff',
                  borderRadius: 14,
                  border: '1.5px solid #e8edf5',
                  boxShadow: '0 2px 12px rgba(26,86,219,0.09)',
                  overflow: 'hidden'
                }}>
                  {/* gradient top border */}
                  <div style={{ height: 4, background: `linear-gradient(90deg, ${accentColor}, ${accentColor}88)` }} />
                  <div style={{ padding: '18px 22px' }}>
                    {/* header */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
                      <div>
                        <div style={{ fontSize: 15, fontWeight: 800, color: '#1e293b' }}>{d.name}</div>
                        <div style={{ fontSize: 12, color: '#64748b', marginTop: 3 }}>
                          Filter: <span style={{ fontWeight: 600, color: accentColor }}>{f ? f.name : 'All Tickets'}</span>
                          {' · '}{REPORT_LABELS[d.reportType || 'issue-list']}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button
                          onClick={() => openModal('editDashboard', d.id)}
                          style={{ padding: '5px 12px', borderRadius: 8, border: '1.5px solid #e2e8f0', background: '#f8faff', color: '#1a56db', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                          ✏ Edit
                        </button>
                        <button
                          onClick={() => doDeleteDashboard(d.id)}
                          style={{ padding: '5px 10px', borderRadius: 8, border: '1.5px solid #fee2e2', background: '#fff5f5', color: '#ef4444', fontSize: 13, cursor: 'pointer' }}>
                          🗑
                        </button>
                      </div>
                    </div>

                    {/* mini stat chips */}
                    <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
                      {miniStats.map(ms => (
                        <div key={ms.label} style={{
                          flex: 1, padding: '10px 12px', borderRadius: 10,
                          background: ms.color + '0d', border: `1.5px solid ${ms.color}22`,
                          textAlign: 'center'
                        }}>
                          <div style={{ fontSize: 20, fontWeight: 800, color: ms.color }}>{ms.value}</div>
                          <div style={{ fontSize: 11, color: '#64748b', fontWeight: 500, marginTop: 2 }}>{ms.label}</div>
                        </div>
                      ))}
                    </div>

                    {/* report */}
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
