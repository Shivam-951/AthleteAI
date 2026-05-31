import { useState, useEffect } from 'react'
import { PageWrapper }          from '../components/layout/PageWrapper'
import { WorkoutForm }          from '../components/workout/WorkoutForm'
import { SessionCard }          from '../components/workout/SessionCard'
import { Modal }                from '../components/ui/Modal'
import { workoutService }       from '../services/workoutService'
import toast                    from 'react-hot-toast'

export function LogWorkout() {
  const [sessions, setSessions] = useState([])
  const [loading,  setLoading]  = useState(false)
  const [logged,   setLogged]   = useState(null)

  useEffect(() => {
    workoutService.list()
      .then(setSessions)
      .catch(() => {})
  }, [])

  async function handleLog(data) {
    setLoading(true)
    try {
      const w = await workoutService.log(data)
      setSessions(prev => [w, ...prev])
      setLogged(w)
    } catch (err) {
      toast.error(err || 'Failed to log session')
    } finally {
      setLoading(false)
    }
  }

  return (
    <PageWrapper>
      <div style={{ maxWidth: 680, margin: '0 auto' }}>
        <div style={{ marginBottom: 24 }}>
          <h1 className="page-title">Log a session ➕</h1>
          <p className="page-sub">
            Record your workout — time, distance, heart rate and fatigue
          </p>
        </div>

        {/* Tips */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
          gap: 10, marginBottom: 20 }}>
          {[
            { icon: '⏱️', text: 'Use a stopwatch for accurate split times' },
            { icon: '📍', text: 'Log immediately after your session' },
            { icon: '✅', text: 'Ask coach to verify for leaderboard ranking' },
          ].map((t, i) => (
            <div key={i} className="card-sm"
              style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <span style={{ fontSize: 18 }}>{t.icon}</span>
              <span style={{ fontSize: 12, color: 'var(--text-muted)',
                lineHeight: 1.5 }}>{t.text}</span>
            </div>
          ))}
        </div>

        {/* Form */}
        <div className="card" style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 18 }}>
            Session details
          </div>
          <WorkoutForm onSubmit={handleLog} loading={loading} />
        </div>

        {/* Recent sessions */}
        {sessions.length > 0 && (
          <div>
            <div className="section-title">Recent sessions</div>
            {sessions.slice(0, 5).map(s =>
              <SessionCard key={s.id} session={s} />)}
          </div>
        )}

        {/* Success modal */}
        <Modal open={!!logged} onClose={() => setLogged(null)}
          title="✅ Session logged!">
          {logged && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr',
                gap: 12, marginBottom: 16 }}>
                {[
                  { label: 'Event',    value: logged.event_id?.toUpperCase() },
                  { label: 'Time',     value: `${logged.duration}s` },
                  { label: 'Fatigue',  value: `${logged.fatigue_level}/10` },
                  { label: 'Date',     value: logged.session_date },
                ].map((f, i) => (
                  <div key={i} className="card-sm">
                    <div style={{ fontSize: 11, color: 'var(--text-muted)',
                      marginBottom: 2 }}>{f.label}</div>
                    <div style={{ fontSize: 15, fontWeight: 600 }}>{f.value}</div>
                  </div>
                ))}
              </div>
              <div style={{ background: 'rgba(245,158,11,.08)',
                border: '1px solid rgba(245,158,11,.2)',
                borderRadius: 10, padding: '12px 14px',
                fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5 }}>
                💡 <strong style={{ color: 'var(--text)' }}>Next step:</strong>{' '}
                Ask your coach to verify this session. Verified sessions
                count toward your national leaderboard ranking.
              </div>
            </div>
          )}
        </Modal>
      </div>
    </PageWrapper>
  )
}