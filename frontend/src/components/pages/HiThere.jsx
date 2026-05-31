import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useApp } from '../../context/AppContext'
import * as api from '../../api'
import Avatar from '../common/Avatar'

const DIRECT_MESSAGES = [
  { id: 'dm-sara',  name: 'Sara Lee' },
  { id: 'dm-mike',  name: 'Mike Chen' },
  { id: 'dm-priya', name: 'Priya Patel' },
  { id: 'dm-tom',   name: 'Tom Wilson' },
]

function formatTime(ts) {
  if (!ts) return ''
  const d = new Date(ts)
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
}

function formatDateLabel(ts) {
  if (!ts) return ''
  const d = new Date(ts)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)
  if (d.toDateString() === today.toDateString()) return 'Today'
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday'
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function HiThere() {
  const { user, channels } = useApp()
  const [activeChannel, setActiveChannel] = useState(null)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  // Set default channel when channels load
  useEffect(() => {
    if (channels.length > 0 && !activeChannel) {
      setActiveChannel({ type: 'channel', id: channels[0].id, name: channels[0].name })
    }
  }, [channels])

  // Load messages when channel changes
  useEffect(() => {
    if (!activeChannel || activeChannel.type !== 'channel') {
      // For DMs, seed with empty or fake local messages
      setMessages([])
      return
    }
    setLoading(true)
    api.getMessages(activeChannel.id)
      .then(msgs => setMessages(msgs))
      .catch(() => setMessages([]))
      .finally(() => setLoading(false))
  }, [activeChannel])

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = useCallback(async () => {
    const text = input.trim()
    if (!text || !activeChannel) return
    setInput('')

    const optimistic = {
      id: Date.now(),
      channel: activeChannel.id,
      user: user?.name || 'You',
      text,
      ts: new Date().toISOString().slice(0, 19),
      _optimistic: true,
    }
    setMessages(prev => [...prev, optimistic])

    if (activeChannel.type === 'channel') {
      try {
        const saved = await api.sendMessage({
          channel: activeChannel.id,
          user: user?.name || 'You',
          text,
        })
        setMessages(prev => prev.map(m => m._optimistic ? saved : m))
      } catch {
        // keep optimistic message on error
      }
    }
  }, [input, activeChannel, user])

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  // Group messages by date then by consecutive same-user runs
  const groupedMessages = React.useMemo(() => {
    const groups = []
    let lastDate = null
    let lastUser = null
    messages.forEach((msg, i) => {
      const dateLabel = formatDateLabel(msg.ts)
      if (dateLabel !== lastDate) {
        groups.push({ type: 'date', label: dateLabel })
        lastDate = dateLabel
        lastUser = null
      }
      const showHeader = msg.user !== lastUser
      groups.push({ type: 'message', msg, showHeader })
      lastUser = msg.user
    })
    return groups
  }, [messages])

  const currentChannel = channels.find(c => activeChannel?.id === c.id)
  const isMe = (msgUser) => msgUser === user?.name

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 56px)', overflow: 'hidden', background: 'var(--white)' }}>
      {/* Left sidebar */}
      <div style={{
        width: 220, flexShrink: 0, background: '#1e2330', color: '#c9d1e0',
        display: 'flex', flexDirection: 'column', overflowY: 'auto',
      }}>
        {/* Workspace header */}
        <div style={{ padding: '16px 14px 12px', borderBottom: '1px solid #2d3448' }}>
          <div style={{ fontWeight: 800, fontSize: 15, color: '#fff' }}>Hub Workspace</div>
          <div style={{ fontSize: 11, color: '#8892a0', marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
            {user?.name}
          </div>
        </div>

        {/* Channels */}
        <div style={{ padding: '12px 0 4px' }}>
          <div style={{ padding: '0 14px 6px', fontSize: 11, fontWeight: 700, color: '#8892a0', letterSpacing: .8 }}>
            CHANNELS
          </div>
          {channels.map(ch => {
            const isActive = activeChannel?.type === 'channel' && activeChannel?.id === ch.id
            return (
              <div
                key={ch.id}
                style={{
                  padding: '5px 14px', cursor: 'pointer', borderRadius: 4, margin: '1px 6px',
                  background: isActive ? '#3b82f6' : 'transparent',
                  color: isActive ? '#fff' : '#c9d1e0',
                  fontSize: 13, display: 'flex', alignItems: 'center', gap: 5,
                }}
                onClick={() => setActiveChannel({ type: 'channel', id: ch.id, name: ch.name })}
              >
                <span style={{ color: isActive ? '#fff' : '#8892a0', fontSize: 13 }}>#</span>
                {ch.name}
              </div>
            )
          })}
        </div>

        {/* Direct Messages */}
        <div style={{ padding: '12px 0 4px' }}>
          <div style={{ padding: '0 14px 6px', fontSize: 11, fontWeight: 700, color: '#8892a0', letterSpacing: .8 }}>
            DIRECT MESSAGES
          </div>
          {DIRECT_MESSAGES.map(dm => {
            const isActive = activeChannel?.type === 'dm' && activeChannel?.id === dm.id
            return (
              <div
                key={dm.id}
                style={{
                  padding: '5px 14px', cursor: 'pointer', borderRadius: 4, margin: '1px 6px',
                  background: isActive ? '#3b82f6' : 'transparent',
                  color: isActive ? '#fff' : '#c9d1e0',
                  fontSize: 13, display: 'flex', alignItems: 'center', gap: 8,
                }}
                onClick={() => setActiveChannel({ type: 'dm', id: dm.id, name: dm.name })}
              >
                <Avatar name={dm.name} size={18} />
                {dm.name}
              </div>
            )
          })}
        </div>
      </div>

      {/* Main chat area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Channel header */}
        <div style={{
          padding: '12px 20px', borderBottom: '1.5px solid var(--gray-200)',
          display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0,
          background: 'var(--white)',
        }}>
          {activeChannel?.type === 'channel' ? (
            <>
              <span style={{ fontSize: 18, fontWeight: 700, color: 'var(--gray-400)' }}>#</span>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15 }}>{activeChannel.name}</div>
                {currentChannel?.description && (
                  <div style={{ fontSize: 12, color: 'var(--gray-500)' }}>{currentChannel.description}</div>
                )}
              </div>
            </>
          ) : activeChannel?.type === 'dm' ? (
            <>
              <Avatar name={activeChannel.name} size={28} />
              <div style={{ fontWeight: 700, fontSize: 15 }}>{activeChannel.name}</div>
            </>
          ) : (
            <div style={{ fontWeight: 700, fontSize: 15 }}>Select a channel</div>
          )}
        </div>

        {/* Messages area */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {loading && (
            <div style={{ textAlign: 'center', color: 'var(--gray-400)', fontSize: 13, padding: 20 }}>Loading...</div>
          )}
          {!loading && activeChannel?.type === 'dm' && messages.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
              <div style={{ fontSize: 40, marginBottom: 10 }}>👋</div>
              <div style={{ fontWeight: 700, fontSize: 16 }}>Start a conversation with {activeChannel.name}</div>
              <div style={{ color: 'var(--gray-500)', fontSize: 13, marginTop: 6 }}>This is the beginning of your direct message history.</div>
            </div>
          )}
          {!loading && groupedMessages.map((item, i) => {
            if (item.type === 'date') {
              return (
                <div key={`date-${i}`} style={{
                  display: 'flex', alignItems: 'center', gap: 10, margin: '12px 0 6px',
                }}>
                  <div style={{ flex: 1, height: 1, background: 'var(--gray-200)' }} />
                  <span style={{ fontSize: 11, color: 'var(--gray-400)', fontWeight: 600, flexShrink: 0 }}>
                    {item.label}
                  </span>
                  <div style={{ flex: 1, height: 1, background: 'var(--gray-200)' }} />
                </div>
              )
            }

            const { msg, showHeader } = item
            const mine = isMe(msg.user)

            return (
              <div
                key={msg.id}
                style={{
                  display: 'flex',
                  flexDirection: mine ? 'row-reverse' : 'row',
                  alignItems: 'flex-end',
                  gap: 8,
                  marginTop: showHeader ? 10 : 2,
                }}
              >
                {/* Avatar — only show on first message in a run */}
                <div style={{ width: 32, flexShrink: 0 }}>
                  {showHeader && !mine && <Avatar name={msg.user} size={32} />}
                </div>

                <div style={{ maxWidth: '70%', display: 'flex', flexDirection: 'column', alignItems: mine ? 'flex-end' : 'flex-start' }}>
                  {showHeader && (
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 3, flexDirection: mine ? 'row-reverse' : 'row' }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)' }}>
                        {mine ? 'You' : msg.user}
                      </span>
                      <span style={{ fontSize: 10, color: 'var(--gray-400)' }}>{formatTime(msg.ts)}</span>
                    </div>
                  )}
                  <div style={{
                    padding: '8px 12px',
                    borderRadius: mine ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                    background: mine ? '#1a56db' : 'var(--gray-100)',
                    color: mine ? '#fff' : 'var(--text)',
                    fontSize: 13,
                    lineHeight: 1.5,
                    wordBreak: 'break-word',
                  }}>
                    {msg.text}
                  </div>
                  {!showHeader && (
                    <div style={{ fontSize: 10, color: 'var(--gray-300)', marginTop: 2 }}>
                      {formatTime(msg.ts)}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Input bar */}
        <div style={{
          padding: '12px 20px', borderTop: '1.5px solid var(--gray-200)',
          display: 'flex', gap: 10, alignItems: 'flex-end', flexShrink: 0,
          background: 'var(--white)',
        }}>
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={activeChannel ? `Message #${activeChannel.name}` : 'Select a channel...'}
            disabled={!activeChannel}
            rows={1}
            style={{
              flex: 1, resize: 'none', border: '1.5px solid var(--gray-200)',
              borderRadius: 10, padding: '10px 14px', fontSize: 13,
              fontFamily: 'inherit', lineHeight: 1.5, outline: 'none',
              background: 'var(--gray-50)',
              transition: 'border-color .15s',
              maxHeight: 120, overflowY: 'auto',
            }}
            onFocus={e => e.target.style.borderColor = 'var(--blue)'}
            onBlur={e => e.target.style.borderColor = 'var(--gray-200)'}
          />
          <button
            className="btn btn-primary"
            onClick={handleSend}
            disabled={!input.trim() || !activeChannel}
            style={{ flexShrink: 0, height: 40, padding: '0 18px' }}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  )
}
