import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient'
import { mockProperties, mockReviews } from '@/data/mockProperties'

// Fetch listings with optional filters: { type, location, minPrice, maxPrice, guests }
export async function fetchProperties(filters = {}) {
  if (isSupabaseConfigured && supabase) {
    try {
      let query = supabase
        .from('properties')
        .select('*, property_images(image_url), profiles!properties_owner_id_fkey(full_name, whatsapp)')
        .eq('status', 'active')

      if (filters.type) query = query.eq('type', filters.type)
      if (filters.location) query = query.ilike('location', `%${filters.location}%`)
      if (filters.minPrice) query = query.gte('price_per_night', Number(filters.minPrice))
      if (filters.maxPrice) query = query.lte('price_per_night', Number(filters.maxPrice))
      if (filters.guests) query = query.gte('capacity', Number(filters.guests))

      const { data, error } = await query.order('is_featured', { ascending: false })
      if (!error && Array.isArray(data) && data.length > 0) {
        return data
      }
    } catch (err) {
      console.warn('[fetchProperties] Supabase query failed, falling back to mock data:', err)
    }
  }

  // Fallback to local verified mock properties
  return filterMock(mockProperties, filters)
}

export async function fetchPropertyById(id) {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data: property, error } = await supabase
        .from('properties')
        .select('*, property_images(image_url), profiles!properties_owner_id_fkey(full_name, whatsapp)')
        .eq('id', id)
        .maybeSingle()

      if (!error && property) {
        const { data: reviews } = await supabase
          .from('reviews')
          .select('*, profiles(full_name)')
          .eq('property_id', id)
          .order('created_at', { ascending: false })

        return { property, reviews: reviews || [] }
      }
    } catch (err) {
      console.warn('[fetchPropertyById] Supabase query failed, falling back to mock data:', err)
    }
  }

  const property = mockProperties.find((p) => p.id === id)
  return { property: property || null, reviews: mockReviews[id] || [] }
}

export async function fetchOwnerProperties(ownerId) {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*, bookings(id, status, total_price)')
        .eq('owner_id', ownerId)
        .order('created_at', { ascending: false })
      if (!error && Array.isArray(data) && data.length > 0) {
        return data
      }
    } catch (err) {
      console.warn('[fetchOwnerProperties] Supabase query error:', err)
    }
  }

  return mockProperties.slice(0, 3)
}

export async function createProperty(payload) {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('Supabase is not configured — please set up your .env file.')
  }
  const { data, error } = await supabase.from('properties').insert(payload).select().single()
  if (error) throw error
  return data
}

// Booked date ranges for a property, used to disable dates in the calendar
export async function fetchBookedRanges(propertyId) {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('check_in, check_out')
        .eq('property_id', propertyId)
        .in('status', ['pending', 'confirmed'])
      if (!error && data) return data
    } catch (err) {
      console.warn('[fetchBookedRanges] Supabase query error:', err)
    }
  }
  return []
}

export async function createBooking(payload) {
  if (!isSupabaseConfigured || !supabase) {
    return { ...payload, id: `demo-booking-${Date.now()}`, status: 'pending' }
  }
  const { data, error } = await supabase.from('bookings').insert(payload).select().single()
  if (error) throw error
  return data
}

export async function fetchOwnerBookings(ownerId) {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*, properties!inner(title, owner_id), profiles(full_name, phone, whatsapp)')
        .eq('properties.owner_id', ownerId)
        .order('created_at', { ascending: false })
      if (!error && data) return data
    } catch (err) {
      console.warn('[fetchOwnerBookings] Supabase query error:', err)
    }
  }
  return []
}

export async function updateBookingStatus(bookingId, status) {
  if (!isSupabaseConfigured || !supabase) return { id: bookingId, status }
  const { data, error } = await supabase
    .from('bookings')
    .update({ status })
    .eq('id', bookingId)
    .select()
    .single()
  if (error) throw error
  return data
}

function filterMock(list, filters) {
  return list.filter((p) => {
    if (filters.type && filters.type !== 'all' && p.type !== filters.type) return false
    if (filters.location && !p.location.toLowerCase().includes(filters.location.toLowerCase())) return false
    if (filters.minPrice && p.price_per_night < Number(filters.minPrice)) return false
    if (filters.maxPrice && p.price_per_night > Number(filters.maxPrice)) return false
    if (filters.guests && p.capacity < Number(filters.guests)) return false
    return true
  })
}
