import { useState, useEffect } from 'react'
import { useAthleteStore }      from '../store/athleteStore'
import { workoutService }       from '../services/workoutService'
import toast                    from 'react-hot-toast'

export function useWorkouts() {
  const { workouts, setWorkouts, addWorkout } = useAthleteStore()
  const [loading, setLoading] = useState(false)

  async function fetchWorkouts(params) {
    setLoading(true)
    try {
      const data = await workoutService.list(params)
      setWorkouts(data)
    } finally {
      setLoading(false)
    }
  }

  async function logWorkout(data) {
    const w = await workoutService.log(data)
    addWorkout(w)
    toast.success('Workout logged!')
    return w
  }

  return { workouts, loading, fetchWorkouts, logWorkout }
}
