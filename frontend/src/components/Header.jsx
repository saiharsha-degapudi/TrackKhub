import React, { useState, useRef, useEffect } from 'react'
import { useApp } from '../context/AppContext'
import Avatar from './common/Avatar'

export default function Header() {
  const { user, openModal, doLogout, unreadCount, nav } = useApp()
  const [search, setSearch] = useState('')
  const [createOpen, setCreateOpen] = useState(false)
  const [userOpen, setUserOpen] = useState(false)
  const createRef = useRef(null)
  const userRef = useRef(null)

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (createRef.current && !createRef.current.contains(e.target)) setCreateOpen(false)
      if (userRef.current && !userRef.current.contains(e.target)) setUserOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const createItems = [
    { label: 'New Ticket',  icon: '🎫', modal: 'createTicket' },
    { label: 'New Project', icon: '📁', modal: 'createProject' },
    { label: 'New Sprint',  icon: '⚡', modal: 'createSprint' },
  ]

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

      {/* Center: Search bar */}
      <form
        onSubmit={e => e.preventDefault()}
        style={{ flex: 1, maxWidth: 360, margin: '0 auto' }}
      >
        <div style={{ position: 'relative' }}>
          <span style={{
            position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)',
            fontSize: 13, color: 'var(--gray-400)', pointerEvents: 'none',
          }}>
            🔍
          </span>
          <input
            className="form-input"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search tickets, projects, people…"
            style={{
              paddingLeft: 34, paddingRight: 52,
              fontSize: 13, width: '100%',
              background: 'var(--gray-50)',
              border: '1.5px solid var(--gray-200)',
              borderRadius: 9,
              transition: 'border .15s, background .15s, box-shadow .15s',
              height: 36,
            }}
            onFocus={e => {
              e.target.style.background = '#fff'
              e.target.style.borderColor = 'var(--blue)'
              e.target.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.10)'
            }}
            onBlur={e => {
              e.target.style.background = 'var(--gray-50)'
              e.target.style.borderColor = 'var(--gray-200)'
              e.target.style.boxShadow = 'none'
            }}
          />
          <span style={{
            position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
            fontSize: 10, color: 'var(--gray-400)', fontWeight: 600,
            background: 'var(--gray-100)', border: '1px solid var(--gray-200)',
            borderRadius: 5, padding: '2px 6px', pointerEvents: 'none', letterSpacing: '.3px',
          }}>
            ⌘K
          </span>
        </div>
      </form>

      {/* Right: actions */}
      <div className="header-right" style={{ marginLeft: 20, flexShrink: 0 }}>
        {/* + Create dropdown */}
        <div ref={createRef} style={{ position: 'relative' }}>
          <button
            onClick={() => setCreateOpen(o => !o)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '7px 14px', borderRadius: 8, border: 'none',
              background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
              color: '#fff', fontSize: 13, fontWeight: 700,
              cursor: 'pointer', fontFamily: 'inherit',
              boxShadow: '0 2px 8px rgba(37,99,235,0.35)',
              transition: 'all .15s', whiteSpace: 'nowrap',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-1px)'
              e.currentTarget.style.boxShadow = '0 4px 14px rgba(37,99,235,0.45)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'none'
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(37,99,235,0.35)'
            }}
          >
            <span style={{ fontSize: 15, lineHeight: 1 }}>+</span> Create
          </button>
          {createOpen && (
            <div style={{
              position: 'absolute', top: 'calc(100% + 8px)', right: 0,
              background: '#fff', borderRadius: 12, padding: '6px',
              boxShadow: '0 8px 32px rgba(15,23,42,0.18)',
              border: '1px solid rgba(37,99,235,0.10)',
              minWidth: 180, zIndex: 200,
            }}>
              {createItems.map(item => (
                <div
                  key={item.modal}
                  onClick={() => { setCreateOpen(false); openModal(item.modal) }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '9px 12px', borderRadius: 8,
                    fontSize: 13, fontWeight: 500, color: 'var(--text)',
                    cursor: 'pointer', transition: 'background .12s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#f0f6ff'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <span style={{ fontSize: 16 }}>{item.icon}</span>
                  {item.label}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Notification bell */}
        <div
          style={{ position: 'relative', cursor: 'pointer', padding: '6px 8px', borderRadius: 8, transition: 'background .12s' }}
          onClick={() => openModal('notifications')}
          title="Notifications"
          onMouseEnter={e => e.currentTarget.style.background = 'var(--gray-100)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          <span style={{ fontSize: 18, lineHeight: 1 }}>🔔</span>
          {unreadCount > 0 && (
            <span style={{
              position: 'absolute', top: 4, right: 4,
              width: 15, height: 15,
              background: 'var(--red)', color: '#fff', borderRadius: '50%',
              fontSize: 8, fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </div>

        {/* User avatar with dropdown */}
        <div ref={userRef} style={{ position: 'relative' }}>
          <div
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              cursor: 'pointer', padding: '4px 8px', borderRadius: 8,
              transition: 'background .15s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--gray-100)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            onClick={() => setUserOpen(o => !o)}
          >
            <Avatar name={user?.name} size={30} />
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--gray-700)' }}>
              {user?.name?.split(' ')[0]}
            </span>
            <span style={{ fontSize: 10, color: 'var(--gray-400)' }}>▾</span>
          </div>
          {userOpen && (
            <div style={{
              position: 'absolute', top: 'calc(100% + 8px)', right: 0,
              background: '#fff', borderRadius: 12, padding: '6px',
              boxShadow: '0 8px 32px rgba(15,23,42,0.18)',
              border: '1px solid rgba(37,99,235,0.10)',
              minWidth: 200, zIndex: 200,
            }}>
              <div style={{
                padding: '10px 12px 8px', borderBottom: '1px solid var(--gray-100)',
                marginBottom: 4,
              }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>{user?.name}</div>
                <div style={{ fontSize: 11, color: 'var(--gray-400)', marginTop: 2 }}>{user?.email || user?.role || 'Member'}</div>
              </div>
              <div
                onClick={() => { setUserOpen(false); doLogout() }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '9px 12px', borderRadius: 8,
                  fontSize: 13, fontWeight: 500, color: 'var(--red)',
                  cursor: 'pointer', transition: 'background .12s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#fff1f2'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <span>🚪</span> Sign out
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
