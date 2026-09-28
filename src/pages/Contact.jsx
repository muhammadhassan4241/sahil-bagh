import { useState } from 'react'
import { Mail, MapPin, Phone, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

export default function Contact() {
  const [sent, setSent] = useState(false)

  return (
    <section className="mx-auto min-h-[70vh] w-[92%] max-w-6xl py-16">
      <div className="mx-auto max-w-2xl pb-12 text-center">
        <span className="text-xs font-semibold uppercase tracking-widest text-teal-600">Get in Touch</span>
        <h1 className="mt-2 font-display text-4xl font-semibold text-ink-900 sm:text-5xl">
          Contact Sahil &amp; Bagh
        </h1>
        <p className="mt-4 text-ink-700">Have a question, feedback, or a property you would like to discuss?</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="grid gap-4">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <MapPin className="mb-2.5 h-5 w-5 text-teal-600" />
            <h3 className="font-display text-base font-medium text-ink-900">Location</h3>
            <p className="text-sm text-ink-700">Karachi, Pakistan</p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <Phone className="mb-2.5 h-5 w-5 text-teal-600" />
            <h3 className="font-display text-base font-medium text-ink-900">Phone</h3>
            <p className="text-sm text-ink-700">+92 3701650540</p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <Mail className="mb-2.5 h-5 w-5 text-teal-600" />
            <h3 className="font-display text-base font-medium text-ink-900">Email</h3>
            <p className="text-sm text-ink-700">muhammadateeqraza123@gmail.com</p>
          </div>
        </div>

        <form
          className="rounded-2xl border border-border bg-card p-7 shadow-sm"
          onSubmit={(e) => {
            e.preventDefault()
            setSent(true)
          }}
        >
          <label className="mb-4 grid gap-1.5 text-xs font-semibold text-ink-700">
            Full Name
            <Input required placeholder="Your full name" />
          </label>
          <label className="mb-4 grid gap-1.5 text-xs font-semibold text-ink-700">
            Email
            <Input required type="email" placeholder="you@example.com" />
          </label>
          <label className="mb-4 grid gap-1.5 text-xs font-semibold text-ink-700">
            Message
            <Textarea required rows={6} placeholder="How can we help you?" />
          </label>
          <Button type="submit" className="gap-2">
            <Send className="h-4 w-4" />
            {sent ? 'Message Sent!' : 'Send Message'}
          </Button>
        </form>
      </div>
    </section>
  )
}
