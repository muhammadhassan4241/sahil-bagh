import * as React from 'react'
import { cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium border',
  {
    variants: {
      variant: {
        default: 'bg-teal-100 text-teal-800 border-teal-200/50',
        amber: 'bg-amber-100 text-ink-900 border-amber-300/60',
        coral: 'bg-coral-500/10 text-coral-600 border-coral-500/20',
        outline: 'bg-transparent text-ink-700 border-border',
      },
    },
    defaultVariants: { variant: 'default' },
  }
)

function Badge({ className, variant, ...props }) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
