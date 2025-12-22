import { cn } from "@/lib/utils"
import React from "react"

interface PageContainerProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode
}

/**
 * PageContainer
 * Implements "Dual Density" layout:
 * - Mobile: 'field' spacing (24px) for touch friendliness
 * - Desktop: 'office' spacing (16px) for information density
 * - Max-width constraint for readability
 */
export function PageContainer({ children, className, ...props }: PageContainerProps) {
    return (
        <div
            className={cn(
                "w-full min-h-screen bg-background transition-colors duration-200",
                "p-field md:p-office", // The core of Dual Density
                className
            )}
            {...props}
        >
            <div className="mx-auto max-w-7xl space-y-field md:space-y-office">
                {children}
            </div>
        </div>
    )
}
