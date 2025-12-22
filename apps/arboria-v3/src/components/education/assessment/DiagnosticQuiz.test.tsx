import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { DiagnosticQuiz } from './DiagnosticQuiz';

// Mock Randomizer to ensure consistent tests
// In real app, we might use a seed, but for unit test, 
// we assume the component takes questions as props or has a mockable hook.
// For this test, we'll assume it accepts a `questions` prop or fetches.
// Let's assume a strict prop interface for simplicity in this first iteration.

const MOCK_QUESTIONS = Array.from({ length: 10 }, (_, i) => ({
    id: `q${i}`,
    text: `Question ${i + 1}`,
    options: [
        { id: 'a', text: 'Correct Answer', isCorrect: true },
        { id: 'b', text: 'Wrong Answer', isCorrect: false },
    ],
}));

describe('DiagnosticQuiz', () => {
    it('renders successfully', () => {
        render(<DiagnosticQuiz questions={MOCK_QUESTIONS} onComplete={vi.fn()} />);
        expect(screen.getByText('Question 1')).toBeInTheDocument();
    });

    it('calculates score correctly and triggers onComplete with PASSED if score >= 90%', async () => {
        const onComplete = vi.fn();
        render(<DiagnosticQuiz questions={MOCK_QUESTIONS} onComplete={onComplete} />);

        // Answer 9/10 correctly (90%)
        for (let i = 0; i < 9; i++) {
            fireEvent.click(screen.getByText('Correct Answer'));
            fireEvent.click(screen.getByText('Next'));
        }
        // Answer last one wrong
        fireEvent.click(screen.getByText('Wrong Answer'));
        fireEvent.click(screen.getByText('Finish'));

        await waitFor(() => {
            expect(onComplete).toHaveBeenCalledWith({ score: 90, passed: true });
        });
    });

    it('triggers onComplete with FAILED if score < 90%', async () => {
        const onComplete = vi.fn();
        render(<DiagnosticQuiz questions={MOCK_QUESTIONS} onComplete={onComplete} />);

        // Answer 8/10 correctly (80%)
        for (let i = 0; i < 8; i++) {
            fireEvent.click(screen.getByText('Correct Answer')); // Assuming text stays same for mock
            fireEvent.click(screen.getByText('Next'));
        }
        // Answer last 2 wrong
        fireEvent.click(screen.getByText('Wrong Answer'));
        fireEvent.click(screen.getByText('Next'));
        fireEvent.click(screen.getByText('Wrong Answer'));
        fireEvent.click(screen.getByText('Finish'));

        await waitFor(() => {
            expect(onComplete).toHaveBeenCalledWith({ score: 80, passed: false });
        });
    });
});
