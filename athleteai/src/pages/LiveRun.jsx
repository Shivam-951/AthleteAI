import { useState, useEffect, useRef } from 'react'
import { useNavigate }                  from 'react-router-dom'
import { workoutService }               from '../services/workoutService'
import {
  getDistance, calcPace, formatPace,
  formatTime, formatDistance, isValidPoint
} from '../utils/gps'
import toast from 'react-hot-toast'

const EVENTS = [
  { id: '800m',   name: '800m',          target: 800   },
  { id: '1500m',  name: '1500m',         target: 1500  },
  { id: '5000m',  name: '5K Run',        target: 5000  },
  { id: '10000m', name: '10K Run',       target: 10000 },
  { id: 'hm',     name: 'Half Marathon', target: 21097 },
  { id: 'custom', name: 'Free run',      target: null  },
]

const STATES = {
  IDLE:     'idle',
  RUNNING:  'running',
  PAUSED:   'paused',
  FINISHED: 'finished',
}

export function LiveRun() {
  const navigate = useNavigate()

  const [state,      setState]     = useState(STATES.IDLE)
  const [event,      setEvent]     = useState('5000m')
  const [distance,   setDistance]  = useState(0)
  const [elapsed,    setElapsed]   = useState(0)
  const [pace,       setPace]      = useState(null)
  const [speed,      setSpeed]     = useState(0)
  const [splits,     setSplits]    = useState([])
  const [gpsStatus,  setGpsStatus] = useState('idle')
  const [error,      setError]     = useState(null)
  const [saving,     setSaving]    = useState(false)

  const points      = useRef([])
  const lastPos     = useRef(null)
  const watchId     = useRef(null)
  const timerRef    = useRef(null)
  const startTime   = useRef(null)
  const pausedTime  = useRef(0)
  const lastKmMark  = useRef(0)

  const selectedEvent = EVENTS.find(e => e.id === event)
  const targetDist    = selectedEvent?.target

  // progress percentage
  const progress = targetDist
    ? Math.min(100, (distance / targetDist) * 100)
    : null

  // next km split
  const nextKm    = (Math.floor(distance / 1000) + 1) * 1000
  const toNextKm  = Math.max(0, nextKm - distance)

  function startRun() {
    setError(null)
    setGpsStatus('requesting')

    if (!navigator.geolocation) {
      setError('GPS not supported on this device')
      return
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGpsStatus('active')
        setState(STATES.RUNNING)

        startTime.current = Date.now()
        lastPos.current   = {
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
        }

        // start GPS watch
        watchId.current = navigator.geolocation.watchPosition(
          handlePosition,
          handleGpsError,
          {
            enableHighAccuracy: true,
            maximumAge:         2000,
            timeout:            10000,
          }
        )

        // start timer
        timerRef.current = setInterval(() => {
          setElapsed(Math.floor(
            (Date.now() - startTime.current - pausedTime.current) / 1000
          ))
        }, 1000)
      },
      (err) => {
        setGpsStatus('error')
        setError(
          err.code === 1
            ? 'GPS permission denied. Please allow location access.'
            : 'Cannot get GPS signal. Try going outside.'
        )
      },
      { enableHighAccuracy: true, timeout: 15000 }
    )
  }

  function handlePosition(pos) {
    const lat = pos.coords.latitude
    const lon = pos.coords.longitude
    const prev = lastPos.current

    if (!isValidPoint(lat, lon, prev?.lat, prev?.lon, 3)) return

    const segDist = prev
      ? getDistance(prev.lat, prev.lon, lat, lon)
      : 0

    lastPos.current = { lat, lon }
    points.current.push({ lat, lon, time: Date.now() })

    setDistance(d => {
      const newDist = d + segDist

      // record km splits
      const kmCrossed = Math.floor(newDist / 1000)
      if (kmCrossed > lastKmMark.current && kmCrossed > 0) {
        const splitTime = Math.floor(
          (Date.now() - startTime.current - pausedTime.current) / 1000
        )
        setSplits(s => [...s, {
          km:   kmCrossed,
          time: splitTime,
          pace: calcPace(1000, splitTime - (s[s.length - 1]?.time || 0)),
        }])
        lastKmMark.current = kmCrossed
      }

      // auto finish if target reached
      if (targetDist && newDist >= targetDist) {
        finishRun(newDist)
      }

      return newDist
    })

    // update live pace and speed
    const el = Math.floor(
      (Date.now() - startTime.current - pausedTime.current) / 1000
    )
    if (el > 5) {
      setDistance(d => {
        const p = calcPace(d, el)
        const s = d > 0 ? (d / el) * 3.6 : 0
        setPace(p)
        setSpeed(parseFloat(s.toFixed(1)))
        return d
      })
    }
  }

  function handleGpsError(err) {
    setGpsStatus('weak')
  }

  function pauseRun() {
    setState(STATES.PAUSED)
    clearInterval(timerRef.current)
    navigator.geolocation.clearWatch(watchId.current)
    pausedTime.current += Date.now() - startTime.current
  }

  function resumeRun() {
    setState(STATES.RUNNING)
    startTime.current = Date.now()
    pausedTime.current = 0

    watchId.current = navigator.geolocation.watchPosition(
      handlePosition, handleGpsError,
      { enableHighAccuracy: true, maximumAge: 2000 }
    )
    timerRef.current = setInterval(() => {
      setElapsed(e => e + 1)
    }, 1000)
  }

  function finishRun(finalDist) {
    clearInterval(timerRef.current)
    navigator.geolocation.clearWatch(watchId.current)
    setState(STATES.FINISHED)
  }

  async function saveRun() {
    setSaving(true)
    try {
      const finalDist   = distance
      const finalTime   = elapsed
      const today       = new Date().toISOString().split('T')[0]
      const avgPace     = calcPace(finalDist, finalTime)
      const avgSpeed    = finalDist > 0
        ? parseFloat(((finalDist / finalTime) * 3.6).toFixed(2))
        : 0
      const avgFatigue  = 5 // default — athlete can edit

      await workoutService.log({
        event_id:       event,
        session_date:   today,
        duration:       finalTime,
        distance:       finalDist,
        fatigue_level:  avgFatigue,
        notes:          `GPS tracked run. ${splits.length} km splits recorded. Avg speed: ${avgSpeed} km/h`,
      })

      toast.success('Run saved! 🎉')
      navigate('/dashboard')
    } catch (err) {
      toast.error('Failed to save run')
    } finally {
      setSaving(false)
    }
  }

  // cleanup on unmount
  useEffect(() => {
    return () => {
      clearInterval(timerRef.current)
      if (watchId.current) {
        navigator.geolocation.clearWatch(watchId.current)
      }
    }
  }, [])

  const gpsColor = {
    idle:      'var(--text-muted)',
    requesting:'var(--gold)',
    active:    'var(--green)',
    weak:      'var(--gold)',
    error:     'var(--red)',
  }[gpsStatus]

  const gpsLabel = {
    idle:      'GPS ready',
    requesting:'Getting GPS signal…',
    active:    'GPS active',
    weak:      'GPS signal weak',
    error:     'GPS error',
  }[gpsStatus]

  return (
    <div style={{
      minHeight:  '100vh',
      background: 'var(--bg-primary)',
      display:    'flex',
      flexDirection: 'column',
    }}>
      {/* Header */}
      <div style={{
        padding:      '16px 24px',
        borderBottom: '1px solid var(--border)',
        display:      'flex',
        alignItems:   'center',
        justifyContent: 'space-between',
        background:   'var(--bg-surface)',
      }}>
        <span style={{ fontSize: 18, fontWeight: 700 }}>
          ⚡ Athlete<span style={{ color: 'var(--accent)' }}>AI</span>
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 8, height: 8, borderRadius: '50%',
            background: gpsColor,
            boxShadow:  gpsStatus === 'active'
              ? `0 0 6px ${gpsColor}` : 'none',
          }} />
          <span style={{ fontSize: 12, color: gpsColor }}>
            {gpsLabel}
          </span>
        </div>
      </div>

      <div style={{ flex: 1, padding: '24px', maxWidth: 480,
        margin: '0 auto', width: '100%' }}>

        {/* IDLE state — event selector */}
        {state === STATES.IDLE && (
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700,
              letterSpacing: '-0.5px', marginBottom: 6 }}>
              Live run tracker 🏃
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: 13,
              marginBottom: 24 }}>
              GPS tracks your distance, pace and speed automatically
            </p>

            <div className="section-title">Select event</div>
            <div style={{ display: 'grid',
              gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 24 }}>
              {EVENTS.map(e => (
                <button key={e.id} onClick={() => setEvent(e.id)} style={{
                  padding: '12px 16px', borderRadius: 10,
                  border: `1px solid ${event === e.id
                    ? 'var(--accent)' : 'var(--border)'}`,
                  background: event === e.id
                    ? 'var(--accent-dim)' : 'var(--bg-surface)',
                  color: event === e.id
                    ? 'var(--accent)' : 'var(--text)',
                  fontWeight: event === e.id ? 600 : 400,
                  fontSize: 13, cursor: 'pointer',
                  textAlign: 'left', fontFamily: 'inherit',
                }}>
                  <div>{e.name}</div>
                  {e.target && (
                    <div style={{ fontSize: 11,
                      color: 'var(--text-muted)', marginTop: 2 }}>
                      {(e.target / 1000).toFixed(e.target < 1000 ? 1 : 0)} km
                    </div>
                  )}
                </button>
              ))}
            </div>

            {error && (
              <div style={{
                background: 'rgba(239,68,68,.1)',
                border: '1px solid rgba(239,68,68,.3)',
                borderRadius: 10, padding: '12px 14px',
                fontSize: 13, color: 'var(--red)', marginBottom: 16,
              }}>
                ⚠️ {error}
              </div>
            )}

            <div style={{
              background: 'rgba(14,165,233,.06)',
              border: '1px solid rgba(14,165,233,.15)',
              borderRadius: 10, padding: '12px 14px',
              fontSize: 12, color: 'var(--text-muted)',
              marginBottom: 24, lineHeight: 1.6,
            }}>
              📍 GPS works best outdoors with clear sky.
              Allow location permission when prompted.
              Keep screen on during your run.
            </div>

            <button className="btn-primary"
              onClick={startRun}
              style={{ width: '100%', justifyContent: 'center',
                fontSize: 16, padding: '14px' }}>
              {gpsStatus === 'requesting'
                ? '📡 Getting GPS signal…'
                : '▶ Start run'}
            </button>
          </div>
        )}

        {/* RUNNING / PAUSED state */}
        {(state === STATES.RUNNING || state === STATES.PAUSED) && (
          <div>
            {/* Main metrics */}
            <div style={{ textAlign: 'center', padding: '24px 0' }}>
              <div style={{
                fontSize: 72, fontWeight: 800,
                letterSpacing: '-3px', lineHeight: 1,
                color: 'var(--text)',
                fontFamily: 'DM Mono, monospace',
              }}>
                {formatDistance(distance)}
              </div>
              <div style={{ fontSize: 14, color: 'var(--text-muted)',
                marginTop: 4 }}>
                distance
              </div>
            </div>

            {/* Progress bar */}
            {targetDist && (
              <div style={{ marginBottom: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between',
                  fontSize: 11, color: 'var(--text-muted)', marginBottom: 6 }}>
                  <span>{formatDistance(distance)}</span>
                  <span>{formatDistance(targetDist)}</span>
                </div>
                <div style={{ height: 6, background: 'var(--bg-hover)',
                  borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{
                    height: '100%',
                    width:  `${progress}%`,
                    background: 'var(--accent)',
                    borderRadius: 3,
                    transition: 'width 1s linear',
                  }} />
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)',
                  marginTop: 4, textAlign: 'right' }}>
                  {formatDistance(toNextKm)} to next km
                </div>
              </div>
            )}

            {/* Secondary metrics */}
            <div style={{ display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 24 }}>
              {[
                {
                  label: 'Time',
                  value: formatTime(elapsed),
                  color: 'var(--text)',
                },
                {
                  label: 'Pace',
                  value: formatPace(pace),
                  color: 'var(--green)',
                },
                {
                  label: 'Speed',
                  value: `${speed} km/h`,
                  color: 'var(--accent)',
                },
              ].map((m, i) => (
                <div key={i} className="card-sm"
                  style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)',
                    marginBottom: 4 }}>{m.label}</div>
                  <div style={{ fontSize: 18, fontWeight: 700,
                    color: m.color, fontFamily: 'DM Mono, monospace' }}>
                    {m.value}
                  </div>
                </div>
              ))}
            </div>

            {/* Km splits */}
            {splits.length > 0 && (
              <div className="card" style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 13, fontWeight: 500,
                  marginBottom: 10 }}>
                  Km splits
                </div>
                {splits.map((s, i) => (
                  <div key={i} style={{
                    display: 'flex', justifyContent: 'space-between',
                    padding: '6px 0',
                    borderBottom: i < splits.length - 1
                      ? '1px solid var(--border)' : 'none',
                    fontSize: 13,
                  }}>
                    <span style={{ color: 'var(--text-muted)' }}>
                      km {s.km}
                    </span>
                    <span style={{ fontFamily: 'DM Mono', fontWeight: 500 }}>
                      {formatPace(s.pace)} /km
                    </span>
                    <span style={{ color: 'var(--text-muted)' }}>
                      {formatTime(s.time)}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Paused indicator */}
            {state === STATES.PAUSED && (
              <div style={{
                textAlign: 'center', padding: '12px',
                background: 'rgba(245,158,11,.1)',
                border: '1px solid rgba(245,158,11,.2)',
                borderRadius: 10, marginBottom: 16,
                color: 'var(--gold)', fontSize: 13, fontWeight: 500,
              }}>
                ⏸ Run paused
              </div>
            )}

            {/* Controls */}
            <div style={{ display: 'grid',
              gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {state === STATES.RUNNING ? (
                <button className="btn-ghost" onClick={pauseRun}
                  style={{ justifyContent: 'center', padding: '14px' }}>
                  ⏸ Pause
                </button>
              ) : (
                <button className="btn-primary" onClick={resumeRun}
                  style={{ justifyContent: 'center', padding: '14px' }}>
                  ▶ Resume
                </button>
              )}
              <button onClick={() => finishRun(distance)}
                style={{
                  padding: '14px', borderRadius: 8,
                  border: '1px solid rgba(239,68,68,.4)',
                  background: 'rgba(239,68,68,.1)',
                  color: 'var(--red)', fontSize: 14,
                  fontWeight: 500, cursor: 'pointer',
                  fontFamily: 'inherit',
                  justifyContent: 'center',
                }}>
                ⏹ Finish
              </button>
            </div>
          </div>
        )}

        {/* FINISHED state */}
        {state === STATES.FINISHED && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <div style={{ fontSize: 40, marginBottom: 8 }}>🏁</div>
              <h2 style={{ fontSize: 22, fontWeight: 700,
                letterSpacing: '-0.5px', margin: '0 0 6px' }}>
                Run complete!
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: 13,
                margin: 0 }}>
                Great effort — here's your summary
              </p>
            </div>

            {/* Final stats */}
            <div style={{ display: 'grid',
              gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
              {[
                {
                  label: 'Distance',
                  value: formatDistance(distance),
                  color: 'var(--accent)',
                },
                {
                  label: 'Time',
                  value: formatTime(elapsed),
                  color: 'var(--text)',
                },
                {
                  label: 'Avg pace',
                  value: formatPace(calcPace(distance, elapsed)),
                  color: 'var(--green)',
                },
                {
                  label: 'Avg speed',
                  value: distance > 0
                    ? `${((distance / elapsed) * 3.6).toFixed(1)} km/h`
                    : '—',
                  color: 'var(--gold)',
                },
              ].map((m, i) => (
                <div key={i} className="card-sm" style={{ textAlign:'center' }}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)',
                    marginBottom: 4 }}>{m.label}</div>
                  <div style={{ fontSize: 22, fontWeight: 700,
                    color: m.color }}>{m.value}</div>
                </div>
              ))}
            </div>

            {/* Splits summary */}
            {splits.length > 0 && (
              <div className="card" style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 13, fontWeight: 500,
                  marginBottom: 10 }}>
                  Km splits
                </div>
                {splits.map((s, i) => {
                  const isFirst = i === 0
                  const isFastest = splits.every(
                    x => s.pace <= x.pace
                  )
                  return (
                    <div key={i} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      padding: '7px 0',
                      borderBottom: i < splits.length - 1
                        ? '1px solid var(--border)' : 'none',
                      fontSize: 13,
                    }}>
                      <span style={{ color: 'var(--text-muted)' }}>
                        km {s.km}
                      </span>
                      <span style={{
                        fontFamily: 'DM Mono', fontWeight: 600,
                        color: isFastest ? 'var(--green)' : 'var(--text)',
                      }}>
                        {formatPace(s.pace)} /km
                        {isFastest && (
                          <span style={{ fontSize: 10,
                            color: 'var(--green)', marginLeft: 4 }}>
                            fastest
                          </span>
                        )}
                      </span>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Personal best check */}
            {targetDist && distance >= targetDist * 0.95 && (
              <div style={{
                background: 'rgba(16,185,129,.08)',
                border: '1px solid rgba(16,185,129,.2)',
                borderRadius: 10, padding: '12px 14px',
                fontSize: 13, marginBottom: 16,
                color: 'var(--green)',
              }}>
                🎯 Check your dashboard to see if this is a new personal best!
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column',
              gap: 10 }}>
              <button className="btn-primary" onClick={saveRun}
                disabled={saving}
                style={{ justifyContent: 'center', padding: '14px',
                  fontSize: 15 }}>
                {saving ? 'Saving…' : '💾 Save run'}
              </button>
              <button className="btn-ghost"
                onClick={() => {
                  setDistance(0); setElapsed(0); setPace(null)
                  setSpeed(0); setSplits([])
                  points.current = []; lastPos.current = null
                  lastKmMark.current = 0; pausedTime.current = 0
                  setState(STATES.IDLE)
                }}
                style={{ justifyContent: 'center' }}>
                Discard run
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}