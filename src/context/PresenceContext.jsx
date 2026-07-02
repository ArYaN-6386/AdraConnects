import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './AuthContext'

const PresenceContext = createContext({ onlineIds: new Set() })

export function PresenceProvider({ children }) {
  const { user } = useAuth()
  const [onlineIds, setOnlineIds] = useState(new Set())

  useEffect(() => {
    if (!user) return
    const channel = supabase.channel('presence:lobby', {
      config: { presence: { key: user.id } },
    })
    channel
      .on('presence', { event: 'sync' }, () => {
        setOnlineIds(new Set(Object.keys(channel.presenceState())))
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          channel.track({ online_at: new Date().toISOString() })
        }
      })
    return () => {
      supabase.removeChannel(channel)
      setOnlineIds(new Set())
    }
  }, [user])

  return <PresenceContext.Provider value={{ onlineIds }}>{children}</PresenceContext.Provider>
}

export const usePresence = () => useContext(PresenceContext)
