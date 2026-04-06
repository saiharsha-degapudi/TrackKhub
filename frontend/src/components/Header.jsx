import React from 'react'
import { useApp } from '../context/AppContext'
import Avatar from './common/Avatar'

const NAV_ITEMS = [
  { key: 'projects', label: 'Projects' },
  { key: 'dashboards', label: 'Dashboards' },
  { key: 'filters', label: 'Filters' },
  { key: 'alltickets', label: 'All Tickets' },
  { key: 'roadmaps', label: '🗺 Roadmaps' },
  { key: 'webconnectors', label: 'Web Connectors' },
]

export default function Header() {
  const { user, page, nav, openModal, doLogout, unreadCount } = useApp()

  return (
    <div className="header">
      <div className="logo">
        <div className="logo-icon">T</div>
        TracKorbit
      </div>
      <div className="header-nav">
        {NAV_ITEMS.map(n => (
          <button
            key={n.key}
            className={page === n.key ? 'active' : ''}
            onClick={() => nav(n.key)}
          >
            {n.label}
          </button>
        ))}
        <button
          className={page === 'settings' ? 'active' : ''}
          onClick={() => nav('settings')}
        >
          ⚙ Settings
        </button>
      </div>
      <div className="header-right">
        <button className="btn btn-primary btn-sm" onClick={() => openModal('createTicket')}>
          + Create
        </button>
        <div
          style={{ position: 'relative', cursor: 'pointer', fontSize: 18 }}
          onClick={() => openModal('notifications')}
        >
          🔔
          {unreadCount > 0 && (
            <span style={{
              position: 'absolute', top: -4, right: -4, width: 16, height: 16,
              background: 'var(--red)', color: '#fff', borderRadius: '50%',
              fontSize: 9, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              {unreadCount}
            </span>
          )}
        </div>
        <Avatar name={user?.name} size={32} />
        <span style={{ fontSize: 13, fontWeight: 600 }}>{user?.name?.split(' ')[0]}</span>
        <button className="btn btn-ghost btn-sm" onClick={doLogout}>Logout</button>
      </div>
    </div>
  )
}
