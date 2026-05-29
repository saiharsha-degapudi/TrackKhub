import React from 'react'
import { useApp } from '../../context/AppContext'
import Avatar from '../common/Avatar'
import { getTypeColor } from '../common/Badge'

function UsersPanel() {
  const { users, openModal, doDeleteUser, doToggleUser } = useApp()
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ fontSize: 16, fontWeight: 700 }}>Users</div>
        <button className="btn btn-primary btn-sm" onClick={() => openModal('addUser')}>+ Add User</button>
      </div>
      <div className="card" style={{ padding: 0 }}>
        <table>
          <thead>
            <tr><th>User</th><th>Email</th><th>Role</th><th>Group</th><th>Status</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Avatar name={u.name} size={30} />
                    <span style={{ fontWeight: 600 }}>{u.name}</span>
                  </div>
                </td>
                <td style={{ color: 'var(--gray-500)' }}>{u.email}</td>
                <td>
                  <span className={`badge ${u.role === 'Admin' ? 'badge-red' : u.role === 'Manager' ? 'badge-purple' : u.role === 'Developer' ? 'badge-blue' : 'badge-gray'}`}>
                    {u.role}
                  </span>
                </td>
                <td><span className="tag">{u.group}</span></td>
                <td>
                  <div className="toggle-wrap">
                    <div className={`toggle ${u.active ? 'on' : ''}`} onClick={() => doToggleUser(u.id)}>
                      <div className="toggle-knob" />
                    </div>
                    <span style={{ fontSize: 12 }}>{u.active ? 'Active' : 'Inactive'}</span>
                  </div>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button className="btn btn-ghost btn-sm" onClick={() => openModal('editUser', u.id)}>✏</button>
                    <button className="btn btn-ghost btn-sm" style={{ color: 'var(--red)' }} onClick={() => {
                      if (window.confirm('Remove user?')) doDeleteUser(u.id)
                    }}>🗑</button>
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

function RolesPanel() {
  const { roles, groups, users, openModal } = useApp()
  return (
    <div>
      <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Roles & Groups</div>
      <div className="grid-2">
        <div className="card">
          <div className="card-title">Roles</div>
          {roles.map(r => (
            <div key={r} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--gray-100)' }}>
              <span className={`badge ${r === 'Admin' ? 'badge-red' : r === 'Manager' ? 'badge-purple' : r === 'Developer' ? 'badge-blue' : 'badge-gray'}`}>{r}</span>
              <span style={{ fontSize: 12, color: 'var(--gray-500)' }}>{users.filter(u => u.role === r).length} users</span>
            </div>
          ))}
          <button className="btn btn-outline btn-sm w-full" style={{ marginTop: 10 }} onClick={() => openModal('addRole')}>+ New Role</button>
        </div>
        <div className="card">
          <div className="card-title">Groups</div>
          {groups.map(g => (
            <div key={g} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--gray-100)' }}>
              <span className="tag">{g}</span>
              <span style={{ fontSize: 12, color: 'var(--gray-500)' }}>{users.filter(u => u.group === g).length} members</span>
            </div>
          ))}
          <button className="btn btn-outline btn-sm w-full" style={{ marginTop: 10 }} onClick={() => openModal('addGroup')}>+ New Group</button>
        </div>
      </div>
    </div>
  )
}

function TeamsPanel() {
  const { teams, users, doDeleteTeam, openModal } = useApp()

  const getUserName = (id) => users.find(u => u.id === id)?.name || '—'

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ fontSize: 16, fontWeight: 700 }}>Teams</div>
        <button className="btn btn-primary btn-sm" onClick={() => openModal('createTeam')}>+ New Team</button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {teams.map(t => (
          <div key={t.id} className="card" style={{ borderLeft: `4px solid ${t.color}` }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 9, background: t.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 14 }}>
                  {t.name.charAt(0)}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{t.name}</div>
                  {t.description && <div style={{ fontSize: 12, color: 'var(--gray-500)' }}>{t.description}</div>}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <button className="btn btn-ghost btn-sm" onClick={() => openModal('editTeam', t.id)}>✏</button>
                <button className="btn btn-ghost btn-sm" style={{ color: 'var(--red)' }} onClick={() => {
                  if (window.confirm('Delete team?')) doDeleteTeam(t.id)
                }}>🗑</button>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 16, fontSize: 12, color: 'var(--gray-600)' }}>
              <span><strong>Lead:</strong> {getUserName(t.lead)}</span>
              <span><strong>Members:</strong> {t.members.length}</span>
            </div>
            <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginTop: 8 }}>
              {t.members.map(mid => {
                const u = users.find(x => x.id === mid)
                return u ? <Avatar key={mid} name={u.name} size={26} title={u.name} /> : null
              })}
            </div>
          </div>
        ))}
        {teams.length === 0 && (
          <div className="empty-state">No teams yet. Create one to get started.</div>
        )}
      </div>
    </div>
  )
}

function PermissionsPanel() {
  const { roles } = useApp()
  const perms = ['Create Tickets', 'Edit Tickets', 'Delete Tickets', 'Manage Projects', 'Manage Users', 'View Reports', 'Admin Settings']
  return (
    <div>
      <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Permissions</div>
      <div className="card" style={{ padding: 0 }}>
        <table>
          <thead>
            <tr>
              <th>Permission</th>
              {roles.map(r => <th key={r}>{r}</th>)}
            </tr>
          </thead>
          <tbody>
            {perms.map(perm => (
              <tr key={perm}>
                <td style={{ fontWeight: 500 }}>{perm}</td>
                {roles.map(r => {
                  const has = ['Create Tickets', 'Edit Tickets', 'View Reports'].includes(perm) ||
                    r === 'Admin' ||
                    (['Manage Projects', 'Delete Tickets'].includes(perm) && ['Admin', 'Manager'].includes(r))
                  return <td key={r} style={{ textAlign: 'center' }}>{has ? '✅' : '—'}</td>
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function FieldsPanel() {
  const { customFields, openModal } = useApp()
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ fontSize: 16, fontWeight: 700 }}>Custom Fields</div>
        <button className="btn btn-primary btn-sm" onClick={() => openModal('addField')}>+ Add Field</button>
      </div>
      <div className="card" style={{ padding: 0 }}>
        <table>
          <thead><tr><th>Field</th><th>Type</th><th>Applies To</th><th>Required</th><th>Actions</th></tr></thead>
          <tbody>
            {customFields.map(f => (
              <tr key={f.id}>
                <td style={{ fontWeight: 600 }}>{f.name}</td>
                <td><span className="badge badge-blue">{f.type}</span></td>
                <td>{f.applyTo.map(t => <span key={t} className={`badge ${getTypeColor(t)}`} style={{ margin: 1 }}>{t}</span>)}</td>
                <td>{f.required ? <span className="badge badge-red">Yes</span> : <span className="badge badge-gray">No</span>}</td>
                <td>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button className="btn btn-ghost btn-sm">✏</button>
                    <button className="btn btn-ghost btn-sm" style={{ color: 'var(--red)' }}>🗑</button>
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

function WorkflowsPanel() {
  const { workflowDefs, doDeleteWorkflow, doSetDefaultWorkflow, openModal } = useApp()

  const catColor = { todo: 'badge-gray', inprogress: 'badge-blue', done: 'badge-green', blocked: 'badge-red' }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ fontSize: 16, fontWeight: 700 }}>Workflow Definitions</div>
        <button className="btn btn-primary btn-sm" onClick={() => openModal('createWorkflow')}>+ New Workflow</button>
      </div>
      {workflowDefs.map(wf => (
        <div key={wf.id} className="card" style={{ marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 14, fontWeight: 700 }}>{wf.name}</span>
              {wf.isDefault && <span className="badge badge-green">Default</span>}
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              {!wf.isDefault && (
                <button className="btn btn-outline btn-sm" onClick={() => doSetDefaultWorkflow(wf.id)}>Set Default</button>
              )}
              <button className="btn btn-ghost btn-sm" onClick={() => openModal('editWorkflow', wf.id)}>✏</button>
              {!wf.isDefault && (
                <button className="btn btn-ghost btn-sm" style={{ color: 'var(--red)' }} onClick={() => {
                  if (window.confirm('Delete workflow?')) doDeleteWorkflow(wf.id)
                }}>🗑</button>
              )}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 10 }}>
            {wf.statuses.map(s => (
              <span key={s.name} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: s.color + '22', color: s.color, border: `1.5px solid ${s.color}44` }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: s.color, display: 'inline-block' }} />
                {s.name}
              </span>
            ))}
          </div>
          <div style={{ fontSize: 11, color: 'var(--gray-500)', fontWeight: 600, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '.5px' }}>Transitions</div>
          {wf.transitions.map(tr => (
            <div key={tr.from} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '3px 0', fontSize: 12 }}>
              <span style={{ fontWeight: 600, color: 'var(--gray-700)' }}>{tr.from}</span>
              <span style={{ color: 'var(--gray-400)' }}>→</span>
              {tr.to.map(x => <span key={x} style={{ background: 'var(--blue-light)', color: 'var(--blue)', padding: '1px 7px', borderRadius: 10, fontSize: 11, fontWeight: 600 }}>{x}</span>)}
            </div>
          ))}
        </div>
      ))}
      {workflowDefs.length === 0 && <div className="empty-state">No workflows defined.</div>}
    </div>
  )
}

function ScreensPanel() {
  const fields = ['Summary', 'Description', 'Assignee', 'Reporter', 'Priority', 'Status', 'Sprint', 'Labels', 'Start Date', 'Due Date', 'Story Points']
  const [active, setActive] = React.useState({})
  const toggle = (screen, field) => {
    const key = `${screen}__${field}`
    setActive(prev => ({ ...prev, [key]: !prev[key] }))
  }
  return (
    <div>
      <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Screens</div>
      {['Create Screen', 'Edit Screen', 'View Screen'].map(s => (
        <div key={s} className="card" style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 10 }}>{s}</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {fields.map(f => {
              const on = active[`${s}__${f}`]
              return (
                <span
                  key={f}
                  onClick={() => toggle(s, f)}
                  style={{ padding: '5px 11px', borderRadius: 6, fontSize: 12, border: `1.5px solid ${on ? 'var(--blue)' : 'var(--gray-200)'}`, background: on ? 'var(--blue-light)' : 'var(--gray-50)', cursor: 'pointer' }}
                >
                  {f}
                </span>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}

function AppSettingsPanel() {
  const { settings, doUpdateSettings } = useApp()
  const [local, setLocal] = React.useState(settings)
  React.useEffect(() => { setLocal(settings) }, [settings])

  const handleSave = async () => {
    await doUpdateSettings(local)
    alert('✅ Settings saved!')
  }

  return (
    <div>
      <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>App Settings</div>
      <div className="card" style={{ maxWidth: 480 }}>
        <div className="form-group">
          <label className="form-label">Application Name</label>
          <input className="form-input" value={local.appName || ''} onChange={e => setLocal(p => ({ ...p, appName: e.target.value }))} />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Timezone</label>
            <select className="form-select" value={local.timezone || 'UTC'} onChange={e => setLocal(p => ({ ...p, timezone: e.target.value }))}>
              {['UTC', 'US/Eastern', 'US/Pacific', 'Europe/London', 'Asia/Kolkata'].map(tz => (
                <option key={tz} value={tz}>{tz}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Date Format</label>
            <select className="form-select" value={local.dateFormat || 'MM/DD/YYYY'} onChange={e => setLocal(p => ({ ...p, dateFormat: e.target.value }))}>
              {['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD'].map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>
        </div>
        {[['emailNotif', 'Email Notifications'], ['slackNotif', 'Slack Notifications'], ['allowSignup', 'Allow Self Signup']].map(([k, l]) => (
          <div key={k} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--gray-100)' }}>
            <span style={{ fontSize: 13 }}>{l}</span>
            <div className={`toggle ${local[k] ? 'on' : ''}`} onClick={() => setLocal(p => ({ ...p, [k]: !p[k] }))}>
              <div className="toggle-knob" />
            </div>
          </div>
        ))}
        <button className="btn btn-primary w-full" style={{ marginTop: 14 }} onClick={handleSave}>Save Settings</button>
      </div>
    </div>
  )
}

const TABS = {
  users: 'Users', roles: 'Roles & Groups', teams: 'Teams', permissions: 'Permissions',
  fields: 'Custom Fields', workflows: 'Workflows', screens: 'Screens', app: 'App Settings'
}

const PANELS = {
  users: UsersPanel, roles: RolesPanel, teams: TeamsPanel, permissions: PermissionsPanel,
  fields: FieldsPanel, workflows: WorkflowsPanel, screens: ScreensPanel, app: AppSettingsPanel
}

export default function Settings() {
  const { settingsTab, navSettings } = useApp()
  const Panel = PANELS[settingsTab] || UsersPanel

  return (
    <div className="page">
      <div className="page-header"><div className="page-title">Settings</div></div>
      <div className="settings-layout">
        <div className="settings-nav">
          <div className="settings-nav-group">Admin</div>
          {['users', 'roles', 'teams', 'permissions'].map(k => (
            <div key={k} className={`settings-nav-item ${settingsTab === k ? 'active' : ''}`} onClick={() => navSettings(k)}>
              {TABS[k]}
            </div>
          ))}
          <div className="settings-nav-group">App</div>
          {['fields', 'workflows', 'screens', 'app'].map(k => (
            <div key={k} className={`settings-nav-item ${settingsTab === k ? 'active' : ''}`} onClick={() => navSettings(k)}>
              {TABS[k]}
            </div>
          ))}
        </div>
        <div><Panel /></div>
      </div>
    </div>
  )
}
