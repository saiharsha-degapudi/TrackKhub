import React, { useMemo } from 'react'
import { useApp } from '../../context/AppContext'
import Avatar from '../common/Avatar'
import { getTypeColor, getStatusClass, priorityClass } from '../common/Badge'

const STATUSES   = ['To Do', 'In Progress', 'In Review', 'Done', 'Blocked']
const PRIORITIES = ['Critical', 'High', 'Medium', 'Low']

export default function TicketView() {
  const {
    viewTicketId, tickets, users, teams, sprints, projects,
    prevPage, nav, openProject, openTicketView, openModal,
    doUpdateTicket, doDeleteTicket, projectById,
  } = useApp()

  const t = tickets.find(x => x.id === viewTicketId)
  if (!t) return <div className="page"><div className="empty-state">Ticket not found</div></div>

  const p        = projectById(t.project)
  const children = tickets.filter(x => x.parent === t.id)
  const parentT  = t.parent ? tickets.find(x => x.id === t.parent) : null

  // ── Project-scoped sprints ─────────────────────────────────────────────────
  const projectSprints = useMemo(
    () => sprints.filter(s => s.project === t.project).sort((a,b) => a.order - b.order),
    [sprints, t.project]
  )

  // ── Team that owns this assignee ───────────────────────────────────────────
  const ownerTeam = useMemo(() => {
    for (const team of teams) {
      if ((team.members || []).some(mid => {
        const u = users.find(u => u.id === mid)
        return u?.name === t.assignee
      })) return team
    }
    return null
  }, [teams, users, t.assignee])

  const handleUpdate = (field, val) => doUpdateTicket(t.id, { [field]: val })

  const handleDelete = () => {
    if (window.confirm('Delete this ticket? This cannot be undone.')) doDeleteTicket(t.id)
  }

  return (
    <div className="page">
      <div className="breadcrumb">
        <span style={{ cursor: 'pointer' }} onClick={() => nav(prevPage || 'alltickets')}>← Back</span>
        <span className="bc-sep">›</span>
        <span style={{ cursor: 'pointer' }} onClick={() => openProject(t.project)}>
          {p?.icon} {p?.name}
        </span>
        <span className="bc-sep">›</span>
        <span style={{ color: 'var(--blue)', fontWeight: 600 }}>{t.id}</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 20, alignItems: 'start' }}>

        {/* ── Left: main content ─────────────────────────────────────────── */}
        <div>
          {/* Type / ID / Status badges */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <span className={`badge ${getTypeColor(t.type)}`}>{t.type}</span>
            <span style={{ fontSize: 12, color: 'var(--blue)', fontWeight: 700 }}>{t.id}</span>
            <span className={`badge ${getStatusClass(t.status)}`}>{t.status}</span>
            <span className={priorityClass(t.priority)} style={{ fontSize: 12 }}>{t.priority}</span>
            {t.storyPoints != null && (
              <span style={{ fontSize: 11, background: '#eff6ff', color: '#1e40af', borderRadius: 10, padding: '1px 8px', fontWeight: 600 }}>
                {t.storyPoints} pts
              </span>
            )}
          </div>

          {/* Title */}
          <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 14, lineHeight: 1.3 }}>{t.title}</div>

          {/* Description */}
          <div style={{ fontSize: 13, color: 'var(--gray-700)', lineHeight: 1.75, padding: 14, background: 'var(--gray-50)', borderRadius: 8, border: '1px solid var(--gray-200)', marginBottom: 16 }}>
            {t.desc || <span style={{ color: 'var(--gray-400)' }}>No description provided.</span>}
          </div>

          {/* Parent */}
          {parentT && (
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--gray-500)', letterSpacing: .5, marginBottom: 6 }}>
                PARENT {parentT.type.toUpperCase()}
              </div>
              <div
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', background: '#eff6ff', borderRadius: 8, border: '1.5px solid #bfdbfe', cursor: 'pointer' }}
                onClick={() => openTicketView(parentT.id)}
              >
                <span className={`badge ${getTypeColor(parentT.type)}`}>{parentT.type}</span>
                <span style={{ fontWeight: 700, color: 'var(--blue)' }}>{parentT.id}</span>
                <span>{parentT.title}</span>
              </div>
            </div>
          )}

          {/* Children */}
          {children.length > 0 && (
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--gray-500)', letterSpacing: .5, marginBottom: 6 }}>
                CHILD ITEMS ({children.length})
              </div>
              {children.map(c => (
                <div
                  key={c.id}
                  style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 12px', border: '1.5px solid var(--gray-200)', borderRadius: 8, cursor: 'pointer', marginBottom: 6, background: 'var(--white)' }}
                  onClick={() => openTicketView(c.id)}
                >
                  <span className={`badge ${getTypeColor(c.type)}`}>{c.type}</span>
                  <span style={{ fontWeight: 700, color: 'var(--blue)' }}>{c.id}</span>
                  <span style={{ flex: 1 }}>{c.title}</span>
                  <span className={`badge ${getStatusClass(c.status)}`}>{c.status}</span>
                </div>
              ))}
            </div>
          )}

          {/* Labels */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--gray-500)', letterSpacing: .5, marginBottom: 6 }}>LABELS</div>
            {t.labels?.length
              ? t.labels.map(l => <span key={l} className="tag" style={{ marginRight: 4 }}>{l}</span>)
              : <span style={{ fontSize: 12, color: 'var(--gray-400)' }}>No labels</span>}
          </div>

          {/* Comment box */}
          <div style={{ padding: 14, background: 'var(--gray-50)', borderRadius: 8, border: '1px solid var(--gray-200)' }}>
            <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 8 }}>Add Comment</div>
            <textarea className="form-textarea" placeholder="Write a comment…" style={{ minHeight: 64 }} />
            <div style={{ textAlign: 'right', marginTop: 6 }}>
              <button className="btn btn-primary btn-sm">Save</button>
            </div>
          </div>
        </div>

        {/* ── Right: details sidebar ──────────────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="card" style={{ padding: '14px 16px' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--gray-500)', letterSpacing: .5, marginBottom: 14 }}>DETAILS</div>

            {/* Status */}
            <div className="form-group">
              <label className="form-label">Status</label>
              <select className="form-select" value={t.status} onChange={e => handleUpdate('status', e.target.value)}>
                {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            {/* Priority */}
            <div className="form-group">
              <label className="form-label">Priority</label>
              <select className="form-select" value={t.priority} onChange={e => handleUpdate('priority', e.target.value)}>
                {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>

            {/* Sprint (project-scoped) */}
            <div className="form-group">
              <label className="form-label">Sprint</label>
              <select
                className="form-select"
                value={t.sprint || ''}
                onChange={e => handleUpdate('sprint', e.target.value || null)}
              >
                <option value="">Backlog (no sprint)</option>
                {projectSprints.map(s => (
                  <option key={s.id} value={s.name}>
                    {s.name}
                    {s.status === 'active' ? ' ⚡ Active' : s.status === 'planning' ? ' · Planning' : ' · Completed'}
                  </option>
                ))}
              </select>
            </div>

            {/* Assignee — all project users */}
            <div className="form-group">
              <label className="form-label">Assignee</label>
              <select className="form-select" value={t.assignee || ''} onChange={e => handleUpdate('assignee', e.target.value)}>
                <option value="">Unassigned</option>
                {users.filter(u => u.active).map(u => <option key={u.id} value={u.name}>{u.name}</option>)}
              </select>
            </div>

            {/* Team (display-only if we found one) */}
            {ownerTeam && (
              <div style={{ fontSize: 11, color: '#1e40af', background: '#eff6ff', padding: '5px 8px', borderRadius: 5, marginBottom: 10 }}>
                👥 {ownerTeam.name}
              </div>
            )}

            {/* Story points */}
            <div className="form-group">
              <label className="form-label">Story Points</label>
              <input
                className="form-input" type="number" min="0" max="100"
                value={t.storyPoints ?? ''}
                onChange={e => handleUpdate('storyPoints', e.target.value !== '' ? Number(e.target.value) : null)}
              />
            </div>

            {/* Dates */}
            <div className="form-group">
              <label className="form-label">Start Date</label>
              <input className="form-input" type="date" value={t.startDate || ''} onChange={e => handleUpdate('startDate', e.target.value || null)} />
            </div>
            <div className="form-group">
              <label className="form-label">Due Date</label>
              <input className="form-input" type="date" value={t.dueDate || ''} onChange={e => handleUpdate('dueDate', e.target.value || null)} />
            </div>

            {/* Meta */}
            <div style={{ fontSize: 11, color: 'var(--gray-400)', borderTop: '1px solid var(--gray-100)', paddingTop: 10, display: 'flex', flexDirection: 'column', gap: 3 }}>
              <div>Reporter: {t.reporter || '—'}</div>
              <div>Project: {p?.key} — {p?.name}</div>
              <div>Created: {t.created}</div>
              <div>Updated: {t.updated}</div>
            </div>
          </div>

          <button className="btn btn-outline btn-sm w-full" onClick={() => openModal('editTicket', t.id)}>
            ✏ Edit All Fields
          </button>
          <button className="btn btn-outline btn-sm w-full" onClick={() => openModal('createTicket', null, t.id)}>
            + Add Child Ticket
          </button>
          <button className="btn btn-danger btn-sm w-full" onClick={handleDelete}>
            🗑 Delete Ticket
          </button>
        </div>
      </div>
    </div>
  )
}
