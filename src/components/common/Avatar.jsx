import { initials } from '../../lib/format.js'

export default function Avatar({ name, color, size = 40, online = false, icon = null }) {
  return (
    <div className="avatar-wrap" style={{ width: size, height: size }}>
      <div
        className="avatar"
        style={{ width: size, height: size, background: color || '#00a884', fontSize: size * 0.38 }}
      >
        {icon ?? initials(name)}
      </div>
      {online && <span className="online-dot" />}
    </div>
  )
}
