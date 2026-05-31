import { create } from 'zustand'

export const useAthleteStore = create((set) => ({
  workouts:     [],
  leaderboard:  [],
  trainingPlan: null,
  insights:     [],

  setWorkouts:     (workouts)     => set({ workouts }),
  addWorkout:      (w)            => set(s => ({ workouts: [w, ...s.workouts] })),
  setLeaderboard:  (leaderboard)  => set({ leaderboard }),
  setTrainingPlan: (trainingPlan) => set({ trainingPlan }),
  setInsights:     (insights)     => set({ insights }),
}))
