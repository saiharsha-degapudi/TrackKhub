import React, { useState, useMemo, useCallback } from 'react'
import { useApp } from '../../context/AppContext'
import Avatar from '../common/Avatar'

// ── Constants ──────────────────────────────────────────────────────────────────
const STATUSES = ['To Do', 'In Progress', 'In Review', 'Done', 'Blocked']

const STATUS_COLOR = {
  'To Do': '#6b7280',
  'In Progress': '#2563eb',
  'In Review': '#f59e0b',
  'Done': '#22c55e',
  'Blocked': '#ef4444',
}

const STATUS_BG = {
  'To Do': '#f3f4f6',
  'In Progress': '#eff6ff',
  'In Review': '#fffbeb',
  'Done': '#f0fdf4',
  'Blocked': '#fef2f2',
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

const PROJECT_COLORS = ['#2563eb', '#7c3aed', '#db2777', '#ea580c', '#16a34a', '#0891b2']
const TABS = ['Board', 'List', 'Sprints', 'Reports', 'Settings']

// ── Helpers ────────────────────────────────────────────────────────────────────
function fmt(date) {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
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

function StatusBadge({ status }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '1px 6px', borderRadius: 4,
      background: STATUS_BG[status] || '#f3f4f6',
      color: STATUS_COLOR[status] || '#6b7280',
      fontSize: 11, fontWeight: 500,
    }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: STATUS_COLOR[status] || '#6b7280' }} />
      {status}
    </span>
  )
}

function PriorityDot({ priority }) {
  return (
    <span title={priority} style={{
      display: 'inline-block', width: 6, height: 6, borderRadius: '50%',
      background: PRIORITY_COLOR[priority] || '#9ca3af', flexShrink: 0,
    }} />
  )
}

// ── Board Tab ──────────────────────────────────────────────────────────────────
function BoardCard({ ticket, allTickets, onDragStart, onClick }) {
  const tc = TYPE_CONF[ticket.type] || { bg: '#f3f4f6', color: '#6b7280', char: '?' }
  const assigneeName = ticket.assignee || ''
  const initials = assigneeName ? assigneeName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : '?'

  return (
    <div
      draggable
      onDragStart={e => onDragStart(e, ticket.id)}
      onClick={() => onClick(ticket.id)}
      style={{
        background: '#fff',
        border: '1px solid #e5e7eb',
        borderRadius: 6,
        padding: '10px 12px',
        cursor: 'pointer',
        marginBottom: 6,
        transition: 'box-shadow 0.1s',
      }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.08)'}
      onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 6 }}>
        <TypeBadge type={ticket.type} />
        <PriorityDot priority={ticket.priority} />
        <span style={{ fontSize: 11, fontFamily: 'monospace', color: '#9ca3af', marginLeft: 'auto' }}>
          {ticket.id}
        </span>
      </div>
      <div style={{
        fontSize: 13, fontWeight: 500, color: '#111827', lineHeight: '1.4',
        display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
        marginBottom: 8,
      }}>
        {ticket.title}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <div style={{
          width: 18, height: 18, borderRadius: '50%', background: '#e5e7eb',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 9, fontWeight: 700, color: '#374151', flexShrink: 0,
        }}>
          {initials}
        </div>
        <span style={{ fontSize: 11, color: '#6b7280' }}>{assigneeName || 'Unassigned'}</span>
        {ticket.dueDate && (
          <span style={{ fontSize: 11, color: new Date(ticket.dueDate) < new Date() ? '#ef4444' : '#9ca3af', marginLeft: 'auto' }}>
            {fmt(ticket.dueDate)}
          </span>
        )}
      </div>
    </div>
  )
}

function BoardTab({ tickets, projectId, openTicketView, openModal, doUpdateTicket }) {
  const [draggingId, setDraggingId] = useState(null)
  const [overCol, setOverCol] = useState(null)

  const byStatus = useMemo(() => {
    const map = {}
    STATUSES.forEach(s => { map[s] = [] })
    tickets.forEach(t => {
      if (map[t.status]) map[t.status].push(t)
      else map['To Do'].push(t)
    })
    return map
  }, [tickets])

  const onDragStart = useCallback((e, id) => {
    setDraggingId(id)
    e.dataTransfer.effectAllowed = 'move'
  }, [])

  const onDragOver = useCallback((e, status) => {
    e.preventDefault()
    setOverCol(status)
  }, [])

  const onDrop = useCallback((e, status) => {
    e.preventDefault()
    if (draggingId) doUpdateTicket(draggingId, { status })
    setDraggingId(null)
    setOverCol(null)
  }, [draggingId, doUpdateTicket])

  return (
    <div style={{ display: 'flex', gap: 12, overflowX: 'auto', padding: '16px', height: 'calc(100vh - 96px)', alignItems: 'flex-start' }}>
      {STATUSES.map(status => (
        <div
          key={status}
          onDragOver={e => onDragOver(e, status)}
          onDrop={e => onDrop(e, status)}
          style={{
            minWidth: 240, maxWidth: 240, flexShrink: 0,
            background: overCol === status ? '#f0f9ff' : '#f9fafb',
            border: `1px solid ${overCol === status ? '#bfdbfe' : '#e5e7eb'}`,
            borderRadius: 8, padding: '10px 10px',
            transition: 'border-color 0.15s, background 0.15s',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: STATUS_COLOR[status] }} />
            <span style={{ fontSize: 12, fontWeight: 600, color: '#374151' }}>{status}</span>
            <span style={{
              marginLeft: 4, fontSize: 11, background: '#e5e7eb', color: '#6b7280',
              borderRadius: 10, padding: '1px 6px', fontWeight: 500,
            }}>
              {byStatus[status].length}
            </span>
            <button
              onClick={() => openModal('createTicket')}
              style={{
                marginLeft: 'auto', fontSize: 11, color: '#6b7280', background: 'none',
                border: 'none', cursor: 'pointer', padding: '2px 4px', borderRadius: 3,
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#e5e7eb'; e.currentTarget.style.color = '#111' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#6b7280' }}
            >
              + Add
            </button>
          </div>
          <div style={{ overflowY: 'auto', maxHeight: 'calc(100vh - 180px)' }}>
            {byStatus[status].map(t => (
              <BoardCard
                key={t.id}
                ticket={t}
                allTickets={tickets}
                onDragStart={onDragStart}
                onClick={openTicketView}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

// ── List Tab ───────────────────────────────────────────────────────────────────
function ListTab({ tickets, openTicketView, openModal }) {
  const [sortCol, setSortCol] = useState('created')
  const [sortDir, setSortDir] = useState('desc')

  const sorted = useMemo(() => {
    return [...tickets].sort((a, b) => {
      let av = a[sortCol], bv = b[sortCol]
      if (!av && !bv) return 0
      if (!av) return 1
      if (!bv) return -1
      if (typeof av === 'string') av = av.toLowerCase()
      if (typeof bv === 'string') bv = bv.toLowerCase()
      return sortDir === 'asc' ? (av < bv ? -1 : 1) : (av > bv ? -1 : 1)
    })
  }, [tickets, sortCol, sortDir])

  const toggleSort = col => {
    if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortCol(col); setSortDir('asc') }
  }

  const th = (label, col) => (
    <th
      onClick={() => toggleSort(col)}
      style={{
        padding: '8px 12px', textAlign: 'left', fontSize: 11, fontWeight: 600,
        color: sortCol === col ? '#2563eb' : '#6b7280', cursor: 'pointer',
        borderBottom: '1px solid #e5e7eb', whiteSpace: 'nowrap', userSelect: 'none',
        background: '#f9fafb',
      }}
    >
      {label} {sortCol === col ? (sortDir === 'asc' ? '↑' : '↓') : ''}
    </th>
  )

  return (
    <div style={{ padding: '0 16px 16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0' }}>
        <span style={{ fontSize: 13, color: '#6b7280' }}>{tickets.length} issues</span>
        <button onClick={() => openModal('createTicket')} style={btnStyle}>+ New Issue</button>
      </div>
      <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {th('Type', 'type')}
              {th('ID', 'key')}
              {th('Title', 'title')}
              {th('Priority', 'priority')}
              {th('Status', 'status')}
              {th('Assignee', 'assignee')}
              {th('Sprint', 'sprint')}
              {th('Due', 'dueDate')}
              {th('Created', 'createdAt')}
            </tr>
          </thead>
          <tbody>
            {sorted.map((t, i) => (
              <tr
                key={t.id}
                onClick={() => openTicketView(t.id)}
                style={{
                  cursor: 'pointer',
                  borderBottom: '1px solid #f3f4f6',
                  background: i % 2 === 0 ? '#fff' : '#fafafa',
                  transition: 'background 0.1s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#eff6ff'}
                onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? '#fff' : '#fafafa'}
              >
                <td style={td}><TypeBadge type={t.type} /></td>
                <td style={{ ...td, fontFamily: 'monospace', fontSize: 11, color: '#9ca3af' }}>{t.id}</td>
                <td style={{ ...td, maxWidth: 300 }}>
                  <span style={{ fontSize: 13, color: '#111827', fontWeight: 500 }}>{t.title}</span>
                </td>
                <td style={td}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <PriorityDot priority={t.priority} />
                    <span style={{ fontSize: 12, color: '#374151' }}>{t.priority}</span>
                  </span>
                </td>
                <td style={td}><StatusBadge status={t.status} /></td>
                <td style={{ ...td, fontSize: 12, color: '#374151' }}>{t.assignee || '—'}</td>
                <td style={{ ...td, fontSize: 12, color: '#6b7280' }}>{t.sprint || '—'}</td>
                <td style={{ ...td, fontSize: 12, color: t.dueDate && new Date(t.dueDate) < new Date() ? '#ef4444' : '#6b7280' }}>
                  {fmt(t.dueDate)}
                </td>
                <td style={{ ...td, fontSize: 12, color: '#9ca3af' }}>{fmt(t.created)}</td>
              </tr>
            ))}
            {sorted.length === 0 && (
              <tr>
                <td colSpan={9} style={{ padding: '32px', textAlign: 'center', fontSize: 13, color: '#9ca3af' }}>
                  No issues yet. Create the first one.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ── Sprints Tab ────────────────────────────────────────────────────────────────
function SprintsTab({ sprints, tickets, openModal, doStartSprint, doCompleteSprint }) {
  return (
    <div style={{ padding: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
        <button onClick={() => openModal('createSprint')} style={btnStyle}>+ New Sprint</button>
      </div>
      {sprints.length === 0 && (
        <div style={{ textAlign: 'center', padding: 48, color: '#9ca3af', fontSize: 13 }}>
          No sprints yet. Create your first sprint.
        </div>
      )}
      {sprints.map(sprint => {
        const spTickets = tickets.filter(t => t.sprint === sprint.id || t.sprint === sprint.name)
        const done = spTickets.filter(t => t.status === 'Done').length
        const velocity = sprint.velocity || done

        return (
          <div key={sprint.id} style={{
            background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8,
            padding: '16px', marginBottom: 12,
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>{sprint.name}</span>
                  <span style={{
                    fontSize: 11, padding: '2px 7px', borderRadius: 10, fontWeight: 500,
                    background: sprint.status === 'Active' ? '#dbeafe' : sprint.status === 'Completed' ? '#dcfce7' : '#f3f4f6',
                    color: sprint.status === 'Active' ? '#1d4ed8' : sprint.status === 'Completed' ? '#166534' : '#6b7280',
                  }}>
                    {sprint.status || 'Planned'}
                  </span>
                </div>
                {sprint.goal && <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>{sprint.goal}</div>}
                <div style={{ display: 'flex', gap: 16, fontSize: 12, color: '#9ca3af' }}>
                  {sprint.startDate && <span>{fmt(sprint.startDate)} → {fmt(sprint.endDate)}</span>}
                  <span>{spTickets.length} issues · {done} done · velocity {velocity}</span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                {(!sprint.status || sprint.status === 'Planned') && (
                  <button onClick={() => doStartSprint(sprint.id)} style={btnOutlineStyle}>Start Sprint</button>
                )}
                {sprint.status === 'Active' && (
                  <button onClick={() => doCompleteSprint(sprint.id)} style={btnStyle}>Complete Sprint</button>
                )}
              </div>
            </div>
            {spTickets.length > 0 && (
              <div style={{ borderTop: '1px solid #f3f4f6', paddingTop: 10 }}>
                {spTickets.slice(0, 8).map(t => (
                  <div key={t.id} style={{
                    display: 'flex', alignItems: 'center', gap: 8, padding: '5px 0',
                    borderBottom: '1px solid #f9fafb', fontSize: 12,
                  }}>
                    <TypeBadge type={t.type} />
                    <span style={{ flex: 1, color: '#374151' }}>{t.title}</span>
                    <StatusBadge status={t.status} />
                    <PriorityDot priority={t.priority} />
                  </div>
                ))}
                {spTickets.length > 8 && (
                  <div style={{ fontSize: 12, color: '#9ca3af', paddingTop: 6 }}>
                    +{spTickets.length - 8} more issues
                  </div>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

// ── Reports Tab ────────────────────────────────────────────────────────────────
function BarRow({ label, count, total, color }) {
  const pct = total ? Math.round((count / total) * 100) : 0
  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3, fontSize: 12 }}>
        <span style={{ color: '#374151' }}>{label}</span>
        <span style={{ color: '#6b7280' }}>{count} · {pct}%</span>
      </div>
      <div style={{ height: 6, background: '#f3f4f6', borderRadius: 3 }}>
        <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 3, transition: 'width 0.3s' }} />
      </div>
    </div>
  )
}

function ReportsTab({ tickets, users }) {
  const total = tickets.length

  const byStatus = STATUSES.map(s => ({ label: s, count: tickets.filter(t => t.status === s).length, color: STATUS_COLOR[s] }))
  const priorities = ['Critical', 'High', 'Medium', 'Low']
  const byPriority = priorities.map(p => ({ label: p, count: tickets.filter(t => t.priority === p).length, color: PRIORITY_COLOR[p] }))
  const types = ['Feature', 'Epic', 'Story', 'Task', 'Sub-task', 'Bug']
  const byType = types.map(tp => ({ label: tp, count: tickets.filter(t => t.type === tp).length, color: (TYPE_CONF[tp] || {}).color || '#6b7280' }))

  const open = tickets.filter(t => t.status !== 'Done').length
  const inProg = tickets.filter(t => t.status === 'In Progress').length
  const done = tickets.filter(t => t.status === 'Done').length

  const uniqueAssignees = [...new Set(tickets.map(t => t.assignee).filter(Boolean))]
  const byAssignee = uniqueAssignees.map(a => ({
    name: a,
    count: tickets.filter(t => t.assignee === a).length,
    initials: a.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase(),
  })).sort((a, b) => b.count - a.count)

  const statCards = [
    { label: 'Total Issues', value: total, color: '#2563eb' },
    { label: 'Open', value: open, color: '#6b7280' },
    { label: 'In Progress', value: inProg, color: '#2563eb' },
    { label: 'Done', value: done, color: '#22c55e' },
  ]

  return (
    <div style={{ padding: '16px' }}>
      <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
        {statCards.map(c => (
          <div key={c.label} style={{
            flex: 1, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8,
            padding: '14px 16px',
          }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: c.color }}>{c.value}</div>
            <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>{c.label}</div>
          </div>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <ChartCard title="By Status">
          {byStatus.map(s => <BarRow key={s.label} {...s} total={total} />)}
        </ChartCard>
        <ChartCard title="By Priority">
          {byPriority.map(s => <BarRow key={s.label} {...s} total={total} />)}
        </ChartCard>
        <ChartCard title="By Type">
          {byType.filter(s => s.count > 0).map(s => <BarRow key={s.label} {...s} total={total} />)}
        </ChartCard>
        <ChartCard title="By Assignee">
          {byAssignee.map(a => (
            <div key={a.name} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <div style={{
                width: 22, height: 22, borderRadius: '50%', background: '#e5e7eb',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 9, fontWeight: 700, color: '#374151', flexShrink: 0,
              }}>
                {a.initials}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 3 }}>
                  <span style={{ color: '#374151' }}>{a.name}</span>
                  <span style={{ color: '#6b7280' }}>{a.count}</span>
                </div>
                <div style={{ height: 4, background: '#f3f4f6', borderRadius: 2 }}>
                  <div style={{ height: '100%', width: `${Math.round((a.count / total) * 100)}%`, background: '#2563eb', borderRadius: 2 }} />
                </div>
              </div>
            </div>
          ))}
        </ChartCard>
      </div>
    </div>
  )
}

function ChartCard({ title, children }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: '14px 16px' }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 12 }}>{title}</div>
      {children}
    </div>
  )
}

// ── Settings Tab ───────────────────────────────────────────────────────────────
function SettingsTab({ project, users }) {
  const [form, setForm] = useState({
    name: project.name || '',
    description: project.description || '',
    key: project.key || '',
    lead: project.lead || '',
    color: project.color || PROJECT_COLORS[0],
    status: project.status || 'Active',
  })

  return (
    <div style={{ padding: '16px', maxWidth: 560 }}>
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: '20px', marginBottom: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#111827', marginBottom: 16 }}>Project Settings</div>
        {[
          { label: 'Project Name', key: 'name', type: 'text' },
          { label: 'Description', key: 'description', type: 'textarea' },
          { label: 'Project Key', key: 'key', type: 'text' },
        ].map(field => (
          <div key={field.key} style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#374151', marginBottom: 4 }}>{field.label}</label>
            {field.type === 'textarea' ? (
              <textarea
                value={form[field.key]}
                onChange={e => setForm(f => ({ ...f, [field.key]: e.target.value }))}
                rows={3}
                style={inputStyle}
              />
            ) : (
              <input
                type="text"
                value={form[field.key]}
                onChange={e => setForm(f => ({ ...f, [field.key]: e.target.value }))}
                style={inputStyle}
              />
            )}
          </div>
        ))}
        <div style={{ marginBottom: 14 }}>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#374151', marginBottom: 4 }}>Lead</label>
          <select value={form.lead} onChange={e => setForm(f => ({ ...f, lead: e.target.value }))} style={inputStyle}>
            <option value="">No lead</option>
            {(users || []).map(u => (
              <option key={u.id || u.name} value={u.name || u.id}>{u.name}</option>
            ))}
          </select>
        </div>
        <div style={{ marginBottom: 14 }}>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#374151', marginBottom: 6 }}>Color</label>
          <div style={{ display: 'flex', gap: 8 }}>
            {PROJECT_COLORS.map(c => (
              <div
                key={c}
                onClick={() => setForm(f => ({ ...f, color: c }))}
                style={{
                  width: 24, height: 24, borderRadius: '50%', background: c, cursor: 'pointer',
                  border: form.color === c ? '2px solid #111827' : '2px solid transparent',
                  outline: form.color === c ? '2px solid #fff' : 'none',
                  outlineOffset: -2,
                }}
              />
            ))}
          </div>
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#374151', marginBottom: 4 }}>Status</label>
          <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} style={inputStyle}>
            <option value="Active">Active</option>
            <option value="Archived">Archived</option>
          </select>
        </div>
        <button style={btnStyle}>Save Changes</button>
      </div>
      <div style={{ background: '#fff', border: '1px solid #fca5a5', borderRadius: 8, padding: '20px' }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#dc2626', marginBottom: 8 }}>Danger Zone</div>
        <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 14 }}>These actions are irreversible. Proceed with caution.</div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button style={{ ...btnOutlineStyle, borderColor: '#fca5a5', color: '#dc2626' }}>Archive Project</button>
          <button style={{ ...btnOutlineStyle, borderColor: '#fca5a5', color: '#dc2626', background: '#fef2f2' }}>Delete Project</button>
        </div>
      </div>
    </div>
  )
}

// ── Shared styles ──────────────────────────────────────────────────────────────
const btnStyle = {
  padding: '6px 12px', fontSize: 12, fontWeight: 500,
  background: '#2563eb', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer',
}
const btnOutlineStyle = {
  padding: '5px 11px', fontSize: 12, fontWeight: 500,
  background: '#fff', color: '#374151', border: '1px solid #e5e7eb', borderRadius: 6, cursor: 'pointer',
}
const inputStyle = {
  width: '100%', padding: '7px 10px', fontSize: 13, border: '1px solid #e5e7eb',
  borderRadius: 6, color: '#111827', outline: 'none', boxSizing: 'border-box',
  fontFamily: 'inherit', background: '#fff',
}
const td = { padding: '8px 12px', verticalAlign: 'middle' }

// ── Main Component ─────────────────────────────────────────────────────────────
export default function ProjectDetail() {
  const {
    projects, tickets, sprints, users,
    activeProject, projectTab, setProjectTab,
    nav, openModal, openTicketView,
    doUpdateTicket, doCreateSprint, doStartSprint, doCompleteSprint,
  } = useApp()

  const project = projects.find(p => p.id === activeProject)

  if (!project) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', fontSize: 14, color: '#6b7280' }}>
        Project not found.{' '}
        <button onClick={() => nav('projects')} style={{ ...btnStyle, marginLeft: 12 }}>Back to Projects</button>
      </div>
    )
  }

  const projectTickets = tickets.filter(t => t.project === project.id)
  const projectSprints = sprints.filter(s => s.project === project.id)
  const activeTab = projectTab || 'Board'

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#f9fafb' }}>
      {/* Page Header */}
      <div style={{
        height: 48, background: '#fff', borderBottom: '1px solid #e5e7eb',
        display: 'flex', alignItems: 'center', padding: '0 16px', gap: 12, flexShrink: 0,
      }}>
        <button
          onClick={() => nav('projects')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', padding: '4px', borderRadius: 4, display: 'flex', alignItems: 'center' }}
          onMouseEnter={e => e.currentTarget.style.background = '#f3f4f6'}
          onMouseLeave={e => e.currentTarget.style.background = 'none'}
          title="Back to projects"
        >
          ←
        </button>
        <div style={{ width: 20, height: 20, borderRadius: 4, background: project.color || '#2563eb', flexShrink: 0 }} />
        <span style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>{project.name}</span>
        {project.key && (
          <span style={{
            fontSize: 11, fontFamily: 'monospace', background: '#f3f4f6',
            color: '#6b7280', padding: '2px 6px', borderRadius: 4, fontWeight: 500,
          }}>
            {project.key}
          </span>
        )}
        <div style={{ flex: 1 }} />
        <button onClick={() => openModal('createTicket')} style={btnStyle}>+ New Issue</button>
        <button
          onClick={() => setProjectTab('Settings')}
          style={{ ...btnOutlineStyle, padding: '5px 10px', fontSize: 16, color: '#6b7280' }}
          title="Project Settings"
        >
          ⋯
        </button>
      </div>

      {/* Tabs */}
      <div style={{
        height: 36, background: '#fff', borderBottom: '1px solid #e5e7eb',
        display: 'flex', alignItems: 'flex-end', padding: '0 16px', gap: 0, flexShrink: 0,
      }}>
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setProjectTab(tab)}
            style={{
              padding: '8px 14px', fontSize: 13, fontWeight: activeTab === tab ? 600 : 400,
              color: activeTab === tab ? '#2563eb' : '#6b7280',
              background: 'none', border: 'none', cursor: 'pointer',
              borderBottom: activeTab === tab ? '2px solid #2563eb' : '2px solid transparent',
              transition: 'color 0.1s',
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        {activeTab === 'Board' && (
          <BoardTab
            tickets={projectTickets}
            projectId={project.id}
            openTicketView={openTicketView}
            openModal={openModal}
            doUpdateTicket={doUpdateTicket}
          />
        )}
        {activeTab === 'List' && (
          <ListTab
            tickets={projectTickets}
            openTicketView={openTicketView}
            openModal={openModal}
          />
        )}
        {activeTab === 'Sprints' && (
          <SprintsTab
            sprints={projectSprints}
            tickets={projectTickets}
            openModal={openModal}
            doStartSprint={doStartSprint}
            doCompleteSprint={doCompleteSprint}
          />
        )}
        {activeTab === 'Reports' && (
          <ReportsTab tickets={projectTickets} users={users} />
        )}
        {activeTab === 'Settings' && (
          <SettingsTab project={project} users={users} />
        )}
      </div>
    </div>
  )
}
