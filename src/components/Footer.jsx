import { Link } from 'react-router-dom'
import { Waves, AtSign, Share2, Mail } from 'lucide-react'

export function Footer() {
  return (
    <footer className="border-t border-border bg-teal-800 text-sand-50">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
          <div>
            <div className="mb-3 flex items-center gap-2 font-display text-lg font-semibold">
              <Waves className="h-5 w-5" /> Sahil & Bagh
            </div>
            <p className="text-sm text-sand-100/80">
              Verified bookings for Karachi's premier beach huts and farmhouses — transparent, reliable, and stress-free.
            </p>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-sand-100/60">Explore</h4>
            <ul className="space-y-2 text-sm text-sand-100/90">
              <li><Link to="/listings?type=beach_hut" className="hover:text-white">Beach Huts</Link></li>
              <li><Link to="/listings?type=farmhouse" className="hover:text-white">Farmhouses</Link></li>
              <li><Link to="/listings" className="hover:text-white">All Listings</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-sand-100/60">Company</h4>
            <ul className="space-y-2 text-sm text-sand-100/90">
              <li><Link to="/about" className="hover:text-white">About Us</Link></li>
              <li><Link to="/how-it-works" className="hover:text-white">How It Works</Link></li>
              <li><Link to="/contact" className="hover:text-white">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-sand-100/60">Owners</h4>
            <ul className="space-y-2 text-sm text-sand-100/90">
              <li><Link to="/signup" className="hover:text-white">List Your Property</Link></li>
              <li><Link to="/dashboard" className="hover:text-white">Owner Dashboard</Link></li>
              <li><Link to="/dashboard" className="hover:text-white">Featured Listing</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-sand-100/60">Contact</h4>
            <div className="flex gap-3">
              <a href="#" className="rounded-full bg-white/10 p-2 hover:bg-white/20"><AtSign className="h-4 w-4" /></a>
              <a href="#" className="rounded-full bg-white/10 p-2 hover:bg-white/20"><Share2 className="h-4 w-4" /></a>
              <a href="mailto:hello@sahilbagh.pk" className="rounded-full bg-white/10 p-2 hover:bg-white/20"><Mail className="h-4 w-4" /></a>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-white/10 pt-6 text-center text-xs text-sand-100/60">
          &copy; {new Date().getFullYear()} Sahil & Bagh. All rights reserved. Made with pride for Karachi.
        </div>
      </div>
    </footer>
  )
}
