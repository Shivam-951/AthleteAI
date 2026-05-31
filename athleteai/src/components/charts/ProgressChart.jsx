import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

const Tip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background:'var(--bg-hover)', border:'1px solid var(--border)', borderRadius:8, padding:'8px 12px', fontSize:12 }}>
      <div style={{ color:'var(--text-muted)', marginBottom:4 }}>{label}</div>
      <div style={{ color:'var(--accent)', fontWeight:500 }}>{payload[0]?.value} {payload[0]?.name}</div>
    </div>
  )
}

export function ProgressChart({ data, dataKey = 'value', color = 'var(--accent)', height = 160, unit = '' }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} barSize={22}>
        <XAxis dataKey="label" tick={{ fill:'var(--text-muted)', fontSize:11 }} axisLine={false} tickLine={false} />
        <YAxis hide />
        <Tooltip content={<Tip />} />
        <Bar dataKey={dataKey} fill={color} radius={[4,4,0,0]} opacity={0.85} name={unit} />
      </BarChart>
    </ResponsiveContainer>
  )
}
