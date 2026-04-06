import React from 'react'

export default function ProgressBar({ pct, color, height = 6 }) {
  return (
    <div className="progress-bar" style={{ height }}>
      <div
        className="progress-fill"
        style={{ width: `${pct || 0}%`, background: color || undefined }}
      />
    </div>
  )
}
