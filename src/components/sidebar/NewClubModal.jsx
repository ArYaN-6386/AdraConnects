import { useState } from 'react'
import { supabase } from '../../lib/supabase.js'
import { useChat } from '../../context/ChatContext.jsx'
import Modal from '../common/Modal.jsx'

export default function NewClubModal({ onClose }) {
  const { refreshChats, openConversation } = useChat()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      const { data: clubId, error: rpcError } = await supabase.rpc('create_club', {
        _name: name.trim(),
        _description: description.trim(),
      })
      if (rpcError) throw rpcError
      const { data: conv } = await supabase
        .from('conversations')
        .select('id')
        .eq('club_id', clubId)
        .eq('type', 'club_chat')
        .single()
      await refreshChats()
      if (conv) openConversation(conv.id)
      onClose()
    } catch (err) {
      setError(err.message)
      setBusy(false)
    }
  }

  return (
    <Modal title="Create a club" onClose={onClose}>
      <form onSubmit={handleSubmit} className="modal-form">
        <input
          placeholder="Club name (e.g. Robotics Club)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={80}
          required
          autoFocus
        />
        <textarea
          placeholder="What is this club about?"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
        />
        {error && <div className="auth-error">{error}</div>}
        <button type="submit" className="btn-primary" disabled={busy || !name.trim()}>
          {busy ? 'Creating…' : 'Create club'}
        </button>
        <p className="side-note">You'll be the admin — you can post announcements and schedule events.</p>
      </form>
    </Modal>
  )
}
