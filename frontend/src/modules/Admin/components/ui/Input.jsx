import React from "react"
import { cn } from "../../utils/utils"

const Input = React.forwardRef(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        "flex h-10 w-full rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-input-bg)] px-4 py-2 text-sm font-medium text-[var(--admin-text-main)] ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-[var(--admin-text-subtle)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/30 focus-visible:border-red-500/20 disabled:cursor-not-allowed disabled:opacity-50 transition-all",
        className
      )}
      ref={ref}
      {...props}
    />
  )
})
Input.displayName = "Input"

export { Input }
