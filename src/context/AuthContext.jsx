import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [employee, setEmployee] = useState(null) // { role: 'teacher'|'hod', department } or null
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => setSession(s))
    return () => sub.subscription.unsubscribe()
  }, [])

  async function refreshEmployee(uid) {
    if (!uid) {
      setEmployee(null)
      return
    }
    const { data } = await supabase
      .from('employees')
      .select('role, department')
      .eq('user_id', uid)
      .maybeSingle()
    setEmployee(data ?? null)
  }

  useEffect(() => {
    const uid = session?.user?.id
    if (!uid) {
      setProfile(null)
      setEmployee(null)
      return
    }
    supabase
      .from('profiles')
      .select('*')
      .eq('id', uid)
      .single()
      .then(({ data }) => setProfile(data))
    refreshEmployee(uid)
  }, [session?.user?.id])

  // Google is the only sign-in method (email/password is disabled in Supabase Auth)
  async function signInWithGoogle(returnTo = '/') {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}${returnTo}` },
    })
    if (error) throw error
  }

  async function signOut() {
    await supabase.auth.signOut()
  }

  const value = {
    session,
    user: session?.user ?? null,
    profile,
    employee,
    isEmployee: !!employee,
    isHod: employee?.role === 'hod',
    refreshEmployee: () => refreshEmployee(session?.user?.id),
    loading,
    signInWithGoogle,
    signOut,
  }
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
