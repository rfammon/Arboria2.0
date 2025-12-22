import * as React from 'react';

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
            {children}
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
}

export function SelectContent({ children }: SelectContentProps) {
    return (
        <div className="relative z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md">
            <div className="p-1">{children}</div>
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
