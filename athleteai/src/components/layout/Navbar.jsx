import { Link, useLocation } from 'react-router-dom'
import { useAuth }           from '../../hooks/useAuth'

const LINKS = [
  { to: '/dashboard',   label: 'Dashboard',   icon: '⚡' },
  { to: '/log',         label: 'Log workout',  icon: '➕' },
  { to: '/leaderboard', label: 'Leaderboard',  icon: '🏆' },
  { to: '/training',    label: 'Training',     icon: '💪' },
  { to: '/analytics',   label: 'Analytics',    icon: '📊' },
  {to:  '/run',         label: 'Live Run',     icon: '📍'},
]

export function Navbar() {
  const { pathname } = useLocation()
  const { user, signOut } = useAuth()

  return (
    <nav style={{
      background: 'var(--bg-surface)',
      borderBottom: '1px solid var(--border)',
      padding: '0 24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      height: 56,
      position: 'sticky',
      top: 0,
      zIndex: 40,
    }}>
      <Link to="/dashboard" style={{ textDecoration:'none', display:'flex', alignItems:'center', gap:8 }}>
        <span style={{ fontSize:20 }}>⚡</span>
        <span style={{ fontSize:18, fontWeight:700, letterSpacing:'-0.5px', color:'var(--text)' }}>
          Athlete<span style={{ color:'var(--accent)' }}>AI</span>
        </span>
      </Link>

      <div style={{ display:'flex', gap:4 }}>
        {LINKS.map(l => {
          const active = pathname === l.to
          return (
            <Link key={l.to} to={l.to} style={{
              textDecoration: 'none',
              padding: '6px 14px',
              borderRadius: 8,
              fontSize: 13,
              fontWeight: active ? 500 : 400,
              background: active ? 'var(--accent-dim)' : 'transparent',
              color: active ? 'var(--accent)' : 'var(--text-muted)',
              transition: 'all 0.15s',
            }}>
              {l.icon} {l.label}
            </Link>
          )
        })}
      </div>

      <div style={{ display:'flex', alignItems:'center', gap:12 }}>
        <span style={{ fontSize:12, color:'var(--text-muted)' }}>{user?.name}</span>
        <div style={{
          width:32, height:32, borderRadius:'50%',
          background:'linear-gradient(135deg, var(--accent), var(--purple))',
          display:'flex', alignItems:'center', justifyContent:'center',
          fontSize:13, fontWeight:600, color:'#fff', cursor:'pointer',
        }} onClick={signOut} title="Sign out">
          {user?.name?.charAt(0) || 'A'}
        </div>
      </div>
    </nav>
  )
}
