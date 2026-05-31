const VARIANTS = {
  blue: 'badge-blue', green: 'badge-green', red: 'badge-red',
  gold: 'badge-gold', purple: 'badge-purple', gray: 'badge-gray',
}
export function Badge({ children, variant = 'blue' }) {
  return <span className={`badge ${VARIANTS[variant] || 'badge-gray'}`}>{children}</span>
}
