import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { Menu, X, Waves, UserCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/context/AuthContext'

const links = [
  { to: '/listings', label: 'Beach Huts', filter: 'beach_hut' },
  { to: '/listings', label: 'Farmhouses', filter: 'farmhouse' },
  { to: '/how-it-works', label: 'How It Works' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
  { to: '/dashboard', label: 'Owner Dashboard' },
]

export function Navbar() {
  const [open, setOpen] = useState(false)
  const { user, profile, signOut } = useAuth()
  const navigate = useNavigate()

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-sand-50/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2 font-display text-xl font-semibold text-teal-800">
          <Waves className="h-6 w-6 text-teal-600" />
          Sahil <span className="text-coral-500">&</span> Bagh
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          {links.map((l) => (
            <NavLink
              key={l.label}
              to={l.filter ? `${l.to}?type=${l.filter}` : l.to}
              className="text-sm font-medium text-ink-700 transition hover:text-teal-700"
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {user ? (
            <>
              <span className="flex items-center gap-1.5 text-sm text-ink-700">
                <UserCircle2 className="h-5 w-5 text-teal-600" />
                {profile?.full_name || 'Account'}
              </span>
              <Button variant="ghost" size="sm" onClick={() => signOut()}>
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>
                Login
              </Button>
              <Button size="sm" onClick={() => navigate('/signup')}>
                List Your Property
              </Button>
            </>
          )}
        </div>

        <button className="md:hidden" onClick={() => setOpen(!open)} aria-label="Menu toggle">
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-border bg-sand-50 px-4 py-4 md:hidden">
          <div className="flex flex-col gap-4">
            {links.map((l) => (
              <NavLink
                key={l.label}
                to={l.filter ? `${l.to}?type=${l.filter}` : l.to}
                onClick={() => setOpen(false)}
                className="text-sm font-medium text-ink-700"
              >
                {l.label}
              </NavLink>
            ))}
            <div className="flex gap-3 pt-2">
              {user ? (
                <Button variant="ghost" size="sm" onClick={() => signOut()}>Logout</Button>
              ) : (
                <>
                  <Button variant="ghost" size="sm" onClick={() => { setOpen(false); navigate('/login') }}>Login</Button>
                  <Button size="sm" onClick={() => { setOpen(false); navigate('/signup') }}>List Property</Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
