import * as React from "react"
import { cva } from "class-variance-authority"
import { cn } from "../../utils/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-slate-900 text-slate-50 hover:bg-slate-900/80",
        secondary:
          "border-transparent bg-slate-100 text-slate-900 hover:bg-slate-100/80",
        destructive:
          "border-transparent bg-red-500 text-slate-50 hover:bg-red-500/80",
        outline: "text-slate-950",
        success:
          "border-transparent bg-emerald-100 text-emerald-700 hover:bg-emerald-100/80 dark:bg-emerald-500/15 dark:text-emerald-400",
        warning:
          "border-transparent bg-amber-100 text-amber-700 hover:bg-amber-100/80 dark:bg-amber-500/15 dark:text-amber-400",
        danger:
          "border-transparent bg-red-100 text-red-700 hover:bg-red-100/80 dark:bg-red-500/15 dark:text-red-400",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({ className, variant, ...props }) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
