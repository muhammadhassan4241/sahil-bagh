import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

export function StarRating({ rating = 0, count, size = 'sm' }) {
  const dim = size === 'lg' ? 'h-5 w-5' : 'h-3.5 w-3.5'
  return (
    <div className="flex items-center gap-1">
      <div className="flex">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            className={cn(dim, i <= Math.round(rating) ? 'fill-amber-500 text-amber-500' : 'text-sand-300')}
          />
        ))}
      </div>
      {rating > 0 && (
        <span className="text-sm font-medium text-ink-900">
          {rating.toFixed(1)}
          {count != null && <span className="text-ink-500 font-normal"> ({count})</span>}
        </span>
      )}
    </div>
  )
}
