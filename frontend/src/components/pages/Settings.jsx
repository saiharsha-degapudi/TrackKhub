import { useState } from 'react'
import { useApp } from '../../context/AppContext'

// ── Helper components ─────────────────────────────────────────────────────────

const Toggle = ({ value, onChange }) => (
  <div onClick={() => onChange(!value)} style={{
    width: 36, height: 20, borderRadius: 10, cursor: 'pointer',
    background: value ? '#2563eb' : '#d1d5db', position: 'relative', transition: 'background .2s',
    flexShrink: 0,
  }}>
    <div style={{
      width: 16, height: 16, borderRadius: '50%', background: '#fff',
      position: 'absolute', top: 2, left: value ? 18 : 2, transition: 'left .2s',
      boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
    }} />
  </div>
)

const SectionTitle = ({ children, action }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, paddingBottom: 10, borderBottom: '1px solid #e5e7eb' }}>
    <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: '#111827' }}>{children}</h3>
    {action}
  </div>
)

const FormRow = ({ label, children, hint }) => (
  <div style={{ marginBottom: 16 }}>
    <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#374151', marginBottom: 5 }}>{label}</label>
    {children}
    {hint && <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 3 }}>{hint}</div>}
  </div>
)

const inputStyle = {
  width: '100%', padding: '7px 10px', fontSize: 13, border: '1px solid #d1d5db',
  borderRadius: 6, outline: 'none', boxSizing: 'border-box', color: '#111827', background: '#fff',
}

const btnStyle = (variant = 'primary') => ({
  padding: '7px 16px', fontSize: 13, fontWeight: 500, borderRadius: 6, cursor: 'pointer', border: 'none',
  background: variant === 'primary' ? '#2563eb' : variant === 'danger' ? '#dc2626' : variant === 'ghost' ? 'transparent' : '#f3f4f6',
  color: variant === 'primary' || variant === 'danger' ? '#fff' : '#374151',
  ...(variant === 'ghost' ? { border: '1px solid #d1d5db' } : {}),
})

const AvatarInline = ({ name, size = 28 }) => {
  const initials = name ? name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() : '?'
  const colors = ['#2563eb', '#7c3aed', '#16a34a', '#ec4899', '#f59e0b', '#0891b2', '#10b981', '#dc2626']
  const color = colors[(name || '').charCodeAt(0) % colors.length]
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', background: color,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.38, fontWeight: 600, color: '#fff', flexShrink: 0,
    }}>{initials}</div>
  )
}

// ── Tab content components ────────────────────────────────────────────────────

function GeneralTab({ settings, doUpdateSettings }) {
  const [form, setForm] = useState({
    name: settings?.name || 'TracKorbit Workspace',
    description: settings?.description || 'B2B Commerce Platform',
    url: settings?.url || 'trackorbit',
    timezone: settings?.timezone || 'UTC',
  })
  const [saved, setSaved] = useState(false)

  const save = () => {
    doUpdateSettings(form)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div style={{ maxWidth: 560 }}>
      <SectionTitle>Workspace Settings</SectionTitle>
      <FormRow label="Workspace Name">
        <input style={inputStyle} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
      </FormRow>
      <FormRow label="Description">
        <textarea
          style={{ ...inputStyle, height: 72, resize: 'vertical' }}
          value={form.description}
          onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
        />
      </FormRow>
      <FormRow label="URL Slug" hint="Your workspace URL on TracKorbit">
        <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #d1d5db', borderRadius: 6, overflow: 'hidden' }}>
          <span style={{ padding: '7px 10px', background: '#f9fafb', color: '#6b7280', fontSize: 13, borderRight: '1px solid #d1d5db', whiteSpace: 'nowrap' }}>
            trackorbit.io/
          </span>
          <input
            style={{ ...inputStyle, border: 'none', borderRadius: 0 }}
            value={form.url}
            onChange={e => setForm(f => ({ ...f, url: e.target.value }))}
          />
        </div>
      </FormRow>
      <FormRow label="Timezone">
        <select style={inputStyle} value={form.timezone} onChange={e => setForm(f => ({ ...f, timezone: e.target.value }))}>
          {['UTC', 'US/Eastern', 'US/Central', 'US/Mountain', 'US/Pacific', 'Europe/London', 'Europe/Berlin', 'Asia/Kolkata', 'Asia/Tokyo', 'Australia/Sydney'].map(tz => (
            <option key={tz} value={tz}>{tz}</option>
          ))}
        </select>
      </FormRow>
      <button style={btnStyle('primary')} onClick={save}>
        {saved ? 'Saved!' : 'Save Changes'}
      </button>

      <div style={{ marginTop: 40, border: '1px solid #fca5a5', borderRadius: 8, padding: 20 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: '#dc2626', marginBottom: 6 }}>Danger Zone</div>
        <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 14 }}>
          Permanently delete this workspace and all its data. This action cannot be undone.
        </div>
        <button style={btnStyle('danger')}>Delete Workspace</button>
      </div>
    </div>
  )
}

function UsersTab({ users, doToggleUser, doDeleteUser, doCreateUser }) {
  const [search, setSearch] = useState('')
  const [showInvite, setShowInvite] = useState(false)
  const [invite, setInvite] = useState({ email: '', role: 'Developer' })

  const filtered = (users || []).filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  )

  const handleInvite = () => {
    if (!invite.email) return
    doCreateUser({ name: invite.email.split('@')[0], email: invite.email, role: invite.role, active: true })
    setInvite({ email: '', role: 'Developer' })
    setShowInvite(false)
  }

  return (
    <div>
      <SectionTitle action={
        <button style={btnStyle('primary')} onClick={() => setShowInvite(!showInvite)}>
          + Invite User
        </button>
      }>
        Team Members ({(users || []).length})
      </SectionTitle>

      {showInvite && (
        <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 8, padding: 16, marginBottom: 16, display: 'flex', gap: 10, alignItems: 'flex-end' }}>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: 12, fontWeight: 500, color: '#374151', display: 'block', marginBottom: 4 }}>Email Address</label>
            <input style={inputStyle} placeholder="name@company.com" value={invite.email} onChange={e => setInvite(i => ({ ...i, email: e.target.value }))} />
          </div>
          <div style={{ width: 140 }}>
            <label style={{ fontSize: 12, fontWeight: 500, color: '#374151', display: 'block', marginBottom: 4 }}>Role</label>
            <select style={inputStyle} value={invite.role} onChange={e => setInvite(i => ({ ...i, role: e.target.value }))}>
              {['Admin', 'Manager', 'Developer', 'Viewer'].map(r => <option key={r}>{r}</option>)}
            </select>
          </div>
          <button style={btnStyle('primary')} onClick={handleInvite}>Send Invite</button>
          <button style={btnStyle('ghost')} onClick={() => setShowInvite(false)}>Cancel</button>
        </div>
      )}

      <input style={{ ...inputStyle, marginBottom: 14 }} placeholder="Search members..." value={search} onChange={e => setSearch(e.target.value)} />

      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead>
          <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
            {['Member', 'Email', 'Role', 'Status', 'Actions'].map(h => (
              <th key={h} style={{ padding: '8px 10px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filtered.map(u => (
            <tr key={u.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
              <td style={{ padding: '10px 10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <AvatarInline name={u.name} size={28} />
                  <span style={{ fontWeight: 500, color: '#111827' }}>{u.name}</span>
                </div>
              </td>
              <td style={{ padding: '10px 10px', color: '#6b7280' }}>{u.email}</td>
              <td style={{ padding: '10px 10px' }}>
                <span style={{ fontSize: 12, padding: '2px 8px', borderRadius: 4, background: '#eff6ff', color: '#2563eb', fontWeight: 500 }}>{u.role}</span>
              </td>
              <td style={{ padding: '10px 10px' }}>
                <span style={{
                  fontSize: 12, padding: '2px 8px', borderRadius: 4, fontWeight: 500,
                  background: u.active ? '#f0fdf4' : '#f9fafb',
                  color: u.active ? '#16a34a' : '#9ca3af',
                }}>
                  {u.active ? 'Active' : 'Inactive'}
                </span>
              </td>
              <td style={{ padding: '10px 10px' }}>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button onClick={() => doToggleUser(u.id)} style={{ ...btnStyle('ghost'), padding: '4px 10px', fontSize: 12 }}>
                    {u.active ? 'Deactivate' : 'Activate'}
                  </button>
                  <button onClick={() => doDeleteUser(u.id)} style={{ ...btnStyle('ghost'), padding: '4px 10px', fontSize: 12, color: '#dc2626', border: '1px solid #fca5a5' }}>
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function TeamsTab({ teams, users, doCreateTeam, doUpdateTeam, doDeleteTeam }) {
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', description: '', members: [] })

  const handleCreate = () => {
    if (!form.name) return
    doCreateTeam(form)
    setForm({ name: '', description: '', members: [] })
    setShowForm(false)
  }

  const toggleMember = (name) => {
    setForm(f => ({
      ...f,
      members: f.members.includes(name) ? f.members.filter(m => m !== name) : [...f.members, name]
    }))
  }

  return (
    <div>
      <SectionTitle action={
        <button style={btnStyle('primary')} onClick={() => setShowForm(!showForm)}>+ New Team</button>
      }>
        Teams ({(teams || []).length})
      </SectionTitle>

      {showForm && (
        <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16, marginBottom: 16, background: '#f9fafb' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
            <FormRow label="Team Name">
              <input style={inputStyle} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Frontend Guild" />
            </FormRow>
            <FormRow label="Description">
              <input style={inputStyle} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Short description" />
            </FormRow>
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 12, fontWeight: 500, color: '#374151', display: 'block', marginBottom: 6 }}>Add Members</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {(users || []).map(u => (
                <button key={u.id} onClick={() => toggleMember(u.name)} style={{
                  padding: '4px 10px', fontSize: 12, borderRadius: 20, cursor: 'pointer',
                  background: form.members.includes(u.name) ? '#2563eb' : '#f3f4f6',
                  color: form.members.includes(u.name) ? '#fff' : '#374151',
                  border: 'none',
                }}>
                  {u.name}
                </button>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button style={btnStyle('primary')} onClick={handleCreate}>Create Team</button>
            <button style={btnStyle('ghost')} onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {(teams || []).map(team => (
          <div key={team.id} style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: '12px 16px', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: 14, color: '#111827', marginBottom: 2 }}>{team.name}</div>
              <div style={{ fontSize: 12, color: '#6b7280' }}>{team.description}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                {(team.members || []).slice(0, 4).map((name, i) => (
                  <div key={i} style={{ marginLeft: i === 0 ? 0 : -6, zIndex: 4 - i }}>
                    <AvatarInline name={name} size={22} />
                  </div>
                ))}
                {(team.members || []).length > 4 && (
                  <span style={{ fontSize: 11, color: '#6b7280', marginLeft: 4 }}>+{team.members.length - 4}</span>
                )}
                <span style={{ fontSize: 12, color: '#6b7280', marginLeft: 8 }}>{(team.members || []).length} members</span>
              </div>
              <button style={{ ...btnStyle('ghost'), padding: '4px 10px', fontSize: 12 }} onClick={() => doDeleteTeam(team.id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function GroupsTab({ groups, doAddGroup }) {
  const [newGroup, setNewGroup] = useState('')
  const mockCounts = [5, 3, 4, 2, 1]

  return (
    <div style={{ maxWidth: 560 }}>
      <SectionTitle>Groups</SectionTitle>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, marginBottom: 20 }}>
        <thead>
          <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
            {['Group Name', 'Members', 'Actions'].map(h => (
              <th key={h} style={{ padding: '8px 10px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {(groups || []).map((g, i) => (
            <tr key={i} style={{ borderBottom: '1px solid #f3f4f6' }}>
              <td style={{ padding: '10px 10px', fontWeight: 500, color: '#111827' }}>{g}</td>
              <td style={{ padding: '10px 10px', color: '#6b7280' }}>{mockCounts[i % mockCounts.length]}</td>
              <td style={{ padding: '10px 10px' }}>
                <button style={{ ...btnStyle('ghost'), padding: '3px 10px', fontSize: 12 }}>Edit</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ display: 'flex', gap: 8 }}>
        <input
          style={{ ...inputStyle, flex: 1 }}
          placeholder="New group name..."
          value={newGroup}
          onChange={e => setNewGroup(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && newGroup) { doAddGroup(newGroup); setNewGroup('') } }}
        />
        <button style={btnStyle('primary')} onClick={() => { if (newGroup) { doAddGroup(newGroup); setNewGroup('') } }}>
          + Add Group
        </button>
      </div>
    </div>
  )
}

function SecurityTab() {
  const [twoFA, setTwoFA] = useState(false)
  const [sso, setSso] = useState(false)
  const [sessionTimeout, setSessionTimeout] = useState('1hr')

  const fakeSessions = [
    { browser: 'Chrome 123 / macOS', ip: '192.168.1.42', last: '2 minutes ago' },
    { browser: 'Safari / iPhone', ip: '10.0.0.5', last: '1 hour ago' },
    { browser: 'Firefox / Windows', ip: '203.0.113.12', last: '2 days ago' },
  ]

  return (
    <div style={{ maxWidth: 560 }}>
      <SectionTitle>Authentication</SectionTitle>
      {[
        { label: 'Two-Factor Authentication', hint: 'Require 2FA for all workspace members', val: twoFA, set: setTwoFA },
        { label: 'Single Sign-On (SSO)', hint: 'Enable SAML/OIDC SSO login', val: sso, set: setSso },
      ].map(({ label, hint, val, set }) => (
        <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #f3f4f6' }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 500, color: '#111827' }}>{label}</div>
            <div style={{ fontSize: 12, color: '#6b7280' }}>{hint}</div>
          </div>
          <Toggle value={val} onChange={set} />
        </div>
      ))}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #f3f4f6' }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 500, color: '#111827' }}>Session Timeout</div>
          <div style={{ fontSize: 12, color: '#6b7280' }}>Auto-logout after inactivity</div>
        </div>
        <select style={{ ...inputStyle, width: 120 }} value={sessionTimeout} onChange={e => setSessionTimeout(e.target.value)}>
          {['30min', '1hr', '4hr', '8hr'].map(t => <option key={t}>{t}</option>)}
        </select>
      </div>

      <div style={{ marginTop: 28 }}>
        <SectionTitle>Active Sessions</SectionTitle>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
              {['Browser / Device', 'IP Address', 'Last Active', ''].map((h, i) => (
                <th key={i} style={{ padding: '8px 10px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {fakeSessions.map((s, i) => (
              <tr key={i} style={{ borderBottom: '1px solid #f3f4f6' }}>
                <td style={{ padding: '10px 10px', color: '#111827' }}>{s.browser}</td>
                <td style={{ padding: '10px 10px', color: '#6b7280', fontFamily: 'monospace', fontSize: 12 }}>{s.ip}</td>
                <td style={{ padding: '10px 10px', color: '#6b7280' }}>{s.last}</td>
                <td style={{ padding: '10px 10px' }}>
                  {i !== 0
                    ? <button style={{ ...btnStyle('ghost'), padding: '3px 10px', fontSize: 12, color: '#dc2626', border: '1px solid #fca5a5' }}>Revoke</button>
                    : <span style={{ fontSize: 12, color: '#16a34a', fontWeight: 500 }}>Current</span>
                  }
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function WorkflowsTab({ projects, workflowDefs }) {
  const defaultStatuses = ['To Do', 'In Progress', 'In Review', 'Done']
  const statusColors = { 'To Do': '#6b7280', 'In Progress': '#2563eb', 'In Review': '#f59e0b', 'Done': '#16a34a', 'Blocked': '#dc2626', 'Backlog': '#9ca3af' }

  const getStatuses = (pid) => {
    const wf = (workflowDefs || []).find(w => w.project === pid)
    return wf ? wf.statuses : defaultStatuses
  }

  return (
    <div>
      <SectionTitle>Project Workflows</SectionTitle>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {(projects || []).map(p => (
          <div key={p.id} style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: '12px 16px', background: '#fff' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 13 }}>{p.icon}</span>
                <span style={{ fontWeight: 600, fontSize: 13, color: '#111827' }}>{p.name}</span>
                <span style={{ fontSize: 11, color: '#9ca3af' }}>{p.key}</span>
              </div>
              <button style={{ ...btnStyle('ghost'), padding: '4px 10px', fontSize: 12 }}>Edit</button>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap' }}>
              {getStatuses(p.id).map((s, i, arr) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{
                    padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 500,
                    background: (statusColors[s] || '#6b7280') + '18',
                    color: statusColors[s] || '#6b7280',
                    border: `1px solid ${(statusColors[s] || '#6b7280')}40`,
                  }}>{s}</span>
                  {i < arr.length - 1 && <span style={{ color: '#d1d5db', fontSize: 12 }}>→</span>}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function FieldsTab({ customFields, doCreateCustomField }) {
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', type: 'Text', required: false })

  const handleAdd = () => {
    if (!form.name) return
    doCreateCustomField(form)
    setForm({ name: '', type: 'Text', required: false })
    setShowForm(false)
  }

  return (
    <div>
      <SectionTitle action={
        <button style={btnStyle('primary')} onClick={() => setShowForm(!showForm)}>+ Add Field</button>
      }>
        Custom Fields
      </SectionTitle>

      {showForm && (
        <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16, marginBottom: 16, background: '#f9fafb', display: 'flex', gap: 10, alignItems: 'flex-end' }}>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: 12, fontWeight: 500, color: '#374151', display: 'block', marginBottom: 4 }}>Field Name</label>
            <input style={inputStyle} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Story Points" />
          </div>
          <div style={{ width: 140 }}>
            <label style={{ fontSize: 12, fontWeight: 500, color: '#374151', display: 'block', marginBottom: 4 }}>Type</label>
            <select style={inputStyle} value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
              {['Text', 'Number', 'Date', 'Select', 'User'].map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, paddingBottom: 8 }}>
            <Toggle value={form.required} onChange={v => setForm(f => ({ ...f, required: v }))} />
            <span style={{ fontSize: 12, color: '#374151' }}>Required</span>
          </div>
          <button style={btnStyle('primary')} onClick={handleAdd}>Add</button>
          <button style={btnStyle('ghost')} onClick={() => setShowForm(false)}>Cancel</button>
        </div>
      )}

      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead>
          <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
            {['Field Name', 'Type', 'Required', 'Actions'].map(h => (
              <th key={h} style={{ padding: '8px 10px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {(customFields || []).map(f => (
            <tr key={f.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
              <td style={{ padding: '10px 10px', fontWeight: 500, color: '#111827' }}>{f.name}</td>
              <td style={{ padding: '10px 10px' }}>
                <span style={{ fontSize: 12, padding: '2px 8px', borderRadius: 4, background: '#f3f4f6', color: '#374151' }}>{f.type}</span>
              </td>
              <td style={{ padding: '10px 10px' }}>
                <span style={{ fontSize: 12, color: f.required ? '#16a34a' : '#9ca3af' }}>{f.required ? 'Yes' : 'No'}</span>
              </td>
              <td style={{ padding: '10px 10px' }}>
                <button style={{ ...btnStyle('ghost'), padding: '3px 10px', fontSize: 12 }}>Edit</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function AppearanceTab({ settings, doUpdateSettings }) {
  const [theme, setTheme] = useState(settings?.theme || 'light')
  const [accent, setAccent] = useState(settings?.accent || '#2563eb')
  const [fontSize, setFontSize] = useState('Medium')

  const accents = ['#2563eb', '#7c3aed', '#16a34a', '#ec4899', '#f59e0b', '#dc2626']

  const save = () => doUpdateSettings({ theme, accent })

  return (
    <div style={{ maxWidth: 480 }}>
      <SectionTitle>Theme</SectionTitle>
      <div style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
        {[['Light', '☀️'], ['Dark', '🌙'], ['System', '💻']].map(([t, icon]) => (
          <div key={t} onClick={() => setTheme(t.toLowerCase())} style={{
            flex: 1, border: `2px solid ${theme === t.toLowerCase() ? '#2563eb' : '#e5e7eb'}`,
            borderRadius: 8, padding: '12px 8px', cursor: 'pointer', textAlign: 'center',
            background: theme === t.toLowerCase() ? '#eff6ff' : '#fff',
          }}>
            <div style={{ fontSize: 20, marginBottom: 4 }}>{icon}</div>
            <div style={{ fontSize: 13, fontWeight: 500, color: theme === t.toLowerCase() ? '#2563eb' : '#374151' }}>{t}</div>
          </div>
        ))}
      </div>

      <SectionTitle>Accent Color</SectionTitle>
      <div style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
        {accents.map(c => (
          <div key={c} onClick={() => setAccent(c)} style={{
            width: 32, height: 32, borderRadius: '50%', background: c, cursor: 'pointer',
            border: accent === c ? '3px solid #111827' : '3px solid transparent',
            outline: accent === c ? '2px solid #e5e7eb' : 'none',
          }} />
        ))}
      </div>

      <SectionTitle>Font Size</SectionTitle>
      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        {['Small', 'Medium', 'Large'].map(s => (
          <button key={s} onClick={() => setFontSize(s)} style={{
            padding: '6px 20px', fontSize: 13, borderRadius: 6, cursor: 'pointer',
            border: `1px solid ${fontSize === s ? '#2563eb' : '#d1d5db'}`,
            background: fontSize === s ? '#eff6ff' : '#fff',
            color: fontSize === s ? '#2563eb' : '#374151',
            fontWeight: fontSize === s ? 600 : 400,
          }}>
            {s}
          </button>
        ))}
      </div>

      <button style={btnStyle('primary')} onClick={save}>Save Appearance</button>
    </div>
  )
}

function NotificationsTab() {
  const [prefs, setPrefs] = useState({
    assigned: true,
    statusChanged: true,
    sprintStarted: false,
    comment: true,
    projectUpdates: false,
    weeklyDigest: true,
  })

  const items = [
    { key: 'assigned', label: 'Issue assigned to me', hint: 'Get notified when an issue is assigned to you' },
    { key: 'statusChanged', label: 'Issue status changed', hint: 'When an issue you follow changes status' },
    { key: 'sprintStarted', label: 'Sprint started / completed', hint: 'Notifications for sprint lifecycle events' },
    { key: 'comment', label: 'New comment on my issue', hint: 'When someone comments on your issue' },
    { key: 'projectUpdates', label: 'Project updates', hint: 'General project announcements' },
    { key: 'weeklyDigest', label: 'Weekly digest email', hint: 'Summary of your week every Monday' },
  ]

  return (
    <div style={{ maxWidth: 560 }}>
      <SectionTitle>Notification Preferences</SectionTitle>
      {items.map(({ key, label, hint }) => (
        <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #f3f4f6' }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 500, color: '#111827' }}>{label}</div>
            <div style={{ fontSize: 12, color: '#6b7280' }}>{hint}</div>
          </div>
          <Toggle value={prefs[key]} onChange={v => setPrefs(p => ({ ...p, [key]: v }))} />
        </div>
      ))}
    </div>
  )
}

function LabelsTab() {
  const [labels, setLabels] = useState([
    { name: 'bug', color: '#dc2626' },
    { name: 'feature', color: '#2563eb' },
    { name: 'enhancement', color: '#16a34a' },
    { name: 'documentation', color: '#6b7280' },
    { name: 'design', color: '#7c3aed' },
    { name: 'priority', color: '#f59e0b' },
  ])
  const [newLabel, setNewLabel] = useState('')
  const [newColor, setNewColor] = useState('#2563eb')

  const addLabel = () => {
    if (!newLabel.trim()) return
    setLabels(l => [...l, { name: newLabel.trim(), color: newColor }])
    setNewLabel('')
  }

  return (
    <div style={{ maxWidth: 560 }}>
      <SectionTitle>Labels</SectionTitle>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
        {labels.map((l, i) => (
          <span key={i} style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '4px 10px', borderRadius: 20, fontSize: 13, fontWeight: 500,
            background: l.color + '18', color: l.color,
            border: `1px solid ${l.color}40`,
          }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: l.color, display: 'inline-block' }} />
            {l.name}
            <span
              onClick={() => setLabels(ls => ls.filter((_, j) => j !== i))}
              style={{ cursor: 'pointer', fontSize: 14, lineHeight: 1, color: l.color, opacity: 0.7 }}
            >×</span>
          </span>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <input
          style={{ ...inputStyle, flex: 1 }}
          placeholder="Label name..."
          value={newLabel}
          onChange={e => setNewLabel(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && addLabel()}
        />
        <input
          type="color"
          value={newColor}
          onChange={e => setNewColor(e.target.value)}
          style={{ width: 38, height: 34, border: '1px solid #d1d5db', borderRadius: 6, cursor: 'pointer', padding: 2 }}
        />
        <button style={btnStyle('primary')} onClick={addLabel}>Add Label</button>
      </div>
    </div>
  )
}

// ── Main Settings page ────────────────────────────────────────────────────────

const TABS = [
  { id: 'general',       label: 'General' },
  { id: 'appearance',    label: 'Appearance' },
  { id: 'notifications', label: 'Notifications' },
  { id: 'users',         label: 'Users' },
  { id: 'teams',         label: 'Teams' },
  { id: 'groups',        label: 'Groups' },
  { id: 'security',      label: 'Security' },
  { id: 'workflows',     label: 'Workflows' },
  { id: 'fields',        label: 'Fields' },
  { id: 'labels',        label: 'Labels' },
]

export default function Settings() {
  const [activeTab, setActiveTab] = useState('general')
  const {
    users, teams, groups, customFields, settings, workflowDefs, projects,
    doUpdateSettings, doCreateUser, doDeleteUser, doToggleUser,
    doCreateTeam, doUpdateTeam, doDeleteTeam,
    doAddGroup,
    doCreateCustomField,
  } = useApp()

  const renderTab = () => {
    switch (activeTab) {
      case 'general':       return <GeneralTab settings={settings} doUpdateSettings={doUpdateSettings} />
      case 'appearance':    return <AppearanceTab settings={settings} doUpdateSettings={doUpdateSettings} />
      case 'notifications': return <NotificationsTab />
      case 'users':         return <UsersTab users={users} doToggleUser={doToggleUser} doDeleteUser={doDeleteUser} doCreateUser={doCreateUser} />
      case 'teams':         return <TeamsTab teams={teams} users={users} doCreateTeam={doCreateTeam} doUpdateTeam={doUpdateTeam} doDeleteTeam={doDeleteTeam} />
      case 'groups':        return <GroupsTab groups={groups} doAddGroup={doAddGroup} />
      case 'security':      return <SecurityTab />
      case 'workflows':     return <WorkflowsTab projects={projects} workflowDefs={workflowDefs} />
      case 'fields':        return <FieldsTab customFields={customFields} doCreateCustomField={doCreateCustomField} />
      case 'labels':        return <LabelsTab />
      default:              return null
    }
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#f9fafb' }}>
      {/* Tab bar */}
      <div style={{
        background: '#fff', borderBottom: '1px solid #e5e7eb',
        padding: '0 24px', display: 'flex', alignItems: 'flex-end', gap: 0, flexShrink: 0,
      }}>
        <div style={{ marginRight: 20, paddingBottom: 12, paddingTop: 12, display: 'flex', alignItems: 'center' }}>
          <span style={{ fontSize: 15, fontWeight: 700, color: '#111827' }}>Settings</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end' }}>
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '10px 14px', fontSize: 13, fontWeight: activeTab === tab.id ? 600 : 400,
                color: activeTab === tab.id ? '#2563eb' : '#6b7280',
                background: 'none', border: 'none', cursor: 'pointer',
                borderBottom: activeTab === tab.id ? '2px solid #2563eb' : '2px solid transparent',
                marginBottom: -1,
                transition: 'color .15s, border-color .15s',
                whiteSpace: 'nowrap',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflow: 'auto', padding: 28 }}>
        <div style={{ maxWidth: 860, background: '#fff', borderRadius: 10, border: '1px solid #e5e7eb', padding: 28, minHeight: 400 }}>
          {renderTab()}
        </div>
      </div>
    </div>
  )
}
