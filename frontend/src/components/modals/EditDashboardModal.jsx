import React, { useState } from 'react'
import { useApp } from '../../context/AppContext'

const REPORTS = [
  { id: 'issue-list', label: '📋 Issue List', desc: 'Flat table of matching tickets — like Jira Issue Navigator' },
  { id: 'pie-status', label: '🥧 Pie: By Status', desc: 'Proportion of tickets across each status' },
  { id: 'pie-priority', label: '🥧 Pie: By Priority', desc: 'Proportion of tickets by priority level' },
  { id: 'pie-type', label: '🥧 Pie: By Issue Type', desc: 'Breakdown by Feature / Epic / Story / Task' },
  { id: 'burndown', label: '📉 Burndown Chart', desc: 'Remaining issues per status — track sprint progress' },
  { id: 'velocity', label: '⚡ Velocity Chart', desc: 'Completed tickets per sprint — team throughput' },
  { id: 'workload', label: '👥 Team Workload', desc: 'Ticket count per team member — like Jira Workload report' },
  { id: 'created-resolved', label: '📊 Created vs Resolved', desc: 'Total created vs resolved (Done) tickets over time' },
]

export default function EditDashboardModal({ data: dashId }) {
  const { customDashboards, closeModal, doUpdateDashboard } = useApp()
  const d = customDashboards.find(x => x.id === dashId)
  if (!d) return <div>Not found</div>

  const [selected, setSelected] = useState(d.reportType || 'issue-list')

  const handleApply = async () => {
    await doUpdateDashboard(d.id, { reportType: selected })
  }

  return (
    <div>
      <div className="modal-title">Edit Report: {d.name}</div>
      <button className="modal-close" onClick={closeModal}>×</button>

      <div className="form-group" style={{ marginBottom: 0 }}>
        <label className="form-label">Select Report Type</label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 }}>
          {REPORTS.map(r => (
            <label
              key={r.id}
              style={{
                display: 'flex', alignItems: 'flex-start', gap: 10,
                padding: '10px 12px',
                border: `1.5px solid ${selected === r.id ? 'var(--blue)' : 'var(--gray-200)'}`,
                borderRadius: 8, cursor: 'pointer',
                background: selected === r.id ? 'var(--blue-light)' : 'var(--white)'
              }}
            >
              <input
                type="radio"
                name="report-type"
                value={r.id}
                checked={selected === r.id}
                onChange={() => setSelected(r.id)}
                style={{ marginTop: 3, flexShrink: 0 }}
              />
              <div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{r.label}</div>
                <div style={{ fontSize: 11, color: 'var(--gray-500)', marginTop: 1 }}>{r.desc}</div>
              </div>
            </label>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 14 }}>
        <button className="btn btn-ghost" onClick={closeModal}>Cancel</button>
        <button className="btn btn-primary" onClick={handleApply}>Apply Report</button>
      </div>
    </div>
  )
}
