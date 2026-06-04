import React, { useState } from 'react'
import { useApp } from '../context/AppContext'

export default function Login() {
  const { doLogin } = useApp()
  const [email, setEmail] = useState('harsha@trackkub.io')
  const [password, setPassword] = useState('password')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    if (!email || !password) return
    setLoading(true)
    setError('')
    try {
      await doLogin(email, password)
    } catch (err) {
      setError('Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const inp = {
    width: '100%',
    height: 36,
    padding: '0 12px',
    fontSize: 13,
    border: '1px solid #d1d5db',
    borderRadius: 6,
    outline: 'none',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
    color: '#111827',
    background: '#fff',
    marginBottom: 10,
    display: 'block',
    transition: 'border-color .15s',
  }

  return (
    <div className="login-page">
      <div className="login-card">
        {/* Logo */}
        <div className="login-logo">
          <div className="login-logo-mark">T</div>
          <span style={{ fontSize: 16, fontWeight: 800, color: '#111827', letterSpacing: '-0.3px' }}>
            TracKorbit
          </span>
        </div>

        {/* Heading */}
        <div className="login-title">Sign in to your workspace</div>
        <div className="login-sub">Welcome back — enter your details below</div>

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: 4 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#374151', marginBottom: 5 }}>
              Email address
            </label>
            <input
              type="email"
              placeholder="you@company.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              style={inp}
              onFocus={e => e.target.style.borderColor = '#2563eb'}
              onBlur={e => e.target.style.borderColor = '#d1d5db'}
              required
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#374151', marginBottom: 5 }}>
              Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              style={inp}
              onFocus={e => e.target.style.borderColor = '#2563eb'}
              onBlur={e => e.target.style.borderColor = '#d1d5db'}
              required
            />
          </div>

          {error && (
            <div style={{
              fontSize: 12, color: '#dc2626', background: '#fef2f2',
              border: '1px solid #fecaca', borderRadius: 5,
              padding: '8px 10px', marginBottom: 12,
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%', height: 36, fontSize: 13, fontWeight: 600,
              background: loading ? '#93c5fd' : '#2563eb',
              color: '#fff', border: 'none', borderRadius: 6,
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background .15s',
            }}
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <div style={{
          marginTop: 20, paddingTop: 16,
          borderTop: '1px solid #f3f4f6',
          fontSize: 12, color: '#9ca3af', textAlign: 'center',
        }}>
          Demo credentials: <span style={{ color: '#2563eb', fontWeight: 500 }}>harsha@trackkub.io</span> / <span style={{ color: '#2563eb', fontWeight: 500 }}>password</span>
        </div>
      </div>
    </div>
  )
}
