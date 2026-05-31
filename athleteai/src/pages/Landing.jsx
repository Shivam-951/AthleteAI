import { Link } from 'react-router-dom'

export function Landing() {
  const features = [
    { icon:'📊', title:'Performance Analytics', desc:'Track pace, splits, distance and heart rate with beautiful charts.' },
    { icon:'🤖', title:'AI Coaching Insights',  desc:'Get personalized tips powered by Claude AI based on your data.' },
    { icon:'🏆', title:'National Leaderboard',  desc:'Compete with athletes across India ranked by event and age group.' },
    { icon:'🏛️', title:'SAI Talent Pipeline',   desc:'Top performers get flagged for Sports Authority of India review.' },
    { icon:'💪', title:'Smart Training Plans',  desc:'AI-generated weekly plans that adapt to your recovery and goals.' },
    { icon:'🔒', title:'Coach Verification',    desc:'Coaches countersign sessions to create trusted performance records.' },
  ]

  return (
    <div style={{ minHeight:'100vh', background:'var(--bg-primary)' }}>
      {/* Nav */}
      <nav style={{ padding:'0 40px', height:60, display:'flex', alignItems:'center', justifyContent:'space-between', borderBottom:'1px solid var(--border)' }}>
        <span style={{ fontSize:20, fontWeight:700, letterSpacing:'-0.5px' }}>
          ⚡ Athlete<span style={{ color:'var(--accent)' }}>AI</span>
        </span>
        <div style={{ display:'flex', gap:12 }}>
          <Link to="/login"><button className="btn-ghost" style={{ padding:'7px 16px' }}>Sign in</button></Link>
          <Link to="/register"><button className="btn-primary" style={{ padding:'7px 16px' }}>Get started →</button></Link>
        </div>
      </nav>

      {/* Hero */}
      <div style={{ textAlign:'center', padding:'100px 24px 80px', maxWidth:720, margin:'0 auto' }}>
        <div style={{ display:'inline-block', background:'var(--accent-dim)', border:'1px solid rgba(14,165,233,.25)', borderRadius:20, padding:'4px 14px', fontSize:12, color:'var(--accent)', fontWeight:600, marginBottom:24, letterSpacing:'0.06em' }}>
          BUILT FOR INDIA'S ATHLETES
        </div>
        <h1 style={{ fontSize:52, fontWeight:800, letterSpacing:'-2px', lineHeight:1.1, margin:'0 0 20px' }}>
          Train smarter.<br />
          <span style={{ color:'var(--accent)' }}>Rank higher.</span>
        </h1>
        <p style={{ fontSize:17, color:'var(--text-muted)', lineHeight:1.7, margin:'0 0 36px' }}>
          AthleteAI combines performance tracking, AI-powered coaching, and a national leaderboard
          connected to the Sports Authority of India talent pipeline.
        </p>
        <div style={{ display:'flex', gap:12, justifyContent:'center' }}>
          <Link to="/register"><button className="btn-primary" style={{ fontSize:15, padding:'12px 28px' }}>Start free →</button></Link>
          <Link to="/login"><button className="btn-ghost" style={{ fontSize:15, padding:'12px 28px' }}>Sign in</button></Link>
        </div>
      </div>

      {/* Features */}
      <div style={{ maxWidth:1100, margin:'0 auto', padding:'0 32px 80px' }}>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:20 }}>
          {features.map((f, i) => (
            <div key={i} className="card" style={{ borderColor:'var(--border)' }}>
              <div style={{ fontSize:28, marginBottom:12 }}>{f.icon}</div>
              <div style={{ fontSize:15, fontWeight:600, marginBottom:6 }}>{f.title}</div>
              <div style={{ fontSize:13, color:'var(--text-muted)', lineHeight:1.6 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* SAI Banner */}
      <div style={{ maxWidth:800, margin:'0 auto 80px', padding:'0 32px' }}>
        <div style={{ background:'linear-gradient(135deg, rgba(14,165,233,.08), rgba(139,92,246,.08))', border:'1px solid rgba(14,165,233,.2)', borderRadius:16, padding:'32px 40px', textAlign:'center' }}>
          <div style={{ fontSize:36, marginBottom:12 }}>🏛️</div>
          <h2 style={{ fontSize:22, fontWeight:700, letterSpacing:'-0.5px', margin:'0 0 10px' }}>Connected to the SAI talent system</h2>
          <p style={{ fontSize:14, color:'var(--text-muted)', margin:'0 auto', maxWidth:500, lineHeight:1.7 }}>
            Athletes ranking in the top 50 nationally in their event and age group are automatically
            flagged for Sports Authority of India review — giving grassroots talent in Tier 2 & 3 cities
            a pathway that never existed before.
          </p>
        </div>
      </div>

      <div style={{ textAlign:'center', padding:'20px', borderTop:'1px solid var(--border)', color:'var(--text-muted)', fontSize:12 }}>
        AthleteAI © 2025 · Built for India's athletic future
      </div>
    </div>
  )
}
