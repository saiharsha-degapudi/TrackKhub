import React, { useState, useMemo, useCallback } from 'react'
import { useApp } from '../../context/AppContext'
import Avatar from '../common/Avatar'
import { getStatusClass, priorityClass } from '../common/Badge'
import { parseJQL, JQL_FIELDS, STATUS_VALUES, PRIORITY_VALUES, TYPE_VALUES } from '../../utils/jql'

export default function Filters() {
  const {
    filters, tickets, projects, users, sprints, user,
    doCreateFilter, doDeleteFilter, openTicketView,
  } = useApp()

  const [jql, setJql]               = useState('')
  const [filterName, setFilterName] = useState('')
  const [showSave, setShowSave]     = useState(false)
  const [tab, setTab]               = useState('search')

  // ── Live query results ─────────────────────────────────────────────────────
  const results = useMemo(() => {
    try { return parseJQL(jql, tickets, projects) }
    catch { return [] }
  }, [jql, tickets, projects])

  // ── Auto-complete suggestions ──────────────────────────────────────────────
  const suggestions = useMemo(() => {
    const lastClause = jql.split(/\bAND\b/i).pop()?.trimStart() || ''

    if (/assignee\s*[!=]=?\s*["']?\w*$/i.test(lastClause))
      return users.map(u => `"${u.name}"`)
    if (/status\s*(?:IN\s*\([^)]*|[!=]=?\s*["']?\w*)$/i.test(lastClause))
      return STATUS_VALUES.map(v => `"${v}"`)
    if (/priority\s*(?:IN\s*\([^)]*|[!=]=?\s*["']?\w*)$/i.test(lastClause))
      return PRIORITY_VALUES.map(v => `"${v}"`)
    if (/type\s*(?:IN\s*\([^)]*|[!=]=?\s*["']?\w*)$/i.test(lastClause))
      return TYPE_VALUES.map(v => `"${v}"`)
    if (/sprint\s*[!=]=?\s*["']?\w*$/i.test(lastClause)) {
      const names = [...new Set(tickets.map(t => t.sprint).filter(Boolean))]
      return names.map(s => `"${s}"`)
    }
    if (/project\s*[!=]=?\s*["']?\w*$/i.test(lastClause))
      return projects.map(p => `"${p.key}"`)
    if (/^\w+$/.test(lastClause.trim()))
      return ['= ', '!= ', 'IN (', 'NOT IN (']
    if (!lastClause.trim() || /[)"]\s*$/.test(jql.trimEnd()))
      return ['AND ']
    const partial = lastClause.toLowerCase().trim()
    return JQL_FIELDS.filter(f => f.startsWith(partial) && f !== partial)
  }, [jql, users, tickets, projects, sprints])

  const applySuggestion = useCallback((sug) => {
    if (sug === 'AND ') { setJql(q => q.trimEnd() + ' AND '); return }
    const parts = jql.split(/\bAND\b/i)
    const last  = parts.pop() || ''
    const before = parts.join(' AND ')
    let newLast
    if (sug.startsWith('"') || ['= ', '!= ', 'IN (', 'NOT IN ('].includes(sug)) {
      newLast = last.trimEnd() + sug
    } else {
      const lastWord = last.trimStart().split(/\s+/).pop() || ''
      const base = last.trimStart().slice(0, last.trimStart().length - lastWord.length)
      newLast = base + sug + ' '
    }
    setJql(before ? before + ' AND ' + newLast : newLast)
  }, [jql])

  const handleSave = async () => {
    if (!filterName.trim()) { alert('Enter a filter name'); return }
    await doCreateFilter({
      name:       filterName.trim(),
      conditions: { jql },
      owner:      user?.name || '',
      shared:     true,
    })
    setShowSave(false)
    setFilterName('')
    setTab('saved')
  }

  // Quick-filter presets
  const QUICK = [
    ['My Open',    `assignee = "${user?.name}" AND status IN ("To Do", "In Progress")`],
    ['Critical',   'priority = "Critical"'],
    ['Blocked',    'status = "Blocked"'],
    ['In Review',  'status = "In Review"'],
    ['Done today', 'status = "Done"'],
  ]

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="page-title">Filters</div>
          <div className="page-sub">JQL-powered search across all projects</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            className={`btn ${tab === 'search' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setTab('search')}
          >🔍 JQL Search</button>
          <button
            className={`btn ${tab === 'saved' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setTab('saved')}
          >📋 Saved ({filters.length})</button>
        </div>
      </div>

      {/* ── JQL SEARCH TAB ─────────────────────────────────────────────────── */}
      {tab === 'search' && (
        <>
          <div className="card" style={{ padding: 16, marginBottom: 16 }}>

            {/* Input */}
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--gray-500)', letterSpacing: 0.6, marginBottom: 6 }}>
              JQL
            </div>
            <div style={{ position: 'relative' }}>
              <input
                className="form-input"
                style={{ fontFamily: 'monospace', fontSize: 13, paddingRight: 36 }}
                placeholder='project = "PRC" AND assignee = "Harsha" AND status IN ("To Do", "In Progress")'
                value={jql}
                onChange={e => setJql(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Escape') setJql('')
                }}
              />
              {jql && (
                <button
                  style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gray-400)', fontSize: 18, lineHeight: 1 }}
                  onClick={() => setJql('')}
                >×</button>
              )}
            </div>

            {/* Inline suggestions */}
            {suggestions.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 8 }}>
                {suggestions.slice(0, 14).map(s => (
                  <button
                    key={s}
                    className="filter-chip"
                    style={{ fontFamily: 'monospace', fontSize: 11, cursor: 'pointer' }}
                    onClick={() => applySuggestion(s)}
                  >{s}</button>
                ))}
              </div>
            )}

            {/* Quick filters */}
            <div style={{ marginTop: 10, display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
              <span style={{ fontSize: 11, color: 'var(--gray-400)' }}>Quick:</span>
              {QUICK.map(([label, q]) => (
                <button
                  key={label}
                  className={`filter-chip${jql === q ? ' active' : ''}`}
                  onClick={() => setJql(jql === q ? '' : q)}
                >{label}</button>
              ))}
            </div>

            {/* Syntax reference */}
            <div style={{ marginTop: 10, padding: '8px 12px', background: 'var(--gray-50)', borderRadius: 6, border: '1px solid var(--gray-200)', fontSize: 11, color: 'var(--gray-500)', fontFamily: 'monospace' }}>
              <span style={{ fontWeight: 700, fontFamily: 'inherit' }}>Fields: </span>
              assignee, reporter, status, priority, type, sprint, project, label
              &nbsp;·&nbsp;
              <span style={{ fontWeight: 700, fontFamily: 'inherit' }}>Ops: </span>
              = &nbsp;!= &nbsp;IN() &nbsp;NOT IN()
              &nbsp;·&nbsp;
              <span style={{ fontWeight: 700, fontFamily: 'inherit' }}>Connect: </span>
              AND
            </div>

            {/* Result count + save */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 }}>
              <span style={{ fontSize: 13, color: 'var(--blue)', fontWeight: 600 }}>
                {jql
                  ? `${results.length} result${results.length !== 1 ? 's' : ''}`
                  : `${tickets.length} total tickets — enter a JQL query above`}
              </span>
              {jql && !showSave && (
                <button className="btn btn-outline btn-sm" onClick={() => setShowSave(true)}>
                  💾 Save Filter
                </button>
              )}
            </div>

            {showSave && (
              <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                <input
                  className="form-input"
                  style={{ flex: 1 }}
                  placeholder="Filter name…"
                  value={filterName}
                  onChange={e => setFilterName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSave()}
                  autoFocus
                />
                <button className="btn btn-primary btn-sm" onClick={handleSave}>Save</button>
                <button className="btn btn-ghost btn-sm" onClick={() => setShowSave(false)}>Cancel</button>
              </div>
            )}
          </div>

          {/* Results table */}
          {jql && (
            <div className="card" style={{ padding: 0 }}>
              <table>
                <thead>
                  <tr>
                    <th>ID</th><th>Summary</th><th>Project</th>
                    <th>Type</th><th>Status</th><th>Priority</th>
                    <th>Assignee</th><th>Sprint</th>
                  </tr>
                </thead>
                <tbody>
                  {results.slice(0, 100).map(t => {
                    const proj = projects.find(p => p.id === t.project)
                    return (
                      <tr key={t.id} onClick={() => openTicketView(t.id)} style={{ cursor: 'pointer' }}>
                        <td style={{ fontWeight: 700, color: 'var(--blue)', whiteSpace: 'nowrap' }}>{t.id}</td>
                        <td style={{ maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.title}</td>
                        <td>
                          <span style={{ fontSize: 11, fontWeight: 600, color: proj?.color || '#64748b' }}>
                            {proj?.icon} {proj?.key}
                          </span>
                        </td>
                        <td><span className="badge badge-blue" style={{ fontSize: 10 }}>{t.type}</span></td>
                        <td><span className={`badge ${getStatusClass(t.status)}`} style={{ fontSize: 10 }}>{t.status}</span></td>
                        <td><span className={priorityClass(t.priority)} style={{ fontSize: 10 }}>{t.priority}</span></td>
                        <td>
                          <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                            <Avatar name={t.assignee} size={20} />
                            <span style={{ fontSize: 12 }}>{t.assignee}</span>
                          </div>
                        </td>
                        <td style={{ fontSize: 11, color: 'var(--gray-500)' }}>{t.sprint || '—'}</td>
                      </tr>
                    )
                  })}
                  {results.length === 0 && (
                    <tr>
                      <td colSpan={8} style={{ textAlign: 'center', padding: 28, color: 'var(--gray-400)' }}>
                        No tickets match this query
                      </td>
                    </tr>
                  )}
                  {results.length > 100 && (
                    <tr>
                      <td colSpan={8} style={{ textAlign: 'center', padding: 8, fontSize: 12, color: 'var(--gray-400)' }}>
                        Showing first 100 of {results.length} — refine your query to narrow down
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* ── SAVED FILTERS TAB ──────────────────────────────────────────────── */}
      {tab === 'saved' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
            <button className="btn btn-outline btn-sm" onClick={() => setTab('search')}>+ New from JQL</button>
          </div>

          {filters.length === 0 ? (
            <div className="empty-state">
              <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
              <div style={{ fontWeight: 600, marginBottom: 4 }}>No saved filters yet</div>
              <div style={{ fontSize: 13, color: 'var(--gray-400)' }}>
                Use JQL Search and click "Save Filter" to store a query
              </div>
            </div>
          ) : (
            <div className="grid-2">
              {filters.map(f => {
                const q = f.conditions?.jql || ''
                let count = 0
                try { count = parseJQL(q, tickets, projects).length } catch {}
                return (
                  <div key={f.id} className="card">
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 }}>
                      <div style={{ fontSize: 15, fontWeight: 700 }}>{f.name}</div>
                      <div style={{ display: 'flex', gap: 4 }}>
                        {f.shared
                          ? <span className="badge badge-blue">Shared</span>
                          : <span className="badge badge-gray">Private</span>}
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => window.confirm('Delete this filter?') && doDeleteFilter(f.id)}
                        >🗑</button>
                      </div>
                    </div>

                    {f.owner && (
                      <div style={{ fontSize: 11, color: 'var(--gray-400)', marginBottom: 8 }}>
                        By {f.owner}{f.created ? ` · ${f.created}` : ''}
                      </div>
                    )}

                    {q ? (
                      <div
                        title="Click to run"
                        style={{
                          fontFamily: 'monospace', fontSize: 11,
                          background: 'var(--gray-50)', border: '1px solid var(--gray-200)',
                          borderRadius: 6, padding: '6px 10px', marginBottom: 10,
                          color: 'var(--gray-700)', cursor: 'pointer', wordBreak: 'break-all',
                        }}
                        onClick={() => { setJql(q); setTab('search') }}
                      >
                        {q}
                      </div>
                    ) : (
                      <div style={{ fontSize: 11, color: 'var(--gray-400)', marginBottom: 10 }}>
                        Legacy filter (no JQL)
                      </div>
                    )}

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: 13, color: 'var(--blue)', fontWeight: 600 }}>
                        {count} matching tickets
                      </span>
                      <button
                        className="btn btn-outline btn-sm"
                        onClick={() => { setJql(q); setTab('search') }}
                      >Run →</button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
