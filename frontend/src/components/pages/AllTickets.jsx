import React from 'react'
import { useApp } from '../../context/AppContext'
import Avatar from '../common/Avatar'
import { getTypeColor, getStatusClass, priorityClass } from '../common/Badge'

const ISSUE_TYPES = ['Feature', 'Initiative', 'Epic', 'Story', 'Task', 'Sub-task']
const STATUSES = ['To Do', 'In Progress', 'In Review', 'Done', 'Blocked']

export default function AllTickets() {
  const {
    tickets, projects, ticketSearch, typeFilter, statusFilter, projectFilter,
    setTicketSearch, setTypeFilter, setStatusFilter, setProjectFilter,
    openModal, openTicketView, projectById
  } = useApp()

  let tks = tickets
  if (ticketSearch) tks = tks.filter(t => t.title.toLowerCase().includes(ticketSearch.toLowerCase()) || t.id.toLowerCase().includes(ticketSearch.toLowerCase()))
  if (typeFilter !== 'All') tks = tks.filter(t => t.type === typeFilter)
  if (statusFilter !== 'All') tks = tks.filter(t => t.status === statusFilter)
  if (projectFilter !== 'All') tks = tks.filter(t => t.project === parseInt(projectFilter))

  const hasFilter = ticketSearch || typeFilter !== 'All' || statusFilter !== 'All' || projectFilter !== 'All'

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="page-title">All Tickets</div>
          <div className="page-sub">{tks.length} of {tickets.length} tickets</div>
        </div>
        <button className="btn btn-primary" onClick={() => openModal('createTicket')}>+ Create Ticket</button>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          className="search-input"
          placeholder="Search by title or ID..."
          value={ticketSearch}
          onChange={e => setTicketSearch(e.target.value)}
        />
        <select className="form-select" style={{ width: 'auto' }} value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
          <option value="All">All Types</option>
          {ISSUE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <select className="form-select" style={{ width: 'auto' }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="All">All Statuses</option>
          {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select className="form-select" style={{ width: 'auto' }} value={projectFilter} onChange={e => setProjectFilter(e.target.value)}>
          <option value="All">All Projects</option>
          {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        {hasFilter && (
          <button className="btn btn-ghost" onClick={() => {
            setTicketSearch(''); setTypeFilter('All'); setStatusFilter('All'); setProjectFilter('All')
          }}>✕ Clear</button>
        )}
      </div>

      <div className="card" style={{ padding: 0 }}>
        <table>
          <thead>
            <tr>
              <th>ID</th><th>Type</th><th>Title</th><th>Project</th>
              <th>Status</th><th>Priority</th><th>Assignee</th><th>Start</th><th>Due</th>
            </tr>
          </thead>
          <tbody>
            {tks.length ? tks.map(t => {
              const proj = projectById(t.project)
              return (
                <tr key={t.id} onClick={() => openTicketView(t.id)} style={{ cursor: 'pointer' }}>
                  <td style={{ fontWeight: 600, color: 'var(--blue)' }}>{t.id}</td>
                  <td><span className={`badge ${getTypeColor(t.type)}`}>{t.type}</span></td>
                  <td style={{ maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 500 }}>{t.title}</td>
                  <td>
                    <span style={{ fontSize: 11, background: 'var(--blue-light)', color: 'var(--blue)', padding: '2px 7px', borderRadius: 4, fontWeight: 600 }}>
                      {proj?.key || '-'}
                    </span>
                  </td>
                  <td><span className={`badge ${getStatusClass(t.status)}`}>{t.status}</span></td>
                  <td><span style={{ fontSize: 12 }} className={priorityClass(t.priority)}>{t.priority}</span></td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <Avatar name={t.assignee} size={22} />
                      <span style={{ fontSize: 12 }}>{(t.assignee || '').split(' ')[0]}</span>
                    </div>
                  </td>
                  <td style={{ fontSize: 11, color: 'var(--gray-400)' }}>{t.startDate || '—'}</td>
                  <td style={{ fontSize: 11, color: 'var(--gray-400)' }}>{t.dueDate || '—'}</td>
                </tr>
              )
            }) : (
              <tr>
                <td colSpan={9}>
                  <div className="empty-state">
                    <div style={{ fontSize: 28, marginBottom: 8 }}>🔍</div>
                    <div>No tickets match filters</div>
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
