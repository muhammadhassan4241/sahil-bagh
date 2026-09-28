import { createClient } from '@supabase/supabase-js'

const rawUrl = import.meta.env.VITE_SUPABASE_URL
const rawKey = import.meta.env.VITE_SUPABASE_ANON_KEY

const supabaseUrl = typeof rawUrl === 'string' ? rawUrl.trim() : ''
const supabaseAnonKey = typeof rawKey === 'string' ? rawKey.trim() : ''

function checkSupabaseConfig(url, key) {
  if (!url || !key) return false
  if (url.includes('your-project') || key.includes('your-anon-key')) return false
  try {
    const parsed = new URL(url)
    return parsed.protocol === 'http:' || parsed.protocol === 'https:'
  } catch {
    return false
  }
}

const isValidConfig = checkSupabaseConfig(supabaseUrl, supabaseAnonKey)

if (!isValidConfig) {
  const missing = []
  if (!supabaseUrl) missing.push('VITE_SUPABASE_URL')
  if (!supabaseAnonKey) missing.push('VITE_SUPABASE_ANON_KEY')

  if (missing.length > 0) {
    console.warn(
      `[Supabase Configuration Missing] Missing environment variable(s): ${missing.join(', ')}. ` +
      'Please ensure a .env file exists in the project root with valid VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY. ' +
      'The app will run in demo/mock mode until configured.'
    )
  } else {
    console.warn(
      '[Supabase Configuration Invalid] VITE_SUPABASE_URL must be a valid HTTP/HTTPS URL and keys cannot be placeholders. ' +
      'The app will run in demo/mock mode until valid keys are provided.'
    )
  }
}

let client = null

if (isValidConfig) {
  try {
    client = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  } catch (error) {
    console.error('[Supabase Client Error] Failed to initialize Supabase client:', error)
    client = null
  }
}

export const supabase = client
export const isSupabaseConfigured = Boolean(supabase)

