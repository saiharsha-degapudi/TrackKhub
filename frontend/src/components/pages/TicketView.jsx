import React, { useState, useMemo, useEffect } from 'react'
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

  // ── Local editable state ───────────────────────────────────────────────────
  const [form, setForm] = useState(null)
  const [dirty, setDirty] = useState(false)
  const [saving, setSaving] = useState(false)

  // Sync form when ticket changes
  useEffect(() => {
    if (t) {
      setForm({
        status:      t.status,
        priority:    t.priority,
        sprint:      t.sprint || '',
        assignee:    t.assignee || '',
        storyPoints: t.storyPoints ?? '',
        startDate:   t.startDate || '',
        dueDate:     t.dueDate || '',
      })
      setDirty(false)
    }
  }, [t?.id])

  if (!t || !form) return <div className="page"><div className="empty-state">Ticket not found</div></div>

  const p        = projectById(t.project)
  const children = tickets.filter(x => x.parent === t.id)
  const parentT  = t.parent ? tickets.find(x => x.id === t.parent) : null

  const projectSprints = useMemo(
    () => sprints.filter(s => s.project === t.project).sort((a,b) => a.order - b.order),
    [sprints, t.project]
  )

  const ownerTeam = useMemo(() => {
    for (const team of teams) {
      if ((team.members || []).some(mid => {
        const u = users.find(u => u.id === mid)
        return u?.name === form.assignee
      })) return team
    }
    return null
  }, [teams, users, form.assignee])

  const handleField = (field, val) => {
    setForm(prev => ({ ...prev, [field]: val }))
    setDirty(true)
  }

  const handleSave = async () => {
    setSaving(true)
    await doUpdateTicket(t.id, {
      status:      form.status,
      priority:    form.priority,
      sprint:      form.sprint || null,
      assignee:    form.assignee,
      storyPoints: form.storyPoints !== '' ? Number(form.storyPoints) : null,
      startDate:   form.startDate || null,
      dueDate:     form.dueDate   || null,
    })
    setSaving(false)
    setDirty(false)
  }

  const handleCancel = () => {
    setForm({
      status:      t.status,
      priority:    t.priority,
      sprint:      t.sprint || '',
      assignee:    t.assignee || '',
      storyPoints: t.storyPoints ?? '',
      startDate:   t.startDate || '',
      dueDate:     t.dueDate || '',
    })
    setDirty(false)
  }

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
            <span className={`badge ${getStatusClass(form.status)}`}>{form.status}</span>
            <span className={priorityClass(form.priority)} style={{ fontSize: 12 }}>{form.priority}</span>
            {form.storyPoints !== '' && form.storyPoints != null && (
              <span style={{ fontSize: 11, background: '#eff6ff', color: '#1e40af', borderRadius: 10, padding: '1px 8px', fontWeight: 600 }}>
                {form.storyPoints} pts
              </span>
            )}
            {dirty && (
              <span style={{ fontSize: 11, background: '#fff7ed', color: '#c2410c', borderRadius: 10, padding: '2px 8px', fontWeight: 600, border: '1px solid #fed7aa' }}>
                ● Unsaved changes
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
              <button className="btn btn-primary btn-sm">Post Comment</button>
            </div>
          </div>
        </div>

        {/* ── Right: details sidebar ──────────────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="card" style={{ padding: '14px 16px' }}>

            {/* Header with save/cancel */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--gray-500)', letterSpacing: .5 }}>DETAILS</div>
              {dirty && (
                <div style={{ display: 'flex', gap: 5 }}>
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={handleCancel}
                    style={{ fontSize: 11, padding: '3px 8px' }}
                  >Cancel</button>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={handleSave}
                    disabled={saving}
                    style={{ fontSize: 11, padding: '3px 10px' }}
                  >{saving ? '...' : '💾 Save'}</button>
                </div>
              )}
            </div>

            {/* Status */}
            <div className="form-group">
              <label className="form-label">Status</label>
              <select className="form-select" value={form.status} onChange={e => handleField('status', e.target.value)}>
                {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            {/* Priority */}
            <div className="form-group">
              <label className="form-label">Priority</label>
              <select className="form-select" value={form.priority} onChange={e => handleField('priority', e.target.value)}>
                {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>

            {/* Sprint */}
            <div className="form-group">
              <label className="form-label">Sprint</label>
              <select className="form-select" value={form.sprint} onChange={e => handleField('sprint', e.target.value)}>
                <option value="">Backlog (no sprint)</option>
                {projectSprints.map(s => (
                  <option key={s.id} value={s.name}>
                    {s.name}{s.status === 'active' ? ' ⚡ Active' : s.status === 'planning' ? ' · Planning' : ' · Completed'}
                  </option>
                ))}
              </select>
            </div>

            {/* Assignee */}
            <div className="form-group">
              <label className="form-label">Assignee</label>
              <select className="form-select" value={form.assignee} onChange={e => handleField('assignee', e.target.value)}>
                <option value="">Unassigned</option>
                {users.filter(u => u.active).map(u => <option key={u.id} value={u.name}>{u.name}</option>)}
              </select>
            </div>

            {/* Team badge */}
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
                value={form.storyPoints}
                onChange={e => handleField('storyPoints', e.target.value)}
              />
            </div>

            {/* Dates */}
            <div className="form-group">
              <label className="form-label">Start Date</label>
              <input className="form-input" type="date" value={form.startDate} onChange={e => handleField('startDate', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Due Date</label>
              <input className="form-input" type="date" value={form.dueDate} onChange={e => handleField('dueDate', e.target.value)} />
            </div>

            {/* Save/Cancel bottom bar */}
            {dirty && (
              <div style={{ display: 'flex', gap: 8, marginTop: 8, paddingTop: 12, borderTop: '1px solid var(--gray-100)' }}>
                <button className="btn btn-primary btn-sm" style={{ flex: 1 }} onClick={handleSave} disabled={saving}>
                  {saving ? 'Saving…' : '💾 Save Changes'}
                </button>
                <button className="btn btn-ghost btn-sm" style={{ flex: 1 }} onClick={handleCancel}>
                  ✕ Cancel
                </button>
              </div>
            )}

            {/* Meta */}
            <div style={{ fontSize: 11, color: 'var(--gray-400)', borderTop: '1px solid var(--gray-100)', paddingTop: 10, marginTop: dirty ? 0 : 4, display: 'flex', flexDirection: 'column', gap: 3 }}>
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
