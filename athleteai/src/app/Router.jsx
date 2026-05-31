import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore }             from '../store/authStore'
import { Navbar }                   from '../components/layout/Navbar'
import { Landing }                  from '../pages/Landing'
import { Login }                    from '../pages/Login'
import { Register }                 from '../pages/Register'
import { Onboarding }               from '../pages/Onboarding'
import { Dashboard }                from '../pages/Dashboard'
import { Leaderboard }              from '../pages/Leaderboard'
import { LogWorkout }               from '../pages/LogWorkout'
import { Training }                 from '../pages/Training'
import { Analytics }                from '../pages/Analytics'
import { Profile }                  from '../pages/Profile'
import {LiveRun}                    from '../pages/LiveRun'

function ProtectedRoute({ children }) {
  const isAuthenticated = useAuthStore(s => s.isAuthenticated)
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return children
}

function AppLayout({ children }) {
  return (
    <div style={{ minHeight:'100vh', background:'var(--bg-primary)' }}>
      <Navbar />
      {children}
    </div>
  )
}

export function Router() {
  return (
    <Routes>
      <Route path="/"           element={<Landing />} />
      <Route path="/login"      element={<Login />} />
      <Route path="/register"   element={<Register />} />
      <Route path="/run"        element={<ProtectedRoute><LiveRun /></ProtectedRoute>} />
      <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
      <Route path="/dashboard"  element={<ProtectedRoute><AppLayout><Dashboard /></AppLayout></ProtectedRoute>} />
      <Route path="/leaderboard"element={<ProtectedRoute><AppLayout><Leaderboard /></AppLayout></ProtectedRoute>} />
      <Route path="/log"        element={<ProtectedRoute><AppLayout><LogWorkout /></AppLayout></ProtectedRoute>} />
      <Route path="/training"   element={<ProtectedRoute><AppLayout><Training /></AppLayout></ProtectedRoute>} />
      <Route path="/analytics"  element={<ProtectedRoute><AppLayout><Analytics /></AppLayout></ProtectedRoute>} />
      <Route path="/profile"    element={<ProtectedRoute><AppLayout><Profile /></AppLayout></ProtectedRoute>} />
      <Route path="*"           element={<Navigate to="/" replace />} />
    </Routes>
  )
}
