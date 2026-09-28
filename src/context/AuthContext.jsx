import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setLoading(false)
      return
    }

    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        setUser(session?.user ?? null)
        if (session?.user) loadProfile(session.user)
        else setLoading(false)
      })
      .catch((err) => {
        console.error('[Supabase Auth] Session fetch error:', err)
        setLoading(false)
      })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) loadProfile(session.user)
      else {
        setProfile(null)
        setLoading(false)
      }
    })

    return () => {
      listener?.subscription?.unsubscribe?.()
    }
  }, [])

  async function loadProfile(userOrId) {
    const userId = typeof userOrId === 'string' ? userOrId : userOrId?.id
    if (!userId || !supabase) {
      setLoading(false)
      return
    }

    try {
      const { data } = await supabase.from('profiles').select('*').eq('id', userId).single()
      if (data) {
        setProfile(data)
      } else {
        const metadata = typeof userOrId === 'object' ? userOrId?.user_metadata : null
        setProfile({
          id: userId,
          full_name: metadata?.full_name || '',
          role: metadata?.role || 'customer',
        })
      }
    } catch {
      const metadata = typeof userOrId === 'object' ? userOrId?.user_metadata : null
      setProfile({
        id: userId,
        full_name: metadata?.full_name || '',
        role: metadata?.role || 'customer',
      })
    } finally {
      setLoading(false)
    }
  }

function extractErrorMessage(error, context = 'signup') {
  if (!error) return 'Something went wrong. Please try again.'

  if (typeof error === 'string') {
    const trimmed = error.trim()
    if (trimmed && trimmed !== '{}' && trimmed !== '[object Object]') return trimmed
  }

  if (typeof error === 'object') {
    const candidates = [
      error.message,
      error.error_description,
      error.msg,
      error.error,
      error.details,
      error.hint,
    ]
    let raw = ''
    for (const c of candidates) {
      if (typeof c === 'string') {
        const trimmed = c.trim()
        if (trimmed && trimmed !== '{}' && trimmed !== '[object Object]') {
          raw = trimmed
          break
        }
      }
    }

    // "Failed to fetch" means the browser couldn't reach Supabase at all (network/paused project),
    // not a database problem — keep the wording accurate regardless of which action triggered it.
    if (error.name === 'AuthRetryableFetchError' || /failed to fetch/i.test(raw)) {
      const base = 'Could not reach Supabase. Your project may be paused, or there may be a network issue — check your Supabase dashboard and try again.'
      return raw ? `${base} (Supabase said: ${raw})` : base
    }

    // Specifically handle Supabase 500 error where GoTrue returns "Database error saving new user"
    if (error.status === 500) {
      const base =
        context === 'signup'
          ? 'Database error: Could not save new user. Please ensure the database schema and trigger are configured in Supabase.'
          : 'A server error occurred while logging in. Please try again in a moment.'
      return raw ? `${base} (Supabase said: ${raw})` : base
    }

    if (raw) return raw
  }

  return 'An authentication error occurred. Please try again.'
}

  async function signUp({ email, password, fullName, role }) {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Supabase is not configured — please configure your .env file.')
    }
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName, role: role || 'customer' } },
    })
    if (error) throw new Error(extractErrorMessage(error, 'signup'))
    return data
  }

  async function signIn({ email, password }) {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Supabase is not configured — please configure your .env file.')
    }
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw new Error(extractErrorMessage(error, 'login'))
    return data
  }

  async function resendConfirmation(email) {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Supabase is not configured — please configure your .env file.')
    }
    const { error } = await supabase.auth.resend({ type: 'signup', email })
    if (error) throw new Error(extractErrorMessage(error, 'signup'))
  }

  function demoLogin(role = 'owner', fullName = 'Demo Owner') {
    const demoUser = {
      id: 'demo-owner',
      email: `${role}@demo.com`,
      user_metadata: { full_name: fullName, role },
    }
    setUser(demoUser)
    setProfile({
      id: 'demo-owner',
      full_name: fullName,
      role,
    })
  }

  async function signOut() {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut().catch(() => {})
    }
    setUser(null)
    setProfile(null)
  }

  const value = { user, profile, loading, signUp, signIn, signOut, demoLogin, resendConfirmation, isSupabaseConfigured }
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
