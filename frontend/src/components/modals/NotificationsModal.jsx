import React from 'react'
import { useApp } from '../../context/AppContext'

export default function NotificationsModal() {
  const { notifications, closeModal, doMarkAllRead } = useApp()

  return (
    <div>
      <div className="modal-title">Notifications</div>
      <button className="modal-close" onClick={closeModal}>×</button>

      {notifications.map(n => (
        <div key={n.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '12px 0', borderBottom: '1px solid var(--gray-100)' }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: n.read ? 'var(--gray-300)' : 'var(--blue)', marginTop: 5, flexShrink: 0 }} />
          <div>
            <div style={{ fontSize: 13, fontWeight: n.read ? 400 : 600 }}>{n.text}</div>
            <div style={{ fontSize: 11, color: 'var(--gray-400)', marginTop: 2 }}>{n.time}</div>
          </div>
        </div>
      ))}

      <div style={{ textAlign: 'right', marginTop: 10 }}>
        <button className="btn btn-ghost" onClick={async () => { await doMarkAllRead(); closeModal() }}>
          Mark all read
        </button>
      </div>
    </div>
  )
}
