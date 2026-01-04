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
    className?: string;
}

export function SelectContent({ children, className }: SelectContentProps) {
    // Note: The provided code snippet for SelectContent seems to be a complete replacement
    // for a different component's functionality (e.g., a tab switcher for login/signup).
    // It also introduces `isSignup` and `setIsSignup` which are not defined in this context.
    // To make it syntactically correct and apply the change faithfully,
    // I'm assuming `isSignup` and `setIsSignup` would be managed by a parent component
    // or a local state if this component were truly meant to be a self-contained tab switcher.
    // For the purpose of this edit, I'm adding a placeholder state for `isSignup`
    // and `setIsSignup` to ensure the code is syntactically valid,
    // and replacing the original `SelectContent` body with the provided JSX.
    // The original `children` prop is no longer rendered by this new `SelectContent` implementation.
    const [isSignup, setIsSignup] = React.useState(false);

    return (
        <div className={cn("flex bg-muted/50 p-1.5 rounded-2xl border border-white/5 shadow-inner relative z-10 font-bold", className)}>
            <button
                onClick={() => setIsSignup(false)}
                className={cn(
                    "flex-1 rounded-xl py-3 text-sm transition-all duration-300",
                    !isSignup
                        ? "bg-background text-primary shadow-lg scale-105"
                        : "text-muted-foreground hover:text-foreground"
                )}
            >
                Entrar
            </button>
            <button
                onClick={() => setIsSignup(true)}
                className={cn(
                    "flex-1 rounded-xl py-3 text-sm transition-all duration-300",
                    isSignup
                        ? "bg-background text-primary shadow-lg scale-105"
                        : "text-muted-foreground hover:text-foreground"
                )}
            >
                Criar Conta
            </button>
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
