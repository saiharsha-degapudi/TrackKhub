import React from 'react'
import { useApp } from '../../context/AppContext'
import Avatar from '../common/Avatar'
import { getTypeColor, getStatusClass, priorityClass } from '../common/Badge'

const STATUSES = ['To Do', 'In Progress', 'In Review', 'Done', 'Blocked']
const PRIORITIES = ['Critical', 'High', 'Medium', 'Low']

export default function TicketView() {
  const {
    viewTicketId, tickets, users, prevPage,
    nav, openProject, openTicketView, openModal,
    doUpdateTicket, doDeleteTicket, projectById
  } = useApp()

  const t = tickets.find(x => x.id === viewTicketId)
  if (!t) return <div className="page"><div className="empty-state">Ticket not found</div></div>

  const p = projectById(t.project)
  const children = tickets.filter(x => x.parent === t.id)
  const parentT = t.parent ? tickets.find(x => x.id === t.parent) : null

  const handleUpdate = (field, val) => {
    doUpdateTicket(t.id, { [field]: val })
  }

  const handleDelete = () => {
    if (window.confirm('Delete this ticket?')) {
      doDeleteTicket(t.id)
    }
  }

  return (
    <div className="page">
      <div className="breadcrumb">
        <span onClick={() => nav(prevPage || 'alltickets')}>← Back</span>
        <span className="bc-sep">›</span>
        <span onClick={() => openProject(t.project)}>{p?.name}</span>
        <span className="bc-sep">›</span>
        <span>{t.id}</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 20, alignItems: 'start' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <span className={`badge ${getTypeColor(t.type)}`}>{t.type}</span>
            <span style={{ fontSize: 12, color: 'var(--blue)', fontWeight: 700 }}>{t.id}</span>
            <span className={`badge ${getStatusClass(t.status)}`}>{t.status}</span>
            <span style={{ fontSize: 12 }} className={priorityClass(t.priority)}>{t.priority}</span>
          </div>
          <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>{t.title}</div>
          <div style={{ fontSize: 13, color: 'var(--gray-600)', lineHeight: 1.7, padding: 14, background: 'var(--gray-50)', borderRadius: 8, border: '1px solid var(--gray-200)', marginBottom: 16 }}>
            {t.desc || 'No description.'}
          </div>

          {parentT && (
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--gray-500)', marginBottom: 6 }}>
                PARENT {parentT.type.toUpperCase()}
              </div>
              <div
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', background: 'var(--blue-light)', borderRadius: 8, border: '1.5px solid #bfdbfe', cursor: 'pointer' }}
                onClick={() => openTicketView(parentT.id)}
              >
                <span className={`badge ${getTypeColor(parentT.type)}`}>{parentT.type}</span>
                <span style={{ fontWeight: 600, color: 'var(--blue)' }}>{parentT.id}</span>
                <span>{parentT.title}</span>
              </div>
            </div>
          )}

          {children.length > 0 && (
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--gray-500)', marginBottom: 6 }}>
                CHILD ITEMS ({children.length})
              </div>
              {children.map(c => (
                <div
                  key={c.id}
                  style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 12px', border: '1.5px solid var(--gray-200)', borderRadius: 8, cursor: 'pointer', marginBottom: 6, background: 'var(--white)' }}
                  onClick={() => openTicketView(c.id)}
                >
                  <span className={`badge ${getTypeColor(c.type)}`}>{c.type}</span>
                  <span style={{ fontWeight: 600, color: 'var(--blue)' }}>{c.id}</span>
                  <span style={{ flex: 1 }}>{c.title}</span>
                  <span className={`badge ${getStatusClass(c.status)}`}>{c.status}</span>
                </div>
              ))}
            </div>
          )}

          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--gray-500)', marginBottom: 6 }}>LABELS</div>
            {t.labels?.length
              ? t.labels.map(l => <span key={l} className="tag" style={{ marginRight: 4 }}>{l}</span>)
              : <span style={{ fontSize: 12, color: 'var(--gray-400)' }}>No labels</span>
            }
          </div>

          <div style={{ padding: 14, background: 'var(--gray-50)', borderRadius: 8, border: '1px solid var(--gray-200)' }}>
            <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 8 }}>Add Comment</div>
            <textarea className="form-textarea" placeholder="Write a comment..." style={{ minHeight: 60 }} />
            <div style={{ textAlign: 'right', marginTop: 6 }}>
              <button className="btn btn-primary btn-sm">Save</button>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="card" style={{ padding: '14px 16px' }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--gray-500)', marginBottom: 12 }}>TICKET DETAILS</div>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select className="form-select" value={t.status} onChange={e => handleUpdate('status', e.target.value)}>
                {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Priority</label>
              <select className="form-select" value={t.priority} onChange={e => handleUpdate('priority', e.target.value)}>
                {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Assignee</label>
              <select className="form-select" value={t.assignee} onChange={e => handleUpdate('assignee', e.target.value)}>
                {users.map(u => <option key={u.id} value={u.name}>{u.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Start Date</label>
              <input className="form-input" type="date" value={t.startDate || ''} onChange={e => handleUpdate('startDate', e.target.value || null)} />
            </div>
            <div className="form-group">
              <label className="form-label">Due Date</label>
              <input className="form-input" type="date" value={t.dueDate || ''} onChange={e => handleUpdate('dueDate', e.target.value || null)} />
            </div>
            <div style={{ fontSize: 11, color: 'var(--gray-400)', marginTop: 4 }}>Reporter: {t.reporter}</div>
            <div style={{ fontSize: 11, color: 'var(--gray-400)' }}>Sprint: {t.sprint || '—'}</div>
            <div style={{ fontSize: 11, color: 'var(--gray-400)' }}>Created: {t.created}</div>
          </div>
          <button className="btn btn-outline btn-sm w-full" onClick={() => openModal('editTicket', t.id)}>✏ Edit Ticket</button>
          <button className="btn btn-outline btn-sm w-full" onClick={() => openModal('createTicket', null, t.id)}>+ Add Child Ticket</button>
          <button className="btn btn-danger btn-sm w-full" onClick={handleDelete}>🗑 Delete</button>
        </div>
      </div>
    </div>
  )
}
