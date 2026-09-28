import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Waves, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/context/AuthContext'

export default function Login() {
  const { signIn, demoLogin, resendConfirmation, isSupabaseConfigured } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [resendState, setResendState] = useState('idle') // idle | sending | sent | error

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setResendState('idle')
    setLoading(true)
    try {
      await signIn({ email, password })
      navigate('/dashboard')
    } catch (err) {
      const msg = err?.message && err.message !== '{}' && err.message !== '[object Object]'
        ? err.message
        : 'Unable to log in. Please check your email and password.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  async function handleResend() {
    setResendState('sending')
    try {
      await resendConfirmation(email)
      setResendState('sent')
    } catch {
      setResendState('error')
    }
  }

  const looksUnconfirmed = /invalid login credentials/i.test(error)

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-md flex-col justify-center px-4 py-16">
      <div className="mb-6 flex items-center justify-center gap-2 font-display text-2xl font-semibold text-teal-800">
        <Waves className="h-6 w-6" /> Sahil & Bagh
      </div>

      <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
        <h1 className="font-display text-2xl font-medium">Login</h1>
        <p className="mt-1 text-sm text-ink-500">Access your bookings and owner dashboard.</p>

        {!isSupabaseConfigured && (
          <p className="mt-4 rounded-lg bg-amber-100 px-3 py-2 text-xs text-ink-700">
            Demo mode: Supabase is not configured. Set up your .env file to enable authentication.
          </p>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>

          {error && (
            <div className="space-y-2 rounded-lg bg-coral-500/10 px-3 py-2 text-sm text-coral-600">
              <p>{error}</p>
              {looksUnconfirmed && (
                <div className="border-t border-coral-500/20 pt-2 text-xs text-ink-700">
                  <p>
                    This usually means your password is wrong, or your email hasn't been verified yet.
                    Check your inbox (and spam folder) for a confirmation email from Supabase.
                  </p>
                  {resendState === 'sent' ? (
                    <p className="mt-1.5 font-medium text-teal-700">Confirmation email sent — check your inbox.</p>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResend}
                      disabled={!email || resendState === 'sending'}
                      className="mt-1.5 inline-flex items-center rounded-lg bg-teal-700 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-teal-800 disabled:opacity-60"
                    >
                      {resendState === 'sending' ? 'Sending...' : 'Resend confirmation email'}
                    </button>
                  )}
                  {resendState === 'error' && (
                    <p className="mt-1.5 text-coral-600">Couldn't resend right now — try again in a moment.</p>
                  )}
                </div>
              )}
            </div>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {loading ? 'Logging in...' : 'Login'}
          </Button>
        </form>

        <p className="mt-5 text-center text-sm text-ink-500">
          Don't have an account? <Link to="/signup" className="font-medium text-teal-700 hover:underline">Sign up</Link>
        </p>

        <div className="mt-5 border-t border-border pt-4 text-center">
          <p className="text-xs text-ink-500">Want to test the platform right away?</p>
          <button
            type="button"
            onClick={() => {
              demoLogin('owner', 'Demo Owner')
              navigate('/dashboard')
            }}
            className="mt-2 inline-flex items-center rounded-lg border border-border bg-sand-100/80 px-3 py-1.5 text-xs font-semibold text-teal-800 transition hover:bg-sand-200"
          >
            Sign in as Demo Owner &rarr;
          </button>
        </div>
      </div>
    </div>
  )
}
