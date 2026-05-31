import { useState }    from 'react'
import { PageWrapper } from '../components/layout/PageWrapper'
import { Button }      from '../components/ui/Button'
import { useAuthStore }from '../store/authStore'
import { SPORTS, AGE_GROUPS, EXPERIENCE_LEVELS } from '../constants/sports'
import { INDIA_STATES }from '../constants/states'
import toast           from 'react-hot-toast'

export function Profile() {
  const user    = useAuthStore(s => s.user)
  const profile = useAuthStore(s => s.profile)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({
    name:        user?.name     || '',
    age:         profile?.age   || '',
    height_cm:   profile?.height_cm || '',
    weight_kg:   profile?.weight_kg || '',
    primary_event: profile?.primary_event || '100m',
    age_group:   profile?.age_group || 'U20',
    state:       profile?.state || 'Uttar Pradesh',
    city:        profile?.city  || '',
    experience_level: profile?.experience_level || 'Intermediate',
  })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  function save() {
    toast.success('Profile updated!')
    setEditing(false)
  }

  const initials = (user?.name || 'A').split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase()

  return (
    <PageWrapper>
      <div style={{ maxWidth:640, margin:'0 auto' }}>
        <div style={{ marginBottom:24 }}>
          <h1 className="page-title">Your profile 👤</h1>
          <p className="page-sub">Manage your athlete information and account settings</p>
        </div>

        {/* Avatar + name card */}
        <div className="card" style={{ display:'flex', alignItems:'center', gap:20, marginBottom:16 }}>
          <div style={{
            width:64, height:64, borderRadius:'50%',
            background:'linear-gradient(135deg, var(--accent), var(--purple))',
            display:'flex', alignItems:'center', justifyContent:'center',
            fontSize:22, fontWeight:700, color:'#fff', flexShrink:0,
          }}>{initials}</div>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:18, fontWeight:700 }}>{user?.name || 'Athlete'}</div>
            <div style={{ fontSize:13, color:'var(--text-muted)' }}>{user?.email}</div>
            <div style={{ display:'flex', gap:8, marginTop:8 }}>
              <span className="badge badge-blue">{form.primary_event?.toUpperCase()}</span>
              <span className="badge badge-purple">{form.age_group}</span>
              <span className="badge badge-gray">{form.experience_level}</span>
            </div>
          </div>
          <Button variant="ghost" onClick={() => setEditing(e => !e)}>
            {editing ? 'Cancel' : '✏️ Edit'}
          </Button>
        </div>

        {/* Stats summary */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12, marginBottom:16 }}>
          {[
            { label:'National rank', value:'#198',   color:'var(--accent)' },
            { label:'Personal best', value:'11.12s', color:'var(--gold)'   },
            { label:'Sessions logged',value:'64',    color:'var(--green)'  },
          ].map((s, i) => (
            <div key={i} className="card-sm" style={{ textAlign:'center', borderColor:`${s.color}20` }}>
              <div style={{ fontSize:20, fontWeight:700, color:s.color }}>{s.value}</div>
              <div style={{ fontSize:11, color:'var(--text-muted)', marginTop:3 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Profile form */}
        <div className="card">
          <div style={{ fontSize:14, fontWeight:500, marginBottom:18 }}>Athlete information</div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
            {[
              { label:'Full name',    key:'name',        type:'text'   },
              { label:'Age',          key:'age',         type:'number' },
              { label:'Height (cm)',  key:'height_cm',   type:'number' },
              { label:'Weight (kg)',  key:'weight_kg',   type:'number' },
              { label:'City',         key:'city',        type:'text'   },
            ].map(f => (
              <div key={f.key}>
                <label className="input-label">{f.label}</label>
                <input type={f.type} value={form[f.key]} disabled={!editing}
                  onChange={e => set(f.key, e.target.value)}
                  style={{ opacity: editing ? 1 : 0.6 }} />
              </div>
            ))}
            <div>
              <label className="input-label">State</label>
              <select value={form.state} disabled={!editing} onChange={e => set('state', e.target.value)} style={{ opacity: editing ? 1 : 0.6 }}>
                {INDIA_STATES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="input-label">Primary event</label>
              <select value={form.primary_event} disabled={!editing} onChange={e => set('primary_event', e.target.value)} style={{ opacity: editing ? 1 : 0.6 }}>
                {SPORTS[0].events.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
              </select>
            </div>
            <div>
              <label className="input-label">Age group</label>
              <select value={form.age_group} disabled={!editing} onChange={e => set('age_group', e.target.value)} style={{ opacity: editing ? 1 : 0.6 }}>
                {AGE_GROUPS.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div>
              <label className="input-label">Experience level</label>
              <select value={form.experience_level} disabled={!editing} onChange={e => set('experience_level', e.target.value)} style={{ opacity: editing ? 1 : 0.6 }}>
                {EXPERIENCE_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
          </div>
          {editing && (
            <div style={{ marginTop:20 }}>
              <Button onClick={save}>💾 Save changes</Button>
            </div>
          )}
        </div>
      </div>
    </PageWrapper>
  )
}
