const ALL = [
  { icon:'🥇', label:'Sub-benchmark', key:'sub_bench' },
  { icon:'🔥', label:'7-day streak',  key:'streak_7'  },
  { icon:'🏅', label:'Top 200 national', key:'top200' },
  { icon:'💪', label:'100km month',   key:'100km'     },
  { icon:'⭐', label:'SAI flagged',   key:'sai'       },
  { icon:'🎯', label:'PB broken',     key:'pb'        },
]

export function AchievementGrid({ earned = [] }) {
  return (
    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
      {ALL.map(a => {
        const got = earned.includes(a.key)
        return (
          <div key={a.key} style={{
            padding:'10px 8px', borderRadius:10, textAlign:'center',
            background: got ? 'rgba(245,158,11,.12)' : 'var(--bg-hover)',
            border: `1px solid ${got ? 'rgba(245,158,11,.25)' : 'var(--border)'}`,
            opacity: got ? 1 : 0.4,
          }}>
            <div style={{ fontSize:20, marginBottom:4 }}>{a.icon}</div>
            <div style={{ fontSize:10, color: got ? '#fbbf24' : 'var(--text-muted)', fontWeight:500 }}>{a.label}</div>
          </div>
        )
      })}
    </div>
  )
}
