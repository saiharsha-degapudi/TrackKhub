import React from 'react'

export default function StatCard({ value, label, delta, deltaType, color }) {
  return (
    <div className="stat-card">
      <div className="stat-val" style={color ? { color } : undefined}>{value}</div>
      <div className="stat-label">{label}</div>
      {delta && (
        <div className={`stat-delta ${deltaType === 'down' ? 'delta-down' : 'delta-up'}`}>
          {delta}
        </div>
      )}
    </div>
  )
}
