/**
 * Minimal JQL (Jira Query Language) parser.
 *
 * Supported syntax:
 *   field = "value"
 *   field != "value"
 *   field IN ("a", "b", "c")
 *   field NOT IN ("a", "b")
 *   clause AND clause AND …
 *
 * Supported fields: assignee, reporter, status, priority, type, sprint, project, label
 */

function cleanVal(v) {
  return v.trim().replace(/^["']|["']$/g, '').trim().toLowerCase()
}

function matchField(ticket, field, val, projects) {
  const v = val.toLowerCase()
  switch (field.toLowerCase()) {
    case 'assignee':  return (ticket.assignee  || '').toLowerCase() === v
    case 'reporter':  return (ticket.reporter  || '').toLowerCase() === v
    case 'status':    return (ticket.status    || '').toLowerCase() === v
    case 'priority':  return (ticket.priority  || '').toLowerCase() === v
    case 'type':      return (ticket.type      || '').toLowerCase() === v
    case 'sprint':    return (ticket.sprint    || '').toLowerCase() === v
    case 'label':     return (ticket.labels    || []).some(l => l.toLowerCase() === v)
    case 'project': {
      const p = (projects || []).find(p => p.id === ticket.project)
      return (p?.key || '').toLowerCase() === v || String(ticket.project) === v || (p?.name || '').toLowerCase() === v
    }
    default: return true
  }
}

function matchClause(clause, ticket, projects) {
  // NOT IN
  const notIn = clause.match(/^(\w+)\s+NOT\s+IN\s*\(([^)]+)\)/i)
  if (notIn) {
    const vals = notIn[2].split(',').map(cleanVal)
    return !vals.some(v => matchField(ticket, notIn[1], v, projects))
  }
  // IN
  const inM = clause.match(/^(\w+)\s+IN\s*\(([^)]+)\)/i)
  if (inM) {
    const vals = inM[2].split(',').map(cleanVal)
    return vals.some(v => matchField(ticket, inM[1], v, projects))
  }
  // !=
  const neq = clause.match(/^(\w+)\s*!=\s*(.+)/)
  if (neq) return !matchField(ticket, neq[1], cleanVal(neq[2]), projects)
  // =
  const eq = clause.match(/^(\w+)\s*=\s*(.+)/)
  if (eq) return matchField(ticket, eq[1], cleanVal(eq[2]), projects)
  return true
}

export function parseJQL(jql, tickets, projects) {
  if (!jql || !jql.trim()) return tickets
  try {
    const q = jql.replace(/\bORDER\s+BY\b.*/i, '').trim()
    const clauses = q.split(/\bAND\b/i).map(s => s.trim()).filter(Boolean)
    return tickets.filter(ticket => clauses.every(c => matchClause(c, ticket, projects)))
  } catch {
    return tickets
  }
}

// Auto-complete helpers
export const JQL_FIELDS     = ['assignee', 'reporter', 'status', 'priority', 'type', 'sprint', 'project', 'label']
export const STATUS_VALUES  = ['To Do', 'In Progress', 'In Review', 'Done', 'Blocked']
export const PRIORITY_VALUES = ['Critical', 'High', 'Medium', 'Low']
export const TYPE_VALUES    = ['Feature', 'Initiative', 'Epic', 'Story', 'Task', 'Sub-task']
