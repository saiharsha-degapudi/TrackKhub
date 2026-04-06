import React from 'react'
import { useApp } from '../../context/AppContext'
import Roadmap from '../Roadmap'

const ISSUE_TYPES = ['Feature', 'Initiative', 'Epic', 'Story', 'Task', 'Sub-task']

export default function Roadmaps() {
  const {
    tickets, projects,
    roadmapProjectFilter, roadmapTypeFilter,
    setRoadmapProjectFilter, setRoadmapTypeFilter, toggleRoadmapProjectFilter,
  } = useApp()

  const pf = roadmapProjectFilter || []
  const tf = roadmapTypeFilter || 'All'

  let filteredTickets = tickets
  if (pf.length) filteredTickets = filteredTickets.filter(t => pf.includes(t.project))
  if (tf !== 'All') filteredTickets = filteredTickets.filter(t => t.type === tf)

  const hasFilter = pf.length > 0 || tf !== 'All'
  const projectCount = pf.length || projects.length

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="page-title">🗺 Roadmaps</div>
          <div className="page-sub">
            {filteredTickets.length} issues across {projectCount} project{projectCount > 1 ? 's' : ''}
          </div>
        </div>
      </div>

      <div style={{
        display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, flexWrap: 'wrap',
        padding: '12px 14px', background: 'var(--white)', borderRadius: 9, border: '1.5px solid var(--gray-200)'
      }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--gray-600)' }}>Project:</span>
        <button
          className={`filter-chip ${!pf.length ? 'active' : ''}`}
          onClick={() => setRoadmapProjectFilter([])}
        >
          All Projects
        </button>
        {projects.map(p => {
          const active = pf.includes(p.id)
          return (
            <button
              key={p.id}
              className={`filter-chip ${active ? 'active' : ''}`}
              onClick={() => toggleRoadmapProjectFilter(p.id)}
              style={active ? { borderColor: p.color, color: p.color, background: p.color + '18' } : {}}
            >
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: p.color, flexShrink: 0, display: 'inline-block' }} />
              {' '}{p.name}
            </button>
          )
        })}

        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--gray-600)', marginLeft: 12 }}>Issue Type:</span>
        <select
          className="form-select"
          style={{ width: 'auto', fontSize: 12 }}
          value={tf}
          onChange={e => setRoadmapTypeFilter(e.target.value)}
        >
          <option value="All">All Types</option>
          {ISSUE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
        </select>

        {hasFilter && (
          <button className="btn btn-ghost btn-sm" onClick={() => {
            setRoadmapProjectFilter([])
            setRoadmapTypeFilter('All')
          }}>✕ Clear</button>
        )}
      </div>

      <Roadmap tickets={filteredTickets} />
    </div>
  )
}
