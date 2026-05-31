/**
 * Hub API client — all fetch calls to /api/... endpoints.
 */

const BASE = '/api'

async function request(method, path, body) {
  const opts = {
    method,
    headers: { 'Content-Type': 'application/json' },
  }
  if (body !== undefined) opts.body = JSON.stringify(body)
  const res = await fetch(BASE + path, opts)
  if (!res.ok) {
    const err = await res.text()
    throw new Error(err || `${method} ${path} failed: ${res.status}`)
  }
  return res.json()
}

// ── Auth ──────────────────────────────────────────────────────────────────────
export const login = (email, password) =>
  request('POST', '/auth/login', { email, password })

// ── Projects ──────────────────────────────────────────────────────────────────
export const getProjects = () => request('GET', '/projects')
export const createProject = (data) => request('POST', '/projects', data)
export const updateProject = (id, data) => request('PUT', `/projects/${id}`, data)
export const deleteProject = (id) => request('DELETE', `/projects/${id}`)

// ── Tickets ───────────────────────────────────────────────────────────────────
export const getTickets = (params = {}) => {
  const qs = new URLSearchParams()
  if (params.project) qs.set('project', params.project)
  if (params.status) qs.set('status', params.status)
  if (params.type) qs.set('type', params.type)
  if (params.assignee) qs.set('assignee', params.assignee)
  if (params.sprint) qs.set('sprint', params.sprint)
  if (params.search) qs.set('search', params.search)
  const q = qs.toString()
  return request('GET', `/tickets${q ? '?' + q : ''}`)
}
export const createTicket = (data) => request('POST', '/tickets', data)
export const getTicket = (id) => request('GET', `/tickets/${id}`)
export const updateTicket = (id, data) => request('PUT', `/tickets/${id}`, data)
export const deleteTicket = (id) => request('DELETE', `/tickets/${id}`)

// ── Filters ───────────────────────────────────────────────────────────────────
export const getFilters = () => request('GET', '/filters')
export const createFilter = (data) => request('POST', '/filters', data)
export const deleteFilter = (id) => request('DELETE', `/filters/${id}`)

// ── Users ─────────────────────────────────────────────────────────────────────
export const getUsers = () => request('GET', '/users')
export const createUser = (data) => request('POST', '/users', data)
export const updateUser = (id, data) => request('PUT', `/users/${id}`, data)
export const deleteUser = (id) => request('DELETE', `/users/${id}`)

// ── Connectors ────────────────────────────────────────────────────────────────
export const getConnectors = () => request('GET', '/connectors')
export const updateConnector = (id, data) => request('PUT', `/connectors/${id}`, data)

// ── Notifications ─────────────────────────────────────────────────────────────
export const getNotifications = () => request('GET', '/notifications')
export const markAllRead = () => request('PUT', '/notifications/read-all')

// ── Dashboards ────────────────────────────────────────────────────────────────
export const getDashboards = () => request('GET', '/dashboards')
export const createDashboard = (data) => request('POST', '/dashboards', data)
export const updateDashboard = (id, data) => request('PUT', `/dashboards/${id}`, data)
export const deleteDashboard = (id) => request('DELETE', `/dashboards/${id}`)

// ── Settings ──────────────────────────────────────────────────────────────────
export const getSettings = () => request('GET', '/settings')
export const updateSettings = (data) => request('PUT', '/settings', data)

// ── Custom Fields ─────────────────────────────────────────────────────────────
export const getCustomFields = () => request('GET', '/custom-fields')
export const createCustomField = (data) => request('POST', '/custom-fields', data)

// ── Groups & Roles ────────────────────────────────────────────────────────────
export const getGroups = () => request('GET', '/groups')
export const addGroup = (name) => request('POST', '/groups', { name })
export const getRoles = () => request('GET', '/roles')
export const addRole = (name) => request('POST', '/roles', { name })

// ── Teams ─────────────────────────────────────────────────────────────────────
export const getTeams = () => request('GET', '/teams')
export const createTeam = (data) => request('POST', '/teams', data)
export const updateTeam = (id, data) => request('PUT', `/teams/${id}`, data)
export const deleteTeam = (id) => request('DELETE', `/teams/${id}`)

// ── Workflows ─────────────────────────────────────────────────────────────────
export const getWorkflows = () => request('GET', '/workflows')
export const createWorkflow = (data) => request('POST', '/workflows', data)
export const updateWorkflow = (id, data) => request('PUT', `/workflows/${id}`, data)
export const deleteWorkflow = (id) => request('DELETE', `/workflows/${id}`)

// ── Boards ────────────────────────────────────────────────────────────────────
export const getBoards = (project) => request('GET', project ? `/boards?project=${project}` : '/boards')
export const createBoard = (data) => request('POST', '/boards', data)
export const updateBoard = (id, data) => request('PUT', `/boards/${id}`, data)
export const deleteBoard = (id) => request('DELETE', `/boards/${id}`)

// ── Sprints ───────────────────────────────────────────────────────────────────
export const getSprints = (project) => request('GET', project ? `/sprints?project=${project}` : '/sprints')
export const createSprint = (data) => request('POST', '/sprints', data)
export const updateSprint = (id, data) => request('PUT', `/sprints/${id}`, data)
export const deleteSprint = (id) => request('DELETE', `/sprints/${id}`)
export const startSprint = (id, data) => request('POST', `/sprints/${id}/start`, data || {})
export const completeSprint = (id) => request('POST', `/sprints/${id}/complete`, {})

// ── Chat Channels ─────────────────────────────────────────────────────────────
export const getChannels = () => request('GET', '/channels')
export const createChannel = (data) => request('POST', '/channels', data)

// ── Chat Messages ─────────────────────────────────────────────────────────────
export const getMessages = (channelId) => request('GET', `/messages?channel=${channelId}`)
export const sendMessage = (data) => request('POST', '/messages', data)

// ── Project Workflow ──────────────────────────────────────────────────────────
export const getProjectWorkflow = (pid) => request('GET', `/workflows/project/${pid}`)
export const updateProjectWorkflow = (pid, data) => request('PUT', `/workflows/project/${pid}`, data)
