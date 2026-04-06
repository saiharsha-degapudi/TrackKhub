import React from 'react'
import { useApp } from '../../context/AppContext'

export default function WebConnectors() {
  const { connectors, doToggleConnector } = useApp()

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="page-title">Web Connectors</div>
          <div className="page-sub">Integrate with external tools</div>
        </div>
        <button className="btn btn-primary">+ Add Connector</button>
      </div>
      <div className="grid-2">
        {connectors.map(c => (
          <div key={c.id} className="card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 28 }}>{c.icon}</span>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700 }}>{c.name}</div>
                  <div style={{ fontSize: 12, color: c.status === 'Connected' ? 'var(--green)' : 'var(--gray-400)', fontWeight: 600 }}>
                    ⬤ {c.status}
                  </div>
                </div>
              </div>
              <button
                className={`btn ${c.status === 'Connected' ? 'btn-outline' : 'btn-primary'} btn-sm`}
                onClick={() => doToggleConnector(c.id)}
              >
                {c.status === 'Connected' ? 'Disconnect' : 'Connect'}
              </button>
            </div>
            <div style={{ fontSize: 12, color: 'var(--gray-500)', marginBottom: 8 }}>
              Events: {c.events.join(', ')}
            </div>
            {c.status === 'Connected' && (
              <input className="form-input" placeholder="Webhook URL" defaultValue={c.url || ''} />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
