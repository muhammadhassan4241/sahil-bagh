import { MessageCircle } from 'lucide-react'

export function WhatsAppButton({ phone, message, label = 'Inquire via WhatsApp', className = '' }) {
  const cleanPhone = (phone || '').replace(/[^\d+]/g, '')
  const url = `https://wa.me/${cleanPhone.replace('+', '')}?text=${encodeURIComponent(message || 'Hello, I would like to inquire about this property.')}`

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-2 rounded-full bg-[#25D366] px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:brightness-95 hover:-translate-y-0.5 ${className}`}
    >
      <MessageCircle className="h-4 w-4" />
      {label}
    </a>
  )
}
