import { useEffect, useState } from 'react'
import { Link }                 from 'react-router-dom'
import { PageWrapper }          from '../components/layout/PageWrapper'
import { StatCard }             from '../components/ui/StatCard'
import { InsightCard }          from '../components/dashboard/InsightCard'
import { AchievementGrid }      from '../components/dashboard/AchievementGrid'
import { WeeklyStreak }         from '../components/dashboard/WeeklyStreak'
import { PaceChart }            from '../components/charts/PaceChart'
import { ProgressChart }        from '../components/charts/ProgressChart'
import { RecoveryRing }         from '../components/charts/RecoveryRing'
import { SessionCard }          from '../components/workout/SessionCard'
import { useAuthStore }         from '../store/authStore'
import { workoutService }       from '../services/workoutService'
import { aiService }            from '../services/aiService'
import { leaderboardService }   from '../services/leaderboardService'

export function Dashboard() {
  const user    = useAuthStore(s => s.user)
  const name    = user?.name?.split(' ')[0] || 'Athlete'
  const hrs     = new Date().getHours()
  const greet   = hrs < 12 ? 'Good morning' : hrs < 17 ? 'Good afternoon' : 'Good evening'

  const [sessions,  setSessions]  = useState([])
  const [insights,  setInsights]  = useState([])
  const [stats,     setStats]     = useState(null)
  const [recovery,  setRecovery]  = useState(null)
  const [myRanks,   setMyRanks]   = useState(null)
  const [weekly,    setWeekly]    = useState(null)
  const [loading,   setLoading]   = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [s, i, st, r, ranks, w] = await Promise.all([
          workoutService.list(),
          aiService.insights(),
          workoutService.stats(),
          aiService.recovery(),
          leaderboardService.myRanks(),
          aiService.weeklySummary(),
        ])
        setSessions(s)
        setInsights(i)
        setStats(st)
        setRecovery(r)
        setMyRanks(ranks)
        setWeekly(w)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  // build chart data from real sessions
  const paceData = sessions
    .filter(s => s.pace)
    .slice(0, 7)
    .reverse()
    .map((s, i) => ({
      label: s.session_date?.slice(5) || `S${i + 1}`,
      value: parseFloat((s.pace / 60).toFixed(2)),
    }))

  const distData = sessions
    .slice(0, 7)
    .reverse()
    .map((s, i) => ({
      label: s.session_date?.slice(5) || `S${i + 1}`,
      value: parseFloat(((s.distance || 0) / 1000).toFixed(1)),
    }))

  const bestRank  = myRanks?.best_rank
  const pb        = stats?.personal_bests
  const profile   = useAuthStore(s => s.profile)
  const primaryEvent = profile?.primary_event || '100m'
  const pbValue   = pb
    ? (pb[primaryEvent] || Object.values(pb).sort((a,b) => a-b)[0])
    : null
  const pbEvent   = pb
    ? (pb[primaryEvent] ? primaryEvent : Object.keys(pb)[0])
    : null
  // active days for streak (0=Mon ... 6=Sun)
  const activeDays = weekly?.active_days?.map(d => {
    const day = new Date(d).getDay()
    return day === 0 ? 6 : day - 1
  }) || []

  // earned achievements
  const earned = []
  if (recovery?.recovery_score >= 80) earned.push('sub_bench')
  if (activeDays.length >= 7) earned.push('streak_7')
  if (bestRank && bestRank <= 200) earned.push('top200')
  if ((stats?.total_distance_km || 0) >= 100) earned.push('100km')
  if (myRanks?.sai_eligible) earned.push('sai')
  if (pbValue && pbValue < 11) earned.push('pb')

  if (loading) return (
    <PageWrapper>
      <div style={{ textAlign: 'center', padding: '80px 0',
        color: 'var(--text-muted)', fontSize: 14 }}>
        Loading your dashboard…
      </div>
    </PageWrapper>
  )

  return (
    <PageWrapper>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start',
        justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 className="page-title">{greet}, {name} 👋</h1>
          <p className="page-sub">
            {new Date().toLocaleDateString('en-IN', {
              weekday: 'long', day: 'numeric', month: 'long' })}
            {bestRank && ` · National rank #${bestRank}`}
          </p>
        </div>
        {myRanks?.sai_eligible &&
          <span className="badge badge-gold">🏅 SAI Eligible</span>}
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)',
        gap: 12, marginBottom: 20 }}>
        <StatCard
          label="National rank"
          value={bestRank ? `#${bestRank}` : 'Unranked'}
          sub="Log & verify sessions to rank"
          color="var(--accent)" icon="🏅"
        />
        <StatCard
          label="Personal best"
          value={pbValue ? `${pbValue}s` : '—'}
          sub={pbEvent || 'No sessions yet'}
          color="var(--gold)" icon="⚡"
        />
        <StatCard
          label="Total distance"
          value={`${stats?.total_distance_km || 0} km`}
          sub="all time"
          color="var(--green)" icon="📏"
        />
        <StatCard
          label="Recovery"
          value={`${recovery?.recovery_score || 0}%`}
          sub={recovery?.message || '—'}
          color={
            (recovery?.recovery_score || 0) >= 70
              ? 'var(--green)'
              : (recovery?.recovery_score || 0) >= 40
                ? 'var(--gold)' : 'var(--red)'
          }
          icon="😴"
        />
      </div>

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr',
        gap: 16, marginBottom: 16 }}>
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center',
            justifyContent: 'space-between', marginBottom: 14 }}>
            <span style={{ fontSize: 14, fontWeight: 500 }}>
              Weekly distance (km)
            </span>
            <span className="badge badge-blue">
              {weekly?.total_distance_km || 0} km this week
            </span>
          </div>
          {distData.length > 0
            ? <ProgressChart data={distData} dataKey="value"
                color="var(--accent)" unit="km" />
            : <div style={{ height: 160, display: 'flex', alignItems: 'center',
                justifyContent: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
                No sessions yet —{' '}
                <Link to="/log" style={{ color: 'var(--accent)',
                  marginLeft: 4 }}>log one</Link>
              </div>}
        </div>

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center',
            justifyContent: 'space-between', marginBottom: 14 }}>
            <span style={{ fontSize: 14, fontWeight: 500 }}>
              Pace trend (min/km)
            </span>
            <span className="badge badge-green">Recent sessions</span>
          </div>
          {paceData.length > 0
            ? <PaceChart data={paceData} />
            : <div style={{ height: 160, display: 'flex', alignItems: 'center',
                justifyContent: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
                Log sessions with distance to see pace trend
              </div>}
        </div>
      </div>

      {/* Bottom row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
        gap: 16 }}>

        {/* AI Insights */}
        <div className="card" style={{ gridColumn: 'span 2' }}>
          <div style={{ display: 'flex', alignItems: 'center',
            justifyContent: 'space-between', marginBottom: 14 }}>
            <span style={{ fontSize: 14, fontWeight: 500 }}>
              🤖 AI performance insights
            </span>
            <span className="badge badge-purple">Rule engine</span>
          </div>
          {insights.length > 0
            ? insights.map((ins, i) =>
                <InsightCard key={i} tag={ins.tag} text={ins.text} />)
            : <div style={{ color: 'var(--text-muted)', fontSize: 13,
                padding: '20px 0' }}>
                Log some sessions to get personalized insights
              </div>}
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card">
            <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 12 }}>
              Recovery today
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <RecoveryRing score={recovery?.recovery_score || 0} size={72} />
              <div>
                <div style={{ fontSize: 20, fontWeight: 700,
                   color: (recovery?.recovery_score || 0) >= 65
                    ? 'var(--green)'
                    : (recovery?.recovery_score || 0) >= 45
                      ? 'var(--gold)' : 'var(--red)' }}>
                  {recovery?.recovery_score || 0}%
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' , 
                  lineHeight: 1.4, maxWidth: 140}}>
                  {recovery?.message || 'Log sessions to track'}
                </div>
              </div>
            </div>
            {recovery?.factors?.length > 0 && (
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: 10 }}>
                {recovery.factors.map((f, i) => (
                  <div key={i} style={{ fontSize: 11, color: 'var(--text-muted)',
                    padding: '3px 0', display: 'flex', gap: 6 }}>
                    <span>•</span><span>{f}</span>
                  </div>
                ))}
    </div>
  )}
          </div>

          <div className="card">
            <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 12 }}>
              This week
            </div>
            <WeeklyStreak days={activeDays} />
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 10 }}>
              {weekly?.sessions_count || 0} of 7 days active
            </div>
          </div>

          <div className="card">
            <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 12 }}>
              Achievements
            </div>
            <AchievementGrid earned={earned} />
          </div>
        </div>
      </div>

      {/* Recent sessions */}
      <div style={{ marginTop: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', marginBottom: 12 }}>
          <span className="section-title" style={{ margin: 0 }}>
            Recent sessions
          </span>
          <Link to="/log" style={{ fontSize: 13, color: 'var(--accent)',
            textDecoration: 'none', fontWeight: 500 }}>
            + Log workout
          </Link>
        </div>
        {sessions.length > 0
          ? sessions.slice(0, 5).map(s =>
              <SessionCard key={s.id} session={s} />)
          : <div style={{ color: 'var(--text-muted)', fontSize: 13,
              padding: '20px 0' }}>
              No sessions yet.{' '}
              <Link to="/log" style={{ color: 'var(--accent)' }}>
                Log your first workout →
              </Link>
            </div>}
      </div>
    </PageWrapper>
  )
}