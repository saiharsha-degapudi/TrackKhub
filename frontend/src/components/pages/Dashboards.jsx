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

const SC = { 'To Do': '#94a3b8', 'In Progress': '#1a56db', 'In Review': '#ca8a04', Done: '#16a34a', Blocked: '#dc2626' }
const PC = { Critical: '#dc2626', High: '#ea580c', Medium: '#ca8a04', Low: '#16a34a' }
const TC = { Feature: '#1a56db', Initiative: '#7c3aed', Epic: '#9333ea', Story: '#16a34a', Task: '#ca8a04', 'Sub-task': '#ea580c' }

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

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="page-title">Dashboards</div>
          <div className="page-sub">All project analytics & KPIs</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          {filters.filter(f => f.shared).map(f => (
            <button key={f.id} className="filter-chip"
              title={Object.entries(f.conditions).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`).join(' | ')}>
              {f.name} ({getFilteredTickets(f.id).length})
            </button>
          ))}
          <button className="btn btn-primary btn-sm" onClick={() => openModal('createDashboard')}>+ New Dashboard</button>
        </div>
      </div>

      <div className="grid-4" style={{ marginBottom: 20 }}>
        <div className="stat-card"><div className="stat-val">{total}</div><div className="stat-label">Total Tickets</div></div>
        <div className="stat-card">
          <div className="stat-val" style={{ color: 'var(--green)' }}>{done}</div>
          <div className="stat-label">Done</div>
          <div className="stat-delta delta-up">↑ {total ? Math.round(done / total * 100) : 0}%</div>
        </div>
        <div className="stat-card"><div className="stat-val" style={{ color: 'var(--blue)' }}>{inprog}</div><div className="stat-label">In Progress</div></div>
        <div className="stat-card">
          <div className="stat-val" style={{ color: 'var(--red)' }}>{blocked}</div>
          <div className="stat-label">Blocked</div>
          {blocked > 0 && <div className="stat-delta delta-down">Needs attention</div>}
        </div>
      </div>

      <div className="grid-2" style={{ marginBottom: 20 }}>
        <div className="card">
          <div className="card-title">Tickets by Status</div>
          <div className="bar-chart" style={{ height: 130 }}>
            {STATUSES.map(s => (
              <div key={s} className="bar-wrap">
                <div className="bar-val">{byStatus[s]}</div>
                <div className="bar" style={{
                  height: Math.round(byStatus[s] / mx * 90) + 10,
                  background: s === 'Done' ? 'var(--green)' : s === 'Blocked' ? 'var(--red)' : s === 'In Progress' ? 'var(--blue)' : 'var(--gray-300)'
                }} />
                <div className="bar-label" style={{ fontSize: 9 }}>{s}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="card">
          <div className="card-title">Team Workload</div>
          {Object.entries(byAssignee).slice(0, 5).map(([name, count]) => (
            <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 9 }}>
              <Avatar name={name} size={26} />
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 3 }}>
                  <span>{name}</span><span style={{ fontWeight: 700 }}>{count}</span>
                </div>
                <div className="progress-bar"><div className="progress-fill" style={{ width: `${Math.round(count / total * 100)}%` }} /></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid-3">
        <div className="card">
          <div className="card-title">By Issue Type</div>
          {ISSUE_TYPES.map(t => (
            <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 0', borderBottom: '1px solid var(--gray-100)' }}>
              <span className={`badge ${getTypeColor(t)}`} style={{ width: 80, justifyContent: 'center' }}>{t}</span>
              <div style={{ flex: 1 }}>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${byType[t] ? Math.round(byType[t] / mxT * 100) : 0}%` }} />
                </div>
              </div>
              <span style={{ fontSize: 12, fontWeight: 700, minWidth: 20 }}>{byType[t]}</span>
            </div>
          ))}
        </div>
        <div className="card">
          <div className="card-title">Projects Overview</div>
          {projects.map(p => {
            const pt = tks.filter(t => t.project === p.id)
            const pd = pt.filter(t => t.status === 'Done').length
            return (
              <div key={p.id} style={{ padding: '8px 0', borderBottom: '1px solid var(--gray-100)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: p.color }} />
                    <span style={{ fontSize: 13, fontWeight: 600 }}>{p.name}</span>
                  </div>
                  <span style={{ fontSize: 11, color: 'var(--gray-400)' }}>{pd}/{pt.length}</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${pt.length ? Math.round(pd / pt.length * 100) : 0}%`, background: p.color }} />
                </div>
              </div>
            )
          })}
        </div>
        <div className="card">
          <div className="card-title">Recent Activity</div>
          {tks.slice(0, 6).map(t => (
            <div key={t.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 7, padding: '6px 0', borderBottom: '1px solid var(--gray-100)' }}>
              <span className={`badge ${getTypeColor(t.type)}`} style={{ fontSize: 10, marginTop: 1 }}>{t.type[0]}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 600 }}>{t.id}: {t.title.slice(0, 36)}{t.title.length > 36 ? '...' : ''}</div>
                <div style={{ fontSize: 11, color: 'var(--gray-400)' }}>
                  {t.updated} · <span className={`badge ${getStatusClass(t.status)}`} style={{ fontSize: 10 }}>{t.status}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {customDashboards.length > 0 && (
        <div style={{ marginTop: 24 }}>
          <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 14 }}>Custom Dashboards</div>
          <div className="grid-2">
            {customDashboards.map(d => {
              const f = filters.find(x => x.id === d.filterId)
              const res = f ? getFilteredTickets(d.filterId) : tickets
              const doneC = res.filter(t => t.status === 'Done').length
              const inprogC = res.filter(t => t.status === 'In Progress').length
              const blockedC = res.filter(t => t.status === 'Blocked').length
              return (
                <div key={d.id} className="card">
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 700 }}>{d.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--gray-500)', marginTop: 2 }}>
                        Filter: {f ? f.name : 'All Tickets'} · {REPORT_LABELS[d.reportType || 'issue-list']}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button className="btn btn-outline btn-sm" onClick={() => openModal('editDashboard', d.id)}>✏ Edit Report</button>
                      <button className="btn btn-ghost btn-sm" onClick={() => doDeleteDashboard(d.id)}>🗑</button>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                    {[['Total', res.length, 'var(--blue)'], ['Done', doneC, 'var(--green)'], ['In Progress', inprogC, 'var(--blue)'], ['Blocked', blockedC, 'var(--red)']].map(([label, val, color]) => (
                      <div key={label} className="stat-card" style={{ flex: 1, padding: '10px 12px' }}>
                        <div style={{ fontSize: 20, fontWeight: 700, color }}>{val}</div>
                        <div style={{ fontSize: 11, color: 'var(--gray-500)' }}>{label}</div>
                      </div>
                    ))}
                  </div>
                  <DashboardReport d={d} res={res} />
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
