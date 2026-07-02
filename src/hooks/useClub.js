import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

export function useClub(clubId) {
  const { user } = useAuth()
  const [club, setClub] = useState(null)
  const [members, setMembers] = useState([])

  const refresh = useCallback(async () => {
    if (!clubId) return
    const [clubRes, membersRes] = await Promise.all([
      supabase.from('clubs').select('*').eq('id', clubId).single(),
      supabase
        .from('memberships')
        .select('role, joined_at, profile:profiles(id, full_name, email, avatar_color)')
        .eq('club_id', clubId)
        .order('joined_at'),
    ])
    setClub(clubRes.data)
    setMembers(membersRes.data ?? [])
  }, [clubId])

  useEffect(() => {
    refresh()
  }, [refresh])

  const myRole = members.find((m) => m.profile?.id === user.id)?.role ?? null

  const leaveClub = useCallback(async () => {
    await supabase.from('memberships').delete().eq('club_id', clubId).eq('user_id', user.id)
  }, [clubId, user])

  const removeMember = useCallback(
    async (memberId) => {
      await supabase.from('memberships').delete().eq('club_id', clubId).eq('user_id', memberId)
      refresh()
    },
    [clubId, refresh]
  )

  return { club, members, myRole, leaveClub, removeMember, refresh }
}
