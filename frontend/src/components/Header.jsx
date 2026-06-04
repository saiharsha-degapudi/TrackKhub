import React, { useState } from 'react'
import { useApp } from '../context/AppContext'
import Avatar from './common/Avatar'

export default function Header() {
  const { user, openModal, doLogout, unreadCount, nav } = useApp()
  const [search, setSearch] = useState('')

  const handleSearch = (e) => {
    e.preventDefault()
    // Could wire up global search here
  }

  return (
    <div className="header" style={{ gap: 0, padding: '0 20px' }}>
      {/* Left: Logo */}
      <div
        className="logo"
        style={{ cursor: 'pointer', marginRight: 20, flexShrink: 0 }}
        onClick={() => nav('home')}
      >
        <div className="logo-icon">H</div>
        Hub
      </div>

      {/* Center: Global search */}
      <form
        onSubmit={handleSearch}
        style={{ flex: 1, maxWidth: 480, margin: '0 auto' }}
      >
        <div style={{ position: 'relative' }}>
          <span style={{
            position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)',
            fontSize: 14, color: 'var(--gray-400)', pointerEvents: 'none',
          }}>
            🔍
          </span>
          <input
            className="form-input"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search tickets, projects..."
            style={{
              paddingLeft: 32, paddingRight: 12,
              fontSize: 13, width: '100%',
              background: 'var(--gray-50)',
              border: '1.5px solid var(--gray-200)',
              borderRadius: 8,
              transition: 'border .15s, background .15s',
            }}
            onFocus={e => {
              e.target.style.background = '#fff'
              e.target.style.borderColor = 'var(--blue)'
            }}
            onBlur={e => {
              e.target.style.background = 'var(--gray-50)'
              e.target.style.borderColor = 'var(--gray-200)'
            }}
          />
        </div>
      </form>

      {/* Right: actions */}
      <div className="header-right" style={{ marginLeft: 20, flexShrink: 0 }}>
        <button
          className="btn btn-primary btn-sm"
          onClick={() => openModal('createTicket')}
          style={{ whiteSpace: 'nowrap' }}
        >
          + Create
        </button>

        {/* Notification bell */}
        <div
          style={{ position: 'relative', cursor: 'pointer', fontSize: 18, lineHeight: 1, padding: '4px' }}
          onClick={() => openModal('notifications')}
          title="Notifications"
        >
          🔔
          {unreadCount > 0 && (
            <span style={{
              position: 'absolute', top: 0, right: 0,
              width: 15, height: 15,
              background: 'var(--red)', color: '#fff', borderRadius: '50%',
              fontSize: 8, fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </div>

        {/* User avatar */}
        <div
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            cursor: 'pointer', padding: '4px 8px', borderRadius: 8,
            transition: 'background .15s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--gray-100)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          onClick={doLogout}
          title={`${user?.name} — click to logout`}
        >
          <Avatar name={user?.name} size={30} />
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--gray-700)' }}>
            {user?.name?.split(' ')[0]}
          </span>
        </div>
      </div>
    </div>
  )
}
