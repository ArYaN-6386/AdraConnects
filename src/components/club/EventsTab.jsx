import { useState } from 'react'
import { useEvents } from '../../hooks/useEvents.js'
import EventCard from './EventCard.jsx'
import NewEventModal from './NewEventModal.jsx'

export default function EventsTab({ clubId, isAdmin }) {
  const { events, loading, createEvent, rsvp } = useEvents(clubId)
  const [showNew, setShowNew] = useState(false)

  const now = new Date()
  const upcoming = events.filter((e) => new Date(e.starts_at) >= now)
  const past = events.filter((e) => new Date(e.starts_at) < now).reverse()

  return (
    <div className="events-tab">
      {isAdmin && (
        <button className="btn-primary btn-block" onClick={() => setShowNew(true)}>
          + Schedule an event
        </button>
      )}
      {loading && <div className="side-note">Loading events…</div>}
      {!loading && events.length === 0 && (
        <div className="side-note center">
          No events yet{isAdmin ? ' — schedule the first one!' : ''}
        </div>
      )}

      {upcoming.length > 0 && <div className="events-section">Upcoming</div>}
      {upcoming.map((e) => (
        <EventCard key={e.id} event={e} onRsvp={rsvp} />
      ))}

      {past.length > 0 && <div className="events-section">Past</div>}
      {past.map((e) => (
        <EventCard key={e.id} event={e} onRsvp={rsvp} past />
      ))}

      {showNew && <NewEventModal onCreate={createEvent} onClose={() => setShowNew(false)} />}
    </div>
  )
}
