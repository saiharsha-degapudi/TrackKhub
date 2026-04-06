import React from 'react'
import { useApp } from './context/AppContext'
import Login from './components/Login'
import Header from './components/Header'
import Sidebar from './components/Sidebar'
import ModalManager from './components/ModalManager'

import Projects from './components/pages/Projects'
import ProjectDetail from './components/pages/ProjectDetail'
import Dashboards from './components/pages/Dashboards'
import Filters from './components/pages/Filters'
import AllTickets from './components/pages/AllTickets'
import Roadmaps from './components/pages/Roadmaps'
import TicketView from './components/pages/TicketView'
import WebConnectors from './components/pages/WebConnectors'
import Settings from './components/pages/Settings'

function PageContent() {
  const { page } = useApp()

  switch (page) {
    case 'projects': return <Projects />
    case 'projectdetail': return <ProjectDetail />
    case 'dashboards': return <Dashboards />
    case 'filters': return <Filters />
    case 'alltickets': return <AllTickets />
    case 'roadmaps': return <Roadmaps />
    case 'ticketview': return <TicketView />
    case 'webconnectors': return <WebConnectors />
    case 'settings': return <Settings />
    default: return <Projects />
  }
}

export default function App() {
  const { user } = useApp()

  if (!user) {
    return <Login />
  }

  return (
    <>
      <div id="app">
        <Header />
        <div className="body-wrap">
          <Sidebar />
          <div className="main">
            <PageContent />
          </div>
        </div>
      </div>
      <ModalManager />
      <div className="version-badge">TracKorbit v1.0</div>
    </>
  )
}
