import { useState } from 'react'
import { useAuth } from '../../context/AuthContext.jsx'
import { useChat } from '../../context/ChatContext.jsx'
import Avatar from '../common/Avatar.jsx'
import ChatListItem from './ChatListItem.jsx'
import NewDmModal from './NewDmModal.jsx'
import NewClubModal from './NewClubModal.jsx'
import BrowseClubsModal from './BrowseClubsModal.jsx'

export default function Sidebar() {
  const { profile, signOut } = useAuth()
  const { chats, chatsLoading } = useChat()
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState(null) // 'dm' | 'club' | 'browse'

  const filtered = chats.filter((c) => c.title?.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <Avatar name={profile?.full_name} color={profile?.avatar_color} size={40} />
        <span className="sidebar-me">{profile?.full_name}</span>
        <div className="sidebar-actions">
          <button className="icon-btn" title="New direct message" onClick={() => setModal('dm')}>
            💬
          </button>
          <button className="icon-btn" title="Browse clubs" onClick={() => setModal('browse')}>
            🧭
          </button>
          <button className="icon-btn" title="Create club" onClick={() => setModal('club')}>
            ➕
          </button>
          <button className="icon-btn" title="Log out" onClick={signOut}>
            ⏻
          </button>
        </div>
      </div>

      <div className="sidebar-search">
        <input
          placeholder="Search or start a new chat"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="chat-list">
        {chatsLoading && <div className="side-note">Loading chats…</div>}
        {!chatsLoading && filtered.length === 0 && (
          <div className="side-note">
            No chats yet.
            <br />
            Create a club ➕, browse clubs 🧭 or message someone 💬
          </div>
        )}
        {filtered.map((chat) => (
          <ChatListItem key={chat.conversation_id} chat={chat} />
        ))}
      </div>

      {modal === 'dm' && <NewDmModal onClose={() => setModal(null)} />}
      {modal === 'club' && <NewClubModal onClose={() => setModal(null)} />}
      {modal === 'browse' && <BrowseClubsModal onClose={() => setModal(null)} />}
    </div>
  )
}
