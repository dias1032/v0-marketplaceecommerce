"use client"
import { useCallback, useEffect, useState } from 'react'
import { User as SupabaseUser } from '@supabase/supabase-js'
import { supabaseClient } from './supabaseClient'
import { User } from '../types/user'

// Real Supabase auth hook that listens to auth state changes
export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // Map Supabase user to our User type
  const mapUser = useCallback((sbUser: SupabaseUser | null): User | null => {
    if (!sbUser) return null
    return {
      id: sbUser.id,
      email: sbUser.email ?? '',
      name: sbUser.user_metadata?.full_name,
      role: sbUser.user_metadata?.role ?? 'client'
    }
  }, [])

  // Initial session check
  useEffect(() => {
    async function getInitialUser() {
      try {
        const { data: { user } } = await supabaseClient.auth.getUser()
        setUser(mapUser(user))
      } catch (error) {
        console.error('Error getting user:', error)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }
    getInitialUser()
  }, [mapUser])

  // Subscribe to auth changes
  useEffect(() => {
    const { data: { subscription } } = supabaseClient.auth.onAuthStateChange(
      async (event, session) => {
        setUser(mapUser(session?.user ?? null))
        setLoading(false)
      }
    )
    return () => subscription.unsubscribe()
  }, [mapUser])

  // Login with email/password
  const login = async (email: string, password: string) => {
    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email,
      password
    })
    if (error) throw error
    return data
  }

  // Register new user
  const register = async (email: string, password: string) => {
    const { data, error } = await supabaseClient.auth.signUp({
      email,
      password,
      options: {
        data: { role: 'client' } // default role
      }
    })
    if (error) throw error
    return data
  }

  // Logout
  const logout = async () => {
    const { error } = await supabaseClient.auth.signOut()
    if (error) throw error
  }

  return {
    user,
    loading,
    login,
    register,
    logout
  }
}

// Context utility to access auth state globally
import { createContext, useContext } from 'react'

export const AuthContext = createContext<ReturnType<typeof useAuth> | undefined>(undefined)

export function useAuthContext() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider')
  }
  return context
}
