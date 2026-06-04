import React, { useState, useRef, useEffect } from 'react'
import { useApp } from '../context/AppContext'
import Avatar from './common/Avatar'

export default function Header() {
  const { user, doLogout, nav, openModal, unreadCount, notifications, doMarkAllRead } = useApp()
  const [notifOpen, setNotifOpen] = useState(false)
  const [userOpen, setUserOpen] = useState(false)
  const notifRef = useRef()
  const userRef = useRef()

  useEffect(() => {
    const h = e => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false)
      if (userRef.current && !userRef.current.contains(e.target)) setUserOpen(false)
    }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  return (
    <div style={{
      height: 48,
      display: 'flex',
      alignItems: 'center',
      padding: '0 16px',
      gap: 12,
      borderBottom: '1px solid var(--border)',
      background: '#fff',
      flexShrink: 0,
      zIndex: 100,
      justifyContent: 'space-between',
    }}>
      {/* Left: logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
        <div style={{
          width: 24,
          height: 24,
          borderRadius: 6,
          background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          fontSize: 11,
          fontWeight: 900,
          flexShrink: 0,
          letterSpacing: '-0.5px',
        }}>T</div>
        <span style={{ fontSize: 14, fontWeight: 700, color: '#111827', letterSpacing: '-0.2px' }}>TracKorbit</span>
      </div>

      {/* Center: search */}
      <div style={{ flex: 1, maxWidth: 320, position: 'relative' }}>
        <span style={{
          position: 'absolute',
          left: 9,
          top: '50%',
          transform: 'translateY(-50%)',
          color: '#9ca3af',
          fontSize: 13,
          pointerEvents: 'none',
          lineHeight: 1,
        }}>⌕</span>
        <input
          placeholder="Search issues, projects..."
          style={{
            width: '100%',
            height: 30,
            padding: '0 10px 0 28px',
            border: '1px solid var(--border)',
            borderRadius: 5,
            fontSize: 13,
            background: '#f9fafb',
            color: '#374151',
            outline: 'none',
            fontFamily: 'inherit',
            boxSizing: 'border-box',
            transition: 'border-color 0.1s',
          }}
          onFocus={e => { e.target.style.borderColor = '#2563eb'; e.target.style.background = '#fff'; }}
          onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.background = '#f9fafb'; }}
        />
        <span style={{
          position: 'absolute',
          right: 8,
          top: '50%',
          transform: 'translateY(-50%)',
          color: '#d1d5db',
          fontSize: 10,
          pointerEvents: 'none',
          fontFamily: 'monospace',
        }}>⌘K</span>
      </div>

      {/* Right: actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
        <button
          className="btn btn-primary"
          onClick={() => openModal('createTicket')}
          style={{ fontSize: 12, height: 28, padding: '0 10px', gap: 4 }}
        >
          <span style={{ fontSize: 14, lineHeight: 1 }}>+</span> Create
        </button>

        {/* Notifications */}
        <div ref={notifRef} style={{ position: 'relative' }}>
          <button
            onClick={() => setNotifOpen(o => !o)}
            style={{
              width: 30,
              height: 30,
              border: '1px solid var(--border)',
              borderRadius: 5,
              background: notifOpen ? '#f3f4f6' : '#fff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              color: '#6b7280',
              fontSize: 13,
            }}
            title="Notifications"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M8 1.5a5 5 0 0 1 5 5v2.5l1 2H2l1-2V6.5a5 5 0 0 1 5-5z"/>
              <path d="M6.5 13a1.5 1.5 0 0 0 3 0"/>
            </svg>
            {unreadCount > 0 && (
              <span style={{
                position: 'absolute',
                top: 5,
                right: 5,
                width: 6,
                height: 6,
                background: '#ef4444',
                borderRadius: '50%',
                border: '1.5px solid #fff',
              }} />
            )}
          </button>

          {notifOpen && (
            <div style={{
              position: 'absolute',
              right: 0,
              top: 36,
              width: 300,
              background: '#fff',
              border: '1px solid var(--border)',
              borderRadius: 8,
              boxShadow: 'var(--shadow-md)',
              zIndex: 200,
              overflow: 'hidden',
            }}>
              <div style={{
                padding: '10px 14px',
                borderBottom: '1px solid var(--border)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>Notifications</span>
                {unreadCount > 0 && (
                  <button
                    onClick={doMarkAllRead}
                    style={{ fontSize: 11, color: '#2563eb', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                  >
                    Mark all read
                  </button>
                )}
              </div>
              {(!notifications || notifications.length === 0) ? (
                <div style={{ padding: '20px 14px', textAlign: 'center', color: '#9ca3af', fontSize: 12 }}>
                  No notifications
                </div>
              ) : (
                notifications.slice(0, 6).map(n => (
                  <div
                    key={n.id}
                    style={{
                      padding: '9px 14px',
                      borderBottom: '1px solid #f3f4f6',
                      background: n.read ? '#fff' : '#eff6ff',
                      fontSize: 12,
                      color: '#374151',
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{ lineHeight: 1.4 }}>{n.text}</div>
                    <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>{n.time}</div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* User menu */}
        <div ref={userRef} style={{ position: 'relative' }}>
          <button
            onClick={() => setUserOpen(o => !o)}
            style={{
              background: 'none',
              border: '1px solid transparent',
              borderRadius: 5,
              cursor: 'pointer',
              padding: '0 6px',
              height: 30,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              transition: 'background 0.1s, border-color 0.1s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#f3f4f6'; e.currentTarget.style.borderColor = 'var(--border)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.borderColor = 'transparent'; }}
          >
            <Avatar name={user?.name} size={22} />
            <span style={{ fontSize: 12, color: '#374151', fontWeight: 500, maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.name}
            </span>
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round">
              <path d="M2 3.5l3 3 3-3"/>
            </svg>
          </button>

          {userOpen && (
            <div style={{
              position: 'absolute',
              right: 0,
              top: 36,
              width: 200,
              background: '#fff',
              border: '1px solid var(--border)',
              borderRadius: 8,
              boxShadow: 'var(--shadow-md)',
              zIndex: 200,
              padding: 4,
              overflow: 'hidden',
            }}>
              <div style={{ padding: '8px 12px 10px', borderBottom: '1px solid #f3f4f6', marginBottom: 4 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{user?.name}</div>
                <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 1 }}>{user?.email}</div>
                {user?.role && (
                  <div style={{ marginTop: 4 }}>
                    <span className="badge badge-gray" style={{ fontSize: 10 }}>{user.role}</span>
                  </div>
                )}
              </div>

              <MenuItem
                onClick={() => { nav('settings'); setUserOpen(false); }}
                icon={
                  <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="8" cy="8" r="2.5"/>
                    <path d="M8 1v1.5M8 13.5V15M15 8h-1.5M2.5 8H1M12.7 3.3l-1.1 1.1M4.4 11.6l-1.1 1.1M12.7 12.7l-1.1-1.1M4.4 4.4L3.3 3.3"/>
                  </svg>
                }
                label="Settings"
              />
              <div style={{ height: 1, background: '#f3f4f6', margin: '3px 0' }} />
              <MenuItem
                onClick={doLogout}
                icon={
                  <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10 3H4a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h6"/>
                    <path d="M13 8H7M11 6l2 2-2 2"/>
                  </svg>
                }
                label="Sign out"
                danger
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function MenuItem({ onClick, icon, label, danger }) {
  const [hovered, setHovered] = useState(false)
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '6px 10px',
        fontSize: 13,
        color: danger ? '#ef4444' : '#374151',
        cursor: 'pointer',
        borderRadius: 4,
        background: hovered ? (danger ? '#fef2f2' : '#f3f4f6') : 'none',
        transition: 'background 0.08s',
      }}
    >
      <span style={{ color: danger ? '#ef4444' : '#6b7280', display: 'flex', alignItems: 'center' }}>{icon}</span>
      {label}
    </div>
  )
}
