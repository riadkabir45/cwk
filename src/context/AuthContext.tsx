import React, { createContext, useContext, useEffect, useState } from 'react'
import type { User as SupabaseUser, Session, AuthError } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { api } from '../lib/api'

// Extended user interface with role information
interface User extends SupabaseUser {
  primaryRole?: string
  roles?: string[]
  firstName?: string
  lastName?: string
  mentorshipEligible?: boolean
}

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signUp: (email: string, password: string, firstName: string, lastName: string) => Promise<{ error: AuthError | null }>
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>
  signOut: () => Promise<{ error: AuthError | null }>
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>
  refreshUserData: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  // Function to fetch and merge user data from backend
  const refreshUserData = async () => {
    if (!session) return

    try {
      const response = await api.get('/api/auth/me')
      const backendUser = response.data
      
      // Merge Supabase user with backend user data
      if (session.user) {
        setUser({
          ...session.user,
          primaryRole: backendUser.primaryRole,
          roles: backendUser.roles,
          firstName: backendUser.firstName,
          lastName: backendUser.lastName,
          mentorshipEligible: backendUser.mentorshipEligible
        })
      }
    } catch (error) {
      console.error('Failed to fetch user data from backend:', error)
      // Fall back to Supabase user data only
      if (session?.user) {
        setUser(session.user)
      }
    }
  }

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setSession(session)
      if (session?.user) {
        setUser(session.user)
        // Fetch additional user data from backend
        await refreshUserData()
      }
      setLoading(false)
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session)
        if (session?.user) {
          setUser(session.user)
          // Fetch additional user data from backend when auth state changes
          await refreshUserData()
        } else {
          setUser(null)
        }
        setLoading(false)

        // Optional: sync with backend when user signs in/out
        if (event === 'SIGNED_IN' && session?.user) {
          console.log('User signed in:', session.user)
        } else if (event === 'SIGNED_OUT') {
          console.log('User signed out')
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signUp = async (email: string, password: string, firstName: string, lastName: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
        }
      }
    })
    return { error }
  }

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { error }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  }

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    })
    return { error }
  }

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
    refreshUserData,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
