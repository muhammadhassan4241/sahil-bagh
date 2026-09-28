import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { SlidersHorizontal } from 'lucide-react'
import { SearchFilters } from '@/components/SearchFilters'
import { PropertyCard } from '@/components/PropertyCard'
import { Select, SelectValue, SelectTrigger, SelectContent, SelectItem } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { fetchProperties } from '@/lib/api/properties'

export default function Listings() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(true)
  const [sort, setSort] = useState('featured')
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '')
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '')

  const filters = {
    location: searchParams.get('location') || undefined,
    type: searchParams.get('type') || undefined,
    guests: searchParams.get('guests') || undefined,
    minPrice: searchParams.get('minPrice') || undefined,
    maxPrice: searchParams.get('maxPrice') || undefined,
  }

  useEffect(() => {
    setLoading(true)
    fetchProperties(filters)
      .then((data) => {
        let sorted = [...(data || [])]
        if (sort === 'price_low') sorted.sort((a, b) => a.price_per_night - b.price_per_night)
        if (sort === 'price_high') sorted.sort((a, b) => b.price_per_night - a.price_per_night)
        if (sort === 'rating') sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0))
        setProperties(sorted)
      })
      .catch((err) => {
        console.error('Failed to fetch properties:', err)
        setProperties([])
      })
      .finally(() => setLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.toString(), sort])

  function handleSearch(newFilters) {
    const params = {}
    Object.entries(newFilters).forEach(([k, v]) => { if (v) params[k] = v })
    if (minPrice) params.minPrice = minPrice
    if (maxPrice) params.maxPrice = maxPrice
    setSearchParams(params)
  }

  function applyPriceRange() {
    const params = Object.fromEntries(searchParams)
    if (minPrice) params.minPrice = minPrice; else delete params.minPrice
    if (maxPrice) params.maxPrice = maxPrice; else delete params.maxPrice
    setSearchParams(params)
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="font-display text-3xl font-medium text-ink-900">Listings</h1>
        <p className="mt-1 text-sm text-ink-500">
          {loading ? 'Loading...' : `${properties.length} ${properties.length === 1 ? 'property' : 'properties'} available`}
        </p>
      </div>

      <div className="mb-8">
        <SearchFilters initial={filters} onSearch={handleSearch} />
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[260px_1fr]">
        {/* Sidebar filters */}
        <aside className="h-fit rounded-2xl border border-border bg-card p-5">
          <div className="mb-4 flex items-center gap-2 font-display text-lg font-medium">
            <SlidersHorizontal className="h-4 w-4 text-teal-600" /> Filters
          </div>

          <div className="mb-4">
            <Label>Price Range (per night)</Label>
            <div className="flex items-center gap-2">
              <Input type="number" placeholder="Min" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} />
              <span className="text-ink-500">-</span>
              <Input type="number" placeholder="Max" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} />
            </div>
            <button onClick={applyPriceRange} className="mt-2 text-xs font-medium text-teal-700 hover:underline">
              Apply Price Filter
            </button>
          </div>

          <div>
            <Label>Sort By</Label>
            <Select value={sort} onValueChange={setSort}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="featured">Featured</SelectItem>
                <SelectItem value="price_low">Price: Low to High</SelectItem>
                <SelectItem value="price_high">Price: High to Low</SelectItem>
                <SelectItem value="rating">Top Rated</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </aside>

        {/* Results */}
        <div>
          {loading ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-80 animate-pulse rounded-2xl bg-sand-200/70" />
              ))}
            </div>
          ) : properties.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border py-20 text-center">
              <p className="font-display text-xl text-ink-900">No properties found</p>
              <p className="mt-1 text-sm text-ink-500">Try adjusting your search filters or price range.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {properties.map((p) => <PropertyCard key={p.id} property={p} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
