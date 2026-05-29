import React, { useState, useCallback, useMemo } from 'react'
import { useApp } from '../../context/AppContext'
import Avatar from '../common/Avatar'
import { getTypeColor, getStatusClass, priorityClass } from '../common/Badge'
import Roadmap from '../Roadmap'

const ISSUE_TYPES = ['Feature', 'Initiative', 'Epic', 'Story', 'Task', 'Sub-task']
const PRIORITIES  = ['Critical', 'High', 'Medium', 'Low']

const COL_COLORS = {
  'To Do': '#64748b', 'In Progress': '#f59e0b',
  'In Review': '#8b5cf6', 'Done': '#10b981', 'Blocked': '#ef4444',
}
const COL_ICONS = {
  'To Do': '📋', 'In Progress': '⚡', 'In Review': '👁', 'Done': '✅', 'Blocked': '🚫',
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
  return (
    <div
      className="kanban-col"
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={e => onDrop(e, status)}
      style={{
        outline: isOver ? `2px dashed ${COL_COLORS[status]}` : 'none',
        background: isOver ? `${COL_COLORS[status]}08` : undefined,
        borderRadius: 8, transition: 'all .15s',
      }}
    >
      <div className="kanban-col-header" style={{ borderBottom: `3px solid ${(COL_COLORS[status] || '#64748b')}30` }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          {COL_ICONS[status] || '📌'} {status}
        </span>
        <span style={{ background: COL_COLORS[status] || '#64748b', color: '#fff', borderRadius: 10, padding: '1px 7px', fontSize: 10, fontWeight: 700 }}>
          {cards.length}
        </span>
      </div>
      <div className="kanban-col-body">
        {cards.map(t => (
          <TicketCard key={t.id} ticket={t} onDragStart={onDragStart} onClick={openTicketView} />
        ))}
        {cards.length === 0 && (
          <div style={{ border: '2px dashed var(--gray-200)', borderRadius: 8, padding: '20px 8px', textAlign: 'center', fontSize: 11, color: 'var(--gray-400)' }}>
            {isOver ? '📥 Drop here' : 'No issues'}
          </div>
        )}
        <div
          style={{ textAlign: 'center', padding: '8px 0', fontSize: 11, color: 'var(--gray-400)', cursor: 'pointer' }}
          onClick={() => openModal('createTicket', { project: pid })}
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
// ── KANBAN BOARD (continuous flow — all project tickets, no sprint filter) ───
// ══════════════════════════════════════════════════════════════════════════════
function KanbanBoard({ board, pid, tickets }) {
  const { openModal, openTicketView } = useApp()
  const cols   = board.columns || ['To Do', 'In Progress', 'In Review', 'Done', 'Blocked']
  const ptix   = tickets.filter(t => t.project === pid)
  const { dragOverCol, handleDragStart, handleDragOver, handleDragLeave, handleDrop } = useDragDrop(ptix)

  const total  = ptix.length
  const done   = ptix.filter(t => t.status === 'Done').length
  const wip    = ptix.filter(t => t.status === 'In Progress').length

  return (
    <div>
      {/* Info bar */}
      <div style={{ display: 'flex', gap: 20, padding: '10px 14px', background: 'var(--gray-50)', borderRadius: 8, border: '1px solid var(--gray-200)', marginBottom: 14, fontSize: 12, color: 'var(--gray-600)' }}>
        <span>📊 <strong>{total}</strong> total</span>
        <span>⚡ <strong>{wip}</strong> in progress</span>
        <span>✅ <strong>{done}</strong> done</span>
        <span style={{ flex: 1 }} />
        <span style={{ fontSize: 11, color: 'var(--gray-400)' }}>Continuous flow · all tickets</span>
      </div>

      {/* Columns */}
      <div className="kanban-board">
        {cols.map(col => (
          <DropColumn
            key={col} status={col}
            cards={ptix.filter(t => t.status === col)}
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
// ── SCRUM BOARD (active sprint columns) ──────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════
function ScrumBoard({ board, pid, tickets, sprints }) {
  const { openModal, openTicketView, setProjectTab } = useApp()
  const cols           = board.columns || ['To Do', 'In Progress', 'In Review', 'Done']
  const projectSprints = sprints.filter(s => s.project === pid).sort((a,b) => a.order - b.order)
  const activeSprint   = projectSprints.find(s => s.status === 'active')
  const planningSprints = projectSprints.filter(s => s.status === 'planning')

  const sprintTickets = activeSprint
    ? tickets.filter(t => t.project === pid && t.sprint === activeSprint.name)
    : []
  const doneCount  = sprintTickets.filter(t => t.status === 'Done').length
  const progress   = sprintTickets.length ? Math.round(doneCount / sprintTickets.length * 100) : 0

  const { dragOverCol, handleDragStart, handleDragOver, handleDragLeave, handleDrop } = useDragDrop(sprintTickets)

  // ── No active sprint ───────────────────────────────────────────────────────
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
        <button className="btn btn-primary" onClick={() => setProjectTab('backlog')}>
          Go to Backlog →
        </button>
      </div>
    )
  }

  return (
    <div>
      {/* Sprint banner */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 16px', background: 'linear-gradient(135deg,#eff6ff,#f0fdf4)', borderRadius: 8, border: '1px solid #bfdbfe', marginBottom: 16 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span style={{ fontWeight: 800, fontSize: 15 }}>{activeSprint.name}</span>
            <span className="badge badge-green" style={{ fontSize: 10 }}>ACTIVE</span>
            {activeSprint.goal && (
              <span style={{ fontSize: 12, color: 'var(--gray-600)', fontStyle: 'italic' }}>
                — {activeSprint.goal}
              </span>
            )}
          </div>
          {activeSprint.startDate && (
            <div style={{ fontSize: 11, color: 'var(--gray-500)', marginBottom: 6 }}>
              {activeSprint.startDate} → {activeSprint.endDate || 'ongoing'}
            </div>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 180, height: 6, background: 'var(--gray-200)', borderRadius: 3, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${progress}%`, background: '#10b981', borderRadius: 3, transition: 'width .3s' }} />
            </div>
            <span style={{ fontSize: 11, color: 'var(--gray-500)' }}>
              {doneCount}/{sprintTickets.length} done ({progress}%)
            </span>
          </div>
        </div>
        <button
          className="btn btn-outline btn-sm"
          onClick={() => setProjectTab('backlog')}
          title="Manage sprints in Backlog tab"
        >
          ⚙ Manage Sprint
        </button>
      </div>

      {/* Board columns */}
      <div className="kanban-board">
        {cols.map(col => (
          <DropColumn
            key={col} status={col}
            cards={sprintTickets.filter(t => t.status === col)}
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
// ── BOARDS MANAGER (chip selector + multi-board creation) ────────────────────
// ══════════════════════════════════════════════════════════════════════════════
function CreateBoardForm({ pid, onCreated, onCancel }) {
  const { doCreateBoard } = useApp()
  const [name,  setName]  = useState('')
  const [btype, setBtype] = useState('scrum')
  const [desc,  setDesc]  = useState('')

  const handleCreate = async () => {
    if (!name.trim()) { alert('Board name required'); return }
    const b = await doCreateBoard({ project: pid, name: name.trim(), type: btype, description: desc.trim() })
    onCreated(b)
  }

  return (
    <div className="card" style={{ border: '2px solid var(--blue)', padding: 16, marginBottom: 16 }}>
      <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 12 }}>New Board</div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Board Name *</label>
          <input className="form-input" placeholder="e.g. Sprint Board" value={name} onChange={e => setName(e.target.value)} autoFocus />
        </div>
        <div className="form-group">
          <label className="form-label">Type</label>
          <div style={{ display: 'flex', gap: 8 }}>
            {['scrum','kanban'].map(t => (
              <button
                key={t} type="button"
                onClick={() => setBtype(t)}
                style={{ flex: 1, padding: '8px 0', borderRadius: 6, border: `2px solid ${btype === t ? 'var(--blue)' : 'var(--gray-200)'}`, background: btype === t ? '#eff6ff' : 'var(--white)', fontWeight: btype === t ? 700 : 400, cursor: 'pointer', fontSize: 13 }}
              >
                {t === 'scrum' ? '🏃 Scrum' : '🔄 Kanban'}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Description</label>
        <input className="form-input" placeholder="Optional description" value={desc} onChange={e => setDesc(e.target.value)} />
      </div>

      <div style={{ padding: '8px 12px', background: btype === 'scrum' ? '#eff6ff' : '#f0fdf4', borderRadius: 6, fontSize: 12, color: btype === 'scrum' ? '#1e40af' : '#166534', marginBottom: 12 }}>
        {btype === 'scrum'
          ? '🏃 Scrum — sprint-based. Shows tickets in the active sprint. Manage sprints in the Backlog tab.'
          : '🔄 Kanban — continuous flow. Shows all project tickets across columns with no sprint filtering.'}
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        <button className="btn btn-primary btn-sm" onClick={handleCreate}>Create Board</button>
        <button className="btn btn-ghost btn-sm" onClick={onCancel}>Cancel</button>
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
      <div style={{ textAlign: 'center', padding: '60px 20px' }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
        <div style={{ fontWeight: 600, marginBottom: 8 }}>No boards yet</div>
        <div style={{ fontSize: 13, color: 'var(--gray-400)', marginBottom: 20 }}>Create a Scrum or Kanban board to get started</div>
        <button className="btn btn-primary" onClick={() => setShowCreate(true)}>+ Create Board</button>
      </div>
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
    doCreateSprint, doStartSprint, doCompleteSprint, doDeleteSprint,
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
  const [completeId, setCompleteId]   = useState(null)
  const [dragOver,   setDragOver]     = useState(null) // sprint id | 'backlog'

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
// ── PROJECT SETTINGS ─────────────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════
function ProjectSettings({ project }) {
  const { doUpdateProject } = useApp()
  const [name,   setName]   = useState(project.name)
  const [desc,   setDesc]   = useState(project.description || '')
  const [lead,   setLead]   = useState(project.lead || '')
  const [color,  setColor]  = useState(project.color || '#1a56db')
  const [saved,  setSaved]  = useState(false)

  const handleSave = async () => {
    await doUpdateProject(project.id, { name: name.trim(), description: desc, lead, color })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div style={{ maxWidth: 540 }}>
      <div className="card" style={{ padding: 20 }}>
        <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 16 }}>Project Settings</div>
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

      <div className="card" style={{ padding: 20, marginTop: 16 }}>
        <div style={{ fontWeight: 700, marginBottom: 8 }}>Project Info</div>
        <div style={{ fontSize: 12, color: 'var(--gray-500)', display: 'flex', flexDirection: 'column', gap: 4 }}>
          <div>Key: <strong style={{ color: 'var(--text)' }}>{project.key}</strong></div>
          <div>Created: {project.created}</div>
          <div>Status: {project.status}</div>
        </div>
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
    { key: 'board',    label: '📋 Board' },
    { key: 'backlog',  label: '📃 Backlog' },
    { key: 'roadmap',  label: '🗺 Roadmap' },
    { key: 'reports',  label: '📊 Reports' },
    { key: 'settings', label: '⚙ Settings' },
  ]

  return (
    <div className="page">
      {/* Project header */}
      <div className="page-header" style={{ marginBottom: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 24 }}>{project.icon || '📁'}</span>
          <div>
            <div className="page-title" style={{ marginBottom: 0 }}>{project.name}</div>
            <div style={{ fontSize: 12, color: 'var(--gray-500)' }}>
              <span style={{ fontWeight: 700, color: project.color }}>{project.key}</span>
              {project.lead && <> · Lead: {project.lead}</>}
            </div>
          </div>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => openModal('createTicket', { project: pid })}>
          + Create Ticket
        </button>
      </div>

      {/* Tab bar */}
      <div className="tab-bar" style={{ marginBottom: 18, marginTop: 14 }}>
        {TABS.map(t => (
          <button
            key={t.key}
            className={projectTab === t.key ? 'active' : ''}
            onClick={() => setProjectTab(t.key)}
          >
            {t.label}
          </button>
        ))}
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
