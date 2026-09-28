import { Search, CalendarCheck, MessageCircle, PartyPopper } from 'lucide-react'

const STEPS = [
  [Search, '1. Discover', 'Filter by location, property type, and guest capacity to find your ideal getaway.'],
  [CalendarCheck, '2. Explore Details', 'Review transparent prices, verified amenities, high-resolution galleries, and guest reviews.'],
  [MessageCircle, '3. Send Request', 'Submit your booking request with direct communication with the property owner.'],
  [PartyPopper, '4. Enjoy Your Stay', 'Confirm your reservation and enjoy an unforgettable experience with friends and family.'],
]

export default function HowItWorks() {
  return (
    <section className="mx-auto min-h-[70vh] w-[92%] max-w-6xl py-16">
      <div className="mx-auto max-w-2xl pb-12 text-center">
        <span className="text-xs font-semibold uppercase tracking-widest text-teal-600">How It Works</span>
        <h1 className="mt-2 font-display text-4xl font-semibold text-ink-900 sm:text-5xl">
          Booking Made Simple
        </h1>
        <p className="mt-4 text-ink-700">A straightforward, four-step process for guests and property owners alike.</p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {STEPS.map(([Icon, title, desc]) => (
          <div key={title} className="rounded-2xl border border-border bg-card p-7 shadow-sm">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-teal-100 text-teal-700">
              <Icon className="h-6 w-6" />
            </div>
            <h2 className="font-display text-lg font-medium text-ink-900">{title}</h2>
            <p className="mt-2 text-sm text-ink-700">{desc}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
