import { useState } from 'react'
import { useAthleteStore } from '../store/athleteStore'
import { aiService }       from '../services/aiService'

export function useAI() {
  const { insights, setInsights, setTrainingPlan } = useAthleteStore()
  const [loading, setLoading] = useState(false)

  async function fetchInsights() {
    setLoading(true)
    try {
      const data = await aiService.getInsights()
      setInsights(data)
      return data
    } finally {
      setLoading(false)
    }
  }

  async function generatePlan(context) {
    setLoading(true)
    try {
      const plan = await aiService.getTrainingPlan(context)
      setTrainingPlan(plan)
      return plan
    } finally {
      setLoading(false)
    }
  }

  return { insights, loading, fetchInsights, generatePlan }
}
