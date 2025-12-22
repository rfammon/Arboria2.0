import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

expect.extend(matchers as any);
import { ScenarioEngine } from './ScenarioEngine';
import type { Scenario } from './ScenarioEngine';

const MOCK_SCENARIOS: Scenario[] = [
    {
        id: '1',
        title: 'Scenario 1',
        description: 'Situation 1',
        options: [
            { id: 'opt1', text: 'Correct Option', isCorrect: true, isCritical: false },
            { id: 'opt2', text: 'Wrong Option', isCorrect: false, isCritical: false },
            { id: 'opt3', text: 'Critical Fail Option', isCorrect: false, isCritical: true }
        ]
    },
    {
        id: '2',
        title: 'Scenario 2',
        description: 'Situation 2',
        options: [
            { id: 'opt4', text: 'Correct Option', isCorrect: true, isCritical: false },
            { id: 'opt5', text: 'Wrong Option', isCorrect: false, isCritical: false }
        ]
    }
];

describe('ScenarioEngine', () => {
    it('should render the first scenario', () => {
        render(<ScenarioEngine scenarios={MOCK_SCENARIOS} onComplete={vi.fn()} />);
        expect(screen.getByText('Situation 1')).toBeTruthy();
        expect(screen.getByText('Correct Option')).toBeTruthy();
    });

    it('should advance to next scenario on correct selection', () => {
        render(<ScenarioEngine scenarios={MOCK_SCENARIOS} onComplete={vi.fn()} />);

        fireEvent.click(screen.getByText('Correct Option'));
        // Assume feedback is shown, then "Next" button
        fireEvent.click(screen.getByText('Continuar'));

        expect(screen.getByText('Situation 2')).toBeTruthy();
    });

    it('should trigger onComplete with success if all passed', () => {
        const onComplete = vi.fn();
        render(<ScenarioEngine scenarios={MOCK_SCENARIOS} onComplete={onComplete} />);

        // Scenario 1: Correct
        fireEvent.click(screen.getByText('Correct Option'));
        fireEvent.click(screen.getByText('Continuar'));

        // Scenario 2: Correct
        fireEvent.click(screen.getByText('Correct Option'));
        fireEvent.click(screen.getByText('Finalizar'));

        expect(onComplete).toHaveBeenCalledWith(true);
    });

    it('should trigger onComplete with failure if critical error is made', () => {
        const onComplete = vi.fn();
        render(<ScenarioEngine scenarios={MOCK_SCENARIOS} onComplete={onComplete} />);

        // Scenario 1: Critical Fail
        fireEvent.click(screen.getByText('Critical Fail Option'));

        // Immediate failure feedback expected
        fireEvent.click(screen.getByText('Ver Resultado'));

        expect(onComplete).toHaveBeenCalledWith(false);
    });
});
