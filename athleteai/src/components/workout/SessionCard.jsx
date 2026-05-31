import { formatSeconds, relativeTime } from '../../utils/formatTime'
import { SPORTS }                       from '../../constants/sports'

const events = SPORTS[0].events

export function SessionCard({ session }) {
  const ev = events.find(e => e.id === session.event_id)
  return (
    <div className="card-sm" style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8 }}>
      <div style={{ display:'flex', gap:14, alignItems:'center' }}>
        <div style={{
          width:40, height:40, borderRadius:10,
          background:'var(--accent-dim)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18,
        }}>🏃</div>
        <div>
          <div style={{ fontSize:14, fontWeight:500 }}>{ev?.name || session.event_id}</div>
          <div style={{ fontSize:12, color:'var(--text-muted)' }}>{relativeTime(session.session_date)}</div>
        </div>
      </div>
      <div style={{ display:'flex', gap:20, alignItems:'center' }}>
        <div style={{ textAlign:'right' }}>
          <div style={{ fontSize:16, fontWeight:700, fontFamily:'DM Mono' }}>{formatSeconds(session.duration)}</div>
          {session.pace && <div style={{ fontSize:11, color:'var(--text-muted)' }}>Pace: {session.pace}</div>}
        </div>
        {session.coach_verified
          ? <span className="badge badge-green">✓ Verified</span>
          : <span className="badge badge-gray">Unverified</span>}
      </div>
    </div>
  )
}
