import React, { useMemo } from 'react'
import { useApp } from '../../context/AppContext'
import Avatar from '../common/Avatar'

const STATUS_COLORS = {
  'To Do':       '#6b7280',
  'In Progress': '#2563eb',
  'In Review':   '#f59e0b',
  'Done':        '#22c55e',
  'Blocked':     '#ef4444',
}

const PRIORITY_COLORS = {
  Critical: '#ef4444',
  High:     '#f97316',
  Medium:   '#f59e0b',
  Low:      '#22c55e',
}

const TYPE_COLORS = {
  Feature: '#2563eb',
  Bug:     '#ef4444',
  Story:   '#8b5cf6',
  Task:    '#6b7280',
  Epic:    '#f97316',
}

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

function fmtDate(d) {
  if (!d) return '—'
  const dt = new Date(d)
  if (isNaN(dt)) return '—'
  return dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function isOverdue(d) {
  if (!d) return false
  return new Date(d) < new Date()
}

export default function Home() {
  const { user, projects, tickets, sprints, users, openTicketView, openModal } = useApp()

  const myTickets = useMemo(() => {
    if (!user) return []
    return tickets.filter(t => t.assignee === user.id || t.assignee === user.name)
  }, [tickets, user])

  const inProgress = useMemo(() => tickets.filter(t => t.status === 'In Progress').length, [tickets])

  const doneThisWeek = useMemo(() => {
    const now = new Date()
    const weekAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7)
    return tickets.filter(t => t.status === 'Done' && t.updatedAt && new Date(t.updatedAt) >= weekAgo).length
  }, [tickets])

  const activeSprints = useMemo(() => (sprints || []).filter(s => s.status === 'Active'), [sprints])

  const recentProjects = useMemo(() => projects.slice(0, 6), [projects])

  const projectMap = useMemo(() => {
    const m = {}
    projects.forEach(p => { m[p.id] = p })
    return m
  }, [projects])

  const userMap = useMemo(() => {
    const m = {}
    ;(users || []).forEach(u => { m[u.id] = u; m[u.name] = u })
    return m
  }, [users])

  function getSprintProgress(sprint) {
    const sprintTickets = tickets.filter(t => t.sprint === sprint.id || t.sprintId === sprint.id)
    if (!sprintTickets.length) return 0
    const done = sprintTickets.filter(t => t.status === 'Done').length
    return Math.round((done / sprintTickets.length) * 100)
  }

  function getSprintProject(sprint) {
    const p = projects.find(pr => pr.id === sprint.projectId || pr.id === sprint.project)
    return p ? p.name : '—'
  }

  const statCards = [
    { label: 'Total Issues', value: tickets.length, color: '#2563eb' },
    { label: 'In Progress', value: inProgress, color: '#f59e0b' },
    { label: 'Done This Week', value: doneThisWeek, color: '#22c55e' },
    { label: 'Active Sprints', value: activeSprints.length, color: '#8b5cf6' },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#f9fafb' }}>
      {/* Page header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        height: 48, padding: '0 20px', background: '#fff',
        borderBottom: '1px solid #e5e7eb', flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
          <span style={{ fontSize: 16, fontWeight: 600, color: '#111827' }}>Home</span>
          <span style={{ fontSize: 13, color: '#6b7280' }}>
            {greeting()}, {user?.name?.split(' ')[0] || 'there'}
          </span>
        </div>
        <button
          onClick={() => openModal('createTicket')}
          style={{
            height: 30, padding: '0 12px', background: '#2563eb', color: '#fff',
            border: 'none', borderRadius: 6, fontSize: 13, fontWeight: 500,
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4,
          }}
        >
          + Create Issue
        </button>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: 20 }}>
        {/* Stat cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
          {statCards.map(s => (
            <div key={s.label} style={{
              background: '#fff', border: '1px solid #e5e7eb', borderRadius: 6,
              padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 4,
            }}>
              <span style={{ fontSize: 24, fontWeight: 700, color: '#111827', lineHeight: 1 }}>{s.value}</span>
              <span style={{ fontSize: 12, color: '#6b7280' }}>{s.label}</span>
              <div style={{ width: 24, height: 3, background: s.color, borderRadius: 2, marginTop: 4 }} />
            </div>
          ))}
        </div>

        {/* Two-column layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '60% 40%', gap: 12, marginBottom: 20 }}>
          {/* My Issues */}
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 6, overflow: 'hidden' }}>
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '10px 14px', borderBottom: '1px solid #e5e7eb',
            }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>My Issues</span>
              <span style={{ fontSize: 11, color: '#6b7280' }}>{myTickets.length} issues</span>
            </div>
            {myTickets.length === 0 ? (
              <div style={{ padding: '24px 14px', textAlign: 'center', color: '#6b7280', fontSize: 13 }}>
                No issues assigned to you
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                    {['ID', 'Title', 'Priority', 'Status', 'Project', 'Due'].map(col => (
                      <th key={col} style={{
                        padding: '6px 14px', textAlign: 'left', fontSize: 11,
                        fontWeight: 600, color: '#6b7280', whiteSpace: 'nowrap',
                      }}>{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {myTickets.slice(0, 8).map(t => {
                    const proj = projectMap[t.project]
                    const due = t.dueDate || t.due
                    const overdue = isOverdue(due) && t.status !== 'Done'
                    return (
                      <tr
                        key={t.id}
                        onClick={() => openTicketView(t.id)}
                        style={{ borderBottom: '1px solid #f3f4f6', cursor: 'pointer' }}
                        onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'}
                        onMouseLeave={e => e.currentTarget.style.background = ''}
                      >
                        <td style={{ padding: '7px 14px', fontSize: 11, color: '#6b7280', fontFamily: 'monospace', whiteSpace: 'nowrap' }}>
                          {t.id}
                        </td>
                        <td style={{ padding: '7px 14px', fontSize: 13, color: '#111827', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {t.title}
                        </td>
                        <td style={{ padding: '7px 14px', whiteSpace: 'nowrap' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: PRIORITY_COLORS[t.priority] || '#6b7280', flexShrink: 0 }} />
                            <span style={{ fontSize: 12, color: '#374151' }}>{t.priority || '—'}</span>
                          </span>
                        </td>
                        <td style={{ padding: '7px 14px', whiteSpace: 'nowrap' }}>
                          <span style={{
                            fontSize: 11, fontWeight: 500, padding: '2px 7px', borderRadius: 10,
                            background: (STATUS_COLORS[t.status] || '#6b7280') + '18',
                            color: STATUS_COLORS[t.status] || '#6b7280',
                          }}>{t.status || '—'}</span>
                        </td>
                        <td style={{ padding: '7px 14px', fontSize: 12, color: '#6b7280', whiteSpace: 'nowrap' }}>
                          {proj ? proj.key : '—'}
                        </td>
                        <td style={{ padding: '7px 14px', fontSize: 12, color: overdue ? '#ef4444' : '#6b7280', whiteSpace: 'nowrap' }}>
                          {fmtDate(due)}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* Active Sprints */}
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 6, overflow: 'hidden' }}>
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '10px 14px', borderBottom: '1px solid #e5e7eb',
            }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>Active Sprints</span>
              <span style={{ fontSize: 11, color: '#6b7280' }}>{activeSprints.length} active</span>
            </div>
            {activeSprints.length === 0 ? (
              <div style={{ padding: '24px 14px', textAlign: 'center', color: '#6b7280', fontSize: 13 }}>
                No active sprints
              </div>
            ) : (
              <div style={{ padding: '8px 0' }}>
                {activeSprints.map(s => {
                  const pct = getSprintProgress(s)
                  return (
                    <div key={s.id} style={{ padding: '8px 14px', borderBottom: '1px solid #f3f4f6' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ fontSize: 13, fontWeight: 500, color: '#111827' }}>{s.name}</span>
                        <span style={{ fontSize: 11, color: '#6b7280' }}>{pct}%</span>
                      </div>
                      <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 6 }}>
                        {getSprintProject(s)}
                        {s.startDate && s.endDate ? ` · ${fmtDate(s.startDate)} – ${fmtDate(s.endDate)}` : ''}
                      </div>
                      <div style={{ height: 4, background: '#f3f4f6', borderRadius: 2, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${pct}%`, background: '#2563eb', borderRadius: 2, transition: 'width 0.3s' }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Recent Projects */}
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 6, overflow: 'hidden' }}>
          <div style={{ padding: '10px 14px', borderBottom: '1px solid #e5e7eb' }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>Recent Projects</span>
          </div>
          {recentProjects.length === 0 ? (
            <div style={{ padding: '24px 14px', textAlign: 'center', color: '#6b7280', fontSize: 13 }}>
              No projects yet
            </div>
          ) : (
            <div style={{ display: 'flex', gap: 10, padding: 14, overflowX: 'auto' }}>
              {recentProjects.map(p => {
                const count = tickets.filter(t => t.project === p.id).length
                return (
                  <div
                    key={p.id}
                    onClick={() => openModal && null}
                    style={{
                      flexShrink: 0, width: 160, height: 90, background: '#fff',
                      border: '1px solid #e5e7eb', borderRadius: 6, overflow: 'hidden',
                      cursor: 'pointer', display: 'flex',
                    }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = '#2563eb'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = '#e5e7eb'}
                  >
                    <div style={{ width: 4, background: p.color || '#2563eb', flexShrink: 0 }} />
                    <div style={{ flex: 1, padding: '10px 10px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <div>
                        <div style={{ fontSize: 10, fontWeight: 600, color: '#6b7280', letterSpacing: '0.05em', marginBottom: 2 }}>{p.key}</div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: '#111827', lineHeight: 1.3, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{p.name}</div>
                      </div>
                      <div style={{ fontSize: 11, color: '#6b7280' }}>{count} issue{count !== 1 ? 's' : ''}</div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
