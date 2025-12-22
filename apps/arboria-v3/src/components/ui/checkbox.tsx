import * as React from 'react';

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
    onCheckedChange?: (checked: boolean) => void;
}

export function Checkbox({ onCheckedChange, ...props }: CheckboxProps) {
    return (
        <input
            type="checkbox"
            onChange={(e) => onCheckedChange?.(e.target.checked)}
            className={`h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 ${props.className || ''}`}
            {...props}
        />
    );
}
