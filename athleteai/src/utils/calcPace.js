export function getPace(distanceM, durationSec) {
  if (!distanceM || !durationSec) return null
  return (durationSec / (distanceM / 1000))
}

export function getSpeed(distanceM, durationSec) {
  if (!distanceM || !durationSec) return null
  return ((distanceM / 1000) / (durationSec / 3600))
}

export function estimateCalories(weightKg, durationSec, activityMET = 8) {
  return Math.round((activityMET * weightKg * (durationSec / 3600)))
}
