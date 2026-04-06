import React from 'react'

const COLORS = ['#1a56db', '#7c3aed', '#16a34a', '#ea580c', '#0891b2']

export default function Avatar({ name = '?', size = 28 }) {
  const initials = name.split(' ').map(x => x[0]).join('').slice(0, 2).toUpperCase()
  const ci = (name || '').charCodeAt(0) % 5
  const color = COLORS[ci]
  const fontSize = Math.round(size * 0.38)
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', background: color,
      color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize, fontWeight: 700, flexShrink: 0
    }}>
      {initials}
    </div>
  )
}
