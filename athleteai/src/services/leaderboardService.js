import api from './api'

export const leaderboardService = {
  get:     (params) => api.get('/leaderboard', { params }),
  myRanks: ()       => api.get('/leaderboard/me'),
  stats:   ()       => api.get('/leaderboard/stats'),
}