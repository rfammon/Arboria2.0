import * as React from 'react';

interface RadioGroupContextValue {
    value?: string;
    onValueChange?: (value: string) => void;
}

const RadioGroupContext = React.createContext<RadioGroupContextValue>({});

interface RadioGroupProps extends React.HTMLAttributes<HTMLDivElement> {
    value?: string;
    onValueChange?: (value: string) => void;
    children: React.ReactNode;
}

export function RadioGroup({ value, onValueChange, children, ...props }: RadioGroupProps) {
    return (
        <RadioGroupContext.Provider value={{ value, onValueChange }}>
            <div role="radiogroup" {...props}>
                {children}
            </div>
        </RadioGroupContext.Provider>
    );
}

interface RadioGroupItemProps extends React.InputHTMLAttributes<HTMLInputElement> {
    value: string;
}

export function RadioGroupItem({ value, ...props }: RadioGroupItemProps) {
    const context = React.useContext(RadioGroupContext);

    return (
        <input
            type="radio"
            value={value}
            checked={context.value === value}
            onChange={(e) => context.onValueChange?.(e.target.value)}
            className={`h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500 ${props.className || ''}`}
            {...props}
        />
    );
}
