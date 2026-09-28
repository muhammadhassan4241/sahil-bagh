import { Link } from 'react-router-dom'
import { MapPin, Users, ShieldCheck } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { StarRating } from '@/components/StarRating'
import { formatPKR } from '@/lib/utils'

export function PropertyCard({ property }) {
  const image = property.cover_image || property.property_images?.[0]?.image_url

  return (
    <Link
      to={`/property/${property.id}`}
      className="group block overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={image}
          alt={property.title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute left-3 top-3 flex gap-2">
          {property.is_featured && <Badge variant="amber">Featured</Badge>}
          {property.is_verified && (
            <Badge variant="default" className="bg-white/90 text-teal-700 border-transparent">
              <ShieldCheck className="h-3 w-3" /> Verified
            </Badge>
          )}
        </div>
        <div className="absolute bottom-3 right-3 rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-ink-900 shadow-sm">
          {property.type === 'beach_hut' ? 'Beach Hut' : 'Farmhouse'}
        </div>
      </div>

      <div className="p-4">
        <div className="mb-1 flex items-center gap-1 text-xs text-ink-500">
          <MapPin className="h-3 w-3" />
          {property.location}
        </div>
        <h3 className="font-display text-lg font-medium leading-snug text-ink-900 line-clamp-1">
          {property.title}
        </h3>

        <div className="mt-2 flex items-center justify-between">
          <StarRating rating={property.rating || 0} count={property.review_count} />
          <div className="flex items-center gap-1 text-xs text-ink-500">
            <Users className="h-3 w-3" /> {property.capacity}
          </div>
        </div>

        <div className="mt-3 flex items-baseline justify-between border-t border-border pt-3">
          <div>
            <span className="font-display text-lg font-semibold text-teal-700">
              {formatPKR(property.price_per_night)}
            </span>
            <span className="text-xs text-ink-500"> / night</span>
          </div>
          <span className="text-sm font-medium text-coral-500 group-hover:underline">View Details &rarr;</span>
        </div>
      </div>
    </Link>
  )
}
