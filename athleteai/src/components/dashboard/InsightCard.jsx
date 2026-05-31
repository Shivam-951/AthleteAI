export function InsightCard({ tag, text, icon = '🤖' }) {
  return (
    <div style={{
      background:'var(--bg-hover)', border:'1px solid var(--border)',
      borderRadius:10, padding:'12px 14px', marginBottom:10,
    }}>
      <div style={{ display:'flex', gap:10 }}>
        <span style={{ fontSize:16, marginTop:2 }}>{icon}</span>
        <div>
          <span style={{ display:'inline-block', background:'rgba(139,92,246,.15)', color:'#a78bfa',
            fontSize:11, fontWeight:600, padding:'2px 9px', borderRadius:20, marginBottom:6 }}>{tag}</span>
          <p style={{ fontSize:13, color:'var(--text)', margin:0, lineHeight:1.55 }}>{text}</p>
        </div>
      </div>
    </div>
  )
}
