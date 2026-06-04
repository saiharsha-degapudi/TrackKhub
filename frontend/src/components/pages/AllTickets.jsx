import React, { useState, useMemo } from 'react'
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

const ISSUE_TYPES = ['Feature', 'Bug', 'Story', 'Task', 'Epic', 'Initiative', 'Sub-task']
const STATUSES = ['To Do', 'In Progress', 'In Review', 'Done', 'Blocked']
const PRIORITIES = ['Critical', 'High', 'Medium', 'Low']

function fmtDate(d) {
  if (!d) return null
  const dt = new Date(d)
  if (isNaN(dt)) return null
  return dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function isOverdue(d) {
  if (!d) return false
  return new Date(d) < new Date()
}

function TypeBadge({ type }) {
  const color = TYPE_COLORS[type] || '#6b7280'
  return (
    <span style={{
      fontSize: 10, fontWeight: 600, padding: '2px 6px', borderRadius: 4,
      background: color + '18', color, letterSpacing: '0.03em', whiteSpace: 'nowrap',
    }}>{type || '—'}</span>
  )
}

function SortIcon({ field, sortField, sortDir }) {
  if (sortField !== field) return <span style={{ color: '#d1d5db', marginLeft: 3 }}>↕</span>
  return <span style={{ color: '#2563eb', marginLeft: 3 }}>{sortDir === 'asc' ? '↑' : '↓'}</span>
}

export default function AllTickets() {
  const {
    tickets, projects, users,
    ticketSearch, typeFilter, statusFilter, projectFilter,
    setTicketSearch, setTypeFilter, setStatusFilter, setProjectFilter,
    openTicketView, openModal,
  } = useApp()

  const [priorityFilter, setPriorityFilter] = useState('All')
  const [assigneeFilter, setAssigneeFilter] = useState('All')
  const [sortField, setSortField] = useState('id')
  const [sortDir, setSortDir] = useState('desc')
  const [groupBy, setGroupBy] = useState('none')
  const [hoveredRow, setHoveredRow] = useState(null)

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

  const allAssignees = useMemo(() => {
    const names = new Set(tickets.map(t => t.assignee).filter(Boolean))
    return Array.from(names)
  }, [tickets])

  const filtered = useMemo(() => {
    let list = tickets
    if (ticketSearch) {
      const q = ticketSearch.toLowerCase()
      list = list.filter(t =>
        t.title?.toLowerCase().includes(q) ||
        String(t.id).toLowerCase().includes(q)
      )
    }
    if (typeFilter !== 'All') list = list.filter(t => t.type === typeFilter)
    if (statusFilter !== 'All') list = list.filter(t => t.status === statusFilter)
    if (projectFilter !== 'All') list = list.filter(t => t.project === parseInt(projectFilter))
    if (priorityFilter !== 'All') list = list.filter(t => t.priority === priorityFilter)
    if (assigneeFilter !== 'All') list = list.filter(t => t.assignee === assigneeFilter)
    return list
  }, [tickets, ticketSearch, typeFilter, statusFilter, projectFilter, priorityFilter, assigneeFilter])

  const sorted = useMemo(() => {
    const s = [...filtered]
    s.sort((a, b) => {
      let av = a[sortField], bv = b[sortField]
      if (sortField === 'id') { av = Number(av); bv = Number(bv) }
      if (av == null) return 1
      if (bv == null) return -1
      const cmp = av < bv ? -1 : av > bv ? 1 : 0
      return sortDir === 'asc' ? cmp : -cmp
    })
    return s
  }, [filtered, sortField, sortDir])

  function handleSort(field) {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortField(field); setSortDir('asc') }
  }

  const hasFilter = ticketSearch || typeFilter !== 'All' || statusFilter !== 'All' ||
    projectFilter !== 'All' || priorityFilter !== 'All' || assigneeFilter !== 'All'

  function clearFilters() {
    setTicketSearch('')
    setTypeFilter('All')
    setStatusFilter('All')
    setProjectFilter('All')
    setPriorityFilter('All')
    setAssigneeFilter('All')
  }

  // Grouping
  const groups = useMemo(() => {
    if (groupBy === 'none') return [{ key: null, label: null, items: sorted }]
    if (groupBy === 'status') {
      const order = ['In Progress', 'To Do', 'In Review', 'Blocked', 'Done']
      const map = {}
      sorted.forEach(t => {
        const k = t.status || 'None'
        if (!map[k]) map[k] = []
        map[k].push(t)
      })
      return [...order, ...Object.keys(map).filter(k => !order.includes(k))]
        .filter(k => map[k]?.length)
        .map(k => ({ key: k, label: k, items: map[k] }))
    }
    if (groupBy === 'project') {
      const map = {}
      sorted.forEach(t => {
        const proj = projectMap[t.project]
        const k = proj ? proj.name : 'No Project'
        if (!map[k]) map[k] = []
        map[k].push(t)
      })
      return Object.entries(map).map(([k, items]) => ({ key: k, label: k, items }))
    }
    return [{ key: null, label: null, items: sorted }]
  }, [sorted, groupBy, projectMap])

  const thStyle = (field) => ({
    padding: '7px 12px', textAlign: 'left', fontSize: 11, fontWeight: 600,
    color: '#6b7280', whiteSpace: 'nowrap', cursor: 'pointer', userSelect: 'none',
    borderBottom: '1px solid #e5e7eb', background: '#f9fafb',
  })

  const selStyle = {
    height: 28, padding: '0 8px', border: '1px solid #e5e7eb', borderRadius: 6,
    fontSize: 12, color: '#374151', background: '#fff', cursor: 'pointer', outline: 'none',
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#f9fafb' }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        height: 48, padding: '0 20px', background: '#fff',
        borderBottom: '1px solid #e5e7eb', flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 16, fontWeight: 600, color: '#111827' }}>All Issues</span>
          <span style={{
            fontSize: 11, fontWeight: 600, padding: '2px 7px', borderRadius: 10,
            background: '#f3f4f6', color: '#6b7280',
          }}>{sorted.length}</span>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <select
            value={groupBy}
            onChange={e => setGroupBy(e.target.value)}
            style={selStyle}
          >
            <option value="none">No grouping</option>
            <option value="status">Group by Status</option>
            <option value="project">Group by Project</option>
          </select>
          <button
            onClick={() => openModal && openModal('createTicket')}
            style={{
              height: 30, padding: '0 12px', background: '#2563eb', color: '#fff',
              border: 'none', borderRadius: 6, fontSize: 13, fontWeight: 500,
              cursor: 'pointer',
            }}
          >+ Create Issue</button>
        </div>
      </div>

      {/* Filter toolbar */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 6, padding: '7px 20px',
        background: '#fff', borderBottom: '1px solid #e5e7eb', flexShrink: 0, flexWrap: 'wrap',
      }}>
        <div style={{ position: 'relative', flex: '0 0 180px' }}>
          <span style={{ position: 'absolute', left: 7, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', fontSize: 13 }}>⌕</span>
          <input
            value={ticketSearch}
            onChange={e => setTicketSearch(e.target.value)}
            placeholder="Search issues…"
            style={{
              width: '100%', height: 28, paddingLeft: 24, paddingRight: 8,
              border: '1px solid #e5e7eb', borderRadius: 6, fontSize: 12,
              color: '#111827', background: '#fff', outline: 'none', boxSizing: 'border-box',
            }}
          />
        </div>

        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} style={selStyle}>
          <option value="All">All Types</option>
          {ISSUE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
        </select>

        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={selStyle}>
          <option value="All">All Statuses</option>
          {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>

        <select value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)} style={selStyle}>
          <option value="All">All Priorities</option>
          {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
        </select>

        <select value={assigneeFilter} onChange={e => setAssigneeFilter(e.target.value)} style={selStyle}>
          <option value="All">All Assignees</option>
          {allAssignees.map(a => <option key={a} value={a}>{a}</option>)}
        </select>

        <select value={projectFilter} onChange={e => setProjectFilter(e.target.value)} style={selStyle}>
          <option value="All">All Projects</option>
          {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>

        {hasFilter && (
          <button
            onClick={clearFilters}
            style={{
              height: 28, padding: '0 10px', background: 'transparent',
              border: '1px solid #e5e7eb', borderRadius: 6, fontSize: 12,
              color: '#6b7280', cursor: 'pointer',
            }}
          >✕ Clear</button>
        )}
      </div>

      {/* Table */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        {sorted.length === 0 ? (
          <div style={{ padding: 60, textAlign: 'center' }}>
            <div style={{ fontSize: 15, color: '#374151', fontWeight: 500, marginBottom: 6 }}>No issues match your filters</div>
            <div style={{ fontSize: 13, color: '#9ca3af', marginBottom: 16 }}>Try adjusting or clearing your filters</div>
            {hasFilter && (
              <button
                onClick={clearFilters}
                style={{
                  height: 30, padding: '0 14px', background: '#fff', border: '1px solid #e5e7eb',
                  borderRadius: 6, fontSize: 13, color: '#374151', cursor: 'pointer',
                }}
              >Clear filters</button>
            )}
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
            <colgroup>
              <col style={{ width: 70 }} />   {/* Type */}
              <col style={{ width: 72 }} />   {/* ID */}
              <col />                          {/* Title - flex */}
              <col style={{ width: 90 }} />   {/* Priority */}
              <col style={{ width: 96 }} />   {/* Status */}
              <col style={{ width: 130 }} />  {/* Assignee */}
              <col style={{ width: 80 }} />   {/* Project */}
              <col style={{ width: 76 }} />   {/* Due */}
              <col style={{ width: 76 }} />   {/* Created */}
            </colgroup>
            <thead>
              <tr>
                <th style={thStyle('type')} onClick={() => handleSort('type')}>Type <SortIcon field="type" sortField={sortField} sortDir={sortDir} /></th>
                <th style={thStyle('id')} onClick={() => handleSort('id')}>ID <SortIcon field="id" sortField={sortField} sortDir={sortDir} /></th>
                <th style={thStyle('title')} onClick={() => handleSort('title')}>Title <SortIcon field="title" sortField={sortField} sortDir={sortDir} /></th>
                <th style={thStyle('priority')} onClick={() => handleSort('priority')}>Priority <SortIcon field="priority" sortField={sortField} sortDir={sortDir} /></th>
                <th style={thStyle('status')} onClick={() => handleSort('status')}>Status <SortIcon field="status" sortField={sortField} sortDir={sortDir} /></th>
                <th style={thStyle('assignee')} onClick={() => handleSort('assignee')}>Assignee <SortIcon field="assignee" sortField={sortField} sortDir={sortDir} /></th>
                <th style={thStyle('project')}>Project</th>
                <th style={thStyle('dueDate')} onClick={() => handleSort('dueDate')}>Due <SortIcon field="dueDate" sortField={sortField} sortDir={sortDir} /></th>
                <th style={thStyle('createdAt')} onClick={() => handleSort('createdAt')}>Created <SortIcon field="createdAt" sortField={sortField} sortDir={sortDir} /></th>
              </tr>
            </thead>
            <tbody>
              {groups.map(group => (
                <React.Fragment key={group.key || '__all'}>
                  {group.label && (
                    <tr>
                      <td colSpan={9} style={{
                        padding: '10px 12px 4px', fontSize: 11, fontWeight: 700,
                        color: '#374151', letterSpacing: '0.05em', textTransform: 'uppercase',
                        background: '#f9fafb', borderBottom: '1px solid #e5e7eb',
                        borderTop: '1px solid #e5e7eb',
                      }}>
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: 6,
                        }}>
                          {STATUS_COLORS[group.label] && (
                            <span style={{ width: 8, height: 8, borderRadius: '50%', background: STATUS_COLORS[group.label] }} />
                          )}
                          {group.label}
                          <span style={{ fontWeight: 400, color: '#9ca3af', textTransform: 'none', letterSpacing: 0 }}>
                            {group.items.length}
                          </span>
                        </span>
                      </td>
                    </tr>
                  )}
                  {group.items.map(t => {
                    const proj = projectMap[t.project]
                    const assigneeName = t.assignee || null
                    const due = t.dueDate || t.due
                    const overdue = isOverdue(due) && t.status !== 'Done'
                    const dueFmt = fmtDate(due)
                    const createdFmt = fmtDate(t.createdAt)
                    const isHovered = hoveredRow === t.id
                    return (
                      <tr
                        key={t.id}
                        onMouseEnter={() => setHoveredRow(t.id)}
                        onMouseLeave={() => setHoveredRow(null)}
                        style={{
                          borderBottom: '1px solid #f3f4f6',
                          background: isHovered ? '#f9fafb' : '#fff',
                        }}
                      >
                        {/* Type */}
                        <td style={{ padding: '7px 12px' }}>
                          <TypeBadge type={t.type} />
                        </td>

                        {/* ID */}
                        <td style={{ padding: '7px 12px' }}>
                          <span style={{ fontSize: 11, color: '#9ca3af', fontFamily: 'monospace' }}>
                            {proj ? `${proj.key}-${t.id}` : `#${t.id}`}
                          </span>
                        </td>

                        {/* Title */}
                        <td style={{ padding: '7px 12px', overflow: 'hidden' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <button
                              onClick={() => openTicketView(t.id)}
                              style={{
                                background: 'none', border: 'none', padding: 0,
                                fontSize: 13, color: '#111827', cursor: 'pointer',
                                textAlign: 'left', overflow: 'hidden', textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap', fontFamily: 'inherit', width: '100%',
                              }}
                              title={t.title}
                            >
                              {t.title}
                            </button>
                            {isHovered && (
                              <button
                                onClick={() => openTicketView(t.id)}
                                style={{
                                  flexShrink: 0, width: 22, height: 22, border: '1px solid #e5e7eb',
                                  borderRadius: 4, background: '#fff', cursor: 'pointer',
                                  fontSize: 11, color: '#6b7280', display: 'flex',
                                  alignItems: 'center', justifyContent: 'center',
                                }}
                                title="Edit"
                              >✎</button>
                            )}
                          </div>
                        </td>

                        {/* Priority */}
                        <td style={{ padding: '7px 12px' }}>
                          {t.priority ? (
                            <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                              <span style={{
                                width: 6, height: 6, borderRadius: '50%',
                                background: PRIORITY_COLORS[t.priority] || '#6b7280', flexShrink: 0,
                              }} />
                              <span style={{ fontSize: 12, color: '#374151' }}>{t.priority}</span>
                            </span>
                          ) : (
                            <span style={{ fontSize: 12, color: '#d1d5db' }}>—</span>
                          )}
                        </td>

                        {/* Status */}
                        <td style={{ padding: '7px 12px' }}>
                          <span style={{
                            fontSize: 11, fontWeight: 500, padding: '2px 7px', borderRadius: 10,
                            background: (STATUS_COLORS[t.status] || '#6b7280') + '18',
                            color: STATUS_COLORS[t.status] || '#6b7280',
                            whiteSpace: 'nowrap',
                          }}>{t.status || '—'}</span>
                        </td>

                        {/* Assignee */}
                        <td style={{ padding: '7px 12px' }}>
                          {assigneeName ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <Avatar name={assigneeName} size={20} />
                              <span style={{ fontSize: 12, color: '#374151', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {assigneeName}
                              </span>
                            </div>
                          ) : (
                            <span style={{ fontSize: 12, color: '#d1d5db' }}>Unassigned</span>
                          )}
                        </td>

                        {/* Project */}
                        <td style={{ padding: '7px 12px' }}>
                          {proj ? (
                            <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                              <span style={{ width: 6, height: 6, borderRadius: '50%', background: proj.color || '#2563eb', flexShrink: 0 }} />
                              <span style={{ fontSize: 11, color: '#6b7280', fontWeight: 600, letterSpacing: '0.03em' }}>{proj.key}</span>
                            </span>
                          ) : (
                            <span style={{ fontSize: 12, color: '#d1d5db' }}>—</span>
                          )}
                        </td>

                        {/* Due */}
                        <td style={{ padding: '7px 12px' }}>
                          {dueFmt ? (
                            <span style={{ fontSize: 12, color: overdue ? '#ef4444' : '#6b7280', fontWeight: overdue ? 600 : 400 }}>
                              {dueFmt}
                            </span>
                          ) : (
                            <span style={{ fontSize: 12, color: '#d1d5db' }}>—</span>
                          )}
                        </td>

                        {/* Created */}
                        <td style={{ padding: '7px 12px' }}>
                          <span style={{ fontSize: 12, color: '#9ca3af' }}>{createdFmt || '—'}</span>
                        </td>
                      </tr>
                    )
                  })}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Footer */}
      <div style={{
        padding: '6px 20px', background: '#fff', borderTop: '1px solid #e5e7eb',
        fontSize: 12, color: '#9ca3af', flexShrink: 0,
      }}>
        {sorted.length} of {tickets.length} issues
        {hasFilter && <span> · <button onClick={clearFilters} style={{ background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', fontSize: 12, padding: 0 }}>Clear filters</button></span>}
      </div>
    </div>
  )
}
