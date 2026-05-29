import React, { useState, useCallback } from 'react'
import { useApp } from '../../context/AppContext'
import Avatar from '../common/Avatar'
import { getTypeColor, getStatusClass, priorityClass } from '../common/Badge'
import Roadmap from '../Roadmap'

const STATUSES     = ['To Do', 'In Progress', 'In Review', 'Done', 'Blocked']
const ISSUE_TYPES  = ['Feature', 'Initiative', 'Epic', 'Story', 'Task', 'Sub-task']
const PRIORITIES   = ['Critical', 'High', 'Medium', 'Low']
const SPRINT_COLS  = ['To Do', 'In Progress', 'In Review', 'Done']
const KANBAN_COLS  = ['To Do', 'In Progress', 'In Review', 'Done', 'Blocked']

const COL_COLORS = {
  'To Do':       '#64748b',
  'In Progress': '#f59e0b',
  'In Review':   '#8b5cf6',
  'Done':        '#10b981',
  'Blocked':     '#ef4444',
}
const COL_ICONS = {
  'To Do':       '📋',
  'In Progress': '⚡',
  'In Review':   '👁',
  'Done':        '✅',
  'Blocked':     '🚫',
}

// ── Shared draggable card ─────────────────────────────────────────────────────
function TicketCard({ ticket, onDragStart, onClick }) {
  return (
    <div
      className="kanban-card"
      draggable
      onDragStart={e => onDragStart(e, ticket.id)}
      onClick={() => onClick(ticket.id)}
      style={{ cursor: 'grab', borderLeft: `3px solid ${COL_COLORS[ticket.status] || '#64748b'}60` }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5 }}>
        <span style={{ fontSize: 10, color: '#6b7280', fontWeight: 600 }}>{ticket.id}</span>
        <span className={`badge ${getTypeColor(ticket.type)}`} style={{ fontSize: 9 }}>{ticket.type}</span>
      </div>
      <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)', marginBottom: 8, lineHeight: 1.4 }}>
        {ticket.title}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span className={priorityClass(ticket.priority)} style={{ fontSize: 10 }}>{ticket.priority}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {ticket.dueDate && <span style={{ fontSize: 9, color: '#9ca3af' }}>{ticket.dueDate}</span>}
          <Avatar name={ticket.assignee} size={22} />
        </div>
      </div>
    </div>
  )
}

// ── Drop column wrapper ───────────────────────────────────────────────────────
function DropColumn({ status, cards, onDrop, onDragStart, openTicketView, openModal, isOver, onDragOver, onDragLeave }) {
  return (
    <div
      className="kanban-col"
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={e => onDrop(e, status)}
      style={{
        outline: isOver ? `2px dashed ${COL_COLORS[status]}` : 'none',
        background: isOver ? `${COL_COLORS[status]}08` : undefined,
        transition: 'background .15s, outline .15s',
        borderRadius: 8,
      }}
    >
      <div className="kanban-col-header" style={{ borderBottom: `3px solid ${COL_COLORS[status]}25` }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          {COL_ICONS[status]} {status}
        </span>
        <span style={{ background: COL_COLORS[status], color: '#fff', borderRadius: 10, padding: '1px 7px', fontSize: 10, fontWeight: 700 }}>
          {cards.length}
        </span>
      </div>
      <div className="kanban-col-body">
        {cards.map(t => (
          <TicketCard key={t.id} ticket={t} onDragStart={onDragStart} onClick={openTicketView} />
        ))}
        {cards.length === 0 && (
          <div style={{
            border: '2px dashed var(--gray-200)', borderRadius: 8,
            padding: '20px 10px', textAlign: 'center',
            fontSize: 11, color: 'var(--gray-400)', margin: '4px 0'
          }}>
            {isOver ? '📥 Drop here' : 'No issues'}
          </div>
        )}
        <div
          style={{ textAlign: 'center', padding: '8px 0', fontSize: 11, color: 'var(--gray-400)', cursor: 'pointer', marginTop: 4 }}
          onClick={() => openModal('createTicket')}
        >
          + Add issue
        </div>
      </div>
    </div>
  )
}

// ── Kanban Board (continuous flow, all tickets) ───────────────────────────────
function KanbanBoard({ pid, tickets, openModal, openTicketView }) {
  const { doUpdateTicket } = useApp()
  const projectTickets = tickets.filter(t => t.project === pid)
  const [dragOver, setDragOver] = useState(null)

  const handleDragStart = useCallback((e, ticketId) => {
    e.dataTransfer.setData('ticketId', ticketId)
    e.dataTransfer.effectAllowed = 'move'
  }, [])

  const handleDragOver = useCallback((e, status) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOver(status)
  }, [])

  const handleDragLeave = useCallback(() => setDragOver(null), [])

  const handleDrop = useCallback(async (e, status) => {
    e.preventDefault()
    const id = e.dataTransfer.getData('ticketId')
    setDragOver(null)
    if (!id) return
    const ticket = tickets.find(t => t.id === id)
    if (ticket && ticket.status !== status) {
      await doUpdateTicket(id, { status })
    }
  }, [tickets, doUpdateTicket])

  return (
    <div>
      {/* Kanban info bar */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16,
        padding: '10px 16px', background: '#f8fafc', border: '1px solid var(--gray-200)',
        borderRadius: 8, flexWrap: 'wrap'
      }}>
        <span style={{ fontWeight: 700, fontSize: 13, color: '#374151' }}>📊 Kanban — Continuous Flow</span>
        <span style={{ fontSize: 12, color: '#6b7280' }}>Drag cards between columns to update status</span>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 12, fontSize: 12, flexWrap: 'wrap' }}>
          {KANBAN_COLS.map(s => (
            <span key={s} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: COL_COLORS[s], display: 'inline-block' }} />
              {projectTickets.filter(t => t.status === s).length}
            </span>
          ))}
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => openModal('createTicket')}>+ Add Issue</button>
      </div>

      {/* Columns */}
      <div className="kanban-board">
        {KANBAN_COLS.map(status => (
          <DropColumn
            key={status}
            status={status}
            cards={projectTickets.filter(t => t.status === status)}
            isOver={dragOver === status}
            onDragStart={handleDragStart}
            onDragOver={e => handleDragOver(e, status)}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            openTicketView={openTicketView}
            openModal={openModal}
          />
        ))}
      </div>
    </div>
  )
}

// ── Scrum / Sprint Board ──────────────────────────────────────────────────────
function SprintBoard({ pid, tickets, openModal, openTicketView }) {
  const { doUpdateTicket } = useApp()
  const projectTickets = tickets.filter(t => t.project === pid)

  const sprints = [...new Set(projectTickets.map(t => t.sprint).filter(Boolean))].sort()
  const [activeSprint, setActiveSprint] = useState(sprints[sprints.length - 1] || 'Sprint 1')
  const [dragOver, setDragOver] = useState(null)

  const sprintTickets  = projectTickets.filter(t => t.sprint === activeSprint)
  const backlogTickets = projectTickets.filter(t => !t.sprint)
  const blockedTickets = sprintTickets.filter(t => t.status === 'Blocked')

  const total    = sprintTickets.length
  const done     = sprintTickets.filter(t => t.status === 'Done').length
  const inProg   = sprintTickets.filter(t => t.status === 'In Progress').length
  const inReview = sprintTickets.filter(t => t.status === 'In Review').length
  const pct      = total ? Math.round(done / total * 100) : 0

  const handleDragStart = useCallback((e, ticketId) => {
    e.dataTransfer.setData('ticketId', ticketId)
    e.dataTransfer.effectAllowed = 'move'
  }, [])

  const handleDragOver = useCallback((e, status) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOver(status)
  }, [])

  const handleDragLeave = useCallback(() => setDragOver(null), [])

  const handleDrop = useCallback(async (e, status) => {
    e.preventDefault()
    const id = e.dataTransfer.getData('ticketId')
    setDragOver(null)
    if (!id) return
    const ticket = tickets.find(t => t.id === id)
    if (ticket && ticket.status !== status) {
      await doUpdateTicket(id, { status })
    }
  }, [tickets, doUpdateTicket])

  return (
    <div>
      {/* Sprint Banner */}
      <div style={{
        background: 'linear-gradient(135deg,#eff6ff 0%,#dbeafe 100%)',
        border: '1px solid #bfdbfe', borderRadius: 10, padding: '14px 20px',
        marginBottom: 20, display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap'
      }}>
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <span style={{ fontSize: 18 }}>🏃</span>
            <span style={{ fontWeight: 700, fontSize: 15, color: '#1e40af' }}>{activeSprint}</span>
            <span style={{ background: '#dbeafe', color: '#1e40af', fontSize: 10, fontWeight: 700, padding: '1px 8px', borderRadius: 10, border: '1px solid #93c5fd' }}>ACTIVE</span>
          </div>
          <div style={{ display: 'flex', gap: 14, fontSize: 12, color: '#3b82f6', flexWrap: 'wrap' }}>
            <span>{total} issues</span>
            <span>⚡ {inProg} in progress</span>
            <span>👁 {inReview} in review</span>
            <span>✅ {done} done</span>
            {blockedTickets.length > 0 && <span style={{ color: '#ef4444' }}>🚫 {blockedTickets.length} blocked</span>}
          </div>
        </div>
        <div style={{ flex: 1, minWidth: 160, maxWidth: 220 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#6b7280', marginBottom: 5 }}>
            <span>Sprint progress</span>
            <span style={{ fontWeight: 700, color: pct === 100 ? '#10b981' : '#1e40af' }}>{pct}%</span>
          </div>
          <div style={{ height: 8, background: '#dbeafe', borderRadius: 4, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${pct}%`, background: pct === 100 ? '#10b981' : '#3b82f6', borderRadius: 4, transition: 'width .4s' }} />
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
          {sprints.length > 1 && (
            <select className="form-select" value={activeSprint} onChange={e => setActiveSprint(e.target.value)} style={{ width: 'auto', fontSize: 12 }}>
              {sprints.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          )}
          <button className="btn btn-ghost btn-sm" onClick={() => openModal('createTicket')}>+ Add Issue</button>
        </div>
      </div>

      {/* Sprint columns */}
      <div className="kanban-board">
        {SPRINT_COLS.map(status => (
          <DropColumn
            key={status}
            status={status}
            cards={sprintTickets.filter(t => t.status === status)}
            isOver={dragOver === status}
            onDragStart={handleDragStart}
            onDragOver={e => handleDragOver(e, status)}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            openTicketView={openTicketView}
            openModal={openModal}
          />
        ))}
      </div>

      {/* Blocked */}
      {blockedTickets.length > 0 && (
        <div style={{ marginTop: 20 }}>
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '10px 14px', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>🚫</span>
            <span style={{ fontWeight: 700, color: '#dc2626', fontSize: 13 }}>Blocked ({blockedTickets.length})</span>
            <span style={{ fontSize: 12, color: '#ef4444' }}>— these issues need attention</span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {blockedTickets.map(t => (
              <TicketCard key={t.id} ticket={t} onDragStart={handleDragStart} onClick={openTicketView} />
            ))}
          </div>
        </div>
      )}

      {/* Backlog */}
      <div style={{ marginTop: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, paddingBottom: 8, borderBottom: '2px solid var(--gray-100)' }}>
          <span style={{ fontWeight: 700, fontSize: 14 }}>📋 Backlog</span>
          <span style={{ background: '#f3f4f6', color: '#6b7280', borderRadius: 10, padding: '1px 8px', fontSize: 12, fontWeight: 600 }}>{backlogTickets.length}</span>
          <span style={{ fontSize: 12, color: 'var(--gray-400)' }}>issues not assigned to a sprint</span>
          <button className="btn btn-ghost btn-sm" style={{ marginLeft: 'auto' }} onClick={() => openModal('createTicket')}>+ Add to Backlog</button>
        </div>
        {backlogTickets.length > 0 ? (
          <div className="card" style={{ padding: 0 }}>
            <table>
              <thead>
                <tr><th>ID</th><th>Type</th><th>Summary</th><th>Priority</th><th>Assignee</th><th>Due Date</th></tr>
              </thead>
              <tbody>
                {backlogTickets.map(t => (
                  <tr key={t.id} style={{ cursor: 'pointer' }} onClick={() => openTicketView(t.id)}>
                    <td style={{ fontWeight: 600, color: 'var(--blue)', fontSize: 12 }}>{t.id}</td>
                    <td><span className={`badge ${getTypeColor(t.type)}`} style={{ fontSize: 10 }}>{t.type}</span></td>
                    <td style={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 500 }}>{t.title}</td>
                    <td><span className={priorityClass(t.priority)} style={{ fontSize: 11 }}>{t.priority}</span></td>
                    <td><div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Avatar name={t.assignee} size={22} /><span style={{ fontSize: 11 }}>{t.assignee}</span></div></td>
                    <td style={{ fontSize: 11, color: 'var(--gray-400)' }}>{t.dueDate || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ border: '2px dashed var(--gray-200)', borderRadius: 8, padding: '24px', textAlign: 'center', color: 'var(--gray-400)', fontSize: 13 }}>
            🎉 All issues are assigned to sprints!
          </div>
        )}
      </div>
    </div>
  )
}

// ── Backlog (list view) ───────────────────────────────────────────────────────
function Backlog({ pid, tickets, openModal, openTicketView }) {
  const tks = tickets.filter(t => t.project === pid)
  const groups = [
    { label: 'To Do',                cls: 's-todo',       list: tks.filter(t => t.status === 'To Do') },
    { label: 'In Progress / Review', cls: 's-inprogress', list: tks.filter(t => t.status === 'In Progress' || t.status === 'In Review') },
    { label: 'Blocked',              cls: 's-blocked',    list: tks.filter(t => t.status === 'Blocked') },
    { label: 'Done',                 cls: 's-done',       list: tks.filter(t => t.status === 'Done') },
  ]
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
        <span style={{ fontSize: 13, color: 'var(--gray-500)' }}>All issues grouped by status</span>
        <button className="btn btn-primary btn-sm" style={{ marginLeft: 'auto' }} onClick={() => openModal('createTicket')}>+ Create Issue</button>
      </div>
      <div className="card" style={{ padding: 0 }}>
        <table>
          <thead>
            <tr><th>ID</th><th>Type</th><th>Summary</th><th>Status</th><th>Priority</th><th>Assignee</th><th>Sprint</th><th>Due Date</th></tr>
          </thead>
          <tbody>
            {groups.map(({ label, cls, list }) => {
              if (!list.length) return null
              return (
                <React.Fragment key={label}>
                  <tr>
                    <td colSpan={8} style={{ padding: '6px 14px', background: 'var(--gray-50)', fontSize: 11, fontWeight: 700, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '.5px', borderTop: '2px solid var(--gray-200)' }}>
                      <span className={`badge ${cls}`} style={{ marginRight: 6 }}>{label}</span>{list.length} issues
                    </td>
                  </tr>
                  {list.map(t => (
                    <tr key={t.id} onClick={() => openTicketView(t.id)} style={{ cursor: 'pointer' }}>
                      <td style={{ fontWeight: 600, color: 'var(--blue)', paddingLeft: 20 }}>{t.id}</td>
                      <td><span className={`badge ${getTypeColor(t.type)}`}>{t.type}</span></td>
                      <td style={{ maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 500 }}>{t.title}</td>
                      <td><span className={`badge ${getStatusClass(t.status)}`}>{t.status}</span></td>
                      <td><span className={priorityClass(t.priority)} style={{ fontSize: 12 }}>{t.priority}</span></td>
                      <td><Avatar name={t.assignee} size={24} /></td>
                      <td style={{ fontSize: 11, color: 'var(--gray-400)' }}>{t.sprint || '—'}</td>
                      <td style={{ fontSize: 11, color: 'var(--gray-400)' }}>{t.dueDate || '—'}</td>
                    </tr>
                  ))}
                </React.Fragment>
              )
            })}
            {!tks.length && (
              <tr><td colSpan={8}><div className="empty-state"><div style={{ fontSize: 28, marginBottom: 8 }}>📋</div><div>No issues yet.</div></div></td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ── Reports ───────────────────────────────────────────────────────────────────
function ProjectReports({ pid, tickets }) {
  const tks = tickets.filter(t => t.project === pid)
  const byStatus = {}
  STATUSES.forEach(s => byStatus[s] = tks.filter(t => t.status === s).length)
  const mx = Math.max(...Object.values(byStatus), 1)
  const byAssignee = {}
  tks.forEach(t => { if (!byAssignee[t.assignee]) byAssignee[t.assignee] = 0; byAssignee[t.assignee]++ })

  return (
    <div className="grid-2">
      <div className="card">
        <div className="card-title">Tickets by Status</div>
        <div className="bar-chart">
          {STATUSES.map(s => (
            <div key={s} className="bar-wrap">
              <div className="bar-val">{byStatus[s]}</div>
              <div className="bar" style={{ height: Math.round(byStatus[s] / mx * 80) + 10, background: s === 'Done' ? 'var(--green)' : s === 'Blocked' ? 'var(--red)' : 'var(--blue)' }} />
              <div className="bar-label">{s.split(' ')[0]}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="card">
        <div className="card-title">Team Workload</div>
        {Object.entries(byAssignee).map(([name, count]) => (
          <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <Avatar name={name} size={26} />
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 3 }}>
                <span>{name}</span><span style={{ fontWeight: 700 }}>{count}</span>
              </div>
              <div className="progress-bar"><div className="progress-fill" style={{ width: `${Math.round(count / tks.length * 100)}%` }} /></div>
            </div>
          </div>
        ))}
      </div>
      <div className="card">
        <div className="card-title">By Issue Type</div>
        {ISSUE_TYPES.map(t => {
          const c = tks.filter(x => x.type === t).length
          return c ? (
            <div key={t} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--gray-100)' }}>
              <span className={`badge ${getTypeColor(t)}`}>{t}</span><strong>{c}</strong>
            </div>
          ) : null
        })}
      </div>
      <div className="card">
        <div className="card-title">By Priority</div>
        {PRIORITIES.map(p => {
          const c = tks.filter(t => t.priority === p).length
          return (
            <div key={p} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--gray-100)' }}>
              <span className={priorityClass(p)} style={{ fontSize: 13 }}>{p}</span><strong>{c}</strong>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Project Settings ──────────────────────────────────────────────────────────
function ProjectSettings({ project }) {
  const { doUpdateProject, users } = useApp()
  const [name,    setName]    = useState(project.name)
  const [key,     setKey]     = useState(project.key)
  const [desc,    setDesc]    = useState(project.description || '')
  const [lead,    setLead]    = useState(project.lead || '')
  const [color,   setColor]   = useState(project.color || '#4f46e5')
  const [saved,   setSaved]   = useState(false)
  const [saving,  setSaving]  = useState(false)

  const handleSave = async () => {
    if (!name.trim()) { alert('Name required'); return }
    setSaving(true)
    try {
      await doUpdateProject(project.id, { name: name.trim(), key: key.trim().toUpperCase(), description: desc, lead, color })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } finally { setSaving(false) }
  }

  return (
    <div style={{ maxWidth: 640 }}>
      <div className="card">
        <div className="card-title" style={{ marginBottom: 16 }}>⚙ General Settings</div>
        <div className="form-group">
          <label className="form-label">Project Name *</label>
          <input className="form-input" value={name} onChange={e => setName(e.target.value)} />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Project Key</label>
            <input className="form-input" value={key} onChange={e => setKey(e.target.value.toUpperCase().slice(0, 8))} style={{ fontFamily: 'monospace', fontWeight: 700 }} />
            <div style={{ fontSize: 11, color: 'var(--gray-400)', marginTop: 4 }}>Max 8 chars. Used as ticket ID prefix.</div>
          </div>
          <div className="form-group">
            <label className="form-label">Project Color</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <input type="color" value={color} onChange={e => setColor(e.target.value)} style={{ width: 44, height: 38, border: '1px solid var(--gray-200)', borderRadius: 6, cursor: 'pointer', padding: 2 }} />
              <span style={{ fontSize: 13, color: 'var(--gray-500)', fontFamily: 'monospace' }}>{color}</span>
            </div>
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Description</label>
          <textarea className="form-textarea" value={desc} onChange={e => setDesc(e.target.value)} rows={3} />
        </div>
        <div className="form-group">
          <label className="form-label">Project Lead</label>
          <select className="form-select" value={lead} onChange={e => setLead(e.target.value)}>
            <option value="">— Unassigned —</option>
            {users.map(u => <option key={u.id} value={u.name}>{u.name}</option>)}
          </select>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginTop: 8 }}>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving ? 'Saving…' : 'Save Changes'}</button>
          {saved && <span style={{ color: '#10b981', fontSize: 13, fontWeight: 600 }}>✓ Saved!</span>}
        </div>
      </div>
      <div className="card" style={{ marginTop: 16 }}>
        <div className="card-title" style={{ color: '#dc2626' }}>Danger Zone</div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0' }}>
          <div>
            <div style={{ fontWeight: 600, fontSize: 13 }}>Archive Project</div>
            <div style={{ fontSize: 12, color: 'var(--gray-400)' }}>Mark as archived. Tickets remain accessible.</div>
          </div>
          <button className="btn btn-ghost btn-sm" style={{ border: '1px solid #fca5a5', color: '#dc2626' }}>Archive</button>
        </div>
      </div>
    </div>
  )
}

// ── Main ProjectDetail ────────────────────────────────────────────────────────
export default function ProjectDetail() {
  const { activeProject, projects, tickets, projectTab, setProjectTab, nav, openModal, openTicketView } = useApp()
  const [boardType, setBoardType] = useState('scrum') // 'scrum' | 'kanban'

  const p = projects.find(x => x.id === activeProject)
  if (!p) return <div className="page"><div className="empty-state">Project not found</div></div>

  const projectTickets = tickets.filter(t => t.project === p.id)
  const tabs = [
    { key: 'board',     label: '📋 Board' },
    { key: 'backlog',   label: 'Backlog' },
    { key: 'roadmap',   label: '🗺 Roadmap' },
    { key: 'reports',   label: '📊 Reports' },
    { key: 'psettings', label: '⚙ Settings' },
  ]

  return (
    <div className="page">
      <div className="breadcrumb">
        <span onClick={() => nav('projects')}>Projects</span>
        <span className="bc-sep">›</span>
        <span>{p.name}</span>
      </div>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 9, background: p.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 15 }}>
            {p.key[0]}
          </div>
          <div>
            <div className="page-title">{p.name}</div>
            <div className="page-sub">{p.key} · {p.description}</div>
          </div>
        </div>
        <button className="btn btn-primary" onClick={() => openModal('createTicket')}>+ Create Ticket</button>
      </div>

      <div className="tabs">
        {tabs.map(t => (
          <button key={t.key} className={`tab ${projectTab === t.key ? 'active' : ''}`} onClick={() => setProjectTab(t.key)}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Board type toggle — only shown on the board tab */}
      {projectTab === 'board' && (
        <div style={{ display: 'flex', gap: 4, marginBottom: 16, alignItems: 'center' }}>
          <span style={{ fontSize: 12, color: 'var(--gray-500)', marginRight: 6 }}>Board type:</span>
          <button
            className={`btn btn-sm ${boardType === 'scrum' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setBoardType('scrum')}
          >
            🏃 Scrum
          </button>
          <button
            className={`btn btn-sm ${boardType === 'kanban' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setBoardType('kanban')}
          >
            📊 Kanban
          </button>
        </div>
      )}

      {projectTab === 'board' && boardType === 'scrum'  && <SprintBoard pid={p.id} tickets={tickets} openModal={openModal} openTicketView={openTicketView} />}
      {projectTab === 'board' && boardType === 'kanban' && <KanbanBoard pid={p.id} tickets={tickets} openModal={openModal} openTicketView={openTicketView} />}
      {projectTab === 'backlog'   && <Backlog pid={p.id} tickets={tickets} openModal={openModal} openTicketView={openTicketView} />}
      {projectTab === 'roadmap'   && <Roadmap tickets={projectTickets} />}
      {projectTab === 'reports'   && <ProjectReports pid={p.id} tickets={tickets} />}
      {projectTab === 'psettings' && <ProjectSettings project={p} />}
    </div>
  )
}
