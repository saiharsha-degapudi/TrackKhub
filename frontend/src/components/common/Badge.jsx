import React from 'react'

export function getTypeColor(type) {
  const m = {
    Feature: 'badge-blue', Initiative: 'badge-purple', Epic: 'badge-pink',
    Story: 'badge-green', Task: 'badge-yellow', 'Sub-task': 'badge-orange'
  }
  return m[type] || 'badge-gray'
}

export function getStatusClass(status) {
  const m = {
    'To Do': 's-todo', 'In Progress': 's-inprogress', 'In Review': 's-review',
    Done: 's-done', Blocked: 's-blocked'
  }
  return m[status] || 's-todo'
}

export function priorityClass(priority) {
  return 'p-' + (priority || '').toLowerCase()
}

export function TypeBadge({ type, style }) {
  return <span className={`badge ${getTypeColor(type)}`} style={style}>{type}</span>
}

export function StatusBadge({ status, style }) {
  return <span className={`badge ${getStatusClass(status)}`} style={style}>{status}</span>
}

export default function Badge({ children, className, style }) {
  return <span className={`badge ${className || ''}`} style={style}>{children}</span>
}
