import { useState, useEffect } from 'react'
import { PageWrapper }          from '../components/layout/PageWrapper'
import { aiService }            from '../services/aiService'
import { aiService as ai }      from '../services/aiService'
import toast                    from 'react-hot-toast'

const INTENSITY_COLORS = {
  High:   'var(--gold)',
  Medium: 'var(--accent)',
  Low:    'var(--green)',
  Off:    'var(--text-muted)',
  Max:    'var(--red)',
}

export function Training() {
  const [plan,     setPlan]     = useState(null)
  const [recovery, setRecovery] = useState(null)
  const [loading,  setLoading]  = useState(true)
  const [done,     setDone]     = useState({})

  useEffect(() => {
    loadAll()
  }, [])

  async function loadAll() {
    setLoading(true)
    try {
      const [r, p] = await Promise.all([
        aiService.recovery(),
        aiService.trainingPlan({ recovery_score: 70 }),
      ])
      setRecovery(r)
      setPlan(p)
    } catch (err) {
      console.error(err)
      toast.error('Failed to load training plan')
    } finally {
      setLoading(false)
    }
  }

  async function regenerate() {
    setLoading(true)
    setDone({})
    try {
      const p = await aiService.trainingPlan({
        recovery_score: recovery?.recovery_score || 70
      })
      setPlan(p)
      toast.success('Plan regenerated!')
    } catch {
      toast.error('Failed to regenerate plan')
    } finally {
      setLoading(false)
    }
  }

  function toggleDone(day) {
    setDone(d => ({ ...d, [day]: !d[day] }))
  }

  const days       = plan?.days || []
  const doneCount  = Object.values(done).filter(Boolean).length
  const totalDays  = days.filter(d => d.intensity !== 'Off').length

  if (loading) return (
    <PageWrapper>
      <div style={{ textAlign: 'center', padding: '80px 0',
        color: 'var(--text-muted)', fontSize: 14 }}>
        Generating your training plan…
      </div>
    </PageWrapper>
  )

  return (
    <PageWrapper>
      <div style={{ display: 'flex', alignItems: 'flex-start',
        justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 className="page-title">Training plan 💪</h1>
          <p className="page-sub">
            {plan?.event?.toUpperCase()} focus ·{' '}
            {plan?.level} · Recovery {recovery?.recovery_score || 0}%
          </p>
        </div>
        <button className="btn-ghost" onClick={regenerate} disabled={loading}>
          🔄 Regenerate plan
        </button>
      </div>

      {/* Week focus */}
      <div className="card" style={{ marginBottom: 16,
        background: 'rgba(139,92,246,.06)',
        borderColor: 'rgba(139,92,246,.2)' }}>
        <div style={{ display: 'flex', gap: 14 }}>
          <span style={{ fontSize: 24 }}>🤖</span>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>
              This week's focus
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-muted)',
              margin: 0, lineHeight: 1.6 }}>
              {plan?.week_focus}
            </p>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="card" style={{ marginBottom: 20,
        display: 'flex', alignItems: 'center', gap: 20 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between',
            marginBottom: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 500 }}>
              Week progress
            </span>
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              {doneCount} / {totalDays} sessions
            </span>
          </div>
          <div style={{ height: 6, background: 'var(--bg-hover)',
            borderRadius: 3, overflow: 'hidden' }}>
            <div style={{
              height: '100%',
              width: totalDays > 0
                ? `${(doneCount / totalDays) * 100}%` : '0%',
              background: 'var(--green)',
              borderRadius: 3,
              transition: 'width 0.4s',
            }} />
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 22, fontWeight: 700,
            color: 'var(--green)' }}>
            {totalDays > 0
              ? Math.round((doneCount / totalDays) * 100) : 0}%
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
            complete
          </div>
        </div>
      </div>

      {/* Daily plan */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {days.map((day, i) => {
          const color   = INTENSITY_COLORS[day.intensity] || 'var(--text-muted)'
          const isDone  = done[day.day]
          const isToday = new Date().toLocaleDateString(
            'en-US', { weekday: 'long' }) === day.day

          return (
            <div key={i} className="card" style={{
              opacity:     isDone ? 0.6 : 1,
              borderColor: isToday ? 'var(--accent)' : 'var(--border)',
              borderLeftWidth: isToday ? 3 : 1,
              transition: 'opacity 0.3s',
            }}>
              <div style={{ display: 'flex', alignItems: 'center',
                justifyContent: 'space-between', marginBottom: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  {isToday && (
                    <span className="badge badge-blue"
                      style={{ fontSize: 10 }}>TODAY</span>
                  )}
                  <span style={{ fontSize: 14, fontWeight: 600 }}>
                    {day.day}
                  </span>
                  <span style={{
                    background: `${color}18`, color,
                    fontSize: 11, fontWeight: 600,
                    padding: '2px 10px', borderRadius: 20,
                  }}>{day.type}</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{
                    background: `${color}12`, color,
                    fontSize: 10, fontWeight: 600,
                    padding: '2px 9px', borderRadius: 20,
                  }}>{day.intensity}</span>
                  {day.intensity !== 'Off' && (
                    <button onClick={() => toggleDone(day.day)} style={{
                      padding: '4px 12px', borderRadius: 20,
                      fontSize: 11, fontWeight: 500, cursor: 'pointer',
                      border: `1px solid ${isDone
                        ? 'var(--green)' : 'var(--border)'}`,
                      background: isDone
                        ? 'rgba(16,185,129,.12)' : 'transparent',
                      color: isDone ? 'var(--green)' : 'var(--text-muted)',
                      transition: 'all 0.15s',
                    }}>
                      {isDone ? '✓ Done' : 'Mark done'}
                    </button>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {day.sessions?.map((s, j) => (
                  <span key={j} style={{
                    fontSize: 12, color: 'var(--text-muted)',
                    background: 'var(--bg-hover)',
                    padding: '4px 12px', borderRadius: 20,
                  }}>{s}</span>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </PageWrapper>
  )
}