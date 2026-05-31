import { useState }          from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authService }       from '../services/authService'
import { useAuthStore }      from '../store/authStore'
import toast                 from 'react-hot-toast'

export function Register() {
  const { setAuth } = useAuthStore()
  const navigate    = useNavigate()
  const [form, setForm]       = useState({ name: '', email: '', password: '' })
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }
    setLoading(true)
    try {
      const data = await authService.register(form)
      setAuth(data.user, data.access_token)
      toast.success('Account created!')
      navigate('/onboarding')
    } catch (err) {
      toast.error(err || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-primary)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <div style={{ width: '100%', maxWidth: 420, padding: '0 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 36, marginBottom: 8 }}>🏃</div>
          <h1 style={{ fontSize: 24, fontWeight: 700, margin: '0 0 6px' }}>
            Join AthleteAI
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 13, margin: 0 }}>
            Start your performance journey today
          </p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 14 }}>
              <label className="input-label">Full name</label>
              <input
                type="text"
                placeholder="Arjun Singh"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                required
              />
            </div>
            <div style={{ marginBottom: 14 }}>
              <label className="input-label">Email</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                required
              />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label className="input-label">Password</label>
              <input
                type="password"
                placeholder="Min 6 characters"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                required
              />
            </div>
            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
              style={{ width: '100%', justifyContent: 'center' }}
            >
              {loading ? 'Creating account…' : 'Create account →'}
            </button>
          </form>

          <hr className="divider" />

          <p style={{ textAlign: 'center', fontSize: 13,
            color: 'var(--text-muted)', margin: 0 }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--accent)',
              textDecoration: 'none', fontWeight: 500 }}>
              Sign in →
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}