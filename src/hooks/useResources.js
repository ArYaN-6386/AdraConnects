import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

// All files/images shared in a club's chat + announcement conversations
export function useResources(clubId) {
  const [resources, setResources] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!clubId) return
    let cancelled = false
    setLoading(true)
    ;(async () => {
      const { data: convs } = await supabase.from('conversations').select('id').eq('club_id', clubId)
      const ids = (convs ?? []).map((c) => c.id)
      if (!ids.length) {
        if (!cancelled) {
          setResources([])
          setLoading(false)
        }
        return
      }
      const { data } = await supabase
        .from('messages')
        .select('*, sender:profiles(full_name)')
        .in('conversation_id', ids)
        .not('attachment_path', 'is', null)
        .order('created_at', { ascending: false })
      if (!cancelled) {
        setResources(data ?? [])
        setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [clubId])

  return { resources, loading }
}
