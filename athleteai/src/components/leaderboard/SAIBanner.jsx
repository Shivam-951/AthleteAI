export function SAIBanner({ rank, threshold = 50 }) {
  const eligible = rank && rank <= threshold
  const spotsAway = rank ? Math.max(0, rank - threshold) : null

  return (
    <div style={{
      background:'rgba(14,165,233,.06)', border:'1px solid rgba(14,165,233,.2)',
      borderRadius:12, padding:'16px 20px', display:'flex', gap:16, alignItems:'flex-start',
    }}>
      <span style={{ fontSize:28 }}>🏛️</span>
      <div>
        <div style={{ fontSize:14, fontWeight:600, marginBottom:4 }}>SAI talent identification</div>
        <p style={{ fontSize:13, color:'var(--text-muted)', margin:'0 0 10px', lineHeight:1.6 }}>
          Athletes ranked in the top {threshold} nationally are eligible for SAI deep verification.
          Once flagged, your coach countersigns your sessions and SAI scouts can review your profile.
        </p>
        {eligible
          ? <span className="badge badge-green">✅ SAI eligible — you are in the top {threshold}</span>
          : spotsAway !== null
            ? <span className="badge badge-blue">📍 {spotsAway} spots away from SAI eligibility (top {threshold})</span>
            : <span className="badge badge-gray">Log verified sessions to appear on the leaderboard</span>
        }
      </div>
    </div>
  )
}
