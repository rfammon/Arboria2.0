import { Button, type ButtonProps } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import React from "react"

interface FieldActionProps extends ButtonProps {
    isPrimary?: boolean
}

/**
 * FieldAction
 * Semantic wrapper for actions that need to adapt to density contexts.
 * - Enforces minimum touch targets on mobile (h-field)
 * - Uses compact sizing on desktop (h-office/default)
 */
export const FieldAction = React.forwardRef<HTMLButtonElement, FieldActionProps>(
    ({ className, isPrimary, variant, ...props }, ref) => {
        return (
            <Button
                ref={ref}
                variant={variant || (isPrimary ? "default" : "outline")}
                className={cn(
                    // Dual Density Sizing
                    "h-field md:h-10", // Mobile: 24px+padding -> actually we want explicit height or min-height. 
                    // Let's use the token. 'field' spacing is 1.5rem (24px). Standard button is 40px (h-10).
                    // Mobile needs to be touch friendly. Let's say h-12 (48px) for field? 
                    // Or strictly use our tokens: h-field might be too small if it's just 24px. 
                    // Wait, tailwind config said field = 1.5rem (24px). That's small for a button height.
                    // Standard touch target is 44px+. 
                    // Let's assume we want 'min-h-[44px]' on mobile.
                    // Integrating with the design system tokens:
                    // Maybe we interpret 'field' as "Generous/Touch" and 'office' as "Compact".

                    "min-h-[2.75rem] md:min-h-[2.5rem]", // 44px vs 40px
                    "text-field md:text-sm", // 18px vs 14px/16px

                    isPrimary && "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm",
                    className
                )}
                {...props}
            />
        )
    }
)
FieldAction.displayName = "FieldAction"
