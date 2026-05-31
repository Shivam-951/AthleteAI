import { useState }     from 'react'
import { PageWrapper }  from '../components/layout/PageWrapper'
import { PaceChart }    from '../components/charts/PaceChart'
import { ProgressChart }from '../components/charts/ProgressChart'
import { StatCard }     from '../components/ui/StatCard'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts'

const PB_TREND = [
  { label:'Jan', time:13.8, rank:420 }, { label:'Feb', time:13.5, rank:380 },
  { label:'Mar', time:13.2, rank:310 }, { label:'Apr', time:12.9, rank:245 },
  { label:'May', time:12.6, rank:198 },
]
const HR_DATA = [
  { label:'Mon', avg:164, max:181 }, { label:'Wed', avg:158, max:174 },
  { label:'Thu', avg:171, max:188 }, { label:'Sat', avg:178, max:192 },
]
const MONTHLY_KM = [
  { label:'Jan', value:185 }, { label:'Feb', value:210 }, { label:'Mar', value:244 },
  { label:'Apr', value:268 }, { label:'May', value:182 },
]

const Tip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background:'var(--bg-hover)', border:'1px solid var(--border)', borderRadius:8, padding:'8px 12px', fontSize:12 }}>
      <div style={{ color:'var(--text-muted)', marginBottom:4 }}>{label}</div>
      {payload.map((p, i) => <div key={i} style={{ color:p.color, fontWeight:500 }}>{p.name}: {p.value}{p.name === 'time' ? 's' : p.name === 'rank' ? '' : ' bpm'}</div>)}
    </div>
  )
}

const EVENTS = ['100m','200m','400m','800m','5K','10K']

export function Analytics() {
  const [event, setEvent] = useState('100m')
  const [period, setPeriod] = useState('6mo')

  return (
    <PageWrapper>
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:24 }}>
        <div>
          <h1 className="page-title">Performance analytics 📊</h1>
          <p className="page-sub">Deep dive into your progress, trends, and national standing</p>
        </div>
        <div style={{ display:'flex', gap:8 }}>
          {['1mo','3mo','6mo','1yr'].map(p => (
            <button key={p} onClick={() => setPeriod(p)} style={{
              padding:'5px 12px', borderRadius:8, fontSize:12, fontWeight:500, cursor:'pointer',
              border:`1px solid ${period === p ? 'var(--accent)' : 'var(--border)'}`,
              background: period === p ? 'var(--accent-dim)' : 'transparent',
              color: period === p ? 'var(--accent)' : 'var(--text-muted)',
            }}>{p}</button>
          ))}
        </div>
      </div>

      {/* Event selector */}
      <div style={{ display:'flex', gap:8, marginBottom:20 }}>
        {EVENTS.map(e => (
          <button key={e} onClick={() => setEvent(e)} style={{
            padding:'5px 14px', borderRadius:20, fontSize:12, fontWeight:500, cursor:'pointer',
            border:`1px solid ${event === e ? 'var(--accent)' : 'var(--border)'}`,
            background: event === e ? 'var(--accent-dim)' : 'transparent',
            color: event === e ? 'var(--accent)' : 'var(--text-muted)',
          }}>{e}</button>
        ))}
      </div>

      {/* Key stats */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(6,1fr)', gap:12, marginBottom:20 }}>
        {[
          { label:'Personal best',   value:'11.12s',  sub:'100m sprint',     color:'var(--gold)'   },
          { label:'National rank',   value:'#198',    sub:'U20 · UP',        color:'var(--accent)' },
          { label:'Nat. percentile', value:'Top 8%',  sub:'U20 male',        color:'var(--purple)' },
          { label:'Improvement',     value:'0.13s/mo',sub:'last 5 months',   color:'var(--green)'  },
          { label:'Total distance',  value:'312 km',  sub:'this year',       color:'var(--accent)' },
          { label:'Verified sessions',value:'12',     sub:'of 64 total',     color:'var(--text-muted)' },
        ].map((s, i) => (
          <div key={i} className="card-sm" style={{ borderColor:`${s.color}20` }}>
            <div style={{ fontSize:10, color:'var(--text-muted)', fontWeight:500, marginBottom:4 }}>{s.label}</div>
            <div style={{ fontSize:18, fontWeight:700, color:s.color, letterSpacing:'-0.5px' }}>{s.value}</div>
            <div style={{ fontSize:10, color:'var(--text-muted)' }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Charts row 1 */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:16 }}>
        <div className="card">
          <div style={{ fontSize:14, fontWeight:500, marginBottom:14 }}>Personal best trend ({event})</div>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={PB_TREND}>
              <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="label" tick={{ fill:'var(--text-muted)', fontSize:11 }} axisLine={false} tickLine={false} />
              <YAxis domain={[12, 14.5]} tick={{ fill:'var(--text-muted)', fontSize:10 }} axisLine={false} tickLine={false} />
              <Tooltip content={<Tip />} />
              <Line type="monotone" dataKey="time" stroke="var(--gold)" strokeWidth={2.5} dot={{ fill:'var(--gold)', r:4 }} name="time" />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="card">
          <div style={{ fontSize:14, fontWeight:500, marginBottom:14 }}>National rank progression</div>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={PB_TREND}>
              <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="label" tick={{ fill:'var(--text-muted)', fontSize:11 }} axisLine={false} tickLine={false} />
              <YAxis reversed domain={[100,500]} tick={{ fill:'var(--text-muted)', fontSize:10 }} axisLine={false} tickLine={false} />
              <Tooltip content={<Tip />} />
              <Line type="monotone" dataKey="rank" stroke="var(--accent)" strokeWidth={2.5} dot={{ fill:'var(--accent)', r:4 }} name="rank" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts row 2 */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:16 }}>
        <div className="card">
          <div style={{ fontSize:14, fontWeight:500, marginBottom:14 }}>Monthly distance (km)</div>
          <ProgressChart data={MONTHLY_KM} dataKey="value" color="var(--purple)" unit="km" height={160} />
        </div>
        <div className="card">
          <div style={{ fontSize:14, fontWeight:500, marginBottom:14 }}>Heart rate — avg vs max</div>
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={HR_DATA}>
              <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="label" tick={{ fill:'var(--text-muted)', fontSize:11 }} axisLine={false} tickLine={false} />
              <YAxis domain={[140, 200]} tick={{ fill:'var(--text-muted)', fontSize:10 }} axisLine={false} tickLine={false} />
              <Tooltip content={<Tip />} />
              <Legend wrapperStyle={{ fontSize:11, color:'var(--text-muted)' }} />
              <Line type="monotone" dataKey="avg" stroke="var(--green)" strokeWidth={2} dot={{ r:3 }} name="avg" />
              <Line type="monotone" dataKey="max" stroke="var(--red)"   strokeWidth={2} dot={{ r:3 }} name="max" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Benchmark comparison */}
      <div className="card">
        <div style={{ fontSize:14, fontWeight:500, marginBottom:16 }}>National benchmark comparison (100m · U20 · Male)</div>
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          {[
            { label:'Your PB',           value:11.12, benchmark:10.8,  max:14 },
            { label:'State average',      value:11.6,  benchmark:10.8,  max:14 },
            { label:'National benchmark', value:10.8,  benchmark:10.8,  max:14 },
            { label:'National record',    value:10.26, benchmark:10.8,  max:14 },
          ].map((r, i) => {
            const pct  = ((14 - r.value) / (14 - 10.0)) * 100
            const bpct = ((14 - r.benchmark) / (14 - 10.0)) * 100
            const isYou = i === 0
            return (
              <div key={i} style={{ display:'grid', gridTemplateColumns:'180px 1fr 60px', alignItems:'center', gap:12 }}>
                <span style={{ fontSize:12, color: isYou ? 'var(--accent)' : 'var(--text-muted)', fontWeight: isYou ? 600 : 400 }}>{r.label}</span>
                <div style={{ position:'relative', height:8, background:'var(--bg-hover)', borderRadius:4 }}>
                  <div style={{ height:'100%', width:`${pct}%`, background: isYou ? 'var(--accent)' : 'var(--border-light)', borderRadius:4, transition:'width 0.6s' }} />
                  <div style={{ position:'absolute', top:-4, left:`${bpct}%`, width:2, height:16, background:'var(--green)', borderRadius:1 }} />
                </div>
                <span style={{ fontSize:12, fontWeight:600, fontFamily:'DM Mono', textAlign:'right', color: isYou ? 'var(--accent)' : 'var(--text)' }}>{r.value}s</span>
              </div>
            )
          })}
          <div style={{ fontSize:11, color:'var(--text-muted)', marginTop:4 }}>
            <span style={{ display:'inline-block', width:12, height:2, background:'var(--green)', borderRadius:1, verticalAlign:'middle', marginRight:5 }} />
            Green line = national benchmark (10.8s)
          </div>
        </div>
      </div>
    </PageWrapper>
  )
}
