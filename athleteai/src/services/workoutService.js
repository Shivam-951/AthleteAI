import api from './api'

export const workoutService = {
  log:    (data)  => api.post('/workouts', data),
  list:   ()      => api.get('/workouts'),
  stats:  ()      => api.get('/workouts/stats'),
  delete: (id)    => api.delete(`/workouts/${id}`),
  verify: (id)    => api.post(`/workouts/${id}/verify`),
}