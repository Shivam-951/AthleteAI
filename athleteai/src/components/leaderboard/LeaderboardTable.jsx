import { getRankLabel } from '../../utils/rankUtils'

export function LeaderboardTable({ entries = [], currentUserId }) {
  return (
    <div className="card" style={{ padding:0, overflow:'hidden' }}>
      <div style={{
        display:'grid', gridTemplateColumns:'44px 1fr 80px 80px 80px 90px',
        padding:'10px 16px', borderBottom:'1px solid var(--border)',
      }}>
        {['Rank','Athlete','State','Time','Age','Status'].map(h => (
          <span key={h} style={{ fontSize:11, color:'var(--text-muted)', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.06em' }}>{h}</span>
        ))}
      </div>
      {entries.map(a => {
        const isMe = a.user_id === currentUserId
        return (
          <div key={a.rank} style={{
            display:'grid', gridTemplateColumns:'44px 1fr 80px 80px 80px 90px',
            alignItems:'center', padding:'11px 16px',
            background: isMe ? 'rgba(14,165,233,.08)' : 'transparent',
            borderBottom:'1px solid var(--border)',
            borderLeft: isMe ? '2px solid var(--accent)' : '2px solid transparent',
          }}>
            <span style={{ fontWeight:700, color: a.rank <= 3 ? 'var(--gold)' : 'var(--text-muted)', fontSize: a.rank <= 3 ? 15 : 12 }}>
              {getRankLabel(a.rank)}
            </span>
            <span style={{ fontSize:13, fontWeight: isMe ? 600 : 400, color: isMe ? 'var(--accent)' : 'var(--text)' }}>
              {a.name}{isMe && <span className="badge badge-blue" style={{ marginLeft:6 }}>you</span>}
            </span>
            <span style={{ fontSize:12, color:'var(--text-muted)' }}>{a.state}</span>
            <span style={{ fontSize:13, fontWeight:600, fontFamily:'DM Mono', color:'var(--text)' }}>{a.time}s</span>
            <span style={{ fontSize:12, color:'var(--text-muted)' }}>{a.age_group}</span>
            <span>
              {a.verified
                ? <span className="badge badge-green">✓ Verified</span>
                : <span className="badge badge-gray">Pending</span>}
            </span>
          </div>
        )
      })}
    </div>
  )
}
