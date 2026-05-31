import { create } from 'zustand'

export const useAuthStore = create((set) => ({
  user:    JSON.parse(localStorage.getItem('user') || 'null'),
  token:   localStorage.getItem('token') || null,
  profile: null,
  isAuthenticated: !!localStorage.getItem('token'),

  setAuth: (user, token) => {
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(user))
    set({ user, token, isAuthenticated: true })
  },

  setProfile: (profile) => set({ profile }),

  logout: () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    set({ user: null, token: null, profile: null, isAuthenticated: false })
  },
}))