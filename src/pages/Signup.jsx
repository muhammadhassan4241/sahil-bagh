import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Waves, Loader2, Home as HomeIcon, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { useAuth } from '@/context/AuthContext'

export default function Signup() {
  const { signUp, demoLogin, isSupabaseConfigured } = useAuth()
  const navigate = useNavigate()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('owner')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await signUp({ email, password, fullName, role })
      setDone(true)
    } catch (err) {
      const msg = err?.message && err.message !== '{}' && err.message !== '[object Object]'
        ? err.message
        : 'Unable to create account. Please check your information or try again.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  if (done) {
    return (
      <div className="mx-auto flex min-h-[80vh] max-w-md flex-col items-center justify-center px-4 text-center">
        <Waves className="h-10 w-10 text-teal-600" />
        <h1 className="mt-4 font-display text-2xl">Account Created!</h1>
        <p className="mt-2 text-ink-500">Please verify your email address, then log in.</p>
        <Button className="mt-6" onClick={() => navigate('/login')}>Go to Login</Button>
      </div>
    )
  }

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-md flex-col justify-center px-4 py-16">
      <div className="mb-6 flex items-center justify-center gap-2 font-display text-2xl font-semibold text-teal-800">
        <Waves className="h-6 w-6" /> Sahil & Bagh
      </div>

      <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
        <h1 className="font-display text-2xl font-medium">Create an Account</h1>

        {!isSupabaseConfigured && (
          <p className="mt-4 rounded-lg bg-amber-100 px-3 py-2 text-xs text-ink-700">
            Demo mode: Supabase is not configured. Set up your .env file to enable signup.
          </p>
        )}

        <div className="mt-5 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setRole('customer')}
            className={cn(
              'flex flex-col items-center gap-1.5 rounded-xl border-2 p-4 text-sm font-medium transition',
              role === 'customer' ? 'border-teal-600 bg-teal-100 text-teal-800' : 'border-border text-ink-700'
            )}
          >
            <User className="h-5 w-5" /> Customer
          </button>
          <button
            type="button"
            onClick={() => setRole('owner')}
            className={cn(
              'flex flex-col items-center gap-1.5 rounded-xl border-2 p-4 text-sm font-medium transition',
              role === 'owner' ? 'border-teal-600 bg-teal-100 text-teal-800' : 'border-border text-ink-700'
            )}
          >
            <HomeIcon className="h-5 w-5" /> Property Owner
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <Label htmlFor="fullName">Full Name</Label>
            <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>

          {error && (
            <div className="space-y-2 rounded-xl bg-coral-500/10 p-4 text-sm text-coral-700">
              <p className="font-medium">{error}</p>
              <div className="border-t border-coral-500/20 pt-2 text-xs text-ink-700">
                <p className="font-semibold text-ink-900">How to resolve:</p>
                <p className="mt-1">
                  • <strong>Fix in Supabase:</strong> Copy and run <code className="rounded bg-white/70 px-1.5 py-0.5 font-mono text-teal-800">supabase/fix_signup_trigger.sql</code> in your Supabase Dashboard &gt; SQL Editor.
                </p>
                <p className="mt-1.5">
                  • <strong>Or test immediately:</strong>
                </p>
                <button
                  type="button"
                  onClick={() => {
                    demoLogin(role, fullName || (role === 'owner' ? 'Demo Owner' : 'Demo Customer'))
                    navigate(role === 'owner' ? '/dashboard' : '/listings')
                  }}
                  className="mt-2 inline-flex items-center rounded-lg bg-teal-700 px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-teal-800"
                >
                  Continue in Demo Mode &rarr;
                </button>
              </div>
            </div>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {loading ? 'Creating Account...' : 'Sign Up'}
          </Button>
        </form>

        <p className="mt-5 text-center text-sm text-ink-500">
          Already have an account? <Link to="/login" className="font-medium text-teal-700 hover:underline">Log in</Link>
        </p>
      </div>
    </div>
  )
}
