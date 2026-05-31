import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

const Tip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background:'var(--bg-hover)', border:'1px solid var(--border)', borderRadius:8, padding:'8px 12px', fontSize:12 }}>
      <div style={{ color:'var(--text-muted)', marginBottom:4 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color, fontWeight:500 }}>{p.name}: {p.value}{p.name === 'pace' ? ' min/km' : 's'}</div>
      ))}
    </div>
  )
}

export function PaceChart({ data, height = 160 }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data}>
        <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="label" tick={{ fill:'var(--text-muted)', fontSize:11 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill:'var(--text-muted)', fontSize:10 }} axisLine={false} tickLine={false} />
        <Tooltip content={<Tip />} />
        <Line type="monotone" dataKey="value" stroke="var(--green)" strokeWidth={2.5}
          dot={{ fill:'var(--green)', r:3 }} name="pace" />
      </LineChart>
    </ResponsiveContainer>
  )
}
