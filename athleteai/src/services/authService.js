import api from './api'

export const authService = {
  register: (data)       => api.post('/auth/register', data),
  login:    (data)       => api.post('/auth/login', data),
  me:       ()           => api.get('/auth/me'),
  updateProfile: (data, token) =>
    api.put(`/auth/profile?token=${token}`, data),
}