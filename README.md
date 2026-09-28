# Sahil & Bagh — Beach Hut & Farmhouse Booking Platform

Karachi ke beach huts (Hawke's Bay, French Beach) aur farmhouses ke liye verified booking platform.
React + Vite + Tailwind v4 + Supabase.

## Features

- Property listings with search & filters (location, type, price, guests)
- Property detail page: gallery, amenities, reviews, direct WhatsApp contact
- Booking system with date-range calendar and double-booking prevention (DB-level trigger)
- Owner dashboard: manage properties, confirm/cancel bookings, add new listings
- Supabase auth (customer / owner roles) with Row Level Security
- Demo mode: app runs on mock data even without Supabase configured

## Getting Started

```bash
npm install
npm run dev
```

App opens at `http://localhost:5173`. Without Supabase configured, it runs fully in **demo mode** using sample data in `src/data/mockProperties.js` — you can browse listings, view details, and "book" (no real save).

## Connect Supabase (real backend)

1. Create a free project at supabase.com.
2. Go to **SQL Editor** -> paste the contents of `supabase/schema.sql` -> Run.
   This creates all tables (profiles, properties, bookings, reviews, etc.), the double-booking prevention trigger, Row Level Security policies, and a `property-photos` storage bucket.
3. Copy `.env.example` to `.env` and fill in your project's URL and anon key (Project Settings -> API):

```
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```

4. Restart `npm run dev`. Signup/login, real bookings, and the owner dashboard will now use live Supabase data.

## Project Structure

```
src/
  components/       Navbar, Footer, PropertyCard, BookingWidget, SearchFilters, ui/ (button, card, dialog...)
  pages/            Home, Listings, PropertyDetail, Login, Signup, Dashboard, NotFound
  context/          AuthContext (Supabase auth)
  lib/api/          properties.js -- all Supabase queries (with mock fallback)
  lib/supabaseClient.js
  data/             mockProperties.js -- demo/seed data
supabase/
  schema.sql        Full DB schema, RLS policies, triggers, storage bucket
```

## Monetization (built into schema)

- `bookings.commission_amount` -- 5% platform commission calculated automatically in the booking widget
- `featured_listings` table -- track paid featured placements (Rs 3,000-5,000/month)

## Build for production

```bash
npm run build
```

Output goes to `dist/` -- deploy to Vercel, Netlify, or any static host.
