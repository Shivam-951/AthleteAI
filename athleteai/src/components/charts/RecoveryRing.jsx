export function RecoveryRing({ score = 0, size = 80 }) {
  const r   = (size / 2) - 8
  const circ = 2 * Math.PI * r
  const pct  = Math.max(0, Math.min(100, score))
  const fill  = circ - (pct / 100) * circ
  const color = pct >= 70 ? 'var(--green)' : pct >= 40 ? 'var(--gold)' : 'var(--red)'

  return (
    <svg width={size} height={size} style={{ transform:'rotate(-90deg)' }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--border)" strokeWidth={7} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={7}
        strokeDasharray={circ} strokeDashoffset={fill} strokeLinecap="round"
        style={{ transition:'stroke-dashoffset 1s ease' }} />
      <text x={size/2} y={size/2} textAnchor="middle" dominantBaseline="central"
        style={{ transform:'rotate(90deg)', transformOrigin:'center', fontSize:16, fontWeight:700, fill:color, fontFamily:'DM Sans' }}>
        {pct}
      </text>
    </svg>
  )
}
