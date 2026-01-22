import * as React from "react"
import { cn } from "../../lib/utils"

export type SurfaceVariant = "card" | "glass-subtle" | "glass-default" | "glass-heavy" | "flat"
export type SurfaceElevation = "none" | "sm" | "md" | "lg"

export interface SurfaceProps extends React.HTMLAttributes<HTMLElement> {
  variant?: SurfaceVariant
  elevation?: SurfaceElevation
  interactive?: boolean
  as?: React.ElementType
}

const variantClasses: Record<SurfaceVariant, string> = {
  card: "bg-card text-card-foreground",
  "glass-subtle": "glass-subtle",
  "glass-default": "glass-default",
  "glass-heavy": "glass-heavy",
  flat: "bg-transparent border-none shadow-none",
}

const elevationClasses: Record<SurfaceElevation, string> = {
  none: "shadow-none",
  sm: "shadow-sm",
  md: "shadow-md",
  lg: "shadow-lg",
}

const Surface = React.forwardRef<HTMLElement, SurfaceProps>(
  (
    {
      className,
      variant = "card",
      elevation = "sm",
      interactive = false,
      as: Component = "div",
      ...props
    },
    ref
  ) => {
    return (
      <Component
        ref={ref}
        className={cn(
          "rounded-lg border transition-all",
          variantClasses[variant],
          variant !== "flat" && elevationClasses[elevation],
          interactive && "interactive-hover",
          className
        )}
        {...props}
      />
    )
  }
)
Surface.displayName = "Surface"

export { Surface }
