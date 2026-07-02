import { useCallback, useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

export function useTyping(conversationId) {
  const { user, profile } = useAuth()
  const [typers, setTypers] = useState({}) // user_id -> { name, ts }
  const channelRef = useRef(null)
  const lastSentRef = useRef(0)

  useEffect(() => {
    if (!conversationId || !user) return
    setTypers({})
    const channel = supabase.channel(`typing:${conversationId}`, {
      config: { broadcast: { self: false } },
    })
    channel
      .on('broadcast', { event: 'typing' }, ({ payload }) => {
        if (!payload || payload.user_id === user.id) return
        setTypers((t) => ({ ...t, [payload.user_id]: { name: payload.name, ts: Date.now() } }))
      })
      .subscribe()
    channelRef.current = channel

    const sweep = setInterval(() => {
      setTypers((t) => {
        const now = Date.now()
        const fresh = Object.fromEntries(Object.entries(t).filter(([, v]) => now - v.ts < 3000))
        return Object.keys(fresh).length === Object.keys(t).length ? t : fresh
      })
    }, 1000)

    return () => {
      clearInterval(sweep)
      supabase.removeChannel(channel)
      channelRef.current = null
    }
  }, [conversationId, user])

  const sendTyping = useCallback(() => {
    const now = Date.now()
    if (now - lastSentRef.current < 1500 || !channelRef.current) return
    lastSentRef.current = now
    channelRef.current.send({
      type: 'broadcast',
      event: 'typing',
      payload: { user_id: user.id, name: profile?.full_name ?? 'Someone' },
    })
  }, [user, profile])

  const typingNames = Object.values(typers).map((t) => t.name)
  return { typingNames, sendTyping }
}
