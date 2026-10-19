import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient'
import { mockProperties, mockReviews, mockBookings } from '@/data/mockProperties'

// Fetch listings with optional filters: { type, location, minPrice, maxPrice, guests }
export async function fetchProperties(filters = {}) {
  if (isSupabaseConfigured && supabase) {
    try {
      let query = supabase
        .from('properties')
        .select('*, property_images(image_url), profiles!properties_owner_id_fkey(full_name, whatsapp)')
        .eq('status', 'active')

      if (filters.type && filters.type !== 'all' && filters.type !== 'undefined') {
        query = query.eq('type', filters.type)
      }
      if (filters.location && filters.location.trim()) {
        query = query.ilike('location', `%${filters.location.trim()}%`)
      }
      if (filters.minPrice && Number(filters.minPrice) > 0) {
        query = query.gte('price_per_night', Number(filters.minPrice))
      }
      if (filters.maxPrice && Number(filters.maxPrice) > 0) {
        query = query.lte('price_per_night', Number(filters.maxPrice))
      }
      if (filters.guests && Number(filters.guests) > 0) {
        query = query.gte('capacity', Number(filters.guests))
      }

      const { data, error } = await query.order('is_featured', { ascending: false })
      if (!error && Array.isArray(data)) {
        const hasFilters = Boolean(
          (filters.type && filters.type !== 'all' && filters.type !== 'undefined') ||
          (filters.location && filters.location.trim()) ||
          filters.minPrice ||
          filters.maxPrice ||
          filters.guests
        )
        if (data.length > 0 || hasFilters) {
          return data
        }
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
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.from('properties').insert(payload).select().single()
    if (error) throw error
    return data
  }

  const newProp = {
    ...payload,
    id: `demo-${Date.now()}`,
    rating: 5.0,
    review_count: 0,
    is_verified: false,
    is_featured: false,
    created_at: new Date().toISOString(),
  }
  mockProperties.unshift(newProp)
  return newProp
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
    const demoBooking = {
      ...payload,
      id: `demo-booking-${Date.now()}`,
      status: 'pending',
      created_at: new Date().toISOString(),
      properties: mockProperties.find((p) => p.id === payload.property_id) || null,
    }
    mockBookings.unshift(demoBooking)
    return demoBooking
  }
  const { data, error } = await supabase.from('bookings').insert(payload).select().single()
  if (error) throw error
  return data
}

export async function fetchCustomerBookings(customerId) {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*, properties(*, profiles!properties_owner_id_fkey(full_name, whatsapp))')
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false })
      if (!error && data) return data
    } catch (err) {
      console.warn('[fetchCustomerBookings] Supabase query error:', err)
    }
  }

  return mockBookings.filter(
    (b) => !customerId || customerId === 'demo-customer' || b.customer_id === customerId
  )
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
  return mockBookings
}

export async function updateBookingStatus(bookingId, status) {
  if (!isSupabaseConfigured || !supabase) {
    const found = mockBookings.find((b) => b.id === bookingId)
    if (found) found.status = status
    return { id: bookingId, status }
  }
  const { data, error } = await supabase
    .from('bookings')
    .update({ status })
    .eq('id', bookingId)
    .select()
    .single()
  if (error) throw error
  return data
}

function filterMock(list, filters = {}) {
  return list.filter((p) => {
    if (filters.type && filters.type !== 'all' && filters.type !== 'undefined' && p.type !== filters.type) return false
    if (filters.location && filters.location.trim() && !p.location?.toLowerCase().includes(filters.location.trim().toLowerCase())) return false
    if (filters.minPrice && Number(filters.minPrice) > 0 && p.price_per_night < Number(filters.minPrice)) return false
    if (filters.maxPrice && Number(filters.maxPrice) > 0 && p.price_per_night > Number(filters.maxPrice)) return false
    if (filters.guests && Number(filters.guests) > 0 && p.capacity < Number(filters.guests)) return false
    return true
  })
}
