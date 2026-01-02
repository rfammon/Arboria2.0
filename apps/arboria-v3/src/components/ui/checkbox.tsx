import * as React from 'react';

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
    onCheckedChange?: (checked: boolean) => void;
}

export function Checkbox({ onCheckedChange, ...props }: CheckboxProps) {
    return (
        <input
            type="checkbox"
            onChange={(e) => onCheckedChange?.(e.target.checked)}
            className={`h-[calc(var(--touch-target,40px)/2.5)] w-[calc(var(--touch-target,40px)/2.5)] min-h-[16px] min-w-[16px] rounded border-gray-300 text-blue-600 focus:ring-blue-500 transition-all ${props.className || ''}`}
            {...props}
        />
    );
}
