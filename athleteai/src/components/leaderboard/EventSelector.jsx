import { SPORTS } from '../../constants/sports'

export function EventSelector({ value, onChange }) {
  const events = SPORTS[0].events
  return (
    <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
      {events.slice(0, 7).map(e => {
        const active = value === e.id
        return (
          <button key={e.id} onClick={() => onChange(e.id)} style={{
            padding:'5px 14px', borderRadius:20, fontSize:12, fontWeight:500, cursor:'pointer',
            border:`1px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
            background: active ? 'var(--accent-dim)' : 'transparent',
            color: active ? 'var(--accent)' : 'var(--text-muted)',
            transition:'all 0.15s',
          }}>
            {e.name}
          </button>
        )
      })}
    </div>
  )
}
