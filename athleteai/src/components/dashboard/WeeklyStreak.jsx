export function WeeklyStreak({ days = [] }) {
  const DAYS = ['M','T','W','T','F','S','S']
  return (
    <div style={{ display:'flex', gap:6, alignItems:'center' }}>
      {DAYS.map((d, i) => {
        const active = days.includes(i)
        return (
          <div key={i} style={{ textAlign:'center' }}>
            <div style={{ fontSize:10, color:'var(--text-muted)', marginBottom:4 }}>{d}</div>
            <div style={{
              width:28, height:28, borderRadius:6,
              background: active ? 'var(--accent)' : 'var(--bg-hover)',
              border: `1px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
              display:'flex', alignItems:'center', justifyContent:'center',
              fontSize:13,
            }}>
              {active ? '✓' : ''}
            </div>
          </div>
        )
      })}
    </div>
  )
}
