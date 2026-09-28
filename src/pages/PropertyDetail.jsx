import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { MapPin, Users, BedDouble, Bath, ShieldCheck, ChevronLeft } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { StarRating } from '@/components/StarRating'
import { WhatsAppButton } from '@/components/WhatsAppButton'
import { BookingWidget } from '@/components/BookingWidget'
import { fetchPropertyById } from '@/lib/api/properties'

export default function PropertyDetail() {
  const { id } = useParams()
  const [property, setProperty] = useState(null)
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeImg, setActiveImg] = useState(0)

  useEffect(() => {
    setLoading(true)
    fetchPropertyById(id)
      .then(({ property, reviews }) => {
        setProperty(property)
        setReviews(reviews)
      })
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return <div className="mx-auto max-w-7xl px-4 py-20 text-center text-ink-500">Loading...</div>
  }

  if (!property) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center">
        <p className="font-display text-2xl">Property not found.</p>
        <Link to="/listings" className="mt-2 inline-block text-teal-700 underline">Return to Listings</Link>
      </div>
    )
  }

  const gallery = property.gallery || property.property_images?.map((i) => i.image_url) || [property.cover_image]

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Link to="/listings" className="mb-4 inline-flex items-center gap-1 text-sm text-ink-500 hover:text-teal-700">
        <ChevronLeft className="h-4 w-4" /> Listings
      </Link>

      {/* Gallery */}
      <div className="grid grid-cols-1 gap-2 overflow-hidden rounded-2xl sm:grid-cols-4 sm:grid-rows-2 sm:gap-2">
        <img
          src={gallery[activeImg]}
          alt={property.title}
          className="col-span-4 h-72 w-full object-cover sm:col-span-2 sm:row-span-2 sm:h-full"
        />
        {gallery.slice(0, 4).map((img, i) => (
          <button key={i} onClick={() => setActiveImg(i)} className="hidden sm:block">
            <img src={img} alt="" className={`h-full w-full object-cover ${activeImg === i ? 'ring-2 ring-teal-600' : ''}`} />
          </button>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-[1.7fr_1fr]">
        {/* Left: details */}
        <div>
          <div className="flex flex-wrap items-center gap-2">
            {property.is_verified && <Badge><ShieldCheck className="h-3 w-3" /> Verified</Badge>}
            <Badge variant="outline">{property.type === 'beach_hut' ? 'Beach Hut' : 'Farmhouse'}</Badge>
          </div>

          <h1 className="mt-3 font-display text-3xl font-medium text-ink-900 sm:text-4xl">{property.title}</h1>

          <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-ink-500">
            <span className="flex items-center gap-1"><MapPin className="h-4 w-4" /> {property.location}</span>
            <StarRating rating={property.rating || 0} count={property.review_count} />
          </div>

          <div className="mt-6 grid grid-cols-3 gap-4 rounded-2xl border border-border bg-card p-4 text-center sm:w-fit sm:grid-cols-3 sm:gap-8 sm:px-8">
            <div>
              <Users className="mx-auto h-5 w-5 text-teal-600" />
              <p className="mt-1 text-sm font-medium">{property.capacity} guests</p>
            </div>
            <div>
              <BedDouble className="mx-auto h-5 w-5 text-teal-600" />
              <p className="mt-1 text-sm font-medium">{property.bedrooms} beds</p>
            </div>
            <div>
              <Bath className="mx-auto h-5 w-5 text-teal-600" />
              <p className="mt-1 text-sm font-medium">{property.bathrooms} baths</p>
            </div>
          </div>

          <div className="mt-8 border-t border-border pt-6">
            <h2 className="font-display text-xl font-medium">About this property</h2>
            <p className="mt-2 leading-relaxed text-ink-700">{property.description}</p>
          </div>

          <div className="mt-8 border-t border-border pt-6">
            <h2 className="font-display text-xl font-medium">Amenities</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {(property.amenities || []).map((a) => (
                <Badge key={a} variant="outline">{a}</Badge>
              ))}
            </div>
          </div>

          <div className="mt-8 border-t border-border pt-6">
            <h2 className="font-display text-xl font-medium">Owner</h2>
            <div className="mt-3 flex items-center justify-between rounded-xl bg-sand-100 p-4">
              <div>
                <p className="font-medium text-ink-900">{property.owner?.full_name || property.profiles?.full_name}</p>
                <p className="text-xs text-ink-500">Property Owner</p>
              </div>
              <WhatsAppButton
                phone={property.owner?.whatsapp || property.profiles?.whatsapp}
                message={`Hello, I would like to inquire about ${property.title}.`}
              />
            </div>
          </div>

          <div className="mt-8 border-t border-border pt-6">
            <h2 className="font-display text-xl font-medium">Reviews {reviews.length > 0 && `(${reviews.length})`}</h2>
            {reviews.length === 0 ? (
              <p className="mt-2 text-sm text-ink-500">No reviews yet. You can leave the first review after your booking.</p>
            ) : (
              <div className="mt-4 space-y-4">
                {reviews.map((r) => (
                  <div key={r.id} className="rounded-xl border border-border p-4">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-ink-900">{r.customer_name || r.profiles?.full_name}</span>
                      <StarRating rating={r.rating} />
                    </div>
                    <p className="mt-1.5 text-sm text-ink-700">{r.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: booking widget */}
        <div className="lg:sticky lg:top-24 lg:h-fit">
          <BookingWidget property={property} />
        </div>
      </div>
    </div>
  )
}
