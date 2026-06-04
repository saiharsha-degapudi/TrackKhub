import React, { useState } from 'react'
import { useApp } from '../../context/AppContext'
import Avatar from '../common/Avatar'

// ─── Helpers ────────────────────────────────────────────────────────────────

const primary = '#2563eb'
const primaryLight = '#eff6ff'

const card = {
  background: '#fff',
  borderRadius: 14,
  boxShadow: '0 4px 24px rgba(59,130,246,0.10)',
  padding: 24,
}

function SectionHeader({ icon, title, subtitle }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
        <div style={{
          width: 4, height: 28, background: primary, borderRadius: 4, flexShrink: 0,
        }} />
        <span style={{ fontSize: 22, fontWeight: 800, color: '#1e293b' }}>{icon} {title}</span>
      </div>
      {subtitle && <div style={{ fontSize: 13, color: '#64748b', marginLeft: 14 }}>{subtitle}</div>}
    </div>
  )
}

function Toggle({ on, onChange }) {
  return (
    <div
      onClick={() => onChange(!on)}
      style={{
        width: 44, height: 24, borderRadius: 12,
        background: on ? primary : '#cbd5e1',
        cursor: 'pointer', position: 'relative', transition: 'background .2s', flexShrink: 0,
      }}
    >
      <div style={{
        width: 18, height: 18, borderRadius: '50%', background: '#fff',
        position: 'absolute', top: 3, left: on ? 23 : 3, transition: 'left .2s',
        boxShadow: '0 1px 4px rgba(0,0,0,0.18)',
      }} />
    </div>
  )
}

function RoleBadge({ role }) {
  const map = {
    Admin: { bg: '#dbeafe', color: '#1d4ed8' },
    Developer: { bg: '#e0e7ff', color: '#4338ca' },
    Designer: { bg: '#ffedd5', color: '#c2410c' },
    'QA Engineer': { bg: '#dcfce7', color: '#15803d' },
    'Product Manager': { bg: '#f3e8ff', color: '#7e22ce' },
  }
  const s = map[role] || { bg: '#f1f5f9', color: '#475569' }
  return (
    <span style={{
      padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700,
      background: s.bg, color: s.color,
    }}>{role}</span>
  )
}

function StatusBadge({ status }) {
  const s = status === 'Active'
    ? { bg: '#dcfce7', color: '#15803d' }
    : { bg: '#fef9c3', color: '#b45309' }
  return (
    <span style={{
      padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700,
      background: s.bg, color: s.color,
    }}>{status}</span>
  )
}

function Btn({ children, onClick, variant = 'primary', style: s = {} }) {
  const styles = {
    primary: { background: primary, color: '#fff', border: 'none' },
    outline: { background: '#fff', color: primary, border: `1.5px solid ${primary}` },
    ghost: { background: 'transparent', color: '#475569', border: '1.5px solid #e2e8f0' },
    danger: { background: '#fee2e2', color: '#dc2626', border: '1.5px solid #fca5a5' },
  }
  return (
    <button
      onClick={onClick}
      style={{
        padding: '7px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600,
        cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6,
        ...styles[variant], ...s,
      }}
    >{children}</button>
  )
}

function Input({ value, onChange, placeholder, style: s = {}, readOnly, type = 'text' }) {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      readOnly={readOnly}
      style={{
        width: '100%', padding: '8px 12px', borderRadius: 8, border: '1.5px solid #e2e8f0',
        fontSize: 13, outline: 'none', background: readOnly ? '#f8fafc' : '#fff',
        color: readOnly ? '#94a3b8' : '#1e293b', boxSizing: 'border-box',
        fontFamily: readOnly ? 'monospace' : 'inherit', ...s,
      }}
    />
  )
}

function Select({ value, onChange, children, style: s = {} }) {
  return (
    <select
      value={value}
      onChange={onChange}
      style={{
        padding: '8px 12px', borderRadius: 8, border: '1.5px solid #e2e8f0',
        fontSize: 13, background: '#fff', color: '#1e293b', outline: 'none',
        cursor: 'pointer', ...s,
      }}
    >{children}</select>
  )
}

// ─── Section: General ────────────────────────────────────────────────────────

function GeneralSection() {
  const [name, setName] = useState('TracKorbit Hub')
  const [desc, setDesc] = useState('Central workspace for all sprint and project management across teams.')
  const [dateFormat, setDateFormat] = useState('MM/DD/YYYY')
  const [timezone, setTimezone] = useState('US/Eastern')
  const [saved, setSaved] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div>
      <SectionHeader icon="🏢" title="General" subtitle="Manage your workspace identity and regional settings." />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Workspace Name */}
        <div style={{ ...card, padding: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#1e293b', marginBottom: 14 }}>Workspace Identity</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 5 }}>WORKSPACE NAME</label>
              <div style={{ display: 'flex', gap: 10 }}>
                <Input value={name} onChange={e => setName(e.target.value)} placeholder="Workspace name" style={{ maxWidth: 320 }} />
                <Btn onClick={handleSave} variant={saved ? 'outline' : 'primary'}>
                  {saved ? '✓ Saved' : 'Save'}
                </Btn>
              </div>
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 5 }}>DESCRIPTION</label>
              <textarea
                value={desc}
                onChange={e => setDesc(e.target.value)}
                rows={3}
                style={{
                  width: '100%', maxWidth: 480, padding: '8px 12px', borderRadius: 8,
                  border: '1.5px solid #e2e8f0', fontSize: 13, resize: 'vertical',
                  outline: 'none', color: '#1e293b', boxSizing: 'border-box', fontFamily: 'inherit',
                }}
              />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 5 }}>WORKSPACE URL</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
                <span style={{ padding: '8px 12px', background: '#f1f5f9', border: '1.5px solid #e2e8f0', borderRight: 'none', borderRadius: '8px 0 0 8px', fontSize: 13, color: '#94a3b8' }}>trackorbit.io/</span>
                <Input value="trackorbit-hub" readOnly style={{ borderRadius: '0 8px 8px 0', maxWidth: 200 }} />
              </div>
            </div>
          </div>
        </div>

        {/* Regional Settings */}
        <div style={{ ...card, padding: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#1e293b', marginBottom: 14 }}>Regional Settings</div>
          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 5 }}>DATE FORMAT</label>
              <Select value={dateFormat} onChange={e => setDateFormat(e.target.value)}>
                {['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD'].map(f => <option key={f}>{f}</option>)}
              </Select>
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 5 }}>TIMEZONE</label>
              <Select value={timezone} onChange={e => setTimezone(e.target.value)}>
                {['UTC', 'US/Eastern', 'US/Pacific', 'Europe/London', 'Asia/Kolkata', 'Asia/Tokyo'].map(tz => <option key={tz}>{tz}</option>)}
              </Select>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div style={{ ...card, padding: 20, border: '1.5px solid #fca5a5', background: '#fff5f5' }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#dc2626', marginBottom: 6 }}>⚠ Danger Zone</div>
          <div style={{ fontSize: 13, color: '#7f1d1d', marginBottom: 14 }}>
            Deleting your workspace is permanent and cannot be undone. All projects, sprints, tickets, and data will be erased.
          </div>
          {!showDeleteConfirm ? (
            <Btn variant="danger" onClick={() => setShowDeleteConfirm(true)}>Delete Workspace</Btn>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#dc2626' }}>Are you absolutely sure?</span>
              <Btn variant="danger" onClick={() => alert('Workspace deletion is disabled in demo.')}>Yes, Delete</Btn>
              <Btn variant="ghost" onClick={() => setShowDeleteConfirm(false)}>Cancel</Btn>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Section: Appearance ─────────────────────────────────────────────────────

function AppearanceSection() {
  const [theme, setTheme] = useState('light')
  const [accent, setAccent] = useState('#2563eb')
  const [fontSize, setFontSize] = useState('Medium')
  const [sidebar, setSidebar] = useState('Expanded')

  const accents = ['#2563eb', '#7c3aed', '#0891b2', '#059669', '#dc2626', '#d97706']

  return (
    <div>
      <SectionHeader icon="🎨" title="Appearance" subtitle="Customize the look and feel of your workspace." />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Theme */}
        <div style={card}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#1e293b', marginBottom: 14 }}>Theme</div>
          <div style={{ display: 'flex', gap: 14 }}>
            {[
              { id: 'light', label: 'Light', bg: '#f8fafc', bars: ['#e2e8f0', '#cbd5e1', '#94a3b8'] },
              { id: 'dark', label: 'Dark (coming soon)', bg: '#1e293b', bars: ['#334155', '#475569', '#64748b'], disabled: true },
              { id: 'system', label: 'System', bg: 'linear-gradient(135deg, #f8fafc 50%, #1e293b 50%)', bars: ['#94a3b8', '#64748b', '#475569'] },
            ].map(t => (
              <div
                key={t.id}
                onClick={() => !t.disabled && setTheme(t.id)}
                style={{
                  width: 130, borderRadius: 12, border: `2px solid ${theme === t.id ? primary : '#e2e8f0'}`,
                  cursor: t.disabled ? 'not-allowed' : 'pointer', overflow: 'hidden',
                  opacity: t.disabled ? 0.55 : 1, position: 'relative',
                  boxShadow: theme === t.id ? `0 0 0 3px ${primary}22` : 'none',
                }}
              >
                <div style={{ height: 70, background: t.bg, padding: 10, display: 'flex', flexDirection: 'column', gap: 5 }}>
                  {t.bars.map((c, i) => (
                    <div key={i} style={{ height: 8, borderRadius: 4, background: c, width: i === 2 ? '60%' : '100%' }} />
                  ))}
                </div>
                <div style={{ padding: '8px 10px', fontSize: 12, fontWeight: 600, color: '#475569', background: '#fff', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  {t.label}
                  {theme === t.id && <span style={{ color: primary, fontSize: 14 }}>✓</span>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Accent Color */}
        <div style={card}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#1e293b', marginBottom: 14 }}>Accent Color</div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            {accents.map(c => (
              <div
                key={c}
                onClick={() => setAccent(c)}
                style={{
                  width: 32, height: 32, borderRadius: '50%', background: c, cursor: 'pointer',
                  border: `3px solid ${accent === c ? '#1e293b' : 'transparent'}`,
                  boxShadow: `0 2px 8px ${c}55`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                {accent === c && <span style={{ color: '#fff', fontSize: 14, fontWeight: 800 }}>✓</span>}
              </div>
            ))}
          </div>
        </div>

        {/* Font Size */}
        <div style={card}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#1e293b', marginBottom: 14 }}>Font Size</div>
          <div style={{ display: 'flex', gap: 0, borderRadius: 8, overflow: 'hidden', border: '1.5px solid #e2e8f0', width: 'fit-content' }}>
            {['Small', 'Medium', 'Large'].map((s, i) => (
              <div
                key={s}
                onClick={() => setFontSize(s)}
                style={{
                  padding: '8px 20px', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                  background: fontSize === s ? primary : '#fff',
                  color: fontSize === s ? '#fff' : '#475569',
                  borderRight: i < 2 ? '1.5px solid #e2e8f0' : 'none',
                }}
              >{s}</div>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div style={card}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#1e293b', marginBottom: 14 }}>Sidebar Style</div>
          <div style={{ display: 'flex', gap: 0, borderRadius: 8, overflow: 'hidden', border: '1.5px solid #e2e8f0', width: 'fit-content' }}>
            {['Expanded', 'Compact'].map((s, i) => (
              <div
                key={s}
                onClick={() => setSidebar(s)}
                style={{
                  padding: '8px 20px', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                  background: sidebar === s ? primary : '#fff',
                  color: sidebar === s ? '#fff' : '#475569',
                  borderRight: i < 1 ? '1.5px solid #e2e8f0' : 'none',
                }}
              >{s}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Section: Notifications ───────────────────────────────────────────────────

function NotificationsSection() {
  const [prefs, setPrefs] = useState({
    emailMentions: true,
    emailAssignments: true,
    desktop: false,
    weeklyDigest: true,
    sprintReminders: true,
  })

  const items = [
    { key: 'emailMentions', label: 'Email notifications for mentions', desc: 'Get emailed when someone @mentions you in a ticket or comment.' },
    { key: 'emailAssignments', label: 'Email for ticket assignments', desc: 'Receive an email when a ticket is assigned to you.' },
    { key: 'desktop', label: 'Desktop notifications', desc: 'Show browser notifications for real-time activity.' },
    { key: 'weeklyDigest', label: 'Weekly digest email', desc: 'Get a weekly summary of activity across your projects every Monday.' },
    { key: 'sprintReminders', label: 'Sprint reminders', desc: 'Notifications when sprints are starting, ending, or past due.' },
  ]

  return (
    <div>
      <SectionHeader icon="🔔" title="Notifications" subtitle="Control how and when you receive updates." />
      <div style={card}>
        {items.map((item, i) => (
          <div
            key={item.key}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '16px 0', borderBottom: i < items.length - 1 ? '1px solid #f1f5f9' : 'none',
            }}
          >
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#1e293b', marginBottom: 2 }}>{item.label}</div>
              <div style={{ fontSize: 12, color: '#94a3b8' }}>{item.desc}</div>
            </div>
            <Toggle on={prefs[item.key]} onChange={val => setPrefs(p => ({ ...p, [item.key]: val }))} />
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Section: User Management ─────────────────────────────────────────────────

const SAMPLE_USERS = [
  { id: 1, name: 'Harsha', initials: 'H', avatarBg: '#2563eb', email: 'harsha@trackkub.io', role: 'Admin', status: 'Active' },
  { id: 2, name: 'Tom Wilson', initials: 'TW', avatarBg: '#0891b2', email: 'tom@company.com', role: 'Developer', status: 'Active' },
  { id: 3, name: 'Sara Lee', initials: 'SL', avatarBg: '#d97706', email: 'sara@company.com', role: 'Designer', status: 'Active' },
  { id: 4, name: 'Mike Chen', initials: 'MC', avatarBg: '#dc2626', email: 'mike@company.com', role: 'QA Engineer', status: 'Active' },
  { id: 5, name: 'Priya Patel', initials: 'PP', avatarBg: '#7c3aed', email: 'priya@company.com', role: 'Product Manager', status: 'Invited' },
]

function UserAvatar({ initials, bg, size = 34 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', background: bg,
      color: '#fff', fontWeight: 700, fontSize: size * 0.38,
      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
    }}>{initials}</div>
  )
}

function UserManagementSection() {
  const [members, setMembers] = useState(SAMPLE_USERS)
  const [search, setSearch] = useState('')
  const [showInvite, setShowInvite] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState('Developer')

  const filtered = members.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  )

  const handleRemove = (id) => {
    if (window.confirm('Remove this member?')) setMembers(m => m.filter(u => u.id !== id))
  }

  const handleInvite = () => {
    if (!inviteEmail) return
    setMembers(m => [...m, {
      id: Date.now(), name: inviteEmail.split('@')[0], initials: inviteEmail[0].toUpperCase(),
      avatarBg: '#64748b', email: inviteEmail, role: inviteRole, status: 'Invited',
    }])
    setInviteEmail('')
    setShowInvite(false)
  }

  return (
    <div>
      <SectionHeader icon="👤" title="User Management" subtitle="Invite and manage workspace members." />

      {/* Search + Invite */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
        <Input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search members..."
          style={{ maxWidth: 280 }}
        />
        <Btn onClick={() => setShowInvite(v => !v)}>+ Invite Member</Btn>
      </div>

      {/* Invite Form */}
      {showInvite && (
        <div style={{ ...card, marginBottom: 16, background: primaryLight, border: `1.5px solid ${primary}33`, padding: 16, display: 'flex', gap: 10, alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>EMAIL</label>
            <Input value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} placeholder="colleague@company.com" style={{ width: 240 }} />
          </div>
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>ROLE</label>
            <Select value={inviteRole} onChange={e => setInviteRole(e.target.value)}>
              {['Developer', 'Designer', 'QA Engineer', 'Product Manager', 'Admin'].map(r => <option key={r}>{r}</option>)}
            </Select>
          </div>
          <Btn onClick={handleInvite}>Send Invite</Btn>
          <Btn variant="ghost" onClick={() => setShowInvite(false)}>Cancel</Btn>
        </div>
      )}

      {/* Members Table */}
      <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f8fafc' }}>
              {['Member', 'Email', 'Role', 'Status', 'Actions'].map(h => (
                <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '.5px' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((u, i) => (
              <tr key={u.id} style={{ borderTop: i > 0 ? '1px solid #f1f5f9' : 'none' }}>
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <UserAvatar initials={u.initials} bg={u.avatarBg} />
                    <span style={{ fontWeight: 600, fontSize: 14, color: '#1e293b' }}>{u.name}</span>
                  </div>
                </td>
                <td style={{ padding: '12px 16px', fontSize: 13, color: '#64748b' }}>{u.email}</td>
                <td style={{ padding: '12px 16px' }}><RoleBadge role={u.role} /></td>
                <td style={{ padding: '12px 16px' }}><StatusBadge status={u.status} /></td>
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button style={{ background: 'none', border: '1px solid #e2e8f0', borderRadius: 6, padding: '4px 8px', cursor: 'pointer', fontSize: 12 }}>✏ Edit</button>
                    <button onClick={() => handleRemove(u.id)} style={{ background: 'none', border: '1px solid #fca5a5', borderRadius: 6, padding: '4px 8px', cursor: 'pointer', fontSize: 12, color: '#dc2626' }}>✕ Remove</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ─── Section: Teams ───────────────────────────────────────────────────────────

const SAMPLE_TEAMS = [
  {
    id: 1, name: 'Frontend Team', icon: '🎨', color: '#2563eb', desc: 'Builds the product UI and design system.',
    members: [
      { initials: 'H', bg: '#2563eb' }, { initials: 'SL', bg: '#d97706' }, { initials: 'TW', bg: '#0891b2' },
    ],
  },
  {
    id: 2, name: 'Backend Team', icon: '⚙️', color: '#059669', desc: 'Manages APIs, databases, and infrastructure.',
    members: [
      { initials: 'MC', bg: '#dc2626' }, { initials: 'TW', bg: '#0891b2' }, { initials: 'PP', bg: '#7c3aed' }, { initials: 'H', bg: '#2563eb' },
    ],
  },
  {
    id: 3, name: 'Design Team', icon: '✏️', color: '#7c3aed', desc: 'Owns brand, UX research, and visual design.',
    members: [
      { initials: 'SL', bg: '#d97706' }, { initials: 'PP', bg: '#7c3aed' },
    ],
  },
]

function TeamsSection() {
  const [teams, setTeams] = useState(SAMPLE_TEAMS)
  const [showCreate, setShowCreate] = useState(false)
  const [newTeam, setNewTeam] = useState({ name: '', desc: '', color: '#2563eb' })

  const handleCreate = () => {
    if (!newTeam.name) return
    setTeams(t => [...t, { id: Date.now(), name: newTeam.name, icon: '👥', color: newTeam.color, desc: newTeam.desc, members: [] }])
    setNewTeam({ name: '', desc: '', color: '#2563eb' })
    setShowCreate(false)
  }

  return (
    <div>
      <SectionHeader icon="👥" title="Teams" subtitle="Organize members into focused functional teams." />

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
        <Btn onClick={() => setShowCreate(v => !v)}>+ Create Team</Btn>
      </div>

      {showCreate && (
        <div style={{ ...card, marginBottom: 20, background: primaryLight, border: `1.5px solid ${primary}33`, padding: 18, display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 160 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>TEAM NAME</label>
            <Input value={newTeam.name} onChange={e => setNewTeam(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Mobile Team" />
          </div>
          <div style={{ flex: 2, minWidth: 200 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>DESCRIPTION</label>
            <Input value={newTeam.desc} onChange={e => setNewTeam(p => ({ ...p, desc: e.target.value }))} placeholder="What does this team do?" />
          </div>
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>COLOR</label>
            <div style={{ display: 'flex', gap: 6 }}>
              {['#2563eb', '#059669', '#7c3aed', '#dc2626', '#d97706'].map(c => (
                <div key={c} onClick={() => setNewTeam(p => ({ ...p, color: c }))} style={{ width: 24, height: 24, borderRadius: '50%', background: c, cursor: 'pointer', border: `2px solid ${newTeam.color === c ? '#1e293b' : 'transparent'}` }} />
              ))}
            </div>
          </div>
          <Btn onClick={handleCreate}>Create</Btn>
          <Btn variant="ghost" onClick={() => setShowCreate(false)}>Cancel</Btn>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
        {teams.map(t => (
          <div key={t.id} style={{ ...card, padding: 20, borderTop: `4px solid ${t.color}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
              <div style={{ width: 42, height: 42, borderRadius: 10, background: t.color + '22', fontSize: 22, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {t.icon}
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15, color: '#1e293b' }}>{t.name}</div>
                <div style={{ fontSize: 12, color: '#94a3b8' }}>{t.members.length} member{t.members.length !== 1 ? 's' : ''}</div>
              </div>
            </div>
            {t.desc && <div style={{ fontSize: 12, color: '#64748b', marginBottom: 12 }}>{t.desc}</div>}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex' }}>
                {t.members.slice(0, 5).map((m, i) => (
                  <div key={i} style={{ marginLeft: i > 0 ? -8 : 0, zIndex: 5 - i, position: 'relative', border: '2px solid #fff', borderRadius: '50%' }}>
                    <UserAvatar initials={m.initials} bg={m.bg} size={28} />
                  </div>
                ))}
                {t.members.length > 5 && <div style={{ marginLeft: -8, width: 28, height: 28, borderRadius: '50%', background: '#e2e8f0', fontSize: 10, fontWeight: 700, color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #fff' }}>+{t.members.length - 5}</div>}
              </div>
              <span style={{ fontSize: 12, fontWeight: 600, color: primary, cursor: 'pointer' }}>Manage →</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Section: Groups ──────────────────────────────────────────────────────────

const SAMPLE_GROUPS = [
  { id: 1, name: 'Engineering', members: 5, permission: 'Edit', permColor: { bg: '#dcfce7', color: '#15803d' }, desc: 'Can create and edit tickets' },
  { id: 2, name: 'Product', members: 3, permission: 'View Only', permColor: { bg: '#f1f5f9', color: '#475569' }, desc: 'Can view and comment' },
  { id: 3, name: 'Admins', members: 2, permission: 'Full Access', permColor: { bg: '#dbeafe', color: '#1d4ed8' }, desc: 'Full workspace access' },
]

function GroupsSection() {
  const [groups, setGroups] = useState(SAMPLE_GROUPS)

  const handleDelete = (id) => {
    if (window.confirm('Delete this group?')) setGroups(g => g.filter(x => x.id !== id))
  }

  return (
    <div>
      <SectionHeader icon="🗂️" title="Groups" subtitle="Organize members into permission groups for access control." />

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
        <Btn>+ Create Group</Btn>
      </div>

      <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f8fafc' }}>
              {['Group', 'Members', 'Permissions', 'Actions'].map(h => (
                <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '.5px' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {groups.map((g, i) => (
              <tr key={g.id} style={{ borderTop: i > 0 ? '1px solid #f1f5f9' : 'none' }}>
                <td style={{ padding: '14px 16px' }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: '#1e293b' }}>{g.name}</div>
                  <div style={{ fontSize: 12, color: '#94a3b8' }}>{g.desc}</div>
                </td>
                <td style={{ padding: '14px 16px', fontSize: 13, color: '#64748b' }}>
                  <span style={{ fontWeight: 600 }}>{g.members}</span> members
                </td>
                <td style={{ padding: '14px 16px' }}>
                  <span style={{ padding: '3px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700, background: g.permColor.bg, color: g.permColor.color }}>
                    {g.permission}
                  </span>
                </td>
                <td style={{ padding: '14px 16px' }}>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button style={{ background: 'none', border: '1px solid #e2e8f0', borderRadius: 6, padding: '4px 10px', cursor: 'pointer', fontSize: 12 }}>✏ Edit</button>
                    <button onClick={() => handleDelete(g.id)} style={{ background: 'none', border: '1px solid #fca5a5', borderRadius: 6, padding: '4px 10px', cursor: 'pointer', fontSize: 12, color: '#dc2626' }}>🗑 Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ─── Section: Security ────────────────────────────────────────────────────────

const AUDIT_LOGS = [
  { id: 1, action: 'Harsha logged in', time: 'Today, 9:14 AM', icon: '🔑' },
  { id: 2, action: 'Tom Wilson created ticket PRJ-45', time: 'Today, 8:52 AM', icon: '🎫' },
  { id: 3, action: 'Sara Lee updated sprint "Sprint 3"', time: 'Yesterday, 5:30 PM', icon: '✏️' },
  { id: 4, action: 'Priya Patel invited to workspace', time: 'Jun 2, 2:10 PM', icon: '✉️' },
  { id: 5, action: 'Mike Chen deleted ticket PRJ-38', time: 'Jun 1, 11:45 AM', icon: '🗑️' },
]

function SecuritySection() {
  const [twoFactor, setTwoFactor] = useState(false)
  const [sessionTimeout, setSessionTimeout] = useState('8 hours')

  return (
    <div>
      <SectionHeader icon="🔐" title="Security & Permissions" subtitle="Manage authentication, session, and access policies." />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Auth Settings */}
        <div style={card}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#1e293b', marginBottom: 16 }}>Authentication</div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #f1f5f9' }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#1e293b' }}>Two-Factor Authentication</div>
              <div style={{ fontSize: 12, color: '#94a3b8' }}>Require 2FA for all workspace members.</div>
            </div>
            <Toggle on={twoFactor} onChange={setTwoFactor} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0' }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#1e293b' }}>Session Timeout</div>
              <div style={{ fontSize: 12, color: '#94a3b8' }}>Automatically log out inactive sessions.</div>
            </div>
            <Select value={sessionTimeout} onChange={e => setSessionTimeout(e.target.value)}>
              {['1 hour', '8 hours', '24 hours', 'Never'].map(t => <option key={t}>{t}</option>)}
            </Select>
          </div>
        </div>

        {/* IP Allowlist */}
        <div style={{ ...card, position: 'relative', opacity: 0.75 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#1e293b' }}>IP Allowlist</div>
            <span style={{ padding: '2px 9px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: '#fef9c3', color: '#b45309' }}>Enterprise Plan</span>
          </div>
          <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 10 }}>Restrict workspace access to specific IP addresses or ranges.</div>
          <textarea
            disabled
            placeholder="e.g. 192.168.1.0/24, 10.0.0.1"
            rows={3}
            style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1.5px solid #e2e8f0', fontSize: 12, color: '#94a3b8', background: '#f8fafc', resize: 'none', boxSizing: 'border-box', cursor: 'not-allowed' }}
          />
        </div>

        {/* Active Sessions */}
        <div style={card}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#1e293b', marginBottom: 14 }}>Active Sessions</div>
          {[
            { device: 'Chrome on Windows 11', location: 'New York, US', current: true, time: 'Now' },
            { device: 'Safari on iPhone 15', location: 'New York, US', current: false, time: '2 hours ago' },
          ].map((s, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: i < 1 ? '1px solid #f1f5f9' : 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ fontSize: 24 }}>{s.device.includes('Chrome') ? '💻' : '📱'}</div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13, color: '#1e293b' }}>{s.device} {s.current && <span style={{ marginLeft: 6, padding: '1px 7px', borderRadius: 20, fontSize: 10, fontWeight: 700, background: '#dcfce7', color: '#15803d' }}>Current</span>}</div>
                  <div style={{ fontSize: 12, color: '#94a3b8' }}>{s.location} · {s.time}</div>
                </div>
              </div>
              {!s.current && <button style={{ background: 'none', border: '1px solid #fca5a5', borderRadius: 6, padding: '4px 10px', cursor: 'pointer', fontSize: 12, color: '#dc2626' }}>Revoke</button>}
            </div>
          ))}
        </div>

        {/* Audit Log */}
        <div style={card}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#1e293b', marginBottom: 14 }}>Audit Log</div>
          {AUDIT_LOGS.map((log, i) => (
            <div key={log.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: i < AUDIT_LOGS.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
              <span style={{ fontSize: 18 }}>{log.icon}</span>
              <span style={{ fontSize: 13, color: '#1e293b', flex: 1 }}>{log.action}</span>
              <span style={{ fontSize: 12, color: '#94a3b8', flexShrink: 0 }}>{log.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Section: Workflows ───────────────────────────────────────────────────────

function WorkflowsSection() {
  const { projects = [] } = useApp()

  const fallback = [
    { id: 'p1', name: 'TracKorbit Web', color: '#2563eb' },
    { id: 'p2', name: 'Mobile App', color: '#059669' },
    { id: 'p3', name: 'Design System', color: '#7c3aed' },
  ]

  const list = projects.length > 0 ? projects : fallback

  return (
    <div>
      <SectionHeader icon="🔄" title="Workflows" subtitle="Configure ticket statuses and transitions per project." />
      <div style={{ ...card, marginBottom: 20, background: '#fffbeb', border: '1.5px solid #fde68a' }}>
        <div style={{ fontSize: 13, color: '#92400e' }}>
          💡 <strong>Workflows are configured per project.</strong> Select a project below to edit its workflow stages and transitions.
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {list.map(p => (
          <div key={p.id} style={{ ...card, padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: p.color, flexShrink: 0 }} />
              <span style={{ fontWeight: 600, fontSize: 14, color: '#1e293b' }}>{p.name}</span>
            </div>
            <button style={{ background: 'none', border: `1.5px solid ${primary}`, color: primary, borderRadius: 8, padding: '6px 14px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
              Configure →
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Section: Custom Fields ───────────────────────────────────────────────────

const DEFAULT_FIELDS = [
  { id: 1, name: 'Story Points', type: 'Number', required: false, projects: 'All projects' },
  { id: 2, name: 'Sprint', type: 'Sprint Selector', required: false, projects: 'All projects' },
  { id: 3, name: 'Assignee', type: 'User', required: false, projects: 'All projects' },
  { id: 4, name: 'Due Date', type: 'Date', required: false, projects: 'All projects' },
  { id: 5, name: 'Labels', type: 'Tags', required: false, projects: 'All projects' },
]

function CustomFieldsSection() {
  const [fields, setFields] = useState(DEFAULT_FIELDS)
  const [showAdd, setShowAdd] = useState(false)
  const [newField, setNewField] = useState({ name: '', type: 'Text', required: false })

  const handleAdd = () => {
    if (!newField.name) return
    setFields(f => [...f, { id: Date.now(), ...newField, projects: 'All projects' }])
    setNewField({ name: '', type: 'Text', required: false })
    setShowAdd(false)
  }

  const handleDelete = (id) => setFields(f => f.filter(x => x.id !== id))

  return (
    <div>
      <SectionHeader icon="📋" title="Custom Fields" subtitle="Add extra data fields to tickets across projects." />

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
        <Btn onClick={() => setShowAdd(v => !v)}>+ Add Field</Btn>
      </div>

      {showAdd && (
        <div style={{ ...card, marginBottom: 16, background: primaryLight, border: `1.5px solid ${primary}33`, padding: 16, display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>FIELD NAME</label>
            <Input value={newField.name} onChange={e => setNewField(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Priority Score" style={{ width: 200 }} />
          </div>
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>TYPE</label>
            <Select value={newField.type} onChange={e => setNewField(p => ({ ...p, type: e.target.value }))}>
              {['Text', 'Number', 'Date', 'User', 'Tags', 'Select', 'Checkbox'].map(t => <option key={t}>{t}</option>)}
            </Select>
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#475569', cursor: 'pointer' }}>
            <input type="checkbox" checked={newField.required} onChange={e => setNewField(p => ({ ...p, required: e.target.checked }))} />
            Required
          </label>
          <Btn onClick={handleAdd}>Add Field</Btn>
          <Btn variant="ghost" onClick={() => setShowAdd(false)}>Cancel</Btn>
        </div>
      )}

      <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f8fafc' }}>
              {['Field Name', 'Type', 'Required', 'Projects', 'Actions'].map(h => (
                <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '.5px' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {fields.map((f, i) => (
              <tr key={f.id} style={{ borderTop: i > 0 ? '1px solid #f1f5f9' : 'none' }}>
                <td style={{ padding: '12px 16px', fontWeight: 600, fontSize: 13, color: '#1e293b' }}>{f.name}</td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{ padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: '#dbeafe', color: '#1d4ed8' }}>{f.type}</span>
                </td>
                <td style={{ padding: '12px 16px' }}>
                  {f.required
                    ? <span style={{ padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: '#fee2e2', color: '#dc2626' }}>Yes</span>
                    : <span style={{ padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: '#f1f5f9', color: '#64748b' }}>No</span>}
                </td>
                <td style={{ padding: '12px 16px', fontSize: 13, color: '#64748b' }}>{f.projects}</td>
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button style={{ background: 'none', border: '1px solid #e2e8f0', borderRadius: 6, padding: '4px 8px', cursor: 'pointer', fontSize: 12 }}>✏</button>
                    <button onClick={() => handleDelete(f.id)} style={{ background: 'none', border: '1px solid #fca5a5', borderRadius: 6, padding: '4px 8px', cursor: 'pointer', fontSize: 12, color: '#dc2626' }}>🗑</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ─── Section: Labels & Tags ───────────────────────────────────────────────────

const DEFAULT_LABELS = [
  { id: 1, name: 'frontend', color: '#2563eb', count: 12 },
  { id: 2, name: 'backend', color: '#059669', count: 9 },
  { id: 3, name: 'bug', color: '#dc2626', count: 5 },
  { id: 4, name: 'design', color: '#7c3aed', count: 7 },
  { id: 5, name: 'urgent', color: '#ef4444', count: 3 },
  { id: 6, name: 'documentation', color: '#64748b', count: 4 },
  { id: 7, name: 'testing', color: '#d97706', count: 6 },
  { id: 8, name: 'feature', color: '#4338ca', count: 11 },
]

function LabelsSection() {
  const [labels, setLabels] = useState(DEFAULT_LABELS)
  const [newLabel, setNewLabel] = useState('')
  const [newColor, setNewColor] = useState('#2563eb')

  const handleAdd = () => {
    if (!newLabel.trim()) return
    setLabels(l => [...l, { id: Date.now(), name: newLabel.trim(), color: newColor, count: 0 }])
    setNewLabel('')
  }

  const handleDelete = (id) => setLabels(l => l.filter(x => x.id !== id))

  return (
    <div>
      <SectionHeader icon="🏷️" title="Labels & Tags" subtitle="Create color-coded labels to categorize tickets." />

      <div style={card}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 24 }}>
          {labels.map(l => (
            <div
              key={l.id}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 7,
                padding: '6px 12px', borderRadius: 20,
                background: l.color + '18', border: `1.5px solid ${l.color}44`,
              }}
            >
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: l.color, flexShrink: 0 }} />
              <span style={{ fontSize: 13, fontWeight: 600, color: l.color }}>{l.name}</span>
              <span style={{ fontSize: 11, background: l.color + '30', color: l.color, borderRadius: 10, padding: '0 5px' }}>{l.count}</span>
              <span
                onClick={() => handleDelete(l.id)}
                style={{ fontSize: 14, cursor: 'pointer', color: l.color, opacity: 0.7, lineHeight: 1, marginLeft: 2 }}
              >×</span>
            </div>
          ))}
        </div>

        <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 18 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#475569', marginBottom: 12 }}>Add Label</div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <Input
              value={newLabel}
              onChange={e => setNewLabel(e.target.value)}
              placeholder="Label name..."
              style={{ width: 200 }}
            />
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              {['#2563eb', '#059669', '#dc2626', '#7c3aed', '#d97706', '#4338ca', '#64748b', '#0891b2'].map(c => (
                <div
                  key={c}
                  onClick={() => setNewColor(c)}
                  style={{
                    width: 22, height: 22, borderRadius: '50%', background: c, cursor: 'pointer',
                    border: `2px solid ${newColor === c ? '#1e293b' : 'transparent'}`,
                    boxShadow: `0 1px 4px ${c}55`,
                  }}
                />
              ))}
            </div>
            <Btn onClick={handleAdd}>Add Label</Btn>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Nav Config ───────────────────────────────────────────────────────────────

const NAV_GROUPS = [
  {
    label: 'WORKSPACE',
    items: [
      { key: 'general', icon: '🏢', label: 'General' },
      { key: 'appearance', icon: '🎨', label: 'Appearance' },
      { key: 'notifications', icon: '🔔', label: 'Notifications' },
    ],
  },
  {
    label: 'PEOPLE',
    items: [
      { key: 'users', icon: '👤', label: 'User Management' },
      { key: 'teams', icon: '👥', label: 'Teams' },
      { key: 'groups', icon: '🗂️', label: 'Groups' },
    ],
  },
  {
    label: 'SECURITY',
    items: [
      { key: 'security', icon: '🔐', label: 'Security & Permissions' },
    ],
  },
  {
    label: 'DATA',
    items: [
      { key: 'workflows', icon: '🔄', label: 'Workflows' },
      { key: 'fields', icon: '📋', label: 'Custom Fields' },
      { key: 'labels', icon: '🏷️', label: 'Labels & Tags' },
    ],
  },
]

const SECTIONS = {
  general: GeneralSection,
  appearance: AppearanceSection,
  notifications: NotificationsSection,
  users: UserManagementSection,
  teams: TeamsSection,
  groups: GroupsSection,
  security: SecuritySection,
  workflows: WorkflowsSection,
  fields: CustomFieldsSection,
  labels: LabelsSection,
}

// ─── Root ─────────────────────────────────────────────────────────────────────

export default function Settings() {
  const [active, setActive] = useState('general')
  const Section = SECTIONS[active] || GeneralSection
  const allItems = NAV_GROUPS.flatMap(g => g.items)

  return (
    <div style={{ minHeight: 'calc(100vh - 56px)', background: '#eef2ff', boxSizing: 'border-box' }}>

      {/* Hero bar */}
      <div style={{
        background: 'linear-gradient(135deg, #1e40af 0%, #4f46e5 60%, #7c3aed 100%)',
        padding: '28px 32px 0',
      }}>
        <div style={{ fontSize: 22, fontWeight: 900, color: '#fff', letterSpacing: '-0.5px', marginBottom: 4 }}>
          ⚙ Settings
        </div>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', marginBottom: 20 }}>
          Manage your workspace, team, security and data preferences
        </div>

        {/* Top tab bar */}
        <div style={{ display: 'flex', gap: 2, overflowX: 'auto', paddingBottom: 0 }}>
          {NAV_GROUPS.map((group, gi) => (
            <React.Fragment key={group.label}>
              {gi > 0 && (
                <div style={{ width: 1, background: 'rgba(255,255,255,0.2)', margin: '6px 8px', flexShrink: 0 }} />
              )}
              {group.items.map(item => {
                const isActive = active === item.key
                return (
                  <button
                    key={item.key}
                    onClick={() => setActive(item.key)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 6,
                      padding: '9px 16px', cursor: 'pointer',
                      fontSize: 13, fontWeight: isActive ? 700 : 500,
                      color: isActive ? '#fff' : 'rgba(255,255,255,0.65)',
                      background: isActive ? 'rgba(255,255,255,0.18)' : 'transparent',
                      border: 'none',
                      borderBottom: isActive ? '3px solid #fff' : '3px solid transparent',
                      borderRadius: '8px 8px 0 0',
                      transition: 'all .15s', whiteSpace: 'nowrap', flexShrink: 0,
                      fontFamily: 'inherit',
                    }}
                  >
                    <span style={{ fontSize: 15 }}>{item.icon}</span>
                    {item.label}
                  </button>
                )
              })}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div style={{ padding: '24px 32px' }}>
        <div style={{
          background: '#fff', borderRadius: 14,
          boxShadow: '0 4px 24px rgba(59,130,246,0.10)',
          padding: 28, minHeight: 'calc(100vh - 240px)', boxSizing: 'border-box',
        }}>
          <Section />
        </div>
      </div>
    </div>
  )
}
