import { useState, useEffect } from 'react'
import { useAthleteStore }      from '../store/athleteStore'
import { leaderboardService }   from '../services/leaderboardService'

export function useLeaderboard(params) {
  const { leaderboard, setLeaderboard } = useAthleteStore()
  const [loading, setLoading] = useState(false)
  const [myRanks, setMyRanks] = useState(null)

  async function fetchLeaderboard(p) {
    setLoading(true)
    try {
      const data = await leaderboardService.get(p || params)
      setLeaderboard(data)
    } finally {
      setLoading(false)
    }
  }

  async function fetchMyRanks() {
    const data = await leaderboardService.myRanks()
    setMyRanks(data)
    return data
  }

  return { leaderboard, loading, myRanks, fetchLeaderboard, fetchMyRanks }
}
