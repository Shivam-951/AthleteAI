export function formatSeconds(s) {
  if (!s) return '--'
  if (s < 60) return `${s.toFixed(2)}s`
  const m = Math.floor(s / 60)
  const sec = (s % 60).toFixed(1)
  return `${m}:${sec.padStart(4,'0')}`
}

export function formatPace(secPerKm) {
  if (!secPerKm) return '--'
  const m = Math.floor(secPerKm / 60)
  const s = Math.round(secPerKm % 60)
  return `${m}:${String(s).padStart(2,'0')} /km`
}

export function relativeTime(isoDate) {
  const diff = Date.now() - new Date(isoDate)
  const days = Math.floor(diff / 86400000)
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 7)  return `${days} days ago`
  return new Date(isoDate).toLocaleDateString('en-IN', { day:'numeric', month:'short' })
}
