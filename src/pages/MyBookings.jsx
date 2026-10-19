import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { CalendarDays, MapPin, Users, XCircle, Clock, CheckCircle2, ChevronRight, Building } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { WhatsAppButton } from '@/components/WhatsAppButton'
import { useAuth } from '@/context/AuthContext'
import { fetchCustomerBookings, updateBookingStatus } from '@/lib/api/properties'
import { formatPKR, formatDate } from '@/lib/utils'

export default function MyBookings() {
  const { user, profile, demoLogin } = useAuth()
  const navigate = useNavigate()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all') // all | confirmed | pending | cancelled
  const [cancellingId, setCancellingId] = useState(null)

  const customerId = user?.id || 'demo-customer'

  useEffect(() => {
    setLoading(true)
    fetchCustomerBookings(customerId)
      .then((data) => setBookings(data || []))
      .catch((err) => {
        console.error('Failed to load customer bookings:', err)
        setBookings([])
      })
      .finally(() => setLoading(false))
  }, [customerId])

  async function handleCancel(bookingId) {
    if (!window.confirm('Are you sure you want to cancel this booking request?')) return
    setCancellingId(bookingId)
    try {
      await updateBookingStatus(bookingId, 'cancelled')
      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? { ...b, status: 'cancelled' } : b))
      )
    } catch (err) {
      alert(err.message || 'Failed to cancel booking.')
    } finally {
      setCancellingId(null)
    }
  }

  const filteredBookings = bookings.filter((b) => {
    if (filter === 'all') return true
    return b.status === filter
  })

  const counts = {
    all: bookings.length,
    confirmed: bookings.filter((b) => b.status === 'confirmed').length,
    pending: bookings.filter((b) => b.status === 'pending').length,
    cancelled: bookings.filter((b) => b.status === 'cancelled').length,
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-medium text-ink-900">My Bookings</h1>
          <p className="mt-1 text-sm text-ink-500">
            {profile?.full_name ? `Welcome back, ${profile.full_name}. ` : ''}
            Manage your getaways and track reservation statuses.
          </p>
        </div>

        <Button onClick={() => navigate('/listings')} className="w-fit">
          Explore Stays <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {!user && (
        <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-ink-800">
          <p className="font-medium">You are viewing demo bookings.</p>
          <p className="mt-0.5 text-xs text-ink-600">
            Log in to manage your real reservations, or{' '}
            <button
              onClick={() => demoLogin('customer', 'Demo Customer')}
              className="font-semibold text-teal-800 underline hover:text-teal-900"
            >
              continue as Demo Customer
            </button>
            .
          </p>
        </div>
      )}

      {/* Tabs */}
      <div className="mb-6 flex gap-2 border-b border-border pb-3 text-sm">
        {[
          { key: 'all', label: 'All' },
          { key: 'confirmed', label: 'Confirmed' },
          { key: 'pending', label: 'Pending' },
          { key: 'cancelled', label: 'Cancelled' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`rounded-xl px-3.5 py-1.5 font-medium transition ${
              filter === tab.key
                ? 'bg-teal-700 text-white shadow-sm'
                : 'text-ink-600 hover:bg-sand-100'
            }`}
          >
            {tab.label} ({counts[tab.key]})
          </button>
        ))}
      </div>

      {/* Booking List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-40 animate-pulse rounded-2xl bg-sand-200/70" />
          ))}
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border py-16 text-center">
          <Building className="mx-auto h-10 w-10 text-ink-400" />
          <h3 className="mt-3 font-display text-lg font-medium text-ink-800">No bookings found</h3>
          <p className="mt-1 text-sm text-ink-500">
            {filter === 'all'
              ? 'You haven’t requested any bookings yet. Find your next beachfront hut or farmhouse!'
              : `You have no ${filter} bookings at the moment.`}
          </p>
          <Button onClick={() => navigate('/listings')} className="mt-5">
            Browse Available Properties
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((b) => {
            const property = b.properties || {}
            const image = property.cover_image || property.property_images?.[0]?.image_url
            const ownerPhone = property.owner?.whatsapp || property.profiles?.whatsapp

            return (
              <div
                key={b.id}
                className="overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-sm transition hover:shadow-md sm:p-6"
              >
                <div className="grid grid-cols-1 gap-5 md:grid-cols-[160px_1fr_auto]">
                  {/* Thumbnail */}
                  <div className="relative h-32 w-full overflow-hidden rounded-xl bg-sand-200 md:h-full md:w-40">
                    {image ? (
                      <img src={image} alt={property.title || 'Property'} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs text-ink-500">
                        No image
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex flex-col justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge
                          variant={
                            b.status === 'confirmed'
                              ? 'default'
                              : b.status === 'cancelled'
                              ? 'coral'
                              : 'amber'
                          }
                        >
                          {b.status === 'confirmed' && <CheckCircle2 className="h-3 w-3" />}
                          {b.status === 'pending' && <Clock className="h-3 w-3" />}
                          {b.status === 'cancelled' && <XCircle className="h-3 w-3" />}
                          {b.status.charAt(0).toUpperCase() + b.status.slice(1)}
                        </Badge>
                        <span className="text-xs text-ink-500">
                          ID: #{String(b.id).slice(-6).toUpperCase()}
                        </span>
                      </div>

                      <h3 className="mt-2 font-display text-xl font-medium text-ink-900">
                        <Link
                          to={`/property/${property.id || b.property_id}`}
                          className="hover:text-teal-700 hover:underline"
                        >
                          {property.title || 'Property Reservation'}
                        </Link>
                      </h3>

                      {property.location && (
                        <p className="mt-1 flex items-center gap-1 text-xs text-ink-500">
                          <MapPin className="h-3.5 w-3.5 text-teal-600" /> {property.location}
                        </p>
                      )}
                    </div>

                    <div className="mt-4 flex flex-wrap items-center gap-4 text-xs sm:text-sm text-ink-700">
                      <span className="flex items-center gap-1 font-medium">
                        <CalendarDays className="h-4 w-4 text-teal-600" />
                        {formatDate(b.check_in)} – {formatDate(b.check_out)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-4 w-4 text-teal-600" />
                        {b.guests} {b.guests === 1 ? 'Guest' : 'Guests'}
                      </span>
                      <span className="font-semibold text-teal-800">
                        Total: {formatPKR(b.total_price)}
                      </span>
                    </div>

                    {b.customer_notes && (
                      <p className="mt-2 text-xs italic text-ink-600">
                        Note: &ldquo;{b.customer_notes}&rdquo;
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-row md:flex-col items-end justify-between md:justify-center gap-2 border-t md:border-t-0 md:border-l border-border pt-4 md:pt-0 md:pl-5">
                    <WhatsAppButton
                      phone={ownerPhone}
                      message={`Hello, I am inquiring about my booking #${String(b.id).slice(-6).toUpperCase()} for ${property.title || 'the property'} (${b.check_in} to ${b.check_out}).`}
                      label="Chat with Owner"
                      className="w-full sm:w-auto text-xs py-2 px-3"
                    />

                    {b.status === 'pending' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={cancellingId === b.id}
                        onClick={() => handleCancel(b.id)}
                        className="text-xs text-coral-600 hover:bg-coral-500/10 hover:text-coral-700"
                      >
                        {cancellingId === b.id ? 'Cancelling...' : 'Cancel Request'}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
