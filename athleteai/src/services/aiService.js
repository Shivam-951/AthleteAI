import api from './api'

export const aiService = {
  insights:     ()     => api.get('/ai/insights'),
  trainingPlan: (data) => api.post('/ai/training-plan', data),
  recovery:     ()     => api.get('/ai/recovery'),
  weeklySummary:()     => api.get('/ai/weekly-summary'),
}