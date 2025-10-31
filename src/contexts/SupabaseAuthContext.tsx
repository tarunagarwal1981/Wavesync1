import React, { createContext, useContext, useEffect, useState } from 'react'
import { User, Session, AuthError } from '@supabase/supabase-js'
import { supabase, UserProfile } from '../lib/supabase'

interface AuthContextType {
  user: User | null
  session: Session | null
  profile: UserProfile | null
  loading: boolean
  authLoading: boolean
  signUp: (email: string, password: string, userData: Partial<UserProfile>) => Promise<{ error: any | null }>
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>
  signOut: () => Promise<{ error: AuthError | null }>
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ error: any }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: React.ReactNode
}

export const SupabaseAuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [authLoading, setAuthLoading] = useState(false)

  // Guards to prevent repeated profile fetches/timeouts
  const lastAuthEventRef = React.useRef<number>(0)
  const inFlightRef = React.useRef<boolean>(false)
  const lastFetchRef = React.useRef<{ timestamp: number; succeeded: boolean } | null>(null)

  // Keep a ref mirror of profile to safely read inside effects without re-subscribing
  const profileRef = React.useRef<UserProfile | null>(null)
  useEffect(() => { profileRef.current = profile }, [profile])

  useEffect(() => {
    console.log('🚀 SupabaseAuthProvider: Initializing...')
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('📋 Initial session check:', session ? 'Found session' : 'No session')
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        console.log('👤 User found in session:', session.user.email)
        // Optimistic hydration: use cached profile to render sidebar immediately
        try {
          const cached = localStorage.getItem('ws_profile_cache')
          if (cached) {
            const parsed = JSON.parse(cached)
            if (parsed && parsed.id === session.user.id) {
              setProfile(parsed)
              setLoading(false)
            }
          }
        } catch {}
        fetchUserProfile(session.user.id)
      } else {
        console.log('❌ No user in session, setting loading to false')
        setLoading(false)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔄 Auth state change:', event, session ? 'Session exists' : 'No session')
      // Debounce rapid duplicate events
      const nowTs = Date.now()
      if (nowTs - lastAuthEventRef.current < 1500) {
        console.log('⏳ Ignoring rapid duplicate auth event')
        return
      }
      lastAuthEventRef.current = nowTs

      setSession(session)
      setUser(session?.user ?? null)

      if (session?.user) {
        console.log('👤 User in auth change:', session.user.email)

        // If we already have the profile for this user, don't refetch
        const currentProfile = profileRef.current
        if (currentProfile && currentProfile.id === session.user.id) {
          console.log('⏭️ Using existing profile in state')
          setLoading(false)
          return
        }

        // Cooldown after failed attempt to avoid retry loop
        const last = lastFetchRef.current
        if (last && !last.succeeded && (Date.now() - last.timestamp) < 30000) {
          console.log('⏭️ Recent failed profile attempt, skipping to avoid retry loop')
          setLoading(false)
          return
        }

        // Prevent concurrent fetches
        if (inFlightRef.current) {
          console.log('⏳ Profile fetch already in-flight, skipping')
          return
        }

        await fetchUserProfile(session.user.id)
      } else {
        console.log('❌ No user in auth change, clearing profile and setting loading to false')
        setProfile(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const fetchUserProfile = async (userId: string, retryCount = 0) => {
    try {
      console.log('🔍 Fetching user profile for:', userId, retryCount > 0 ? `(retry ${retryCount})` : '')
      inFlightRef.current = true
      lastFetchRef.current = { timestamp: Date.now(), succeeded: false }

      // 30s timeout for resilience
      const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Profile fetch timeout')), 30000))
      const dbFetchPromise = supabase.from('user_profiles').select('*').eq('id', userId).single()

      const { data, error } = await Promise.race([dbFetchPromise, timeoutPromise]) as any

      if (error) {
        console.error('❌ Error fetching user profile:', error)
        // single retry for timeout/network
        if (retryCount < 1 && (error.message?.includes('timeout') || (error as any).code === 'PGRST301')) {
          console.log('🔄 Retrying profile fetch...')
          await new Promise(resolve => setTimeout(resolve, 1000))
          return fetchUserProfile(userId, retryCount + 1)
        }
        setProfile(null)
        lastFetchRef.current = { timestamp: Date.now(), succeeded: false }
      } else {
        console.log('✅ User profile loaded:', data)
        setProfile(data)
        try {
          localStorage.setItem('ws_profile_cache', JSON.stringify(data))
        } catch {}
        lastFetchRef.current = { timestamp: Date.now(), succeeded: true }
      }
    } catch (error) {
      console.error('❌ Error fetching user profile:', error)
      setProfile(null)
      lastFetchRef.current = { timestamp: Date.now(), succeeded: false }
    } finally {
      console.log('🔄 Setting loading to false')
      setLoading(false)
      inFlightRef.current = false
    }
  }

  const signUp = async (email: string, password: string, userData: Partial<UserProfile>) => {
    try {
      setAuthLoading(true)
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      })

      if (error) {
        return { error }
      }

      if (data.user) {
        // Create user profile
        const { error: profileError } = await supabase
          .from('user_profiles')
          .insert({
            id: data.user.id,
            email: data.user.email!,
            full_name: userData.full_name || '',
            user_type: userData.user_type || 'seafarer',
            phone: userData.phone,
            company_id: userData.company_id,
          })

        if (profileError) {
          console.error('Error creating user profile:', profileError)
          return { error: profileError }
        }

        // If user is a seafarer, create seafarer profile
        if (userData.user_type === 'seafarer') {
          const { error: seafarerError } = await supabase
            .from('seafarer_profiles')
            .insert({
              user_id: data.user.id,
              rank: 'Cadet',
              certificate_number: null,
              experience_years: 0,
            })

          if (seafarerError) {
            console.error('Error creating seafarer profile:', seafarerError)
          }
        }
      }

      return { error: null }
    } catch (error) {
      return { error: error as AuthError }
    } finally {
      setAuthLoading(false)
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      setAuthLoading(true)
      console.log('🔐 Attempting sign in for:', email)
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      if (error) {
        console.log('❌ Sign in error:', error.message)
        return { error }
      } else {
        console.log('✅ Sign in successful for:', data.user?.email)
        return { error: null }
      }
    } catch (error) {
      console.log('💥 Sign in exception:', error)
      return { error: error as AuthError }
    } finally {
      setAuthLoading(false)
    }
  }

  const signOut = async () => {
    try {
      // Clear local state first
      setUser(null)
      setProfile(null)
      setSession(null)
      
      // Sign out with local scope (not global which requires special permissions)
      const { error } = await supabase.auth.signOut({ scope: 'local' })
      
      // Clear any stored session data
      localStorage.removeItem('supabase.auth.token')
      sessionStorage.clear()
      
      return { error }
    } catch (error) {
      // Even if signOut fails, clear local state
      setUser(null)
      setProfile(null)
      setSession(null)
      return { error: error as AuthError }
    }
  }

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) {
      return { error: new Error('No user logged in') }
    }

    try {
      const { error } = await supabase
        .from('user_profiles')
        .update(updates)
        .eq('id', user.id)

      if (error) {
        return { error }
      }

      // Refresh profile
      await fetchUserProfile(user.id)
      return { error: null }
    } catch (error) {
      return { error }
    }
  }

  const value = {
    user,
    session,
    profile,
    loading,
    authLoading,
    signUp,
    signIn,
    signOut,
    updateProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
