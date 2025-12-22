import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';
import { MicroLearningCard } from './MicroLearningCard';

expect.extend(matchers as any);

describe('MicroLearningCard', () => {
    it('should render image and text content', () => {
        render(
            <MicroLearningCard
                title="Learning Unit 1"
                description="This is a short description."
                mediaType="image"
                mediaSrc="test.jpg"
                onComplete={vi.fn()}
            />
        );

        expect(screen.getByText('Learning Unit 1')).toBeTruthy();
        expect(screen.getByText('This is a short description.')).toBeTruthy();
        expect(screen.getByRole('img')).toBeTruthy();
    });

    it('should disable next button initially for video content', () => {
        render(
            <MicroLearningCard
                title="Video Unit"
                description="Watch this."
                mediaType="video"
                mediaSrc="test.mp4"
                onComplete={vi.fn()}
            />
        );

        const btn = screen.getByText('Aguarde...');
        expect(btn).toBeTruthy();
        expect(btn).toHaveAttribute('disabled');
    });

    it('should enable next button after timer (simulated)', () => {
        vi.useFakeTimers();
        render(
            <MicroLearningCard
                title="Video Unit"
                description="Watch this."
                mediaType="video"
                mediaSrc="test.mp4"
                onComplete={vi.fn()}
            />
        );

        act(() => {
            vi.advanceTimersByTime(5100); // Wait 5s+
        });

        const btn = screen.getByText('Continuar');
        expect(btn).toBeTruthy();
        expect(btn).not.toHaveAttribute('disabled');
        vi.useRealTimers();
    });

    it('should call onComplete when next is clicked', () => {
        const onComplete = vi.fn();
        render(
            <MicroLearningCard
                title="Image Unit"
                description="Look at this."
                mediaType="image"
                mediaSrc="test.jpg"
                onComplete={onComplete}
            />
        );

        const btn = screen.getByText('Continuar');
        fireEvent.click(btn);
        expect(onComplete).toHaveBeenCalled();
    });
});
