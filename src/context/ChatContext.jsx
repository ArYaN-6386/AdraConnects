import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './AuthContext'

const ChatContext = createContext(null)

export function ChatProvider({ children }) {
  const { user } = useAuth()
  const [chats, setChats] = useState([])
  const [chatsLoading, setChatsLoading] = useState(true)
  const [activeId, setActiveId] = useState(null)

  // Pub/sub so any open chat window reacts to the single db-changes channel
  const messageListeners = useRef(new Set())
  const readListeners = useRef(new Set())
  const profileCache = useRef(new Map())
  const activeIdRef = useRef(null)
  activeIdRef.current = activeId

  const refreshChats = useCallback(async () => {
    const { data, error } = await supabase.rpc('get_chat_list')
    if (!error && data) setChats(data)
    setChatsLoading(false)
  }, [])

  const getProfile = useCallback(async (id) => {
    if (profileCache.current.has(id)) return profileCache.current.get(id)
    const { data } = await supabase.from('profiles').select('*').eq('id', id).single()
    if (data) profileCache.current.set(id, data)
    return data
  }, [])

  const markRead = useCallback(
    async (conversationId) => {
      if (!user || !conversationId) return
      setChats((cs) =>
        cs.map((c) => (c.conversation_id === conversationId ? { ...c, unread_count: 0 } : c))
      )
      await supabase.from('conversation_reads').upsert(
        {
          conversation_id: conversationId,
          user_id: user.id,
          last_read_at: new Date().toISOString(),
        },
        { onConflict: 'conversation_id,user_id' }
      )
    },
    [user]
  )

  useEffect(() => {
    if (!user) return
    refreshChats()
    const channel = supabase
      .channel('db-changes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => {
          const msg = payload.new
          messageListeners.current.forEach((cb) => cb(msg))
          // Reading the open conversation keeps our unread at 0 and the peer's ticks blue
          if (msg.conversation_id === activeIdRef.current && msg.sender_id !== user.id) {
            markRead(msg.conversation_id)
          }
          refreshChats()
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'conversation_reads' },
        (payload) => {
          if (payload.new) readListeners.current.forEach((cb) => cb(payload.new))
        }
      )
      .subscribe()
    return () => {
      supabase.removeChannel(channel)
    }
  }, [user, refreshChats, markRead])

  const onNewMessage = useCallback((cb) => {
    messageListeners.current.add(cb)
    return () => messageListeners.current.delete(cb)
  }, [])

  const onReadChange = useCallback((cb) => {
    readListeners.current.add(cb)
    return () => readListeners.current.delete(cb)
  }, [])

  const openConversation = useCallback(
    (id) => {
      setActiveId(id)
      markRead(id)
    },
    [markRead]
  )

  const activeChat = chats.find((c) => c.conversation_id === activeId) ?? null

  const value = {
    chats,
    chatsLoading,
    refreshChats,
    activeId,
    activeChat,
    openConversation,
    closeConversation: () => setActiveId(null),
    onNewMessage,
    onReadChange,
    markRead,
    getProfile,
  }
  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>
}

export const useChat = () => useContext(ChatContext)
