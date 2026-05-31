import { useState }       from 'react'
import { useNavigate }    from 'react-router-dom'
import { authService }    from '../services/authService'
import { useAuthStore }   from '../store/authStore'
import { SPORTS, AGE_GROUPS, EXPERIENCE_LEVELS, FITNESS_GOALS } from '../constants/sports'
import { INDIA_STATES }   from '../constants/states'
import toast              from 'react-hot-toast'

const STEPS = ['Basic info', 'Sport & goals', 'Location']

export function Onboarding() {
  const { token, setProfile } = useAuthStore()
  const navigate = useNavigate()
  const [step, setStep]       = useState(0)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    age: '', height_cm: '', weight_kg: '', gender: 'male',
    sport_type: 'athletics', primary_event: '100m',
    age_group: 'U20', experience_level: 'Intermediate',
    fitness_goals: [], state: 'Uttar Pradesh', city: '',
  })

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  function toggleGoal(g) {
    set('fitness_goals',
      form.fitness_goals.includes(g)
        ? form.fitness_goals.filter(x => x !== g)
        : [...form.fitness_goals, g]
    )
  }

  async function finish() {
  setLoading(true)
  try {
    // clean empty strings to null before sending
    const cleaned = {
      ...form,
      age:       form.age       ? parseInt(form.age)       : null,
      height_cm: form.height_cm ? parseFloat(form.height_cm) : null,
      weight_kg: form.weight_kg ? parseFloat(form.weight_kg) : null,
    }
    const data = await authService.updateProfile(cleaned, token)
    setProfile(data.profile)
    toast.success('Profile saved! Welcome to AthleteAI 🎉')
    navigate('/dashboard')
  } catch (err) {
    toast.error(typeof err === 'string' ? err : 'Failed to save profile')
  } finally {
    setLoading(false)
  }
}

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg-primary)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{ width: '100%', maxWidth: 520, padding: '0 24px' }}>

        {/* Progress steps */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 32,
          justifyContent: 'center', alignItems: 'center' }}>
          {STEPS.map((s, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 600,
                background: i <= step ? 'var(--accent)' : 'var(--bg-hover)',
                color: i <= step ? '#fff' : 'var(--text-muted)',
                border: `1px solid ${i <= step ? 'var(--accent)' : 'var(--border)'}`,
              }}>{i + 1}</div>
              <span style={{ fontSize: 12, fontWeight: i === step ? 500 : 400,
                color: i === step ? 'var(--text)' : 'var(--text-muted)' }}>{s}</span>
              {i < STEPS.length - 1 &&
                <div style={{ width: 24, height: 1, background: 'var(--border)' }} />}
            </div>
          ))}
        </div>

        <div className="card">
          <h2 style={{ fontSize: 20, fontWeight: 700, margin: '0 0 6px' }}>
            {step === 0 && '👤 Tell us about yourself'}
            {step === 1 && '🏃 Your sport & goals'}
            {step === 2 && '📍 Where are you from?'}
          </h2>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '0 0 24px' }}>
            {step === 0 && 'This helps personalise your training and leaderboard ranking.'}
            {step === 1 && 'We match you with the right national benchmarks.'}
            {step === 2 && 'Used for state-level leaderboard rankings.'}
          </p>

          {/* Step 0 */}
          {step === 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div>
                <label className="input-label">Age</label>
                <input type="number" placeholder="19"
                  value={form.age} onChange={e => set('age', e.target.value)} />
              </div>
              <div>
                <label className="input-label">Gender</label>
                <select value={form.gender} onChange={e => set('gender', e.target.value)}>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="input-label">Height (cm)</label>
                <input type="number" placeholder="172"
                  value={form.height_cm} onChange={e => set('height_cm', e.target.value)} />
              </div>
              <div>
                <label className="input-label">Weight (kg)</label>
                <input type="number" placeholder="65"
                  value={form.weight_kg} onChange={e => set('weight_kg', e.target.value)} />
              </div>
              <div>
                <label className="input-label">Age group</label>
                <select value={form.age_group} onChange={e => set('age_group', e.target.value)}>
                  {AGE_GROUPS.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              <div>
                <label className="input-label">Experience</label>
                <select value={form.experience_level}
                  onChange={e => set('experience_level', e.target.value)}>
                  {EXPERIENCE_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
            </div>
          )}

          {/* Step 1 */}
          {step === 1 && (
            <div>
              <div style={{ marginBottom: 14 }}>
                <label className="input-label">Primary event</label>
                <select value={form.primary_event}
                  onChange={e => set('primary_event', e.target.value)}>
                  {SPORTS[0].events.map(e =>
                    <option key={e.id} value={e.id}>{e.name}</option>)}
                </select>
              </div>
              <div>
                <label className="input-label" style={{ marginBottom: 10 }}>
                  Fitness goals
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {FITNESS_GOALS.map(g => {
                    const sel = form.fitness_goals.includes(g)
                    return (
                      <button key={g} type="button" onClick={() => toggleGoal(g)}
                        style={{
                          padding: '6px 14px', borderRadius: 20, fontSize: 12,
                          fontWeight: 500, cursor: 'pointer',
                          border: `1px solid ${sel ? 'var(--accent)' : 'var(--border)'}`,
                          background: sel ? 'var(--accent-dim)' : 'transparent',
                          color: sel ? 'var(--accent)' : 'var(--text-muted)',
                        }}>{g}</button>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <div style={{ display: 'grid', gap: 14 }}>
              <div>
                <label className="input-label">State</label>
                <select value={form.state} onChange={e => set('state', e.target.value)}>
                  {INDIA_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="input-label">City</label>
                <input type="text" placeholder="e.g. Lucknow, Kanpur, Agra"
                  value={form.city} onChange={e => set('city', e.target.value)} />
              </div>
            </div>
          )}

          {/* Navigation buttons */}
          <div style={{ display: 'flex', justifyContent: 'space-between',
            marginTop: 24 }}>
            {step > 0
              ? <button className="btn-ghost" onClick={() => setStep(s => s - 1)}>
                  ← Back
                </button>
              : <div />}
            {step < STEPS.length - 1
              ? <button className="btn-primary" onClick={() => setStep(s => s + 1)}>
                  Continue →
                </button>
              : <button className="btn-primary" onClick={finish} disabled={loading}>
                  {loading ? 'Saving…' : '🎉 Start training'}
                </button>}
          </div>
        </div>
      </div>
    </div>
  )
}