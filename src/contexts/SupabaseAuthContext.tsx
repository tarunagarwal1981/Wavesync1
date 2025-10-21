import React, { createContext, useContext, useEffect, useState } from 'react'
import { User, Session, AuthError } from '@supabase/supabase-js'
import { supabase, UserProfile } from '../lib/supabase'

interface AuthContextType {
  user: User | null
  session: Session | null
  profile: UserProfile | null
  loading: boolean
  authLoading: boolean // Separate loading state for auth operations
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
  const [loading, setLoading] = useState(true) // Loading state for initial session check
  const [authLoading, setAuthLoading] = useState(false) // Loading state for auth operations

  useEffect(() => {
    console.log('🚀 SupabaseAuthProvider: Initializing...')
    
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('📋 Initial session check:', session ? 'Found session' : 'No session')
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        console.log('👤 User found in session:', session.user.email)
        fetchUserProfile(session.user.id)
      } else {
        console.log('❌ No user in session, setting loading to false')
        setLoading(false)
      }
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔄 Auth state change:', event, session ? 'Session exists' : 'No session')
      setSession(session)
      setUser(session?.user ?? null)
      
      if (session?.user) {
        console.log('👤 User in auth change:', session.user.email)
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
      
      // Reduce timeout to 10 seconds for faster failure and better UX
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Profile fetch timeout')), 10000)
      )
      
      const fetchPromise = supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single()

      const { data, error } = await Promise.race([fetchPromise, timeoutPromise]) as any

      if (error) {
        console.error('❌ Error fetching user profile:', error)
        
        // Don't retry on timeout - just continue without profile
        // This allows login to succeed even if profile fetch fails
        console.warn('⚠️ Could not fetch profile, continuing without profile data')
        setProfile(null)
      } else {
        console.log('✅ User profile loaded:', data)
        setProfile(data)
      }
    } catch (error) {
      console.error('❌ Error fetching user profile:', error instanceof Error ? error.message : 'Unknown error')
      
      // Don't retry - allow app to continue functioning without profile
      console.warn('⚠️ Could not fetch profile, continuing without profile data')
      setProfile(null)
    } finally {
      console.log('🔄 Setting loading to false')
      setLoading(false)
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
              // For Partial<UserProfile>, these fields are not defined; use safe defaults or omit
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
      const { error } = await supabase.auth.signOut()
      return { error }
    } catch (error) {
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
