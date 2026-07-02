import { useState } from 'react'
import { useChat } from '../../context/ChatContext.jsx'
import Sidebar from '../sidebar/Sidebar.jsx'
import ChatWindow from '../chat/ChatWindow.jsx'
import ClubInfoPanel from '../club/ClubInfoPanel.jsx'

export default function AppLayout() {
  const { activeChat } = useChat()
  // { clubId, tab: 'members' | 'events' | 'resources' } or null
  const [panel, setPanel] = useState(null)

  return (
    <div className="app">
      <Sidebar />
      <div className="main-pane">
        {activeChat ? (
          <ChatWindow
            key={activeChat.conversation_id}
            openPanel={(clubId, tab = 'members') => setPanel({ clubId, tab })}
          />
        ) : (
          <div className="empty-state">
            <div className="empty-emoji">💬</div>
            <h2>ClubConnect</h2>
            <p>
              Send direct messages, chat with your clubs, follow announcements,
              <br />
              schedule events and share resources — all in one place.
            </p>
            <p className="empty-hint">Select a chat to start messaging</p>
          </div>
        )}
      </div>
      {panel && (
        <ClubInfoPanel clubId={panel.clubId} initialTab={panel.tab} onClose={() => setPanel(null)} />
      )}
    </div>
  )
}
