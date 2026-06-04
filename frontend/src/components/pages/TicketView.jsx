import React, { useState, useMemo, useEffect, useRef } from 'react'
import { useApp } from '../../context/AppContext'
import Avatar from '../common/Avatar'
import { getTypeColor, getStatusClass, priorityClass } from '../common/Badge'

const STATUSES   = ['To Do', 'In Progress', 'In Review', 'Done', 'Blocked']
const PRIORITIES = ['Critical', 'High', 'Medium', 'Low']

const PRIORITY_ICONS = {
  Critical: { icon: '⬆', color: '#dc2626' },
  High:     { icon: '↑',  color: '#ea580c' },
  Medium:   { icon: '→',  color: '#ca8a04' },
  Low:      { icon: '↓',  color: '#16a34a' },
}

const ACTIVITY_ITEMS = [
  { id: 1, user: 'HA', userName: 'Harsha', action: 'changed status from', from: 'To Do', to: 'In Progress', time: '2 days ago' },
  { id: 2, user: 'HA', userName: 'Harsha', action: 'added label', from: null, to: 'frontend', time: '3 days ago' },
  { id: 3, user: 'HA', userName: 'Harsha', action: 'created this ticket', from: null, to: null, time: '5 days ago' },
]

function FieldRow({ label, children, noBorder }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      padding: '9px 0',
      borderBottom: noBorder ? 'none' : '1px solid #f1f5f9',
      gap: 8,
    }}>
      <div style={{ width: 90, flexShrink: 0, fontSize: 12, color: 'var(--gray-500)', fontWeight: 500 }}>{label}</div>
      <div style={{ flex: 1, fontSize: 13 }}>{children}</div>
    </div>
  )
}

function ActionsMenu({ onEdit, onAddChild, onDelete }) {
  const [open, setOpen] = useState(false)
  const ref = useRef()

  useEffect(() => {
    if (!open) return
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  return (
    <div style={{ position: 'relative' }} ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          background: 'none', border: '1.5px solid var(--gray-200)', borderRadius: 7,
          padding: '5px 10px', cursor: 'pointer', fontSize: 15, color: 'var(--gray-500)',
          lineHeight: 1, display: 'flex', alignItems: 'center',
        }}
        title="More actions"
      >•••</button>
      {open && (
        <div style={{
          position: 'absolute', right: 0, top: 'calc(100% + 6px)', zIndex: 100,
          background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: 9,
          boxShadow: '0 8px 24px rgba(0,0,0,0.10)', minWidth: 168, overflow: 'hidden',
        }}>
          <button
            style={menuItemStyle}
            onClick={() => { setOpen(false); onEdit() }}
          >✏ Edit All Fields</button>
          <button
            style={menuItemStyle}
            onClick={() => { setOpen(false); onAddChild() }}
          >+ Add Child Ticket</button>
          <div style={{ height: 1, background: '#f1f5f9', margin: '2px 0' }} />
          <button
            style={{ ...menuItemStyle, color: '#dc2626' }}
            onClick={() => { setOpen(false); onDelete() }}
          >🗑 Delete Ticket</button>
        </div>
      )}
    </div>
  )
}

const menuItemStyle = {
  display: 'block', width: '100%', textAlign: 'left', background: 'none',
  border: 'none', padding: '9px 14px', fontSize: 13, cursor: 'pointer',
  color: 'var(--gray-700)',
}

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

  // Title inline editing
  const [editingTitle, setEditingTitle] = useState(false)
  const [titleDraft, setTitleDraft] = useState('')
  const titleInputRef = useRef()

  // Activity tab
  const [activityTab, setActivityTab] = useState('all')
  const [comment, setComment] = useState('')

  // Copied ID flash
  const [copied, setCopied] = useState(false)

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
      setTitleDraft(t.title)
      setDirty(false)
    }
  }, [t?.id])

  // ── Hooks must be called before any early return ───────────────────────────
  const projectSprints = useMemo(
    () => sprints.filter(s => s.project === t?.project).sort((a,b) => a.order - b.order),
    [sprints, t?.project]
  )

  const ownerTeam = useMemo(() => {
    if (!form) return null
    for (const team of teams) {
      if ((team.members || []).some(mid => {
        const u = users.find(u => u.id === mid)
        return u?.name === form.assignee
      })) return team
    }
    return null
  }, [teams, users, form?.assignee])

  if (!t || !form) return <div className="page"><div className="empty-state">Ticket not found</div></div>

  const p        = projectById(t.project)
  const children = tickets.filter(x => x.parent === t.id)
  const parentT  = t.parent ? tickets.find(x => x.id === t.parent) : null

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

  const handleCopyId = () => {
    navigator.clipboard?.writeText(t.id).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const handleTitleBlur = () => {
    setEditingTitle(false)
    if (titleDraft.trim() && titleDraft.trim() !== t.title) {
      doUpdateTicket(t.id, { title: titleDraft.trim() })
    } else {
      setTitleDraft(t.title)
    }
  }

  const handleTitleKeyDown = (e) => {
    if (e.key === 'Enter') { e.preventDefault(); titleInputRef.current?.blur() }
    if (e.key === 'Escape') { setTitleDraft(t.title); setEditingTitle(false) }
  }

  const assigneeUser = users.find(u => u.name === form.assignee)

  return (
    <div className="page">
      {/* Breadcrumb */}
      <div className="breadcrumb" style={{ marginBottom: 18 }}>
        <span style={{ cursor: 'pointer' }} onClick={() => nav(prevPage || 'alltickets')}>← Back</span>
        <span className="bc-sep">›</span>
        <span style={{ cursor: 'pointer' }} onClick={() => openProject(t.project)}>
          {p?.icon} {p?.name}
        </span>
        <span className="bc-sep">›</span>
        <span style={{ color: 'var(--blue)', fontWeight: 600 }}>{t.id}</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 24, alignItems: 'start' }}>

        {/* ── Left: main content ─────────────────────────────────────────── */}
        <div>

          {/* Header row: type badge · ticket ID · status dropdown · priority · actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
            <span className={`badge ${getTypeColor(t.type)}`} style={{ fontSize: 11 }}>{t.type}</span>

            <button
              onClick={handleCopyId}
              title="Click to copy"
              style={{
                background: 'none', border: 'none', padding: '2px 6px', borderRadius: 5,
                cursor: 'pointer', fontSize: 12, fontWeight: 700,
                color: copied ? '#16a34a' : 'var(--blue)',
                transition: 'color .15s',
              }}
            >{copied ? '✓ Copied' : t.id}</button>

            {/* Inline status dropdown */}
            <select
              value={form.status}
              onChange={e => handleField('status', e.target.value)}
              className={`badge ${getStatusClass(form.status)}`}
              style={{
                border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 11,
                padding: '3px 8px', borderRadius: 20, appearance: 'none',
                WebkitAppearance: 'none', outline: 'none', background: 'inherit',
              }}
            >
              {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>

            {/* Priority pill */}
            <span style={{
              display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 600,
              color: PRIORITY_ICONS[form.priority]?.color || 'var(--gray-500)',
              background: '#f8fafc', border: '1.5px solid #e2e8f0',
              borderRadius: 20, padding: '2px 10px',
            }}>
              <span>{PRIORITY_ICONS[form.priority]?.icon}</span>
              {form.priority}
            </span>

            {form.storyPoints !== '' && form.storyPoints != null && (
              <span style={{ fontSize: 11, background: '#eff6ff', color: '#1e40af', borderRadius: 20, padding: '2px 9px', fontWeight: 600, border: '1px solid #bfdbfe' }}>
                {form.storyPoints} pts
              </span>
            )}

            {dirty && (
              <span style={{ fontSize: 11, background: '#fff7ed', color: '#c2410c', borderRadius: 20, padding: '2px 9px', fontWeight: 600, border: '1px solid #fed7aa' }}>
                ● Unsaved
              </span>
            )}

            <div style={{ marginLeft: 'auto' }}>
              <ActionsMenu
                onEdit={() => openModal('editTicket', t.id)}
                onAddChild={() => openModal('createTicket', null, t.id)}
                onDelete={handleDelete}
              />
            </div>
          </div>

          {/* Title — inline editable */}
          {editingTitle ? (
            <input
              ref={titleInputRef}
              value={titleDraft}
              onChange={e => setTitleDraft(e.target.value)}
              onBlur={handleTitleBlur}
              onKeyDown={handleTitleKeyDown}
              autoFocus
              style={{
                fontSize: 22, fontWeight: 800, lineHeight: 1.3, width: '100%',
                border: 'none', borderBottom: '2px solid var(--blue)', outline: 'none',
                background: 'transparent', marginBottom: 16, padding: '2px 0',
                fontFamily: 'inherit', color: 'inherit',
              }}
            />
          ) : (
            <div
              onClick={() => { setEditingTitle(true); setTitleDraft(t.title) }}
              title="Click to edit title"
              style={{
                fontSize: 22, fontWeight: 800, marginBottom: 16, lineHeight: 1.3,
                cursor: 'text', borderRadius: 6, padding: '4px 6px', marginLeft: -6,
                transition: 'background .15s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              {t.title}
            </div>
          )}

          {/* Description */}
          <div
            style={{
              fontSize: 13.5, color: t.desc ? 'var(--gray-700)' : 'var(--gray-400)',
              lineHeight: 1.8, padding: '14px 16px',
              background: '#fff', borderRadius: 10,
              border: '1.5px solid #e2e8f0',
              marginBottom: 24, cursor: t.desc ? 'default' : 'text',
              minHeight: 72,
            }}
          >
            {t.desc
              ? t.desc.split('\n').map((line, i) => (
                  <span key={i}>{line}{i < t.desc.split('\n').length - 1 && <br />}</span>
                ))
              : 'Add a description…'}
          </div>

          {/* Labels */}
          {t.labels?.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--gray-500)', letterSpacing: .5, marginBottom: 7 }}>LABELS</div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {t.labels.map(l => <span key={l} className="tag">{l}</span>)}
              </div>
            </div>
          )}

          {/* Activity section */}
          <div style={{ background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: 10, padding: '18px 20px' }}>

            {/* Activity header + tabs */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--gray-800)' }}>Activity</div>
              {['all', 'comments', 'history'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActivityTab(tab)}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer', padding: '2px 0',
                    fontSize: 12, fontWeight: 600,
                    color: activityTab === tab ? 'var(--blue)' : 'var(--gray-400)',
                    borderBottom: activityTab === tab ? '2px solid var(--blue)' : '2px solid transparent',
                    textTransform: 'capitalize', transition: 'color .15s',
                  }}
                >{tab}</button>
              ))}
            </div>

            {/* Fake activity items */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 20 }}>
              {ACTIVITY_ITEMS.map(item => (
                <div key={item.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: '50%', background: 'var(--blue)',
                    color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 10, fontWeight: 700, flexShrink: 0,
                  }}>{item.user}</div>
                  <div style={{ flex: 1, fontSize: 12.5, color: 'var(--gray-600)', lineHeight: 1.5 }}>
                    <span style={{ fontWeight: 600, color: 'var(--gray-800)' }}>{item.userName}</span>
                    {' '}{item.action}
                    {item.from && (
                      <> <span style={{ color: 'var(--gray-400)', textDecoration: 'line-through' }}>{item.from}</span> → <span style={{ color: 'var(--gray-700)', fontWeight: 600 }}>{item.to}</span></>
                    )}
                    {!item.from && item.to && (
                      <> <span style={{ color: 'var(--blue)', fontWeight: 600 }}>{item.to}</span></>
                    )}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--gray-400)', flexShrink: 0, marginTop: 2 }}>{item.time}</div>
                </div>
              ))}
            </div>

            {/* Comment input */}
            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%', background: '#6366f1',
                color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 10, fontWeight: 700, flexShrink: 0, marginTop: 2,
              }}>HA</div>
              <div style={{ flex: 1 }}>
                <textarea
                  className="form-textarea"
                  placeholder="Add a comment… (Ctrl+M to format)"
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  style={{ minHeight: 60, fontSize: 13, resize: 'vertical' }}
                />
                {comment.trim() && (
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 6 }}>
                    <button className="btn btn-primary btn-sm" onClick={() => setComment('')}>Post</button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── Right: details sidebar ──────────────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

          {/* Details card */}
          <div style={{ background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: 10, padding: '16px 18px' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--gray-400)', letterSpacing: .7, marginBottom: 2 }}>DETAILS</div>

            {/* Status */}
            <FieldRow label="Status">
              <select
                className="form-select"
                value={form.status}
                onChange={e => handleField('status', e.target.value)}
                style={{ fontSize: 12, padding: '3px 6px', height: 'auto' }}
              >
                {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </FieldRow>

            {/* Priority */}
            <FieldRow label="Priority">
              <select
                className="form-select"
                value={form.priority}
                onChange={e => handleField('priority', e.target.value)}
                style={{ fontSize: 12, padding: '3px 6px', height: 'auto', color: PRIORITY_ICONS[form.priority]?.color }}
              >
                {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </FieldRow>

            {/* Assignee */}
            <FieldRow label="Assignee">
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap' }}>
                {form.assignee && (
                  <div style={{
                    width: 22, height: 22, borderRadius: '50%', background: '#6366f1',
                    color: '#fff', fontSize: 9, fontWeight: 700,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    {form.assignee.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                  </div>
                )}
                <select
                  className="form-select"
                  value={form.assignee}
                  onChange={e => handleField('assignee', e.target.value)}
                  style={{ fontSize: 12, padding: '3px 6px', height: 'auto', flex: 1 }}
                >
                  <option value="">Unassigned</option>
                  {users.filter(u => u.active).map(u => <option key={u.id} value={u.name}>{u.name}</option>)}
                </select>
              </div>
            </FieldRow>

            {/* Team badge inline */}
            {ownerTeam && (
              <FieldRow label="Team">
                <span style={{ fontSize: 12, color: '#1e40af', background: '#eff6ff', padding: '2px 8px', borderRadius: 5 }}>
                  {ownerTeam.name}
                </span>
              </FieldRow>
            )}

            {/* Sprint */}
            <FieldRow label="Sprint">
              <select
                className="form-select"
                value={form.sprint}
                onChange={e => handleField('sprint', e.target.value)}
                style={{ fontSize: 12, padding: '3px 6px', height: 'auto' }}
              >
                <option value="">Backlog</option>
                {projectSprints.map(s => (
                  <option key={s.id} value={s.name}>
                    {s.name}{s.status === 'active' ? ' ⚡' : s.status === 'planning' ? ' ·P' : ' ·C'}
                  </option>
                ))}
              </select>
            </FieldRow>

            {/* Story points */}
            <FieldRow label="Points">
              <input
                className="form-input"
                type="number" min="0" max="100"
                value={form.storyPoints}
                onChange={e => handleField('storyPoints', e.target.value)}
                style={{ fontSize: 12, padding: '3px 6px', height: 'auto', width: 70 }}
              />
            </FieldRow>

            {/* Start date */}
            <FieldRow label="Start Date">
              <input
                className="form-input" type="date"
                value={form.startDate}
                onChange={e => handleField('startDate', e.target.value)}
                style={{ fontSize: 12, padding: '3px 6px', height: 'auto' }}
              />
            </FieldRow>

            {/* Due date */}
            <FieldRow label="Due Date" noBorder>
              <input
                className="form-input" type="date"
                value={form.dueDate}
                onChange={e => handleField('dueDate', e.target.value)}
                style={{ fontSize: 12, padding: '3px 6px', height: 'auto' }}
              />
            </FieldRow>

            {/* Save bar */}
            {dirty && (
              <div style={{ display: 'flex', gap: 7, marginTop: 12, paddingTop: 12, borderTop: '1px solid #f1f5f9' }}>
                <button className="btn btn-primary btn-sm" style={{ flex: 1, fontSize: 12 }} onClick={handleSave} disabled={saving}>
                  {saving ? 'Saving…' : 'Save Changes'}
                </button>
                <button className="btn btn-ghost btn-sm" style={{ fontSize: 12 }} onClick={handleCancel}>Cancel</button>
              </div>
            )}
          </div>

          {/* Meta info card */}
          <div style={{ background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: 10, padding: '14px 18px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ display: 'flex', gap: 8, fontSize: 12 }}>
                <span style={{ width: 64, color: 'var(--gray-400)', flexShrink: 0 }}>Reporter</span>
                <span style={{ color: 'var(--gray-700)', fontWeight: 500 }}>{t.reporter || '—'}</span>
              </div>
              <div style={{ display: 'flex', gap: 8, fontSize: 12 }}>
                <span style={{ width: 64, color: 'var(--gray-400)', flexShrink: 0 }}>Project</span>
                <span style={{ color: 'var(--gray-700)', fontWeight: 500 }}>{p?.key} — {p?.name}</span>
              </div>
              <div style={{ display: 'flex', gap: 8, fontSize: 12 }}>
                <span style={{ width: 64, color: 'var(--gray-400)', flexShrink: 0 }}>Created</span>
                <span style={{ color: 'var(--gray-500)' }}>{t.created}</span>
              </div>
              <div style={{ display: 'flex', gap: 8, fontSize: 12 }}>
                <span style={{ width: 64, color: 'var(--gray-400)', flexShrink: 0 }}>Updated</span>
                <span style={{ color: 'var(--gray-500)' }}>{t.updated}</span>
              </div>
            </div>
          </div>

          {/* Relations card */}
          {(parentT || children.length > 0) && (
            <div style={{ background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: 10, padding: '14px 18px' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--gray-400)', letterSpacing: .7, marginBottom: 10 }}>RELATIONS</div>

              {parentT && (
                <div style={{ marginBottom: children.length > 0 ? 10 : 0 }}>
                  <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--gray-400)', marginBottom: 5, letterSpacing: .4 }}>
                    PARENT {parentT.type.toUpperCase()}
                  </div>
                  <div
                    onClick={() => openTicketView(parentT.id)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 6,
                      padding: '7px 10px', borderRadius: 7, cursor: 'pointer',
                      background: '#eff6ff', border: '1.5px solid #bfdbfe', fontSize: 12,
                    }}
                  >
                    <span className={`badge ${getTypeColor(parentT.type)}`} style={{ fontSize: 10 }}>{parentT.type}</span>
                    <span style={{ fontWeight: 700, color: 'var(--blue)' }}>{parentT.id}</span>
                    <span style={{ color: 'var(--gray-600)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{parentT.title}</span>
                  </div>
                </div>
              )}

              {children.length > 0 && (
                <div>
                  <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--gray-400)', marginBottom: 5, letterSpacing: .4 }}>
                    CHILD ITEMS ({children.length})
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                    {children.map(c => (
                      <div
                        key={c.id}
                        onClick={() => openTicketView(c.id)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 6,
                          padding: '7px 10px', borderRadius: 7, cursor: 'pointer',
                          border: '1.5px solid var(--gray-200)', fontSize: 12, background: '#fff',
                        }}
                        onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--blue)'}
                        onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--gray-200)'}
                      >
                        <span className={`badge ${getTypeColor(c.type)}`} style={{ fontSize: 10 }}>{c.type}</span>
                        <span style={{ fontWeight: 700, color: 'var(--blue)' }}>{c.id}</span>
                        <span style={{ flex: 1, color: 'var(--gray-600)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.title}</span>
                        <span className={`badge ${getStatusClass(c.status)}`} style={{ fontSize: 10 }}>{c.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
