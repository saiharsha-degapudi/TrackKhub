/**
 * Full JQL parser for TrackKhub.
 *
 * Supported operators: =, !=, ~, !~, IN(...), NOT IN(...), >, <, >=, <=
 * Supported fields:
 *   assignee, reporter, status, priority, type, sprint, project,
 *   label/labels, dueDate/due, created, updated, storyPoints/sp,
 *   title/summary, id/key
 * Connectors: AND, OR
 * ORDER BY: stripped (not applied)
 */

function cleanVal(v) {
  return v.trim().replace(/^["']|["']$/g, '').trim()
}

// ── Field value resolver ──────────────────────────────────────────────────────
function getFieldValue(ticket, field, projects) {
  switch (field.toLowerCase()) {
    case 'assignee':      return ticket.assignee  || ''
    case 'reporter':      return ticket.reporter  || ''
    case 'status':        return ticket.status    || ''
    case 'priority':      return ticket.priority  || ''
    case 'type':          return ticket.type      || ''
    case 'sprint':        return ticket.sprint    || ''
    case 'label':
    case 'labels':        return (ticket.labels   || []).join('\n')   // one per line for multi-value
    case 'project': {
      const p = (projects || []).find(p => p.id === ticket.project)
      if (!p) return String(ticket.project)
      return `${p.key}|||${p.name}|||${ticket.project}`
    }
    case 'duedate':
    case 'due':           return ticket.dueDate  || ''
    case 'created':       return ticket.created  || ''
    case 'updated':       return ticket.updated  || ''
    case 'storypoints':
    case 'sp':            return ticket.storyPoints != null ? String(ticket.storyPoints) : ''
    case 'title':
    case 'summary':       return ticket.title    || ''
    case 'id':
    case 'key':           return ticket.id       || ''
    default:              return ''
  }
}

// ── Equality match (handles multi-value fields) ───────────────────────────────
function matchEq(ticket, field, val, projects) {
  const lv = val.toLowerCase()

  // Labels: check each label individually
  if (field.toLowerCase() === 'label' || field.toLowerCase() === 'labels') {
    return (ticket.labels || []).some(l => l.toLowerCase() === lv)
  }

  // Project: match by key, name, or numeric id
  if (field.toLowerCase() === 'project') {
    const p = (projects || []).find(p => p.id === ticket.project)
    return (
      (p?.key  || '').toLowerCase() === lv ||
      (p?.name || '').toLowerCase() === lv ||
      String(ticket.project) === val.trim()
    )
  }

  const fv = getFieldValue(ticket, field, projects).toLowerCase()
  return fv === lv
}

// ── Contains match ─────────────────────────────────────────────────────────
function matchContains(ticket, field, val, projects) {
  const lv = val.toLowerCase()

  if (field.toLowerCase() === 'label' || field.toLowerCase() === 'labels') {
    return (ticket.labels || []).some(l => l.toLowerCase().includes(lv))
  }

  const fv = getFieldValue(ticket, field, projects).toLowerCase()
  return fv.includes(lv)
}

// ── Numeric / date comparison ─────────────────────────────────────────────────
function compareValues(ticket, field, op, rawVal, projects) {
  const val = cleanVal(rawVal)
  const isNumField = ['storypoints', 'sp'].includes(field.toLowerCase())
  const fv = getFieldValue(ticket, field, projects)

  if (isNumField) {
    const a = parseFloat(fv), b = parseFloat(val)
    if (isNaN(a) || isNaN(b)) return false
    if (op === '>')  return a > b
    if (op === '<')  return a < b
    if (op === '>=') return a >= b
    if (op === '<=') return a <= b
  } else {
    // ISO date comparison
    if (!fv || !val) return false
    const da = new Date(fv), db = new Date(val)
    if (isNaN(da) || isNaN(db)) return false
    if (op === '>')  return da > db
    if (op === '<')  return da < db
    if (op === '>=') return da >= db
    if (op === '<=') return da <= db
  }
  return false
}

// ── Single clause evaluator ───────────────────────────────────────────────────
function matchClause(clause, ticket, projects) {
  clause = clause.trim()
  if (!clause) return true

  // NOT IN (...)
  const notIn = clause.match(/^(\w+)\s+NOT\s+IN\s*\(([^)]*)\)/i)
  if (notIn) {
    const vals = notIn[2].split(',').map(cleanVal).filter(Boolean)
    return !vals.some(v => matchEq(ticket, notIn[1], v, projects))
  }

  // IN (...)
  const inM = clause.match(/^(\w+)\s+IN\s*\(([^)]*)\)/i)
  if (inM) {
    const vals = inM[2].split(',').map(cleanVal).filter(Boolean)
    return vals.some(v => matchEq(ticket, inM[1], v, projects))
  }

  // !~  (not contains)
  const notContains = clause.match(/^(\w+)\s*!~\s*(.+)/)
  if (notContains) return !matchContains(ticket, notContains[1], cleanVal(notContains[2]), projects)

  // >=
  const gte = clause.match(/^(\w+)\s*>=\s*(.+)/)
  if (gte) return compareValues(ticket, gte[1], '>=', gte[2], projects)

  // <=
  const lte = clause.match(/^(\w+)\s*<=\s*(.+)/)
  if (lte) return compareValues(ticket, lte[1], '<=', lte[2], projects)

  // > (must come after >= check)
  const gt = clause.match(/^(\w+)\s*>\s*(.+)/)
  if (gt) return compareValues(ticket, gt[1], '>', gt[2], projects)

  // < (must come after <= check)
  const lt = clause.match(/^(\w+)\s*<\s*(.+)/)
  if (lt) return compareValues(ticket, lt[1], '<', lt[2], projects)

  // !=
  const neq = clause.match(/^(\w+)\s*!=\s*(.+)/)
  if (neq) return !matchEq(ticket, neq[1], cleanVal(neq[2]), projects)

  // ~ (contains)
  const contains = clause.match(/^(\w+)\s*~\s*(.+)/)
  if (contains) return matchContains(ticket, contains[1], cleanVal(contains[2]), projects)

  // =
  const eq = clause.match(/^(\w+)\s*=\s*(.+)/)
  if (eq) return matchEq(ticket, eq[1], cleanVal(eq[2]), projects)

  return true
}

// ── Main entry point ──────────────────────────────────────────────────────────
export function parseJQL(jql, tickets, projects) {
  if (!jql || !jql.trim()) return tickets
  try {
    // Strip ORDER BY clause
    const q = jql.replace(/\bORDER\s+BY\b.*/i, '').trim()

    // Split by top-level AND
    const andClauses = q.split(/\bAND\b/i).map(s => s.trim()).filter(Boolean)

    return tickets.filter(ticket =>
      andClauses.every(andClause => {
        // Each AND-group may contain OR sub-clauses
        const orClauses = andClause.split(/\bOR\b/i).map(s => s.trim()).filter(Boolean)
        return orClauses.some(c => matchClause(c, ticket, projects))
      })
    )
  } catch {
    return tickets
  }
}

// ── Auto-complete helpers ─────────────────────────────────────────────────────
export const JQL_FIELDS = [
  'assignee', 'reporter', 'status', 'priority', 'type',
  'sprint', 'project', 'label', 'dueDate', 'created',
  'updated', 'storyPoints', 'title', 'id',
]
export const STATUS_VALUES   = ['To Do', 'In Progress', 'In Review', 'Done', 'Blocked']
export const PRIORITY_VALUES = ['Critical', 'High', 'Medium', 'Low']
export const TYPE_VALUES     = ['Feature', 'Initiative', 'Epic', 'Story', 'Task', 'Sub-task', 'Bug']
