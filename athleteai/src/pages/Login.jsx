import { useState }       from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authService }    from '../services/authService'
import { useAuthStore }   from '../store/authStore'
import toast              from 'react-hot-toast'

export function Login() {
  const { setAuth } = useAuthStore()
  const navigate    = useNavigate()
  const [form, setForm]       = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    try {
      const data = await authService.login(form)
      setAuth(data.user, data.access_token)
      toast.success('Welcome back!')
      if (!data.user.profile_complete) {
        navigate('/onboarding')
      } else {
        navigate('/dashboard')
      }
    } catch (err) {
      toast.error(err || 'Login failed')
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
      <div style={{ width: '100%', maxWidth: 400, padding: '0 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 36, marginBottom: 8 }}>⚡</div>
          <h1 style={{ fontSize: 24, fontWeight: 700, margin: '0 0 6px' }}>
            Welcome back
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 13, margin: 0 }}>
            Sign in to your AthleteAI account
          </p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit}>
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
                placeholder="••••••••"
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
              {loading ? 'Signing in…' : 'Sign in →'}
            </button>
          </form>

          <hr className="divider" />

          <p style={{ textAlign: 'center', fontSize: 13,
            color: 'var(--text-muted)', margin: 0 }}>
            No account?{' '}
            <Link to="/register" style={{ color: 'var(--accent)',
              textDecoration: 'none', fontWeight: 500 }}>
              Create one →
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}