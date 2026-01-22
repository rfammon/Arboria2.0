import * as React from "react"
import { LucideIcon } from "lucide-react"
import { cn } from "../../lib/utils"

export interface EmptyStateProps {
  icon: LucideIcon | React.ElementType
  title: string
  description: string
  action?: React.ReactNode
  className?: string
}

const EmptyState = ({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) => {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center py-12 px-4",
        className
      )}
    >
      <div className="bg-muted/20 p-4 rounded-full mb-4 ring-1 ring-border">
        <Icon className="h-10 w-10 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground max-w-sm mx-auto text-sm">
        {description}
      </p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  )
}

export { EmptyState }
