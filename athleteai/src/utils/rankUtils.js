export function getRankLabel(rank) {
  if (rank === 1) return '🥇'
  if (rank === 2) return '🥈'
  if (rank === 3) return '🥉'
  return `#${rank}`
}

export function getPercentileLabel(pct) {
  if (pct >= 95) return 'Top 5%'
  if (pct >= 90) return 'Top 10%'
  if (pct >= 75) return 'Top 25%'
  if (pct >= 50) return 'Top 50%'
  return `Top ${100 - pct}%`
}

export function isSAIEligible(rankNational) {
  return rankNational !== null && rankNational <= 50
}
