import React, { useState, useEffect } from 'react'
import { useApp } from '../../context/AppContext'

const BLUE = '#1a56db'
const BLUE_DARK = '#1240a8'
const BLUE_LIGHT = '#e8f0fe'

const features = [
  {
    icon: '⚡',
    title: 'Sprint Boards',
    desc: 'Drag-and-drop kanban boards with sprint health at a glance. See what\'s blocked before it becomes a crisis.',
  },
  {
    icon: '📊',
    title: 'Live Dashboards',
    desc: 'Real-time charts for ticket status, team workload, and velocity. No manual reporting.',
  },
  {
    icon: '🗺',
    title: 'Roadmaps',
    desc: 'Timeline view across all projects. Show stakeholders the big picture in seconds.',
  },
  {
    icon: '🎯',
    title: 'Smart Backlogs',
    desc: 'Prioritise, estimate, and plan sprints from one clean backlog view.',
  },
  {
    icon: '👥',
    title: 'Team Workload',
    desc: 'See who\'s overloaded before they burn out. Balance work across the team.',
  },
  {
    icon: '🔍',
    title: 'Powerful Filters',
    desc: 'Filter by assignee, type, sprint, priority — save your views for later.',
  },
]

const steps = [
  { num: '01', title: 'Create your project and invite your team', desc: 'Set up in minutes. No configuration hell, no IT ticket required.' },
  { num: '02', title: 'Add tickets, set priorities, build your backlog', desc: 'Capture work fast. Bulk-edit, drag to reorder, and estimate with ease.' },
  { num: '03', title: 'Run sprints, track progress, ship faster', desc: 'Launch sprints with one click. Watch velocity improve week over week.' },
]

const testimonials = [
  {
    quote: 'We replaced Jira with Hub in one afternoon. The board is so much faster.',
    name: 'Alex M.',
    role: 'Engineering Lead',
    initials: 'AM',
    color: '#1a56db',
  },
  {
    quote: "Finally a PM tool that doesn't need a 3-day onboarding. Our team was productive on day one.",
    name: 'Priya K.',
    role: 'Product Manager',
    initials: 'PK',
    color: '#7c3aed',
  },
]

function Logo({ size = 'md' }) {
  const big = size === 'lg'
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: big ? 10 : 8 }}>
      <div style={{
        width: big ? 38 : 30, height: big ? 38 : 30,
        background: BLUE, borderRadius: big ? 10 : 8,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#fff', fontSize: big ? 18 : 14, fontWeight: 800,
        boxShadow: '0 2px 8px rgba(26,86,219,0.30)',
        flexShrink: 0,
      }}>H</div>
      <span style={{ fontSize: big ? 22 : 18, fontWeight: 700, color: BLUE, letterSpacing: '-0.5px' }}>Hub</span>
    </div>
  )
}

export default function Landing() {
  const { nav } = useApp()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const container = { maxWidth: 1100, margin: '0 auto', width: '100%' }

  return (
    <div style={{ fontFamily: "'Segoe UI', system-ui, sans-serif", color: '#1a1a2e', background: '#fff', overflowX: 'hidden' }}>

      {/* ── Navbar ── */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 200,
        background: '#fff',
        borderBottom: scrolled ? '1.5px solid #e2e8f0' : '1.5px solid #f0f4ff',
        boxShadow: scrolled ? '0 2px 12px rgba(26,86,219,0.07)' : 'none',
        transition: 'box-shadow 0.2s, border-color 0.2s',
      }}>
        <div style={{ ...container, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', height: 64 }}>
          <Logo />
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              onClick={() => nav('login')}
              style={{ padding: '8px 16px', background: 'none', border: 'none', color: '#475569', fontSize: 14, fontWeight: 600, cursor: 'pointer', borderRadius: 7, transition: 'color 0.15s' }}
              onMouseEnter={e => e.target.style.color = BLUE}
              onMouseLeave={e => e.target.style.color = '#475569'}
            >
              Sign In
            </button>
            <button
              onClick={() => nav('login')}
              style={{
                padding: '9px 20px', background: BLUE, color: '#fff', border: 'none',
                borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(26,86,219,0.25)', transition: 'background 0.15s, transform 0.1s',
                display: 'flex', alignItems: 'center', gap: 4,
              }}
              onMouseEnter={e => { e.currentTarget.style.background = BLUE_DARK; e.currentTarget.style.transform = 'translateY(-1px)' }}
              onMouseLeave={e => { e.currentTarget.style.background = BLUE; e.currentTarget.style.transform = 'translateY(0)' }}
            >
              Get Started Free <span style={{ fontSize: 16 }}>→</span>
            </button>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section style={{
        background: 'linear-gradient(160deg, #f0f4ff 0%, #ffffff 60%)',
        padding: '100px 24px 80px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* decorative blobs */}
        <div style={{ position: 'absolute', top: -80, right: -80, width: 400, height: 400, borderRadius: '50%', background: 'rgba(26,86,219,0.05)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -60, left: -60, width: 300, height: 300, borderRadius: '50%', background: 'rgba(26,86,219,0.04)', pointerEvents: 'none' }} />

        <div style={{ ...container, position: 'relative' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: BLUE_LIGHT, color: BLUE, borderRadius: 100,
            padding: '5px 14px', fontSize: 12, fontWeight: 700,
            marginBottom: 24, letterSpacing: 0.3,
          }}>
            <span style={{ fontSize: 14 }}>✨</span> Project management, reimagined
          </div>

          <h1 style={{
            fontSize: 'clamp(36px, 5vw, 56px)', fontWeight: 800, lineHeight: 1.1,
            color: '#0f172a', marginBottom: 20, letterSpacing: '-1.5px',
            maxWidth: 760, margin: '0 auto 20px',
          }}>
            The project management tool<br />
            <span style={{ color: BLUE }}>your team will actually use</span>
          </h1>

          <p style={{
            fontSize: 18, color: '#475569', lineHeight: 1.65,
            maxWidth: 540, margin: '0 auto 40px', fontWeight: 400,
          }}>
            Sprints, roadmaps, and team dashboards — built for developers who hate bloated tools.
          </p>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 28 }}>
            <button
              onClick={() => nav('login')}
              style={{
                padding: '13px 28px', background: BLUE, color: '#fff',
                border: 'none', borderRadius: 9, fontSize: 16, fontWeight: 700,
                cursor: 'pointer', boxShadow: '0 4px 16px rgba(26,86,219,0.30)',
                transition: 'all 0.15s', display: 'flex', alignItems: 'center', gap: 6,
              }}
              onMouseEnter={e => { e.currentTarget.style.background = BLUE_DARK; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(26,86,219,0.35)' }}
              onMouseLeave={e => { e.currentTarget.style.background = BLUE; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(26,86,219,0.30)' }}
            >
              Get Started Free <span style={{ fontSize: 18 }}>→</span>
            </button>
            <button
              onClick={() => nav('login')}
              style={{
                padding: '13px 28px', background: '#fff', color: BLUE,
                border: '2px solid #c7d7f8', borderRadius: 9, fontSize: 16, fontWeight: 600,
                cursor: 'pointer', transition: 'all 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = BLUE; e.currentTarget.style.background = BLUE_LIGHT }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#c7d7f8'; e.currentTarget.style.background = '#fff' }}
            >
              View Demo
            </button>
          </div>

          <p style={{ fontSize: 13, color: '#94a3b8', fontWeight: 500, letterSpacing: 0.3 }}>
            Trusted by 500+ teams &nbsp;·&nbsp; No credit card required
          </p>

          {/* mock app preview */}
          <div style={{
            marginTop: 60, borderRadius: 16, overflow: 'hidden',
            boxShadow: '0 20px 60px rgba(26,86,219,0.15), 0 4px 16px rgba(0,0,0,0.08)',
            border: '1.5px solid #e2e8f0', background: '#fff',
            maxWidth: 880, margin: '60px auto 0',
          }}>
            {/* fake browser chrome */}
            <div style={{ background: '#f8fafc', borderBottom: '1.5px solid #e2e8f0', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ display: 'flex', gap: 6 }}>
                {['#fc5c57','#fdbc40','#33c748'].map((c, i) => (
                  <div key={i} style={{ width: 12, height: 12, borderRadius: '50%', background: c }} />
                ))}
              </div>
              <div style={{ flex: 1, background: '#fff', borderRadius: 6, border: '1px solid #e2e8f0', padding: '4px 12px', fontSize: 12, color: '#94a3b8', maxWidth: 320, margin: '0 auto', textAlign: 'left' }}>
                app.hub.io/projects/sprint-board
              </div>
            </div>
            {/* fake board UI */}
            <div style={{ background: '#f0f4ff', padding: '20px', display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, minHeight: 200 }}>
              {[
                { col: 'To Do', color: '#64748b', tickets: ['Fix auth bug', 'Write API docs', 'Update tests'] },
                { col: 'In Progress', color: '#1a56db', tickets: ['Sprint dashboard', 'Roadmap export'] },
                { col: 'Done', color: '#16a34a', tickets: ['User onboarding', 'Email templates', 'CI pipeline'] },
              ].map(({ col, color, tickets }) => (
                <div key={col} style={{ background: '#fff', borderRadius: 10, border: '1.5px solid #e2e8f0', padding: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: color }} />
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: 0.5 }}>{col}</span>
                    <span style={{ marginLeft: 'auto', background: '#f1f5f9', borderRadius: 100, padding: '1px 7px', fontSize: 10, color: '#64748b', fontWeight: 600 }}>{tickets.length}</span>
                  </div>
                  {tickets.map(t => (
                    <div key={t} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 7, padding: '8px 10px', marginBottom: 6, fontSize: 12, color: '#334155', fontWeight: 500 }}>
                      {t}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats bar ── */}
      <section style={{ padding: '0 24px', marginTop: -1 }}>
        <div style={{
          ...container,
          background: '#fff', border: '1.5px solid #e2e8f0',
          borderRadius: 14, padding: '28px 40px',
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 0, boxShadow: '0 4px 24px rgba(26,86,219,0.08)',
          margin: '-28px auto 0',
        }}>
          {[
            { val: '10,000+', label: 'Tickets managed' },
            { val: '500+', label: 'Teams using Hub' },
            { val: '99.9%', label: 'Uptime SLA' },
          ].map(({ val, label }, i) => (
            <div key={label} style={{
              textAlign: 'center', padding: '8px 20px',
              borderRight: i < 2 ? '1.5px solid #e2e8f0' : 'none',
            }}>
              <div style={{ fontSize: 36, fontWeight: 800, color: BLUE, letterSpacing: '-1px', lineHeight: 1 }}>{val}</div>
              <div style={{ fontSize: 13, color: '#64748b', marginTop: 6, fontWeight: 500 }}>{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section style={{ padding: '100px 24px', background: '#fff' }}>
        <div style={container}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: BLUE_LIGHT, color: BLUE, borderRadius: 100, padding: '5px 14px', fontSize: 12, fontWeight: 700, marginBottom: 16 }}>
              Everything you need
            </div>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 800, color: '#0f172a', letterSpacing: '-1px', marginBottom: 12 }}>
              Built for how modern teams work
            </h2>
            <p style={{ fontSize: 16, color: '#64748b', maxWidth: 480, margin: '0 auto' }}>
              Every feature designed to reduce friction, not add it.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
            {features.map((f, i) => (
              <FeatureCard key={f.title} {...f} delay={i * 40} />
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section style={{ padding: '100px 24px', background: 'linear-gradient(160deg, #f0f4ff 0%, #f8faff 100%)' }}>
        <div style={container}>
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: BLUE_LIGHT, color: BLUE, borderRadius: 100, padding: '5px 14px', fontSize: 12, fontWeight: 700, marginBottom: 16 }}>
              Simple by design
            </div>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 800, color: '#0f172a', letterSpacing: '-1px' }}>
              Up and running in minutes
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 24 }}>
            {steps.map((s, i) => (
              <div key={s.num} style={{ position: 'relative' }}>
                {i < steps.length - 1 && (
                  <div style={{ position: 'absolute', top: 24, left: 'calc(50% + 28px)', width: 'calc(100% - 28px)', height: 2, background: 'linear-gradient(90deg, #c7d7f8, transparent)', display: 'none' }} />
                )}
                <div style={{
                  background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: 14,
                  padding: '28px 24px', boxShadow: '0 2px 12px rgba(26,86,219,0.06)',
                  height: '100%',
                }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: 12, background: BLUE,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', fontSize: 15, fontWeight: 800, marginBottom: 16,
                    boxShadow: '0 4px 12px rgba(26,86,219,0.25)',
                  }}>{s.num}</div>
                  <h3 style={{ fontSize: 17, fontWeight: 700, color: '#0f172a', marginBottom: 8, lineHeight: 1.3 }}>{s.title}</h3>
                  <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.6 }}>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section style={{ padding: '100px 24px', background: '#fff' }}>
        <div style={container}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: BLUE_LIGHT, color: BLUE, borderRadius: 100, padding: '5px 14px', fontSize: 12, fontWeight: 700, marginBottom: 16 }}>
              What teams say
            </div>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 800, color: '#0f172a', letterSpacing: '-1px' }}>
              Loved by engineering teams
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 24 }}>
            {testimonials.map((t) => (
              <div key={t.name} style={{
                background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: 14,
                padding: '28px 28px', boxShadow: '0 4px 20px rgba(26,86,219,0.07)',
                display: 'flex', flexDirection: 'column', gap: 20,
              }}>
                <div style={{ display: 'flex', gap: 2 }}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span key={i} style={{ color: '#f59e0b', fontSize: 16 }}>★</span>
                  ))}
                </div>
                <p style={{ fontSize: 16, color: '#334155', lineHeight: 1.65, fontStyle: 'italic', fontWeight: 400 }}>
                  "{t.quote}"
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 'auto' }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: '50%',
                    background: t.color, color: '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 13, fontWeight: 700, flexShrink: 0,
                  }}>{t.initials}</div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>{t.name}</div>
                    <div style={{ fontSize: 12, color: '#64748b', marginTop: 1 }}>{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{
        padding: '100px 24px',
        background: `linear-gradient(135deg, ${BLUE} 0%, #1240a8 100%)`,
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: -100, right: -100, width: 400, height: 400, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -80, left: -80, width: 300, height: 300, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', pointerEvents: 'none' }} />

        <div style={{ ...container, position: 'relative' }}>
          <h2 style={{ fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 800, color: '#fff', letterSpacing: '-1px', marginBottom: 16, lineHeight: 1.1 }}>
            Ready to ship faster?
          </h2>
          <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.80)', marginBottom: 40, maxWidth: 460, margin: '0 auto 40px', lineHeight: 1.6 }}>
            Join thousands of teams managing their work in Hub.
          </p>
          <button
            onClick={() => nav('login')}
            style={{
              padding: '14px 36px', background: '#fff', color: BLUE,
              border: 'none', borderRadius: 10, fontSize: 17, fontWeight: 700,
              cursor: 'pointer', boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
              transition: 'all 0.15s', display: 'inline-flex', alignItems: 'center', gap: 6,
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.2)' }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.15)' }}
          >
            Start for Free <span style={{ fontSize: 18 }}>→</span>
          </button>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.60)', marginTop: 20, letterSpacing: 0.3 }}>
            No credit card required &nbsp;·&nbsp; Free forever for small teams
          </p>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ background: '#0f172a', padding: '48px 24px 32px' }}>
        <div style={{ ...container }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 24, marginBottom: 40 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <div style={{ width: 30, height: 30, background: BLUE, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 14, fontWeight: 800 }}>H</div>
                <span style={{ fontSize: 18, fontWeight: 700, color: '#fff', letterSpacing: '-0.5px' }}>Hub</span>
              </div>
              <p style={{ fontSize: 13, color: '#64748b', fontWeight: 500 }}>Built for teams who ship.</p>
            </div>
            <div style={{ display: 'flex', gap: 28, flexWrap: 'wrap' }}>
              {['Features', 'Roadmap', 'Pricing', 'Sign In'].map(link => (
                <button
                  key={link}
                  onClick={() => link === 'Sign In' ? nav('login') : undefined}
                  style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: 14, fontWeight: 500, cursor: 'pointer', padding: 0, transition: 'color 0.15s' }}
                  onMouseEnter={e => e.target.style.color = '#fff'}
                  onMouseLeave={e => e.target.style.color = '#94a3b8'}
                >
                  {link}
                </button>
              ))}
            </div>
          </div>
          <div style={{ borderTop: '1px solid #1e293b', paddingTop: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <p style={{ fontSize: 13, color: '#475569' }}>© 2026 Hub. All rights reserved.</p>
            <p style={{ fontSize: 12, color: '#334155' }}>A TrackKhub product</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({ icon, title, desc }) {
  const [hovered, setHovered] = useState(false)
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: '#fff',
        border: `1.5px solid ${hovered ? '#c7d7f8' : '#e2e8f0'}`,
        borderRadius: 12, padding: 24,
        boxShadow: hovered ? '0 8px 28px rgba(26,86,219,0.12)' : '0 2px 8px rgba(26,86,219,0.05)',
        transition: 'all 0.2s',
        transform: hovered ? 'translateY(-3px)' : 'translateY(0)',
        cursor: 'default',
      }}
    >
      <div style={{
        width: 44, height: 44, borderRadius: 10, background: BLUE_LIGHT,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 22, marginBottom: 14,
        transition: 'transform 0.2s',
        transform: hovered ? 'scale(1.1)' : 'scale(1)',
      }}>
        {icon}
      </div>
      <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>{title}</h3>
      <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.6 }}>{desc}</p>
    </div>
  )
}
