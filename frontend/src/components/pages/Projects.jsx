import React, { useState, useMemo } from 'react'
import { useApp } from '../../context/AppContext'
import Avatar from '../common/Avatar'

const STATUS_COLORS = {
  'Active':    '#22c55e',
  'Inactive':  '#6b7280',
  'Archived':  '#9ca3af',
  'Planning':  '#f59e0b',
}

function fmtDate(d) {
  if (!d) return '—'
  const dt = new Date(d)
  if (isNaN(dt)) return '—'
  return dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function Projects() {
  const { projects, tickets, users, openProject, openModal } = useApp()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [view, setView] = useState('grid')

  const userMap = useMemo(() => {
    const m = {}
    ;(users || []).forEach(u => { m[u.id] = u; m[u.name] = u })
    return m
  }, [users])

  const filtered = useMemo(() => {
    let list = projects
    if (search) {
      const q = search.toLowerCase()
      list = list.filter(p => p.name?.toLowerCase().includes(q) || p.key?.toLowerCase().includes(q))
    }
    if (statusFilter !== 'All') list = list.filter(p => (p.status || 'Active') === statusFilter)
    return list
  }, [projects, search, statusFilter])

  const ticketCountByProject = useMemo(() => {
    const m = {}
    tickets.forEach(t => { m[t.project] = (m[t.project] || 0) + 1 })
    return m
  }, [tickets])

  const openIssuesByProject = useMemo(() => {
    const m = {}
    tickets.filter(t => t.status !== 'Done').forEach(t => { m[t.project] = (m[t.project] || 0) + 1 })
    return m
  }, [tickets])

  const statuses = ['All', ...Array.from(new Set(projects.map(p => p.status || 'Active')))]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#f9fafb' }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        height: 48, padding: '0 20px', background: '#fff',
        borderBottom: '1px solid #e5e7eb', flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 16, fontWeight: 600, color: '#111827' }}>Projects</span>
          <span style={{
            fontSize: 11, fontWeight: 600, padding: '2px 7px', borderRadius: 10,
            background: '#f3f4f6', color: '#6b7280',
          }}>{projects.length}</span>
        </div>
        <button
          onClick={() => openModal('createProject')}
          style={{
            height: 30, padding: '0 12px', background: '#2563eb', color: '#fff',
            border: 'none', borderRadius: 6, fontSize: 13, fontWeight: 500,
            cursor: 'pointer',
          }}
        >
          + New Project
        </button>
      </div>

      {/* Toolbar */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8, padding: '8px 20px',
        background: '#fff', borderBottom: '1px solid #e5e7eb', flexShrink: 0,
      }}>
        <div style={{ position: 'relative', flex: '0 0 220px' }}>
          <span style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', fontSize: 13 }}>⌕</span>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search projects…"
            style={{
              width: '100%', height: 30, paddingLeft: 26, paddingRight: 8,
              border: '1px solid #e5e7eb', borderRadius: 6, fontSize: 13,
              color: '#111827', background: '#f9fafb', outline: 'none', boxSizing: 'border-box',
            }}
          />
        </div>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          style={{
            height: 30, padding: '0 8px', border: '1px solid #e5e7eb', borderRadius: 6,
            fontSize: 13, color: '#374151', background: '#f9fafb', cursor: 'pointer', outline: 'none',
          }}
        >
          {statuses.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 2 }}>
          {[['grid', '⊞'], ['list', '≡']].map(([v, icon]) => (
            <button
              key={v}
              onClick={() => setView(v)}
              style={{
                width: 30, height: 30, border: '1px solid #e5e7eb', borderRadius: 6,
                background: view === v ? '#f3f4f6' : '#fff', cursor: 'pointer',
                fontSize: 15, color: view === v ? '#111827' : '#9ca3af',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >{icon}</button>
          ))}
        </div>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: 20 }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#6b7280', fontSize: 13, padding: 48 }}>
            No projects match your filters
          </div>
        ) : view === 'grid' ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            {filtered.map(p => {
              const lead = userMap[p.lead] || userMap[p.leadId] || null
              const leadName = lead?.name || p.lead || '—'
              const count = ticketCountByProject[p.id] || 0
              const open = openIssuesByProject[p.id] || 0
              const status = p.status || 'Active'
              const statusColor = STATUS_COLORS[status] || '#6b7280'
              return (
                <div
                  key={p.id}
                  style={{
                    background: '#fff', border: '1px solid #e5e7eb', borderRadius: 6,
                    overflow: 'hidden', cursor: 'pointer', display: 'flex', flexDirection: 'column',
                    borderLeft: `4px solid ${p.color || '#2563eb'}`,
                  }}
                  onMouseEnter={e => e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)'}
                  onMouseLeave={e => e.currentTarget.style.boxShadow = ''}
                >
                  <div style={{ padding: '12px 14px 0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{
                        fontSize: 10, fontWeight: 700, letterSpacing: '0.06em',
                        color: '#6b7280', background: '#f3f4f6', padding: '2px 6px', borderRadius: 4,
                      }}>{p.key}</span>
                      <span style={{
                        fontSize: 11, fontWeight: 500, padding: '2px 7px', borderRadius: 10,
                        background: statusColor + '18', color: statusColor,
                      }}>{status}</span>
                    </div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: '#111827', marginBottom: 4 }}>{p.name}</div>
                    <div style={{
                      fontSize: 12, color: '#6b7280', lineHeight: 1.5, marginBottom: 10,
                      overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                      minHeight: 36,
                    }}>
                      {p.description || 'No description'}
                    </div>
                    <div style={{ display: 'flex', gap: 14, fontSize: 12, color: '#6b7280', marginBottom: 10 }}>
                      <span>{count} issues</span>
                      <span>{open} open</span>
                    </div>
                  </div>
                  <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '8px 14px', borderTop: '1px solid #f3f4f6', marginTop: 'auto',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Avatar name={leadName} size={20} />
                      <span style={{ fontSize: 12, color: '#374151' }}>{leadName}</span>
                    </div>
                    <button
                      onClick={() => openProject(p.id)}
                      style={{
                        height: 26, padding: '0 10px', background: 'transparent',
                        border: '1px solid #e5e7eb', borderRadius: 5, fontSize: 12,
                        color: '#2563eb', cursor: 'pointer', fontWeight: 500,
                      }}
                    >View →</button>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          /* List view */
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 6, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #e5e7eb', background: '#f9fafb' }}>
                  {['Key', 'Name', 'Lead', 'Status', 'Issues', 'Created', 'Actions'].map(col => (
                    <th key={col} style={{
                      padding: '8px 14px', textAlign: 'left', fontSize: 11,
                      fontWeight: 600, color: '#6b7280', whiteSpace: 'nowrap',
                    }}>{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => {
                  const lead = userMap[p.lead] || userMap[p.leadId] || null
                  const leadName = lead?.name || p.lead || '—'
                  const count = ticketCountByProject[p.id] || 0
                  const status = p.status || 'Active'
                  const statusColor = STATUS_COLORS[status] || '#6b7280'
                  return (
                    <tr
                      key={p.id}
                      style={{ borderBottom: '1px solid #f3f4f6', cursor: 'pointer' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'}
                      onMouseLeave={e => e.currentTarget.style.background = ''}
                      onClick={() => openProject(p.id)}
                    >
                      <td style={{ padding: '8px 14px' }}>
                        <span style={{
                          fontSize: 11, fontWeight: 700, letterSpacing: '0.05em',
                          color: '#6b7280', background: '#f3f4f6', padding: '2px 6px', borderRadius: 4,
                        }}>{p.key}</span>
                      </td>
                      <td style={{ padding: '8px 14px', fontSize: 13, fontWeight: 500, color: '#111827' }}>
                        <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: p.color || '#2563eb', marginRight: 8 }} />
                        {p.name}
                      </td>
                      <td style={{ padding: '8px 14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <Avatar name={leadName} size={20} />
                          <span style={{ fontSize: 12, color: '#374151' }}>{leadName}</span>
                        </div>
                      </td>
                      <td style={{ padding: '8px 14px' }}>
                        <span style={{
                          fontSize: 11, fontWeight: 500, padding: '2px 7px', borderRadius: 10,
                          background: statusColor + '18', color: statusColor,
                        }}>{status}</span>
                      </td>
                      <td style={{ padding: '8px 14px', fontSize: 13, color: '#374151' }}>{count}</td>
                      <td style={{ padding: '8px 14px', fontSize: 12, color: '#6b7280' }}>{fmtDate(p.created)}</td>
                      <td style={{ padding: '8px 14px' }} onClick={e => e.stopPropagation()}>
                        <button
                          onClick={() => openProject(p.id)}
                          style={{
                            height: 26, padding: '0 10px', background: 'transparent',
                            border: '1px solid #e5e7eb', borderRadius: 5, fontSize: 12,
                            color: '#2563eb', cursor: 'pointer',
                          }}
                        >View</button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
