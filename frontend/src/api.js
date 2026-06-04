/**
 * Hub API client — tries real backend first, falls back to mock data if offline.
 */

const BASE = '/api'

// ── Mock data (mirrors backend/data.py) ───────────────────────────────────────

const MOCK_USERS = [
  { id: 1, name: 'Harsha',      email: 'harsha@trackkub.io', role: 'Admin',     group: 'Engineering', active: true  },
  { id: 2, name: 'Sara Lee',    email: 'sara@trackkub.io',   role: 'Developer', group: 'Engineering', active: true  },
  { id: 3, name: 'Mike Chen',   email: 'mike@trackkub.io',   role: 'Developer', group: 'Design',      active: true  },
  { id: 4, name: 'Priya Patel', email: 'priya@trackkub.io',  role: 'Manager',   group: 'Product',     active: false },
  { id: 5, name: 'Tom Wilson',  email: 'tom@trackkub.io',    role: 'Viewer',    group: 'QA',          active: true  },
]

const MOCK_PROJECTS = [
  { id: 1,  key: 'PRC', name: 'Procurement Portal',    description: 'B2B purchasing and supplier management',        color: '#1a56db', lead: 'Harsha',      status: 'Active', created: '2024-01-10', icon: '🛒', members: [{ name: 'Harsha', role: 'Lead' }] },
  { id: 2,  key: 'VND', name: 'Vendor Management',     description: 'Vendor onboarding, ratings & contracts',        color: '#7c3aed', lead: 'Sara Lee',    status: 'Active', created: '2024-01-15', icon: '🤝', members: [{ name: 'Sara Lee', role: 'Lead' }] },
  { id: 3,  key: 'ORD', name: 'Order Management',      description: 'End-to-end B2B order lifecycle',                color: '#16a34a', lead: 'Mike Chen',   status: 'Active', created: '2024-01-20', icon: '📦', members: [{ name: 'Mike Chen', role: 'Lead' }] },
  { id: 4,  key: 'BIL', name: 'Billing & Invoicing',   description: 'Invoice generation, payments & reconciliation', color: '#ec4899', lead: 'Priya Patel', status: 'Active', created: '2024-01-25', icon: '💰', members: [{ name: 'Priya Patel', role: 'Lead' }] },
  { id: 5,  key: 'CAT', name: 'Product Catalog',       description: 'B2B product listings, pricing & variants',      color: '#f59e0b', lead: 'Sara Lee',    status: 'Active', created: '2024-02-01', icon: '📋', members: [{ name: 'Sara Lee', role: 'Lead' }] },
  { id: 6,  key: 'ANA', name: 'Analytics & Reporting', description: 'B2B business intelligence & KPI dashboards',    color: '#0891b2', lead: 'Tom Wilson',  status: 'Active', created: '2024-02-05', icon: '📊', members: [{ name: 'Tom Wilson', role: 'Lead' }] },
  { id: 7,  key: 'INT', name: 'Integration Platform',  description: 'ERP, CRM & third-party API integrations',       color: '#10b981', lead: 'Mike Chen',   status: 'Active', created: '2024-02-10', icon: '🔌', members: [{ name: 'Mike Chen', role: 'Lead' }] },
  { id: 8,  key: 'SEC', name: 'Security & Compliance', description: 'SOC2, data privacy & audit controls',           color: '#dc2626', lead: 'Harsha',      status: 'Active', created: '2024-02-15', icon: '🔐', members: [{ name: 'Harsha', role: 'Lead' }] },
  { id: 9,  key: 'MOB', name: 'Mobile Commerce',       description: 'Mobile app for B2B buyers & sales reps',        color: '#6366f1', lead: 'Priya Patel', status: 'Active', created: '2024-02-20', icon: '📱', members: [{ name: 'Priya Patel', role: 'Lead' }] },
  { id: 10, key: 'ADM', name: 'Admin Console',         description: 'Internal admin, ops tooling & system config',   color: '#f97316', lead: 'Tom Wilson',  status: 'Active', created: '2024-02-25', icon: '🛠', members: [{ name: 'Tom Wilson', role: 'Lead' }] },
]

const MOCK_TICKETS = [
  { id: 'PRC-1',  project: 1, type: 'Feature',    title: 'Supplier Onboarding Workflow',        desc: 'End-to-end workflow for registering and vetting new suppliers.',        status: 'In Progress', priority: 'Critical', assignee: 'Harsha',      reporter: 'Harsha',      created: '2024-01-15', updated: '2024-03-10', labels: ['procurement','onboarding'], sprint: 'Sprint 1', parent: null,      startDate: '2024-01-15', dueDate: '2024-04-30' },
  { id: 'PRC-2',  project: 1, type: 'Feature',    title: 'Purchase Order Management',           desc: 'Create, approve, and track B2B purchase orders end-to-end.',           status: 'In Progress', priority: 'High',     assignee: 'Harsha',      reporter: 'Sara Lee',    created: '2024-01-20', updated: '2024-03-15', labels: ['procurement','orders'],     sprint: 'Sprint 2', parent: null,      startDate: '2024-01-20', dueDate: '2024-05-15' },
  { id: 'PRC-3',  project: 1, type: 'Feature',    title: 'Spend Analytics Dashboard',           desc: 'Real-time visibility into procurement spend by category.',             status: 'To Do',       priority: 'High',     assignee: 'Tom Wilson',  reporter: 'Harsha',      created: '2024-02-01', updated: '2024-03-01', labels: ['analytics'],                sprint: 'Sprint 3', parent: null,      startDate: '2024-04-01', dueDate: '2024-06-30' },
  { id: 'PRC-4',  project: 1, type: 'Epic',       title: 'Supplier Qualification Initiative',   desc: 'Automate supplier scoring and qualification checks.',                   status: 'In Progress', priority: 'High',     assignee: 'Harsha',      reporter: 'Harsha',      created: '2024-01-16', updated: '2024-03-12', labels: ['supplier'],                 sprint: 'Sprint 1', parent: 'PRC-1',   startDate: '2024-01-16', dueDate: '2024-04-15' },
  { id: 'PRC-5',  project: 1, type: 'Story',      title: 'Supplier registration form',          desc: 'Multi-step form for suppliers to enter company and tax details.',      status: 'In Progress', priority: 'High',     assignee: 'Harsha',      reporter: 'Sara Lee',    created: '2024-01-20', updated: '2024-03-15', labels: ['forms','supplier'],         sprint: 'Sprint 1', parent: 'PRC-4',   startDate: '2024-01-20', dueDate: '2024-03-10' },
  { id: 'PRC-6',  project: 1, type: 'Story',      title: 'Document upload for supplier vetting',desc: 'Allow suppliers to upload W-9, insurance, and compliance certificates.',status: 'In Progress', priority: 'High',     assignee: 'Sara Lee',    reporter: 'Harsha',      created: '2024-01-22', updated: '2024-03-16', labels: ['documents','compliance'],   sprint: 'Sprint 1', parent: 'PRC-4',   startDate: '2024-01-22', dueDate: '2024-03-12' },
  { id: 'PRC-7',  project: 1, type: 'Story',      title: 'Supplier approval notification',      desc: 'Email supplier with approval or rejection outcome after review.',      status: 'Done',        priority: 'Medium',   assignee: 'Tom Wilson',  reporter: 'Harsha',      created: '2024-01-25', updated: '2024-03-01', labels: ['notifications','email'],    sprint: 'Sprint 1', parent: 'PRC-4',   startDate: '2024-01-25', dueDate: '2024-02-28' },
  { id: 'PRC-8',  project: 1, type: 'Task',       title: 'Build supplier registration API',     desc: 'POST /api/suppliers endpoint with validation.',                        status: 'In Progress', priority: 'High',     assignee: 'Harsha',      reporter: 'Sara Lee',    created: '2024-01-21', updated: '2024-03-16', labels: ['backend','api'],            sprint: 'Sprint 1', parent: 'PRC-5',   startDate: '2024-01-21', dueDate: '2024-03-08' },
  { id: 'PRC-9',  project: 1, type: 'Task',       title: 'Document storage integration (S3)',   desc: 'Store uploaded supplier documents in S3 with versioning enabled.',     status: 'In Progress', priority: 'High',     assignee: 'Sara Lee',    reporter: 'Harsha',      created: '2024-01-23', updated: '2024-03-17', labels: ['storage','aws'],            sprint: 'Sprint 1', parent: 'PRC-6',   startDate: '2024-01-23', dueDate: '2024-03-10' },
  { id: 'PRC-10', project: 1, type: 'Bug',        title: 'PO approval email not sending',       desc: 'Approval emails fail silently when SMTP is misconfigured.',            status: 'In Review',   priority: 'Critical', assignee: 'Mike Chen',   reporter: 'Tom Wilson',  created: '2024-02-10', updated: '2024-03-20', labels: ['email','bug'],              sprint: 'Sprint 2', parent: null,      startDate: '2024-02-10', dueDate: '2024-03-15' },
  { id: 'VND-1',  project: 2, type: 'Feature',    title: 'Vendor Onboarding Portal',            desc: 'Self-service portal for vendors to complete onboarding.',              status: 'In Progress', priority: 'High',     assignee: 'Sara Lee',    reporter: 'Sara Lee',    created: '2024-01-16', updated: '2024-03-11', labels: ['vendor','portal'],          sprint: 'Sprint 1', parent: null,      startDate: '2024-01-16', dueDate: '2024-04-20' },
  { id: 'VND-2',  project: 2, type: 'Feature',    title: 'Vendor Rating System',                desc: 'Rate vendors on quality, delivery and communication.',                 status: 'To Do',       priority: 'Medium',   assignee: 'Mike Chen',   reporter: 'Sara Lee',    created: '2024-02-01', updated: '2024-03-01', labels: ['vendor','ratings'],         sprint: 'Sprint 2', parent: null,      startDate: '2024-04-01', dueDate: '2024-05-30' },
  { id: 'VND-3',  project: 2, type: 'Story',      title: 'Contract expiry alerts',              desc: 'Alert procurement team 30 days before contract expiry.',              status: 'Done',        priority: 'High',     assignee: 'Tom Wilson',  reporter: 'Sara Lee',    created: '2024-01-28', updated: '2024-03-05', labels: ['contracts','alerts'],       sprint: 'Sprint 1', parent: 'VND-1',   startDate: '2024-01-28', dueDate: '2024-03-01' },
  { id: 'ORD-1',  project: 3, type: 'Feature',    title: 'Order Lifecycle Management',          desc: 'Track orders from placement to delivery.',                            status: 'In Progress', priority: 'Critical', assignee: 'Mike Chen',   reporter: 'Mike Chen',   created: '2024-01-21', updated: '2024-03-12', labels: ['orders','lifecycle'],       sprint: 'Sprint 1', parent: null,      startDate: '2024-01-21', dueDate: '2024-05-01' },
  { id: 'ORD-2',  project: 3, type: 'Story',      title: 'Real-time order status updates',      desc: 'Push notifications for order status changes.',                        status: 'In Progress', priority: 'High',     assignee: 'Sara Lee',    reporter: 'Mike Chen',   created: '2024-02-05', updated: '2024-03-15', labels: ['notifications','orders'],   sprint: 'Sprint 2', parent: 'ORD-1',   startDate: '2024-02-05', dueDate: '2024-04-15' },
  { id: 'ORD-3',  project: 3, type: 'Bug',        title: 'Order total calculation error',       desc: 'Tax calculation incorrect for international orders.',                  status: 'In Review',   priority: 'Critical', assignee: 'Harsha',      reporter: 'Tom Wilson',  created: '2024-02-20', updated: '2024-03-22', labels: ['bug','tax'],                sprint: 'Sprint 2', parent: null,      startDate: '2024-02-20', dueDate: '2024-03-28' },
  { id: 'BIL-1',  project: 4, type: 'Feature',    title: 'Invoice Generation Engine',           desc: 'Auto-generate invoices upon order completion.',                       status: 'In Progress', priority: 'High',     assignee: 'Priya Patel', reporter: 'Priya Patel', created: '2024-01-26', updated: '2024-03-13', labels: ['billing','invoices'],       sprint: 'Sprint 1', parent: null,      startDate: '2024-01-26', dueDate: '2024-04-30' },
  { id: 'BIL-2',  project: 4, type: 'Story',      title: 'Payment gateway integration',         desc: 'Integrate Stripe for B2B payment processing.',                        status: 'To Do',       priority: 'Critical', assignee: 'Mike Chen',   reporter: 'Priya Patel', created: '2024-02-10', updated: '2024-03-10', labels: ['payments','stripe'],        sprint: 'Sprint 2', parent: 'BIL-1',   startDate: '2024-04-01', dueDate: '2024-05-15' },
  { id: 'CAT-1',  project: 5, type: 'Feature',    title: 'Product Catalog API',                 desc: 'REST API for product listings, variants and pricing.',                 status: 'In Progress', priority: 'High',     assignee: 'Sara Lee',    reporter: 'Sara Lee',    created: '2024-02-02', updated: '2024-03-14', labels: ['catalog','api'],            sprint: 'Sprint 1', parent: null,      startDate: '2024-02-02', dueDate: '2024-05-01' },
  { id: 'ANA-1',  project: 6, type: 'Feature',    title: 'KPI Dashboard',                       desc: 'Executive KPI dashboard with drill-down capability.',                 status: 'To Do',       priority: 'High',     assignee: 'Tom Wilson',  reporter: 'Tom Wilson',  created: '2024-02-06', updated: '2024-03-06', labels: ['dashboard','kpi'],          sprint: 'Sprint 1', parent: null,      startDate: '2024-04-01', dueDate: '2024-06-30' },
  { id: 'INT-1',  project: 7, type: 'Feature',    title: 'ERP Integration Layer',               desc: 'Bi-directional sync with SAP and Oracle ERP systems.',                status: 'In Progress', priority: 'Critical', assignee: 'Mike Chen',   reporter: 'Mike Chen',   created: '2024-02-11', updated: '2024-03-18', labels: ['erp','integration'],        sprint: 'Sprint 1', parent: null,      startDate: '2024-02-11', dueDate: '2024-06-01' },
  { id: 'SEC-1',  project: 8, type: 'Feature',    title: 'SOC2 Compliance Audit',               desc: 'Complete SOC2 Type II audit preparation and documentation.',          status: 'In Progress', priority: 'Critical', assignee: 'Harsha',      reporter: 'Harsha',      created: '2024-02-16', updated: '2024-03-19', labels: ['compliance','soc2'],        sprint: 'Sprint 1', parent: null,      startDate: '2024-02-16', dueDate: '2024-07-01' },
  { id: 'MOB-1',  project: 9, type: 'Feature',    title: 'Mobile Buyer App',                    desc: 'React Native app for B2B buyers to place and track orders.',          status: 'In Progress', priority: 'High',     assignee: 'Priya Patel', reporter: 'Priya Patel', created: '2024-02-21', updated: '2024-03-20', labels: ['mobile','react-native'],    sprint: 'Sprint 1', parent: null,      startDate: '2024-02-21', dueDate: '2024-06-30' },
  { id: 'ADM-1',  project: 10,type: 'Feature',    title: 'Admin Role Management',               desc: 'RBAC system for admin console access control.',                       status: 'To Do',       priority: 'High',     assignee: 'Tom Wilson',  reporter: 'Tom Wilson',  created: '2024-02-26', updated: '2024-03-10', labels: ['admin','rbac'],             sprint: 'Sprint 1', parent: null,      startDate: '2024-04-01', dueDate: '2024-05-30' },
]

const MOCK_SPRINTS = [
  { id: 1, project: 1, name: 'Sprint 1', goal: 'Complete supplier onboarding MVP', status: 'Active',    startDate: '2024-01-15', endDate: '2024-01-29', velocity: 42 },
  { id: 2, project: 1, name: 'Sprint 2', goal: 'PO creation and approval flow',    status: 'Active',    startDate: '2024-01-29', endDate: '2024-02-12', velocity: 38 },
  { id: 3, project: 1, name: 'Sprint 3', goal: 'Spend analytics and reporting',    status: 'Planned',   startDate: '2024-04-01', endDate: '2024-04-15', velocity: 0  },
  { id: 4, project: 2, name: 'Sprint 1', goal: 'Vendor portal foundation',         status: 'Active',    startDate: '2024-01-16', endDate: '2024-01-30', velocity: 35 },
  { id: 5, project: 3, name: 'Sprint 1', goal: 'Order lifecycle core',             status: 'Active',    startDate: '2024-01-21', endDate: '2024-02-04', velocity: 40 },
  { id: 6, project: 3, name: 'Sprint 2', goal: 'Real-time updates',                status: 'Planned',   startDate: '2024-02-05', endDate: '2024-02-19', velocity: 0  },
]

const MOCK_BOARDS = [
  { id: 1, project: 1, name: 'PRC Board', type: 'Scrum',  columns: ['To Do','In Progress','In Review','Done'] },
  { id: 2, project: 2, name: 'VND Board', type: 'Kanban', columns: ['Backlog','In Progress','Done'] },
  { id: 3, project: 3, name: 'ORD Board', type: 'Scrum',  columns: ['To Do','In Progress','In Review','Done'] },
]

const MOCK_TEAMS = [
  { id: 1, name: 'Frontend Guild',   members: ['Harsha','Mike Chen','Sara Lee'],      description: 'UI/UX and React development' },
  { id: 2, name: 'Backend Guild',    members: ['Sara Lee','Tom Wilson'],              description: 'API and infrastructure' },
  { id: 3, name: 'Product Team',     members: ['Priya Patel','Harsha','Tom Wilson'],  description: 'Roadmap and prioritisation' },
]

const MOCK_GROUPS = ['Engineering', 'Design', 'Product', 'QA', 'Management']
const MOCK_ROLES  = ['Admin', 'Manager', 'Developer', 'Viewer']

const MOCK_WORKFLOWS = [
  { id: 1, project: 1, name: 'Default', statuses: ['To Do','In Progress','In Review','Done','Blocked'] },
  { id: 2, project: 2, name: 'Kanban',  statuses: ['Backlog','In Progress','Done'] },
]

const MOCK_CUSTOM_FIELDS = [
  { id: 1, name: 'Story Points', type: 'Number',   required: false },
  { id: 2, name: 'Environment',  type: 'Select',   required: false, options: ['Dev','Staging','Prod'] },
  { id: 3, name: 'Due Date',     type: 'Date',     required: false },
  { id: 4, name: 'Component',    type: 'Text',     required: false },
  { id: 5, name: 'Severity',     type: 'Select',   required: false, options: ['Low','Medium','High','Critical'] },
]

const MOCK_SETTINGS = {
  name: 'TracKorbit Workspace', description: 'B2B Commerce Platform',
  url: 'trackorbit', timezone: 'UTC', theme: 'dark', accent: '#2563eb',
}

const MOCK_NOTIFICATIONS = [
  { id: 1, text: 'Harsha assigned PRC-5 to you',          read: false, time: '2m ago'  },
  { id: 2, text: 'Sprint 1 starts today',                 read: false, time: '1h ago'  },
  { id: 3, text: 'PRC-10 marked as Critical',             read: true,  time: '3h ago'  },
  { id: 4, text: 'Sara Lee commented on VND-1',           read: true,  time: '1d ago'  },
]

const MOCK_CHANNELS = [
  { id: 1, name: 'general',     description: 'Company-wide updates' },
  { id: 2, name: 'engineering', description: 'Tech discussion'      },
  { id: 3, name: 'product',     description: 'Product & roadmap'    },
]

const MOCK_DASHBOARDS = [
  { id: 1, name: 'Engineering Overview', widgets: ['velocity','burndown','open-bugs'] },
  { id: 2, name: 'Product KPIs',         widgets: ['throughput','cycle-time','epics']  },
]

const MOCK_FILTERS = [
  { id: 1, name: 'My Open Issues',   jql: 'assignee = currentUser() AND status != Done' },
  { id: 2, name: 'Critical Bugs',    jql: 'type = Bug AND priority = Critical'           },
  { id: 3, name: 'Sprint 1 Stories', jql: 'sprint = "Sprint 1" AND type = Story'        },
]

const MOCK_CONNECTORS = [
  { id: 1, name: 'GitHub',    connected: true,  icon: '🐙' },
  { id: 2, name: 'Slack',     connected: false, icon: '💬' },
  { id: 3, name: 'Jira',      connected: false, icon: '📋' },
  { id: 4, name: 'Confluence', connected: false, icon: '📖' },
]

// ── Mock state (in-memory, survives page without backend) ────────────────────
const mock = {
  users: JSON.parse(JSON.stringify(MOCK_USERS)),
  projects: JSON.parse(JSON.stringify(MOCK_PROJECTS)),
  tickets: JSON.parse(JSON.stringify(MOCK_TICKETS)),
  sprints: JSON.parse(JSON.stringify(MOCK_SPRINTS)),
  boards: JSON.parse(JSON.stringify(MOCK_BOARDS)),
  teams: JSON.parse(JSON.stringify(MOCK_TEAMS)),
  groups: [...MOCK_GROUPS],
  roles: [...MOCK_ROLES],
  workflows: JSON.parse(JSON.stringify(MOCK_WORKFLOWS)),
  customFields: JSON.parse(JSON.stringify(MOCK_CUSTOM_FIELDS)),
  settings: { ...MOCK_SETTINGS },
  notifications: JSON.parse(JSON.stringify(MOCK_NOTIFICATIONS)),
  channels: JSON.parse(JSON.stringify(MOCK_CHANNELS)),
  dashboards: JSON.parse(JSON.stringify(MOCK_DASHBOARDS)),
  filters: JSON.parse(JSON.stringify(MOCK_FILTERS)),
  connectors: JSON.parse(JSON.stringify(MOCK_CONNECTORS)),
  messages: {},
}

// ── Backend reachability check ───────────────────────────────────────────────
let _backendUp = null // null = unknown, true/false = checked

async function checkBackend() {
  if (_backendUp !== null) return _backendUp
  try {
    const r = await fetch('/api/projects', { method: 'GET', signal: AbortSignal.timeout(2000) })
    _backendUp = r.ok
  } catch {
    _backendUp = false
  }
  return _backendUp
}

async function request(method, path, body) {
  const up = await checkBackend()
  if (up) {
    const opts = { method, headers: { 'Content-Type': 'application/json' } }
    if (body !== undefined) opts.body = JSON.stringify(body)
    const res = await fetch(BASE + path, opts)
    if (!res.ok) {
      const err = await res.text()
      throw new Error(err || `${method} ${path} failed: ${res.status}`)
    }
    return res.json()
  }
  // Backend offline — use mock
  return mockRequest(method, path, body)
}

// ── Mock request router ───────────────────────────────────────────────────────
function mockRequest(method, path, body) {
  const delay = () => new Promise(r => setTimeout(r, 80))

  // Strip query string for matching
  const [pathname, qs] = path.split('?')
  const params = Object.fromEntries(new URLSearchParams(qs || ''))

  // Auth
  if (pathname === '/auth/login' && method === 'POST') {
    const u = mock.users.find(u => u.email === body.email) || mock.users[0]
    return delay().then(() => u)
  }

  // Projects
  if (pathname === '/projects') {
    if (method === 'GET') return delay().then(() => mock.projects)
    if (method === 'POST') {
      const id = Math.max(...mock.projects.map(p => p.id)) + 1
      const p = { ...body, id, status: 'Active', created: new Date().toISOString().slice(0,10), members: [] }
      mock.projects.push(p)
      return delay().then(() => p)
    }
  }
  const pmatch = pathname.match(/^\/projects\/(\d+)$/)
  if (pmatch) {
    const id = Number(pmatch[1])
    if (method === 'PUT') {
      const i = mock.projects.findIndex(p => p.id === id)
      if (i >= 0) mock.projects[i] = { ...mock.projects[i], ...body }
      return delay().then(() => mock.projects[i])
    }
    if (method === 'DELETE') {
      mock.projects = mock.projects.filter(p => p.id !== id)
      return delay().then(() => ({ ok: true }))
    }
  }

  // Tickets
  if (pathname === '/tickets') {
    if (method === 'GET') {
      let tks = mock.tickets
      if (params.project) tks = tks.filter(t => t.project === Number(params.project))
      if (params.status)  tks = tks.filter(t => t.status === params.status)
      if (params.type)    tks = tks.filter(t => t.type === params.type)
      if (params.assignee)tks = tks.filter(t => t.assignee === params.assignee)
      if (params.sprint)  tks = tks.filter(t => t.sprint === params.sprint)
      if (params.search)  tks = tks.filter(t => t.title.toLowerCase().includes(params.search.toLowerCase()))
      return delay().then(() => tks)
    }
    if (method === 'POST') {
      const proj = mock.projects.find(p => p.id === Number(body.project)) || mock.projects[0]
      const num  = mock.tickets.filter(t => t.project === proj.id).length + 1
      const t = { ...body, id: `${proj.key}-${num}`, created: new Date().toISOString().slice(0,10), updated: new Date().toISOString().slice(0,10) }
      mock.tickets.push(t)
      return delay().then(() => t)
    }
  }
  const tmatch = pathname.match(/^\/tickets\/([^/]+)$/)
  if (tmatch) {
    const id = tmatch[1]
    if (method === 'GET') return delay().then(() => mock.tickets.find(t => t.id === id))
    if (method === 'PUT') {
      const i = mock.tickets.findIndex(t => t.id === id)
      if (i >= 0) mock.tickets[i] = { ...mock.tickets[i], ...body, updated: new Date().toISOString().slice(0,10) }
      return delay().then(() => mock.tickets[i])
    }
    if (method === 'DELETE') {
      mock.tickets = mock.tickets.filter(t => t.id !== id)
      return delay().then(() => ({ ok: true }))
    }
  }

  // Users
  if (pathname === '/users') {
    if (method === 'GET')  return delay().then(() => mock.users)
    if (method === 'POST') { const u = { ...body, id: Date.now() }; mock.users.push(u); return delay().then(() => u) }
  }
  const umatch = pathname.match(/^\/users\/(\d+)$/)
  if (umatch) {
    const id = Number(umatch[1])
    if (method === 'PUT') { const i = mock.users.findIndex(u => u.id === id); if (i>=0) mock.users[i]={...mock.users[i],...body}; return delay().then(()=>mock.users[i]||{}) }
    if (method === 'DELETE') { mock.users = mock.users.filter(u => u.id !== id); return delay().then(()=>({ok:true})) }
  }

  // Sprints
  if (pathname === '/sprints') {
    if (method === 'GET') {
      let sp = mock.sprints
      if (params.project) sp = sp.filter(s => s.project === Number(params.project))
      return delay().then(() => sp)
    }
    if (method === 'POST') { const s={...body,id:Date.now()}; mock.sprints.push(s); return delay().then(()=>s) }
  }
  const smatch = pathname.match(/^\/sprints\/(\d+)(\/start|\/complete)?$/)
  if (smatch) {
    const id = Number(smatch[1]); const action = smatch[2]
    if (action === '/start')    { const i=mock.sprints.findIndex(s=>s.id===id); if(i>=0) mock.sprints[i].status='Active'; return delay().then(()=>mock.sprints[i]||{}) }
    if (action === '/complete') { const i=mock.sprints.findIndex(s=>s.id===id); if(i>=0) mock.sprints[i].status='Completed'; return delay().then(()=>mock.sprints[i]||{}) }
    if (method === 'PUT')    { const i=mock.sprints.findIndex(s=>s.id===id); if(i>=0) mock.sprints[i]={...mock.sprints[i],...body}; return delay().then(()=>mock.sprints[i]||{}) }
    if (method === 'DELETE') { mock.sprints=mock.sprints.filter(s=>s.id!==id); return delay().then(()=>({ok:true})) }
  }

  // Boards
  if (pathname === '/boards') {
    if (method === 'GET') {
      let bd = mock.boards
      if (params.project) bd = bd.filter(b => b.project === Number(params.project))
      return delay().then(() => bd)
    }
    if (method === 'POST') { const b={...body,id:Date.now()}; mock.boards.push(b); return delay().then(()=>b) }
  }

  // Teams
  if (pathname === '/teams') {
    if (method === 'GET')  return delay().then(()=>mock.teams)
    if (method === 'POST') { const t={...body,id:Date.now()}; mock.teams.push(t); return delay().then(()=>t) }
  }
  const tmmatch = pathname.match(/^\/teams\/(\d+)$/)
  if (tmmatch) {
    const id = Number(tmmatch[1])
    if (method === 'PUT')    { const i=mock.teams.findIndex(t=>t.id===id); if(i>=0) mock.teams[i]={...mock.teams[i],...body}; return delay().then(()=>mock.teams[i]||{}) }
    if (method === 'DELETE') { mock.teams=mock.teams.filter(t=>t.id!==id); return delay().then(()=>({ok:true})) }
  }

  // Groups & Roles
  if (pathname === '/groups') {
    if (method === 'GET')  return delay().then(()=>mock.groups)
    if (method === 'POST') { mock.groups.push(body.name); return delay().then(()=>mock.groups) }
  }
  if (pathname === '/roles') {
    if (method === 'GET')  return delay().then(()=>mock.roles)
    if (method === 'POST') { mock.roles.push(body.name); return delay().then(()=>mock.roles) }
  }

  // Workflows
  if (pathname === '/workflows') {
    if (method === 'GET')  return delay().then(()=>mock.workflows)
    if (method === 'POST') { const w={...body,id:Date.now()}; mock.workflows.push(w); return delay().then(()=>w) }
  }
  const wfmatch = pathname.match(/^\/workflows\/project\/(\d+)$/)
  if (wfmatch) {
    const pid = Number(wfmatch[1])
    if (method === 'GET') return delay().then(()=>mock.workflows.find(w=>w.project===pid)||mock.workflows[0])
    if (method === 'PUT') { const i=mock.workflows.findIndex(w=>w.project===pid); if(i>=0) mock.workflows[i]={...mock.workflows[i],...body}; return delay().then(()=>mock.workflows[i]||{}) }
  }

  // Custom Fields
  if (pathname === '/custom-fields') {
    if (method === 'GET')  return delay().then(()=>mock.customFields)
    if (method === 'POST') { const f={...body,id:Date.now()}; mock.customFields.push(f); return delay().then(()=>f) }
  }

  // Settings
  if (pathname === '/settings') {
    if (method === 'GET') return delay().then(()=>mock.settings)
    if (method === 'PUT') { Object.assign(mock.settings, body); return delay().then(()=>mock.settings) }
  }

  // Notifications
  if (pathname === '/notifications')          return delay().then(()=>mock.notifications)
  if (pathname === '/notifications/read-all') { mock.notifications.forEach(n=>n.read=true); return delay().then(()=>({ok:true})) }

  // Channels & Messages
  if (pathname === '/channels') {
    if (method === 'GET')  return delay().then(()=>mock.channels)
    if (method === 'POST') { const c={...body,id:Date.now()}; mock.channels.push(c); return delay().then(()=>c) }
  }
  if (pathname === '/messages') {
    if (method === 'GET') { const msgs = mock.messages[params.channel] || []; return delay().then(()=>msgs) }
    if (method === 'POST') {
      const cid = body.channel
      if (!mock.messages[cid]) mock.messages[cid] = []
      const m = { ...body, id: Date.now(), created: new Date().toISOString() }
      mock.messages[cid].push(m)
      return delay().then(()=>m)
    }
  }

  // Dashboards
  if (pathname === '/dashboards') {
    if (method === 'GET')  return delay().then(()=>mock.dashboards)
    if (method === 'POST') { const d={...body,id:Date.now()}; mock.dashboards.push(d); return delay().then(()=>d) }
  }

  // Filters
  if (pathname === '/filters') {
    if (method === 'GET')  return delay().then(()=>mock.filters)
    if (method === 'POST') { const f={...body,id:Date.now()}; mock.filters.push(f); return delay().then(()=>f) }
  }
  const fmatch = pathname.match(/^\/filters\/(\d+)$/)
  if (fmatch) {
    const id = Number(fmatch[1])
    if (method === 'DELETE') { mock.filters=mock.filters.filter(f=>f.id!==id); return delay().then(()=>({ok:true})) }
  }

  // Connectors
  if (pathname === '/connectors') return delay().then(()=>mock.connectors)
  const conmatch = pathname.match(/^\/connectors\/(\d+)$/)
  if (conmatch) {
    const id = Number(conmatch[1])
    if (method === 'PUT') { const i=mock.connectors.findIndex(c=>c.id===id); if(i>=0) mock.connectors[i]={...mock.connectors[i],...body}; return delay().then(()=>mock.connectors[i]||{}) }
  }

  // Fallback
  console.warn('[mock] unhandled:', method, path)
  return Promise.resolve({})
}

// ── Public API (same interface as before) ─────────────────────────────────────

export const login = (email, password) => request('POST', '/auth/login', { email, password })

export const getProjects    = ()         => request('GET',    '/projects')
export const createProject  = (data)     => request('POST',   '/projects', data)
export const updateProject  = (id, data) => request('PUT',    `/projects/${id}`, data)
export const deleteProject  = (id)       => request('DELETE', `/projects/${id}`)

export const getTickets  = (params = {}) => {
  const qs = new URLSearchParams()
  if (params.project)  qs.set('project',  params.project)
  if (params.status)   qs.set('status',   params.status)
  if (params.type)     qs.set('type',     params.type)
  if (params.assignee) qs.set('assignee', params.assignee)
  if (params.sprint)   qs.set('sprint',   params.sprint)
  if (params.search)   qs.set('search',   params.search)
  const q = qs.toString()
  return request('GET', `/tickets${q ? '?' + q : ''}`)
}
export const createTicket = (data)     => request('POST',   '/tickets', data)
export const getTicket    = (id)       => request('GET',    `/tickets/${id}`)
export const updateTicket = (id, data) => request('PUT',    `/tickets/${id}`, data)
export const deleteTicket = (id)       => request('DELETE', `/tickets/${id}`)

export const getFilters    = ()         => request('GET',    '/filters')
export const createFilter  = (data)     => request('POST',   '/filters', data)
export const deleteFilter  = (id)       => request('DELETE', `/filters/${id}`)

export const getUsers    = ()         => request('GET',    '/users')
export const createUser  = (data)     => request('POST',   '/users', data)
export const updateUser  = (id, data) => request('PUT',    `/users/${id}`, data)
export const deleteUser  = (id)       => request('DELETE', `/users/${id}`)

export const getConnectors    = ()         => request('GET', '/connectors')
export const updateConnector  = (id, data) => request('PUT', `/connectors/${id}`, data)

export const getNotifications = ()   => request('GET', '/notifications')
export const markAllRead      = ()   => request('PUT', '/notifications/read-all')

export const getDashboards    = ()         => request('GET',    '/dashboards')
export const createDashboard  = (data)     => request('POST',   '/dashboards', data)
export const updateDashboard  = (id, data) => request('PUT',    `/dashboards/${id}`, data)
export const deleteDashboard  = (id)       => request('DELETE', `/dashboards/${id}`)

export const getSettings    = ()     => request('GET', '/settings')
export const updateSettings = (data) => request('PUT', '/settings', data)

export const getCustomFields    = ()     => request('GET',  '/custom-fields')
export const createCustomField  = (data) => request('POST', '/custom-fields', data)

export const getGroups  = ()     => request('GET',  '/groups')
export const addGroup   = (name) => request('POST', '/groups', { name })
export const getRoles   = ()     => request('GET',  '/roles')
export const addRole    = (name) => request('POST', '/roles', { name })

export const getTeams    = ()         => request('GET',    '/teams')
export const createTeam  = (data)     => request('POST',   '/teams', data)
export const updateTeam  = (id, data) => request('PUT',    `/teams/${id}`, data)
export const deleteTeam  = (id)       => request('DELETE', `/teams/${id}`)

export const getWorkflows    = ()         => request('GET',  '/workflows')
export const createWorkflow  = (data)     => request('POST', '/workflows', data)
export const updateWorkflow  = (id, data) => request('PUT',  `/workflows/${id}`, data)
export const deleteWorkflow  = (id)       => request('DELETE',`/workflows/${id}`)

export const getBoards    = (project)     => request('GET',    project ? `/boards?project=${project}` : '/boards')
export const createBoard  = (data)        => request('POST',   '/boards', data)
export const updateBoard  = (id, data)    => request('PUT',    `/boards/${id}`, data)
export const deleteBoard  = (id)          => request('DELETE', `/boards/${id}`)

export const getSprints      = (project)  => request('GET',  project ? `/sprints?project=${project}` : '/sprints')
export const createSprint    = (data)     => request('POST', '/sprints', data)
export const updateSprint    = (id, data) => request('PUT',  `/sprints/${id}`, data)
export const deleteSprint    = (id)       => request('DELETE',`/sprints/${id}`)
export const startSprint     = (id, data) => request('POST', `/sprints/${id}/start`, data || {})
export const completeSprint  = (id)       => request('POST', `/sprints/${id}/complete`, {})

export const getChannels    = ()     => request('GET',  '/channels')
export const createChannel  = (data) => request('POST', '/channels', data)

export const getMessages  = (channelId) => request('GET',  `/messages?channel=${channelId}`)
export const sendMessage  = (data)      => request('POST', '/messages', data)

export const getProjectWorkflow    = (pid)       => request('GET', `/workflows/project/${pid}`)
export const updateProjectWorkflow = (pid, data) => request('PUT', `/workflows/project/${pid}`, data)
