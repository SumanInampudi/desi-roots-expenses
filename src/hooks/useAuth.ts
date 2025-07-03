import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import type { User, AuthState } from '../types/auth'

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null
  })

  useEffect(() => {
    // Check if Supabase is properly configured
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      setAuthState({
        user: null,
        loading: false,
        error: 'Supabase configuration missing. Please check your environment variables.'
      })
      return
    }

    // Get initial session
    const getSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        if (error) throw error

        if (session?.user) {
          // Get user profile
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single()

          if (profileError) {
            console.error('Profile fetch error:', profileError)
            // If profile doesn't exist, user might not be set up properly
            setAuthState({
              user: null,
              loading: false,
              error: 'User profile not found. Please contact administrator.'
            })
            return
          }

          setAuthState({
            user: {
              id: session.user.id,
              email: session.user.email!,
              full_name: profile.full_name,
              is_admin: profile.is_admin
            },
            loading: false,
            error: null
          })
        } else {
          setAuthState({
            user: null,
            loading: false,
            error: null
          })
        }
      } catch (error) {
        console.error('Session error:', error)
        setAuthState({
          user: null,
          loading: false,
          error: error instanceof Error ? error.message : 'Authentication error'
        })
      }
    }

    getSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.email)
      
      if (session?.user) {
        try {
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single()

          if (profileError) {
            console.error('Profile fetch error:', profileError)
            setAuthState({
              user: null,
              loading: false,
              error: 'User profile not found. Please contact administrator.'
            })
            return
          }

          setAuthState({
            user: {
              id: session.user.id,
              email: session.user.email!,
              full_name: profile.full_name,
              is_admin: profile.is_admin
            },
            loading: false,
            error: null
          })
        } catch (error) {
          console.error('Auth change error:', error)
          setAuthState({
            user: null,
            loading: false,
            error: error instanceof Error ? error.message : 'Profile fetch error'
          })
        }
      } else {
        setAuthState({
          user: null,
          loading: false,
          error: null
        })
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }))
      
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) throw error
    } catch (error) {
      console.error('Sign in error:', error)
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Sign in failed'
      }))
      throw error
    }
  }

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  return {
    ...authState,
    signIn,
    signOut
  }
}