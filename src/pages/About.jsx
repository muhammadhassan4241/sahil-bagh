import { ShieldCheck, Heart, MapPinned } from 'lucide-react'

const VALUES = [
  [MapPinned, 'All Options in One Place', 'Instead of searching across scattered social media posts and unstructured messages, guests can view every verified property with comprehensive details in one platform.'],
  [ShieldCheck, 'Built on Trust', 'Verified listings, real-time availability, and genuine reviews form the bedrock of everything we build.'],
  [Heart, 'Crafted for Gatherings', 'Our mission is simple: make planning family days, beach trips, and weekend picnics effortless and delightful.'],
]

export default function About() {
  return (
    <section className="mx-auto min-h-[70vh] w-[92%] max-w-6xl py-16">
      <div className="mx-auto max-w-2xl pb-12 text-center">
        <span className="text-xs font-semibold uppercase tracking-widest text-teal-600">Our Mission</span>
        <h1 className="mt-2 font-display text-4xl font-semibold text-ink-900 sm:text-5xl">
          Simplifying Coastal & Country Getaways
        </h1>
        <p className="mt-4 text-ink-700">
          Sahil &amp; Bagh brings Karachi's beach huts and farmhouses into a seamless, trusted booking experience.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {VALUES.map(([Icon, title, desc]) => (
          <div key={title} className="rounded-2xl border border-border bg-card p-7 shadow-sm">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-teal-100 text-teal-700">
              <Icon className="h-6 w-6" />
            </div>
            <h2 className="font-display text-xl font-medium text-ink-900">{title}</h2>
            <p className="mt-2 text-sm text-ink-700">{desc}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-10 pt-16 lg:grid-cols-2 lg:gap-16">
        <div>
          <span className="text-xs font-semibold uppercase tracking-widest text-teal-600">Vision</span>
          <h2 className="mt-2 font-display text-3xl font-semibold text-ink-900 sm:text-4xl">
            From Scattered Listings to a Unified Marketplace
          </h2>
        </div>
        <p className="text-sm text-ink-700">
          Sahil &amp; Bagh is dedicated to transforming coastal property rentals into an effortless experience. Our goal is to provide a trusted marketplace for beach huts and farmhouses, expanding over time to offer complete getaway packages.
        </p>
      </div>
    </section>
  )
}
