import { useEffect, useMemo, useState } from 'react'
import { CalendarDays, Users, Loader2, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { formatPKR } from '@/lib/utils'
import { fetchBookedRanges, createBooking } from '@/lib/api/properties'
import { useAuth } from '@/context/AuthContext'
import { WhatsAppButton } from '@/components/WhatsAppButton'

function nightsBetween(inDate, outDate) {
  if (!inDate || !outDate) return 0
  const diff = (new Date(outDate) - new Date(inDate)) / (1000 * 60 * 60 * 24)
  return diff > 0 ? diff : 0
}

function rangesOverlap(aStart, aEnd, bStart, bEnd) {
  return new Date(aStart) < new Date(bEnd) && new Date(bStart) < new Date(aEnd)
}

export function BookingWidget({ property }) {
  const { user } = useAuth()
  const [checkIn, setCheckIn] = useState('')
  const [checkOut, setCheckOut] = useState('')
  const [guests, setGuests] = useState(2)
  const [notes, setNotes] = useState('')
  const [bookedRanges, setBookedRanges] = useState([])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(null)

  useEffect(() => {
    fetchBookedRanges(property.id).then(setBookedRanges).catch(() => {})
  }, [property.id])

  const nights = useMemo(() => nightsBetween(checkIn, checkOut), [checkIn, checkOut])
  const subtotal = nights * property.price_per_night
  const serviceFee = Math.round(subtotal * 0.05) // 5% commission, per monetization plan
  const total = subtotal + serviceFee

  const hasConflict = useMemo(() => {
    if (!checkIn || !checkOut) return false
    return bookedRanges.some((r) => rangesOverlap(checkIn, checkOut, r.check_in, r.check_out))
  }, [checkIn, checkOut, bookedRanges])

  async function handleBook(e) {
    e.preventDefault()
    setError('')

    if (!checkIn || !checkOut || nights <= 0) {
      setError('Please select valid check-in and check-out dates.')
      return
    }
    if (hasConflict) {
      setError('These dates are already booked. Please choose different dates.')
      return
    }
    if (guests > property.capacity) {
      setError(`This property accommodates a maximum of ${property.capacity} guests.`)
      return
    }

    setSubmitting(true)
    try {
      const booking = await createBooking({
        property_id: property.id,
        customer_id: user?.id || null,
        check_in: checkIn,
        check_out: checkOut,
        guests: Number(guests),
        total_price: total,
        commission_amount: serviceFee,
        status: 'pending',
        customer_notes: notes || null,
      })
      setSuccess(booking)
    } catch (err) {
      setError(err.message || 'An error occurred while booking. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (success) {
    return (
      <div className="rounded-2xl border border-teal-200 bg-teal-100/60 p-6 text-center">
        <CheckCircle2 className="mx-auto h-10 w-10 text-teal-700" />
        <h3 className="mt-3 font-display text-xl font-medium text-teal-800">Booking Request Sent!</h3>
        <p className="mt-1 text-sm text-teal-700/80">
          {formatDateShort(checkIn)} – {formatDateShort(checkOut)} · {nights} {nights === 1 ? 'night' : 'nights'} · {formatPKR(total)}
        </p>
        <p className="mt-3 text-sm text-ink-700">
          You will receive an update once the owner confirms. For faster coordination, contact the owner directly via WhatsApp.
        </p>
        <div className="mt-4 flex justify-center">
          <WhatsAppButton
            phone={property.owner?.whatsapp}
            message={`Hello, I have requested a booking for ${property.title} (${checkIn} to ${checkOut}). Please confirm.`}
          />
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleBook} className="rounded-2xl border border-border bg-card p-6 shadow-sm">
      <div className="mb-4 flex items-baseline justify-between">
        <span className="font-display text-2xl font-semibold text-teal-700">{formatPKR(property.price_per_night)}</span>
        <span className="text-sm text-ink-500">/ night</span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="checkin"><CalendarDays className="mb-1 inline h-3.5 w-3.5" /> Check-in</Label>
          <Input id="checkin" type="date" value={checkIn} min={new Date().toISOString().split('T')[0]} onChange={(e) => setCheckIn(e.target.value)} required />
        </div>
        <div>
          <Label htmlFor="checkout"><CalendarDays className="mb-1 inline h-3.5 w-3.5" /> Check-out</Label>
          <Input id="checkout" type="date" value={checkOut} min={checkIn || new Date().toISOString().split('T')[0]} onChange={(e) => setCheckOut(e.target.value)} required />
        </div>
      </div>

      <div className="mt-3">
        <Label htmlFor="guests"><Users className="mb-1 inline h-3.5 w-3.5" /> Guests</Label>
        <Input id="guests" type="number" min={1} max={property.capacity} value={guests} onChange={(e) => setGuests(e.target.value)} required />
      </div>

      <div className="mt-3">
        <Label htmlFor="notes">Notes (optional)</Label>
        <Textarea id="notes" placeholder="e.g. Late check-in, BBQ setup requested, etc." value={notes} onChange={(e) => setNotes(e.target.value)} />
      </div>

      {hasConflict && (
        <p className="mt-3 rounded-lg bg-coral-500/10 px-3 py-2 text-sm text-coral-600">
          These dates are already booked — please choose different dates.
        </p>
      )}
      {error && !hasConflict && (
        <p className="mt-3 rounded-lg bg-coral-500/10 px-3 py-2 text-sm text-coral-600">{error}</p>
      )}

      {nights > 0 && (
        <div className="mt-4 space-y-1.5 border-t border-border pt-4 text-sm">
          <div className="flex justify-between text-ink-700">
            <span>{formatPKR(property.price_per_night)} x {nights} {nights === 1 ? 'night' : 'nights'}</span>
            <span>{formatPKR(subtotal)}</span>
          </div>
          <div className="flex justify-between text-ink-700">
            <span>Service fee</span>
            <span>{formatPKR(serviceFee)}</span>
          </div>
          <div className="flex justify-between border-t border-border pt-1.5 font-semibold text-ink-900">
            <span>Total</span>
            <span>{formatPKR(total)}</span>
          </div>
        </div>
      )}

      <Button type="submit" className="mt-5 w-full" disabled={submitting || hasConflict}>
        {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        {submitting ? 'Booking...' : 'Book Now'}
      </Button>

      <p className="mt-2 text-center text-xs text-ink-500">No payment charged now — the owner will confirm your reservation.</p>
    </form>
  )
}

function formatDateShort(d) {
  return new Date(d).toLocaleDateString('en-PK', { day: 'numeric', month: 'short' })
}
