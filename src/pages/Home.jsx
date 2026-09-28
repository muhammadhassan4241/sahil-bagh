import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ShieldCheck, CalendarCheck, MessagesSquare, TrendingUp } from 'lucide-react'
import { SearchFilters } from '@/components/SearchFilters'
import { PropertyCard } from '@/components/PropertyCard'
import { Button } from '@/components/ui/button'
import { fetchProperties } from '@/lib/api/properties'

const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

function AvailabilityStrip() {
  // Signature element: a live-looking weekly availability strip echoing the booking calendar.
  const today = new Date()
  const days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(today)
    d.setDate(today.getDate() + i)
    const dow = (d.getDay() + 6) % 7 // Monday=0
    const open = ![2, 5].includes(i) // demo pattern: a couple of booked days
    return { date: d.getDate(), label: dayLabels[dow], open }
  })

  return (
    <div className="rounded-2xl border border-white/30 bg-white/10 p-4 backdrop-blur-md">
      <div className="mb-3 flex items-center justify-between text-xs font-medium text-sand-50/90">
        <span className="flex items-center gap-1.5">
          <CalendarCheck className="h-3.5 w-3.5" /> This week's availability (sample)
        </span>
        <span className="hidden sm:inline">Live calendar on every listing</span>
      </div>
      <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
        {days.map((d, i) => (
          <div
            key={i}
            className={`flex flex-col items-center rounded-xl px-1.5 py-2 text-center transition ${
              d.open ? 'bg-white/90 text-teal-800' : 'bg-ink-900/30 text-sand-100/70 line-through'
            }`}
          >
            <span className="text-[10px] uppercase tracking-wide opacity-70">{d.label.slice(0, 3)}</span>
            <span className="font-display text-lg font-semibold">{d.date}</span>
            <span className={`mt-1 h-1.5 w-1.5 rounded-full ${d.open ? 'bg-teal-600' : 'bg-coral-500'}`} />
          </div>
        ))}
      </div>
    </div>
  )
}

export default function Home() {
  const navigate = useNavigate()
  const [featured, setFeatured] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProperties()
      .then((data) => setFeatured((data || []).slice(0, 6)))
      .catch((err) => {
        console.error('Failed to load featured properties:', err)
        setFeatured([])
      })
      .finally(() => setLoading(false))
  }, [])

  function handleSearch(filters) {
    const params = new URLSearchParams(filters)
    navigate(`/listings?${params.toString()}`)
  }

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1600"
            alt="Karachi beach coastline"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-teal-900/90 via-teal-900/50 to-teal-800/30" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 pb-20 pt-24 sm:px-6 sm:pt-32 lg:px-8">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-sand-50 backdrop-blur">
              <ShieldCheck className="h-3.5 w-3.5" /> Verified listings only — no fake ads
            </span>
            <h1 className="mt-5 font-display text-4xl font-medium leading-[1.1] text-white sm:text-5xl lg:text-6xl">
              Book Karachi's best beach huts &amp; farmhouses, <span className="text-amber-500">in one click</span>
            </h1>
            <p className="mt-5 max-w-xl text-base text-sand-100/90 sm:text-lg">
              From Hawke's Bay to French Beach — transparent pricing, real photos, and guaranteed calendar availability. No more messy social media groups or agent hassles.
            </p>
          </div>

          <div className="mt-8 max-w-3xl">
            <SearchFilters onSearch={handleSearch} floating />
          </div>

          <div className="mt-8 max-w-md">
            <AvailabilityStrip />
          </div>
        </div>
      </section>

      {/* USPs */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {[
            { icon: ShieldCheck, title: 'Verified & Authentic', desc: 'Every listing is personally verified — what you see in the photos is what you get.' },
            { icon: CalendarCheck, title: 'No Double Booking', desc: 'Live availability calendar — booked dates cannot be reserved twice.' },
            { icon: MessagesSquare, title: 'Direct WhatsApp', desc: 'Chat directly with the property owner with zero middlemen or hidden agent commissions.' },
          ].map((f) => (
            <div key={f.title} className="rounded-2xl border border-border bg-card p-6">
              <f.icon className="h-8 w-8 text-teal-600" />
              <h3 className="mt-4 font-display text-lg font-medium">{f.title}</h3>
              <p className="mt-1.5 text-sm text-ink-500">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURED LISTINGS */}
      <section className="bg-sand-100/60 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wide text-coral-500">Handpicked</span>
              <h2 className="font-display text-3xl font-medium text-ink-900">Featured Stays</h2>
            </div>
            <Button variant="outline" onClick={() => navigate('/listings')}>View All</Button>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-80 animate-pulse rounded-2xl bg-sand-200/70" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featured.map((p) => <PropertyCard key={p.id} property={p} />)}
            </div>
          )}
        </div>
      </section>

      {/* OWNER CTA */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-6 rounded-3xl bg-teal-700 px-6 py-12 text-center sm:px-16">
          <TrendingUp className="h-10 w-10 text-amber-500" />
          <h2 className="font-display text-3xl font-medium text-white sm:text-4xl">List your property and maximize your bookings</h2>
          <p className="max-w-xl text-sand-100/90">
            Manage your reservations with an intuitive dashboard, keep your calendar synchronized, and gain premium visibility for your venue.
          </p>
          <Button variant="coral" size="lg" onClick={() => navigate('/signup')}>List Your Property for Free</Button>
        </div>
      </section>
    </>
  )
}
