import React, { useEffect } from 'react'
import { useApp } from '../context/AppContext'
import CreateTicketModal from './modals/CreateTicketModal'
import EditTicketModal from './modals/EditTicketModal'
import CreateProjectModal from './modals/CreateProjectModal'
import CreateFilterModal from './modals/CreateFilterModal'
import CreateDashboardModal from './modals/CreateDashboardModal'
import EditDashboardModal from './modals/EditDashboardModal'
import AddUserModal from './modals/AddUserModal'
import NotificationsModal from './modals/NotificationsModal'
import AddFieldModal from './modals/AddFieldModal'
import SimpleModal from './modals/SimpleModal'

export default function ModalManager() {
  const { modal, closeModal } = useApp()
  if (!modal) return null

  // Escape key handler
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') closeModal() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [closeModal])

  let inner = null
  const { type, data, extra } = modal

  if (type === 'createTicket') inner = <CreateTicketModal data={data} extra={extra} />
  else if (type === 'editTicket') inner = <EditTicketModal data={data} />
  else if (type === 'createProject') inner = <CreateProjectModal />
  else if (type === 'createFilter') inner = <CreateFilterModal />
  else if (type === 'createDashboard') inner = <CreateDashboardModal />
  else if (type === 'editDashboard') inner = <EditDashboardModal data={data} />
  else if (type === 'addUser') inner = <AddUserModal />
  else if (type === 'editUser') inner = <AddUserModal data={data} />
  else if (type === 'addField') inner = <AddFieldModal />
  else if (type === 'notifications') inner = <NotificationsModal />
  else if (type === 'addGroup') inner = <SimpleModal type="addGroup" />
  else if (type === 'addRole') inner = <SimpleModal type="addRole" />
  else inner = <div><div className="modal-title">Coming Soon</div><button className="modal-close" onClick={closeModal}>×</button></div>

  return (
    <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) closeModal() }}>
      <div className="modal">
        {inner}
      </div>
    </div>
  )
}
