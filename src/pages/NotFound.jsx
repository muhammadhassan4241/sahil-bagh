import { Link } from 'react-router-dom'
import { Waves } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <Waves className="h-10 w-10 text-teal-600" />
      <h1 className="mt-4 font-display text-4xl text-ink-900">404</h1>
      <p className="mt-2 text-ink-500">This page could not be found.</p>
      <Button className="mt-6" asChild>
        <Link to="/">Return to Home</Link>
      </Button>
    </div>
  )
}
