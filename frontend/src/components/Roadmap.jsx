import React from 'react'
import { useApp } from '../context/AppContext'
import { getTypeColor } from './common/Badge'
import Avatar from './common/Avatar'

const TYPE_COLORS = {
  Feature: '#1a56db', Initiative: '#7c3aed', Epic: '#9333ea',
  Story: '#16a34a', Task: '#ca8a04', 'Sub-task': '#ea580c'
}

const TYPE_DEPTH = { Feature: 0, Initiative: 1, Epic: 2, Story: 3, Task: 4, 'Sub-task': 5 }

function parseDate(s) {
  if (!s) return null
  const d = new Date(s)
  return isNaN(d) ? null : d
}

function daysBetween(a, b) {
  return Math.round((b - a) / 86400000)
}

function fmtMonth(d) {
  return d.toLocaleString('default', { month: 'short', year: '2-digit' })
}

function fmtQuarter(d) {
  return `Q${Math.ceil((d.getMonth() + 1) / 3)} '${String(d.getFullYear()).slice(2)}`
}

function getZoomConfig(zoom) {
  if (zoom === 'week') return {
    colWidth: 120, unit: 'week',
    label: d => { const s = new Date(d); return s.toLocaleDateString('default', { month: 'short', day: 'numeric' }) },
    advance: d => { const n = new Date(d); n.setDate(n.getDate() + 7); return n }
  }
  if (zoom === 'quarter') return {
    colWidth: 160, unit: 'quarter',
    label: d => fmtQuarter(d),
    advance: d => { const n = new Date(d); n.setMonth(n.getMonth() + 3); return n }
  }
  if (zoom === 'year') return {
    colWidth: 180, unit: 'year',
    label: d => String(d.getFullYear()),
    advance: d => { const n = new Date(d); n.setFullYear(n.getFullYear() + 1); return n }
  }
  return {
    colWidth: 120, unit: 'month',
    label: d => fmtMonth(d),
    advance: d => { const n = new Date(d); n.setMonth(n.getMonth() + 1); return n }
  }
}

function getPeriodStart(d, unit) {
  const n = new Date(d)
  if (unit === 'month') { n.setDate(1); n.setHours(0, 0, 0, 0); return n }
  if (unit === 'quarter') { n.setMonth(Math.floor(n.getMonth() / 3) * 3, 1); n.setHours(0, 0, 0, 0); return n }
  if (unit === 'year') { n.setMonth(0, 1); n.setHours(0, 0, 0, 0); return n }
  const day = n.getDay(); const diff = n.getDate() - (day === 0 ? 6 : day - 1)
  n.setDate(diff); n.setHours(0, 0, 0, 0); return n
}

function getPeriodDays(d, unit) {
  if (unit === 'month') {
    const e = new Date(d.getFullYear(), d.getMonth() + 1, 0)
    return daysBetween(getPeriodStart(d, 'month'), e) + 1
  }
  if (unit === 'quarter') return 91
  if (unit === 'year') return 365
  return 7
}

function generateColumns(start, end, zoom) {
  const { unit, advance, colWidth, label } = getZoomConfig(zoom)
  const cols = []
  let cur = getPeriodStart(start, unit)
  while (cur <= end) {
    const days = getPeriodDays(cur, unit)
    cols.push({ date: new Date(cur), label: label(cur), days, width: colWidth })
    cur = advance(cur)
  }
  return cols
}

function dateToX(date, cols) {
  let x = 0
  const d = new Date(date)
  for (const col of cols) {
    const colEnd = new Date(col.date)
    colEnd.setDate(colEnd.getDate() + col.days)
    if (d <= col.date) return x
    if (d >= colEnd) { x += col.width; continue }
    const frac = daysBetween(col.date, d) / col.days
    x += frac * col.width
    return x
  }
  return x
}

function getRoadmapRange(tickets) {
  const dates = []
  tickets.forEach(t => {
    if (t.startDate) dates.push(parseDate(t.startDate))
    if (t.dueDate) dates.push(parseDate(t.dueDate))
  })
  if (!dates.length) {
    const now = new Date()
    return { start: new Date(now.getFullYear(), 0, 1), end: new Date(now.getFullYear(), 11, 31) }
  }
  const valid = dates.filter(Boolean)
  const minD = new Date(Math.min(...valid.map(d => d.getTime())))
  const maxD = new Date(Math.max(...valid.map(d => d.getTime())))
  minD.setMonth(minD.getMonth() - 1)
  maxD.setMonth(maxD.getMonth() + 1)
  return { start: minD, end: maxD }
}

function computeProgress(ticketId, tickets) {
  const children = tickets.filter(t => t.parent === ticketId)
  if (!children.length) {
    const t = tickets.find(x => x.id === ticketId)
    return t && t.status === 'Done' ? 100 : t && t.status === 'In Progress' ? 40 : 0
  }
  const scores = children.map(c => computeProgress(c.id, tickets))
  return Math.round(scores.reduce((s, v) => s + v, 0) / scores.length)
}

function buildRoadmapRows(tickets, expanded) {
  const childMap = {}
  tickets.forEach(t => {
    const p = t.parent
    if (!childMap[p]) childMap[p] = []
    childMap[p].push(t)
  })
  Object.keys(childMap).forEach(k => {
    childMap[k].sort((a, b) => {
      const da = parseDate(a.startDate), db = parseDate(b.startDate)
      if (!da && !db) return 0; if (!da) return 1; if (!db) return -1
      return da - db
    })
  })
  const rows = []
  function walk(parentId, depth) {
    const children = childMap[parentId] || []
    children.forEach(t => {
      const hasChildren = (childMap[t.id] || []).length > 0
      rows.push({ ticket: t, depth, hasChildren })
      if (hasChildren && expanded[t.id] !== false) {
        walk(t.id, depth + 1)
      }
    })
  }
  walk(null, 0)
  return rows
}

function SvgProgressRing({ pct, size, color }) {
  const r = (size - 4) / 2
  const circ = 2 * Math.PI * r
  const dash = circ * (pct / 100)
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ flexShrink: 0 }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#e2e8f8" strokeWidth="3" />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth="3"
        strokeDasharray={`${dash} ${circ - dash}`} strokeDashoffset={circ / 4} strokeLinecap="round" />
      <text x={size / 2} y={size / 2 + 3} textAnchor="middle" fontSize="7" fontWeight="700" fill={color}>{pct}</text>
    </svg>
  )
}

export default function Roadmap({ tickets }) {
  const { roadmapZoom, setRoadmapZoom, roadmapExpanded, setRoadmapExpanded, openTicketView, expandAllRoadmap, collapseAllRoadmap } = useApp()

  if (!tickets || !tickets.length) {
    return (
      <div className="empty-state">
        <div style={{ fontSize: 32, marginBottom: 8 }}>📅</div>
        <div>No tickets with dates yet. Create tickets and set start/due dates to see the roadmap.</div>
      </div>
    )
  }

  const { start: rangeStart, end: rangeEnd } = getRoadmapRange(tickets)
  const cols = generateColumns(rangeStart, rangeEnd, roadmapZoom)
  const totalW = cols.reduce((s, c) => s + c.width, 0)
  const today = new Date()
  const todayX = dateToX(today, cols)

  const expanded = { ...roadmapExpanded }
  tickets.forEach(t => {
    if (expanded[t.id] === undefined) {
      expanded[t.id] = (TYPE_DEPTH[t.type] || 0) <= 1
    }
  })

  const rows = buildRoadmapRows(tickets, expanded)

  const toggleRow = (id) => {
    setRoadmapExpanded(prev => ({ ...prev, [id]: prev[id] === false ? true : false }))
  }

  return (
    <>
      <div className="roadmap-controls">
        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--gray-600)' }}>Zoom:</span>
        {['week', 'month', 'quarter', 'year'].map(z => (
          <button
            key={z}
            className={`zoom-btn ${roadmapZoom === z ? 'active' : ''}`}
            onClick={() => setRoadmapZoom(z)}
          >
            {z.charAt(0).toUpperCase() + z.slice(1)}
          </button>
        ))}
        <div style={{ marginLeft: 12 }} className="roadmap-legend">
          {Object.entries(TYPE_COLORS).map(([t, c]) => (
            <span key={t}>
              <span className="legend-dot" style={{ background: c }} />
              {t}
            </span>
          ))}
        </div>
        <button className="btn btn-ghost btn-sm" style={{ marginLeft: 'auto' }} onClick={expandAllRoadmap}>Expand All</button>
        <button className="btn btn-ghost btn-sm" onClick={collapseAllRoadmap}>Collapse All</button>
      </div>

      <div className="roadmap-wrap">
        <div className="roadmap-header-row">
          <div className="roadmap-left-header">Issue / Timeline</div>
          <div className="roadmap-timeline-header">
            {cols.map((col, i) => (
              <div key={i} className="roadmap-month" style={{ width: col.width, minWidth: col.width }}>
                {col.label}
              </div>
            ))}
          </div>
        </div>

        <div className="roadmap-body">
          {rows.length === 0 ? (
            <div className="empty-state">No tickets found</div>
          ) : rows.map(({ ticket: t, depth, hasChildren }) => {
            const color = TYPE_COLORS[t.type] || '#1a56db'
            const progress = computeProgress(t.id, tickets)
            const isExp = expanded[t.id] !== false
            const sd = parseDate(t.startDate), ed = parseDate(t.dueDate)
            const hasDates = sd && ed

            return (
              <div key={t.id} className={`roadmap-row depth-${depth}`} style={{ minHeight: 44 }}>
                <div className="roadmap-row-label" onClick={() => openTicketView(t.id)}>
                  {hasChildren ? (
                    <button
                      className="expand-btn"
                      onClick={e => { e.stopPropagation(); toggleRow(t.id) }}
                    >
                      {isExp ? '▾' : '▸'}
                    </button>
                  ) : (
                    <span style={{ width: 18, flexShrink: 0 }} />
                  )}
                  <SvgProgressRing pct={progress} size={28} color={color} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <span className={`badge ${getTypeColor(t.type)}`} style={{ fontSize: 9, padding: '1px 5px' }}>{t.type}</span>
                      <span className="row-id">{t.id}</span>
                    </div>
                    <div className="row-title" title={t.title}>{t.title}</div>
                    <div style={{ fontSize: 10, color: 'var(--gray-400)' }}>
                      {hasDates
                        ? `${t.startDate} → ${t.dueDate}`
                        : <span className="backlog-badge">Backlog</span>
                      }
                    </div>
                  </div>
                  <Avatar name={t.assignee} size={20} />
                </div>

                <div className="roadmap-bar-area" style={{ width: totalW, minWidth: totalW, position: 'relative' }}>
                  {/* Grid lines */}
                  {(() => {
                    let gx = 0
                    return cols.map((col, i) => {
                      const x = gx
                      gx += col.width
                      return <div key={i} className="roadmap-grid-line" style={{ left: x }} />
                    })
                  })()}
                  {/* Today line */}
                  {todayX >= 0 && todayX <= totalW && (
                    <div className="roadmap-today-line" style={{ left: todayX }}>
                      <span style={{ position: 'absolute', top: -18, left: '50%', transform: 'translateX(-50%)', fontSize: 9, color: 'var(--red)', fontWeight: 700, whiteSpace: 'nowrap' }}>Today</span>
                    </div>
                  )}
                  {/* Bar */}
                  {hasDates ? (() => {
                    const x1 = dateToX(sd, cols)
                    const x2 = dateToX(ed, cols)
                    const bw = Math.max(x2 - x1, 20)
                    const fillW = Math.round(bw * (progress / 100))
                    return (
                      <div
                        className="roadmap-bar"
                        onClick={() => openTicketView(t.id)}
                        style={{ left: x1, width: bw, background: color, opacity: 0.92 }}
                        title={`${t.id}: ${t.title} | ${t.startDate} → ${t.dueDate} | ${progress}% done`}
                      >
                        <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: fillW, background: 'rgba(255,255,255,0.25)', borderRadius: 5, pointerEvents: 'none' }} />
                        <span style={{ position: 'relative', zIndex: 1, fontSize: 11, fontWeight: 600, color: '#fff', textShadow: '0 1px 2px rgba(0,0,0,.3)' }}>{t.id}</span>
                      </div>
                    )
                  })() : (
                    <div style={{ position: 'absolute', left: 12, display: 'flex', alignItems: 'center', gap: 6, color: 'var(--gray-400)', fontSize: 11 }}>
                      <div style={{ width: 10, height: 10, background: 'var(--gray-300)', transform: 'rotate(45deg)' }} />
                      <span>No dates set</span>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </>
  )
}
