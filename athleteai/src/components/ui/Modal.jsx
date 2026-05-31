import { useEffect } from 'react'

export function Modal({ open, onClose, title, children }) {
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    if (open) document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose])

  if (!open) return null

  return (
    <div style={{
      position:'fixed', inset:0, background:'rgba(0,0,0,0.6)',
      display:'flex', alignItems:'center', justifyContent:'center', zIndex:50
    }} onClick={onClose}>
      <div style={{
        background:'var(--bg-surface)', border:'1px solid var(--border)',
        borderRadius:16, padding:'24px', minWidth:400, maxWidth:560, width:'90%'
      }} onClick={e => e.stopPropagation()}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
          <h2 style={{ fontSize:18, fontWeight:600, margin:0 }}>{title}</h2>
          <button onClick={onClose} style={{ background:'none', border:'none', color:'var(--text-muted)', cursor:'pointer', fontSize:20, lineHeight:1 }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  )
}
