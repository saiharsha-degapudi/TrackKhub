import React, { useState, useCallback, useMemo, useEffect } from 'react'
import { useApp } from '../../context/AppContext'
import Avatar from '../common/Avatar'
import { getTypeColor, getStatusClass, priorityClass } from '../common/Badge'
import Roadmap from '../Roadmap'
import * as api from '../../api'

const ISSUE_TYPES = ['Feature', 'Initiative', 'Epic', 'Story', 'Task', 'Sub-task']
const PRIORITIES  = ['Critical', 'High', 'Medium', 'Low']

const COL_COLORS = {
  'To Do': '#64748b', 'In Progress': '#3b82f6',
  'In Review': '#8b5cf6', 'Done': '#10b981', 'Blocked': '#ef4444',
}
const COL_BG = {
  'To Do': '#f1f5f9', 'In Progress': '#eff6ff',
  'In Review': '#f5f3ff', 'Done': '#f0fdf4', 'Blocked': '#fff1f2',
}
const COL_ICONS = {
  'To Do': '○', 'In Progress': '◕', 'In Review': '◎', 'Done': '✓', 'Blocked': '✕',
}

// ── Draggable ticket card ──────────────────────────────────────────────────────
function TicketCard({ ticket, onDragStart, onClick }) {
  return (
    <div
      className="kanban-card"
      draggable
      onDragStart={e => onDragStart(e, ticket.id)}
      onClick={() => onClick(ticket.id)}
      style={{ cursor: 'grab', borderLeft: `3px solid ${(COL_COLORS[ticket.status] || '#64748b')}60` }}
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
          {ticket.storyPoints != null && (
            <span style={{ fontSize: 9, background: '#eff6ff', color: '#1e40af', borderRadius: 8, padding: '1px 5px', fontWeight: 600 }}>
              {ticket.storyPoints}
            </span>
          )}
          {ticket.dueDate && <span style={{ fontSize: 9, color: '#9ca3af' }}>{ticket.dueDate}</span>}
          <Avatar name={ticket.assignee} size={20} />
        </div>
      </div>
    </div>
  )
}

// ── Kanban column with drop zone ───────────────────────────────────────────────
function DropColumn({ status, cards, isOver, onDragStart, onDragOver, onDragLeave, onDrop, openTicketView, openModal, pid }) {
  const color = COL_COLORS[status] || '#64748b'
  const bg    = COL_BG[status]    || '#f8faff'
  return (
    <div
      className="kanban-col"
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={e => onDrop(e, status)}
      style={{
        outline: isOver ? `2px dashed ${color}` : 'none',
        borderRadius: 10, transition: 'all .15s',
        background: isOver ? `${color}12` : undefined,
      }}
    >
      {/* Column header */}
      <div
        className="kanban-col-header"
        style={{ background: bg, borderBottom: `3px solid ${color}40`, color: color }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 800, fontSize: 13 }}>
          <span style={{
            width: 20, height: 20, borderRadius: '50%', background: color,
            color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 11, fontWeight: 900, flexShrink: 0,
          }}>{COL_ICONS[status] || '•'}</span>
          {status}
        </span>
        <span style={{
          background: color, color: '#fff', borderRadius: 12,
          padding: '2px 8px', fontSize: 11, fontWeight: 700,
        }}>
          {cards.length}
        </span>
      </div>

      {/* Column body */}
      <div className="kanban-col-body">
        {cards.map(t => (
          <TicketCard key={t.id} ticket={t} onDragStart={onDragStart} onClick={openTicketView} />
        ))}
        {cards.length === 0 && (
          <div style={{
            border: `2px dashed ${color}40`, borderRadius: 8,
            padding: '24px 8px', textAlign: 'center', fontSize: 11, color: 'var(--gray-400)',
          }}>
            {isOver ? '📥 Drop here' : 'No issues'}
          </div>
        )}
        <div
          style={{ textAlign: 'center', padding: '8px 0', fontSize: 12, color: 'var(--gray-400)', cursor: 'pointer', borderRadius: 6, transition: 'background .1s' }}
          onClick={() => openModal('createTicket', { project: pid })}
          onMouseEnter={e => e.currentTarget.style.background='var(--gray-200)'}
          onMouseLeave={e => e.currentTarget.style.background='transparent'}
        >
          + Add issue
        </div>
      </div>
    </div>
  )
}

// ── Drag & drop hook ───────────────────────────────────────────────────────────
function useDragDrop(tickets) {
  const { doUpdateTicket } = useApp()
  const [dragOverCol, setDragOverCol] = useState(null)
  const [draggingId, setDraggingId]   = useState(null)

  const handleDragStart = useCallback((e, id) => {
    setDraggingId(id)
    e.dataTransfer.setData('ticketId', id)
    e.dataTransfer.effectAllowed = 'move'
  }, [])

  const handleDragOver = useCallback((e, col) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverCol(col)
  }, [])

  const handleDragLeave = useCallback(() => setDragOverCol(null), [])

  const handleDrop = useCallback(async (e, col) => {
    e.preventDefault()
    const id = e.dataTransfer.getData('ticketId')
    setDragOverCol(null)
    setDraggingId(null)
    if (!id) return
    const t = tickets.find(x => x.id === id)
    if (t && t.status !== col) await doUpdateTicket(id, { status: col })
  }, [tickets, doUpdateTicket])

  return { dragOverCol, draggingId, handleDragStart, handleDragOver, handleDragLeave, handleDrop }
}

// ══════════════════════════════════════════════════════════════════════════════
// ── BOARD FILTER BAR (shared by Scrum + Kanban) ──────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════
const FILTER_TYPES      = ['Feature', 'Initiative', 'Epic', 'Story', 'Task', 'Sub-task']
const FILTER_PRIORITIES = ['Critical', 'High', 'Medium', 'Low']
const PRIORITY_COLORS   = { Critical: '#ef4444', High: '#f97316', Medium: '#eab308', Low: '#22c55e' }

function BoardFilterBar({ tickets, assignees, typeF, priorityF, search, onAssignee, onType, onPriority, onSearch, onClear }) {
  const uniqueAssignees = useMemo(
    () => [...new Set(tickets.map(t => t.assignee).filter(Boolean))],
    [tickets]
  )
  const activeCount = assignees.length + (typeF ? 1 : 0) + (priorityF ? 1 : 0) + (search ? 1 : 0)

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px',
      background: 'var(--white)', border: '1.5px solid var(--gray-200)',
      borderRadius: 10, marginBottom: 14, flexWrap: 'wrap', boxShadow: 'var(--shadow)',
    }}>

      {/* Search */}
      <input
        className="form-input"
        placeholder="🔍 Search tickets…"
        value={search}
        onChange={e => onSearch(e.target.value)}
        style={{ width: 180, fontSize: 12, padding: '6px 10px' }}
      />

      {/* Separator */}
      <div style={{ width: 1, height: 22, background: 'var(--gray-200)', flexShrink: 0 }} />

      {/* Assignee avatars */}
      {uniqueAssignees.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          <span style={{ fontSize: 11, color: 'var(--gray-400)', fontWeight: 600, marginRight: 4 }}>ASSIGNEE</span>
          {uniqueAssignees.map(name => (
            <div
              key={name}
              onClick={() => onAssignee(name)}
              title={name}
              style={{
                cursor: 'pointer', borderRadius: '50%', flexShrink: 0,
                outline: assignees.includes(name) ? '2.5px solid #1a56db' : '2.5px solid transparent',
                outlineOffset: 2,
                opacity: assignees.length > 0 && !assignees.includes(name) ? 0.35 : 1,
                transition: 'all .15s', transform: assignees.includes(name) ? 'scale(1.1)' : 'scale(1)',
              }}
            >
              <Avatar name={name} size={26} />
            </div>
          ))}
        </div>
      )}

      {/* Separator */}
      <div style={{ width: 1, height: 22, background: 'var(--gray-200)', flexShrink: 0 }} />

      {/* Type filter */}
      <select
        value={typeF}
        onChange={e => onType(e.target.value)}
        style={{
          fontSize: 12, padding: '5px 10px', borderRadius: 7,
          border: `1.5px solid ${typeF ? '#3b82f6' : 'var(--gray-200)'}`,
          background: typeF ? '#eff6ff' : 'var(--white)', cursor: 'pointer',
          color: typeF ? '#1e40af' : 'var(--text)', fontWeight: typeF ? 700 : 400,
          outline: 'none',
        }}
      >
        <option value="">Type: All</option>
        {FILTER_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
      </select>

      {/* Priority filter */}
      <select
        value={priorityF}
        onChange={e => onPriority(e.target.value)}
        style={{
          fontSize: 12, padding: '5px 10px', borderRadius: 7,
          border: `1.5px solid ${priorityF ? (PRIORITY_COLORS[priorityF] || '#3b82f6') : 'var(--gray-200)'}`,
          background: priorityF ? `${PRIORITY_COLORS[priorityF] || '#3b82f6'}10` : 'var(--white)',
          cursor: 'pointer', outline: 'none',
          color: priorityF ? (PRIORITY_COLORS[priorityF] || '#1e40af') : 'var(--text)',
          fontWeight: priorityF ? 700 : 400,
        }}
      >
        <option value="">Priority: All</option>
        {FILTER_PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
      </select>

      {/* Active filter count + Clear */}
      {activeCount > 0 && (
        <>
          <span style={{ fontSize: 11, color: '#1a56db', background: '#eff6ff', borderRadius: 10, padding: '2px 8px', fontWeight: 700 }}>
            {activeCount} filter{activeCount > 1 ? 's' : ''} active
          </span>
          <button
            onClick={onClear}
            style={{
              display: 'flex', alignItems: 'center', gap: 4,
              padding: '4px 10px', borderRadius: 20,
              background: '#fff1f2', color: '#ef4444',
              border: '1px solid #fecaca', cursor: 'pointer',
              fontSize: 12, fontWeight: 600,
            }}
          >✕ Clear all</button>
        </>
      )}
    </div>
  )
}

// ── Jira-style board card ──────────────────────────────────────────────────────
const PCOLOR = { Critical: '#ef4444', High: '#f97316', Medium: '#eab308', Low: '#22c55e' }
const TYPE_ICON = { Story: '🟢', Epic: '🟣', Feature: '🟠', Task: '🔵', 'Sub-task': '⬜', Initiative: '🔷' }

function NewBoardCard({ ticket, onDragStart, onClick }) {
  const pc = PCOLOR[ticket.priority] || '#9ca3af'
  return (
    <div
      draggable
      onDragStart={e => onDragStart(e, ticket.id)}
      onClick={() => onClick(ticket.id)}
      style={{
        padding: '10px 12px', borderRadius: 6, background: 'var(--white)',
        border: '1px solid var(--gray-200)', boxShadow: '0 1px 3px rgba(0,0,0,.06)',
        cursor: 'pointer', userSelect: 'none', marginBottom: 6,
      }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 3px 10px rgba(0,0,0,.12)'; e.currentTarget.style.borderColor = '#93c5fd' }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,.06)'; e.currentTarget.style.borderColor = 'var(--gray-200)' }}
    >
      <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)', marginBottom: 10, lineHeight: 1.45, wordBreak: 'break-word' }}>
        {ticket.title}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <span style={{ fontSize: 15, color: pc, fontWeight: 900, lineHeight: 1, letterSpacing: -1 }}>≡</span>
          <span style={{ fontSize: 12 }}>{TYPE_ICON[ticket.type] || '🔵'}</span>
          <span style={{ fontSize: 11, color: 'var(--gray-500)', fontWeight: 600 }}>{ticket.id}</span>
          {ticket.storyPoints != null && (
            <span style={{ fontSize: 10, background: '#eff6ff', color: '#1e40af', borderRadius: 8, padding: '1px 6px', fontWeight: 700 }}>
              {ticket.storyPoints}
            </span>
          )}
        </div>
        <Avatar name={ticket.assignee} size={22} />
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// ── KANBAN BOARD (continuous flow — all project tickets, no sprint filter) ───
// ══════════════════════════════════════════════════════════════════════════════
function KanbanBoard({ board, pid, tickets }) {
  const { openModal, openTicketView } = useApp()
  const cols = board.columns || ['To Do', 'In Progress', 'In Review', 'Done', 'Blocked']
  const ptix = tickets.filter(t => t.project === pid)

  // ── Filters ──
  const [filterAssignees, setFilterAssignees] = useState([])
  const [filterType,      setFilterType]      = useState('')
  const [filterPriority,  setFilterPriority]  = useState('')
  const [filterSearch,    setFilterSearch]    = useState('')

  const visibleTickets = useMemo(() => ptix.filter(t => {
    if (filterAssignees.length > 0 && !filterAssignees.includes(t.assignee)) return false
    if (filterType && t.type !== filterType) return false
    if (filterPriority && t.priority !== filterPriority) return false
    if (filterSearch) {
      const q = filterSearch.toLowerCase()
      if (!t.title.toLowerCase().includes(q) && !t.id.toLowerCase().includes(q)) return false
    }
    return true
  }), [ptix, filterAssignees, filterType, filterPriority, filterSearch])

  const toggleAssignee = name => setFilterAssignees(p => p.includes(name) ? p.filter(a => a !== name) : [...p, name])
  const clearFilters   = () => { setFilterAssignees([]); setFilterType(''); setFilterPriority(''); setFilterSearch('') }

  const { dragOverCol, handleDragStart, handleDragOver, handleDragLeave, handleDrop } = useDragDrop(visibleTickets)

  const total = ptix.length
  const done  = ptix.filter(t => t.status === 'Done').length
  const wip   = ptix.filter(t => t.status === 'In Progress').length

  return (
    <div>
      {/* Info bar */}
      <div style={{ display: 'flex', gap: 12, padding: '12px 16px', background: 'var(--white)', borderRadius: 10, border: '1.5px solid var(--gray-200)', marginBottom: 12, alignItems: 'center', boxShadow: 'var(--shadow)' }}>
        {[
          { label: 'Total',       val: total, color: '#3b82f6', icon: '📋' },
          { label: 'In Progress', val: wip,   color: '#f59e0b', icon: '⚡' },
          { label: 'Done',        val: done,  color: '#10b981', icon: '✅' },
          { label: 'Blocked',     val: ptix.filter(t => t.status === 'Blocked').length, color: '#ef4444', icon: '🚫' },
        ].map(({ label, val, color, icon }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 8, background: `${color}10` }}>
            <span style={{ fontSize: 13 }}>{icon}</span>
            <span style={{ fontWeight: 800, fontSize: 15, color }}>{val}</span>
            <span style={{ fontSize: 11, color: 'var(--gray-500)' }}>{label}</span>
          </div>
        ))}
        <span style={{ flex: 1 }} />
        <span style={{ fontSize: 11, color: 'var(--gray-400)', fontStyle: 'italic' }}>Continuous flow · all tickets</span>
      </div>

      {/* Filter bar */}
      <BoardFilterBar
        tickets={ptix}
        assignees={filterAssignees} typeF={filterType} priorityF={filterPriority} search={filterSearch}
        onAssignee={toggleAssignee} onType={setFilterType} onPriority={setFilterPriority}
        onSearch={setFilterSearch} onClear={clearFilters}
      />

      {/* Columns */}
      <div className="kanban-board">
        {cols.map(col => (
          <DropColumn
            key={col} status={col}
            cards={visibleTickets.filter(t => t.status === col)}
            isOver={dragOverCol === col}
            onDragStart={handleDragStart}
            onDragOver={e => handleDragOver(e, col)}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            openTicketView={openTicketView}
            openModal={openModal}
            pid={pid}
          />
        ))}
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// ── SCRUM BOARD (active sprint — grouped by story, Jira-style) ───────────────
// ══════════════════════════════════════════════════════════════════════════════
function ScrumBoard({ board, pid, tickets, sprints }) {
  const { openModal, openTicketView, setProjectTab, doCompleteSprint, doUpdateTicket } = useApp()
  const cols            = board.columns || ['To Do', 'In Progress', 'In Review', 'Done', 'Blocked']
  const projectSprints  = sprints.filter(s => s.project === pid).sort((a, b) => a.order - b.order)
  const activeSprint    = projectSprints.find(s => s.status === 'active')
  const planningSprints = projectSprints.filter(s => s.status === 'planning')

  // ── UI state ──
  const [completing,      setCompleting]     = useState(false)
  const [groupByStory,    setGroupByStory]   = useState(true)
  const [collapsed,       setCollapsed]      = useState({})

  // ── Filters ──
  const [filterAssignees, setFilterAssignees] = useState([])
  const [filterType,      setFilterType]      = useState('')
  const [filterPriority,  setFilterPriority]  = useState('')
  const [filterSearch,    setFilterSearch]    = useState('')

  const sprintTickets = useMemo(() =>
    activeSprint ? tickets.filter(t => t.project === pid && t.sprint === activeSprint.name) : [],
    [activeSprint, tickets, pid]
  )

  const visibleTickets = useMemo(() => sprintTickets.filter(t => {
    if (filterAssignees.length > 0 && !filterAssignees.includes(t.assignee)) return false
    if (filterType && t.type !== filterType) return false
    if (filterPriority && t.priority !== filterPriority) return false
    if (filterSearch) {
      const q = filterSearch.toLowerCase()
      if (!t.title.toLowerCase().includes(q) && !t.id.toLowerCase().includes(q)) return false
    }
    return true
  }), [sprintTickets, filterAssignees, filterType, filterPriority, filterSearch])

  const uniqueAssignees  = useMemo(() => [...new Set(sprintTickets.map(t => t.assignee).filter(Boolean))], [sprintTickets])
  const toggleAssignee   = name => setFilterAssignees(p => p.includes(name) ? p.filter(a => a !== name) : [...p, name])
  const clearFilters     = () => { setFilterAssignees([]); setFilterType(''); setFilterPriority(''); setFilterSearch('') }
  const activeFilterCount = filterAssignees.length + (filterType ? 1 : 0) + (filterPriority ? 1 : 0) + (filterSearch ? 1 : 0)

  // ── Stats ──
  const doneCount = sprintTickets.filter(t => t.status === 'Done').length
  const progress  = sprintTickets.length ? Math.round(doneCount / sprintTickets.length * 100) : 0
  const totalPts  = sprintTickets.reduce((s, t) => s + (t.storyPoints || 0), 0)
  const donePts   = sprintTickets.filter(t => t.status === 'Done').reduce((s, t) => s + (t.storyPoints || 0), 0)
  const daysLeft  = activeSprint?.endDate
    ? Math.max(0, Math.ceil((new Date(activeSprint.endDate) - new Date()) / 86400000))
    : null

  // ── Drag & drop ──
  const { dragOverCol, handleDragStart, handleDragOver, handleDragLeave, handleDrop } = useDragDrop(sprintTickets)

  // ── Group tickets by parent ──
  const groupedTickets = useMemo(() => {
    const groups = {}
    visibleTickets.forEach(t => {
      const key = t.parent || '__none__'
      if (!groups[key]) groups[key] = []
      groups[key].push(t)
    })
    return groups
  }, [visibleTickets])

  const groupKeys = useMemo(() =>
    Object.keys(groupedTickets).sort((a, b) => {
      if (a === '__none__') return 1
      if (b === '__none__') return -1
      return a.localeCompare(b)
    }),
    [groupedTickets]
  )

  const toggleCollapse = key => setCollapsed(p => ({ ...p, [key]: !p[key] }))

  // ── No active sprint ──
  if (!activeSprint) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px' }}>
        <div style={{ fontSize: 52, marginBottom: 16 }}>🏃</div>
        <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 8 }}>No Active Sprint</div>
        <div style={{ fontSize: 14, color: 'var(--gray-500)', marginBottom: 24, lineHeight: 1.6 }}>
          Go to the <strong>Backlog</strong> tab to start a sprint.<br />
          Once a sprint is active its tickets will appear here.
        </div>
        {planningSprints.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 13, color: 'var(--gray-500)', marginBottom: 10 }}>Sprints ready to start:</div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
              {planningSprints.map(sp => (
                <div key={sp.id} style={{ background: 'var(--gray-50)', border: '1px solid var(--gray-200)', borderRadius: 8, padding: '8px 16px', fontSize: 13 }}>
                  <strong>{sp.name}</strong>
                  <span style={{ color: 'var(--gray-400)', marginLeft: 8, fontSize: 12 }}>
                    ({tickets.filter(t => t.project === pid && t.sprint === sp.name).length} tickets)
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
        <button className="btn btn-primary" onClick={() => setProjectTab('backlog')}>Go to Backlog →</button>
      </div>
    )
  }

  return (
    <div>
      {/* ── Compact sprint info bar ── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px',
        background: 'linear-gradient(90deg, #1a56db 0%, #1e40af 100%)',
        borderRadius: 10, marginBottom: 12, color: '#fff', flexWrap: 'wrap',
        boxShadow: '0 2px 12px rgba(26,86,219,.2)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontWeight: 800, fontSize: 15 }}>{activeSprint.name}</span>
          <span style={{ background: '#10b981', borderRadius: 20, padding: '1px 8px', fontSize: 10, fontWeight: 800 }}>⚡ ACTIVE</span>
          {activeSprint.goal && <span style={{ fontSize: 12, color: '#bfdbfe', fontStyle: 'italic' }}>{activeSprint.goal}</span>}
        </div>
        {activeSprint.startDate && (
          <span style={{ fontSize: 11, color: '#93c5fd' }}>
            📅 {activeSprint.startDate} → {activeSprint.endDate || 'ongoing'}
            {daysLeft !== null && (
              <span style={{ marginLeft: 8, background: daysLeft <= 2 ? '#ef4444' : 'rgba(255,255,255,.2)', borderRadius: 10, padding: '1px 7px', fontWeight: 700 }}>
                {daysLeft === 0 ? 'Due today!' : `${daysLeft}d left`}
              </span>
            )}
          </span>
        )}
        <span style={{ flex: 1 }} />
        {/* Progress */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 100, height: 6, background: 'rgba(255,255,255,.25)', borderRadius: 4, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${progress}%`, background: '#10b981', borderRadius: 4, transition: 'width .4s' }} />
          </div>
          <span style={{ fontSize: 11, color: '#93c5fd' }}>{doneCount}/{sprintTickets.length} done</span>
          {totalPts > 0 && <span style={{ fontSize: 11, color: '#bfdbfe' }}>⭐ {donePts}/{totalPts} pts</span>}
        </div>
      </div>

      {/* ── Action bar (Jira-style) ── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px',
        background: 'var(--white)', border: '1.5px solid var(--gray-200)',
        borderRadius: 10, marginBottom: 14, flexWrap: 'wrap',
        boxShadow: 'var(--shadow)',
      }}>
        {/* Search */}
        <input
          className="form-input"
          placeholder="🔍 Search board"
          value={filterSearch}
          onChange={e => setFilterSearch(e.target.value)}
          style={{ width: 160, fontSize: 12, padding: '5px 10px' }}
        />

        {/* Assignee avatars */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {uniqueAssignees.slice(0, 6).map(name => (
            <div
              key={name}
              onClick={() => toggleAssignee(name)}
              title={name}
              style={{
                cursor: 'pointer', borderRadius: '50%', flexShrink: 0,
                outline: filterAssignees.includes(name) ? '2.5px solid #1a56db' : '2px solid transparent',
                outlineOffset: 1,
                opacity: filterAssignees.length > 0 && !filterAssignees.includes(name) ? 0.35 : 1,
                transition: 'all .15s',
              }}
            >
              <Avatar name={name} size={26} />
            </div>
          ))}
          {uniqueAssignees.length > 6 && (
            <div style={{ width: 26, height: 26, borderRadius: '50%', background: '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: '#4b5563' }}>
              +{uniqueAssignees.length - 6}
            </div>
          )}
        </div>

        {/* Divider */}
        <div style={{ width: 1, height: 22, background: 'var(--gray-200)', flexShrink: 0 }} />

        {/* Type filter */}
        <select
          value={filterType}
          onChange={e => setFilterType(e.target.value)}
          style={{
            fontSize: 12, padding: '5px 8px', borderRadius: 7, cursor: 'pointer', outline: 'none',
            border: `1.5px solid ${filterType ? '#3b82f6' : 'var(--gray-200)'}`,
            background: filterType ? '#eff6ff' : 'var(--white)',
            color: filterType ? '#1e40af' : 'var(--text)', fontWeight: filterType ? 700 : 400,
          }}
        >
          <option value="">Type ▾</option>
          {FILTER_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
        </select>

        {/* Priority filter */}
        <select
          value={filterPriority}
          onChange={e => setFilterPriority(e.target.value)}
          style={{
            fontSize: 12, padding: '5px 8px', borderRadius: 7, cursor: 'pointer', outline: 'none',
            border: `1.5px solid ${filterPriority ? (PRIORITY_COLORS[filterPriority] || '#3b82f6') : 'var(--gray-200)'}`,
            background: filterPriority ? `${PRIORITY_COLORS[filterPriority] || '#3b82f6'}10` : 'var(--white)',
            color: filterPriority ? (PRIORITY_COLORS[filterPriority] || '#1e40af') : 'var(--text)',
            fontWeight: filterPriority ? 700 : 400,
          }}
        >
          <option value="">Priority ▾</option>
          {FILTER_PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
        </select>

        {/* Clear filters */}
        {activeFilterCount > 0 && (
          <button
            onClick={clearFilters}
            style={{ padding: '4px 10px', borderRadius: 20, background: '#fff1f2', color: '#ef4444', border: '1px solid #fecaca', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}
          >✕ Clear ({activeFilterCount})</button>
        )}

        <span style={{ flex: 1 }} />

        {/* Complete sprint */}
        <button
          onClick={() => setCompleting(true)}
          style={{
            background: '#1a56db', color: '#fff', border: 'none',
            borderRadius: 8, padding: '7px 16px', fontSize: 13, fontWeight: 700,
            cursor: 'pointer', boxShadow: '0 2px 8px rgba(26,86,219,.3)',
          }}
        >
          ✓ Complete sprint
        </button>

        {/* Group toggle */}
        <button
          onClick={() => setGroupByStory(v => !v)}
          style={{
            padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer',
            background: groupByStory ? '#eff6ff' : 'var(--white)',
            color: groupByStory ? '#1a56db' : 'var(--gray-600)',
            border: `1.5px solid ${groupByStory ? '#3b82f6' : 'var(--gray-200)'}`,
          }}
        >
          Group: {groupByStory ? 'Stories' : 'None'}
        </button>
      </div>

      {/* ── Complete sprint confirm ── */}
      {completing && (
        <div style={{ padding: '16px 18px', background: '#fff7ed', borderRadius: 10, border: '1.5px solid #fed7aa', marginBottom: 14 }}>
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 8 }}>Complete "{activeSprint.name}"?</div>
          <div style={{ fontSize: 13, color: 'var(--gray-600)', marginBottom: 12, lineHeight: 1.5 }}>
            <strong style={{ color: '#f59e0b' }}>{sprintTickets.filter(t => t.status !== 'Done').length}</strong> incomplete tickets will move to the Backlog.&nbsp;
            <strong style={{ color: '#10b981' }}>{doneCount}</strong> Done tickets stay completed.
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-primary btn-sm" onClick={async () => { await doCompleteSprint(activeSprint.id); setCompleting(false) }}>
              ✓ Complete Sprint
            </button>
            <button className="btn btn-ghost btn-sm" onClick={() => setCompleting(false)}>Cancel</button>
          </div>
        </div>
      )}

      {/* ══ GROUPED BOARD ══ */}
      {groupByStory ? (
        <div>
          {groupKeys.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--gray-400)', fontSize: 14 }}>
              No tickets match your filters.
            </div>
          )}
          {groupKeys.map(key => {
            const parentT   = key !== '__none__' ? tickets.find(t => t.id === key) : null
            const groupTix  = groupedTickets[key] || []
            const isCollapsed = collapsed[key]
            const groupDone = groupTix.filter(t => t.status === 'Done').length

            return (
              <div key={key} style={{ marginBottom: 18 }}>
                {/* ── Story/group header row ── */}
                <div
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '9px 14px',
                    background: 'var(--gray-50)',
                    border: '1.5px solid var(--gray-200)',
                    borderRadius: isCollapsed ? 8 : '8px 8px 0 0',
                    cursor: 'pointer', userSelect: 'none',
                  }}
                  onClick={() => toggleCollapse(key)}
                >
                  <span style={{ fontSize: 12, color: 'var(--gray-400)', flexShrink: 0 }}>{isCollapsed ? '▶' : '▼'}</span>
                  {parentT ? (
                    <>
                      <span style={{ fontSize: 14, flexShrink: 0 }}>{TYPE_ICON[parentT.type] || '🔵'}</span>
                      <span
                        style={{ fontWeight: 700, color: 'var(--blue)', fontSize: 12, flexShrink: 0, cursor: 'pointer' }}
                        onClick={e => { e.stopPropagation(); openTicketView(parentT.id) }}
                      >{parentT.id}</span>
                      <span style={{ fontWeight: 600, fontSize: 13, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {parentT.title}
                      </span>
                      <span style={{ fontSize: 11, background: '#e5e7eb', borderRadius: 10, padding: '1px 8px', fontWeight: 600, flexShrink: 0, whiteSpace: 'nowrap' }}>
                        {groupTix.length} subtask{groupTix.length !== 1 ? 's' : ''}
                      </span>
                      <span
                        className={`badge ${getStatusClass(parentT.status)}`}
                        style={{ fontSize: 10, flexShrink: 0 }}
                      >{parentT.status}</span>
                      <Avatar name={parentT.assignee} size={22} />
                    </>
                  ) : (
                    <>
                      <span style={{ fontSize: 14 }}>📋</span>
                      <span style={{ fontWeight: 600, fontSize: 13, flex: 1 }}>Other tickets</span>
                      <span style={{ fontSize: 11, background: '#e5e7eb', borderRadius: 10, padding: '1px 8px', fontWeight: 600, flexShrink: 0 }}>
                        {groupTix.length} ticket{groupTix.length !== 1 ? 's' : ''}
                      </span>
                    </>
                  )}
                  <span style={{ fontSize: 11, color: 'var(--gray-400)', flexShrink: 0, marginLeft: 4 }}>
                    {groupDone}/{groupTix.length} done
                  </span>
                </div>

                {/* ── Mini kanban columns ── */}
                {!isCollapsed && (
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: `repeat(${cols.length}, 1fr)`,
                    border: '1.5px solid var(--gray-200)',
                    borderTop: 'none',
                    borderRadius: '0 0 8px 8px',
                    overflow: 'hidden',
                    background: 'var(--white)',
                  }}>
                    {cols.map((col, colIdx) => {
                      const colColor = COL_COLORS[col] || '#64748b'
                      const colCards = groupTix.filter(t => t.status === col)
                      const isOver   = dragOverCol === col
                      return (
                        <div
                          key={col}
                          style={{
                            borderRight: colIdx < cols.length - 1 ? '1px solid var(--gray-200)' : 'none',
                            minHeight: 100,
                            background: isOver ? `${colColor}08` : 'transparent',
                            transition: 'background .12s',
                          }}
                          onDragOver={e => { e.preventDefault(); handleDragOver(e, col) }}
                          onDragLeave={handleDragLeave}
                          onDrop={e => handleDrop(e, col)}
                        >
                          {/* Column header */}
                          <div style={{
                            padding: '7px 10px',
                            borderBottom: `2px solid ${colColor}40`,
                            background: isOver ? `${colColor}12` : `${COL_BG[col] || '#f8faff'}`,
                            display: 'flex', alignItems: 'center', gap: 6,
                          }}>
                            <span style={{ fontSize: 11, fontWeight: 700, color: colColor, letterSpacing: 0.5 }}>
                              {col.toUpperCase()}
                            </span>
                            {colCards.length > 0 && (
                              <span style={{ fontSize: 11, fontWeight: 700, color: '#fff', background: colColor, borderRadius: 8, padding: '0px 5px' }}>
                                {colCards.length}
                              </span>
                            )}
                          </div>
                          {/* Cards */}
                          <div style={{ padding: '8px 8px 2px' }}>
                            {colCards.map(t => (
                              <NewBoardCard
                                key={t.id}
                                ticket={t}
                                onDragStart={handleDragStart}
                                onClick={openTicketView}
                              />
                            ))}
                            <div
                              onClick={e => { e.stopPropagation(); openModal('createTicket', { project: pid, parent: parentT?.id }) }}
                              style={{ fontSize: 12, color: 'var(--gray-400)', cursor: 'pointer', padding: '4px 2px 8px', display: 'flex', alignItems: 'center', gap: 4 }}
                            >+ Create</div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      ) : (
        /* ══ FLAT BOARD ══ */
        <div className="kanban-board">
          {cols.map(col => (
            <DropColumn
              key={col} status={col}
              cards={visibleTickets.filter(t => t.status === col)}
              isOver={dragOverCol === col}
              onDragStart={handleDragStart}
              onDragOver={e => handleDragOver(e, col)}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              openTicketView={openTicketView}
              openModal={openModal}
              pid={pid}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// ── BOARDS MANAGER (chip selector + multi-board creation) ────────────────────
// ══════════════════════════════════════════════════════════════════════════════
const BOARD_TYPE_INFO = {
  scrum: {
    icon: '🏃',
    title: 'Scrum',
    desc: 'Sprint towards your team objectives with a board, backlog, and reports.',
    hint: 'Sprint-based — shows tickets from the active sprint. Manage sprints in the Backlog tab.',
    color: '#1a56db',
    bg: '#eff6ff',
  },
  kanban: {
    icon: '🔄',
    title: 'Kanban',
    desc: 'Manage a continuous delivery of work with a kanban board and reports.',
    hint: 'Continuous flow — shows all project tickets across columns with no sprint filtering.',
    color: '#16a34a',
    bg: '#f0fdf4',
  },
}

function CreateBoardForm({ pid, onCreated, onCancel }) {
  const { doCreateBoard, projects, filters } = useApp()

  // step 1 = type picker | step 2 = details form
  const [step,    setStep]    = useState(1)
  const [btype,   setBtype]   = useState(null)
  const [name,    setName]    = useState('')
  const [include, setInclude] = useState(pid != null ? String(pid) : '')
  const [creating, setCreating] = useState(false)

  const info = btype ? BOARD_TYPE_INFO[btype] : null

  const handlePickType = (t) => {
    setBtype(t)
    setStep(2)
  }

  const handleCreate = async () => {
    if (!name.trim())    { alert('Board name is required'); return }
    if (!include)        { alert('Please choose what to include'); return }
    setCreating(true)
    const b = await doCreateBoard({
      project:     pid,
      name:        name.trim(),
      type:        btype,
      description: info?.hint || '',
      filter:      include,
    })
    setCreating(false)
    onCreated(b)
  }

  // ── Step 1: Type picker ────────────────────────────────────────────────────
  if (step === 1) {
    return (
      <div style={{
        background: 'var(--white)', border: '1.5px solid var(--gray-200)',
        borderRadius: 14, padding: '28px 28px 24px', marginBottom: 16,
        boxShadow: '0 8px 32px rgba(0,0,0,.08)',
      }}>
        <div style={{ fontWeight: 800, fontSize: 20, marginBottom: 6 }}>Create a board</div>
        <div style={{ fontSize: 13, color: 'var(--gray-500)', marginBottom: 24 }}>
          Choose a board type to get started.
        </div>

        <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
          {(['scrum', 'kanban']).map(t => {
            const ti = BOARD_TYPE_INFO[t]
            return (
              <div
                key={t}
                onClick={() => handlePickType(t)}
                style={{
                  flex: 1, padding: '20px 22px', borderRadius: 12,
                  border: '2px solid var(--gray-200)', background: 'var(--white)',
                  cursor: 'pointer', transition: 'all .18s', userSelect: 'none',
                }}
                onMouseEnter={e => { e.currentTarget.style.border = `2px solid ${ti.color}`; e.currentTarget.style.background = ti.bg }}
                onMouseLeave={e => { e.currentTarget.style.border = '2px solid var(--gray-200)'; e.currentTarget.style.background = 'var(--white)' }}
              >
                <div style={{ fontSize: 28, marginBottom: 10 }}>{ti.icon}</div>
                <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 6, color: ti.color }}>{ti.title}</div>
                <div style={{ fontSize: 13, color: 'var(--gray-600)', lineHeight: 1.5 }}>{ti.desc}</div>
              </div>
            )
          })}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button className="btn btn-ghost btn-sm" onClick={onCancel}>Cancel</button>
        </div>
      </div>
    )
  }

  // ── Step 2: Details form ────────────────────────────────────────────────────
  return (
    <div style={{
      background: 'var(--white)', border: '1.5px solid var(--gray-200)',
      borderRadius: 14, padding: '28px 28px 24px', marginBottom: 16,
      boxShadow: '0 8px 32px rgba(0,0,0,.08)',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <div style={{ fontWeight: 800, fontSize: 20, marginBottom: 4 }}>Create a board</div>
          <div style={{ fontSize: 13, color: 'var(--gray-500)' }}>
            {info?.hint}
          </div>
          <div style={{ fontSize: 11, color: 'var(--gray-400)', marginTop: 6 }}>
            * Required fields are marked with an asterisk
          </div>
        </div>
        <div style={{
          padding: '5px 14px', borderRadius: 20, fontSize: 12, fontWeight: 700,
          background: info?.bg, color: info?.color, border: `1.5px solid ${info?.color}40`,
          display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0, marginLeft: 16,
        }}>
          {info?.icon} {info?.title} board
        </div>
      </div>

      {/* Name */}
      <div className="form-group">
        <label className="form-label" style={{ fontWeight: 700 }}>
          Name this board <span style={{ color: '#ef4444' }}>*</span>
        </label>
        <input
          className="form-input"
          placeholder="Enter a name for this board"
          value={name}
          onChange={e => setName(e.target.value)}
          autoFocus
          style={{ fontSize: 14 }}
          onKeyDown={e => e.key === 'Enter' && handleCreate()}
        />
      </div>

      {/* Include filter */}
      <div className="form-group">
        <label className="form-label" style={{ fontWeight: 700 }}>
          Choose what to include in this board <span style={{ color: '#ef4444' }}>*</span>
        </label>
        <select
          className="form-select"
          value={include}
          onChange={e => setInclude(e.target.value)}
          style={{ fontSize: 13 }}
        >
          <option value="">— Select —</option>
          <optgroup label="Projects">
            {projects.map(p => (
              <option key={p.id} value={String(p.id)}>
                {p.icon || '📁'} {p.name} ({p.key})
              </option>
            ))}
          </optgroup>
          {filters.length > 0 && (
            <optgroup label="Saved Filters">
              {filters.map(f => (
                <option key={f.id} value={`filter:${f.id}`}>
                  🔍 {f.name}
                </option>
              ))}
            </optgroup>
          )}
        </select>
        <div style={{ fontSize: 11, color: 'var(--gray-400)', marginTop: 5 }}>
          Choose a project or saved filter whose issues will appear on this board.
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--gray-100)' }}>
        <button
          className="btn btn-ghost btn-sm"
          onClick={() => { setStep(1); setBtype(null) }}
          style={{ color: 'var(--gray-500)' }}
        >
          ← Back
        </button>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-ghost btn-sm" onClick={onCancel}>Cancel</button>
          <button
            className="btn btn-primary"
            onClick={handleCreate}
            disabled={!name.trim() || !include || creating}
            style={{ minWidth: 80 }}
          >
            {creating ? 'Creating…' : 'Create'}
          </button>
        </div>
      </div>
    </div>
  )
}

function BoardsManager({ pid, tickets, sprints }) {
  const { boards, doDeleteBoard, openModal } = useApp()
  const projectBoards = boards.filter(b => b.project === pid)
  const [activeBoardId, setActiveBoardId] = useState(projectBoards[0]?.id ?? null)
  const [showCreate, setShowCreate]        = useState(false)
  const [confirmDelete, setConfirmDelete]  = useState(null)

  const activeBoard = projectBoards.find(b => b.id === activeBoardId) || projectBoards[0]

  const handleDelete = async (id) => {
    await doDeleteBoard(id)
    if (activeBoardId === id) setActiveBoardId(projectBoards.find(b => b.id !== id)?.id ?? null)
    setConfirmDelete(null)
  }

  if (projectBoards.length === 0 && !showCreate) {
    return (
      <CreateBoardForm
        pid={pid}
        onCreated={b => { setActiveBoardId(b.id); setShowCreate(false) }}
        onCancel={() => {}}
      />
    )
  }

  return (
    <div>
      {/* Board chips + New Board button */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14, alignItems: 'center' }}>
        {projectBoards.map(b => (
          <div
            key={b.id}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 10px 5px 12px', borderRadius: 20, border: `2px solid ${b.id === activeBoardId ? 'var(--blue)' : 'var(--gray-200)'}`, background: b.id === activeBoardId ? '#eff6ff' : 'var(--white)', cursor: 'pointer', fontSize: 13, fontWeight: b.id === activeBoardId ? 700 : 400 }}
            onClick={() => { setActiveBoardId(b.id); setShowCreate(false) }}
          >
            {b.type === 'scrum' ? '🏃' : '🔄'} {b.name}
            <span style={{ fontSize: 9, padding: '1px 5px', borderRadius: 8, background: b.type === 'scrum' ? '#dbeafe' : '#dcfce7', color: b.type === 'scrum' ? '#1e40af' : '#166534', fontWeight: 700, marginLeft: 2 }}>
              {b.type.toUpperCase()}
            </span>
            {projectBoards.length > 1 && (
              <span
                style={{ marginLeft: 2, color: 'var(--gray-400)', fontSize: 14, lineHeight: 1, padding: '0 2px' }}
                onClick={e => { e.stopPropagation(); setConfirmDelete(b.id) }}
                title="Delete board"
              >×</span>
            )}
          </div>
        ))}

        {!showCreate && (
          <button
            style={{ padding: '5px 12px', borderRadius: 20, border: '2px dashed var(--gray-300)', background: 'var(--white)', cursor: 'pointer', fontSize: 13, color: 'var(--gray-500)' }}
            onClick={() => setShowCreate(true)}
          >＋ New Board</button>
        )}
      </div>

      {/* Delete confirm */}
      {confirmDelete && (
        <div style={{ padding: '10px 14px', background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 8, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ flex: 1, fontSize: 13 }}>Delete "{projectBoards.find(b => b.id === confirmDelete)?.name}"?</span>
          <button className="btn btn-danger btn-sm" onClick={() => handleDelete(confirmDelete)}>Delete</button>
          <button className="btn btn-ghost btn-sm" onClick={() => setConfirmDelete(null)}>Cancel</button>
        </div>
      )}

      {/* Create board form */}
      {showCreate && (
        <CreateBoardForm
          pid={pid}
          onCreated={b => { setActiveBoardId(b.id); setShowCreate(false) }}
          onCancel={() => setShowCreate(false)}
        />
      )}

      {/* Active board content */}
      {activeBoard && !showCreate && (
        activeBoard.type === 'scrum'
          ? <ScrumBoard  board={activeBoard} pid={pid} tickets={tickets} sprints={sprints} />
          : <KanbanBoard board={activeBoard} pid={pid} tickets={tickets} />
      )}
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// ── BACKLOG VIEW (sprint management + unassigned backlog) ─────────────────────
// ══════════════════════════════════════════════════════════════════════════════
function BacklogView({ pid, tickets, sprints }) {
  const {
    doCreateSprint, doUpdateSprint, doStartSprint, doCompleteSprint, doDeleteSprint,
    doUpdateTicket, openModal, openTicketView,
  } = useApp()

  const projectSprints  = sprints.filter(s => s.project === pid).sort((a,b) => a.order - b.order)
  const activeSprint    = projectSprints.find(s => s.status === 'active')
  const planningSprints = projectSprints.filter(s => s.status === 'planning')
  const completedSprints = projectSprints.filter(s => s.status === 'completed')
  const backlogTickets  = tickets.filter(t => t.project === pid && !t.sprint)

  const [expanded, setExpanded]   = useState(() => {
    const s = {}
    projectSprints.forEach(sp => { s[sp.id] = sp.status !== 'completed' })
    return s
  })
  const [showCreate, setShowCreate]   = useState(false)
  const [newName,    setNewName]      = useState('')
  const [newGoal,    setNewGoal]      = useState('')
  const [startForm,  setStartForm]    = useState(null) // sprint id
  const [startDates, setStartDates]   = useState({ startDate: '', endDate: '' })
  const [completeId,       setCompleteId]       = useState(null)
  const [editingSprintId,  setEditingSprintId]  = useState(null)
  const [editForm,         setEditForm]         = useState({})
  const [dragOver,         setDragOver]         = useState(null) // sprint id | 'backlog'

  const toggleExpand = id => setExpanded(p => ({ ...p, [id]: !p[id] }))

  const handleCreateSprint = async () => {
    if (!newName.trim()) { alert('Sprint name required'); return }
    await doCreateSprint({ project: pid, name: newName.trim(), goal: newGoal.trim() })
    setShowCreate(false); setNewName(''); setNewGoal('')
  }

  const handleStartSprint = async (id) => {
    try {
      await doStartSprint(id, startDates)
      setStartForm(null)
    } catch (e) {
      alert(e.message || 'Failed to start sprint')
    }
  }

  const handleCompleteSprint = async (id) => {
    const result = await doCompleteSprint(id)
    setCompleteId(null)
    if (result?.movedToBacklog > 0) {
      // silently handled — tickets refresh in context
    }
  }

  const handleDrop = async (e, sprintName) => {
    e.preventDefault()
    const tId = e.dataTransfer.getData('ticketId')
    if (tId) await doUpdateTicket(tId, { sprint: sprintName || null })
    setDragOver(null)
  }

  // ── Ticket row (draggable, clickable) ──────────────────────────────────────
  const TicketRow = ({ t }) => (
    <div
      draggable
      onDragStart={e => { e.dataTransfer.setData('ticketId', t.id); e.dataTransfer.effectAllowed = 'move' }}
      onClick={() => openTicketView(t.id)}
      style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderBottom: '1px solid var(--gray-100)', cursor: 'pointer', background: 'var(--white)', userSelect: 'none' }}
    >
      <span style={{ fontSize: 10, color: 'var(--gray-300)', cursor: 'grab' }}>⠿</span>
      <span className={`badge ${getTypeColor(t.type)}`} style={{ fontSize: 9 }}>{t.type}</span>
      <span style={{ fontSize: 11, color: 'var(--blue)', fontWeight: 700, minWidth: 64 }}>{t.id}</span>
      <span style={{ flex: 1, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.title}</span>
      {t.storyPoints != null && (
        <span style={{ fontSize: 10, background: '#eff6ff', color: '#1e40af', borderRadius: 8, padding: '1px 6px', fontWeight: 600 }}>{t.storyPoints}p</span>
      )}
      <span className={`badge ${getStatusClass(t.status)}`} style={{ fontSize: 10 }}>{t.status}</span>
      <span className={priorityClass(t.priority)} style={{ fontSize: 10 }}>{t.priority}</span>
      <Avatar name={t.assignee} size={22} />
    </div>
  )

  // ── Sprint panel ───────────────────────────────────────────────────────────
  const SprintPanel = ({ sprint }) => {
    const spTickets = tickets.filter(t => t.project === pid && t.sprint === sprint.name)
    const doneCount = spTickets.filter(t => t.status === 'Done').length
    const isOpen    = expanded[sprint.id] !== false
    const isOver    = dragOver === sprint.id

    const statusColor = sprint.status === 'active' ? '#10b981' : sprint.status === 'completed' ? '#9ca3af' : '#3b82f6'
    const statusLabel = sprint.status === 'active' ? '⚡ Active' : sprint.status === 'completed' ? '✓ Completed' : '📅 Planning'

    return (
      <div
        style={{ marginBottom: 10, border: `2px solid ${isOver ? '#2563eb' : 'var(--gray-200)'}`, borderRadius: 8, overflow: 'hidden', transition: 'border-color .15s' }}
        onDragOver={e => { e.preventDefault(); setDragOver(sprint.id) }}
        onDragLeave={e => { if (!e.currentTarget.contains(e.relatedTarget)) setDragOver(null) }}
        onDrop={e => handleDrop(e, sprint.name)}
      >
        {/* Header */}
        <div
          style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: isOver ? '#eff6ff' : 'var(--gray-50)', cursor: 'pointer', userSelect: 'none' }}
          onClick={() => toggleExpand(sprint.id)}
        >
          <span style={{ fontSize: 11, color: 'var(--gray-400)' }}>{isOpen ? '▼' : '▶'}</span>
          <span style={{ fontWeight: 700, fontSize: 14 }}>{sprint.name}</span>
          <span style={{ fontSize: 10, padding: '1px 7px', borderRadius: 10, background: statusColor + '20', color: statusColor, fontWeight: 700 }}>{statusLabel}</span>
          {sprint.goal && <span style={{ fontSize: 12, color: 'var(--gray-500)', fontStyle: 'italic', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{sprint.goal}</span>}
          {!sprint.goal && <span style={{ flex: 1 }} />}
          {sprint.startDate && (
            <span style={{ fontSize: 11, color: 'var(--gray-400)', whiteSpace: 'nowrap' }}>{sprint.startDate} → {sprint.endDate || '?'}</span>
          )}
          <span style={{ fontSize: 12, color: 'var(--gray-500)', whiteSpace: 'nowrap' }}>
            {spTickets.length} issues · {doneCount} done
          </span>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 6 }} onClick={e => e.stopPropagation()}>
            {/* Edit button — always visible for planning/active sprints */}
            {sprint.status !== 'completed' && (
              <button
                className="btn btn-ghost btn-sm"
                title="Edit sprint details"
                onClick={() => {
                  setEditingSprintId(editingSprintId === sprint.id ? null : sprint.id)
                  setEditForm({ name: sprint.name, goal: sprint.goal || '', startDate: sprint.startDate || '', endDate: sprint.endDate || '' })
                }}
                style={{ fontSize: 13 }}
              >
                ✏ Edit
              </button>
            )}
            {sprint.status === 'planning' && (
              <>
                <button className="btn btn-primary btn-sm" onClick={() => { setStartForm(sprint.id); setStartDates({ startDate: '', endDate: '' }) }}>
                  ▶ Start Sprint
                </button>
                <button className="btn btn-ghost btn-sm" title="Delete sprint" onClick={() => window.confirm(`Delete "${sprint.name}"?`) && doDeleteSprint(sprint.id)}>
                  🗑
                </button>
              </>
            )}
            {sprint.status === 'active' && (
              <button className="btn btn-outline btn-sm" style={{ color: 'var(--red)', borderColor: 'var(--red)' }} onClick={() => setCompleteId(sprint.id)}>
                ✓ Complete Sprint
              </button>
            )}
          </div>
        </div>

        {/* ── Inline sprint edit form ── */}
        {editingSprintId === sprint.id && (
          <div style={{ padding: '16px 18px', background: '#f8faff', borderTop: '1.5px solid #bfdbfe' }}>
            <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 14, color: '#1e40af' }}>✏ Edit Sprint Details</div>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 12 }}>
              <div style={{ flex: '1 1 160px' }}>
                <label className="form-label">Sprint Name <span style={{ color: '#ef4444' }}>*</span></label>
                <input
                  className="form-input"
                  value={editForm.name}
                  onChange={e => setEditForm(p => ({ ...p, name: e.target.value }))}
                />
              </div>
              <div style={{ flex: '2 1 240px' }}>
                <label className="form-label">Sprint Goal</label>
                <input
                  className="form-input"
                  placeholder="What do you want to achieve?"
                  value={editForm.goal}
                  onChange={e => setEditForm(p => ({ ...p, goal: e.target.value }))}
                />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap' }}>
              <div>
                <label className="form-label">Start Date</label>
                <input className="form-input" type="date" value={editForm.startDate} onChange={e => setEditForm(p => ({ ...p, startDate: e.target.value }))} />
              </div>
              <div>
                <label className="form-label">End Date</label>
                <input className="form-input" type="date" value={editForm.endDate} onChange={e => setEditForm(p => ({ ...p, endDate: e.target.value }))} />
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={async () => {
                    if (!editForm.name?.trim()) return
                    await doUpdateSprint(sprint.id, editForm)
                    setEditingSprintId(null)
                  }}
                >💾 Save</button>
                <button className="btn btn-ghost btn-sm" onClick={() => setEditingSprintId(null)}>Cancel</button>
              </div>
            </div>
          </div>
        )}

        {/* Start sprint form */}
        {startForm === sprint.id && (
          <div style={{ padding: '12px 16px', background: '#eff6ff', borderTop: '1px solid var(--gray-200)' }}>
            <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 10 }}>Set sprint dates for "{sprint.name}"</div>
            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end', flexWrap: 'wrap' }}>
              <div>
                <label className="form-label">Start Date</label>
                <input className="form-input" type="date" value={startDates.startDate} onChange={e => setStartDates(p => ({ ...p, startDate: e.target.value }))} />
              </div>
              <div>
                <label className="form-label">End Date</label>
                <input className="form-input" type="date" value={startDates.endDate} onChange={e => setStartDates(p => ({ ...p, endDate: e.target.value }))} />
              </div>
              <button className="btn btn-primary" onClick={() => handleStartSprint(sprint.id)}>Start</button>
              <button className="btn btn-ghost" onClick={() => setStartForm(null)}>Cancel</button>
            </div>
          </div>
        )}

        {/* Complete sprint confirm */}
        {completeId === sprint.id && (
          <div style={{ padding: '12px 16px', background: '#fff7ed', borderTop: '1px solid #fed7aa' }}>
            <div style={{ fontWeight: 600, marginBottom: 6 }}>Complete "{sprint.name}"?</div>
            <div style={{ fontSize: 13, color: 'var(--gray-600)', marginBottom: 10 }}>
              <strong>{spTickets.filter(t => t.status !== 'Done').length}</strong> incomplete tickets will move to the Backlog.
              <strong> {doneCount}</strong> Done tickets stay completed.
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-primary" onClick={() => handleCompleteSprint(sprint.id)}>Complete Sprint</button>
              <button className="btn btn-ghost" onClick={() => setCompleteId(null)}>Cancel</button>
            </div>
          </div>
        )}

        {/* Ticket list */}
        {isOpen && (
          <div>
            {spTickets.length === 0 ? (
              <div style={{ padding: '16px', textAlign: 'center', fontSize: 12, color: 'var(--gray-400)' }}>
                {isOver ? '📥 Drop tickets here to add to this sprint' : 'No tickets — drag from Backlog below to add'}
              </div>
            ) : (
              spTickets.map(t => <TicketRow key={t.id} t={t} />)
            )}
          </div>
        )}
      </div>
    )
  }

  // ── Total story-point summary ──────────────────────────────────────────────
  const allSprintPts  = projectSprints.flatMap(sp => tickets.filter(t => t.project === pid && t.sprint === sp.name))
  const backlogPts    = backlogTickets.reduce((s, t) => s + (t.storyPoints || 0), 0)

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{ fontSize: 13, color: 'var(--gray-500)' }}>
          {projectSprints.length} sprint{projectSprints.length !== 1 ? 's' : ''} · {backlogTickets.length} in backlog
        </div>
        {!showCreate && (
          <button className="btn btn-outline btn-sm" onClick={() => setShowCreate(true)}>+ Create Sprint</button>
        )}
      </div>

      {/* Create sprint form */}
      {showCreate && (
        <div className="card" style={{ padding: 14, marginBottom: 14, border: '2px solid var(--blue)' }}>
          <div style={{ fontWeight: 700, marginBottom: 10 }}>New Sprint</div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Sprint Name *</label>
              <input className="form-input" placeholder="Sprint 5" value={newName} onChange={e => setNewName(e.target.value)} autoFocus />
            </div>
            <div className="form-group">
              <label className="form-label">Sprint Goal</label>
              <input className="form-input" placeholder="What to achieve…" value={newGoal} onChange={e => setNewGoal(e.target.value)} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-primary btn-sm" onClick={handleCreateSprint}>Create</button>
            <button className="btn btn-ghost btn-sm" onClick={() => setShowCreate(false)}>Cancel</button>
          </div>
        </div>
      )}

      {/* Active sprint panel */}
      {activeSprint && <SprintPanel sprint={activeSprint} />}

      {/* Planning sprint panels */}
      {planningSprints.map(sp => <SprintPanel key={sp.id} sprint={sp} />)}

      {/* Backlog section */}
      <div
        style={{ border: `2px solid ${dragOver === 'backlog' ? '#2563eb' : 'var(--gray-200)'}`, borderRadius: 8, overflow: 'hidden', transition: 'border-color .15s' }}
        onDragOver={e => { e.preventDefault(); setDragOver('backlog') }}
        onDragLeave={e => { if (!e.currentTarget.contains(e.relatedTarget)) setDragOver(null) }}
        onDrop={e => handleDrop(e, null)}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: dragOver === 'backlog' ? '#eff6ff' : 'var(--gray-50)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontWeight: 700, fontSize: 14 }}>Backlog</span>
            <span style={{ background: '#e5e7eb', borderRadius: 10, padding: '1px 7px', fontSize: 11, fontWeight: 600 }}>{backlogTickets.length}</span>
            {backlogPts > 0 && <span style={{ fontSize: 11, color: 'var(--gray-400)' }}>{backlogPts} story points</span>}
          </div>
          <button className="btn btn-ghost btn-sm" onClick={() => openModal('createTicket', { project: pid })}>
            + Create Issue
          </button>
        </div>
        {backlogTickets.length === 0 ? (
          <div style={{ padding: 20, textAlign: 'center', fontSize: 12, color: 'var(--gray-400)' }}>
            {dragOver === 'backlog' ? '📥 Drop here to remove from sprint' : 'Backlog is empty — all tickets are in sprints'}
          </div>
        ) : (
          backlogTickets.map(t => <TicketRow key={t.id} t={t} />)
        )}
      </div>

      {/* Completed sprints (collapsed by default) */}
      {completedSprints.length > 0 && (
        <div style={{ marginTop: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--gray-400)', letterSpacing: .5, marginBottom: 8 }}>
            COMPLETED SPRINTS ({completedSprints.length})
          </div>
          {completedSprints.map(sp => <SprintPanel key={sp.id} sprint={sp} />)}
        </div>
      )}
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// ── PROJECT REPORTS ───────────────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════
function ProjectReports({ pid, tickets }) {
  const ptix        = tickets.filter(t => t.project === pid)
  const byStatus    = {}
  const byType      = {}
  const byAssignee  = {}
  const byPriority  = {}

  ptix.forEach(t => {
    byStatus[t.status]     = (byStatus[t.status]     || 0) + 1
    byType[t.type]         = (byType[t.type]         || 0) + 1
    byAssignee[t.assignee] = (byAssignee[t.assignee] || 0) + 1
    byPriority[t.priority] = (byPriority[t.priority] || 0) + 1
  })

  const maxStatus = Math.max(...Object.values(byStatus), 1)

  return (
    <div>
      <div className="grid-2" style={{ marginBottom: 20 }}>
        {[
          { label: 'Total Tickets',  val: ptix.length,                                   color: '#3b82f6' },
          { label: 'In Progress',    val: byStatus['In Progress'] || 0,                  color: '#f59e0b' },
          { label: 'Done',           val: byStatus['Done']        || 0,                  color: '#10b981' },
          { label: 'Blocked',        val: byStatus['Blocked']     || 0,                  color: '#ef4444' },
        ].map(({ label, val, color }) => (
          <div key={label} className="card" style={{ padding: '16px 20px' }}>
            <div style={{ fontSize: 28, fontWeight: 800, color }}>{val}</div>
            <div style={{ fontSize: 13, color: 'var(--gray-500)', marginTop: 4 }}>{label}</div>
          </div>
        ))}
      </div>

      <div className="grid-2">
        {/* Status breakdown */}
        <div className="card" style={{ padding: 16 }}>
          <div style={{ fontWeight: 700, marginBottom: 12 }}>By Status</div>
          {Object.entries(byStatus).sort((a,b) => b[1]-a[1]).map(([k,v]) => (
            <div key={k} style={{ marginBottom: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 3 }}>
                <span>{k}</span><span style={{ fontWeight: 600 }}>{v}</span>
              </div>
              <div style={{ height: 6, background: 'var(--gray-200)', borderRadius: 3 }}>
                <div style={{ height: '100%', width: `${v/maxStatus*100}%`, background: COL_COLORS[k] || '#64748b', borderRadius: 3 }} />
              </div>
            </div>
          ))}
        </div>

        {/* Assignee breakdown */}
        <div className="card" style={{ padding: 16 }}>
          <div style={{ fontWeight: 700, marginBottom: 12 }}>By Assignee</div>
          {Object.entries(byAssignee).sort((a,b) => b[1]-a[1]).slice(0,8).map(([k,v]) => (
            <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <Avatar name={k} size={22} />
              <span style={{ flex: 1, fontSize: 12 }}>{k}</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--blue)' }}>{v}</span>
            </div>
          ))}
        </div>

        {/* Type breakdown */}
        <div className="card" style={{ padding: 16 }}>
          <div style={{ fontWeight: 700, marginBottom: 12 }}>By Type</div>
          {Object.entries(byType).sort((a,b) => b[1]-a[1]).map(([k,v]) => (
            <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, padding: '4px 0', borderBottom: '1px solid var(--gray-100)' }}>
              <span>{k}</span><span style={{ fontWeight: 600 }}>{v}</span>
            </div>
          ))}
        </div>

        {/* Priority breakdown */}
        <div className="card" style={{ padding: 16 }}>
          <div style={{ fontWeight: 700, marginBottom: 12 }}>By Priority</div>
          {['Critical','High','Medium','Low'].filter(p => byPriority[p]).map(p => (
            <div key={p} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, padding: '4px 0', borderBottom: '1px solid var(--gray-100)' }}>
              <span className={priorityClass(p)}>{p}</span><span style={{ fontWeight: 600 }}>{byPriority[p]}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// ── WORKFLOW EDITOR ───────────────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════
const DEFAULT_WORKFLOW = {
  statuses: [
    { name: 'To Do',       color: '#64748b' },
    { name: 'In Progress', color: '#3b82f6' },
    { name: 'In Review',   color: '#8b5cf6' },
    { name: 'Done',        color: '#10b981' },
    { name: 'Blocked',     color: '#ef4444' },
  ],
  transitions: [
    ['To Do',       'In Progress'],
    ['In Progress', 'In Review'],
    ['In Progress', 'Blocked'],
    ['In Review',   'In Progress'],
    ['In Review',   'Done'],
    ['Blocked',     'In Progress'],
    ['To Do',       'Blocked'],
  ],
}

function WorkflowEditor({ project }) {
  const [workflow, setWorkflow] = useState(null)
  const [saved, setSaved]       = useState(false)
  const [newStatus, setNewStatus] = useState('')
  const [newColor,  setNewColor]  = useState('#1a56db')

  useEffect(() => {
    api.getProjectWorkflow(project.id)
      .then(wf => setWorkflow(wf))
      .catch(() => setWorkflow({ ...DEFAULT_WORKFLOW }))
  }, [project.id])

  if (!workflow) return <div style={{ padding: 20, color: 'var(--gray-400)' }}>Loading workflow…</div>

  const { statuses, transitions } = workflow

  const hasTransition = (from, to) =>
    transitions.some(([f, t]) => f === from && t === to)

  const toggleTransition = (from, to) => {
    if (from === to) return
    const exists = hasTransition(from, to)
    const newTransitions = exists
      ? transitions.filter(([f, t]) => !(f === from && t === to))
      : [...transitions, [from, to]]
    setWorkflow({ ...workflow, transitions: newTransitions })
  }

  const handleSave = async () => {
    await api.updateProjectWorkflow(project.id, workflow)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const addStatus = () => {
    const name = newStatus.trim()
    if (!name || statuses.some(s => s.name === name)) return
    setWorkflow({ ...workflow, statuses: [...statuses, { name, color: newColor }] })
    setNewStatus('')
  }

  const removeStatus = (name) => {
    setWorkflow({
      ...workflow,
      statuses: statuses.filter(s => s.name !== name),
      transitions: transitions.filter(([f, t]) => f !== name && t !== name),
    })
  }

  const updateStatusColor = (name, color) => {
    setWorkflow({
      ...workflow,
      statuses: statuses.map(s => s.name === name ? { ...s, color } : s),
    })
  }

  return (
    <div style={{ maxWidth: 780 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 800 }}>⚡ Workflow</div>
          <div style={{ fontSize: 12, color: 'var(--gray-500)', marginTop: 2 }}>{project.name}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {saved && <span style={{ fontSize: 13, color: '#10b981', fontWeight: 600 }}>✓ Saved</span>}
          <button className="btn btn-primary btn-sm" onClick={handleSave}>Save Workflow</button>
        </div>
      </div>

      {/* Statuses */}
      <div className="card" style={{ padding: 20, marginBottom: 16 }}>
        <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Statuses</span>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 16 }}>
          {statuses.map(s => (
            <div key={s.name} style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px',
              border: `2px solid ${s.color}40`, borderRadius: 10,
              background: `${s.color}10`,
            }}>
              <input
                type="color"
                value={s.color}
                onChange={e => updateStatusColor(s.name, e.target.value)}
                style={{ width: 22, height: 22, border: 'none', cursor: 'pointer', borderRadius: 4, background: 'transparent' }}
              />
              <span style={{ fontWeight: 700, fontSize: 13, color: s.color }}>{s.name}</span>
              <button
                onClick={() => removeStatus(s.name)}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'var(--gray-400)', fontSize: 14, lineHeight: 1, padding: 0,
                }}
                title="Remove status"
              >×</button>
            </div>
          ))}
        </div>
        {/* Add status */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input
            className="form-input"
            placeholder="New status name…"
            value={newStatus}
            onChange={e => setNewStatus(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addStatus()}
            style={{ fontSize: 13, padding: '6px 10px', flex: 1, maxWidth: 240 }}
          />
          <input
            type="color"
            value={newColor}
            onChange={e => setNewColor(e.target.value)}
            style={{ width: 34, height: 34, border: '1.5px solid var(--gray-200)', cursor: 'pointer', borderRadius: 6 }}
          />
          <button className="btn btn-secondary btn-sm" onClick={addStatus}>+ Add Status</button>
        </div>
      </div>

      {/* Transitions matrix */}
      <div className="card" style={{ padding: 20 }}>
        <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>Transitions</div>
        <div style={{ fontSize: 12, color: 'var(--gray-500)', marginBottom: 14 }}>
          Click a cell to toggle whether that transition is allowed. Rows = From, Columns = To.
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: 12 }}>
            <thead>
              <tr>
                <th style={{ padding: '6px 10px', textAlign: 'left', color: 'var(--gray-500)', fontWeight: 600, width: 120 }}>From \ To</th>
                {statuses.map(s => (
                  <th key={s.name} style={{ padding: '6px 8px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                    <span style={{ color: s.color, fontWeight: 700 }}>{s.name}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {statuses.map(fromS => (
                <tr key={fromS.name} style={{ borderTop: '1px solid var(--gray-100)' }}>
                  <td style={{ padding: '8px 10px', fontWeight: 700, color: fromS.color, whiteSpace: 'nowrap' }}>
                    {fromS.name}
                  </td>
                  {statuses.map(toS => {
                    const isSame = fromS.name === toS.name
                    const allowed = !isSame && hasTransition(fromS.name, toS.name)
                    return (
                      <td
                        key={toS.name}
                        style={{
                          padding: '8px',
                          textAlign: 'center',
                          cursor: isSame ? 'default' : 'pointer',
                          background: isSame ? 'var(--gray-50)' : allowed ? `${toS.color}12` : 'transparent',
                          transition: 'background .15s',
                          borderRadius: 4,
                        }}
                        onClick={() => toggleTransition(fromS.name, toS.name)}
                        title={isSame ? '—' : `${fromS.name} → ${toS.name}`}
                      >
                        {isSame ? (
                          <span style={{ color: 'var(--gray-300)' }}>—</span>
                        ) : allowed ? (
                          <span style={{ color: '#10b981', fontSize: 16 }}>✓</span>
                        ) : (
                          <span style={{ color: 'var(--gray-200)', fontSize: 13 }}>○</span>
                        )}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// ── PROJECT SETTINGS (multi-section) ─────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════
const MEMBER_ROLES = ['Lead', 'Developer', 'Designer', 'QA Engineer', 'DevOps', 'Product Manager', 'Scrum Master']
const FIELD_TYPES  = ['text', 'number', 'date', 'user', 'tags', 'sprint', 'url', 'select']

function ProjectSettings({ project }) {
  const { users, doUpdateProject } = useApp()

  const [section, setSection] = useState('details')

  // ── Details form ──
  const [name,  setName]  = useState(project.name)
  const [desc,  setDesc]  = useState(project.description || '')
  const [lead,  setLead]  = useState(project.lead || '')
  const [color, setColor] = useState(project.color || '#1a56db')
  const [saved, setSaved] = useState(false)

  const handleSave = async () => {
    await doUpdateProject(project.id, { name: name.trim(), description: desc, lead, color })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  // ── Fields ──
  const [fields, setFields] = useState([
    { id: 1, name: 'Story Points', type: 'number',  required: false },
    { id: 2, name: 'Sprint',       type: 'sprint',  required: false },
    { id: 3, name: 'Assignee',     type: 'user',    required: false },
    { id: 4, name: 'Due Date',     type: 'date',    required: false },
    { id: 5, name: 'Labels',       type: 'tags',    required: false },
  ])
  const [newFieldName, setNewFieldName] = useState('')
  const [newFieldType, setNewFieldType] = useState('text')

  const addField = () => {
    const nm = newFieldName.trim()
    if (!nm || fields.some(f => f.name === nm)) return
    setFields(prev => [...prev, { id: Date.now(), name: nm, type: newFieldType, required: false }])
    setNewFieldName('')
  }

  // ── Teams / Members ──
  const [members, setMembers] = useState(() => {
    const leadUser = users.find(u => u.name === project.lead)
    return leadUser ? [{ userId: leadUser.id, role: 'Lead' }] : []
  })
  const [addUserId, setAddUserId] = useState('')
  const [addRole,   setAddRole]   = useState('Developer')

  const addMember = () => {
    if (!addUserId) return
    const uid = Number(addUserId)
    if (members.some(m => m.userId === uid)) return
    setMembers(prev => [...prev, { userId: uid, role: addRole }])
    setAddUserId('')
    setAddRole('Developer')
  }

  const removeMember = uid  => setMembers(prev => prev.filter(m => m.userId !== uid))
  const updateRole   = (uid, role) => setMembers(prev => prev.map(m => m.userId === uid ? { ...m, role } : m))

  const SECTIONS = [
    { key: 'details',  label: 'Project Details', icon: '📋' },
    { key: 'workflow', label: 'Workflow',         icon: '⚡' },
    { key: 'fields',   label: 'Fields',           icon: '🔧' },
    { key: 'teams',    label: 'Teams',            icon: '👥' },
  ]

  return (
    <div style={{ display: 'flex', gap: 22, alignItems: 'flex-start' }}>

      {/* ── Left sub-nav ── */}
      <div style={{ width: 190, flexShrink: 0 }}>
        <div style={{ background: 'var(--white)', border: '1.5px solid var(--gray-200)', borderRadius: 10, overflow: 'hidden' }}>
          {SECTIONS.map(s => (
            <div
              key={s.key}
              onClick={() => setSection(s.key)}
              style={{
                padding: '11px 16px', cursor: 'pointer', fontSize: 13,
                fontWeight: section === s.key ? 700 : 400,
                background: section === s.key ? '#eff6ff' : 'transparent',
                color: section === s.key ? 'var(--blue)' : 'var(--text)',
                borderLeft: `3px solid ${section === s.key ? 'var(--blue)' : 'transparent'}`,
                display: 'flex', alignItems: 'center', gap: 8,
                transition: 'all .15s', userSelect: 'none',
              }}
            >
              <span>{s.icon}</span> {s.label}
            </div>
          ))}
        </div>
      </div>

      {/* ── Right content ── */}
      <div style={{ flex: 1, minWidth: 0 }}>

        {/* ── Project Details ── */}
        {section === 'details' && (
          <div style={{ maxWidth: 540 }}>
            <div style={{ fontWeight: 800, fontSize: 17, marginBottom: 16 }}>📋 Project Details</div>
            <div className="card" style={{ padding: 20 }}>
              <div className="form-group">
                <label className="form-label">Project Name</label>
                <input className="form-input" value={name} onChange={e => setName(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="form-textarea" rows={3} value={desc} onChange={e => setDesc(e.target.value)} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Project Lead</label>
                  <input className="form-input" placeholder="Lead name" value={lead} onChange={e => setLead(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Color</label>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <input type="color" value={color} onChange={e => setColor(e.target.value)} style={{ width: 40, height: 36, border: 'none', cursor: 'pointer', borderRadius: 4 }} />
                    <span style={{ fontSize: 12, color: 'var(--gray-500)' }}>{color}</span>
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 8 }}>
                <button className="btn btn-primary" onClick={handleSave}>Save Changes</button>
                {saved && <span style={{ fontSize: 13, color: '#10b981', fontWeight: 600 }}>✓ Saved</span>}
              </div>
            </div>
            <div className="card" style={{ padding: 20, marginTop: 14 }}>
              <div style={{ fontWeight: 700, marginBottom: 8 }}>Project Info</div>
              <div style={{ fontSize: 12, color: 'var(--gray-500)', display: 'flex', flexDirection: 'column', gap: 4 }}>
                <div>Key: <strong style={{ color: 'var(--text)' }}>{project.key}</strong></div>
                <div>Created: {project.created}</div>
                <div>Status: {project.status}</div>
              </div>
            </div>
          </div>
        )}

        {/* ── Workflow ── */}
        {section === 'workflow' && <WorkflowEditor project={project} />}

        {/* ── Fields ── */}
        {section === 'fields' && (
          <div style={{ maxWidth: 580 }}>
            <div style={{ fontWeight: 800, fontSize: 17, marginBottom: 16 }}>🔧 Fields</div>
            <div className="card" style={{ padding: 20 }}>
              <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 14 }}>Ticket Fields for {project.name}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 18 }}>
                {fields.map(f => (
                  <div key={f.id} style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '10px 14px', border: '1.5px solid var(--gray-200)',
                    borderRadius: 8, background: 'var(--gray-50)',
                  }}>
                    <span style={{ flex: 1, fontSize: 13, fontWeight: 600 }}>{f.name}</span>
                    <span style={{ fontSize: 11, background: '#eff6ff', color: '#1e40af', borderRadius: 10, padding: '2px 9px', fontWeight: 600 }}>{f.type}</span>
                    {f.required && <span style={{ fontSize: 11, color: '#ef4444', fontWeight: 700 }}>Required</span>}
                    <label style={{ fontSize: 11, color: 'var(--gray-500)', display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={f.required}
                        onChange={() => setFields(prev => prev.map(x => x.id === f.id ? { ...x, required: !x.required } : x))}
                      />
                      Required
                    </label>
                    <button
                      onClick={() => setFields(prev => prev.filter(x => x.id !== f.id))}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gray-400)', fontSize: 18, lineHeight: 1, padding: 0 }}
                    >×</button>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '12px 14px', background: '#f8faff', borderRadius: 8, border: '1px solid var(--gray-200)' }}>
                <input
                  className="form-input"
                  placeholder="New field name…"
                  value={newFieldName}
                  onChange={e => setNewFieldName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addField()}
                  style={{ flex: 1 }}
                />
                <select className="form-select" value={newFieldType} onChange={e => setNewFieldType(e.target.value)} style={{ width: 110 }}>
                  {FIELD_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <button className="btn btn-secondary btn-sm" onClick={addField}>+ Add Field</button>
              </div>
            </div>
          </div>
        )}

        {/* ── Teams ── */}
        {section === 'teams' && (
          <div style={{ maxWidth: 620 }}>
            <div style={{ fontWeight: 800, fontSize: 17, marginBottom: 16 }}>👥 Teams</div>
            <div className="card" style={{ padding: 20 }}>
              <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 14 }}>Project Members</div>

              {members.length === 0 && (
                <div style={{ textAlign: 'center', padding: '24px', color: 'var(--gray-400)', fontSize: 13, marginBottom: 12 }}>
                  No members yet. Add someone below.
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 18 }}>
                {members.map(m => {
                  const u = users.find(u => u.id === m.userId)
                  if (!u) return null
                  return (
                    <div key={m.userId} style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      padding: '12px 14px', border: '1.5px solid var(--gray-200)',
                      borderRadius: 10, background: 'var(--white)',
                    }}>
                      <Avatar name={u.name} size={34} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 700 }}>{u.name}</div>
                        <div style={{ fontSize: 11, color: 'var(--gray-500)' }}>{u.email || u.name.toLowerCase().replace(' ', '.') + '@company.com'}</div>
                      </div>
                      <select
                        className="form-select"
                        value={m.role}
                        onChange={e => updateRole(m.userId, e.target.value)}
                        style={{ width: 160, fontSize: 12 }}
                      >
                        {MEMBER_ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                      </select>
                      <button
                        onClick={() => removeMember(m.userId)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gray-400)', fontSize: 20, lineHeight: 1, padding: '0 4px' }}
                        title="Remove member"
                      >×</button>
                    </div>
                  )
                })}
              </div>

              {/* Add member row */}
              <div style={{ padding: '14px 16px', background: 'var(--gray-50)', borderRadius: 10, border: '1.5px solid var(--gray-200)' }}>
                <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 10, color: 'var(--gray-700)' }}>Add Member</div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                  <select
                    className="form-select"
                    value={addUserId}
                    onChange={e => setAddUserId(e.target.value)}
                    style={{ flex: 1, minWidth: 160 }}
                  >
                    <option value="">Select user…</option>
                    {users.filter(u => u.active && !members.some(m => m.userId === u.id)).map(u => (
                      <option key={u.id} value={u.id}>{u.name}</option>
                    ))}
                  </select>
                  <select
                    className="form-select"
                    value={addRole}
                    onChange={e => setAddRole(e.target.value)}
                    style={{ width: 170 }}
                  >
                    {MEMBER_ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={addMember}
                    disabled={!addUserId}
                    style={{ whiteSpace: 'nowrap' }}
                  >
                    + Add
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// ── MAIN EXPORT ───────────────────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════
export default function ProjectDetail() {
  const {
    activeProject, projectTab, setProjectTab,
    tickets, sprints, projects, projectById, openModal,
  } = useApp()

  const pid     = activeProject
  const project = projectById(pid)

  // Project-scoped data passed to children
  const projectTickets = useMemo(() => tickets.filter(t => t.project === pid), [tickets, pid])
  const projectSprints = useMemo(() => sprints.filter(s => s.project === pid), [sprints, pid])

  if (!project) return <div className="page"><div className="empty-state">Project not found</div></div>

  const TABS = [
    { key: 'board',    label: 'Board',    icon: '📋' },
    { key: 'backlog',  label: 'Backlog',  icon: '📃' },
    { key: 'roadmap',  label: 'Roadmap',  icon: '🗺' },
    { key: 'reports',  label: 'Reports',  icon: '📊' },
    { key: 'settings', label: 'Settings', icon: '⚙' },
  ]

  return (
    <div className="page">
      {/* Project header */}
      <div className="page-header" style={{ marginBottom: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12, background: project.color || 'var(--blue)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
            boxShadow: `0 2px 10px ${project.color || 'var(--blue)'}40`,
          }}>
            {project.icon || '📁'}
          </div>
          <div>
            <div className="page-title" style={{ marginBottom: 1 }}>{project.name}</div>
            <div style={{ fontSize: 12, color: 'var(--gray-500)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontWeight: 700, color: project.color || 'var(--blue)', background: `${project.color || 'var(--blue)'}15`, padding: '1px 7px', borderRadius: 5, fontSize: 11 }}>{project.key}</span>
              {project.lead && <span>Lead: {project.lead}</span>}
            </div>
          </div>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => openModal('createTicket', { project: pid })}>
          + Create Ticket
        </button>
      </div>

      {/* Tab bar */}
      <div style={{ marginTop: 16, marginBottom: 20 }}>
        <div className="tab-bar">
          {TABS.map(t => (
            <button
              key={t.key}
              className={projectTab === t.key ? 'active' : ''}
              onClick={() => setProjectTab(t.key)}
            >
              <span>{t.icon}</span>
              <span>{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      {projectTab === 'board' && (
        <BoardsManager pid={pid} tickets={projectTickets} sprints={projectSprints} />
      )}

      {projectTab === 'backlog' && (
        <BacklogView pid={pid} tickets={projectTickets} sprints={projectSprints} />
      )}

      {projectTab === 'roadmap' && (
        <Roadmap project={project} tickets={projectTickets} />
      )}

      {projectTab === 'reports' && (
        <ProjectReports pid={pid} tickets={projectTickets} />
      )}

      {projectTab === 'settings' && (
        <ProjectSettings project={project} />
      )}
    </div>
  )
}
