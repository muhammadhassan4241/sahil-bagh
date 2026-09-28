import { useState } from 'react'
import { Search, MapPin, Users, Waves } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectValue, SelectTrigger, SelectContent, SelectItem } from '@/components/ui/select'

export function SearchFilters({ initial = {}, onSearch, floating = false }) {
  const [location, setLocation] = useState(initial.location || '')
  const [type, setType] = useState(initial.type || 'all')
  const [guests, setGuests] = useState(initial.guests || '')

  function handleSubmit(e) {
    e.preventDefault()
    onSearch({
      location: location || undefined,
      type: type === 'all' ? undefined : type,
      guests: guests ? Number(guests) : undefined,
    })
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={`grid grid-cols-1 gap-3 rounded-2xl bg-white/95 p-4 shadow-lg backdrop-blur sm:grid-cols-[1.3fr_1fr_0.8fr_auto] sm:p-3 ${
        floating ? 'border border-white/40' : 'border border-border'
      }`}
    >
      <div className="relative">
        <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-500" />
        <Input
          placeholder="Where do you want to go? (e.g. Hawke's Bay)"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="pl-9"
        />
      </div>

      <Select value={type} onValueChange={setType}>
        <SelectTrigger>
          <span className="flex items-center gap-2 text-ink-700">
            <Waves className="h-4 w-4 text-ink-500" />
            <SelectValue placeholder="Type" />
          </span>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Types</SelectItem>
          <SelectItem value="beach_hut">Beach Hut</SelectItem>
          <SelectItem value="farmhouse">Farmhouse</SelectItem>
        </SelectContent>
      </Select>

      <div className="relative">
        <Users className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-500" />
        <Input
          type="number"
          min={1}
          placeholder="Guests"
          value={guests}
          onChange={(e) => setGuests(e.target.value)}
          className="pl-9"
        />
      </div>

      <Button type="submit" size="default" className="w-full sm:w-auto">
        <Search className="h-4 w-4" /> Search
      </Button>
    </form>
  )
}
