// Haversine formula — calculates distance between two GPS coordinates
// Returns distance in meters
export function getDistance(lat1, lon1, lat2, lon2) {
  const R    = 6371000 // Earth radius in meters
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

function toRad(deg) {
  return deg * (Math.PI / 180)
}

// Calculate pace in seconds per km
export function calcPace(distanceM, elapsedSeconds) {
  if (!distanceM || distanceM < 10) return null
  return (elapsedSeconds / (distanceM / 1000))
}

// Format pace as mm:ss /km
export function formatPace(secPerKm) {
  if (!secPerKm || secPerKm > 1800) return '--:--'
  const m = Math.floor(secPerKm / 60)
  const s = Math.round(secPerKm % 60)
  return `${m}:${String(s).padStart(2, '0')}`
}

// Format elapsed time as hh:mm:ss or mm:ss
export function formatTime(seconds) {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)
  if (h > 0) {
    return `${h}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`
  }
  return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`
}

// Format distance nicely
export function formatDistance(meters) {
  if (meters < 1000) return `${Math.round(meters)}m`
  return `${(meters / 1000).toFixed(2)} km`
}

// Check if GPS point is valid (filter out bad readings)
export function isValidPoint(lat, lon, prevLat, prevLon, elapsedSec = 3) {
  if (!lat || !lon) return false
  if (lat === prevLat && lon === prevLon) return false

  // filter out impossible speeds — more than 12 m/s = 43 km/h
  // no distance runner runs faster than this
  if (prevLat && prevLon) {
    const dist  = getDistance(prevLat, prevLon, lat, lon)
    const speed = dist / elapsedSec // m/s
    if (speed > 12) return false // GPS glitch
  }

  return true
}