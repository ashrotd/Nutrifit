import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAppStore } from '@/stores/useAppStore'
import { UserProfile } from '@/types'

export function useAuth() {
  const { user, isLoading, setUser, setLoading, setOnboarded, reset } =
    useAppStore()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      console.log('getSession:', session?.user?.email, error)
      if (session?.user) {
        fetchProfile(session.user.id)
      } else {
        setLoading(false)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('authStateChange event:', event, session?.user?.email)
        if (session?.user) {
          await fetchProfile(session.user.id)
        } else {
          reset()
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  async function fetchProfile(userId: string) {
    try {
      console.log('fetchProfile for:', userId)
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      console.log('profile data:', data, 'error:', error)

      if (error) throw error

      const profile = snakeToCamel(data) as UserProfile
      setUser(profile)
      setOnboarded(data.onboarding_completed ?? false)
    } catch (error) {
      console.error('Error fetching profile:', error)
    } finally {
      setLoading(false)
    }
  }

  async function signIn(email: string, password: string) {
    console.log('signIn attempt:', email)
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    console.log('signIn result:', data?.user?.email, error)
    if (error) throw error
    return data
  }

  async function signUp(email: string, password: string, name: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } }
    })
    if (error) throw error
    if (data.user) {
      await supabase
        .from('profiles')
        .update({ name })
        .eq('id', data.user.id)
    }
    return data
  }

  async function signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    reset()
  }

  async function resetPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email)
    if (error) throw error
  }

  return {
    user,
    isLoading,
    signUp,
    signIn,
    signOut,
    resetPassword,
    isAuthenticated: !!user,
  }
}

function snakeToCamel(obj: any): any {
  if (Array.isArray(obj)) return obj.map(snakeToCamel)
  if (obj !== null && typeof obj === 'object') {
    return Object.keys(obj).reduce((acc, key) => {
      const camelKey = key.replace(/_([a-z])/g, (_, letter) =>
        letter.toUpperCase()
      )
      acc[camelKey] = snakeToCamel(obj[key])
      return acc
    }, {} as any)
  }
  return obj
}
