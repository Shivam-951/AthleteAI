export function StatCard({ label, value, sub, color = 'var(--accent)', icon }) {
  return (
    <div style={{
      background: 'var(--bg-surface)',
      border: `1px solid ${color}25`,
      borderRadius: 12,
      padding: '14px 16px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {icon && <div style={{ position:'absolute', top:12, right:14, fontSize:20, opacity:0.4 }}>{icon}</div>}
      <div style={{ fontSize:12, color:'var(--text-muted)', fontWeight:500, marginBottom:6 }}>{label}</div>
      <div style={{ fontSize:26, fontWeight:700, letterSpacing:'-1px', color, lineHeight:1 }}>{value}</div>
      {sub && <div style={{ fontSize:12, color:'var(--text-muted)', marginTop:4 }}>{sub}</div>}
    </div>
  )
}
