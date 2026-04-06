import React from 'react'
import { useApp } from '../../context/AppContext'
import Avatar from '../common/Avatar'
import { getTypeColor, getStatusClass, priorityClass } from '../common/Badge'
import Roadmap from '../Roadmap'

const STATUSES = ['To Do', 'In Progress', 'In Review', 'Done', 'Blocked']
const ISSUE_TYPES = ['Feature', 'Initiative', 'Epic', 'Story', 'Task', 'Sub-task']
const PRIORITIES = ['Critical', 'High', 'Medium', 'Low']

function Kanban({ pid, tickets, openModal, openTicketView }) {
  const projectTickets = tickets.filter(t => t.project === pid)
  return (
    <div className="kanban-board">
      {STATUSES.map(status => {
        const cards = projectTickets.filter(t => t.status === status)
        return (
          <div key={status} className="kanban-col">
            <div className="kanban-col-header">
              {status}
              <span style={{ background: 'var(--gray-400)', color: '#fff', borderRadius: 10, padding: '1px 7px', fontSize: 10 }}>
                {cards.length}
              </span>
            </div>
            <div className="kanban-col-body">
              {cards.map(t => (
                <div key={t.id} className="kanban-card" onClick={() => openTicketView(t.id)}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 10, color: 'var(--gray-400)', fontWeight: 600 }}>{t.id}</span>
                    <span className={`badge ${getTypeColor(t.type)}`} style={{ fontSize: 10 }}>{t.type}</span>
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)', margin: '4px 0' }}>{t.title}</div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
                    <span style={{ fontSize: 11 }} className={priorityClass(t.priority)}>{t.priority}</span>
                    <Avatar name={t.assignee} size={22} />
                  </div>
                </div>
              ))}
              <div
                style={{ textAlign: 'center', padding: 8, fontSize: 11, color: 'var(--gray-400)', cursor: 'pointer' }}
                onClick={() => openModal('createTicket', { status })}
              >
                + Add
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function Backlog({ pid, tickets, openModal, openTicketView }) {
  const tks = tickets.filter(t => t.project === pid)
  const backlog = tks.filter(t => t.status === 'To Do')
  const inProgress = tks.filter(t => t.status === 'In Progress' || t.status === 'In Review')
  const done = tks.filter(t => t.status === 'Done')
  const blocked = tks.filter(t => t.status === 'Blocked')

  function TicketRows({ list, label, labelClass }) {
    if (!list.length) return null
    return (
      <>
        <tr>
          <td colSpan={8} style={{ padding: '6px 14px', background: 'var(--gray-50)', fontSize: 11, fontWeight: 700, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '.5px', borderTop: '2px solid var(--gray-200)' }}>
            <span className={`badge ${labelClass}`} style={{ marginRight: 6 }}>{label}</span>{list.length} issues
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
      </>
    )
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 13, color: 'var(--gray-500)' }}>All issues in this project grouped by status</span>
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
            <TicketRows list={backlog} label="To Do" labelClass="s-todo" />
            <TicketRows list={inProgress} label="In Progress / Review" labelClass="s-inprogress" />
            <TicketRows list={blocked} label="Blocked" labelClass="s-blocked" />
            <TicketRows list={done} label="Done" labelClass="s-done" />
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

export default function ProjectDetail() {
  const { activeProject, projects, tickets, projectTab, setProjectTab, nav, openModal, openTicketView } = useApp()
  const p = projects.find(x => x.id === activeProject)
  if (!p) return <div className="page"><div className="empty-state">Project not found</div></div>

  const projectTickets = tickets.filter(t => t.project === p.id)
  const tabs = ['board', 'backlog', 'roadmap', 'reports']

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
          <button key={t} className={`tab ${projectTab === t ? 'active' : ''}`} onClick={() => setProjectTab(t)}>
            {t === 'roadmap' ? '🗺 Roadmap' : t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {projectTab === 'board' && <Kanban pid={p.id} tickets={tickets} openModal={openModal} openTicketView={openTicketView} />}
      {projectTab === 'backlog' && <Backlog pid={p.id} tickets={tickets} openModal={openModal} openTicketView={openTicketView} />}
      {projectTab === 'roadmap' && <Roadmap tickets={projectTickets} />}
      {projectTab === 'reports' && <ProjectReports pid={p.id} tickets={tickets} />}
    </div>
  )
}
