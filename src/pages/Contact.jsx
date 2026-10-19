import { useState } from 'react'
import { Mail, MapPin, Phone, Send, CheckCircle2, MessageCircle, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

const CONTACT_EMAIL = 'muhammadateeqraza123@gmail.com'
const CONTACT_PHONE = '+92 3701650540'
const CONTACT_WHATSAPP = '923701650540'

export default function Contact() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [sent, setSent] = useState(false)

  const mailtoSubject = subject.trim()
    ? `[Sahil & Bagh] ${subject.trim()}`
    : `[Sahil & Bagh] Contact Inquiry from ${fullName.trim() || 'Visitor'}`

  const mailtoBody = `Name: ${fullName.trim()}
Email: ${email.trim()}

Message:
${message.trim()}`

  const mailtoUrl = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(mailtoSubject)}&body=${encodeURIComponent(mailtoBody)}`
  const whatsappUrl = `https://wa.me/${CONTACT_WHATSAPP}?text=${encodeURIComponent(
    `Hello Sahil & Bagh team,\n\nName: ${fullName.trim()}\nEmail: ${email.trim()}\n\n${message.trim()}`
  )}`

  function handleSubmit(e) {
    e.preventDefault()
    // Open default email client with pre-filled recipient, subject, and message
    window.location.href = mailtoUrl
    setSent(true)
  }

  function handleReset() {
    setFullName('')
    setEmail('')
    setSubject('')
    setMessage('')
    setSent(false)
  }

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

          <a
            href={`tel:${CONTACT_PHONE.replace(/\s+/g, '')}`}
            className="group rounded-2xl border border-border bg-card p-6 shadow-sm transition hover:border-teal-500 hover:shadow-md"
          >
            <Phone className="mb-2.5 h-5 w-5 text-teal-600 group-hover:text-teal-700" />
            <h3 className="font-display text-base font-medium text-ink-900">Phone</h3>
            <p className="text-sm text-ink-700 group-hover:text-teal-700">{CONTACT_PHONE}</p>
          </a>

          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="group rounded-2xl border border-border bg-card p-6 shadow-sm transition hover:border-teal-500 hover:shadow-md"
          >
            <Mail className="mb-2.5 h-5 w-5 text-teal-600 group-hover:text-teal-700" />
            <h3 className="font-display text-base font-medium text-ink-900">Email</h3>
            <p className="text-sm text-ink-700 group-hover:text-teal-700">{CONTACT_EMAIL}</p>
          </a>

          <a
            href={`https://wa.me/${CONTACT_WHATSAPP}`}
            target="_blank"
            rel="noopener noreferrer"
            className="group rounded-2xl border border-emerald-200 bg-emerald-50/50 p-6 shadow-sm transition hover:border-emerald-500 hover:shadow-md"
          >
            <MessageCircle className="mb-2.5 h-5 w-5 text-emerald-600 group-hover:text-emerald-700" />
            <h3 className="font-display text-base font-medium text-ink-900">WhatsApp</h3>
            <p className="text-sm text-emerald-800 font-medium">Chat directly with our support</p>
          </a>
        </div>

        {sent ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-teal-200 bg-teal-50/60 p-8 text-center shadow-sm">
            <CheckCircle2 className="h-12 w-12 text-teal-700" />
            <h2 className="mt-4 font-display text-2xl font-semibold text-teal-900">
              Opening Email Client...
            </h2>
            <p className="mt-2 max-w-md text-sm text-teal-800/90 leading-relaxed">
              Your message has been formatted and directed to <strong className="font-semibold text-teal-950">{CONTACT_EMAIL}</strong>.
              If your email application did not open automatically, click the button below:
            </p>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <a
                href={mailtoUrl}
                className="inline-flex items-center gap-2 rounded-xl bg-teal-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-800"
              >
                <Mail className="h-4 w-4" />
                Send via Email App
              </a>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-[#25D366] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:brightness-95"
              >
                <MessageCircle className="h-4 w-4" />
                Send via WhatsApp
              </a>
            </div>

            <button
              type="button"
              onClick={handleReset}
              className="mt-6 inline-flex items-center gap-1.5 text-xs font-medium text-ink-600 hover:text-ink-900"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Write another message
            </button>
          </div>
        ) : (
          <form
            className="rounded-2xl border border-border bg-card p-7 shadow-sm"
            onSubmit={handleSubmit}
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="mb-4 grid gap-1.5 text-xs font-semibold text-ink-700">
                Full Name
                <Input
                  required
                  placeholder="Your full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </label>

              <label className="mb-4 grid gap-1.5 text-xs font-semibold text-ink-700">
                Email
                <Input
                  required
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </label>
            </div>

            <label className="mb-4 grid gap-1.5 text-xs font-semibold text-ink-700">
              Subject (Optional)
              <Input
                placeholder="e.g. Booking inquiry, partnership, question"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </label>

            <label className="mb-4 grid gap-1.5 text-xs font-semibold text-ink-700">
              Message
              <Textarea
                required
                rows={6}
                placeholder="How can we help you?"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </label>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <Button type="submit" className="w-full sm:w-auto gap-2">
                <Send className="h-4 w-4" />
                Send Message
              </Button>
              <p className="text-xs text-ink-500">
                Directly sends to {CONTACT_EMAIL}
              </p>
            </div>
          </form>
        )}
      </div>
    </section>
  )
}
