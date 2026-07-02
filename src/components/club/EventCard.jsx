import { useAuth } from '../../context/AuthContext.jsx'
import { formatEventTime } from '../../lib/format.js'

const OPTIONS = [
  { id: 'going', label: 'Going', emoji: '✅' },
  { id: 'maybe', label: 'Maybe', emoji: '🤔' },
  { id: 'not_going', label: "Can't", emoji: '❌' },
]

export default function EventCard({ event, onRsvp, past = false }) {
  const { user } = useAuth()
  const rsvps = event.rsvps ?? []
  const mine = rsvps.find((r) => r.user_id === user.id)?.status ?? null
  const count = (status) => rsvps.filter((r) => r.status === status).length

  return (
    <div className={`event-card${past ? ' past' : ''}`}>
      <div className="event-title">{event.title}</div>
      <div className="event-when">📅 {formatEventTime(event.starts_at)}</div>
      {event.location && <div className="event-where">📍 {event.location}</div>}
      {event.description && <div className="event-desc">{event.description}</div>}
      <div className="event-rsvps">
        {OPTIONS.map((o) => (
          <button
            key={o.id}
            className={`rsvp-btn${mine === o.id ? ' selected' : ''}`}
            disabled={past}
            onClick={() => onRsvp(event.id, o.id)}
          >
            {o.emoji} {o.label} · {count(o.id)}
          </button>
        ))}
      </div>
    </div>
  )
}
