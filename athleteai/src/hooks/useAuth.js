import { useAuthStore } from '../store/authStore'
import { authService }  from '../services/authService'
import { useNavigate }  from 'react-router-dom'
import toast            from 'react-hot-toast'

export function useAuth() {
  const { user, token, profile, isAuthenticated, setAuth, setProfile, logout } = useAuthStore()
  const navigate = useNavigate()

  async function login(email, password) {
    const data = await authService.login({ email, password })
    setAuth(data.user, data.access_token)
    if (!data.user.profile_complete) navigate('/onboarding')
    else navigate('/dashboard')
  }

  async function register(email, password, name) {
    const data = await authService.register({ email, password, name })
    setAuth(data.user, data.access_token)
    navigate('/onboarding')
  }

  async function completeProfile(profileData) {
    const data = await authService.updateProfile(profileData)
    setProfile(data)
    navigate('/dashboard')
    toast.success('Profile set up! Welcome to AthleteAI 🎉')
  }

  function signOut() {
    logout()
    navigate('/login')
  }

  return { user, token, profile, isAuthenticated, login, register, completeProfile, signOut }
}
