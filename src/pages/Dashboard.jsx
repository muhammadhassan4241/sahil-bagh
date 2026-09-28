import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { PlusCircle, Home, CalendarCheck, DollarSign, Star, CheckCircle2, XCircle, Clock } from 'lucide-react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Select, SelectValue, SelectTrigger, SelectContent, SelectItem } from '@/components/ui/select'
import { useAuth } from '@/context/AuthContext'
import { fetchOwnerProperties, fetchOwnerBookings, updateBookingStatus, createProperty } from '@/lib/api/properties'
import { formatPKR, formatDate } from '@/lib/utils'

function StatCard({ icon: Icon, label, value, accent }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className={`inline-flex rounded-xl p-2.5 ${accent}`}>
        <Icon className="h-5 w-5" />
      </div>
      <p className="mt-3 font-display text-2xl font-semibold text-ink-900">{value}</p>
      <p className="text-xs text-ink-500">{label}</p>
    </div>
  )
}

function AddPropertyForm({ ownerId, onCreated }) {
  const [form, setForm] = useState({
    title: '', type: 'beach_hut', location: '', description: '',
    price_per_night: '', capacity: 4, bedrooms: 1, bathrooms: 1, cover_image: '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [ok, setOk] = useState(false)

  function set(field, value) { setForm((f) => ({ ...f, [field]: value })) }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      await createProperty({
        ...form,
        owner_id: ownerId,
        price_per_night: Number(form.price_per_night),
        capacity: Number(form.capacity),
        bedrooms: Number(form.bedrooms),
        bathrooms: Number(form.bathrooms),
        status: 'active',
      })
      setOk(true)
      onCreated?.()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-4 rounded-2xl border border-border bg-card p-6">
      <h3 className="font-display text-xl font-medium">Add New Property</h3>

      <div>
        <Label>Title</Label>
        <Input value={form.title} onChange={(e) => set('title', e.target.value)} placeholder="e.g. Sunset Deck Hut" required />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Type</Label>
          <Select value={form.type} onValueChange={(v) => set('type', v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="beach_hut">Beach Hut</SelectItem>
              <SelectItem value="farmhouse">Farmhouse</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Location</Label>
          <Input value={form.location} onChange={(e) => set('location', e.target.value)} placeholder="e.g. Hawke's Bay Beach" required />
        </div>
      </div>

      <div>
        <Label>Description</Label>
        <Textarea value={form.description} onChange={(e) => set('description', e.target.value)} required />
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div>
          <Label>Price / night</Label>
          <Input type="number" value={form.price_per_night} onChange={(e) => set('price_per_night', e.target.value)} required />
        </div>
        <div>
          <Label>Capacity</Label>
          <Input type="number" value={form.capacity} onChange={(e) => set('capacity', e.target.value)} required />
        </div>
        <div>
          <Label>Bedrooms</Label>
          <Input type="number" value={form.bedrooms} onChange={(e) => set('bedrooms', e.target.value)} />
        </div>
        <div>
          <Label>Bathrooms</Label>
          <Input type="number" value={form.bathrooms} onChange={(e) => set('bathrooms', e.target.value)} />
        </div>
      </div>

      <div>
        <Label>Cover Image URL</Label>
        <Input value={form.cover_image} onChange={(e) => set('cover_image', e.target.value)} placeholder="https://images.unsplash.com/..." />
        <p className="mt-1 text-xs text-ink-500">You can also use the Supabase Storage bucket "property-photos" for uploads.</p>
      </div>

      {error && <p className="rounded-lg bg-coral-500/10 px-3 py-2 text-sm text-coral-600">{error}</p>}
      {ok && <p className="rounded-lg bg-teal-100 px-3 py-2 text-sm text-teal-800">Property added successfully!</p>}

      <Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Add Property'}</Button>
    </form>
  )
}

export default function Dashboard() {
  const { user, profile, isSupabaseConfigured } = useAuth()
  const [properties, setProperties] = useState([])
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)

  const ownerId = user?.id || 'demo-owner'

  useEffect(() => {
    Promise.all([fetchOwnerProperties(ownerId), fetchOwnerBookings(ownerId)])
      .then(([props, bks]) => {
        setProperties(props || [])
        setBookings(bks || [])
      })
      .finally(() => setLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleStatusChange(bookingId, status) {
    await updateBookingStatus(bookingId, status)
    setBookings((prev) => prev.map((b) => (b.id === bookingId ? { ...b, status } : b)))
  }

  const totalRevenue = properties.reduce((sum, p) => {
    const confirmed = (p.bookings || []).filter((b) => b.status === 'confirmed')
    return sum + confirmed.reduce((s, b) => s + Number(b.total_price || 0), 0)
  }, 0)

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-medium text-ink-900">Owner Dashboard</h1>
        <p className="mt-1 text-sm text-ink-500">
          {profile?.full_name ? `Welcome, ${profile.full_name}` : 'Manage your properties and bookings.'}
        </p>
        {!isSupabaseConfigured && (
          <p className="mt-3 inline-block rounded-lg bg-amber-100 px-3 py-2 text-xs text-ink-700">
            Demo mode: Supabase is not connected, displaying sample data. Configure .env to view live data.
          </p>
        )}
      </div>

      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard icon={Home} label="Total Properties" value={properties.length} accent="bg-teal-100 text-teal-700" />
        <StatCard icon={CalendarCheck} label="Total Bookings" value={bookings.length} accent="bg-cyan-100 text-cyan-600" />
        <StatCard icon={DollarSign} label="Revenue (confirmed)" value={formatPKR(totalRevenue)} accent="bg-amber-100 text-amber-600" />
        <StatCard icon={Star} label="Avg Rating" value="4.7" accent="bg-coral-500/10 text-coral-500" />
      </div>

      <Tabs defaultValue="properties">
        <TabsList>
          <TabsTrigger value="properties">My Properties</TabsTrigger>
          <TabsTrigger value="bookings">Bookings</TabsTrigger>
          <TabsTrigger value="add">Add Property</TabsTrigger>
        </TabsList>

        <TabsContent value="properties">
          {loading ? (
            <p className="text-ink-500">Loading...</p>
          ) : properties.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {properties.map((p) => (
                <Link
                  key={p.id}
                  to={`/property/${p.id}`}
                  className="overflow-hidden rounded-2xl border border-border bg-card transition hover:-translate-y-1 hover:shadow-md"
                >
                  <img src={p.cover_image} alt={p.title} className="h-40 w-full object-cover" />
                  <div className="p-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-display text-lg font-medium">{p.title}</h3>
                      <Badge variant={p.status === 'active' ? 'default' : 'outline'}>{p.status || 'active'}</Badge>
                    </div>
                    <p className="text-sm text-ink-500">{p.location}</p>
                    <p className="mt-2 font-medium text-teal-700">{formatPKR(p.price_per_night)} / night</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="bookings">
          {bookings.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border py-16 text-center text-ink-500">
              {isSupabaseConfigured ? 'No bookings found yet.' : 'In demo mode, live bookings will appear here once connected to Supabase.'}
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-border">
              <table className="w-full text-sm">
                <thead className="bg-sand-100 text-left text-xs uppercase text-ink-500">
                  <tr>
                    <th className="px-4 py-3">Property</th>
                    <th className="px-4 py-3">Guest</th>
                    <th className="px-4 py-3">Dates</th>
                    <th className="px-4 py-3">Total</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((b) => (
                    <tr key={b.id} className="border-t border-border">
                      <td className="px-4 py-3">{b.properties?.title}</td>
                      <td className="px-4 py-3">{b.profiles?.full_name}</td>
                      <td className="px-4 py-3">{formatDate(b.check_in)} – {formatDate(b.check_out)}</td>
                      <td className="px-4 py-3">{formatPKR(b.total_price)}</td>
                      <td className="px-4 py-3">
                        <Badge variant={b.status === 'confirmed' ? 'default' : b.status === 'cancelled' ? 'coral' : 'amber'}>
                          {b.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        {b.status === 'pending' && (
                          <div className="flex gap-2">
                            <button onClick={() => handleStatusChange(b.id, 'confirmed')} className="text-teal-700" title="Confirm">
                              <CheckCircle2 className="h-4 w-4" />
                            </button>
                            <button onClick={() => handleStatusChange(b.id, 'cancelled')} className="text-coral-500" title="Cancel">
                              <XCircle className="h-4 w-4" />
                            </button>
                          </div>
                        )}
                        {b.status !== 'pending' && <Clock className="h-4 w-4 text-ink-500" />}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </TabsContent>

        <TabsContent value="add">
          <AddPropertyForm ownerId={ownerId} onCreated={() => fetchOwnerProperties(ownerId).then(setProperties)} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="rounded-2xl border border-dashed border-border py-16 text-center text-ink-500">
      <PlusCircle className="mx-auto h-8 w-8 text-teal-600" />
      <p className="mt-2">No properties listed yet. Use the "Add Property" tab to create your first listing.</p>
    </div>
  )
}
