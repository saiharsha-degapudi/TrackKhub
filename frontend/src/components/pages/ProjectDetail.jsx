import React, { useState } from 'react'
import { useApp } from '../../context/AppContext'
import Avatar from '../common/Avatar'
import { getTypeColor, getStatusClass, priorityClass } from '../common/Badge'
import Roadmap from '../Roadmap'

const STATUSES = ['To Do', 'In Progress', 'In Review', 'Done', 'Blocked']
const ISSUE_TYPES = ['Feature', 'Initiative', 'Epic', 'Story', 'Task', 'Sub-task']
const PRIORITIES = ['Critical', 'High', 'Medium', 'Low']
const SPRINT_COLS = ['To Do', 'In Progress', 'In Review', 'Done']

// ── Sprint Board (Jira/Trello style) ─────────────────────────────────────────
function SprintBoard({ pid, tickets, openModal, openTicketView }) {
  const projectTickets = tickets.filter(t => t.project === pid)

  // Collect unique sprints (sorted)
  const sprints = [...new Set(projectTickets.map(t => t.sprint).filter(Boolean))].sort()
  const defaultSprint = sprints[sprints.length - 1] || 'Sprint 1'
  const [activeSprint, setActiveSprint] = useState(defaultSprint)

  const sprintTickets = projectTickets.filter(t => t.sprint === activeSprint)
  const backlogTickets = projectTickets.filter(t => !t.sprint)
  const blockedTickets = sprintTickets.filter(t => t.status === 'Blocked')

  const total = sprintTickets.length
  const done = sprintTickets.filter(t => t.status === 'Done').length
  const inProg = sprintTickets.filter(t => t.status === 'In Progress').length
  const inReview = sprintTickets.filter(t => t.status === 'In Review').length
  const pct = total ? Math.round(done / total * 100) : 0

  const colIcons = { 'To Do': '📋', 'In Progress': '⚡', 'In Review': '👁', 'Done': '✅', 'Blocked': '🚫' }
  const colColors = { 'Done': '#10b981', 'Blocked': '#ef4444', 'In Progress': '#f59e0b', 'In Review': '#8b5cf6', 'To Do': '#6b7280' }

  return (
    <div>
      {/* ── Sprint Banner ── */}
      <div style={{
        background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
        border: '1px solid #bfdbfe',
        borderRadius: 10,
        padding: '14px 20px',
        marginBottom: 20,
        display: 'flex',
        alignItems: 'center',
        gap: 20,
        flexWrap: 'wrap'
      }}>
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <span style={{ fontSize: 18 }}>🏃</span>
            <span style={{ fontWeight: 700, fontSize: 15, color: '#1e40af' }}>{activeSprint}</span>
            <span style={{
              background: '#dbeafe', color: '#1e40af', fontSize: 10, fontWeight: 700,
              padding: '1px 8px', borderRadius: 10, border: '1px solid #93c5fd'
            }}>ACTIVE</span>
          </div>
          <div style={{ display: 'flex', gap: 14, fontSize: 12, color: '#3b82f6', flexWrap: 'wrap' }}>
            <span>{total} issues</span>
            <span>⚡ {inProg} in progress</span>
            <span>👁 {inReview} in review</span>
            <span>✅ {done} done</span>
            {blockedTickets.length > 0 && (
              <span style={{ color: '#ef4444' }}>🚫 {blockedTickets.length} blocked</span>
            )}
          </div>
        </div>

        <div style={{ flex: 1, minWidth: 160, maxWidth: 220 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#6b7280', marginBottom: 5 }}>
            <span>Sprint progress</span>
            <span style={{ fontWeight: 700, color: pct === 100 ? '#10b981' : '#1e40af' }}>{pct}%</span>
          </div>
          <div style={{ height: 8, background: '#dbeafe', borderRadius: 4, overflow: 'hidden' }}>
            <div style={{
              height: '100%', width: `${pct}%`,
              background: pct === 100 ? '#10b981' : '#3b82f6',
              borderRadius: 4, transition: 'width .4s ease'
            }} />
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
          {sprints.length > 1 && (
            <select
              className="form-select"
              value={activeSprint}
              onChange={e => setActiveSprint(e.target.value)}
              style={{ width: 'auto', fontSize: 12 }}
            >
              {sprints.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          )}
          <button className="btn btn-ghost btn-sm" onClick={() => openModal('createTicket')}>
            + Add Issue
          </button>
        </div>
      </div>

      {/* ── Kanban Columns ── */}
      <div className="kanban-board">
        {SPRINT_COLS.map(status => {
          const cards = sprintTickets.filter(t => t.status === status)
          return (
            <div key={status} className="kanban-col">
              <div className="kanban-col-header" style={{ borderBottom: `3px solid ${colColors[status]}20` }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <span>{colIcons[status]}</span>
                  <span>{status}</span>
                </span>
                <span style={{
                  background: colColors[status], color: '#fff',
                  borderRadius: 10, padding: '1px 7px', fontSize: 10, fontWeight: 700
                }}>
                  {cards.length}
                </span>
              </div>
              <div className="kanban-col-body">
                {cards.map(t => (
                  <div
                    key={t.id}
                    className="kanban-card"
                    onClick={() => openTicketView(t.id)}
                    style={{ borderLeft: `3px solid ${colColors[status]}60` }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5 }}>
                      <span style={{ fontSize: 10, color: '#6b7280', fontWeight: 600 }}>{t.id}</span>
                      <span className={`badge ${getTypeColor(t.type)}`} style={{ fontSize: 9 }}>{t.type}</span>
                    </div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)', marginBottom: 8, lineHeight: 1.4 }}>
                      {t.title}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span className={priorityClass(t.priority)} style={{ fontSize: 10 }}>{t.priority}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        {t.dueDate && (
                          <span style={{ fontSize: 9, color: '#9ca3af' }}>{t.dueDate}</span>
                        )}
                        <Avatar name={t.assignee} size={22} />
                      </div>
                    </div>
                  </div>
                ))}
                {cards.length === 0 && (
                  <div style={{
                    border: '2px dashed var(--gray-200)', borderRadius: 8,
                    padding: '20px 10px', textAlign: 'center',
                    fontSize: 11, color: 'var(--gray-400)', margin: '4px 0'
                  }}>
                    Drop issues here
                  </div>
                )}
                <div
                  style={{
                    textAlign: 'center', padding: '8px 0', fontSize: 11,
                    color: 'var(--gray-400)', cursor: 'pointer', borderRadius: 6,
                    marginTop: 4
                  }}
                  onClick={() => openModal('createTicket')}
                >
                  + Add issue
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* ── Blocked Section ── */}
      {blockedTickets.length > 0 && (
        <div style={{ marginTop: 20 }}>
          <div style={{
            background: '#fef2f2', border: '1px solid #fecaca',
            borderRadius: 8, padding: '10px 14px', marginBottom: 10,
            display: 'flex', alignItems: 'center', gap: 8
          }}>
            <span style={{ fontSize: 14 }}>🚫</span>
            <span style={{ fontWeight: 700, color: '#dc2626', fontSize: 13 }}>
              Blocked ({blockedTickets.length})
            </span>
            <span style={{ fontSize: 12, color: '#ef4444' }}>— these issues need attention</span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {blockedTickets.map(t => (
              <div
                key={t.id}
                className="kanban-card"
                style={{ flex: '0 0 280px', borderLeft: '3px solid #ef4444', cursor: 'pointer' }}
                onClick={() => openTicketView(t.id)}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 10, color: '#6b7280', fontWeight: 600 }}>{t.id}</span>
                  <span className={`badge ${getTypeColor(t.type)}`} style={{ fontSize: 9 }}>{t.type}</span>
                </div>
                <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 6 }}>{t.title}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className={priorityClass(t.priority)} style={{ fontSize: 10 }}>{t.priority}</span>
                  <Avatar name={t.assignee} size={20} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Backlog Section ── */}
      <div style={{ marginTop: 28 }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          marginBottom: 10, paddingBottom: 8,
          borderBottom: '2px solid var(--gray-100)'
        }}>
          <span style={{ fontWeight: 700, fontSize: 14 }}>📋 Backlog</span>
          <span style={{
            background: '#f3f4f6', color: '#6b7280',
            borderRadius: 10, padding: '1px 8px', fontSize: 12, fontWeight: 600
          }}>
            {backlogTickets.length}
          </span>
          <span style={{ fontSize: 12, color: 'var(--gray-400)', marginLeft: 4 }}>issues not assigned to a sprint</span>
          <button
            className="btn btn-ghost btn-sm"
            style={{ marginLeft: 'auto' }}
            onClick={() => openModal('createTicket')}
          >
            + Add to Backlog
          </button>
        </div>

        {backlogTickets.length > 0 ? (
          <div className="card" style={{ padding: 0 }}>
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Type</th>
                  <th>Summary</th>
                  <th>Priority</th>
                  <th>Assignee</th>
                  <th>Due Date</th>
                </tr>
              </thead>
              <tbody>
                {backlogTickets.map(t => (
                  <tr key={t.id} style={{ cursor: 'pointer' }} onClick={() => openTicketView(t.id)}>
                    <td style={{ fontWeight: 600, color: 'var(--blue)', fontSize: 12 }}>{t.id}</td>
                    <td><span className={`badge ${getTypeColor(t.type)}`} style={{ fontSize: 10 }}>{t.type}</span></td>
                    <td style={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 500 }}>
                      {t.title}
                    </td>
                    <td><span className={priorityClass(t.priority)} style={{ fontSize: 11 }}>{t.priority}</span></td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Avatar name={t.assignee} size={22} />
                        <span style={{ fontSize: 11 }}>{t.assignee}</span>
                      </div>
                    </td>
                    <td style={{ fontSize: 11, color: 'var(--gray-400)' }}>{t.dueDate || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{
            border: '2px dashed var(--gray-200)', borderRadius: 8,
            padding: '24px', textAlign: 'center', color: 'var(--gray-400)', fontSize: 13
          }}>
            🎉 All issues are assigned to sprints!
          </div>
        )}
      </div>
    </div>
  )
}

// ── Backlog (flat list view) ──────────────────────────────────────────────────
function Backlog({ pid, tickets, openModal, openTicketView }) {
  const tks = tickets.filter(t => t.project === pid)
  const groups = [
    { label: 'To Do',               cls: 's-todo',       list: tks.filter(t => t.status === 'To Do') },
    { label: 'In Progress / Review', cls: 's-inprogress', list: tks.filter(t => t.status === 'In Progress' || t.status === 'In Review') },
    { label: 'Blocked',              cls: 's-blocked',    list: tks.filter(t => t.status === 'Blocked') },
    { label: 'Done',                 cls: 's-done',       list: tks.filter(t => t.status === 'Done') },
  ]

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 13, color: 'var(--gray-500)' }}>All issues grouped by status</span>
        <button className="btn btn-primary btn-sm" style={{ marginLeft: 'auto' }} onClick={() => openModal('createTicket')}>
          + Create Issue
        </button>
      </div>
      <div className="card" style={{ padding: 0 }}>
        <table>
          <thead>
            <tr>
              <th>ID</th><th>Type</th><th>Summary</th><th>Status</th>
              <th>Priority</th><th>Assignee</th><th>Sprint</th><th>Due Date</th>
            </tr>
          </thead>
          <tbody>
            {groups.map(({ label, cls, list }) => {
              if (!list.length) return null
              return (
                <React.Fragment key={label}>
                  <tr>
                    <td colSpan={8} style={{
                      padding: '6px 14px', background: 'var(--gray-50)',
                      fontSize: 11, fontWeight: 700, color: 'var(--gray-500)',
                      textTransform: 'uppercase', letterSpacing: '.5px',
                      borderTop: '2px solid var(--gray-200)'
                    }}>
                      <span className={`badge ${cls}`} style={{ marginRight: 6 }}>{label}</span>
                      {list.length} issues
                    </td>
                  </tr>
                  {list.map(t => (
                    <tr key={t.id} onClick={() => openTicketView(t.id)} style={{ cursor: 'pointer' }}>
                      <td style={{ fontWeight: 600, color: 'var(--blue)', paddingLeft: 20 }}>{t.id}</td>
                      <td><span className={`badge ${getTypeColor(t.type)}`}>{t.type}</span></td>
                      <td style={{ maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 500 }}>{t.title}</td>
                      <td><span className={`badge ${getStatusClass(t.status)}`}>{t.status}</span></td>
                      <td><span style={{ fontSize: 12 }} className={priorityClass(t.priority)}>{t.priority}</span></td>
                      <td><Avatar name={t.assignee} size={24} /></td>
                      <td style={{ fontSize: 11, color: 'var(--gray-400)' }}>{t.sprint || '—'}</td>
                      <td style={{ fontSize: 11, color: 'var(--gray-400)' }}>{t.dueDate || '—'}</td>
                    </tr>
                  ))}
                </React.Fragment>
              )
            })}
            {!tks.length && (
              <tr>
                <td colSpan={8}>
                  <div className="empty-state">
                    <div style={{ fontSize: 28, marginBottom: 8 }}>📋</div>
                    <div>No issues yet. Click + Create Issue to start.</div>
                  </div>
                </td>
              </tr>
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
              <div className="bar" style={{
                height: Math.round(byStatus[s] / mx * 80) + 10,
                background: s === 'Done' ? 'var(--green)' : s === 'Blocked' ? 'var(--red)' : 'var(--blue)'
              }} />
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
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${Math.round(count / tks.length * 100)}%` }} />
              </div>
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
              <span className={`badge ${getTypeColor(t)}`}>{t}</span>
              <strong>{c}</strong>
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
              <span style={{ fontSize: 13 }} className={priorityClass(p)}>{p}</span>
              <strong>{c}</strong>
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
  const [name, setName] = useState(project.name)
  const [key, setKey] = useState(project.key)
  const [desc, setDesc] = useState(project.description || '')
  const [lead, setLead] = useState(project.lead || '')
  const [color, setColor] = useState(project.color || '#4f46e5')
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (!name.trim()) { alert('Project name required'); return }
    setSaving(true)
    try {
      await doUpdateProject(project.id, {
        name: name.trim(),
        key: key.trim().toUpperCase(),
        description: desc,
        lead,
        color
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ maxWidth: 640 }}>
      <div className="card">
        <div className="card-title" style={{ marginBottom: 16 }}>⚙ General Settings</div>

        <div className="form-group">
          <label className="form-label">Project Name *</label>
          <input
            className="form-input"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Project name"
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Project Key</label>
            <input
              className="form-input"
              value={key}
              onChange={e => setKey(e.target.value.toUpperCase().slice(0, 8))}
              placeholder="e.g. KK-PROC"
              style={{ fontFamily: 'monospace', fontWeight: 700 }}
            />
            <div style={{ fontSize: 11, color: 'var(--gray-400)', marginTop: 4 }}>
              Used as prefix for ticket IDs. Max 8 chars.
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Project Color</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <input
                type="color"
                value={color}
                onChange={e => setColor(e.target.value)}
                style={{ width: 44, height: 38, border: '1px solid var(--gray-200)', borderRadius: 6, cursor: 'pointer', padding: 2 }}
              />
              <span style={{ fontSize: 13, color: 'var(--gray-500)', fontFamily: 'monospace' }}>{color}</span>
            </div>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Description</label>
          <textarea
            className="form-textarea"
            value={desc}
            onChange={e => setDesc(e.target.value)}
            placeholder="Brief description of the project..."
            rows={3}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Project Lead</label>
          <select
            className="form-select"
            value={lead}
            onChange={e => setLead(e.target.value)}
          >
            <option value="">— Unassigned —</option>
            {users.map(u => <option key={u.id} value={u.name}>{u.name}</option>)}
          </select>
        </div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginTop: 8 }}>
          <button
            className="btn btn-primary"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
          {saved && (
            <span style={{ color: '#10b981', fontSize: 13, fontWeight: 600 }}>
              ✓ Changes saved!
            </span>
          )}
        </div>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <div className="card-title" style={{ color: '#dc2626' }}>Danger Zone</div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0' }}>
          <div>
            <div style={{ fontWeight: 600, fontSize: 13 }}>Archive Project</div>
            <div style={{ fontSize: 12, color: 'var(--gray-400)' }}>Mark this project as archived. Tickets will remain accessible.</div>
          </div>
          <button className="btn btn-ghost btn-sm" style={{ border: '1px solid #fca5a5', color: '#dc2626' }}>
            Archive
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Main ProjectDetail ────────────────────────────────────────────────────────
export default function ProjectDetail() {
  const { activeProject, projects, tickets, projectTab, setProjectTab, nav, openModal, openTicketView } = useApp()
  const p = projects.find(x => x.id === activeProject)
  if (!p) return <div className="page"><div className="empty-state">Project not found</div></div>

  const projectTickets = tickets.filter(t => t.project === p.id)
  const tabs = [
    { key: 'board',      label: '📋 Board' },
    { key: 'backlog',    label: 'Backlog' },
    { key: 'roadmap',    label: '🗺 Roadmap' },
    { key: 'reports',    label: '📊 Reports' },
    { key: 'psettings',  label: '⚙ Settings' },
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
          <div style={{
            width: 36, height: 36, borderRadius: 9, background: p.color,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 700, fontSize: 15
          }}>
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
          <button
            key={t.key}
            className={`tab ${projectTab === t.key ? 'active' : ''}`}
            onClick={() => setProjectTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {projectTab === 'board'     && <SprintBoard pid={p.id} tickets={tickets} openModal={openModal} openTicketView={openTicketView} />}
      {projectTab === 'backlog'   && <Backlog pid={p.id} tickets={tickets} openModal={openModal} openTicketView={openTicketView} />}
      {projectTab === 'roadmap'   && <Roadmap tickets={projectTickets} />}
      {projectTab === 'reports'   && <ProjectReports pid={p.id} tickets={tickets} />}
      {projectTab === 'psettings' && <ProjectSettings project={p} />}
    </div>
  )
}
