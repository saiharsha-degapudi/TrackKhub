import React, { createContext, useContext, useState, useCallback } from 'react'
import * as api from '../api'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [user, setUser] = useState(null)
  const [page, setPage] = useState('login')
  const [prevPage, setPrevPage] = useState(null)
  const [activeProject, setActiveProject] = useState(null)
  const [projectTab, setProjectTab] = useState('board')
  const [settingsTab, setSettingsTab] = useState('users')
  const [viewTicketId, setViewTicketId] = useState(null)
  const [modal, setModal] = useState(null)

  // Data state
  const [projects, setProjects] = useState([])
  const [tickets, setTickets] = useState([])
  const [filters, setFilters] = useState([])
  const [users, setUsers] = useState([])
  const [connectors, setConnectors] = useState([])
  const [notifications, setNotifications] = useState([])
  const [customDashboards, setCustomDashboards] = useState([])
  const [settings, setSettings] = useState({})
  const [customFields, setCustomFields] = useState([])
  const [groups, setGroups] = useState([])
  const [roles, setRoles] = useState([])

  // UI state
  const [recentProjects, setRecentProjects] = useState([])
  const [projectsOpen, setProjectsOpen] = useState(true)
  const [projectSearch, setProjectSearch] = useState('')
  const [ticketSearch, setTicketSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('All')
  const [statusFilter, setStatusFilter] = useState('All')
  const [projectFilter, setProjectFilter] = useState('All')
  const [roadmapZoom, setRoadmapZoom] = useState('month')
  const [roadmapExpanded, setRoadmapExpanded] = useState({})
  const [roadmapProjectFilter, setRoadmapProjectFilter] = useState([])
  const [roadmapTypeFilter, setRoadmapTypeFilter] = useState('All')

  // ── Auth ──────────────────────────────────────────────────────────────────
  const doLogin = useCallback(async (email, password) => {
    const u = await api.login(email, password)
    setUser(u)
    // Load all data
    const [
      projs, tks, filts, usrs, conns, notifs, dashes, stgs, fields, grps, rls
    ] = await Promise.all([
      api.getProjects(),
      api.getTickets(),
      api.getFilters(),
      api.getUsers(),
      api.getConnectors(),
      api.getNotifications(),
      api.getDashboards(),
      api.getSettings(),
      api.getCustomFields(),
      api.getGroups(),
      api.getRoles(),
    ])
    setProjects(projs)
    setTickets(tks)
    setFilters(filts)
    setUsers(usrs)
    setConnectors(conns)
    setNotifications(notifs)
    setCustomDashboards(dashes)
    setSettings(stgs)
    setCustomFields(fields)
    setGroups(grps)
    setRoles(rls)
    setPage('projects')
    return u
  }, [])

  const doLogout = useCallback(() => {
    setUser(null)
    setPage('login')
    setActiveProject(null)
  }, [])

  // ── Navigation ────────────────────────────────────────────────────────────
  const nav = useCallback((p) => {
    setPage(p)
    if (p === 'projects') setActiveProject(null)
  }, [])

  const navSettings = useCallback((tab) => {
    setPage('settings')
    setSettingsTab(tab)
  }, [])

  const openProject = useCallback((id) => {
    setActiveProject(id)
    setPage('projectdetail')
    setProjectTab('board')
    setRecentProjects(prev => [id, ...prev.filter(x => x !== id)].slice(0, 3))
  }, [])

  const openTicketView = useCallback((id) => {
    setViewTicketId(id)
    setPage(currentPage => {
      setPrevPage(currentPage)
      return 'ticketview'
    })
  }, [])

  // ── Modal ─────────────────────────────────────────────────────────────────
  const openModal = useCallback((type, data, extra) => {
    setModal({ type, data, extra })
  }, [])

  const closeModal = useCallback(() => {
    setModal(null)
  }, [])

  // ── Projects ──────────────────────────────────────────────────────────────
  const doCreateProject = useCallback(async (data) => {
    const p = await api.createProject(data)
    setProjects(prev => [...prev, p])
    setActiveProject(p.id)
    setPage('projectdetail')
    setProjectTab('backlog')
    setModal(null)
    return p
  }, [])

  // ── Tickets ───────────────────────────────────────────────────────────────
  const doCreateTicket = useCallback(async (data) => {
    const t = await api.createTicket(data)
    setTickets(prev => [...prev, t])
    setActiveProject(data.project)
    setPage('projectdetail')
    setProjectTab('backlog')
    setModal(null)
    return t
  }, [])

  const doUpdateTicket = useCallback(async (id, data) => {
    const t = await api.updateTicket(id, data)
    setTickets(prev => prev.map(x => x.id === id ? t : x))
    return t
  }, [])

  const doDeleteTicket = useCallback(async (id) => {
    await api.deleteTicket(id)
    setTickets(prev => prev.filter(t => t.id !== id))
    setPage(prevPage || 'alltickets')
  }, [prevPage])

  // ── Filters ───────────────────────────────────────────────────────────────
  const doCreateFilter = useCallback(async (data) => {
    const f = await api.createFilter(data)
    setFilters(prev => [...prev, f])
    setModal(null)
    return f
  }, [])

  const doDeleteFilter = useCallback(async (id) => {
    await api.deleteFilter(id)
    setFilters(prev => prev.filter(f => f.id !== id))
  }, [])

  // ── Users ─────────────────────────────────────────────────────────────────
  const doCreateUser = useCallback(async (data) => {
    const u = await api.createUser(data)
    setUsers(prev => [...prev, u])
    setModal(null)
    return u
  }, [])

  const doUpdateUser = useCallback(async (id, data) => {
    const u = await api.updateUser(id, data)
    setUsers(prev => prev.map(x => x.id === id ? u : x))
    setModal(null)
    return u
  }, [])

  const doDeleteUser = useCallback(async (id) => {
    await api.deleteUser(id)
    setUsers(prev => prev.filter(u => u.id !== id))
  }, [])

  const doToggleUser = useCallback(async (id) => {
    const u = users.find(x => x.id === id)
    if (!u) return
    await doUpdateUser(id, { active: !u.active })
  }, [users, doUpdateUser])

  // ── Connectors ────────────────────────────────────────────────────────────
  const doToggleConnector = useCallback(async (id) => {
    const c = connectors.find(x => x.id === id)
    if (!c) return
    const newStatus = c.status === 'Connected' ? 'Disconnected' : 'Connected'
    const updated = await api.updateConnector(id, { status: newStatus })
    setConnectors(prev => prev.map(x => x.id === id ? updated : x))
  }, [connectors])

  // ── Notifications ─────────────────────────────────────────────────────────
  const doMarkAllRead = useCallback(async () => {
    const updated = await api.markAllRead()
    setNotifications(updated)
  }, [])

  // ── Dashboards ────────────────────────────────────────────────────────────
  const doCreateDashboard = useCallback(async (data) => {
    const d = await api.createDashboard(data)
    setCustomDashboards(prev => [...prev, d])
    setModal(null)
    return d
  }, [])

  const doUpdateDashboard = useCallback(async (id, data) => {
    const d = await api.updateDashboard(id, data)
    setCustomDashboards(prev => prev.map(x => x.id === id ? d : x))
    setModal(null)
    return d
  }, [])

  const doDeleteDashboard = useCallback(async (id) => {
    await api.deleteDashboard(id)
    setCustomDashboards(prev => prev.filter(d => d.id !== id))
  }, [])

  // ── Settings ──────────────────────────────────────────────────────────────
  const doUpdateSettings = useCallback(async (data) => {
    const s = await api.updateSettings(data)
    setSettings(s)
    return s
  }, [])

  // ── Custom Fields ─────────────────────────────────────────────────────────
  const doCreateCustomField = useCallback(async (data) => {
    const f = await api.createCustomField(data)
    setCustomFields(prev => [...prev, f])
    setModal(null)
    return f
  }, [])

  // ── Groups & Roles ────────────────────────────────────────────────────────
  const doAddGroup = useCallback(async (name) => {
    const updated = await api.addGroup(name)
    setGroups(updated)
    setModal(null)
  }, [])

  const doAddRole = useCallback(async (name) => {
    const updated = await api.addRole(name)
    setRoles(updated)
    setModal(null)
  }, [])

  // ── Roadmap ───────────────────────────────────────────────────────────────
  const toggleRoadmapRow = useCallback((id) => {
    setRoadmapExpanded(prev => ({ ...prev, [id]: prev[id] === false ? true : false }))
  }, [])

  const expandAllRoadmap = useCallback(() => {
    const exp = {}
    tickets.forEach(t => exp[t.id] = true)
    setRoadmapExpanded(exp)
  }, [tickets])

  const collapseAllRoadmap = useCallback(() => {
    const exp = {}
    tickets.forEach(t => exp[t.id] = false)
    setRoadmapExpanded(exp)
  }, [tickets])

  const toggleRoadmapProjectFilter = useCallback((id) => {
    setRoadmapProjectFilter(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }, [])

  // ── Helpers ───────────────────────────────────────────────────────────────
  const getFilteredTickets = useCallback((filterId) => {
    const f = filters.find(x => x.id === filterId)
    if (!f) return tickets
    return tickets.filter(t => {
      const c = f.conditions
      if (c.assignee && t.assignee !== c.assignee) return false
      if (c.status && !c.status.includes(t.status)) return false
      if (c.priority && t.priority !== c.priority) return false
      if (c.sprint && t.sprint !== c.sprint) return false
      if (c.type && !c.type.includes(t.type)) return false
      return true
    })
  }, [filters, tickets])

  const projectById = useCallback((id) => projects.find(p => p.id === id), [projects])

  const unreadCount = notifications.filter(n => !n.read).length

  const value = {
    // State
    user, page, prevPage, activeProject, projectTab, settingsTab,
    viewTicketId, modal, projects, tickets, filters, users, connectors,
    notifications, customDashboards, settings, customFields, groups, roles,
    recentProjects, projectsOpen, projectSearch, ticketSearch,
    typeFilter, statusFilter, projectFilter, roadmapZoom, roadmapExpanded,
    roadmapProjectFilter, roadmapTypeFilter, unreadCount,

    // Setters
    setProjectTab, setSettingsTab, setProjectsOpen, setProjectSearch,
    setTicketSearch, setTypeFilter, setStatusFilter, setProjectFilter,
    setRoadmapZoom, setRoadmapTypeFilter, setRoadmapProjectFilter, setPrevPage,

    // Actions
    doLogin, doLogout, nav, navSettings, openProject, openTicketView,
    openModal, closeModal,
    doCreateProject, doCreateTicket, doUpdateTicket, doDeleteTicket,
    doCreateFilter, doDeleteFilter,
    doCreateUser, doUpdateUser, doDeleteUser, doToggleUser,
    doToggleConnector,
    doMarkAllRead,
    doCreateDashboard, doUpdateDashboard, doDeleteDashboard,
    doUpdateSettings,
    doCreateCustomField,
    doAddGroup, doAddRole,
    toggleRoadmapRow, expandAllRoadmap, collapseAllRoadmap,
    toggleRoadmapProjectFilter,
    getFilteredTickets, projectById,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used inside AppProvider')
  return ctx
}
