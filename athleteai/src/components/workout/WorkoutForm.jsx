import { useState }      from 'react'
import { Button }        from '../ui/Button'
import { SPORTS }        from '../../constants/sports'
import { formatSeconds } from '../../utils/formatTime'
import { getPace }       from '../../utils/calcPace'

const events = SPORTS[0].events

export function WorkoutForm({ onSubmit, loading }) {
  const [form, setForm] = useState({
    event_id: '100m', duration: '', distance: '', heart_rate_avg: '',
    fatigue_level: 5, notes: '', session_date: new Date().toISOString().split('T')[0],
  })

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const ev  = events.find(e => e.id === form.event_id)

  function handleSubmit(e) {
    e.preventDefault()
    onSubmit({
      ...form,
      duration:   parseFloat(form.duration),
      distance:   form.distance ? parseFloat(form.distance) * 1000 : null,
      heart_rate_avg: form.heart_rate_avg ? parseInt(form.heart_rate_avg) : null,
    })
  }

  const pace = form.duration && form.distance
    ? getPace(parseFloat(form.distance) * 1000, parseFloat(form.duration))
    : null

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:16 }}>
        <div>
          <label className="input-label">Event</label>
          <select value={form.event_id} onChange={e => set('event_id', e.target.value)}>
            {events.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
          </select>
        </div>
        <div>
          <label className="input-label">Date</label>
          <input type="date" value={form.session_date} onChange={e => set('session_date', e.target.value)} />
        </div>
        <div>
          <label className="input-label">Time (seconds)</label>
          <input type="number" placeholder="e.g. 11.24" step="0.01" value={form.duration} onChange={e => set('duration', e.target.value)} required />
        </div>
        <div>
          <label className="input-label">Distance (km) — optional for field events</label>
          <input type="number" placeholder="e.g. 0.1" step="0.001" value={form.distance} onChange={e => set('distance', e.target.value)} />
        </div>
        <div>
          <label className="input-label">Avg heart rate (bpm)</label>
          <input type="number" placeholder="e.g. 172" value={form.heart_rate_avg} onChange={e => set('heart_rate_avg', e.target.value)} />
        </div>
        <div>
          <label className="input-label">Fatigue level — {form.fatigue_level}/10</label>
          <input type="range" min="1" max="10" step="1" value={form.fatigue_level}
            onChange={e => set('fatigue_level', parseInt(e.target.value))} />
        </div>
      </div>

      {pace && (
        <div className="card-sm" style={{ marginBottom:16, display:'flex', gap:24 }}>
          <div><span style={{ fontSize:11, color:'var(--text-muted)' }}>PACE</span><br />
            <span style={{ fontWeight:600, color:'var(--green)' }}>{Math.floor(pace/60)}:{String(Math.round(pace%60)).padStart(2,'0')} /km</span>
          </div>
          <div><span style={{ fontSize:11, color:'var(--text-muted)' }}>TIME</span><br />
            <span style={{ fontWeight:600 }}>{formatSeconds(parseFloat(form.duration))}</span>
          </div>
        </div>
      )}

      <div style={{ marginBottom:16 }}>
        <label className="input-label">Notes</label>
        <textarea rows={2} placeholder="How did it feel? Track conditions, weather…"
          value={form.notes} onChange={e => set('notes', e.target.value)}
          style={{ resize:'vertical' }} />
      </div>

      <Button type="submit" disabled={loading}>{loading ? 'Logging…' : '⚡ Log session'}</Button>
    </form>
  )
}
