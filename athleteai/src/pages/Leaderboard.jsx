import { useState, useEffect } from 'react'
import { PageWrapper }          from '../components/layout/PageWrapper'
import { LeaderboardTable }     from '../components/leaderboard/LeaderboardTable'
import { EventSelector }        from '../components/leaderboard/EventSelector'
import { SAIBanner }            from '../components/leaderboard/SAIBanner'
import { leaderboardService }   from '../services/leaderboardService'
import { useAuthStore }         from '../store/authStore'

const FILTERS = ['All India', 'U14', 'U16', 'U18', 'U20', 'U23', 'Open']

export function Leaderboard() {
  const user                    = useAuthStore(s => s.user)
  const [event,    setEvent]    = useState('100m')
  const [filter,   setFilter]   = useState('U20')
  const [entries,  setEntries]  = useState([])
  const [myRanks,  setMyRanks]  = useState(null)
  const [stats,    setStats]    = useState(null)
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    load()
  }, [event, filter])

  async function load() {
    setLoading(true)
    try {
      const [lb, my, st] = await Promise.all([
        leaderboardService.get({
          event_id:  event,
          age_group: filter === 'All India' ? 'U20' : filter,
        }),
        leaderboardService.myRanks(),
        leaderboardService.stats(),
      ])
      setEntries(lb)
      setMyRanks(my)
      setStats(st)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const myRankForEvent = myRanks?.ranks?.find(r => r.event_id === event)
  const myNationalRank = myRankForEvent?.rank_national || myRanks?.best_rank

  return (
    <PageWrapper>
      <div style={{ marginBottom: 24 }}>
        <h1 className="page-title">National leaderboard 🏆</h1>
        <p className="page-sub">
          Track & field · Athletics · India · {new Date().getFullYear()}
        </p>
      </div>

      {/* Event + filter */}
      <div style={{ display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', marginBottom: 16,
        flexWrap: 'wrap', gap: 12 }}>
        <EventSelector value={event} onChange={setEvent} />
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {FILTERS.map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              padding: '5px 12px', borderRadius: 20,
              fontSize: 11, fontWeight: 500, cursor: 'pointer',
              border: `1px solid ${filter === f ? 'var(--purple)' : 'var(--border)'}`,
              background: filter === f ? 'rgba(139,92,246,.12)' : 'transparent',
              color: filter === f ? '#a78bfa' : 'var(--text-muted)',
              transition: 'all 0.15s',
            }}>{f}</button>
          ))}
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)',
        gap: 12, marginBottom: 20 }}>
        {[
          {
            label: 'Your rank',
            value: myNationalRank ? `#${myNationalRank}` : '—',
            color: 'var(--accent)'
          },
          {
            label: 'Your state rank',
            value: myRankForEvent?.rank_state
              ? `#${myRankForEvent.rank_state}` : '—',
            color: 'var(--green)'
          },
          {
            label: 'National percentile',
            value: myRankForEvent?.percentile
              ? `Top ${Math.round(myRankForEvent.percentile)}%` : '—',
            color: 'var(--purple)'
          },
          {
            label: 'Athletes ranked',
            value: stats?.total_ranked_athletes || entries.length || '0',
            color: 'var(--gold)'
          },
        ].map((s, i) => (
          <div key={i} className="card-sm"
            style={{ borderColor: `${s.color}25` }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)',
              fontWeight: 500, marginBottom: 4 }}>{s.label}</div>
            <div style={{ fontSize: 22, fontWeight: 700,
              color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div style={{ marginBottom: 16 }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px 0',
            color: 'var(--text-muted)', fontSize: 13 }}>
            Loading rankings…
          </div>
        ) : entries.length > 0 ? (
          <LeaderboardTable
            entries={entries}
            currentUserId={user?.id}
          />
        ) : (
          <div className="card" style={{ textAlign: 'center',
            padding: '40px 20px', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>🏃</div>
            <div style={{ fontSize: 14, fontWeight: 500,
              marginBottom: 6 }}>No athletes ranked yet for {event}</div>
            <div style={{ fontSize: 13 }}>
              Log a session for this event to appear on the leaderboard
            </div>
          </div>
        )}
      </div>

      {/* SAI Banner */}
      <SAIBanner rank={myNationalRank} threshold={50} />

      {/* How it works */}
      <div className="card" style={{ marginTop: 16,
        background: 'var(--bg-hover)' }}>
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10 }}>
          📋 How rankings work
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
          gap: 16 }}>
          {[
            { n: '1', text: 'Log a session with your time for any event' },
            { n: '2', text: 'Get a coach to verify — gives you a trusted rank' },
            { n: '3', text: 'Top 50 nationally get flagged for SAI review' },
          ].map(s => (
            <div key={s.n} style={{ display: 'flex', gap: 10 }}>
              <div style={{
                width: 22, height: 22, borderRadius: '50%',
                background: 'var(--accent-dim)', color: 'var(--accent)',
                fontSize: 11, fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>{s.n}</div>
              <span style={{ fontSize: 12, color: 'var(--text-muted)',
                lineHeight: 1.5 }}>{s.text}</span>
            </div>
          ))}
        </div>
      </div>
    </PageWrapper>
  )
}