import React, { useState } from 'react'
import { useApp } from '../../context/AppContext'

const inp = {
  width: '100%', padding: '7px 10px', fontSize: 13, border: '1px solid #d1d5db',
  borderRadius: 6, outline: 'none', boxSizing: 'border-box', color: '#111827',
  background: '#fff', fontFamily: 'inherit',
}

export default function CreateSprintModal() {
  const { projects, activeProject, closeModal, doCreateSprint } = useApp()
  const project = projects.find(p => p.id === activeProject) || projects[0]

  const [name, setName] = useState(`Sprint ${Date.now() % 100}`)
  const [goal, setGoal] = useState('')
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10))
  const [endDate, setEndDate] = useState(
    new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10)
  )
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim()) return
    setLoading(true)
    try {
      await doCreateSprint({
        name: name.trim(),
        goal: goal.trim(),
        startDate,
        endDate,
        project: project?.id,
        status: 'Planned',
        velocity: 0,
      })
      closeModal()
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="modal-header">
        <span className="modal-title">Create Sprint</span>
        <button className="modal-close" onClick={closeModal}>×</button>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="modal-body">
          {project && (
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#374151', marginBottom: 5 }}>Project</label>
              <div style={{ ...inp, background: '#f9fafb', color: '#6b7280', cursor: 'default' }}>{project.name}</div>
            </div>
          )}
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#374151', marginBottom: 5 }}>
              Sprint Name <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input style={inp} value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Sprint 1" required />
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#374151', marginBottom: 5 }}>Sprint Goal</label>
            <textarea
              style={{ ...inp, height: 64, resize: 'vertical' }}
              value={goal}
              onChange={e => setGoal(e.target.value)}
              placeholder="What does this sprint aim to accomplish?"
            />
          </div>
          <div style={{ display: 'flex', gap: 12, marginBottom: 4 }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#374151', marginBottom: 5 }}>Start Date</label>
              <input type="date" style={inp} value={startDate} onChange={e => setStartDate(e.target.value)} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#374151', marginBottom: 5 }}>End Date</label>
              <input type="date" style={inp} value={endDate} onChange={e => setEndDate(e.target.value)} />
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button type="button" onClick={closeModal} style={{ padding: '7px 14px', fontSize: 13, borderRadius: 6, border: '1px solid #d1d5db', background: '#fff', cursor: 'pointer', color: '#374151' }}>
            Cancel
          </button>
          <button type="submit" disabled={loading || !name.trim()} style={{ padding: '7px 14px', fontSize: 13, borderRadius: 6, border: 'none', background: '#2563eb', color: '#fff', cursor: 'pointer', fontWeight: 500, opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Creating…' : 'Create Sprint'}
          </button>
        </div>
      </form>
    </>
  )
}
