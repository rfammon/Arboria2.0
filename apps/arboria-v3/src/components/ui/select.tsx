import * as React from 'react';
import { cn } from '../../lib/utils';

interface SelectContextValue {
    value?: string;
    onValueChange?: (value: string) => void;
    displayValue?: string;
}

const SelectContext = React.createContext<SelectContextValue>({});

interface SelectProps {
    value?: string;
    onValueChange?: (value: string) => void;
    displayValue?: string;
    children: React.ReactNode;
}

export function Select({ value, onValueChange, displayValue, children }: SelectProps) {
    return (
        <SelectContext.Provider value={{ value, onValueChange, displayValue }}>
            <div className="relative w-full sm:w-auto">
                {children}
            </div>
        </SelectContext.Provider>
    );
}

interface SelectTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;
}

export function SelectTrigger({ children, ...props }: SelectTriggerProps) {
    return (
        <button
            type="button"
            className={`flex h-[var(--touch-target,40px)] w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-[var(--font-size-md,14px)] ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${props.className || ''}`}
            {...props}
        >
            {children}
        </button>
    );
}

interface SelectValueProps {
    placeholder?: string;
}

export function SelectValue({ placeholder }: SelectValueProps) {
    const context = React.useContext(SelectContext);
    return <span>{context.displayValue || context.value || placeholder}</span>;
}

interface SelectContentProps {
    children: React.ReactNode;
    className?: string;
}

export function SelectContent({ children, className }: SelectContentProps) {
    return (
        <div className={cn(
            "absolute top-full right-0 z-50 mt-1 min-w-[200px] overflow-hidden rounded-xl border bg-popover/90 p-1 text-popover-foreground shadow-2xl animate-in fade-in zoom-in-95 backdrop-blur-xl",
            className
        )}>
            <div className="flex flex-col gap-0.5">
                {children}
            </div>
        </div>
    );
}

interface SelectItemProps {
    value: string;
    children: React.ReactNode;
    disabled?: boolean;
}

export function SelectItem({ value, children, disabled }: SelectItemProps) {
    const context = React.useContext(SelectContext);

    return (
        <div
            onClick={(e) => {
                if (disabled) {
                    e.preventDefault();
                    return;
                }
                context.onValueChange?.(value);
            }}
            className={`relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 px-2 text-sm outline-none 
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-accent hover:text-accent-foreground'}
                ${!disabled && context.value === value ? 'bg-accent' : ''}`}
        >
            {children}
        </div>
    );
}
