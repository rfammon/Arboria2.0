import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './button';
import { describe, it, expect, vi } from 'vitest';

describe('Specialized Scrutiny: Button Primitive', () => {
    it('should render with correct variant classes (Tailwind)', () => {
        const { rerender } = render(<Button variant="destructive">Delete</Button>);
        expect(screen.getByRole('button')).toHaveClass('bg-destructive');

        rerender(<Button variant="outline">Outline</Button>);
        expect(screen.getByRole('button')).toHaveClass('border-input');
    });

    it('should meet WCAG touch target standards (Adversarial UX)', () => {
        render(<Button>Click Me</Button>);
        const button = screen.getByRole('button');

        // We verify the CSS variable height implementation
        expect(button).toHaveClass('h-[var(--touch-target,40px)]');
    });

    it('should be disabled and non-reactive in loading state', () => {
        const handleClick = vi.fn();
        render(<Button disabled onClick={handleClick}>Submit</Button>);

        const button = screen.getByRole('button');
        expect(button).toBeDisabled();

        fireEvent.click(button);
        expect(handleClick).not.toHaveBeenCalled();
    });

    it('should have proper ARIA labels for accessibility', () => {
        render(<Button aria-label="Confirm Action">Confirm</Button>);
        expect(screen.getByLabelText('Confirm Action')).toBeInTheDocument();
    });
});
