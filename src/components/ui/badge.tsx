import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "bg-[--color-brand-blue] text-[--color-brand-white] hover:bg-[--color-brand-blue]/90",
        secondary: "bg-[--color-brand-red]/10 text-[--color-brand-red] border border-[--color-brand-red]/30",
        outline: "text-[--color-brand-blue] border border-[--color-brand-blue]",
        success: "bg-green-600 text-white",
        warning: "bg-yellow-500 text-white",
        destructive: "bg-[--color-brand-red] text-white"
      }
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
