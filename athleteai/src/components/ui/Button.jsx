export function Button({ children, variant = 'primary', size = 'md', disabled, onClick, type = 'button', className = '' }) {
  const base = variant === 'primary' ? 'btn-primary' : 'btn-ghost'
  const sz   = size === 'sm' ? 'text-xs px-3 py-1.5' : ''
  return (
    <button type={type} className={`${base} ${sz} ${className}`} disabled={disabled} onClick={onClick}>
      {children}
    </button>
  )
}
